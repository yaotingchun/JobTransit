import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Newspaper,
  BarChart3,
  CheckCircle2,
  X,
  Clock,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'
import type { NavTab, UserProfile } from '../Navbar'
import { WeeklySummaryReport } from './WeeklySummaryReport'
import { useDailyNews } from '../../hooks/useDailyNews'

interface CatchupTabProps {
  currentUser: UserProfile
  onSelectTab: (tab: NavTab) => void
  onLogout?: () => void
}

// Visual SVG Thumbnail Artworks matching the second image
const AIBrainThumbnail = () => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 border border-sky-500/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
    <div className="absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent pointer-events-none" />
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" fill="none" stroke="currentColor" strokeWidth="1.8">
      {/* AI Glowing Neural Brain */}
      <path d="M24 10C16 10 12 15 12 21C12 26 15 29 18 31V37C18 38.1 18.9 39 20 39H28C29.1 39 30 38.1 30 37V31C33 29 36 26 36 21C36 15 32 10 24 10Z" stroke="currentColor" strokeLinejoin="round" />
      <path d="M24 10V39" stroke="currentColor" strokeDasharray="2 2" opacity="0.6" />
      <circle cx="24" cy="18" r="2.5" fill="#38bdf8" />
      <circle cx="18" cy="23" r="2" fill="#818cf8" />
      <circle cx="30" cy="23" r="2" fill="#818cf8" />
      <circle cx="21" cy="30" r="1.5" fill="#38bdf8" />
      <circle cx="27" cy="30" r="1.5" fill="#38bdf8" />
      <line x1="24" y1="18" x2="18" y2="23" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7" />
      <line x1="24" y1="18" x2="30" y2="23" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7" />
      <line x1="18" y1="23" x2="21" y2="30" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7" />
      <line x1="30" y1="23" x2="27" y2="30" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7" />
    </svg>
    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-400/20 blur-md pointer-events-none" />
  </div>
)

const CodeEditorThumbnail = () => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
    <div className="absolute inset-0 bg-radial from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
    <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]" fill="none">
      {/* IDE Window Frame */}
      <rect x="8" y="10" width="32" height="28" rx="4" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
      <circle cx="13" cy="15" r="1.5" fill="#f43f5e" />
      <circle cx="18" cy="15" r="1.5" fill="#eab308" />
      <circle cx="23" cy="15" r="1.5" fill="#10b981" />
      <line x1="8" y1="19" x2="40" y2="19" stroke="#334155" strokeWidth="1" />
      {/* Code Lines */}
      <line x1="13" y1="24" x2="22" y2="24" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="24" x2="33" y2="24" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="28" x2="28" y2="28" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="32" x2="24" y2="32" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
      <rect x="26" y="31" width="2" height="4" fill="#ffffff" className="animate-pulse" />
    </svg>
    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500/20 blur-md pointer-events-none" />
  </div>
)

const CloudDatabaseThumbnail = () => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 border border-sky-400/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
    <div className="absolute inset-0 bg-radial from-sky-500/20 via-transparent to-transparent pointer-events-none" />
    <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]" fill="none">
      {/* Cloud Outline */}
      <path d="M35 24C37.8 24 40 21.8 40 19C40 16.5 38.2 14.4 35.8 14.1C35.4 10.1 32 7 28 7C24.8 7 22.1 8.9 21 11.7C20.4 11.2 19.5 11 18.5 11C16 11 14 13 14 15.5C14 15.9 14.1 16.3 14.2 16.7C11.8 17.5 10 19.8 10 22.5C10 25.5 12.5 28 15.5 28H35" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Stacked Database Disks */}
      <ellipse cx="24" cy="27" rx="10" ry="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
      <path d="M14 27V32C14 33.66 18.48 35 24 35C29.52 35 34 33.66 34 32V27" stroke="#0ea5e9" strokeWidth="1.5" />
      <path d="M14 32V37C14 38.66 18.48 40 24 40C29.52 40 34 38.66 34 37V32" stroke="#0ea5e9" strokeWidth="1.5" />
      <circle cx="18" cy="27" r="0.8" fill="#38bdf8" />
      <circle cx="18" cy="32" r="0.8" fill="#38bdf8" />
      <circle cx="18" cy="37" r="0.8" fill="#38bdf8" />
    </svg>
    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-400/20 blur-md pointer-events-none" />
  </div>
)

const CyberShieldThumbnail = () => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-400/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
    <div className="absolute inset-0 bg-radial from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
    <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]" fill="none">
      {/* Cyber Shield with Keyhole */}
      <path d="M24 8L12 13V22C12 30 17 37 24 40C31 37 36 30 36 22V13L24 8Z" fill="#064e3b" stroke="#34d399" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Inner Lock */}
      <rect x="20" y="23" width="8" height="7" rx="1.5" fill="#10b981" />
      <path d="M22 23V20C22 18.9 22.9 18 24 18C25.1 18 26 18.9 26 20V23" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="26" r="1" fill="#064e3b" />
    </svg>
    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400/20 blur-md pointer-events-none" />
  </div>
)

const SystemsThumbnail = () => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950 border border-purple-400/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
    <div className="absolute inset-0 bg-radial from-purple-500/20 via-transparent to-transparent pointer-events-none" />
    <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]" fill="none">
      <circle cx="24" cy="24" r="5" fill="#a855f7" />
      <ellipse cx="24" cy="24" rx="14" ry="6" stroke="#c084fc" strokeWidth="1.5" transform="rotate(30 24 24)" />
      <ellipse cx="24" cy="24" rx="14" ry="6" stroke="#c084fc" strokeWidth="1.5" transform="rotate(-30 24 24)" />
    </svg>
  </div>
)

const CareerTrendThumbnail = () => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 border border-amber-400/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
    <div className="absolute inset-0 bg-radial from-amber-500/20 via-transparent to-transparent pointer-events-none" />
    <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" fill="none">
      <path d="M10 34L20 24L28 30L38 14" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="24" r="2.5" fill="#f59e0b" />
      <circle cx="28" cy="30" r="2.5" fill="#f59e0b" />
      <circle cx="38" cy="14" r="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
    </svg>
  </div>
)

// Featured Landscape Artwork for Lead Story (Matching Image 2 wind turbines & clean-tech energy landscape)
const HeroStoryArtwork = () => (
  <div className="w-full md:w-72 lg:w-84 h-48 sm:h-56 rounded-xl overflow-hidden relative shadow-sm shrink-0 border border-slate-200/80 group/art select-none">
    <svg viewBox="0 0 400 250" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#65a30d" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#3f6212" />
        </linearGradient>
      </defs>

      {/* Clear Blue Sky */}
      <rect width="400" height="250" fill="url(#skyGrad)" />

      {/* Editorial Soft Clouds */}
      <path d="M40 70 Q60 50 90 65 Q120 50 150 70 Q160 85 140 90 Q80 95 40 70 Z" fill="#ffffff" opacity="0.65" />
      <path d="M260 55 Q280 40 310 50 Q340 35 370 55 Q380 70 360 75 Q300 80 260 55 Z" fill="#ffffff" opacity="0.55" />

      {/* Far Mountains */}
      <path d="M0 160 Q80 120 180 150 Q280 110 400 145 L400 250 L0 250 Z" fill="url(#hillFar)" opacity="0.38" />

      {/* Mid Hills */}
      <path d="M0 175 Q120 140 240 170 Q320 150 400 165 L400 250 L0 250 Z" fill="url(#hillMid)" opacity="0.85" />

      {/* Foreground Hills */}
      <path d="M0 205 Q140 170 280 195 Q340 185 400 200 L400 250 L0 250 Z" fill="url(#hillNear)" />

      {/* Wind Turbine 1 (Main Foreground Center-Right matching Image 2) */}
      <g transform="translate(260, 48)">
        <line x1="0" y1="125" x2="0" y2="0" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="0" r="3.5" fill="#f8fafc" />
        <line x1="0" y1="0" x2="0" y2="-45" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="39" y2="22.5" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-39" y2="22.5" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Wind Turbine 2 (Mid-ground Left) */}
      <g transform="translate(160, 95)">
        <line x1="0" y1="80" x2="0" y2="0" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2.5" fill="#f8fafc" />
        <line x1="0" y1="0" x2="0" y2="-30" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="0" x2="26" y2="15" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-26" y2="15" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Wind Turbine 3 (Far background Right) */}
      <g transform="translate(340, 105)">
        <line x1="0" y1="70" x2="0" y2="0" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2" fill="#f8fafc" />
        <line x1="0" y1="0" x2="0" y2="-22" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="0" y1="0" x2="19" y2="11" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-19" y2="11" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Wind Turbine 4 (Far Left) */}
      <g transform="translate(75, 120)">
        <line x1="0" y1="65" x2="0" y2="0" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.8" fill="#f8fafc" />
        <line x1="0" y1="0" x2="0" y2="-18" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="15" y2="9" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-15" y2="9" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  </div>
)

function getCategoryColor(catSlug: string): { text: string; bg: string; border: string } {
  switch (catSlug) {
    case 'ai-ml':
      return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    case 'software-engineering':
      return { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
    case 'data-cloud':
      return { text: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' }
    case 'security':
      return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    case 'career-industry':
      return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
    default:
      return { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
  }
}

interface NewsItem {
  id: string
  category: string
  categorySlug: string
  subTag: string
  timestamp: string
  title: string
  description: string
  source: string
  sourceUrl: string
  whyItMatters: string | null
  confidence?: 'high' | 'medium' | 'low'
  skills: string[]
  thumbnail: React.ComponentType
  isWeeklySummary?: boolean
  relatedSources?: { name: string; url: string; articleId?: string }[]
  scores?: {
    composite: number
    recency: number
    significance: number
    careerRelevance: number
    sourceAuthority: number
  }
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
  } catch {
    return 'Recent'
  }
}

function getCategoryThumbnail(catSlug: string): React.ComponentType {
  switch (catSlug) {
    case 'ai-ml':
      return AIBrainThumbnail
    case 'software-engineering':
      return CodeEditorThumbnail
    case 'data-cloud':
      return CloudDatabaseThumbnail
    case 'security':
      return CyberShieldThumbnail
    case 'career-industry':
      return CareerTrendThumbnail
    default:
      return SystemsThumbnail
  }
}

const CATEGORY_NAMES: Record<string, string> = {
  'ai-ml': 'AI & Machine Learning',
  'software-engineering': 'Software Engineering',
  'data-cloud': 'Data & Cloud',
  'security': 'Cybersecurity',
  'career-industry': 'Industry & Careers',
  'general-tech': 'General Tech',
}

const CURRENT_DATE_STR = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

const CURRENT_DAY_OF_WEEK = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
}).format(new Date())

export const CatchupTab: React.FC<CatchupTabProps> = ({
  currentUser,
  onSelectTab,
}) => {
  const [viewMode, setViewMode] = useState<'today' | 'weekly'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [sortBy, setSortBy] = useState<'latest' | 'relevant' | 'impact'>('relevant')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['openai-gpt-51']))
  const [activeArticleModal, setActiveArticleModal] = useState<NewsItem | null>(null)
  const [savedSkillAlert, setSavedSkillAlert] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(5)

  // Live feed hook with multi-signal ranking, deduplication, and topic filtering
  const {
    articles: liveArticles,
    categoryCounts,
    allArticlesCount,
  } = useDailyNews({
    category: selectedTopic,
    searchQuery,
    sortBy,
  })

  // Dynamic topic filters with live counts
  const topicFilters = useMemo(
    () => [
      { id: 'all', label: 'All Topics', count: allArticlesCount, dotColor: 'bg-slate-950' },
      { id: 'ai-ml', label: 'AI & ML', count: categoryCounts['ai-ml'] || 0, dotColor: 'bg-blue-500' },
      { id: 'software-engineering', label: 'Software Engineering', count: categoryCounts['software-engineering'] || 0, dotColor: 'bg-sky-500' },
      { id: 'data-cloud', label: 'Data & Cloud', count: categoryCounts['data-cloud'] || 0, dotColor: 'bg-slate-700' },
      { id: 'security', label: 'Cybersecurity', count: categoryCounts['security'] || 0, dotColor: 'bg-indigo-500' },
      { id: 'career-industry', label: 'Industry & Careers', count: categoryCounts['career-industry'] || 0, dotColor: 'bg-rose-500' },
      { id: 'general-tech', label: 'General Tech', count: categoryCounts['general-tech'] || 0, dotColor: 'bg-purple-500' },
    ],
    [allArticlesCount, categoryCounts]
  )

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Convert live feed articles to NewsItem interface
  const liveHeadlines: NewsItem[] = useMemo(() => {
    return liveArticles.map((art) => ({
      id: art.id,
      category: CATEGORY_NAMES[art.category] || 'General Tech',
      categorySlug: art.category,
      subTag: art.subTags?.[0] || 'Tech',
      timestamp: formatRelativeTime(art.publishedAt),
      title: art.cleanedTitle || art.title,
      description: art.description,
      source: art.sourceName,
      sourceUrl: art.link,
      whyItMatters: art.enrichment?.whyItMatters || null,
      confidence: art.enrichment?.confidence,
      skills: art.enrichment?.extractedSkills?.length ? art.enrichment.extractedSkills : art.subTags,
      thumbnail: getCategoryThumbnail(art.category),
      relatedSources: (art.relatedSources || []).map((r) => ({
        name: r.sourceName,
        url: r.link,
        articleId: r.articleId,
      })),
      scores: art.scores,
    }))
  }, [liveArticles])

  // Filter headlines based on live articles and active topic
  const filteredHeadlines = useMemo(() => {
    if (selectedTopic === 'all') return liveHeadlines
    return liveHeadlines.filter((item) => item.categorySlug === selectedTopic)
  }, [liveHeadlines, selectedTopic])

  // Reset pagination count whenever topic or search query changes
  useEffect(() => {
    setDisplayCount(5)
  }, [selectedTopic, searchQuery])

  const handleSkillClick = (skill: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedSkillAlert(skill)
    setTimeout(() => {
      setSavedSkillAlert(null)
    }, 2800)
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">

      {/* VIEW SWITCHER PILLS (Today's News vs Weekly Summary) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewMode('today')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shadow-sm ${viewMode === 'today'
            ? 'bg-slate-950 text-white shadow-slate-950/25 shadow-md border border-slate-900 scale-[1.02]'
            : 'bg-white/50 hover:bg-white/75 text-slate-700 hover:text-slate-950 backdrop-blur-xl border border-white/75 shadow-xs'
            }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Today's News</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('weekly')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shadow-sm ${viewMode === 'weekly'
            ? 'bg-slate-950 text-white shadow-slate-950/25 shadow-md border border-slate-900 scale-[1.02]'
            : 'bg-white/50 hover:bg-white/75 text-slate-700 hover:text-slate-950 backdrop-blur-xl border border-white/75 shadow-xs'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Weekly Summary</span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-2xs">
            5-Min Flash
          </span>
        </button>
      </div>

      {viewMode === 'today' ? (
        <>
          {/* SEARCH BAR (Clean, modern rounded input) */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technologies, topics, or companies..."
              className="w-full h-11 pl-11 pr-10 rounded-xl bg-white border border-slate-200/90 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AUTHENTIC NEWSPAPER BROADSHEET LAYOUT (Matching Image 2) */}
          <div className="relative w-full max-w-5xl mx-auto my-3">
            {/* Stacked Paper Shadow Layer 3 (Background paper sheet tilt) */}
            <div className="absolute inset-0 bg-[#ebe7dc] rounded-2xl sm:rounded-3xl rotate-[-0.6deg] translate-y-3.5 translate-x-[-3px] border border-stone-300/80 shadow-sm pointer-events-none" />
            {/* Stacked Paper Shadow Layer 2 (Middle paper sheet tilt) */}
            <div className="absolute inset-0 bg-[#f4f1e8] rounded-2xl sm:rounded-3xl rotate-[0.4deg] translate-y-1.5 translate-x-[2px] border border-stone-300/90 shadow-md pointer-events-none" />

            {/* Main Front Broadsheet Page */}
            <div className="relative bg-[#faf8f4] border border-stone-300/90 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-9 md:p-12 space-y-7 text-stone-900 overflow-hidden">

              {/* TOP MASTHEAD (Matching Image 2: "THE DAILY BRIEF", Date on top right, "TODAY'S NEWS" kicker) */}
              <div className="space-y-3">
                {/* Top Bar: Kicker + Date */}
                <div className="flex items-start justify-between border-b border-stone-200/80 pb-2">
                  <div className="text-[11px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest">
                    Today's News
                  </div>
                  <div className="text-right text-[11px] sm:text-xs font-serif font-medium text-stone-600 leading-tight">
                    <div>{CURRENT_DATE_STR}</div>
                    <div className="text-stone-400 font-sans text-[10px] sm:text-[11px]">{CURRENT_DAY_OF_WEEK}</div>
                  </div>
                </div>

                {/* Main Newspaper Masthead Title Banner */}
                <div className="text-center pt-1 pb-1">
                  <h1 className="font-newspaper-masthead text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-wider uppercase drop-shadow-2xs">
                    The Daily Brief
                  </h1>
                  <div className="flex items-center justify-center gap-2 pt-1.5">
                    <span className="font-hero text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wider">
                      {viewMode === 'today' ? "Today's Headlines" : "Weekly Executive Syntheses"}
                    </span>
                    <span className="text-xs sm:text-sm font-normal text-stone-500">
                      ({filteredHeadlines.length} {filteredHeadlines.length === 1 ? 'brief' : 'briefs'})
                    </span>
                  </div>
                </div>

                {/* Double Horizontal Rule (Classic Broadsheet divider) */}
                <div className="border-t-2 border-b border-stone-800/80 my-3 py-2">
                  {/* Category Navigation Bar & Sort Dropdown */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs uppercase tracking-wider font-semibold">
                      {topicFilters.map((topic, idx) => {
                        const isSelected = selectedTopic === topic.id
                        return (
                          <React.Fragment key={topic.id}>
                            {idx > 0 && <span className="text-stone-300 font-normal select-none">·</span>}
                            <button
                              type="button"
                              onClick={() => setSelectedTopic(topic.id)}
                              className={`transition-colors cursor-pointer inline-flex items-center gap-1.5 pb-0.5 shrink-0 ${isSelected
                                  ? 'font-bold text-blue-700 underline underline-offset-4 decoration-2'
                                  : 'font-medium text-stone-600 hover:text-stone-950'
                                }`}
                            >
                              <span>{topic.label}</span>
                              <span
                                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center ${isSelected
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-stone-200/80 text-stone-600'
                                  }`}
                              >
                                {topic.count}
                              </span>
                            </button>
                          </React.Fragment>
                        )
                      })}
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="relative inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 shrink-0 self-end lg:self-auto">
                      <span>Sort by:</span>
                      <div className="relative inline-flex items-center">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'latest' | 'relevant' | 'impact')}
                          className="appearance-none bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md pl-2 pr-6 py-1 text-xs font-semibold text-stone-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors"
                        >
                          <option value="latest">Latest</option>
                          <option value="relevant">Most Relevant</option>
                          <option value="impact">Highest Impact</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-1.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ARTICLES CONTENT SECTION */}
              {filteredHeadlines.length === 0 ? (
                <div className="rounded-2xl bg-stone-100/70 p-12 text-center space-y-3 border border-stone-200">
                  <Search className="w-8 h-8 text-stone-400 mx-auto" />
                  <h3 className="font-hero text-base font-bold text-stone-800">
                    No matching headlines found
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try adjusting your search terms or select another category like "All Topics".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedTopic('all')
                    }}
                    className="px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-semibold shadow-sm hover:bg-stone-800 cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* 1. LEAD STORY (Featured top story in Blue-bordered box matching Image 2) */}
                  {filteredHeadlines[0] && (() => {
                    const lead = filteredHeadlines[0]
                    const isBookmarked = bookmarkedIds.has(lead.id)
                    return (
                      <div className="border border-blue-300/80 rounded-2xl bg-blue-50/25 p-5 sm:p-7 relative transition-all group shadow-2xs">
                        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">

                          {/* Left: Lead Story Text */}
                          <div className="flex-1 space-y-3">
                            {/* Category Kicker */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                {lead.categorySlug.toUpperCase().replace('-', ' ')}
                              </span>
                            </div>

                            {/* Headline Title Link */}
                            <div className="flex items-start justify-between gap-3">
                              <a
                                href={lead.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-newspaper-headline text-xl sm:text-2xl font-black text-slate-900 hover:text-blue-700 transition-colors leading-tight group/link flex items-start gap-1.5"
                                title="Open verified original article in new tab"
                              >
                                <span>{lead.title}</span>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover/link:text-blue-700 transition-colors shrink-0 mt-1" />
                              </a>
                            </div>

                            {/* Description Summary */}
                            <p
                              onClick={() => setActiveArticleModal(lead)}
                              className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal cursor-pointer"
                            >
                              {lead.description}
                            </p>

                            {/* Why It Matters Callout (Evidence-Gated) */}
                            {lead.whyItMatters && (
                              <div className="p-3.5 rounded-lg border-l-4 border-blue-600 bg-white/70 space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span>Why it matters</span>
                                    {lead.confidence === 'medium' && (
                                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                                        (based on available text)
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => toggleBookmark(lead.id, e)}
                                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${isBookmarked
                                        ? 'text-blue-700 bg-blue-100/70 hover:bg-blue-200/70'
                                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'
                                      }`}
                                    title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
                                  >
                                    {isBookmarked ? (
                                      <BookmarkCheck className="w-4 h-4 fill-blue-600 text-blue-600" />
                                    ) : (
                                      <Bookmark className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                  {lead.whyItMatters}
                                </p>
                                {/* Skills Tags */}
                                {lead.skills && lead.skills.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {lead.skills.map((skill) => (
                                      <button
                                        key={skill}
                                        type="button"
                                        onClick={(e) => handleSkillClick(skill, e)}
                                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                                      >
                                        {skill}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Metadata Row */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                              <span className="font-medium text-slate-600">Source ·</span>
                              <a
                                href={lead.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-700 hover:text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5"
                              >
                                <span>{lead.source}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3" />
                                {lead.timestamp}
                              </span>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() => setActiveArticleModal(lead)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100/80 hover:bg-blue-200/80 text-blue-800 cursor-pointer shadow-2xs transition-colors"
                              >
                                <Sparkles className="w-3 h-3 text-blue-600" />
                                <span>AI Brief</span>
                              </button>
                            </div>
                          </div>

                          {/* Right: Landscape Hero Artwork + Circular Action Button matching Image 2 */}
                          <div className="flex flex-col items-end gap-3 self-center md:self-stretch justify-between w-full md:w-auto">
                            <HeroStoryArtwork />
                            <button
                              type="button"
                              onClick={() => setActiveArticleModal(lead)}
                              className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-900 text-slate-700 hover:text-white shadow-sm flex items-center justify-center transition-all cursor-pointer self-end shrink-0"
                              title="View Briefing & Career Transit Details"
                              aria-label="View Briefing"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    )
                  })()}

                  {/* 2. SECONDARY STORIES (2-COLUMN GRID matching Image 2 layout) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    {filteredHeadlines.slice(1, displayCount).map((item) => {
                      const isBookmarked = bookmarkedIds.has(item.id)
                      const ThumbnailComponent = item.thumbnail
                      const catColor = getCategoryColor(item.categorySlug)

                      return (
                        <article
                          key={item.id}
                          className="p-5 rounded-2xl border border-stone-200/90 bg-white/70 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group relative"
                        >
                          <div className="space-y-3">
                            {/* Top Row: Category Kicker */}
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] font-bold uppercase tracking-wider ${catColor.text}`}>
                                {item.categorySlug.toUpperCase().replace('-', ' ')}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => toggleBookmark(item.id, e)}
                                className={`p-1 rounded-full transition-colors cursor-pointer ${isBookmarked
                                    ? 'text-blue-700 bg-blue-100/70 hover:bg-blue-200/70'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                  }`}
                                title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Headline Title & Square Thumbnail Row */}
                            <div className="flex items-start justify-between gap-3">
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-newspaper-headline text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-3 group/link flex items-start gap-1"
                                title="Open verified original article in new tab"
                              >
                                <span>{item.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 group-hover/link:text-blue-600 shrink-0 mt-1" />
                              </a>
                              {/* Visual Thumbnail Artwork */}
                              <div className="shrink-0 cursor-pointer" onClick={() => setActiveArticleModal(item)}>
                                <ThumbnailComponent />
                              </div>
                            </div>

                            {/* Description Paragraph */}
                            <p
                              onClick={() => setActiveArticleModal(item)}
                              className="text-xs sm:text-[13px] text-slate-600 line-clamp-3 leading-relaxed font-normal cursor-pointer"
                            >
                              {item.description}
                            </p>

                            {/* Evidence-Gated Why It Matters (if present) */}
                            {item.whyItMatters && (
                              <div className="p-2.5 rounded-lg border-l-2 border-blue-500 bg-slate-50/80 space-y-1">
                                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
                                  <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span>Why it matters</span>
                                </div>
                                <p className="text-[11px] text-slate-700 leading-normal line-clamp-2">
                                  {item.whyItMatters}
                                </p>
                              </div>
                            )}

                            {/* Skill Badges */}
                            {item.skills && item.skills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                {item.skills.slice(0, 3).map((skill) => (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={(e) => handleSkillClick(skill, e)}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 hover:bg-slate-900 hover:text-white text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                                  >
                                    {skill}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Metadata on Left, Circular Button on Right matching Image 2 */}
                          <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-100">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <span className="text-slate-400">Source ·</span>
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-700 hover:text-blue-600 hover:underline max-w-[100px] truncate"
                              >
                                {item.source}
                              </a>
                              <span>·</span>
                              <span>{item.timestamp}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveArticleModal(item)}
                              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-colors cursor-pointer shrink-0"
                              title="View AI Brief"
                              aria-label="View AI Brief"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  {/* Load More Button if more briefs exist */}
                  {filteredHeadlines.length > displayCount && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setDisplayCount((prev) => prev + 6)}
                        className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>Showing {displayCount} of {filteredHeadlines.length} briefs — Load More Headlines</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* DOUBLE RULE & BOTTOM FOOTER (Matching Image 2: "STAY INFORMED  ·  STAY AHEAD") */}
              <div className="pt-4 border-t border-stone-300">
                <div className="border-t-2 border-stone-800/80 pt-4 text-center">
                  <p className="text-xs sm:text-sm font-newspaper-masthead font-black tracking-[0.25em] text-stone-700 uppercase">
                    STAY INFORMED &nbsp;·&nbsp; STAY AHEAD
                  </p>
                </div>
              </div>

            </div>
          </div>
        </>
      ) : (
        <WeeklySummaryReport
          currentUser={currentUser}
          onSelectTab={onSelectTab}
          onSkillClick={handleSkillClick}
          liveArticles={liveHeadlines}
        />
      )}

      {/* SKILL NOTIFICATION TOAST */}
      {savedSkillAlert && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-white/90 backdrop-blur-2xl p-3.5 px-5 border border-slate-900/10 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <div className="text-xs text-slate-900">
            Added <span className="font-bold text-slate-950">"{savedSkillAlert}"</span> to your active transit track!
          </div>
        </div>
      )}

      {/* ARTICLE INTELLIGENCE BRIEFING MODAL */}
      {activeArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
            onClick={() => setActiveArticleModal(null)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-white/75 backdrop-blur-3xl p-6 sm:p-8 border border-white/90 shadow-[0_25px_60px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,1)] z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Top row */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-950 text-white border border-slate-900 backdrop-blur-sm shadow-2xs">
                  {activeArticleModal.category}
                </span>
                <span className="text-xs text-slate-500">{activeArticleModal.timestamp}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => toggleBookmark(activeArticleModal.id, e)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Bookmark"
                >
                  {bookmarkedIds.has(activeArticleModal.id) ? (
                    <BookmarkCheck className="w-4 h-4 fill-slate-950 text-slate-950" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArticleModal(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="font-hero text-xl sm:text-2xl font-bold text-slate-950 leading-snug">
                {activeArticleModal.title}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {activeArticleModal.description}
              </p>
            </div>

            {/* Why It Matters Callout Card (Evidence-Gated) */}
            {activeArticleModal.whyItMatters && (
              <div className="p-4 rounded-2xl bg-white/55 border border-white/80 backdrop-blur-md shadow-2xs space-y-1.5">
                <div className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                  Career Route Impact
                  {activeArticleModal.confidence === 'medium' && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      (based on available text)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeArticleModal.whyItMatters}
                </p>
              </div>
            )}

            {/* Associated transit skills */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">
                Targeted Skills for Transit Readiness
              </div>
              <div className="flex flex-wrap gap-2">
                {activeArticleModal.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-slate-950" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-200/50">
              <a
                href={activeArticleModal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1.5"
              >
                <span>Read original on {activeArticleModal.source}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('transit')
                  setActiveArticleModal(null)
                }}
                className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Add to My Learning Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
