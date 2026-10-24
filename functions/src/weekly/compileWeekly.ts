import path from 'path'
import fs from 'fs'
import { getFirestore } from '../lib/firebaseAdmin'
import { acquireLease, releaseLease, verifyLease } from '../lib/lease'
import { FinalArticleDocument, ArticleCategory } from '../pipeline/types'
import { WeeklyFlashArticle, WeeklySummaryPayload, WeeklyTrendPulse, CompileMode } from './types'
import { generateWeeklyTrendPulse } from './trendPulseGenerator'

const CATEGORY_DISPLAY_NAMES: Record<ArticleCategory, string> = {
  'ai-ml': 'AI & Machine Learning',
  'software-engineering': 'Software Engineering',
  'data-cloud': 'Data & Cloud',
  'security': 'Cybersecurity',
  'career-industry': 'Industry & Careers',
  'general-tech': 'General Tech',
}

/**
 * Clean up verbose summary text into a punchy 1-sentence "快讯" core verdict
 */
function extractCoreVerdict(title: string, description: string, bodyExcerpt: string | null): string {
  let text = description || bodyExcerpt || ''
  
  // Clean raw HN metadata if present
  text = text
    .replace(/Article URL:\s*https?:\/\/[^\s]+/gi, '')
    .replace(/Comments URL:\s*https?:\/\/[^\s]+/gi, '')
    .replace(/Points:\s*\d+/gi, '')
    .replace(/#?\s*Comments:\s*\d+/gi, '')
    .replace(/^Trending engineering discussion on Hacker News(?:\s*\([^)]*\))?\s*analyzing:\s*/i, '')
    .replace(/^Read the full story at .*$/i, '')
    .trim()

  if (!text || text.length < 15 || text.toLowerCase() === title.toLowerCase()) {
    return `Major technical development analyzing ${title} and its architectural implications.`
  }

  // Grab the first 1-2 sentences, max 180 chars
  const sentences = text.split(/(?<=[.!?])\s+/)
  const first = sentences[0] || text
  if (first.length > 180) {
    return first.slice(0, 177).trim() + '...'
  }
  return first
}

/**
 * Calculate weekly dates and week number
 */
function getWeekContext(targetDate = new Date()): {
  weekNumber: number
  weekRange: string
  mondayDate: string
  sundayDate: string
  isSundayNightOrLater: boolean
  nextLockAt: string
} {
  const d = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()))
  const dayNum = d.getUTCDay() || 7 // 1 = Monday, 7 = Sunday
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)

  // Start of week (Monday)
  const monday = new Date(targetDate)
  monday.setDate(targetDate.getDate() - ((targetDate.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  // End of week (Sunday 23:59:59)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  // Next Monday
  const nextMonday = new Date(sunday)
  nextMonday.setDate(sunday.getDate() + 1)
  nextMonday.setHours(6, 0, 0, 0)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weekRange = `${monthNames[monday.getMonth()]} ${monday.getDate()} – ${monthNames[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`
  const mondayDate = `${monthNames[nextMonday.getMonth()]} ${nextMonday.getDate()}, ${nextMonday.getFullYear()}`

  // Check if today is Sunday late night (>= 22:00) or Monday
  const currentDay = targetDate.getDay()
  const isSundayNightOrLater = currentDay === 0 && targetDate.getHours() >= 22 || currentDay === 1

  return {
    weekNumber,
    weekRange,
    mondayDate,
    sundayDate: sunday.toISOString(),
    isSundayNightOrLater,
    nextLockAt: sunday.toISOString(),
  }
}

/**
 * Compile weekly summary from recent 7-day articles
 */
export async function compileWeeklySummary(
  compiledBy: 'scheduled_cron' | 'manual_redo' = 'scheduled_cron',
  mode: CompileMode = 'recompute'
): Promise<WeeklySummaryPayload> {
  const now = new Date()
  const weekCtx = getWeekContext(now)
  const issueId = `issue_${now.getFullYear()}_w${weekCtx.weekNumber}`
  const db = getFirestore()

  // 1. Idempotency Check: if in 'create' mode and already exists finalized, return existing
  if (mode === 'create' && db) {
    try {
      const snap = await db.collection('weekly_summaries').doc(issueId).get()
      if (snap.exists) {
        const existing = snap.data() as WeeklySummaryPayload
        if (existing.status === 'finalized') {
          console.log(`[Weekly] Issue ${issueId} already finalized. Returning existing record.`)
          return existing
        }
      }
    } catch (e: any) {
      console.warn('[Weekly] Idempotency check error:', e.message)
    }
  }

  // 2. Concurrency Lock: Prevent multiple concurrent LLM calls for the same issue
  let workerId: string | null = null
  let fencingToken = 0
  const leaseName = `weekly_compile_${issueId}`
  if (mode !== 'preview') {
    const lease = await acquireLease(leaseName, 10 * 60 * 1000)
    if (!lease.acquired) {
      console.warn(`[Weekly] Concurrent compilation in progress for ${issueId}.`)
      if (db) {
        const snap = await db.collection('weekly_summaries').doc(issueId).get()
        if (snap.exists) return snap.data() as WeeklySummaryPayload
      }
      return {
        issueId,
        issueNumber: weekCtx.weekNumber,
        weekRange: weekCtx.weekRange,
        mondayDate: weekCtx.mondayDate,
        status: 'compiling',
        isLockedUntilSunday: false,
        nextLockAt: weekCtx.nextLockAt,
        totalReadTimeMinutes: 4,
        topArticles: [],
        candidateArticles: [],
        lastCompiledAt: now.toISOString(),
        compiledBy,
      }
    }
    workerId = lease.workerId
    fencingToken = lease.fencingToken
  }

  try {
    // 3. Gather articles from the last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    let pool: FinalArticleDocument[] = []
  if (db) {
    try {
      const snap = await db
        .collection('daily_articles')
        .where('publishedAt', '>=', sevenDaysAgo)
        .limit(120)
        .get()

      snap.forEach((doc) => {
        pool.push(doc.data() as FinalArticleDocument)
      })
    } catch (err) {
      console.warn('[Weekly] Could not query Firestore daily_articles, falling back to local snapshot:', err)
    }
  }

  // Fallback to local dailyNewsFeed.json if Firestore pool is sparse
  if (pool.length < 5) {
    const frontendDataDir = path.resolve(__dirname, '../../../src/data')
    const localDailyFeedPath = path.join(frontendDataDir, 'dailyNewsFeed.json')
    if (fs.existsSync(localDailyFeedPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(localDailyFeedPath, 'utf8'))
        if (Array.isArray(raw.articles)) {
          pool = raw.articles
        }
      } catch (e) {
        console.warn('[Weekly] Error reading local dailyNewsFeed:', e)
      }
    }
  }

  // 2. Score articles by Weekly Impact Weight
  // Weekly impact balances Technical Significance (40%), Multi-source Cross Coverage (35%), and Engagement/Recency (25%)
  const scored = pool.map((art) => {
    const sig = art.scores?.significance ?? 0.5
    const crossCov = art.scores?.crossCoverage ?? (art.relatedSources?.length ? Math.min(art.relatedSources.length / 3, 1) : 0)
    const eng = art.scores?.engagement ?? 0.35
    const rec = art.scores?.recency ?? 0.5

    const weeklyScore = Number((0.40 * sig + 0.35 * crossCov + 0.15 * eng + 0.10 * rec).toFixed(4))
    return {
      art,
      weeklyScore,
    }
  })

  // Sort descending by weekly score
  scored.sort((a, b) => b.weeklyScore - a.weeklyScore)

  // 3. Category Diversity Gate: pick Top 5 (max 2 per category to guarantee a balanced cross-domain briefing)
  const categoryCounts: Record<string, number> = {}
  const topPicked: typeof scored = []
  const candidatePool: typeof scored = []

  for (const item of scored) {
    const cat = item.art.category || 'general-tech'
    const count = categoryCounts[cat] || 0

    if (topPicked.length < 5 && count < 2) {
      topPicked.push(item)
      categoryCounts[cat] = count + 1
    } else {
      candidatePool.push(item)
    }
  }

  // If diversity was too strict, fill remaining slots up to 5
  while (topPicked.length < 5 && candidatePool.length > 0) {
    topPicked.push(candidatePool.shift()!)
  }

  // Format Top 5
  const topArticles: WeeklyFlashArticle[] = topPicked.map((item, idx) => {
    const art = item.art
    const verdict = extractCoreVerdict(art.cleanedTitle || art.title, art.description, art.bodyExcerpt)
    const whyItMatters =
      art.enrichment?.whyItMatters ||
      `Direct impact on ${art.category.replace('-', ' ')} architectural choices and engineer tooling.`
    const actionableSkills =
      art.enrichment?.extractedSkills?.length
        ? art.enrichment.extractedSkills.slice(0, 3)
        : (art.subTags?.slice(0, 3) || ['Engineering'])

    return {
      id: art.id,
      eventId: art.eventId || art.id,
      number: String(idx + 1).padStart(2, '0'),
      title: art.cleanedTitle || art.title,
      category: art.category,
      categoryLabel: CATEGORY_DISPLAY_NAMES[art.category] || 'Tech',
      subTags: art.subTags || [],
      sourceName: art.sourceName,
      sourceDomain: art.sourceDomain,
      link: art.link,
      publishedAt: art.publishedAt,
      coreVerdict: verdict,
      whyItMatters,
      actionableSkills,
      weeklyScore: item.weeklyScore,
      estimatedReadSeconds: 45, // ~45s per flash card
    }
  })

  // Format candidate pool (up to 7 alternatives for custom swap)
  const candidateArticles: WeeklyFlashArticle[] = candidatePool.slice(0, 7).map((item, idx) => {
    const art = item.art
    return {
      id: art.id,
      eventId: art.eventId || art.id,
      number: String(idx + 6).padStart(2, '0'),
      title: art.cleanedTitle || art.title,
      category: art.category,
      categoryLabel: CATEGORY_DISPLAY_NAMES[art.category] || 'Tech',
      subTags: art.subTags || [],
      sourceName: art.sourceName,
      sourceDomain: art.sourceDomain,
      link: art.link,
      publishedAt: art.publishedAt,
      coreVerdict: extractCoreVerdict(art.cleanedTitle || art.title, art.description, art.bodyExcerpt),
      whyItMatters:
        art.enrichment?.whyItMatters ||
        `Key development in ${art.category.replace('-', ' ')} industry standards.`,
      actionableSkills:
        art.enrichment?.extractedSkills?.length
          ? art.enrichment.extractedSkills.slice(0, 3)
          : (art.subTags?.slice(0, 3) || ['Engineering']),
      weeklyScore: item.weeklyScore,
      estimatedReadSeconds: 45,
    }
  })

  const totalReadTimeMinutes = Math.round((topArticles.length * 45) / 60) // 5 * 45s = 225s ~ 4 mins
  const trendPulse = await generateWeeklyTrendPulse(
    topArticles,
    candidateArticles,
    weekCtx.weekNumber,
    now.getFullYear(),
    db
  )

  const payload: WeeklySummaryPayload = {
    issueId,
    issueNumber: weekCtx.weekNumber,
    weekRange: weekCtx.weekRange,
    mondayDate: weekCtx.mondayDate,
    status: weekCtx.isSundayNightOrLater ? 'finalized' : 'draft',
    isLockedUntilSunday: weekCtx.isSundayNightOrLater,
    nextLockAt: weekCtx.nextLockAt,
    totalReadTimeMinutes,
    topArticles,
    candidateArticles,
    lastCompiledAt: now.toISOString(),
    compiledBy,
    trendPulse,
    metadata: trendPulse.metadata,
  }

  // 4. Persistence: Firestore is the source of truth, static JSON is a derived distribution snapshot
  if (mode !== 'preview') {
    // Fencing check: verify worker lease is still active and has not expired or been overtaken
    if (workerId) {
      const isLeaseValid = await verifyLease(leaseName, workerId, fencingToken)
      if (!isLeaseValid) {
        console.warn(`[Weekly] Lease expired or overtaken for ${workerId}. Aborting stale Firestore overwrite.`)
        return payload
      }
    }

    if (db) {
      try {
        const cleanPayload = JSON.parse(JSON.stringify(payload))
        await db.collection('weekly_summaries').doc(issueId).set(cleanPayload, { merge: true })
        await db.collection('weekly_summaries').doc('latest').set(cleanPayload, { merge: true })
        console.log(`[Weekly] Successfully synced weekly issue ${issueId} to Firestore.`)
      } catch (err: any) {
        console.warn('[Weekly] Firestore sync error for weekly summary:', err.message)
      }
    }

    // Only write static snapshot in Local or CI environments (skip on Cloud Functions ephemeral/readonly containers)
    const isLocalOrCi = !process.env.K_SERVICE || process.env.FUNCTIONS_EMULATOR === 'true'
    if (isLocalOrCi) {
      try {
        const frontendDataDir = path.resolve(__dirname, '../../../src/data')
        if (!fs.existsSync(frontendDataDir)) {
          fs.mkdirSync(frontendDataDir, { recursive: true })
        }
        const weeklyJsonPath = path.join(frontendDataDir, 'weeklySummaryFeed.json')
        fs.writeFileSync(weeklyJsonPath, JSON.stringify(payload, null, 2), 'utf8')
        console.log(`[Weekly] Published verified weekly summary snapshot to ${weeklyJsonPath}`)
      } catch (err) {
        console.warn('[Weekly] Failed to write local weeklySummaryFeed.json:', err)
      }
    }
  }

    return payload
  } finally {
    if (workerId) {
      await releaseLease(leaseName, workerId, fencingToken)
    }
  }
}
