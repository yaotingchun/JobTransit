import React, { useState, useMemo } from 'react'
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Target,
  Newspaper,
  BarChart3,
  CheckCircle2,
  X,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import type { NavTab, UserProfile } from '../Navbar'
import { WeeklySummaryReport } from './WeeklySummaryReport'

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
  whyItMatters: string
  skills: string[]
  thumbnail: React.ComponentType
  isWeeklySummary?: boolean
}

const mockHeadlines: NewsItem[] = [
  {
    id: 'openai-gpt-51',
    category: 'AI & Machine Learning',
    categorySlug: 'ai-ml',
    subTag: 'Research',
    timestamp: '2h ago',
    title: 'OpenAI introduces GPT-5.1 with improved reasoning and coding capabilities',
    description:
      'The latest model shows significant improvements in reasoning, tool use, and coding performance, with strong results on benchmark tests.',
    source: 'OpenAI Blog',
    sourceUrl: 'https://openai.com/blog',
    whyItMatters:
      'This development could accelerate AI-assisted development tools, which are relevant to your target role in AI engineering.',
    skills: ['LLM', 'Reasoning', 'Coding'],
    thumbnail: AIBrainThumbnail,
  },
  {
    id: 'github-copilot-workspace',
    category: 'Software Engineering',
    categorySlug: 'software-engineering',
    subTag: 'Tools',
    timestamp: '5h ago',
    title: 'Microsoft releases GitHub Copilot Workspace for end-to-end coding',
    description:
      'The new tool expands Copilot\'s capabilities from code completion to full project workflows, including planning, editing and testing.',
    source: 'Microsoft News',
    sourceUrl: 'https://news.microsoft.com',
    whyItMatters:
      'Highlights the growing role of AI agents in software engineering workflows, a key skill for future roles.',
    skills: ['AI Agents', 'Dev Tools', 'Workflow'],
    thumbnail: CodeEditorThumbnail,
  },
  {
    id: 'aws-aurora-dsql',
    category: 'Data & Cloud',
    categorySlug: 'data-cloud',
    subTag: 'Infrastructure',
    timestamp: '7h ago',
    title: 'AWS releases new Aurora DSQL for global, multi-region applications',
    description:
      'The new database service offers higher availability and simpler management for distributed applications.',
    source: 'AWS News',
    sourceUrl: 'https://aws.amazon.com/blogs/aws',
    whyItMatters:
      'Cloud and distributed systems skills remain in high demand, especially for scalable application development.',
    skills: ['Distributed Systems', 'Cloud', 'Databases'],
    thumbnail: CloudDatabaseThumbnail,
  },
  {
    id: 'critical-vulnerability-library',
    category: 'Cybersecurity',
    categorySlug: 'cybersecurity',
    subTag: 'Vulnerability',
    timestamp: '10h ago',
    title: 'Critical vulnerability found in popular open-source library',
    description:
      'A high-severity vulnerability (CVE-2026-1234) affects multiple applications using a widely adopted library. Developers are urged to update immediately.',
    source: 'NIST',
    sourceUrl: 'https://nvd.nist.gov',
    whyItMatters:
      'Security awareness and vulnerability management are essential skills for all technical roles.',
    skills: ['Security', 'Monitoring', 'Incident Response'],
    thumbnail: CyberShieldThumbnail,
  },
  {
    id: 'quantum-hybrid-sdk',
    category: 'Systems & Emerging Tech',
    categorySlug: 'systems-emerging',
    subTag: 'Hardware',
    timestamp: '1d ago',
    title: 'Next-Gen Quantum SDK allows hybrid classical-quantum cloud pipelines',
    description:
      'Developers can now test quantum algorithms alongside standard Python workflows in commercial cloud environments.',
    source: 'Qiskit Foundation',
    sourceUrl: 'https://qiskit.org',
    whyItMatters:
      'Understanding hybrid computational architectures will be a differentiator as classical compute hits scaling limits.',
    skills: ['Quantum Computing', 'Hybrid Systems', 'Python'],
    thumbnail: SystemsThumbnail,
    isWeeklySummary: true,
  },
  {
    id: 'tech-hiring-ai-orchestration',
    category: 'Industry & Careers',
    categorySlug: 'industry-careers',
    subTag: 'Market Trends',
    timestamp: '2d ago',
    title: 'Tech Hiring Shift: Agentic orchestration and system architecture lead demand in 2026',
    description:
      'Annual engineering compensation and headcount survey indicates a 140% surge in requirements for autonomous agent engineers.',
    source: 'TechCareers Index',
    sourceUrl: 'https://techcareers.org',
    whyItMatters:
      'Validates your career transit trajectory toward AI Engineering and autonomous system design.',
    skills: ['System Design', 'Career Strategy', 'AI Orchestration'],
    thumbnail: CareerTrendThumbnail,
    isWeeklySummary: true,
  },
]

const topicFilters = [
  { id: 'all', label: 'All Topics', count: 48, dotColor: 'bg-slate-950' },
  { id: 'ai-ml', label: 'AI & ML', count: 12, dotColor: 'bg-blue-500' },
  { id: 'software-engineering', label: 'Software Engineering', count: 10, dotColor: 'bg-sky-500' },
  { id: 'data-cloud', label: 'Data & Cloud', count: 8, dotColor: 'bg-slate-700' },
  { id: 'cybersecurity', label: 'Cybersecurity', count: 7, dotColor: 'bg-indigo-500' },
  { id: 'systems-emerging', label: 'Systems & Emerging Tech', count: 6, dotColor: 'bg-purple-500' },
  { id: 'industry-careers', label: 'Industry & Careers', count: 5, dotColor: 'bg-rose-500' },
]

export const CatchupTab: React.FC<CatchupTabProps> = ({
  currentUser,
  onSelectTab,
}) => {
  const [viewMode, setViewMode] = useState<'today' | 'weekly'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [sortBy, setSortBy] = useState<'latest' | 'relevant' | 'impact'>('latest')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['openai-gpt-51']))
  const [activeArticleModal, setActiveArticleModal] = useState<NewsItem | null>(null)
  const [savedSkillAlert, setSavedSkillAlert] = useState<string | null>(null)

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

  // Filter headlines based on viewMode, topic filter, and search query
  const filteredHeadlines = useMemo(() => {
    return mockHeadlines.filter((item) => {
      // If today mode, only show non-exclusive weekly items or all if matching topic
      if (viewMode === 'today' && item.isWeeklySummary && selectedTopic === 'all') {
        return false
      }
      // Topic filter
      if (selectedTopic !== 'all' && item.categorySlug !== selectedTopic) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchDesc = item.description.toLowerCase().includes(query)
        const matchCategory = item.category.toLowerCase().includes(query)
        const matchWhy = item.whyItMatters.toLowerCase().includes(query)
        const matchSkill = item.skills.some((s) => s.toLowerCase().includes(query))
        return matchTitle || matchDesc || matchCategory || matchWhy || matchSkill
      }
      return true
    })
  }, [viewMode, selectedTopic, searchQuery])

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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shadow-sm ${
              viewMode === 'today'
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shadow-sm ${
              viewMode === 'weekly'
                ? 'bg-slate-950 text-white shadow-slate-950/25 shadow-md border border-slate-900 scale-[1.02]'
                : 'bg-white/50 hover:bg-white/75 text-slate-700 hover:text-slate-950 backdrop-blur-xl border border-white/75 shadow-xs'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Weekly Summary</span>
          </button>
        </div>

        {viewMode === 'today' ? (
          <>
            {/* SEARCH BAR (Full-width rounded pill input with frosted glass) */}
            <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technologies, topics, or companies..."
            className="w-full h-12 pl-11 pr-10 rounded-full bg-white/55 focus:bg-white/80 backdrop-blur-2xl border border-white/85 text-sm font-medium text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950/20 shadow-[0_4px_20px_rgba(15,23,42,0.04),inset_0_1px_1px_rgba(255,255,255,0.85)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2-COLUMN MAIN CONTENT GRID (Left: Headlines List, Right: Sidebar Widgets) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Headlines List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Sub-header: Today's Headlines + Sort By */}
            <div className="flex items-center justify-between px-1">
              <h2 className="font-hero text-lg sm:text-xl font-bold tracking-tight text-slate-950">
                {viewMode === 'today' ? "Today's Headlines" : "Weekly Executive Syntheses"}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({filteredHeadlines.length} {filteredHeadlines.length === 1 ? 'brief' : 'briefs'})
                </span>
              </h2>

              {/* Sort By Dropdown */}
              <div className="relative flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'relevant' | 'impact')}
                  className="bg-white/60 hover:bg-white/80 border border-white/80 rounded-xl px-2.5 py-1 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-slate-950 cursor-pointer shadow-xs backdrop-blur-xl"
                >
                  <option value="latest">Latest</option>
                  <option value="relevant">Most Relevant</option>
                  <option value="impact">Highest Impact</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 -ml-1 pointer-events-none" />
              </div>
            </div>

            {/* List of News Headline Cards */}
            {filteredHeadlines.length === 0 ? (
              <div className="rounded-3xl bg-white/60 backdrop-blur-2xl p-12 text-center space-y-3 border border-white/80 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)]">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-hero text-base font-bold text-slate-800">
                  No matching headlines found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms or select another category like "All Topics".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTopic('all')
                  }}
                  className="px-4 py-2 rounded-full bg-slate-950 text-white text-xs font-semibold shadow-sm hover:bg-slate-900 cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHeadlines.map((item) => {
                  const ThumbnailComponent = item.thumbnail
                  const isBookmarked = bookmarkedIds.has(item.id)

                  return (
                    <article
                      key={item.id}
                      onClick={() => setActiveArticleModal(item)}
                      className="group relative rounded-3xl bg-white/60 hover:bg-white/75 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_12px_35px_-5px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] transition-all cursor-pointer"
                    >
                      {/* Flex layout: Thumbnail + Content + 'Why It Matters' partition */}
                      <div className="flex flex-col md:flex-row gap-5 items-start">
                        
                        {/* Left: Thumbnail Icon */}
                        <div className="shrink-0">
                          <ThumbnailComponent />
                        </div>

                        {/* Center: Metadata, Title, Description, Source */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Tags row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50/70 text-indigo-700 border border-indigo-200/50 shadow-2xs backdrop-blur-sm">
                              {item.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/60 text-slate-700 border border-white/80 backdrop-blur-sm">
                              {item.subTag}
                            </span>
                            <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {item.timestamp}
                            </span>
                          </div>

                          {/* Headline Title */}
                          <h3 className="font-hero text-sm sm:text-base font-bold text-slate-950 group-hover:text-slate-900 transition-colors leading-snug">
                            {item.title}
                          </h3>

                          {/* Summary Paragraph */}
                          <p className="text-xs text-slate-700 font-normal leading-relaxed">
                            {item.description}
                          </p>

                          {/* Source Link */}
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                            <span>Source ·</span>
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-800 hover:text-slate-950 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>{item.source}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Right: 'Why it matters' box & Bookmarking */}
                        <div className="w-full md:w-56 shrink-0 md:border-l md:border-white/50 md:pl-5 space-y-2 pt-3 md:pt-0 border-t md:border-t-0 border-white/40 bg-white/40 hover:bg-white/55 p-3.5 rounded-2xl border backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all">
                          
                          {/* Top row inside box: Label + Bookmark Button */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                              Why it matters
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(item.id, e)}
                              className={`p-1.5 rounded-full transition-colors cursor-pointer border ${
                                isBookmarked
                                  ? 'text-slate-950 bg-slate-950/10 border-slate-300 backdrop-blur-sm'
                                  : 'text-slate-500 hover:text-slate-800 bg-white/40 hover:bg-white/70 border-white/60 backdrop-blur-sm'
                              }`}
                              title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
                              aria-label="Bookmark headline"
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 fill-slate-950 text-slate-950" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Impact text */}
                          <p className="text-[11px] text-slate-700 leading-snug">
                            {item.whyItMatters}
                          </p>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.skills.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={(e) => handleSkillClick(skill, e)}
                                className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/80 hover:bg-slate-950 hover:text-white text-slate-900 border border-slate-300/80 transition-all shadow-2xs backdrop-blur-sm cursor-pointer"
                                title="Click to track in your transit route"
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar Widgets (4 cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            
            {/* WIDGET 1: Filter by Category (with Counts) */}
            <div className="rounded-3xl bg-white/60 hover:bg-white/70 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_12px_35px_-5px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] space-y-4 transition-all">
              <div className="flex items-center gap-2 pb-1 border-b border-white/60">
                <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                <h3 className="font-hero text-sm font-bold text-slate-950">
                  Filter by Category
                </h3>
              </div>

              <div className="space-y-1.5">
                {topicFilters.map((topic) => {
                  const isSelected = selectedTopic === topic.id
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 text-white border border-slate-900 backdrop-blur-md font-bold shadow-sm'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/45 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : topic.dotColor}`} />
                        <span>{topic.label}</span>
                      </div>
                      <span className={`text-[11px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {topic.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* WIDGET 2: Career Relevance Target Station */}
            <div className="rounded-3xl bg-white/60 hover:bg-white/70 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_12px_35px_-5px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] space-y-4 transition-all">
              <div className="flex items-center gap-2 pb-0.5">
                <Target className="w-4 h-4 text-slate-950" />
                <div>
                  <h3 className="font-hero text-sm font-bold text-slate-950 leading-tight">
                    Career Relevance
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Personalized for {currentUser?.name || 'Explorer'}&apos;s target route
                  </p>
                </div>
              </div>

              {/* Transit Station Role Transition Box */}
              <div className="p-3 rounded-2xl bg-white/50 border border-white/75 backdrop-blur-md shadow-2xs flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Current
                  </span>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    Software Engineering Student
                  </div>
                </div>

                <div className="text-slate-400 font-bold">→</div>

                <div className="space-y-0.5 text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                    Target
                  </span>
                  <div className="text-xs font-bold text-white bg-slate-950 border border-slate-900 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-2xs">
                    AI Engineer
                  </div>
                </div>
              </div>

              {/* Top relevant skills list */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-700">
                  Top relevant skills from today's news
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'LLM Integration',
                    'AI Agents',
                    'Cloud Infrastructure',
                    'Security Best Practices',
                  ].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={(e) => handleSkillClick(skill, e)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/65 hover:bg-slate-950 text-slate-800 hover:text-white border border-white/85 hover:border-slate-900 backdrop-blur-sm transition-all cursor-pointer shadow-2xs"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* WIDGET 3: Stay informed, stay ahead Prompt Card */}
            <div className="rounded-3xl bg-white/60 hover:bg-white/70 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_12px_35px_-5px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] flex items-start justify-between gap-3 relative overflow-hidden group transition-all">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-slate-950/10 text-slate-950 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h4 className="font-hero text-sm font-bold text-slate-950">
                  Stay informed, stay ahead.
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The tech industry moves fast. Use these insights to build your skills and plan your next station.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab('transit')}
                className="mt-auto p-2.5 rounded-full bg-white/80 text-slate-900 group-hover:bg-slate-950 group-hover:text-white border border-white/90 shadow-sm backdrop-blur-md transition-all duration-300 cursor-pointer shrink-0"
                title="Explore Transit Route"
                aria-label="Explore Transit Route"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </>
      ) : (
        <WeeklySummaryReport
          currentUser={currentUser}
          onSelectTab={onSelectTab}
          onSkillClick={handleSkillClick}
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

            {/* Why It Matters Callout Card */}
            <div className="p-4 rounded-2xl bg-white/55 border border-white/80 backdrop-blur-md shadow-2xs space-y-1.5">
              <div className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                Career Route Impact
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeArticleModal.whyItMatters}
              </p>
            </div>

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
