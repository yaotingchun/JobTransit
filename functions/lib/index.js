"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.redoWeeklySummary = exports.scheduledWeeklySummary = exports.triggerNewsSync = exports.scheduledNewsSync = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const orchestrator_1 = require("./pipeline/orchestrator");
const firebaseAdmin_1 = require("./lib/firebaseAdmin");
const lease_1 = require("./lib/lease");
const compileWeekly_1 = require("./weekly/compileWeekly");
const LEASE_NAME = 'daily_news_sync';
/**
 * Scheduled cron job: runs every 30 minutes with lease protection, idempotency, and atomic publication
 */
exports.scheduledNewsSync = (0, scheduler_1.onSchedule)('every 30 minutes', async (event) => {
    logger.info('[Scheduler] Triggering scheduled daily news feed sync...');
    // Step 1: Distributed Lease Lock to prevent overlapping scheduled runs
    const { acquired, workerId } = await (0, lease_1.acquireLease)(LEASE_NAME, 20 * 60 * 1000);
    if (!acquired) {
        logger.warn('[Scheduler] Another news sync worker holds the active lease. Skipping execution.');
        return;
    }
    try {
        const db = (0, firebaseAdmin_1.getFirestore)();
        const existingEnrichments = new Map();
        // Step 2: Fetch existing enrichments for idempotency (write-once guarantee)
        if (db) {
            try {
                const recentSnap = await db
                    .collection('daily_articles')
                    .orderBy('publishedAt', 'desc')
                    .limit(150)
                    .get();
                recentSnap.forEach((doc) => {
                    const data = doc.data();
                    if (data.enrichment && data.enrichment.status === 'enriched') {
                        const why = data.enrichment.whyItMatters || '';
                        const catName = (data.category || '').replace('-', ' ');
                        if (!why.startsWith('Relevant to engineers working in ') || why.toLowerCase().includes(catName)) {
                            existingEnrichments.set(doc.id, data.enrichment);
                        }
                    }
                });
                logger.info(`[Scheduler] Loaded ${existingEnrichments.size} existing enrichments for idempotency cache.`);
            }
            catch (err) {
                logger.warn('[Scheduler] Could not pre-fetch existing enrichments:', err);
            }
        }
        // Step 3: Run pipeline
        const result = await (0, orchestrator_1.runPipeline)(new Map(), existingEnrichments);
        // Step 4: Atomic Publication Gate
        if (!result.isValid) {
            logger.error('[Scheduler] Ingestion validation failed. Retaining previous feed version.');
            return;
        }
        // Step 5: Persist candidates & atomically publish metadata
        if (db) {
            const batch = db.batch();
            for (const article of result.articles.slice(0, 100)) {
                batch.set(db.collection('daily_articles').doc(article.id), article, { merge: true });
            }
            for (const newsEvent of result.events.slice(0, 50)) {
                batch.set(db.collection('news_events').doc(newsEvent.eventId), newsEvent, { merge: true });
            }
            for (const [sourceId, status] of result.sourceStatuses.entries()) {
                batch.set(db.collection('source_status').doc(sourceId), status, { merge: true });
            }
            // Publish feed metadata pointer
            batch.set(db.collection('feed_metadata').doc('latest'), result.metadata, { merge: true });
            await batch.commit();
        }
        logger.info(`[Scheduler] Ingestion succeeded & feed published: ${result.metadata.version} (${result.articles.length} articles)`);
    }
    catch (err) {
        logger.error('[Scheduler] Ingestion error:', err);
    }
    finally {
        await (0, lease_1.releaseLease)(LEASE_NAME, workerId);
    }
});
/**
 * HTTP endpoint to manually trigger ingestion on demand (e.g. from admin UI or webhook)
 */
exports.triggerNewsSync = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    logger.info('[HTTP] Manual sync requested');
    const { acquired, workerId } = await (0, lease_1.acquireLease)(LEASE_NAME, 10 * 60 * 1000);
    if (!acquired) {
        res.status(409).json({ success: false, message: 'Ingestion currently locked by another process' });
        return;
    }
    try {
        const db = (0, firebaseAdmin_1.getFirestore)();
        const existingEnrichments = new Map();
        if (db) {
            try {
                const snap = await db.collection('daily_articles').limit(100).get();
                snap.forEach((doc) => {
                    const d = doc.data();
                    if (d.enrichment?.status === 'enriched') {
                        const why = d.enrichment.whyItMatters || '';
                        const catName = (d.category || '').replace('-', ' ');
                        if (!why.startsWith('Relevant to engineers working in ') || why.toLowerCase().includes(catName)) {
                            existingEnrichments.set(doc.id, d.enrichment);
                        }
                    }
                });
            }
            catch (e) {
                // Ignore cache fetch error
            }
        }
        const result = await (0, orchestrator_1.runPipeline)(new Map(), existingEnrichments);
        if (db && result.isValid) {
            const batch = db.batch();
            for (const article of result.articles.slice(0, 100)) {
                batch.set(db.collection('daily_articles').doc(article.id), article, { merge: true });
            }
            for (const newsEvent of result.events.slice(0, 50)) {
                batch.set(db.collection('news_events').doc(newsEvent.eventId), newsEvent, { merge: true });
            }
            for (const [sourceId, status] of result.sourceStatuses.entries()) {
                batch.set(db.collection('source_status').doc(sourceId), status, { merge: true });
            }
            batch.set(db.collection('feed_metadata').doc('latest'), result.metadata, { merge: true });
            await batch.commit();
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
        });
    }
    catch (err) {
        logger.error('[HTTP] Ingestion error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
    finally {
        await (0, lease_1.releaseLease)(LEASE_NAME, workerId);
    }
});
/**
 * Scheduled weekly summary cron: runs every Sunday at 23:50 UTC to finalize the week's Top 5
 * for Monday morning 5-minute reading.
 */
exports.scheduledWeeklySummary = (0, scheduler_1.onSchedule)('50 23 * * 0', async (event) => {
    logger.info('[WeeklyScheduler] Triggering Sunday midnight weekly summary finalization...');
    try {
        const summary = await (0, compileWeekly_1.compileWeeklySummary)('scheduled_cron');
        logger.info(`[WeeklyScheduler] Successfully finalized weekly issue: ${summary.issueId} (${summary.topArticles.length} stories)`);
    }
    catch (err) {
        logger.error('[WeeklyScheduler] Error compiling weekly summary:', err);
    }
});
/**
 * HTTP endpoint to manually redo / re-roll the weekly summary on demand before Sunday lock
 */
exports.redoWeeklySummary = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    logger.info('[HTTP] Manual weekly summary re-compilation requested');
    try {
        const summary = await (0, compileWeekly_1.compileWeeklySummary)('manual_redo');
        res.json({
            success: true,
            message: 'Weekly summary successfully recompiled',
            summary,
        });
    }
    catch (err) {
        logger.error('[HTTP] Error recompiling weekly summary:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});
//# sourceMappingURL=index.js.map