import crypto from 'crypto'
import { RawArticle, NormalizedArticle } from './types'

/**
 * Remove tracking parameters and trailing slashes for canonical URL comparison
 */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    // Common tracking parameters
    const paramsToRemove = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'source',
      'fbclid',
      'gclid',
      'msclkid',
      '_hsenc',
      '_hsmi',
    ]
    paramsToRemove.forEach((param) => url.searchParams.delete(param))
    // Normalize pathname
    let clean = url.toString()
    if (clean.endsWith('/') && url.pathname !== '/') {
      clean = clean.slice(0, -1)
    }
    return clean
  } catch {
    return rawUrl.trim()
  }
}

/**
 * Clean publication titles: remove HTML entities and trailing brand tags
 */
export function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Strip trailing source names like " | TechCrunch", " - Ars Technica"
    .replace(/\s*[-–—|]\s*(TechCrunch|The Verge|Ars Technica|Hacker News|GitHub Blog|Google).*$/i, '')
    .trim()
}

/**
 * Compute SHA-256 hash of canonical URL for deduplication lookup
 */
export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(canonicalizeUrl(url)).digest('hex').slice(0, 24)
}

/**
 * Normalize raw ingested article into standardized internal format
 */
export function normalizeArticle(raw: RawArticle): NormalizedArticle {
  const canonicalLink = canonicalizeUrl(raw.link)
  const cleaned = cleanTitle(raw.title)
  const textContent = `${cleaned} ${raw.description || ''} ${raw.bodyExcerpt || ''}`
  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length

  const canonicalHash = hashUrl(canonicalLink)

  return {
    id: `${raw.sourceId}_${canonicalHash}`,
    urlHash: canonicalHash,
    sourceId: raw.sourceId,
    sourceName: raw.sourceName,
    sourceDomain: raw.sourceDomain,
    title: raw.title,
    cleanedTitle: cleaned,
    link: canonicalLink,
    publishedAt: raw.publishedAt,
    description: raw.description,
    bodyExcerpt: raw.bodyExcerpt,
    wordCount,
    hasFullBody: (raw.bodyExcerpt?.length || 0) > 400,
  }
}

export function normalizeBatch(articles: RawArticle[]): NormalizedArticle[] {
  return articles.map(normalizeArticle)
}
