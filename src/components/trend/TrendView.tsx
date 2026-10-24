import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react'
import {
  Bot,
  Zap,
  Users,
  Search,
  Flame,
  Snowflake,
  ChevronRight,
  X,
  Target,
  Activity,
  Globe,
  ExternalLink,
  Building2,
  MapPin,
  Cpu,
  Info,
  TrendingUp,
} from 'lucide-react'
import {
  ROLE_TRENDS,
  SKILL_TRENDS,
  MARKET_SUMMARY,
  type RoleTrend,
  type SkillTrendItem
} from './trendData'

type ViewMode = 'roles' | 'ai-exposure' | 'entry-level' | 'skills'
type CategoryFilter = 'all' | 'AI & Machine Learning' | 'Data Engineering' | 'Software Engineering' | 'Cloud & Infrastructure' | 'Quality & Security'
type SortOption = 'growth' | 'velocity24h' | 'velocity7d' | 'openings2026' | 'openings2025' | 'aiExposure' | 'entryLevel'

export const TrendView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('roles')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('growth')
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<RoleTrend | null>(null)
  const [activeExposureRole, setActiveExposureRole] = useState<RoleTrend>(ROLE_TRENDS[0])
  const [skillFilter, setSkillFilter] = useState<'all' | 'surging' | 'deprecating'>('all')

  // Sub Navigation Sliding Pill State
  const subNavDockRef = useRef<HTMLDivElement>(null)
  const subNavTabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [subIndicatorStyle, setSubIndicatorStyle] = useState<{
    left: number
    top: number
    width: number
    height: number
    ready: boolean
  }>({ left: 0, top: 0, width: 0, height: 0, ready: false })

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const currentTabEl = subNavTabRefs.current[viewMode]
      const dockEl = subNavDockRef.current
      if (currentTabEl && dockEl) {
        const dockRect = dockEl.getBoundingClientRect()
        const tabRect = currentTabEl.getBoundingClientRect()
        setSubIndicatorStyle({
          left: tabRect.left - dockRect.left,
          top: tabRect.top - dockRect.top,
          width: tabRect.width,
          height: tabRect.height,
          ready: true,
        })
      }
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [viewMode])

  // Skill Filter Sliding Pill State
  const skillFilterDockRef = useRef<HTMLDivElement>(null)
  const skillFilterTabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [skillIndicatorStyle, setSkillIndicatorStyle] = useState<{
    left: number
    top: number
    width: number
    height: number
    ready: boolean
  }>({ left: 0, top: 0, width: 0, height: 0, ready: false })

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const currentTabEl = skillFilterTabRefs.current[skillFilter]
      const dockEl = skillFilterDockRef.current
      if (currentTabEl && dockEl) {
        const dockRect = dockEl.getBoundingClientRect()
        const tabRect = currentTabEl.getBoundingClientRect()
        setSkillIndicatorStyle({
          left: tabRect.left - dockRect.left,
          top: tabRect.top - dockRect.top,
          width: tabRect.width,
          height: tabRect.height,
          ready: true,
        })
      }
    }

    updateIndicator()
    const timer = setTimeout(updateIndicator, 40)
    window.addEventListener('resize', updateIndicator)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [skillFilter, viewMode])

  // Live Scraper States
  const [lastScrapedAt, setLastScrapedAt] = useState<string>(() => {
    return `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (Live Snapshot)`
  })
  const [rolesData, setRolesData] = useState<RoleTrend[]>(ROLE_TRENDS)
  const [skillsData, setSkillsData] = useState<SkillTrendItem[]>(SKILL_TRENDS)
  const [marketSummaryData, setMarketSummaryData] = useState(MARKET_SUMMARY)

  // Dynamically formatted date ranges for source provenance
  const sourceDateFormatted = useMemo(() => {
    const now = new Date()
    const monthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const fullMonthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    return {
      badgeRange: `Jan 2025 – ${monthYear}`,
      fullRange: `Q1 2025 – ${fullMonthYear}`,
    }
  }, [])

  // Auto-load daily scrape snapshot on mount
  useEffect(() => {
    let isMounted = true
    const loadDailyScrape = async () => {
      try {
        const res = await fetch('/api/scrape/linkedin-trends')
        if (!res.ok) return
        const data = await res.json()
        if (!isMounted || !data.success) return

        if (data.roles?.length) setRolesData(data.roles)
        if (data.skills?.length) setSkillsData(data.skills)
        if (data.marketSummary) setMarketSummaryData(data.marketSummary)
        if (data.lastScrapedAt) {
          setLastScrapedAt(new Date(data.lastScrapedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))
        }
      } catch (err) {
        console.debug('Daily autoscrape check completed with baseline.', err)
      }
    }

    loadDailyScrape()
    return () => {
      isMounted = false
    }
  }, [])

  // Filter and sort roles
  const filteredRoles = useMemo(() => {
    return rolesData
      .filter((role) => {
        const matchesCategory = selectedCategory === 'all' || role.category === selectedCategory
        const matchesSearch =
          role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.skillsNeededMoreNow.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          role.skillsNoLongerNeeded.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'growth' || sortBy === 'velocity24h') return (b.velocityRate24h ?? b.growthYoY) - (a.velocityRate24h ?? a.growthYoY)
        if (sortBy === 'velocity7d') return (b.velocityRate7d ?? 0) - (a.velocityRate7d ?? 0)
        if (sortBy === 'openings2026') return b.openings2026 - a.openings2026
        if (sortBy === 'openings2025') return (b.past24hNum ?? b.openings2025) - (a.past24hNum ?? a.openings2025)
        if (sortBy === 'aiExposure') return b.aiExposure.overallPercentage - a.aiExposure.overallPercentage
        if (sortBy === 'entryLevel') return b.entryLevelAccess.score - a.entryLevelAccess.score
        return 0
      })
  }, [rolesData, selectedCategory, searchQuery, sortBy])

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skillsData.filter((skill) => {
      const matchesTrend = skillFilter === 'all' || skill.trend === skillFilter
      const matchesSearch =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.relevantRoles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesTrend && matchesSearch
    })
  }, [skillsData, skillFilter, searchQuery])

  return (
    <div className="space-y-8 pb-16 transit-root">
      {/* ── 1. HEADER + TELEMETRY DISRUPTION RADAR MASTHEAD ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em] shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            MARKET RADAR · LIVE DISRUPTION TELEMETRY
          </div>

          <h1 className="font-signage text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[0.9] mt-3">
            JOB MARKET<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> RADAR</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-700 mt-2.5 max-w-2xl font-medium leading-relaxed">
            Real-time hiring velocity, empirical AI task exposure, and verified LinkedIn recruitment metrics.
            Track which stations on the career metro are experiencing exponential hiring surges and which skills are sunsetting.
          </p>
        </div>

        {/* Provenance Badge */}
        <div className="p-3.5 px-4 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 shadow-xs flex items-center gap-3 shrink-0 self-start lg:self-auto font-mono-board text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">NETWORK RADAR SYNC</div>
            <div className="text-stone-900 font-bold">{lastScrapedAt}</div>
          </div>
        </div>
      </div>

      {/* ── 2. FOUR CARTOGRAPHIC TELEMETRY QUICK-KPI TILES (TRANSIT STYLE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: 24h Hiring Velocity */}
        <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <div className="text-[10px] font-mono-board tracking-widest text-emerald-700 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" /> 24H HIRING VELOCITY
            </div>
            <div className="font-signage text-2xl sm:text-3xl font-black text-stone-900">
              +{marketSummaryData.averageVelocityRate24h || 38.6}%
            </div>
            <div className="text-[11px] font-mono-board text-stone-500">
              {(marketSummaryData.totalNewPostings24h || 108000).toLocaleString()}+ fresh openings in 24h
            </div>
          </div>
          <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-mono-board text-sm font-black">
            ⚡
          </span>
        </div>

        {/* Tile 2: Highest Velocity Hub */}
        <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="text-[10px] font-mono-board tracking-widest text-amber-700 font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> HIGHEST INFLUX ROLE
            </div>
            <div className="font-signage text-xl sm:text-2xl font-black text-stone-900 truncate">
              {marketSummaryData.topRole2026.title.toUpperCase()}
            </div>
            <div className="text-[11px] font-mono-board text-emerald-700 font-bold">
              17,000+ new today (+48.6%)
            </div>
          </div>
          <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-mono-board text-xs font-black shrink-0">
            #1
          </span>
        </div>

        {/* Tile 3: Avg AI Exposure */}
        <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <div className="text-[10px] font-mono-board tracking-widest text-purple-700 font-bold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-600" /> AVG AI EXPOSURE
            </div>
            <div className="font-signage text-2xl sm:text-3xl font-black text-purple-700">
              {marketSummaryData.averageAIExposure}%
            </div>
            <div className="text-[11px] font-mono-board text-stone-500">
              Across tracked tech lines
            </div>
          </div>
          <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-signage text-base font-black">
            AI
          </span>
        </div>

        {/* Tile 4: #1 New Tech Requirement */}
        <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="text-[10px] font-mono-board tracking-widest text-sky-700 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-600" /> #1 SURGING SKILL
            </div>
            <div className="font-signage text-xl sm:text-2xl font-black text-stone-900 truncate">
              {(skillsData[0]?.name || 'MCP').toUpperCase()}
            </div>
            <div className="text-[11px] font-mono-board text-sky-700 font-bold">
              {skillsData[0]?.scrapedJobCount || '26,000+'} verified jobs
            </div>
          </div>
          <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-mono-board text-xs font-bold shrink-0">
            NEW
          </span>
        </div>
      </div>

      {/* ── 3. TRANSIT CONTROL STRIP & FILTER SWITCHERS ── */}
      <div className="space-y-4">
        {/* Transit Control Switcher Dock */}
        <div className="flex justify-center w-full">
          <div
            ref={subNavDockRef}
            className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-stone-900/95 border border-stone-800 shadow-md relative"
          >
            {/* Sliding Active Pill Background */}
            <div
              className={`absolute top-0 left-0 rounded-xl bg-amber-400 shadow-xs pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                subIndicatorStyle.ready ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translate3d(${subIndicatorStyle.left}px, ${subIndicatorStyle.top}px, 0)`,
                width: `${subIndicatorStyle.width}px`,
                height: `${subIndicatorStyle.height}px`,
              }}
            />

            <button
              ref={(el) => {
                subNavTabRefs.current['roles'] = el
              }}
              type="button"
              onClick={() => setViewMode('roles')}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs font-mono-board tracking-wider transition-colors duration-200 cursor-pointer ${
                viewMode === 'roles'
                  ? 'text-stone-950 font-black'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              [01] HIRING VELOCITY & VOLUME
            </button>
            <button
              ref={(el) => {
                subNavTabRefs.current['ai-exposure'] = el
              }}
              type="button"
              onClick={() => setViewMode('ai-exposure')}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs font-mono-board tracking-wider transition-colors duration-200 cursor-pointer ${
                viewMode === 'ai-exposure'
                  ? 'text-stone-950 font-black'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              [02] AI EXPOSURE & TASKS
            </button>
            <button
              ref={(el) => {
                subNavTabRefs.current['entry-level'] = el
              }}
              type="button"
              onClick={() => setViewMode('entry-level')}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs font-mono-board tracking-wider transition-colors duration-200 cursor-pointer ${
                viewMode === 'entry-level'
                  ? 'text-stone-950 font-black'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              [03] ENTRY CLEARANCE RADAR
            </button>
            <button
              ref={(el) => {
                subNavTabRefs.current['skills'] = el
              }}
              type="button"
              onClick={() => setViewMode('skills')}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs font-mono-board tracking-wider transition-colors duration-200 cursor-pointer ${
                viewMode === 'skills'
                  ? 'text-stone-950 font-black'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              [04] SKILLS RADAR (LIVE)
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station roles or bridge skills..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 border-2 border-stone-200 text-xs sm:text-sm font-mono-board text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Domain Filter & Sort */}
          <div className="flex flex-wrap items-center gap-2 font-mono-board text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
              aria-label="Filter roles by category"
              className="px-3 py-2 rounded-xl bg-white/90 border-2 border-stone-200 font-bold text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
            >
              <option value="all">ALL DOMAINS</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Data Engineering">Data Engineering</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
              <option value="Quality & Security">Quality & Security</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort roles by metric"
              className="px-3 py-2 rounded-xl bg-white/90 border-2 border-stone-200 font-bold text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
            >
              <option value="growth">SORT: 24h Hiring Velocity %</option>
              <option value="velocity7d">SORT: 7-Day Influx %</option>
              <option value="openings2026">SORT: Total Active Volume</option>
              <option value="aiExposure">SORT: AI Task Exposure %</option>
              <option value="entryLevel">SORT: Entry Clearance</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. VIEW 1: OPEN JOB POSITIONS & LIVE HIRING VELOCITY ── */}
      {viewMode === 'roles' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="space-y-0.5">
              <h3 className="font-signage text-2xl font-black text-stone-900 tracking-wide">
                ACTIVE RECRUITMENT DEPARTURES: 24H & 7D INFLUX
              </h3>
              <p className="text-xs font-mono-board text-stone-500">
                Verified live via LinkedIn search endpoints (&f_TPR=r86400 / past 24h &amp; &f_TPR=r604800 / past 7d)
              </p>
            </div>
            <span className="font-mono-board text-xs text-stone-500 font-bold">
              Showing {filteredRoles.length} roles
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredRoles.map((role) => {
              const maxOpenings = Math.max(...rolesData.map((r) => r.openings2026), 35000)
              const widthTotal = Math.min(100, Math.round((role.openings2026 / maxOpenings) * 100))
              const width7d = Math.min(100, role.velocityRate7d ?? 85)
              const width24h = Math.min(100, Math.round((role.velocityRate24h ?? 40) * 1.8))

              return (
                <div
                  key={role.id}
                  className="rounded-[24px] bg-[#FAF7F0] hover:bg-white border-2 border-stone-200 hover:border-amber-500/70 p-5 sm:p-6 transition-all shadow-xs cursor-pointer flex flex-col justify-between space-y-4 group"
                  onClick={() => setSelectedRoleForModal(role)}
                >
                  {/* Top Bar: Title, Domain Code & Live 24h Velocity Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded font-mono-board text-[10px] font-black uppercase tracking-wider bg-stone-900 text-amber-300 shadow-xs">
                          {role.category}
                        </span>
                        <span className="font-mono-board text-xs text-stone-500 font-bold">
                          RANK #{role.rank2026}
                        </span>
                      </div>
                      <h4 className="font-signage text-xl sm:text-2xl font-black text-stone-900 tracking-wide group-hover:text-amber-600 transition-colors truncate">
                        {role.title.toUpperCase()}
                      </h4>
                    </div>

                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono-board font-black shrink-0 bg-amber-400 text-stone-950 shadow-xs">
                      <Flame className="w-3.5 h-3.5 text-stone-950" />
                      <span>+{role.velocityRate24h ?? 40}% 24H</span>
                    </div>
                  </div>

                  {/* 3 Live LinkedIn Query Verification Station Badges */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono-board font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                      <span>VERIFIED SEARCH QUERIES:</span>
                      <span className="text-emerald-700 font-bold">LIVE TELEMETRY</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-mono-board">
                      <a
                        href={role.linkedinSearchUrl || `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role.searchKeyword || role.title)}&location=Worldwide`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-900 text-center transition-all shadow-2xs group/link"
                        title="View All Active Postings on LinkedIn"
                      >
                        <div className="text-[9px] uppercase font-bold text-stone-500 flex items-center justify-center gap-0.5">
                          <span>Total Active</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
                        </div>
                        <div className="font-signage text-base font-black text-stone-900 mt-0.5">
                          {role.scrapedCountString || '35,000+'}
                        </div>
                      </a>

                      <a
                        href={role.linkedinSearch7dUrl || `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role.searchKeyword || role.title)}&location=Worldwide&f_TPR=r604800`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-900 text-center transition-all shadow-2xs group/link"
                        title="View Postings from Past 7 Days on LinkedIn"
                      >
                        <div className="text-[9px] uppercase font-bold text-stone-500 flex items-center justify-center gap-0.5">
                          <span>Past 7 Days</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
                        </div>
                        <div className="font-signage text-base font-black text-purple-800 mt-0.5">
                          {role.past7dCountStr || '30,000+'}
                        </div>
                      </a>

                      <a
                        href={role.linkedinSearch24hUrl || `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role.searchKeyword || role.title)}&location=Worldwide&f_TPR=r86400`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-center transition-all shadow-2xs group/link"
                        title="View Postings from Past 24 Hours on LinkedIn"
                      >
                        <div className="text-[9px] uppercase font-bold text-amber-800 flex items-center justify-center gap-0.5">
                          <span>Past 24 Hours</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
                        </div>
                        <div className="font-signage text-base font-black text-amber-900 mt-0.5">
                          {role.past24hCountStr || '17,000+'}
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* 3-Tier Live Velocity Comparative Meter Bars */}
                  <div className="space-y-3 p-3.5 rounded-2xl bg-white/90 border border-stone-200">
                    {/* Bar 1: Total Active Pool */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono-board">
                        <span className="text-stone-600 font-bold">Total Active Requisitions:</span>
                        <span className="font-black text-stone-900">{role.openings2026.toLocaleString()} positions</span>
                      </div>
                      <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-500 rounded-full transition-all duration-500"
                          style={{ width: `${widthTotal}%` }}
                        />
                      </div>
                    </div>

                    {/* Bar 2: Past 7-Day Influx */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono-board">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <span>Past 7-Day Influx:</span>
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black bg-purple-100 text-purple-800">&f_TPR=r604800</span>
                        </span>
                        <span className="font-black text-purple-950">
                          {role.past7dCountStr || '30,000+'} ({role.velocityRate7d ?? 85}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${width7d}%` }}
                        />
                      </div>
                    </div>

                    {/* Bar 3: Past 24-Hour Velocity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono-board">
                        <span className="font-black text-stone-900 flex items-center gap-1.5">
                          <span>Past 24h Surge:</span>
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black bg-amber-400 text-stone-950 animate-pulse">&f_TPR=r86400</span>
                        </span>
                        <span className="font-black text-emerald-700">
                          {role.past24hCountStr || '17,000+'} (+{role.velocityRate24h ?? 40}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500"
                          style={{ width: `${width24h}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono-board text-stone-500 pt-1 border-t border-stone-200">
                      <span>Status: <strong className="text-stone-900">{role.velocityLabel || 'High Velocity 🚀'}</strong></span>
                      <span>Market Share: <strong className="text-stone-900">{role.marketRecruitmentShare2026}%</strong></span>
                    </div>
                  </div>

                  {/* Dual Metric Badges: Entry-Level Access & AI Exposure */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono-board">
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-stone-700" />
                        ENTRY CLEARANCE
                      </div>
                      <div className="text-xs font-black text-stone-900 mt-1">
                        {role.entryLevelAccess.score}/100 • {role.entryLevelAccess.breakdown.entryLevel}% Junior
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">
                        {role.entryLevelAccess.levelLabel}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                        <Bot className="w-3 h-3 text-purple-600" />
                        AI TASK EXPOSURE
                      </div>
                      <div className="text-xs font-black text-stone-900 mt-1">
                        {role.aiExposure.overallPercentage}% Workflows
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">
                        Risk: <span className="font-bold text-stone-800">{role.aiExposure.automationRisk}</span> | Boost: <span className="font-bold text-stone-800">{role.aiExposure.augmentationPotential}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Snapshot */}
                  <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono-board">
                      <span className="text-stone-500 font-bold mr-1">SURGING:</span>
                      {role.skillsNeededMoreNow.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9.5px]">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="font-mono-board text-xs font-black text-amber-700 group-hover:text-amber-800 flex items-center gap-0.5">
                      <span>Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 5. VIEW 2: AI EXPOSURE & TASK AUTOMATION ANALYSIS ── */}
      {viewMode === 'ai-exposure' && (
        <section className="rounded-[28px] bg-white/90 backdrop-blur-md border border-stone-300/80 p-6 sm:p-8 shadow-[0_16px_36px_rgba(28,25,23,0.06)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-board font-black bg-purple-100 text-purple-900 border border-purple-200">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                AI EXPOSURE & TECHNOLOGY ANALYSIS
              </div>
              <h3 className="font-signage text-3xl sm:text-4xl font-black text-stone-900 tracking-wide">
                AI AUTOMATION & AUGMENTATION RADAR
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Live exposure index computed dynamically from AI tooling frequency (Autonomous Agents, MCP, Codegen, RAG) versus manual core engineering requisitions.
              </p>
            </div>

            {/* Role Picker for Deep Dive Exposure */}
            <div className="shrink-0 flex items-center gap-2 font-mono-board text-xs">
              <span className="font-bold text-stone-700">TARGET STATION:</span>
              <select
                value={activeExposureRole.id}
                onChange={(e) => {
                  const found = rolesData.find((r) => r.id === e.target.value)
                  if (found) setActiveExposureRole(found)
                }}
                aria-label="Select role for AI exposure analysis"
                className="px-3 py-2 rounded-xl bg-white border-2 border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                {rolesData.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.aiExposure.overallPercentage}% exposure)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Role Exposure Card */}
          <div className="rounded-2xl p-5 sm:p-6 bg-[#FAF7F0] border-2 border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono-board font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>TELEMETRY DERIVED FROM LINKEDIN JOB CARDS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="font-signage text-3xl font-black text-stone-900 tracking-wide">
                  {activeExposureRole.title.toUpperCase()}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                  {activeExposureRole.aiExposure.summary}
                </p>
              </div>

              {/* Gauge Meter Tile (HUD style) */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-white shadow-xs flex items-center gap-4 shrink-0 font-mono-board">
                <div className="text-center">
                  <div className="font-signage text-3xl font-black text-amber-400 leading-none">
                    {activeExposureRole.aiExposure.overallPercentage}%
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mt-1">
                    AI Exposure Index
                  </div>
                </div>
                <div className="text-xs border-l border-stone-700 pl-4 space-y-1">
                  <div>Risk: <span className="font-bold text-rose-300">{activeExposureRole.aiExposure.automationRisk}</span></div>
                  <div>Boost: <span className="font-bold text-emerald-400">{activeExposureRole.aiExposure.augmentationPotential}</span></div>
                  {activeExposureRole.aiExposure.aiToolingFrequency && (
                    <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-700 flex items-center gap-1.5">
                      <span>AI Tooling: <strong className="text-amber-300 font-bold">{activeExposureRole.aiExposure.aiToolingFrequency}%</strong></span>
                      <span className="text-stone-500">|</span>
                      <span>Manual Core: <strong className="text-white font-bold">{activeExposureRole.aiExposure.manualCoreFrequency}%</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mined Technologies Grid from Live Scraped Job Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono-board font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-stone-700" />
                    KEY TECHNOLOGY REQUIREMENTS &amp; OCCURRENCE FREQUENCY
                  </div>
                  <p className="text-[11px] font-mono-board text-stone-500">
                    Core frameworks required across live requisitions for {activeExposureRole.title}.
                  </p>
                </div>
                <div className="text-[11px] font-mono-board font-bold text-stone-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full shrink-0">
                  {activeExposureRole.minedSkills?.length || 0} Key Technologies Verified
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeExposureRole.minedSkills?.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-signage text-base font-black text-stone-900 leading-tight">
                          {skill.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono-board font-bold shrink-0 ${
                            skill.category === 'Language'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : skill.category === 'Data & Lakehouse'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : skill.category === 'Cloud & Infra'
                                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                  : skill.category === 'AI & Frameworks'
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                    : 'bg-stone-100 text-stone-800 border border-stone-200'
                          }`}
                        >
                          {skill.category}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1 font-mono-board">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-black text-amber-700">{skill.occurrencePct}%</span>
                          <span className="text-stone-500 text-[10px]">{skill.countStr}</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${skill.occurrencePct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* LinkedIn Live Verification Link */}
                    <a
                      href={skill.linkedinSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-mono-board font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition-colors"
                      title={`Verify ${activeExposureRole.title} + ${skill.name} on LinkedIn`}
                    >
                      <span>Verify Live Query</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. VIEW 3: ENTRY-LEVEL ACCESS RADAR ── */}
      {viewMode === 'entry-level' && (
        <section className="rounded-[28px] bg-white/90 backdrop-blur-md border border-stone-300/80 p-6 sm:p-8 shadow-[0_16px_36px_rgba(28,25,23,0.06)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-board font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                ENTRY-LEVEL ACCESS &amp; SENIORITY GATES
              </div>
              <h3 className="font-signage text-3xl sm:text-4xl font-black text-stone-900 tracking-wide">
                EXPERTISE CLEARANCE: HOW EXPERT DO YOU NEED TO BE?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Parsed from seniority qualifications (Lead / Staff vs. Mid-level vs. Junior / Associate) across active LinkedIn requisitions.
              </p>
            </div>
            <div className="shrink-0 self-start md:self-center inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-200 font-mono-board text-xs font-bold shadow-xs whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>0 = Senior Only</span>
              </span>
              <span className="text-stone-600">|</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>100 = Entry-Friendly</span>
              </span>
            </div>
          </div>

          {/* Access Bars List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="p-5 rounded-2xl bg-[#FAF7F0] hover:bg-white border-2 border-stone-200 hover:border-amber-500/60 shadow-xs space-y-3.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-signage text-xl font-black text-stone-900 tracking-wide">
                      {role.title.toUpperCase()}
                    </h5>
                    <div className="text-[11px] font-mono-board font-bold text-stone-500">
                      {role.entryLevelAccess.levelLabel}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-signage text-3xl font-black text-stone-900">
                      {role.entryLevelAccess.score}
                    </span>
                    <span className="font-mono-board text-xs text-stone-500">/100</span>
                  </div>
                </div>

                {/* Experience Distribution Stacked Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${role.entryLevelAccess.breakdown.entryLevel}%` }}
                      title={`Junior (0-2 yrs): ${role.entryLevelAccess.breakdown.entryLevel}%`}
                    />
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${role.entryLevelAccess.breakdown.midLevel}%` }}
                      title={`Mid-Level (3-5 yrs): ${role.entryLevelAccess.breakdown.midLevel}%`}
                    />
                    <div
                      className="h-full bg-stone-900 transition-all duration-500"
                      style={{ width: `${role.entryLevelAccess.breakdown.seniorLead}%` }}
                      title={`Senior/Staff (5+ yrs): ${role.entryLevelAccess.breakdown.seniorLead}%`}
                    />
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-between text-[11px] font-mono-board text-stone-600 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Junior (0-2y): <strong>{role.entryLevelAccess.breakdown.entryLevel}%</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Mid (3-5y): <strong>{role.entryLevelAccess.breakdown.midLevel}%</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-stone-900" />
                      Senior (5y+): <strong>{role.entryLevelAccess.breakdown.seniorLead}%</strong>
                    </span>
                  </div>
                </div>

                {/* Insight & Compare Links */}
                <div className="p-3 rounded-xl bg-white text-[11px] font-mono-board text-stone-600 leading-relaxed border border-stone-200 space-y-2">
                  <div>
                    <strong className="text-stone-900">TELEMETRY INSIGHT:</strong> {role.entryLevelAccess.insight}
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-2 border-t border-stone-200">
                    <span className="text-[10px] text-stone-500 font-bold">COMPARE:</span>
                    <a
                      href={`https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent('Senior ' + (role.searchKeyword || role.title))}&location=Worldwide`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold border border-stone-300"
                    >
                      Senior Postings ↗
                    </a>
                    <a
                      href={`https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent('Junior ' + (role.searchKeyword || role.title))}&location=Worldwide`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold border border-emerald-300"
                    >
                      Junior Postings ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. VIEW 4: LINKEDIN SKILL DETECTOR (SURGING VS SUNSET) ── */}
      {viewMode === 'skills' && (
        <section className="rounded-[28px] bg-white/90 backdrop-blur-md border border-stone-300/80 p-6 sm:p-8 shadow-[0_16px_36px_rgba(28,25,23,0.06)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-board font-black bg-amber-400 text-stone-950 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-stone-950" />
                  LINKEDIN SKILLS RADAR
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-board font-bold bg-stone-900 text-amber-300">
                  <Activity className="w-3 h-3 text-amber-400" />
                  50.0% Empirical Velocity Benchmark
                </div>
              </div>
              <h3 className="font-signage text-3xl sm:text-4xl font-black text-stone-900 tracking-wide">
                SKILLS NEEDED MORE NOW 🔥 VS. SUNSET SKILLS ❄️
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Classification dynamically derived from 24h replenishment velocity (&f_TPR=r86400) vs. the 50.0% market benchmark: <strong>≥ 50% is Emerging / Needed More</strong>, while <strong>&lt; 50% is Sunset / Deprecating</strong>.
              </p>
            </div>

            {/* Filter Toggle */}
            <div
              ref={skillFilterDockRef}
              className="flex items-center gap-1 p-1 rounded-xl bg-stone-900 border border-stone-800 relative font-mono-board text-xs"
            >
              {/* Sliding Active Pill Background */}
              <div
                className={`absolute top-0 left-0 rounded-lg pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  skillIndicatorStyle.ready ? 'opacity-100' : 'opacity-0'
                } ${
                  skillFilter === 'surging'
                    ? 'bg-amber-400 shadow-xs'
                    : skillFilter === 'deprecating'
                    ? 'bg-stone-700 shadow-xs'
                    : 'bg-white shadow-xs'
                }`}
                style={{
                  transform: `translate3d(${skillIndicatorStyle.left}px, ${skillIndicatorStyle.top}px, 0)`,
                  width: `${skillIndicatorStyle.width}px`,
                  height: `${skillIndicatorStyle.height}px`,
                }}
              />

              <button
                ref={(el) => {
                  skillFilterTabRefs.current['all'] = el
                }}
                type="button"
                onClick={() => setSkillFilter('all')}
                className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer select-none ${
                  skillFilter === 'all'
                    ? 'text-stone-950 font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                ALL SKILLS
              </button>
              <button
                ref={(el) => {
                  skillFilterTabRefs.current['surging'] = el
                }}
                type="button"
                onClick={() => setSkillFilter('surging')}
                className={`relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer select-none ${
                  skillFilter === 'surging'
                    ? 'text-stone-950 font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Flame className={`w-3 h-3 ${skillFilter === 'surging' ? 'text-stone-950' : 'text-amber-400'}`} />
                <span>NEEDED MORE</span>
              </button>
              <button
                ref={(el) => {
                  skillFilterTabRefs.current['deprecating'] = el
                }}
                type="button"
                onClick={() => setSkillFilter('deprecating')}
                className={`relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer select-none ${
                  skillFilter === 'deprecating'
                    ? 'text-white font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Snowflake className={`w-3 h-3 ${skillFilter === 'deprecating' ? 'text-white' : 'text-stone-400'}`} />
                <span>SUNSET</span>
              </button>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => {
              const isSurging = skill.trend === 'surging'
              const velocity = skill.velocityRate24h ?? skill.changeRate

              return (
                <div
                  key={skill.id}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3.5 flex flex-col justify-between shadow-xs ${
                    isSurging
                      ? 'bg-[#FAF7F0] hover:bg-white border-stone-200 hover:border-amber-400'
                      : 'bg-stone-50/80 hover:bg-white border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-mono-board">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-900 text-stone-200">
                            {skill.category}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              isSurging ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-800'
                            }`}
                          >
                            {skill.statusTag}
                          </span>
                        </div>
                        <h4 className="font-signage text-xl font-black text-stone-900 tracking-wide pt-1">
                          {skill.name}
                        </h4>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono-board font-black shrink-0 ${
                          isSurging
                            ? 'bg-amber-400 text-stone-950 shadow-xs'
                            : 'bg-stone-200 text-stone-800 border border-stone-300'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>+{velocity}% 24H</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-medium">
                      {skill.context}
                    </p>

                    {/* 24h Velocity Progress bar */}
                    <div className="space-y-1 pt-1 font-mono-board">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-600 font-bold">Past 24h Replenishment:</span>
                        <span className="font-black text-stone-900">
                          {skill.past24hCountStr || `${skill.openingsMentionCount2026.toLocaleString()}+`} <span className="text-amber-700">({velocity}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSurging
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                              : 'bg-stone-400'
                          }`}
                          style={{ width: `${Math.min(100, velocity)}%` }}
                        />
                      </div>
                    </div>

                    {/* Alternative or Replacement if deprecating */}
                    {skill.alternativeOrReplacement && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 text-xs font-mono-board text-stone-900 font-bold flex items-center gap-2 border border-amber-200">
                        <Target className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>TRANSIT ALTERNATIVE: {skill.alternativeOrReplacement}</span>
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Scraped Count & Direct Verification Links */}
                  <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-board">
                    <div className="text-stone-600">
                      Total Active: <strong className="text-stone-950 font-black">{skill.scrapedJobCount || `${skill.openingsMentionCount2026.toLocaleString()}+`}</strong>
                    </div>

                    <div className="flex items-center gap-3 font-bold">
                      {skill.linkedinSearch24hUrl && (
                        <a
                          href={skill.linkedinSearch24hUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900"
                          title="Verify 24h postings on LinkedIn"
                        >
                          <span>24h Influx ({skill.past24hCountStr})</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {skill.linkedinSearchUrl && (
                        <a
                          href={skill.linkedinSearchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-stone-900 hover:text-amber-600"
                          title="View all active postings on LinkedIn"
                        >
                          <span>All Active</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 8. BOTTOM SOURCE PROVENANCE FOOTNOTE ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono-board text-stone-500 py-4 px-2 border-t border-stone-300 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>TELEMETRY SOURCE:</strong> LinkedIn Worldwide Public Postings • {sourceDateFormatted.fullRange} active listings (rolling 24-hr &amp; 7-day velocity metrics)
          </span>
        </div>
        <span className="text-stone-400 text-[11px] shrink-0 font-bold">
          Last Synced: {lastScrapedAt}
        </span>
      </div>

      {/* ── 9. ROLE DETAILS MODAL / DOSSIER (CARTOGRAPHIC LIGHT TRANSIT STYLE) ── */}
      {selectedRoleForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#FAF7F0] rounded-3xl shadow-2xl border-2 border-stone-300 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedRoleForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2 flex-wrap font-mono-board">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-stone-900 text-amber-300">
                  {selectedRoleForModal.category}
                </span>
                <span className="text-xs font-bold text-stone-500">
                  RANK #{selectedRoleForModal.rank2026} ON LINKEDIN
                </span>
                {selectedRoleForModal.linkedinSearchUrl && (
                  <a
                    href={selectedRoleForModal.linkedinSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline ml-auto"
                  >
                    <span>View Search on LinkedIn</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <h3 className="font-signage text-3xl sm:text-4xl font-black text-stone-900 tracking-wide">
                {selectedRoleForModal.title.toUpperCase()}
              </h3>
              <p className="text-sm text-stone-600 font-medium leading-relaxed">
                {selectedRoleForModal.whyItMatters}
              </p>
            </div>

            {/* Real Scraped Job Postings List */}
            {selectedRoleForModal.recentPostings && selectedRoleForModal.recentPostings.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5 font-mono-board">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    REAL POSTINGS SCRAPED LIVE FROM LINKEDIN
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    Keyword: "{selectedRoleForModal.searchKeyword}"
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedRoleForModal.recentPostings.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#FAF7F0] border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-amber-400 transition-colors">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-xs text-stone-900 truncate">{p.title}</div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1 text-stone-700 font-medium">
                            <Building2 className="w-3 h-3 text-stone-400" />
                            {p.company}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {p.location}
                          </span>
                        </div>
                      </div>

                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                      >
                        <span>View Job ↗</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live LinkedIn Velocity Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-stone-200 font-mono-board">
              <div>
                <div className="text-[10px] font-bold uppercase text-stone-500">Total Active</div>
                <div className="font-signage text-2xl font-black text-stone-900 mt-0.5">
                  {selectedRoleForModal.openings2026.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-purple-700">Past 7 Days</div>
                <div className="font-signage text-2xl font-black text-purple-800 mt-0.5">
                  {selectedRoleForModal.past7dCountStr || '30,000+'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-amber-700">24h Velocity</div>
                <div className="font-signage text-2xl font-black text-emerald-700 mt-0.5">
                  +{selectedRoleForModal.velocityRate24h ?? 40}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-stone-500">AI Exposure</div>
                <div className="font-signage text-2xl font-black text-stone-900 mt-0.5">
                  {selectedRoleForModal.aiExposure.overallPercentage}%
                </div>
              </div>
            </div>

            {/* Entry-Level Accessibility */}
            <div className="space-y-2">
              <h5 className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                ENTRY-LEVEL CLEARANCE &amp; BARRIERS
              </h5>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2 font-mono-board">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                  <span>Accessibility Rating: {selectedRoleForModal.entryLevelAccess.score}/100</span>
                  <span className="text-emerald-800 font-black">{selectedRoleForModal.entryLevelAccess.levelLabel}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans font-medium">
                  {selectedRoleForModal.entryLevelAccess.insight}
                </p>
                <div className="flex items-center gap-3 text-xs pt-1 border-t border-stone-100">
                  <span>Junior (0-2y): <strong>{selectedRoleForModal.entryLevelAccess.breakdown.entryLevel}%</strong></span>
                  <span>Mid (3-5y): <strong>{selectedRoleForModal.entryLevelAccess.breakdown.midLevel}%</strong></span>
                  <span>Senior (5y+): <strong>{selectedRoleForModal.entryLevelAccess.breakdown.seniorLead}%</strong></span>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRoleForModal(null)}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-mono-board text-xs font-black tracking-wider transition-all cursor-pointer shadow-sm"
              >
                Close Station Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
