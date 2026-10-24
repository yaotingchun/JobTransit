import Parser from 'rss-parser'
import crypto from 'crypto'
import { RawArticle, SourceConfig, SourceStatus } from './types'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'JobTransit-NewsBot/1.0 (+https://jobtransit.com)',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
  },
  customFields: {
    item: [
      ['comments', 'commentsUrl'],
      ['slash:comments', 'slashComments'],
    ],
  },
})

export interface CollectionResult {
  articles: RawArticle[]
  statusUpdates: Map<string, Partial<SourceStatus>>
}

/**
 * Fetch a single source with strict timeout, isolation, and error accounting
 */
export async function collectFromSingleSource(
  source: SourceConfig,
  currentStatus?: Partial<SourceStatus>
): Promise<{ sourceId: string; articles: RawArticle[]; statusUpdate: Partial<SourceStatus> }> {
  const now = new Date()

  // Circuit breaker check: pause source if opened due to >= 5 consecutive failures
  if (currentStatus?.circuitOpenUntil) {
    const openUntil = new Date(currentStatus.circuitOpenUntil)
    if (openUntil > now) {
      return {
        sourceId: source.id,
        articles: [],
        statusUpdate: {
          lastSyncAt: now.toISOString(),
          lastError: `Circuit breaker active until ${openUntil.toISOString()}`,
        },
      }
    }
  }

  // Timeout controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), source.timeoutMs)

  try {
    const feed = await parser.parseURL(source.url)
    clearTimeout(timeoutId)

    const rawArticles: RawArticle[] = []
    const items = feed.items || []

    const lastSuccess = currentStatus?.lastSuccessAt ? new Date(currentStatus.lastSuccessAt) : null
    // Fallback: lookback 48 hours for initial ingestion
    const lookbackThreshold = lastSuccess ?? new Date(Date.now() - 48 * 60 * 60 * 1000)

    for (const item of items) {
      if (rawArticles.length >= source.maxItemsPerRun) break

      const title = (item.title || '').trim()
      const link = (item.link || '').trim()
      if (!title || !link) continue

      const itemDate = item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate!) : now
      // Skip if older than last successful sync
      if (itemDate < lookbackThreshold) continue

      let finalLink = link
      let descriptionText = ''
      let bodyExcerptText: string | null = null
      let hnPoints: number | undefined

      if (source.id === 'hacker-news') {
        const rawContent = item.content || item.summary || item.contentSnippet || ''

        // Extract article and comments URLs
        const articleMatch = rawContent.match(/Article URL:\s*<a\s+href="([^"]+)"/i) || rawContent.match(/Article URL:\s*(https?:\/\/[^\s<]+)/i)
        const commentsMatch = rawContent.match(/Comments URL:\s*<a\s+href="([^"]+)"/i) || rawContent.match(/Comments URL:\s*(https?:\/\/[^\s<]+)/i)
        const pointMatch = rawContent.match(/(\d+)\s+points?/i)
        const commentsCountMatch = rawContent.match(/(\d+)\s+#?\s*comments?/i)

        if (pointMatch) hnPoints = parseInt(pointMatch[1], 10)
        const commentsUrl = commentsMatch ? commentsMatch[1].trim() : ''
        const candidateArticleUrl = articleMatch ? articleMatch[1].trim() : link

        // Ensure link is fully accessible: if it points to ephemeral/restricted twitter/nitter, use permanent HN comments page
        if (
          candidateArticleUrl.includes('nitter.') ||
          candidateArticleUrl.includes('twitter.com') ||
          candidateArticleUrl.includes('x.com') ||
          !candidateArticleUrl.startsWith('http')
        ) {
          finalLink = commentsUrl || candidateArticleUrl
        } else {
          finalLink = candidateArticleUrl
        }

        const stats: string[] = []
        if (hnPoints) stats.push(`${hnPoints} points`)
        if (commentsCountMatch) stats.push(`${commentsCountMatch[1]} comments`)
        const statsStr = stats.length > 0 ? ` (${stats.join(', ')})` : ''

        descriptionText = `Trending engineering discussion on Hacker News${statsStr} analyzing: ${title}.`
        bodyExcerptText = descriptionText
      } else {
        // Standard clean HTML stripping for editorial publications
        const rawDescription = item.contentSnippet || item.content || item.summary || ''
        const cleaned = rawDescription
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()

        descriptionText = cleaned.slice(0, 320)
        bodyExcerptText = cleaned.slice(0, 1500) || null
      }

      if (!finalLink.startsWith('http')) continue

      rawArticles.push({
        id: `${source.id}_${crypto.createHash('sha256').update(finalLink).digest('hex').slice(0, 24)}`,
        sourceId: source.id,
        sourceName: source.name,
        sourceDomain: source.domain,
        title,
        link: finalLink,
        publishedAt: itemDate.toISOString(),
        description: descriptionText,
        bodyExcerpt: bodyExcerptText,
        rawGuid: item.guid || (item as any).id,
        hnPoints,
      })
    }

    return {
      sourceId: source.id,
      articles: rawArticles,
      statusUpdate: {
        lastSyncAt: now.toISOString(),
        lastSuccessAt: now.toISOString(),
        consecutiveFailures: 0,
        circuitOpenUntil: null,
        lastError: null,
        lastFetchedCount: items.length,
        lastNewArticleCount: rawArticles.length,
      },
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    const errMessage = err?.message || String(err)
    const consecutiveFailures = (currentStatus?.consecutiveFailures || 0) + 1
    const shouldOpenCircuit = consecutiveFailures >= 5
    const circuitOpenUntil = shouldOpenCircuit
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString() // Pause 1 hour
      : null

    return {
      sourceId: source.id,
      articles: [],
      statusUpdate: {
        lastSyncAt: now.toISOString(),
        consecutiveFailures,
        circuitOpenUntil,
        lastError: errMessage,
        lastFetchedCount: 0,
        lastNewArticleCount: 0,
      },
    }
  }
}

/**
 * Resilient batch collection across all active sources in parallel with individual fault isolation
 */
export async function collectAllSources(
  sources: SourceConfig[],
  statuses: Map<string, Partial<SourceStatus>> = new Map()
): Promise<CollectionResult> {
  const activeSources = sources.filter((s) => s.enabled)

  // Run all sources in parallel; failures in one do not halt others
  const results = await Promise.all(
    activeSources.map((source) => collectFromSingleSource(source, statuses.get(source.id)))
  )

  const allArticles: RawArticle[] = []
  const statusUpdates = new Map<string, Partial<SourceStatus>>()

  for (const res of results) {
    allArticles.push(...res.articles)
    statusUpdates.set(res.sourceId, res.statusUpdate)
  }

  return {
    articles: allArticles,
    statusUpdates,
  }
}
