"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const orchestrator_1 = require("../pipeline/orchestrator");
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
async function main() {
    console.log('====================================================');
    console.log('⚡ Starting Refined Daily News Ingestion Pipeline');
    console.log('====================================================\n');
    const frontendDataDir = path_1.default.resolve(__dirname, '../../../src/data');
    const outputPath = path_1.default.join(frontendDataDir, 'dailyNewsFeed.json');
    // Step 1: Pre-load existing enrichments for idempotency (write-once guarantee)
    const existingEnrichments = new Map();
    if (fs_1.default.existsSync(outputPath)) {
        try {
            const existingData = JSON.parse(fs_1.default.readFileSync(outputPath, 'utf8'));
            if (Array.isArray(existingData.articles)) {
                for (const art of existingData.articles) {
                    if (art.enrichment && (art.enrichment.status === 'enriched' || art.enrichment.status === 'insufficient_content')) {
                        const why = art.enrichment.whyItMatters || '';
                        const catName = (art.category || '').replace('-', ' ');
                        // Only cache if category aligns (avoids carrying over stale/collided enrichments)
                        if (!why.startsWith('Relevant to engineers working in ') || why.toLowerCase().includes(catName)) {
                            existingEnrichments.set(art.id, art.enrichment);
                        }
                    }
                }
                console.log(`📦 Loaded ${existingEnrichments.size} existing enrichments from local snapshot for idempotency.`);
            }
        }
        catch (e) {
            console.warn('Could not read existing snapshot for idempotency:', e);
        }
    }
    // Step 2: Run pipeline with idempotency cache
    const result = await (0, orchestrator_1.runPipeline)(new Map(), existingEnrichments);
    // Step 3: Atomic Publication Validation Gate
    if (!result.isValid) {
        console.error('❌ Pipeline validation failed! Candidate data will NOT be published to the frontend feed.');
        process.exit(1);
    }
    console.log(`\n✅ Feed Validation Passed: Version ${result.metadata.version}`);
    // Step 4: Write validated feed snapshot to frontend src/data/dailyNewsFeed.json
    try {
        if (!fs_1.default.existsSync(frontendDataDir)) {
            fs_1.default.mkdirSync(frontendDataDir, { recursive: true });
        }
        fs_1.default.writeFileSync(outputPath, JSON.stringify({
            metadata: result.metadata,
            lastUpdated: new Date().toISOString(),
            stats: result.stats,
            articles: result.articles,
            events: result.events,
        }, null, 2), 'utf8');
        console.log(`💾 Atomically published verified feed snapshot to ${outputPath}`);
    }
    catch (err) {
        console.warn('⚠️ Could not save local frontend data snapshot:', err);
    }
    // Step 5: Persist to Firestore if available
    const db = (0, firebaseAdmin_1.getFirestore)();
    if (db) {
        try {
            console.log('\n☁️ Writing articles and feed metadata to Firestore...');
            const batch = db.batch();
            // Write top articles (cap batch size at 100)
            const articlesToWrite = result.articles.slice(0, 100);
            for (const article of articlesToWrite) {
                const docRef = db.collection('daily_articles').doc(article.id);
                batch.set(docRef, article, { merge: true });
            }
            // Write events
            for (const event of result.events.slice(0, 50)) {
                const eventRef = db.collection('news_events').doc(event.eventId);
                batch.set(eventRef, event, { merge: true });
            }
            // Write source statuses
            for (const [sourceId, status] of result.sourceStatuses.entries()) {
                const statusRef = db.collection('source_status').doc(sourceId);
                batch.set(statusRef, status, { merge: true });
            }
            // Atomically publish metadata
            batch.set(db.collection('feed_metadata').doc('latest'), result.metadata, { merge: true });
            await batch.commit();
            console.log(`✅ Successfully synced ${articlesToWrite.length} articles and published feed version to Firestore.`);
        }
        catch (err) {
            console.warn('⚠️ Firestore sync encountered an issue (may need Firestore enabled in GCP console):', err.message);
        }
    }
    // Step 6: Print Top 10 Ranked Results with normalized breakdown
    console.log('\n========================================================================');
    console.log('🏆 TOP 10 RANKED ARTICLES (Normalized Signals in [0, 1])');
    console.log('========================================================================');
    result.articles.slice(0, 10).forEach((art, idx) => {
        console.log(`\n[#${idx + 1}] Composite Score: ${art.scores.composite.toFixed(4)} | [${art.category}] ${art.cleanedTitle}`);
        console.log(`     Source: ${art.sourceName} | SubTags: ${art.subTags.slice(0, 4).join(', ')}`);
        console.log(`     Signals: Recency=${art.scores.recency} Sig=${art.scores.significance} Career=${art.scores.careerRelevance} Auth=${art.scores.sourceAuthority} CrossCov=${art.scores.crossCoverage}`);
        if (art.enrichment.whyItMatters) {
            console.log(`     💡 Why it matters (${art.enrichment.status}): ${art.enrichment.whyItMatters}`);
        }
        if (art.relatedSources.length > 0) {
            console.log(`     🔗 Also covered by: ${art.relatedSources.map((r) => r.sourceName).join(', ')}`);
        }
    });
    console.log('\n✨ Ingestion, deduplication, and atomic publishing complete!\n');
}
main().catch((err) => {
    console.error('Pipeline execution failed:', err);
    process.exit(1);
});
//# sourceMappingURL=runIngestion.js.map