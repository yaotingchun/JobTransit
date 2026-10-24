export type SourceType = 'rss' | 'api'

export interface SourceConfig {
  id: string
  name: string
  type: SourceType
  url: string
  domain: string
  authorityTier: 1 | 2 | 3 | 4
  maxItemsPerRun: number
  timeoutMs: number
  enabled: boolean
}

export interface SourceStatus {
  sourceId: string
  sourceName: string
  lastSyncAt: string
  lastSuccessAt: string | null
  consecutiveFailures: number
  circuitOpenUntil: string | null
  totalIngested: number
  lastError: string | null
  lastFetchedCount: number
  lastNewArticleCount: number
}

export interface RawArticle {
  id: string
  sourceId: string
  sourceName: string
  sourceDomain: string
  title: string
  link: string
  publishedAt: string
  description: string
  bodyExcerpt: string | null
  rawGuid?: string
  hnPoints?: number
  redditScore?: number
}

export interface NormalizedArticle {
  id: string
  urlHash: string
  sourceId: string
  sourceName: string
  sourceDomain: string
  title: string
  cleanedTitle: string
  link: string
  publishedAt: string
  description: string
  bodyExcerpt: string | null
  wordCount: number
  hasFullBody: boolean
}

export type ArticleCategory =
  | 'ai-ml'
  | 'software-engineering'
  | 'data-cloud'
  | 'security'
  | 'career-industry'
  | 'general-tech'

export interface ClassifiedArticle extends NormalizedArticle {
  category: ArticleCategory
  subTags: string[]
  topicKeywords: string[]
}

export type EnrichmentStatus =
  | 'pending'
  | 'processing'
  | 'enriched'
  | 'insufficient_content'
  | 'error'

export interface EnrichmentOutput {
  whyItMatters: string | null
  chineseSummary: string | null
  extractedSkills: string[]
  technicalSignificance: number // 1 to 10
  confidence: 'high' | 'medium' | 'low'
  status: EnrichmentStatus
  modelVersion: string
  promptVersion: string
  enrichedAt: string
}

export interface ArticleScores {
  recency: number // normalized 0..1 (exponential decay with 18h half-life)
  significance: number // normalized 0..1 (from technicalSignificance / 10)
  careerRelevance: number // normalized 0..1 (category alignment + skill overlap)
  sourceAuthority: number // normalized 0..1 (tier authority weight)
  crossCoverage: number // normalized 0..1 (coverage count / 3 boost)
  engagement?: number // normalized 0..1 (HN points / Reddit upvotes)
  composite: number // normalized 0..1 (weighted linear combination)
}

export interface RelatedSourceSummary {
  articleId: string
  sourceName: string
  sourceDomain: string
  link: string
  publishedAt: string
}

export interface FinalArticleDocument extends ClassifiedArticle {
  enrichment: EnrichmentOutput
  scores: ArticleScores
  eventId: string
  isPrimaryInEvent: boolean
  relatedSources: RelatedSourceSummary[]
  createdAt: string
  updatedAt: string
}

export interface NewsEvent {
  eventId: string
  primaryArticleId: string
  title: string
  summary: string
  articles: RelatedSourceSummary[]
  firstSeenAt: string
  lastUpdatedAt: string
  articleCount: number
}

export interface FeedMetadata {
  version: string
  publishedAt: string
  articleCount: number
  eventCount: number
  pipelineDurationMs: number
  status: 'published' | 'stale' | 'invalid'
}

export interface IngestionLock {
  locked: boolean
  lockedAt: string
  expiresAt: string
  workerId: string
}
