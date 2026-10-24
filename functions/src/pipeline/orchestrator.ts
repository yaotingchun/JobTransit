import { NEWS_SOURCES } from '../config/sources'
import { collectAllSources } from './collect'
import { normalizeBatch } from './normalize'
import { clusterArticles } from './deduplicate'
import { classifyBatch } from './classify'
import { enrichBatch } from './enrich'
import { computeArticleScores } from './rank'
import {
  EnrichmentOutput,
  FeedMetadata,
  FinalArticleDocument,
  NewsEvent,
  SourceStatus,
} from './types'

export interface PipelineOutput {
  articles: FinalArticleDocument[]
  events: NewsEvent[]
  sourceStatuses: Map<string, Partial<SourceStatus>>
  metadata: FeedMetadata
  isValid: boolean
  stats: {
    collected: number
    normalized: number
    eventsFormed: number
    enriched: number
    durationMs: number
  }
}

/**
 * Executes the complete 7-stage news ingestion, idempotency check, enrichment, and publication gate
 */
export async function runPipeline(
  currentStatuses: Map<string, Partial<SourceStatus>> = new Map(),
  existingEnrichments: Map<string, EnrichmentOutput> = new Map()
): Promise<PipelineOutput> {
  const startTime = Date.now()
  console.log('[Pipeline] 1. Collecting news across sources (resilient)...')
  const { articles: rawArticles, statusUpdates } = await collectAllSources(NEWS_SOURCES, currentStatuses)

  console.log(`[Pipeline] Collected ${rawArticles.length} raw articles.`)
  console.log('[Pipeline] 2. Normalizing & cleaning URLs...')
  const normalized = normalizeBatch(rawArticles)

  console.log('[Pipeline] 3. Two-stage deduplication & event candidate clustering...')
  const { clusteredArticles, events } = clusterArticles(normalized)

  console.log('[Pipeline] 4. Classifying topics & extracting sub-tags...')
  const classified = classifyBatch(clusteredArticles)

  console.log('[Pipeline] 5. Idempotent evidence-gated LLM enrichment...')
  // Enrich primary articles first, reusing stored enrichments for idempotency
  const primaryArticles = classified.filter((a) => a.isPrimaryInEvent)
  const enrichmentMap = await enrichBatch(primaryArticles, existingEnrichments, 3)

  console.log('[Pipeline] 6. Computing normalized multi-signal ranking scores...')
  const now = new Date().toISOString()
  const finalArticles: FinalArticleDocument[] = classified.map((art) => {
    const rawMatch = rawArticles.find((r) => r.id === art.id)
    const enrichment: EnrichmentOutput = enrichmentMap.get(art.id) || {
      whyItMatters: null,
      chineseSummary: null,
      extractedSkills: art.subTags,
      technicalSignificance: 4,
      confidence: 'low',
      status: 'insufficient_content',
      modelVersion: 'heuristic-grounded',
      promptVersion: 'v2.1',
      enrichedAt: now,
    }

    const scores = computeArticleScores(art, enrichment, rawMatch, art.relatedSources.length)

    return {
      ...art,
      enrichment,
      scores,
      createdAt: now,
      updatedAt: now,
    }
  })

  // Sort articles strictly by normalized composite score descending
  finalArticles.sort((a, b) => b.scores.composite - a.scores.composite)

  const durationMs = Date.now() - startTime

  // 7. Atomic Publication Validation Gate
  const hasMinArticles = finalArticles.length >= 5
  const scoresValid = finalArticles.slice(0, 10).every((a) => !isNaN(a.scores.composite) && a.scores.composite >= 0 && a.scores.composite <= 1)
  const isValid = hasMinArticles && scoresValid

  const feedVersion = `v_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`
  const metadata: FeedMetadata = {
    version: feedVersion,
    publishedAt: now,
    articleCount: finalArticles.length,
    eventCount: events.length,
    pipelineDurationMs: durationMs,
    status: isValid ? 'published' : 'invalid',
  }

  console.log(
    `[Pipeline] Finished full pipeline in ${(durationMs / 1000).toFixed(2)}s. Produced ${finalArticles.length} ranked articles in ${events.length} events. Validation: ${isValid ? 'PASSED (Ready to Publish)' : 'FAILED'}`
  )

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
  }
}
