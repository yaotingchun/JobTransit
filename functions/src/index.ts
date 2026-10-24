import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { runPipeline } from './pipeline/orchestrator'
import { getFirestore } from './lib/firebaseAdmin'
import { acquireLease, releaseLease } from './lib/lease'
import { EnrichmentOutput } from './pipeline/types'
import { compileWeeklySummary } from './weekly/compileWeekly'

const LEASE_NAME = 'daily_news_sync'

/**
 * Scheduled cron job: runs every 30 minutes with lease protection, idempotency, and atomic publication
 */
export const scheduledNewsSync = onSchedule('every 30 minutes', async (event) => {
  logger.info('[Scheduler] Triggering scheduled daily news feed sync...')

  // Step 1: Distributed Lease Lock to prevent overlapping scheduled runs
  const { acquired, workerId } = await acquireLease(LEASE_NAME, 20 * 60 * 1000)
  if (!acquired) {
    logger.warn('[Scheduler] Another news sync worker holds the active lease. Skipping execution.')
    return
  }

  try {
    const db = getFirestore()
    const existingEnrichments = new Map<string, EnrichmentOutput>()

    // Step 2: Fetch existing enrichments for idempotency (write-once guarantee)
    if (db) {
      try {
        const recentSnap = await db
          .collection('daily_articles')
          .orderBy('publishedAt', 'desc')
          .limit(150)
          .get()

        recentSnap.forEach((doc) => {
          const data = doc.data()
          if (data.enrichment && data.enrichment.status === 'enriched') {
            const why = data.enrichment.whyItMatters || ''
            const catName = (data.category || '').replace('-', ' ')
            if (!why.startsWith('Relevant to engineers working in ') || why.toLowerCase().includes(catName)) {
              existingEnrichments.set(doc.id, data.enrichment)
            }
          }
        })
        logger.info(`[Scheduler] Loaded ${existingEnrichments.size} existing enrichments for idempotency cache.`)
      } catch (err) {
        logger.warn('[Scheduler] Could not pre-fetch existing enrichments:', err)
      }
    }

    // Step 3: Run pipeline
    const result = await runPipeline(new Map(), existingEnrichments)

    // Step 4: Atomic Publication Gate
    if (!result.isValid) {
      logger.error('[Scheduler] Ingestion validation failed. Retaining previous feed version.')
      return
    }

    // Step 5: Persist candidates & atomically publish metadata
    if (db) {
      const batch = db.batch()
      for (const article of result.articles.slice(0, 100)) {
        batch.set(db.collection('daily_articles').doc(article.id), article, { merge: true })
      }
      for (const newsEvent of result.events.slice(0, 50)) {
        batch.set(db.collection('news_events').doc(newsEvent.eventId), newsEvent, { merge: true })
      }
      for (const [sourceId, status] of result.sourceStatuses.entries()) {
        batch.set(db.collection('source_status').doc(sourceId), status, { merge: true })
      }

      // Publish feed metadata pointer
      batch.set(db.collection('feed_metadata').doc('latest'), result.metadata, { merge: true })
      await batch.commit()
    }

    logger.info(`[Scheduler] Ingestion succeeded & feed published: ${result.metadata.version} (${result.articles.length} articles)`)
  } catch (err: any) {
    logger.error('[Scheduler] Ingestion error:', err)
  } finally {
    await releaseLease(LEASE_NAME, workerId)
  }
})

/**
 * HTTP endpoint to manually trigger ingestion on demand (e.g. from admin UI or webhook)
 */
export const triggerNewsSync = onRequest({ cors: true }, async (req, res) => {
  logger.info('[HTTP] Manual sync requested')

  const { acquired, workerId } = await acquireLease(LEASE_NAME, 10 * 60 * 1000)
  if (!acquired) {
    res.status(409).json({ success: false, message: 'Ingestion currently locked by another process' })
    return
  }

  try {
    const db = getFirestore()
    const existingEnrichments = new Map<string, EnrichmentOutput>()

    if (db) {
      try {
        const snap = await db.collection('daily_articles').limit(100).get()
        snap.forEach((doc) => {
          const d = doc.data()
          if (d.enrichment?.status === 'enriched') {
            const why = d.enrichment.whyItMatters || ''
            const catName = (d.category || '').replace('-', ' ')
            if (!why.startsWith('Relevant to engineers working in ') || why.toLowerCase().includes(catName)) {
              existingEnrichments.set(doc.id, d.enrichment)
            }
          }
        })
      } catch (e) {
        // Ignore cache fetch error
      }
    }

    const result = await runPipeline(new Map(), existingEnrichments)

    if (db && result.isValid) {
      const batch = db.batch()
      for (const article of result.articles.slice(0, 100)) {
        batch.set(db.collection('daily_articles').doc(article.id), article, { merge: true })
      }
      for (const newsEvent of result.events.slice(0, 50)) {
        batch.set(db.collection('news_events').doc(newsEvent.eventId), newsEvent, { merge: true })
      }
      for (const [sourceId, status] of result.sourceStatuses.entries()) {
        batch.set(db.collection('source_status').doc(sourceId), status, { merge: true })
      }
      batch.set(db.collection('feed_metadata').doc('latest'), result.metadata, { merge: true })
      await batch.commit()
    }

    res.json({
      success: result.isValid,
      metadata: result.metadata,
      stats: result.stats,
      topArticles: result.articles.slice(0, 5).map((a) => ({
        id: a.id,
        title: a.title,
        compositeScore: a.scores.composite,
        category: a.category,
      })),
    })
  } catch (err: any) {
    logger.error('[HTTP] Ingestion error:', err)
    res.status(500).json({ success: false, error: err.message })
  } finally {
    await releaseLease(LEASE_NAME, workerId)
  }
})

/**
 * Scheduled weekly summary cron: runs every Sunday at 23:50 UTC to finalize the week's Top 5
 * for Monday morning 5-minute reading.
 */
export const scheduledWeeklySummary = onSchedule('50 23 * * 0', async (event) => {
  logger.info('[WeeklyScheduler] Triggering Sunday midnight weekly summary finalization...')
  try {
    const summary = await compileWeeklySummary('scheduled_cron')
    logger.info(`[WeeklyScheduler] Successfully finalized weekly issue: ${summary.issueId} (${summary.topArticles.length} stories)`)
  } catch (err: any) {
    logger.error('[WeeklyScheduler] Error compiling weekly summary:', err)
  }
})

/**
 * HTTP endpoint to manually redo / re-roll the weekly summary on demand before Sunday lock
 */
export const redoWeeklySummary = onRequest({ cors: true }, async (req, res) => {
  logger.info('[HTTP] Manual weekly summary re-compilation requested')
  try {
    const summary = await compileWeeklySummary('manual_redo')
    res.json({
      success: true,
      message: 'Weekly summary successfully recompiled',
      summary,
    })
  } catch (err: any) {
    logger.error('[HTTP] Error recompiling weekly summary:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

