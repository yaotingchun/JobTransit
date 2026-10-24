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
  Radio,
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

// Featured Landscape Artwork for Lead Story (Fallback SVG)
const WindTurbinesHeroArtwork = () => (
  <div className="w-full h-full overflow-hidden relative group/art select-none">
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

      {/* Wind Turbines */}
      <g transform="translate(260, 48)">
        <line x1="0" y1="125" x2="0" y2="0" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="0" r="3.5" fill="#f8fafc" />
        <line x1="0" y1="0" x2="0" y2="-45" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="39" y2="22.5" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-39" y2="22.5" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform="translate(160, 95)">
        <line x1="0" y1="80" x2="0" y2="0" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2.5" fill="#f8fafc" />
        <line x1="0" y1="0" x2="0" y2="-30" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="0" x2="26" y2="15" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-26" y2="15" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  </div>
)

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Curated high-resolution Unsplash images mapped to tech engineering domains
const CATEGORY_IMAGE_SETS: Record<string, string[]> = {
  'software-engineering': [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&auto=format&fit=crop&q=80', // code editor
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&auto=format&fit=crop&q=80', // code monitor
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80', // laptop code
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&auto=format&fit=crop&q=80', // matrix code
  ],
  'data-cloud': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&auto=format&fit=crop&q=80', // global cloud network
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&auto=format&fit=crop&q=80', // cloud server rack
    'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=700&auto=format&fit=crop&q=80', // datacenter corridor
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&auto=format&fit=crop&q=80', // server racks
  ],
  'security': [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&auto=format&fit=crop&q=80', // cyber security lock matrix
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&auto=format&fit=crop&q=80', // cyber shield network
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&auto=format&fit=crop&q=80', // digital matrix
  ],
  'ai-ml': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&auto=format&fit=crop&q=80', // AI neural brain network
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=700&auto=format&fit=crop&q=80', // deep learning nodes
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80', // synthetic intelligence waves
  ],
  'career-industry': [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80', // tech executive workspace
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80', // engineering collaboration
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&auto=format&fit=crop&q=80', // modern tech team
  ],
  'general-tech': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop&q=80', // microchip silicon wafer
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&auto=format&fit=crop&q=80', // digital circuit
  ],
}

function getArticleImageUrl(item: { id?: string; title?: string; categorySlug?: string; subTag?: string }): string {
  const text = `${item.title || ''} ${item.subTag || ''}`.toLowerCase()

  // 1. High-Precision Story Overrides matching known feed topics
  if (text.includes('cloudflare') || text.includes('ram') || text.includes('consistent hashing') || text.includes('hashing') || text.includes('pingora')) {
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
  }
  if (text.includes('daytona') || text.includes('agent cloud') || text.includes('perplextity') || text.includes('datadog')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80'
  }
  if (text.includes('csiro') || text.includes('genomic') || text.includes('beacon') || (text.includes('aws') && text.includes('athena'))) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
  }
  if (text.includes('lambda') || text.includes('node') || text.includes('express') || text.includes('hono') || text.includes('functions')) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
  }
  if (text.includes('popcorn time') || text.includes('rce') || text.includes('vulnerab') || text.includes('attack') || text.includes('malware') || text.includes('flaw')) {
    return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
  }

  // General keyword matches
  if (text.includes('security') || text.includes('cyber') || text.includes('hack') || text.includes('breach')) {
    return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
  }
  if (text.includes(' ai') || text.includes('llm') || text.includes('agent') || text.includes('gpt') || text.includes('neural') || text.includes('model')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80'
  }
  if (text.includes('aws') || text.includes('cloud') || text.includes('server') || text.includes('database') || text.includes('s3') || text.includes('cluster')) {
    return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80'
  }
  if (text.includes('rust') || text.includes('code') || text.includes('typescript') || text.includes('react') || text.includes('python') || text.includes('dev')) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
  }

  // 2. Category Fallback with Deterministic Distribution
  const cat = item.categorySlug || 'general-tech'
  const list = CATEGORY_IMAGE_SETS[cat] || CATEGORY_IMAGE_SETS['general-tech']
  const idx = hashString(item.id || item.title || 'article') % list.length
  return list[idx]
}

// Relevant Online Photography Artwork for Lead Story with graceful SVG fallback
const HeroStoryArtwork = ({ item }: { item?: NewsItem }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const imageUrl = item?.imageUrl || (item ? getArticleImageUrl(item) : 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80')

  return (
    <div className="w-full md:w-72 lg:w-84 h-48 sm:h-56 rounded-xl overflow-hidden relative shadow-sm shrink-0 border border-stone-200/90 group/art select-none bg-stone-900">
      {!imgFailed ? (
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={item?.title || 'Lead story visual'}
            className="w-full h-full object-cover group-hover/art:scale-105 transition-transform duration-500"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/10 to-transparent pointer-events-none" />
          {item?.category && (
            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-xs text-[10px] font-mono-board font-black text-amber-300 uppercase tracking-wider border border-white/10 shadow-xs">
              {item.categorySlug.toUpperCase().replace('-', ' ')}
            </div>
          )}
        </div>
      ) : (
        <WindTurbinesHeroArtwork />
      )}
    </div>
  )
}

// Relevant Online Photography Thumbnail for Secondary Story Cards with fallback
const ArticleThumbnailImage = ({ item, fallback: Fallback }: { item: NewsItem; fallback: React.ComponentType }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const imageUrl = item.imageUrl || getArticleImageUrl(item)

  if (imgFailed) {
    return <Fallback />
  }

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 relative border border-stone-200/90 shadow-2xs group-hover:scale-105 transition-transform duration-300 bg-stone-900">
      <img
        src={imageUrl}
        alt={item.title}
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-stone-950/10 pointer-events-none" />
    </div>
  )
}

export function getCategoryColor(catSlug: string): { text: string; bg: string; border: string } {
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
  imageUrl?: string
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
      imageUrl: getArticleImageUrl({
        id: art.id,
        title: art.cleanedTitle || art.title,
        categorySlug: art.category,
        subTag: art.subTags?.[0],
      }),
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

      {/* VIEW SWITCHER DOCK (Metro Line Control Style) */}
      <div className="inline-flex p-1.5 rounded-full bg-stone-950 border border-stone-800 shadow-md gap-2 font-mono-board">
        <button
          type="button"
          onClick={() => setViewMode('today')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
            viewMode === 'today'
              ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.02]'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Newspaper className="w-4 h-4 text-stone-950" />
          <span>Today's News</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('weekly')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
            viewMode === 'weekly'
              ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.02]'
              : 'text-stone-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Weekly Summary</span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-stone-950 text-amber-300 shadow-2xs">
            5-Min Flash
          </span>
        </button>
      </div>

      {viewMode === 'today' ? (
        <>
          {/* SEARCH BAR (Metro Radar Search Bar) */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technologies, topics, or companies..."
              className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white/95 border border-stone-300/90 text-sm font-mono-board font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[0_4px_16px_rgba(28,25,23,0.04)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* UNDERGROUND / METRO STATION TERMINAL BOARD */}
          <div className="relative rounded-[28px] sm:rounded-[32px] bg-white/95 backdrop-blur-md border border-stone-300/90 shadow-[0_16px_36px_rgba(28,25,23,0.06)] p-5 sm:p-9 space-y-7 text-stone-900 overflow-hidden font-sans">

            {/* TOP METRO STATION MASTHEAD */}
            <div className="space-y-4">
              {/* Telemetry Row: Live Beacon + Terminal Date Clock */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em] shadow-xs">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Today's News</span>
                </div>
                <div className="text-right font-mono-board text-[11px] sm:text-xs text-stone-600 font-bold">
                  <div>{CURRENT_DATE_STR}</div>
                  <div className="text-stone-400 text-[10px] tracking-wider uppercase">{CURRENT_DAY_OF_WEEK}</div>
                </div>
              </div>

              {/* Station Main Signage Title */}
              <div className="pt-1 pb-1">
                <h1 className="font-signage text-4xl sm:text-6xl md:text-7xl font-black text-stone-900 tracking-tight uppercase leading-none">
                  The Daily Brief
                </h1>
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-mono-board text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider">
                    {viewMode === 'today' ? "Today's Headlines" : "Weekly Executive Syntheses"}
                  </span>
                  <span className="font-mono-board text-xs sm:text-sm text-stone-500 font-medium">
                    ({filteredHeadlines.length} {filteredHeadlines.length === 1 ? 'brief' : 'briefs'})
                  </span>
                </div>
              </div>

              {/* Line Navigation & Filter Control Bar */}
              <div className="border-t border-b border-stone-200 py-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Category Lines Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono-board font-bold">
                    {topicFilters.map((topic) => {
                      const isSelected = selectedTopic === topic.id
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => setSelectedTopic(topic.id)}
                          className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 shadow-2xs active:scale-95 ${
                            isSelected
                              ? 'bg-stone-900 text-amber-300 shadow-xs border border-stone-900'
                              : 'bg-[#FAF7F0] hover:bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${topic.dotColor}`} />
                          <span>{topic.label}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${
                              isSelected
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {topic.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="relative inline-flex items-center gap-1.5 text-xs font-mono-board font-bold text-stone-500 shrink-0 self-end lg:self-auto">
                    <span>Sort by:</span>
                    <div className="relative inline-flex items-center">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'latest' | 'relevant' | 'impact')}
                        className="appearance-none bg-[#FAF7F0] hover:bg-stone-100 border-2 border-stone-200 rounded-xl pl-3 pr-7 py-1 text-xs font-mono-board font-bold text-stone-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors shadow-2xs"
                      >
                        <option value="latest">Latest</option>
                        <option value="relevant">Most Relevant</option>
                        <option value="impact">Highest Impact</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ARTICLES CONTENT SECTION */}
            {filteredHeadlines.length === 0 ? (
              <div className="rounded-2xl bg-[#FAF7F0] p-12 text-center space-y-3 border-2 border-stone-200 font-mono-board">
                <Search className="w-8 h-8 text-stone-400 mx-auto" />
                <h3 className="font-signage text-lg font-black text-stone-800 uppercase tracking-wide">
                  No matching headlines found
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans">
                  Try adjusting your search terms or select another category like "All Topics".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTopic('all')
                  }}
                  className="px-5 py-2 rounded-full bg-stone-900 text-amber-300 text-xs font-bold shadow-sm hover:bg-black cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">

                {/* 1. LEAD STORY (Station Flagship Departure Ticket) */}
                {filteredHeadlines[0] && (() => {
                  const lead = filteredHeadlines[0]
                  const isBookmarked = bookmarkedIds.has(lead.id)
                  return (
                    <div className="border-2 border-amber-300/80 rounded-[24px] bg-[#FAF7F0] p-5 sm:p-7 relative transition-all group shadow-xs">
                      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">

                        {/* Left: Lead Story Text */}
                        <div className="flex-1 space-y-3">
                          {/* Category Kicker */}
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-board font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-xs">
                              {lead.categorySlug.toUpperCase().replace('-', ' ')}
                            </span>
                          </div>

                          {/* Headline Title Link */}
                          <div className="flex items-start justify-between gap-3">
                            <a
                              href={lead.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-signage text-2xl sm:text-3xl font-black text-stone-900 hover:text-amber-600 transition-colors leading-tight group/link flex items-start gap-2 uppercase tracking-wide"
                              title="Open verified original article in new tab"
                            >
                              <span>{lead.title}</span>
                              <ExternalLink className="w-4 h-4 text-stone-400 group-hover/link:text-amber-600 transition-colors shrink-0 mt-1" />
                            </a>
                          </div>

                          {/* Description Summary */}
                          <p
                            onClick={() => setActiveArticleModal(lead)}
                            className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal cursor-pointer"
                          >
                            {lead.description}
                          </p>

                          {/* Why It Matters Callout (Evidence-Gated) */}
                          {lead.whyItMatters && (
                            <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-white border border-stone-200/90 space-y-1.5 shadow-2xs font-mono-board">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Why it matters</span>
                                  {lead.confidence === 'medium' && (
                                    <span className="text-[10px] text-stone-400 font-normal ml-1 lowercase font-sans">
                                      (based on available text)
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => toggleBookmark(lead.id, e)}
                                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                    isBookmarked
                                      ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                                  }`}
                                  title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
                                >
                                  {isBookmarked ? (
                                    <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                                  ) : (
                                    <Bookmark className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal font-sans">
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
                                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono-board font-bold bg-[#FAF7F0] hover:bg-amber-400 text-stone-900 hover:text-stone-950 border border-stone-300 shadow-2xs transition-all cursor-pointer"
                                    >
                                      {skill}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Metadata Row */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-board text-stone-500 pt-1">
                            <span className="font-bold text-stone-600">Source ·</span>
                            <a
                              href={lead.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-800 hover:text-amber-700 hover:underline font-bold inline-flex items-center gap-0.5"
                            >
                              <span>{lead.source}</span>
                              <ExternalLink className="w-3 h-3 text-stone-400" />
                            </a>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 text-stone-500">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {lead.timestamp}
                            </span>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => setActiveArticleModal(lead)}
                              className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-mono-board font-black bg-stone-900 hover:bg-black text-amber-300 cursor-pointer shadow-2xs transition-colors"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>AI Brief</span>
                            </button>
                          </div>
                        </div>

                        {/* Right: Landscape Hero Artwork + Circular Action Button */}
                        <div className="flex flex-col items-end gap-3 self-center md:self-stretch justify-between w-full md:w-auto">
                          <HeroStoryArtwork item={lead} />
                          <button
                            type="button"
                            onClick={() => setActiveArticleModal(lead)}
                            className="w-10 h-10 rounded-full bg-stone-900 hover:bg-amber-400 text-amber-300 hover:text-stone-950 shadow-sm flex items-center justify-center transition-all cursor-pointer self-end shrink-0"
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

                {/* 2. SECONDARY STORIES (2-COLUMN METRO DEPARTURE TILES) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {filteredHeadlines.slice(1, displayCount).map((item) => {
                    const isBookmarked = bookmarkedIds.has(item.id)
                    const ThumbnailComponent = item.thumbnail

                    return (
                      <article
                        key={item.id}
                        className="p-5 rounded-2xl border-2 border-stone-200/90 bg-[#FAF7F0] hover:bg-white hover:border-amber-400/80 transition-all flex flex-col justify-between group relative shadow-xs"
                      >
                        <div className="space-y-3">
                          {/* Top Row: Category Kicker */}
                          <div className="flex items-center justify-between font-mono-board">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 text-amber-300">
                              {item.categorySlug.toUpperCase().replace('-', ' ')}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(item.id, e)}
                              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                isBookmarked
                                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200/60'
                              }`}
                              title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
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
                              className="font-signage text-lg font-black text-stone-900 group-hover:text-amber-600 transition-colors leading-snug line-clamp-3 group/link flex items-start gap-1 uppercase tracking-wide"
                              title="Open verified original article in new tab"
                            >
                              <span>{item.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover/link:text-amber-600 shrink-0 mt-1" />
                            </a>
                            {/* Visual Thumbnail Artwork */}
                            <div className="shrink-0 cursor-pointer" onClick={() => setActiveArticleModal(item)}>
                              <ArticleThumbnailImage item={item} fallback={ThumbnailComponent} />
                            </div>
                          </div>

                          {/* Description Paragraph */}
                          <p
                            onClick={() => setActiveArticleModal(item)}
                            className="text-xs sm:text-[13px] text-stone-600 line-clamp-3 leading-relaxed font-normal cursor-pointer"
                          >
                            {item.description}
                          </p>

                          {/* Evidence-Gated Why It Matters (if present) */}
                          {item.whyItMatters && (
                            <div className="p-3 rounded-xl border-l-2 border-amber-500 bg-white border border-stone-200 space-y-1 shadow-2xs font-mono-board">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Why it matters</span>
                              </div>
                              <p className="text-[11px] font-sans text-stone-700 leading-normal line-clamp-2">
                                {item.whyItMatters}
                              </p>
                            </div>
                          )}

                          {/* Skill Badges */}
                          {item.skills && item.skills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 font-mono-board">
                              {item.skills.slice(0, 3).map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={(e) => handleSkillClick(skill, e)}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white hover:bg-stone-900 hover:text-white text-stone-700 border border-stone-300 transition-colors cursor-pointer shadow-2xs"
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Metadata on Left, Circular Button on Right */}
                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-200 font-mono-board">
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                            <span className="text-stone-400">Source ·</span>
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-700 hover:text-amber-800 hover:underline max-w-[100px] truncate font-bold"
                            >
                              {item.source}
                            </a>
                            <span>·</span>
                            <span>{item.timestamp}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveArticleModal(item)}
                            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 shadow-2xs flex items-center justify-center group-hover:bg-stone-900 group-hover:text-amber-300 group-hover:border-stone-900 transition-colors cursor-pointer shrink-0"
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
                  <div className="text-center pt-2 font-mono-board">
                    <button
                      type="button"
                      onClick={() => setDisplayCount((prev) => prev + 6)}
                      className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-black text-amber-300 text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                    >
                      <span>Showing {displayCount} of {filteredHeadlines.length} briefs — Load More Headlines</span>
                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* METRO TERMINAL FOOTER (STAY INFORMED  ·  STAY AHEAD) */}
            <div className="pt-4 border-t border-stone-200">
              <div className="border-t-2 border-stone-900 pt-4 text-center">
                <p className="text-xs sm:text-sm font-mono-board font-black tracking-[0.25em] text-stone-700 uppercase">
                  STAY INFORMED &nbsp;·&nbsp; STAY AHEAD
                </p>
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

          {/* Modal Content (Transit Station Inspector Style) */}
          <div className="relative w-full max-w-2xl my-auto rounded-[28px] bg-[#FAF7F0] border-2 border-stone-900 shadow-[8px_8px_0_0_rgba(28,25,23,0.95)] p-6 sm:p-8 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-stone-900 font-sans">
            {/* Top row */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-300">
              <div className="flex items-center gap-2 font-mono-board">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-stone-950 text-amber-300 shadow-2xs">
                  {activeArticleModal.category}
                </span>
                <span className="text-xs text-stone-500 font-semibold">{activeArticleModal.timestamp}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => toggleBookmark(activeArticleModal.id, e)}
                  className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                  title="Bookmark"
                >
                  {bookmarkedIds.has(activeArticleModal.id) ? (
                    <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArticleModal(null)}
                  className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Online Editorial Image Banner */}
            {activeArticleModal.imageUrl && (
              <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs relative bg-stone-950">
                <img
                  src={activeArticleModal.imageUrl}
                  alt={activeArticleModal.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="font-signage text-2xl sm:text-3xl font-black text-stone-900 leading-snug uppercase tracking-wide">
                {activeArticleModal.title}
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed font-normal">
                {activeArticleModal.description}
              </p>
            </div>

            {/* Why It Matters Callout Card (Evidence-Gated) */}
            {activeArticleModal.whyItMatters && (
              <div className="p-4 rounded-xl bg-amber-50/90 border-l-4 border-amber-500 border border-amber-200 space-y-1.5 shadow-2xs font-mono-board">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Career Route Impact</span>
                  {activeArticleModal.confidence === 'medium' && (
                    <span className="text-[10px] text-stone-400 font-normal lowercase font-sans ml-1">
                      (based on available text)
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans font-normal">
                  {activeArticleModal.whyItMatters}
                </p>
              </div>
            )}

            {/* Associated transit skills */}
            <div className="space-y-2 font-mono-board">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Targeted Skills for Transit Readiness
              </div>
              <div className="flex flex-wrap gap-2">
                {activeArticleModal.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-white text-stone-800 border-2 border-stone-200 shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t-2 border-stone-300 font-mono-board">
              <a
                href={activeArticleModal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-900 hover:text-stone-950 flex items-center gap-1.5"
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
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Add to My Learning Route</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
