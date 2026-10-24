import crypto from 'crypto'
import { NormalizedArticle, NewsEvent, RelatedSourceSummary } from './types'

/**
 * Tokenize and normalize title for similarity comparison, extracting substantive keywords
 */
export function extractSubstantiveTokens(title: string): Set<string> {
  const stopwords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'and', 'or', 'is', 'are', 'was', 'were', 'it', 'its', 'as', 'that', 'this',
    'how', 'why', 'what', 'new', 'now', 'says', 'after', 'about', 'into', 'over',
    'via', 'more', 'than', 'will', 'can', 'could', 'may', 'your', 'their', 'our',
    'here', 'just', 'out', 'up', 'down', 'all', 'one', 'two', 'first', 'second'
  ])

  const words = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w))

  return new Set(words)
}

/**
 * Calculate Jaccard similarity and return shared token count
 */
export function calculateTokenOverlap(
  setA: Set<string>,
  setB: Set<string>
): { similarity: number; sharedCount: number } {
  if (setA.size === 0 || setB.size === 0) return { similarity: 0, sharedCount: 0 }
  let sharedCount = 0
  for (const item of setA) {
    if (setB.has(item)) sharedCount++
  }
  const unionSize = setA.size + setB.size - sharedCount
  return {
    similarity: unionSize > 0 ? sharedCount / unionSize : 0,
    sharedCount,
  }
}

export interface ClusteredArticle extends NormalizedArticle {
  eventId: string
  isPrimaryInEvent: boolean
  relatedSources: RelatedSourceSummary[]
}

export interface ClusterResult {
  clusteredArticles: ClusteredArticle[]
  events: NewsEvent[]
}

/**
 * Two-stage deduplication:
 * 1. Strict canonical URL deduplication (discards identical URLs)
 * 2. Conservative event candidate clustering (groups stories covering the exact same event)
 */
export function clusterArticles(articles: NormalizedArticle[]): ClusterResult {
  const seenUrls = new Set<string>()
  const uniqueArticles: NormalizedArticle[] = []

  // Stage 1: Exact canonical URL deduplication
  for (const article of articles) {
    if (seenUrls.has(article.urlHash)) {
      continue // Identical canonical URL already processed
    }
    seenUrls.add(article.urlHash)
    uniqueArticles.push(article)
  }

  // Stage 2: Event clustering with strict entity + temporal constraints
  const events: NewsEvent[] = []
  const articleToEvent = new Map<string, string>() // articleId -> eventId
  const eventArticles = new Map<string, NormalizedArticle[]>()

  const MAX_TIME_WINDOW_MS = 36 * 60 * 60 * 1000 // 36 hours

  for (const article of uniqueArticles) {
    const articleTime = new Date(article.publishedAt).getTime()
    const tokens = extractSubstantiveTokens(article.cleanedTitle)
    let matchedEventId: string | null = null

    for (const event of events) {
      const eventTime = new Date(event.firstSeenAt).getTime()
      const timeDiff = Math.abs(articleTime - eventTime)

      // Temporal safeguard: stories separated by > 36h are distinct events
      if (timeDiff > MAX_TIME_WINDOW_MS) {
        continue
      }

      const eventTokens = extractSubstantiveTokens(event.title)
      const { similarity, sharedCount } = calculateTokenOverlap(tokens, eventTokens)

      // Strict event matching criteria:
      // High token similarity (>= 0.72) AND at least 3 shared substantive terms
      // OR direct destination URL match (e.g., aggregator link pointing to the same source)
      const isContentMatch = similarity >= 0.72 && sharedCount >= 3
      const isTargetLinkMatch = article.link.length > 10 && event.articles.some((a) => a.link === article.link)

      if (isContentMatch || isTargetLinkMatch) {
        matchedEventId = event.eventId
        break
      }
    }

    if (matchedEventId) {
      // Attach to existing event cluster
      const list = eventArticles.get(matchedEventId) || []
      list.push(article)
      eventArticles.set(matchedEventId, list)
      articleToEvent.set(article.id, matchedEventId)

      const event = events.find((e) => e.eventId === matchedEventId)!
      event.articleCount++
      event.lastUpdatedAt = new Date().toISOString()

      // Cap stored article references in event doc to 15 to safeguard doc size
      if (event.articles.length < 15) {
        event.articles.push({
          articleId: article.id,
          sourceName: article.sourceName,
          sourceDomain: article.sourceDomain,
          link: article.link,
          publishedAt: article.publishedAt,
        })
      }
    } else {
      // Create new event cluster
      const titleHash = crypto.createHash('md5').update(article.cleanedTitle).digest('hex').slice(0, 12)
      const newEventId = `evt_${titleHash}_${articleTime}`
      const summaryItem: RelatedSourceSummary = {
        articleId: article.id,
        sourceName: article.sourceName,
        sourceDomain: article.sourceDomain,
        link: article.link,
        publishedAt: article.publishedAt,
      }

      events.push({
        eventId: newEventId,
        primaryArticleId: article.id,
        title: article.cleanedTitle,
        summary: article.description,
        articles: [summaryItem],
        firstSeenAt: article.publishedAt,
        lastUpdatedAt: article.publishedAt,
        articleCount: 1,
      })

      eventArticles.set(newEventId, [article])
      articleToEvent.set(article.id, newEventId)
    }
  }

  // Stage 3: Designate primary article per event and attach cross-source references
  const clusteredArticles: ClusteredArticle[] = []

  for (const article of uniqueArticles) {
    const eventId = articleToEvent.get(article.id)!
    const cluster = eventArticles.get(eventId) || [article]

    // Sort cluster to determine authoritative primary article:
    // Prefer articles with full body excerpt or longer detailed description
    const sortedCluster = [...cluster].sort((a, b) => {
      const aLen = (a.bodyExcerpt?.length || 0) + (a.description?.length || 0)
      const bLen = (b.bodyExcerpt?.length || 0) + (b.description?.length || 0)
      return bLen - aLen
    })

    const isPrimary = sortedCluster[0].id === article.id

    // Related sources from cluster (excluding current article)
    const related = cluster
      .filter((a) => a.id !== article.id)
      .slice(0, 10)
      .map((a) => ({
        articleId: a.id,
        sourceName: a.sourceName,
        sourceDomain: a.sourceDomain,
        link: a.link,
        publishedAt: a.publishedAt,
      }))

    clusteredArticles.push({
      ...article,
      eventId,
      isPrimaryInEvent: isPrimary,
      relatedSources: related,
    })
  }

  return {
    clusteredArticles,
    events,
  }
}
