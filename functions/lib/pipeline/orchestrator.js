"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
const sources_1 = require("../config/sources");
const collect_1 = require("./collect");
const normalize_1 = require("./normalize");
const deduplicate_1 = require("./deduplicate");
const classify_1 = require("./classify");
const enrich_1 = require("./enrich");
const rank_1 = require("./rank");
/**
 * Executes the complete 7-stage news ingestion, idempotency check, enrichment, and publication gate
 */
async function runPipeline(currentStatuses = new Map(), existingEnrichments = new Map()) {
    const startTime = Date.now();
    console.log('[Pipeline] 1. Collecting news across sources (resilient)...');
    const { articles: rawArticles, statusUpdates } = await (0, collect_1.collectAllSources)(sources_1.NEWS_SOURCES, currentStatuses);
    console.log(`[Pipeline] Collected ${rawArticles.length} raw articles.`);
    console.log('[Pipeline] 2. Normalizing & cleaning URLs...');
    const normalized = (0, normalize_1.normalizeBatch)(rawArticles);
    console.log('[Pipeline] 3. Two-stage deduplication & event candidate clustering...');
    const { clusteredArticles, events } = (0, deduplicate_1.clusterArticles)(normalized);
    console.log('[Pipeline] 4. Classifying topics & extracting sub-tags...');
    const classified = (0, classify_1.classifyBatch)(clusteredArticles);
    console.log('[Pipeline] 5. Idempotent evidence-gated LLM enrichment...');
    // Enrich primary articles first, reusing stored enrichments for idempotency
    const primaryArticles = classified.filter((a) => a.isPrimaryInEvent);
    const enrichmentMap = await (0, enrich_1.enrichBatch)(primaryArticles, existingEnrichments, 3);
    console.log('[Pipeline] 6. Computing normalized multi-signal ranking scores...');
    const now = new Date().toISOString();
    const finalArticles = classified.map((art) => {
        const rawMatch = rawArticles.find((r) => r.id === art.id);
        const enrichment = enrichmentMap.get(art.id) || {
            whyItMatters: null,
            chineseSummary: null,
            extractedSkills: art.subTags,
            technicalSignificance: 4,
            confidence: 'low',
            status: 'insufficient_content',
            modelVersion: 'heuristic-grounded',
            promptVersion: 'v2.1',
            enrichedAt: now,
        };
        const scores = (0, rank_1.computeArticleScores)(art, enrichment, rawMatch, art.relatedSources.length);
        return {
            ...art,
            enrichment,
            scores,
            createdAt: now,
            updatedAt: now,
        };
    });
    // Sort articles strictly by normalized composite score descending
    finalArticles.sort((a, b) => b.scores.composite - a.scores.composite);
    const durationMs = Date.now() - startTime;
    // 7. Atomic Publication Validation Gate
    const hasMinArticles = finalArticles.length >= 5;
    const scoresValid = finalArticles.slice(0, 10).every((a) => !isNaN(a.scores.composite) && a.scores.composite >= 0 && a.scores.composite <= 1);
    const isValid = hasMinArticles && scoresValid;
    const feedVersion = `v_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;
    const metadata = {
        version: feedVersion,
        publishedAt: now,
        articleCount: finalArticles.length,
        eventCount: events.length,
        pipelineDurationMs: durationMs,
        status: isValid ? 'published' : 'invalid',
    };
    console.log(`[Pipeline] Finished full pipeline in ${(durationMs / 1000).toFixed(2)}s. Produced ${finalArticles.length} ranked articles in ${events.length} events. Validation: ${isValid ? 'PASSED (Ready to Publish)' : 'FAILED'}`);
    return {
        articles: finalArticles,
        events,
        sourceStatuses: statusUpdates,
        metadata,
        isValid,
        stats: {
            collected: rawArticles.length,
            normalized: normalized.length,
            eventsFormed: events.length,
            enriched: primaryArticles.length,
            durationMs,
        },
    };
}
//# sourceMappingURL=orchestrator.js.map