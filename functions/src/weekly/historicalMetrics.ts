import { WeeklyFlashArticle, TrendBaseline, HistoricalDirection, DataCompleteness, TrendBaselineMetadata } from './types'

export interface HistoricalMultiWindowSummary {
  baselines: TrendBaseline[]
  sourceWindowStart: string
  sourceWindowEnd: string
  weeksAnalyzed: number
  baselineMetadata: TrendBaselineMetadata
}

// Canonical topic keywords to cluster news articles into verifiable technology themes (Taxonomy v2)
const TOPIC_CLUSTERS: Record<string, RegExp> = {
  'AI Coding Agents & Autonomous Tooling': /agent|autonomous|copilot|coding agent|software engineering agent|multi-agent|tool use|eval/i,
  'Runtime Security & Vulnerability Defense': /vulnerability|rce|cve|exploit|zero-day|http2shell|security|sandbox/i,
  'Memory-Safe Systems & Rust Engineering': /rust|memory safe|consistent hashing|borrow checker|c\+\+|kernel/i,
  'Distributed Data Systems & Local-First SQLite': /distributed|sqlite|database|consensus|raft|sharding|replication|vector db/i,
  'Next-Gen Web Architecture & Edge Runtimes': /edge runtime|bun|deno|wasm|webassembly|framework|vite|next\.js/i,
}

const BASELINE_METADATA: TrendBaselineMetadata = {
  metricVersion: 2,
  topicTaxonomyVersion: 2,
  eventDeduplicationVersion: 2,
  timezone: 'UTC+08:00 (Asia/Kuala_Lumpur / SGT)',
}

/**
 * Calculates historical metrics across multiple time windows with true event-level deduplication:
 * - Current 7 days: identifies this week's active independent events
 * - Previous 7 days (W-1): detects week-over-week changes
 * - Previous 28 days (W-4 to W-1): establishes 4-week moving average
 * - Previous 8-12 weeks: identifies sustained growth vs transient spike
 */
export async function computeHistoricalMetrics(
  db: any,
  currentArticles: WeeklyFlashArticle[],
  currentWeekNumber: number,
  year: number
): Promise<HistoricalMultiWindowSummary> {
  const now = new Date()
  const windowEnd = now.toISOString()
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // 1. Cluster current week's articles by Topic -> Set of unique eventIds, domains, sources
  const currentClusterCounts: Record<
    string,
    {
      eventIds: Set<string>
      articleIds: string[]
      domains: Set<string>
      sources: Set<string>
    }
  > = {}

  for (const topic of Object.keys(TOPIC_CLUSTERS)) {
    currentClusterCounts[topic] = {
      eventIds: new Set(),
      articleIds: [],
      domains: new Set(),
      sources: new Set(),
    }
  }

  for (const art of currentArticles) {
    const text = `${art.title} ${art.coreVerdict} ${art.actionableSkills.join(' ')} ${art.subTags.join(' ')}`
    const canonicalEventId = art.eventId || art.id

    for (const [topic, regex] of Object.entries(TOPIC_CLUSTERS)) {
      if (regex.test(text)) {
        currentClusterCounts[topic].eventIds.add(canonicalEventId)
        currentClusterCounts[topic].articleIds.push(art.id)
        if (art.sourceDomain) currentClusterCounts[topic].domains.add(art.sourceDomain)
        if (art.sourceName) currentClusterCounts[topic].sources.add(art.sourceName)
      }
    }
  }

  // 2. Query historical weekly issues from Firestore (up to 12 previous weeks)
  const historicalIssues: any[] = []
  if (db) {
    try {
      const snap = await db
        .collection('weekly_summaries')
        .where('issueNumber', '<', currentWeekNumber)
        .orderBy('issueNumber', 'desc')
        .limit(12)
        .get()

      snap.forEach((doc: any) => historicalIssues.push(doc.data()))
    } catch (err: any) {
      console.warn('[HistoricalMetrics] Could not load 12-week history from Firestore, using baseline defaults:', err.message)
    }
  }

  const weeksObserved = historicalIssues.length
  const dataCompleteness: DataCompleteness =
    weeksObserved >= 8 ? 'complete' : weeksObserved >= 1 ? 'partial' : 'unobserved'

  // 3. Calculate baseline metrics per topic
  const baselines: TrendBaseline[] = Object.entries(TOPIC_CLUSTERS).map(([topic, regex]) => {
    const current = currentClusterCounts[topic]
    // Crucial: currentWeekCount is UNIQUE INDEPENDENT EVENTS, not raw article count
    const currentWeekCount = current.eventIds.size

    // Previous 1 week (W-1) unique event count
    let previousWeekCount = 0
    if (historicalIssues.length > 0) {
      const wMinus1 = historicalIssues[0]
      const articles = [...(wMinus1.topArticles || []), ...(wMinus1.candidateArticles || [])]
      const eventSet = new Set<string>()
      articles.forEach((a: any) => {
        if (regex.test(`${a.title} ${a.coreVerdict || ''} ${(a.actionableSkills || []).join(' ')}`)) {
          eventSet.add(a.eventId || a.id)
        }
      })
      previousWeekCount = eventSet.size
    }

    // Previous 4 weeks (W-1 to W-4)
    const fourWeekIssues = historicalIssues.slice(0, 4)
    let fourWeekTotal = 0
    fourWeekIssues.forEach((issue) => {
      const articles = [...(issue.topArticles || []), ...(issue.candidateArticles || [])]
      const eventSet = new Set<string>()
      articles.forEach((a: any) => {
        if (regex.test(`${a.title} ${a.coreVerdict || ''} ${(a.actionableSkills || []).join(' ')}`)) {
          eventSet.add(a.eventId || a.id)
        }
      })
      fourWeekTotal += eventSet.size
    })
    const fourWeekAverage = fourWeekIssues.length > 0
      ? Number((fourWeekTotal / fourWeekIssues.length).toFixed(1))
      : previousWeekCount

    // Previous 8-12 weeks trajectory comparison:
    // Recent 4 weeks vs Older 4-8 weeks
    let eightWeekDirection: HistoricalDirection = 'insufficient_data'
    if (weeksObserved >= 4) {
      const olderFourWeekIssues = historicalIssues.slice(4, 8)
      let olderFourWeekTotal = 0
      olderFourWeekIssues.forEach((issue) => {
        const articles = [...(issue.topArticles || []), ...(issue.candidateArticles || [])]
        const eventSet = new Set<string>()
        articles.forEach((a: any) => {
          if (regex.test(`${a.title} ${a.coreVerdict || ''} ${(a.actionableSkills || []).join(' ')}`)) {
            eventSet.add(a.eventId || a.id)
          }
        })
        olderFourWeekTotal += eventSet.size
      })
      const olderFourWeekAvg = olderFourWeekIssues.length > 0
        ? olderFourWeekTotal / olderFourWeekIssues.length
        : fourWeekAverage

      if (fourWeekAverage > olderFourWeekAvg * 1.25) {
        eightWeekDirection = 'rising'
      } else if (fourWeekAverage < olderFourWeekAvg * 0.75) {
        eightWeekDirection = 'declining'
      } else {
        eightWeekDirection = 'stable'
      }
    } else {
      // With less than 4 weeks observed, direction cannot be determined
      eightWeekDirection = 'insufficient_data'
    }

    // Source diversity score (0 to 1)
    const sourceDiversityScore = currentWeekCount > 0
      ? Number((current.domains.size / Math.max(currentWeekCount, 1)).toFixed(2))
      : 0

    // Quantitative Momentum Formula: M_t = 0.5 * G_t + 0.3 * C_t + 0.2 * D_t
    const growthRatio = fourWeekAverage > 0
      ? (currentWeekCount - fourWeekAverage) / fourWeekAverage
      : (currentWeekCount > 0 ? 1 : 0)
    const normalizedGrowth = Math.max(-1, Math.min(1, growthRatio))

    // C_t: cross-source coverage (HN, GitHub, blogs, etc.)
    const crossSourceFactor = Math.min(1, current.sources.size / 3)

    const momentumScore = Number(
      (0.5 * normalizedGrowth + 0.3 * crossSourceFactor + 0.2 * sourceDiversityScore).toFixed(2)
    )

    return {
      topic,
      currentWeekCount,
      previousWeekCount,
      fourWeekAverage,
      eightWeekDirection,
      weeksObserved,
      sourceDiversityScore,
      calculatedMomentumScore: momentumScore,
      dataCompleteness,
    }
  })

  // Sort by highest currentWeekCount (unique events), then momentum score
  baselines.sort((a, b) => b.currentWeekCount - a.currentWeekCount || b.calculatedMomentumScore - a.calculatedMomentumScore)

  return {
    baselines,
    sourceWindowStart: windowStart,
    sourceWindowEnd: windowEnd,
    weeksAnalyzed: weeksObserved,
    baselineMetadata: BASELINE_METADATA,
  }
}
