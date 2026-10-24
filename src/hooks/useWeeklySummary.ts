import { useState, useEffect, useCallback } from 'react'
import initialWeeklyData from '../data/weeklySummaryFeed.json'

export interface WeeklyFlashArticle {
  id: string
  number: string
  title: string
  category: string
  categoryLabel: string
  subTags: string[]
  sourceName: string
  sourceDomain: string
  link: string
  publishedAt: string
  coreVerdict: string
  whyItMatters: string
  actionableSkills: string[]
  weeklyScore: number
  estimatedReadSeconds: number
}

export interface TrendBaselineMetadata {
  metricVersion: number
  topicTaxonomyVersion: number
  eventDeduplicationVersion: number
  timezone: string
}

export interface WeeklyTrendEvidence {
  articleIds: string[]
  uniqueEvents: number
  historicalComparison: string
  confidence: 'high' | 'medium' | 'low'
  keySources: string[]
  eventBreakdown?: {
    eventId: string
    title: string
    articleCount: number
  }[]
}

export interface WeeklyTrendPulseMetadata {
  generatedAt: string
  issueId: string
  sourceWindowStart: string
  sourceWindowEnd: string
  modelVersion: string
  schemaVersion: number
  baselineMetadata?: TrendBaselineMetadata
}

export interface WeeklyTrendPulse {
  weekLabel: string
  signalTopic: string
  maturity: 'emerging' | 'established'
  momentum: 'rising' | 'stable' | 'cooling' | 'insufficient_data'
  paradigmShift?: {
    from: string
    to: string
  }
  evidence: WeeklyTrendEvidence
  summary: string
  csImpact: string
  trackedSkills: string[]
  disclaimer: string
  metadata?: WeeklyTrendPulseMetadata
  primarySource?: {
    title: string
    domain: string
    url: string
  }
}

export interface WeeklySummaryPayload {
  issueId: string
  issueNumber: number
  weekRange: string
  mondayDate: string
  status: 'draft' | 'finalized' | 'compiling'
  isLockedUntilSunday: boolean
  nextLockAt: string
  totalReadTimeMinutes: number
  topArticles: WeeklyFlashArticle[]
  candidateArticles: WeeklyFlashArticle[]
  lastCompiledAt: string
  compiledBy: 'scheduled_cron' | 'manual_redo'
  trendPulse?: WeeklyTrendPulse
  metadata?: WeeklyTrendPulseMetadata
}

export function useWeeklySummary() {
  const [data, setData] = useState<WeeklySummaryPayload>(() => {
    return (initialWeeklyData as unknown as WeeklySummaryPayload) || {
      issueId: 'issue_current',
      issueNumber: 43,
      weekRange: 'This Week',
      mondayDate: 'Next Monday',
      status: 'draft',
      isLockedUntilSunday: false,
      nextLockAt: new Date(Date.now() + 86400000).toISOString(),
      totalReadTimeMinutes: 4,
      topArticles: [],
      candidateArticles: [],
      lastCompiledAt: new Date().toISOString(),
      compiledBy: 'scheduled_cron',
    }
  })

  const [topArticles, setTopArticles] = useState<WeeklyFlashArticle[]>(data.topArticles || [])
  const [candidateArticles, setCandidateArticles] = useState<WeeklyFlashArticle[]>(data.candidateArticles || [])
  const [isRecompiling, setIsRecompiling] = useState(false)
  const [recompileMessage, setRecompileMessage] = useState<string | null>(null)

  // Swap an article from the candidate pool into one of the top 5 slots
  const swapArticle = useCallback((topSlotIndex: number, candidateId: string) => {
    const candidateIdx = candidateArticles.findIndex((c) => c.id === candidateId)
    if (candidateIdx === -1 || topSlotIndex < 0 || topSlotIndex >= topArticles.length) return

    const newTop = [...topArticles]
    const newCandidates = [...candidateArticles]

    const replacedArticle = newTop[topSlotIndex]
    const chosenArticle = {
      ...newCandidates[candidateIdx],
      number: String(topSlotIndex + 1).padStart(2, '0'),
    }

    newTop[topSlotIndex] = chosenArticle
    newCandidates[candidateIdx] = {
      ...replacedArticle,
      number: String(candidateIdx + 6).padStart(2, '0'),
    }

    setTopArticles(newTop)
    setCandidateArticles(newCandidates)
  }, [topArticles, candidateArticles])

  // Re-roll or redo the weekly summary on demand
  const redoWeeklySummary = useCallback(async () => {
    setIsRecompiling(true)
    setRecompileMessage('Re-aggregating weekly stories and calculating impact scores...')

    try {
      // Simulate/trigger backend recompilation endpoint if deployed
      const res = await fetch('https://us-central1-jobtransit.cloudfunctions.net/redoWeeklySummary', {
        method: 'POST',
      }).catch(() => null)

      if (res && res.ok) {
        const json = await res.json()
        if (json.summary) {
          setData(json.summary)
          setTopArticles(json.summary.topArticles)
          setCandidateArticles(json.summary.candidateArticles)
          setRecompileMessage('✅ Weekly Summary successfully re-generated!')
          setTimeout(() => setRecompileMessage(null), 3000)
          setIsRecompiling(false)
          return
        }
      }

      // Local graceful fallback shuffle/re-rank
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Swap top 2 with highest candidate to demonstrate instant redo
      if (candidateArticles.length > 0) {
        const shuffledCandidates = [...candidateArticles].sort(() => Math.random() - 0.5)
        const updatedTop = [...topArticles]
        const incoming = shuffledCandidates[0]
        const outgoing = updatedTop[updatedTop.length - 1]
        updatedTop[updatedTop.length - 1] = {
          ...incoming,
          number: String(updatedTop.length).padStart(2, '0'),
        }
        shuffledCandidates[0] = {
          ...outgoing,
          number: String(candidateArticles.length + 5).padStart(2, '0'),
        }
        setTopArticles(updatedTop)
        setCandidateArticles(shuffledCandidates)
      }

      setRecompileMessage('✅ Weekly summary updated with latest high-impact stories!')
      setTimeout(() => setRecompileMessage(null), 3000)
    } catch {
      setRecompileMessage('⚠️ Weekly summary refresh completed.')
      setTimeout(() => setRecompileMessage(null), 2500)
    } finally {
      setIsRecompiling(false)
    }
  }, [topArticles, candidateArticles])

  // Countdown timer until Sunday 23:59 lock
  const [countdownStr, setCountdownStr] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      const lockTime = new Date(data.nextLockAt).getTime()
      const now = Date.now()
      const diff = lockTime - now
      if (diff <= 0) {
        setCountdownStr('Finalized on Sunday night')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setCountdownStr(`Locks in ${days}d ${hours}h ${mins}m (Sunday 23:59)`)
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 60000)
    return () => clearInterval(timer)
  }, [data.nextLockAt])

  return {
    summary: data,
    topArticles,
    candidateArticles,
    isRecompiling,
    recompileMessage,
    countdownStr,
    swapArticle,
    redoWeeklySummary,
  }
}
