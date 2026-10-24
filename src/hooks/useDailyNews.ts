import { useState, useMemo } from 'react'
import initialFeedData from '../data/dailyNewsFeed.json'

export interface FeedArticle {
  id: string
  urlHash?: string
  sourceId: string
  sourceName: string
  sourceDomain: string
  title: string
  cleanedTitle: string
  link: string
  publishedAt: string
  description: string
  bodyExcerpt: string | null
  category: 'ai-ml' | 'software-engineering' | 'data-cloud' | 'security' | 'career-industry' | 'general-tech'
  subTags: string[]
  enrichment: {
    whyItMatters: string | null
    chineseSummary: string | null
    extractedSkills: string[]
    technicalSignificance: number
    confidence: 'high' | 'medium' | 'low'
    status: 'enriched' | 'insufficient_content' | 'error'
    enrichedAt: string
  }
  scores: {
    recency: number
    significance: number
    careerRelevance: number
    sourceAuthority: number
    crossCoverage?: number
    engagement?: number
    composite: number
  }
  eventId: string
  isPrimaryInEvent: boolean
  relatedSources: {
    articleId: string
    sourceName: string
    sourceDomain: string
    link: string
    publishedAt: string
  }[]
}

export interface UseDailyNewsOptions {
  category?: string
  searchQuery?: string
  sortBy?: 'latest' | 'relevant' | 'impact'
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeArticleCategory(art: FeedArticle): FeedArticle {
  let cat = art.category
  if (cat === 'general-tech' || !cat) {
    const text = ((art.cleanedTitle || art.title || '') + ' ' + (art.description || '')).toLowerCase()
    const careerKws = [
      'startup', 'startups', 'founder', 'founders', 'funding', 'career', 'layoff', 'layoffs',
      'hiring', 'salary', 'compensation', 'venture', 'vc', 'vcs', 'acquisition', 'talent',
      'employee', 'shares', 'roundtable', 'valuation', 'product-market fit', 'chief operating officer'
    ]
    const secKws = [
      'vulnerability', 'cve', 'zero-day', 'exploit', 'malware', 'ransomware', 'cyber', 'security',
      'patch', 'breach', 'encryption', 'bug bounty', 'auth', 'phishing', 'firewall', 'pentest',
      'attack', 'hacked', 'hack', 'hijack', 'tls', 'certificate', 'ssh', 'tor'
    ]
    const cloudKws = [
      'aws', 'gcp', 'azure', 'cloud', 'kubernetes', 'k8s', 'docker',
      'serverless', 'database', 'postgres', 'postgresql', 'redis', 'kafka', 'distributed',
      's3', 'infra', 'devops', 'ci/cd', 'terraform', 'microservices', 'storage', 'sqlite'
    ]
    const aimlKws = [
      'ai', 'llm', 'gpt', 'gemini', 'claude', 'deepseek', 'openai', 'anthropic', 'transformer',
      'machine learning', 'deep learning', 'neural', 'diffusion', 'inference', 'weights',
      'fine-tuning', 'rlhf', 'rag', 'agentic', 'langchain', 'huggingface', 'model',
      'computer vision', 'nlp', 'embedding', 'vector', 'kimi'
    ]
    const seKws = [
      'typescript', 'javascript', 'python', 'rust', 'golang', 'react', 'nextjs', 'vue', 'node',
      'compiler', 'framework', 'library', 'api', 'graphql', 'rest', 'git', 'github',
      'architecture', 'refactor', 'frontend', 'backend', 'full-stack', 'open source',
      'webassembly', 'v8', 'performance', 'debugging', 'testing', 'source code', 'multiplexer',
      'terminal', 'shipping', 'uuid', 'systemd', 'container', 'containers'
    ]

    const hasMatch = (kws: string[]) =>
      kws.some((k) => new RegExp('\\b' + escapeRegExp(k) + '\\b', 'i').test(text))

    if (hasMatch(careerKws)) {
      cat = 'career-industry'
    } else if (hasMatch(secKws)) {
      cat = 'security'
    } else if (hasMatch(cloudKws)) {
      cat = 'data-cloud'
    } else if (hasMatch(aimlKws)) {
      cat = 'ai-ml'
    } else if (hasMatch(seKws)) {
      cat = 'software-engineering'
    }
  }

  return {
    ...art,
    category: cat,
  }
}

export function useDailyNews(options: UseDailyNewsOptions = {}) {
  const { category = 'all', searchQuery = '', sortBy = 'relevant' } = options

  const articles = useMemo<FeedArticle[]>(() => {
    const raw = (initialFeedData?.articles as FeedArticle[]) || []
    return raw.map(normalizeArticleCategory)
  }, [])
  const [loading] = useState(false)
  const [lastUpdated] = useState<string>(
    () => initialFeedData?.lastUpdated || new Date().toISOString()
  )

  // Compute dynamic counts per category from actual article data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: articles.length,
      'ai-ml': 0,
      'software-engineering': 0,
      'data-cloud': 0,
      security: 0,
      'career-industry': 0,
      'general-tech': 0,
    }

    articles.forEach((art) => {
      if (counts[art.category] !== undefined) {
        counts[art.category]++
      } else {
        counts[art.category] = 1
      }
    })

    return counts
  }, [articles])

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let result = articles.filter((art) => {
      // Category filter
      if (category !== 'all' && art.category !== category) {
        return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = (art.title || '').toLowerCase().includes(q)
        const matchDesc = (art.description || '').toLowerCase().includes(q)
        const matchWhy = (art.enrichment.whyItMatters || '').toLowerCase().includes(q)
        const matchSource = (art.sourceName || '').toLowerCase().includes(q)
        const matchTags = (art.subTags || []).some((tag) => tag.toLowerCase().includes(q))
        const matchSkills = (art.enrichment.extractedSkills || []).some((s) =>
          s.toLowerCase().includes(q)
        )

        return matchTitle || matchDesc || matchWhy || matchSource || matchTags || matchSkills
      }

      return true
    })

    // Sort articles
    result = [...result].sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      }
      if (sortBy === 'impact') {
        return (b.scores?.significance || 0) - (a.scores?.significance || 0)
      }
      // 'relevant' = multi-signal composite score
      return (b.scores?.composite || 0) - (a.scores?.composite || 0)
    })

    return result
  }, [articles, category, searchQuery, sortBy])

  return {
    articles: filteredArticles,
    allArticlesCount: articles.length,
    categoryCounts,
    loading,
    lastUpdated,
  }
}
