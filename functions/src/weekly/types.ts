import { ArticleCategory } from '../pipeline/types'

export type CompileMode = 'create' | 'recompute' | 'preview'

export type HistoricalDirection = 'rising' | 'stable' | 'declining' | 'insufficient_data'

export type DataCompleteness = 'complete' | 'partial' | 'unobserved'

export interface WeeklyFlashArticle {
  id: string
  eventId?: string
  number: string
  title: string
  category: ArticleCategory
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

export interface TrendBaseline {
  topic: string
  currentWeekCount: number
  previousWeekCount: number
  fourWeekAverage: number
  eightWeekDirection: HistoricalDirection
  weeksObserved: number
  sourceDiversityScore: number
  calculatedMomentumScore: number
  dataCompleteness: DataCompleteness
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

  // Decoupled dimensions
  maturity: 'emerging' | 'established'
  momentum: 'rising' | 'stable' | 'cooling' | 'insufficient_data'

  // Optional paradigm shift (validated against supporting articles)
  paradigmShift?: {
    from: string
    to: string
  }

  // Evidence-backed justification (backend verified uniqueEvents)
  evidence: WeeklyTrendEvidence

  // Grounded high-signal editorial synthesis
  summary: string

  // Long-term implications for computer science education and engineering workflows
  csImpact: string

  // Concrete skills to monitor
  trackedSkills: string[]

  // Rigor & methodology footnote
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
