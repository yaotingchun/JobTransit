import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookmarkCheck,
  Briefcase,
  Check,
  Clock,
  ExternalLink,
  FileCheck,
  Filter,
  GraduationCap,
  Layers,
  Share2,
  Sparkles,
  Target,
  TrainFront,
  TrendingUp,
  Globe2,
} from 'lucide-react'
import {
  getReskillingPathway,
  resolveResourceUrl,
  type LearningCheckpoint,
  type LearningResource,
} from './pathwayData'
import { LINES, RANK_COLORS, type Station } from './transitData'
import { getStationSDGMapping, getSkillSDG, SDG_GOALS } from './sdgData'

interface ReskillingPathwayPageProps {
  station: Station
  allStations: Station[]
  onBackToMap: () => void
  onSelectStation: (stationId: string) => void
  onBoard: () => void
  completedCheckpoints: Set<string>
  onToggleCheckpoint: (checkpointId: string, title: string) => void
}

type TabKey = 'checklist' | 'match' | 'requirements' | 'sdg'
type FilterType = 'all' | 'free' | 'hrd-corp'

export const ReskillingPathwayPage: React.FC<ReskillingPathwayPageProps> = ({
  station,
  allStations,
  onBackToMap,
  onSelectStation,
  onBoard,
  completedCheckpoints,
  onToggleCheckpoint,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('checklist')
  const [resourceFilter, setResourceFilter] = useState<FilterType>('all')
  const [copiedLink, setCopiedLink] = useState(false)
  const [savedCard, setSavedCard] = useState(false)

  // Track sub-deliverable project task checkboxes locally
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('jobtransit_completed_tasks')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  // Persist completed sub-tasks
  useEffect(() => {
    try {
      localStorage.setItem('jobtransit_completed_tasks', JSON.stringify(Array.from(completedTasks)))
    } catch (e) {
      console.warn('Unable to write completed tasks to localStorage', e)
    }
  }, [completedTasks])

  // Allow ESC key to return to map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBackToMap()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onBackToMap])

  // Scroll to top on mount or station change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [station.id])

  const pathway = useMemo(
    () => getReskillingPathway(station.id, station.name, station.code),
    [station.id, station.name, station.code],
  )

  const sdgMapping = useMemo(
    () => getStationSDGMapping(station.id, station.name),
    [station.id, station.name],
  )

  const line = LINES[station.lines[0]] ?? { code: 'A', name: 'Main Line', color: '#10B981' }
  const rank = station.topRank
  const accentColor = rank ? RANK_COLORS[rank].ring : line.color

  // Checkpoint completion calculation
  const totalCheckpoints = pathway.checkpoints.length
  const completedCount = pathway.checkpoints.filter((cp) => completedCheckpoints.has(cp.id)).length
  const progressPercent = Math.round((completedCount / (totalCheckpoints || 1)) * 100)

  // Determine active in-progress checkpoint
  const activeNextCheckpoint = pathway.checkpoints.find((cp) => !completedCheckpoints.has(cp.id)) ?? null

  const filterResource = (res: LearningResource) => {
    if (resourceFilter === 'free') return res.type === 'free'
    if (resourceFilter === 'hrd-corp') return res.type === 'hrd-corp'
    return true
  }

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const scrollToCheckpoint = (id: string) => {
    const el = document.getElementById(`cp-station-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2200)
  }

  const handleSaveCard = () => {
    onBoard()
    setSavedCard(true)
    setTimeout(() => setSavedCard(false), 2200)
  }

  return (
    <article className="w-full space-y-6 pb-12 animate-in fade-in duration-300" aria-label="Personalised Reskilling Pathway">
      {/* ── TOP BREADCRUMB & CONTROL BAR ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/95 text-stone-100 p-3 sm:px-5 sm:py-3.5 rounded-2xl border border-stone-800 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            id="back-to-map-btn"
            onClick={onBackToMap}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold font-mono-board tracking-wider text-stone-200 hover:text-white transition-all cursor-pointer group active:scale-95 shrink-0"
            title="Return to Career Metro Map (Esc)"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-amber-400" />
            <span className="hidden sm:inline">BACK TO METRO MAP</span>
            <span className="sm:hidden">MAP</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono-board bg-black/40 rounded border border-white/20 text-stone-400">
              ESC
            </kbd>
          </button>

          <span className="text-stone-700 hidden sm:inline">|</span>

          {/* Destination Switcher Pills */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono-board overflow-x-auto custom-scrollbar py-0.5 max-w-xl">
            <span className="text-stone-400 text-[10.5px] mr-1 shrink-0">STOPS:</span>
            {allStations
              .filter((p) => p.topRank || p.id === station.id)
              .sort((a, b) => (a.topRank ?? 99) - (b.topRank ?? 99))
              .map((p) => {
                const isCurr = p.id === station.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectStation(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isCurr
                        ? 'bg-amber-400 text-stone-950 shadow-xs'
                        : 'bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {p.topRank ? `#${p.topRank} ` : ''}{p.name.replace(' Engineer', '').replace(' Developer', '')}
                  </button>
                )
              })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono-board text-stone-200 hover:text-white transition-all cursor-pointer"
            title="Bookmark destination to Transit Card"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{savedCard ? 'Saved to Card!' : 'Save Card'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono-board text-stone-200 hover:text-white transition-all cursor-pointer"
            title="Copy pathway link to clipboard"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            type="button"
            id="pathway-page-board-btn"
            onClick={onBoard}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold font-mono-board tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <TrainFront className="w-3.5 h-3.5" />
            <span>BOARD TRAIN</span>
          </button>
        </div>
      </header>

      {/* ── HERO BANNER: TRANSIT AUTHORITY SIGNAGE ── */}
      <section
        className="relative rounded-[28px] bg-stone-950 text-white p-6 sm:p-8 border border-stone-800 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ borderTop: `6px solid ${accentColor}` }}
        aria-labelledby="pathway-role-title"
      >
        <div className="absolute inset-0 opacity-10 ticket-stripes pointer-events-none" />

        {/* Top Badges Row */}
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-xs"
              style={{ background: line.color }}
            >
              {line.code}
            </span>
            <span className="font-mono-board text-xs font-bold text-amber-300 tracking-wider">
              [{station.code}]
            </span>
            <span className="text-xs font-mono-board text-stone-400">
              · {line.name.toUpperCase()} LINE
            </span>
            {rank && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-amber-400 text-stone-950">
                ★ TOP MATCH #{rank}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-board tracking-widest bg-white/10 text-stone-300 border border-white/10">
              {pathway.level.toUpperCase()}
            </span>

            {/* UN SDG Primary Badges in Header */}
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              {sdgMapping.primarySDGs.map((sdgId) => {
                const g = SDG_GOALS[sdgId]
                return (
                  <button
                    key={sdgId}
                    type="button"
                    onClick={() => setActiveTab('sdg')}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-board font-black tracking-wider text-white flex items-center gap-1 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                    style={{ background: g.color }}
                    title={`${g.name} (${g.primaryTarget})`}
                  >
                    <Globe2 className="w-2.5 h-2.5" />
                    <span>{g.badge}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono-board text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{pathway.marketDemandBadge}</span>
          </div>
        </div>

        {/* Title & Quick Stats */}
        <div className="relative mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7 space-y-2">
            <div className="text-[10.5px] font-mono-board tracking-[0.25em] text-amber-400 font-bold uppercase">
              TRANSIT CHECKPOINT CURRICULUM & SYLLABUS
            </div>
            <h1 id="pathway-role-title" className="font-signage text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[0.95]">
              {station.name.toUpperCase()}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed max-w-2xl pt-1">
              {pathway.roleOverview.summary}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono-board text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="text-stone-400 text-[10px] block font-bold">MATCH SCORE</span>
              <span className="font-bold text-emerald-400 text-xl tracking-tight">{station.fit}% FIT</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="text-stone-400 text-[10px] block font-bold">EST. JOURNEY</span>
              <span className="font-bold text-stone-100 text-xl tracking-tight">{station.months} MONTHS</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors col-span-2 sm:col-span-1">
              <span className="text-stone-400 text-[10px] block font-bold">MARKET SALARY</span>
              <span className="font-bold text-amber-300 text-sm truncate block mt-0.5">{station.salary}</span>
            </div>
          </div>
        </div>

        {/* Checkpoint Clearance Progress */}
        <div className="relative mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-mono-board text-stone-300">
              Route Progress: <strong className="text-white font-bold">{completedCount} of {totalCheckpoints} Checkpoints Cleared</strong> ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-72">
            <div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono-board text-xs font-bold text-amber-400 tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>
      </section>

      {/* ── NAVIGATION SUB-TABS ── */}
      <nav aria-label="Pathway Sections" className="sticky top-20 z-30 bg-[#FAF7F0]/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-stone-300 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            id="tab-btn-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold font-mono-board tracking-wider transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-stone-900 text-amber-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>CAREER CHECKPOINTS ({totalCheckpoints} STOPS)</span>
          </button>

          <button
            type="button"
            id="tab-btn-match"
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold font-mono-board tracking-wider transition-all cursor-pointer ${
              activeTab === 'match'
                ? 'bg-stone-900 text-amber-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>EXPLAINABLE MATCH ({station.fit}%)</span>
          </button>

          <button
            type="button"
            id="tab-btn-requirements"
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold font-mono-board tracking-wider transition-all cursor-pointer ${
              activeTab === 'requirements'
                ? 'bg-stone-900 text-amber-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>ROLE REQUIREMENTS & BLUEPRINT</span>
          </button>

          <button
            type="button"
            id="tab-btn-sdg"
            onClick={() => setActiveTab('sdg')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold font-mono-board tracking-wider transition-all cursor-pointer ${
              activeTab === 'sdg'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-rose-500" />
            <span>UN SDG IMPACT & CONTRIBUTION</span>
          </button>
        </div>

        {/* Quick Resource Filter for Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="flex items-center gap-1 text-xs font-mono-board px-1 py-0.5">
            <span className="text-stone-500 mr-1 hidden sm:flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3" /> Filter Passes:
            </span>
            <button
              type="button"
              onClick={() => setResourceFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                resourceFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              }`}
            >
              All Passes
            </button>
            <button
              type="button"
              onClick={() => setResourceFilter('free')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                resourceFilter === 'free'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => setResourceFilter('hrd-corp')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                resourceFilter === 'hrd-corp'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
              }`}
            >
              HRD Corp
            </button>
          </div>
        )}
      </nav>

      {/* ── TAB CONTENT ── */}
      <div className="space-y-6">
        {/* ══════════════════════════════════════════════════
            TAB 1: CAREER CHECKPOINTS & SYLLABUS
           ══════════════════════════════════════════════════ */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            {/* ── METRO ROUTE TIMELINE STEPPER STRIP ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-signage text-sm font-black tracking-wider text-stone-900 uppercase">
                    TRANSIT CHECKPOINT ROUTE · {pathway.checkpoints.length} STOPS TO TERMINAL
                  </span>
                </div>
                <div className="text-xs font-mono-board text-stone-500 font-bold">
                  {completedCount} OF {totalCheckpoints} CLEARED ({progressPercent}%)
                </div>
              </div>

              {/* Horizontal Rail Line Stepper */}
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex items-center min-w-[620px] gap-2 pt-2 px-1">
                  {/* Origin */}
                  <div className="flex flex-col items-center shrink-0">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono-board font-black shadow-xs">
                      ORIGIN
                    </span>
                    <span className="text-[10px] font-mono-board text-stone-500 mt-1 font-bold">CURRENT</span>
                  </div>
                  <div className="flex-1 h-1 bg-emerald-500 rounded-full min-w-[20px]" />

                  {/* Checkpoints */}
                  {pathway.checkpoints.map((cp, idx) => {
                    const isDone = completedCheckpoints.has(cp.id)
                    const isActive = cp.id === activeNextCheckpoint?.id
                    return (
                      <React.Fragment key={cp.id}>
                        <button
                          type="button"
                          onClick={() => scrollToCheckpoint(cp.id)}
                          className="flex flex-col items-center shrink-0 group cursor-pointer transition-transform hover:scale-105"
                          title={`Jump to ${cp.title}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono-board text-xs font-bold transition-all shadow-xs ${
                              isDone
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                : isActive
                                ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-200 font-black'
                                : 'bg-stone-100 text-stone-600 border border-stone-300 group-hover:border-stone-500'
                            }`}
                          >
                            {isDone ? '✓' : `0${cp.phaseNumber}`}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono-board">
                            <span
                              className={`font-bold truncate max-w-[110px] ${
                                isActive ? 'text-amber-800 font-black' : isDone ? 'text-emerald-700' : 'text-stone-500'
                              }`}
                            >
                              CP-0{cp.phaseNumber}
                            </span>
                          </div>
                        </button>
                        {idx < pathway.checkpoints.length - 1 && (
                          <div
                            className={`flex-1 h-1 rounded-full min-w-[20px] transition-colors ${
                              isDone ? 'bg-emerald-500' : 'bg-stone-200'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    )
                  })}

                  <div className="flex-1 h-1 bg-stone-200 rounded-full min-w-[20px]" />
                  {/* Terminal Destination */}
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-black shadow-xs ring-2 ring-stone-900"
                      style={{ backgroundColor: line.color }}
                    >
                      ★
                    </span>
                    <span className="text-[10px] font-mono-board text-stone-900 font-black mt-1 uppercase">
                      TERMINAL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── VERTICAL CHECKPOINTS METRO TRACK ── */}
            <div className="relative pl-7 sm:pl-16 space-y-8 before:absolute before:left-3.5 sm:before:left-7 before:top-6 before:bottom-6 before:w-1 before:bg-stone-200 before:rounded-full">
              {pathway.checkpoints.map((cp: LearningCheckpoint) => {
                const isDone = completedCheckpoints.has(cp.id)
                const isActive = cp.id === activeNextCheckpoint?.id
                const filteredResources = cp.resources.filter(filterResource)

                return (
                  <div
                    key={cp.id}
                    id={`cp-station-${cp.id}`}
                    className={`relative rounded-2xl border transition-all p-5 sm:p-7 ${
                      isDone
                        ? 'bg-[#FAFDF9] border-emerald-300 shadow-sm'
                        : isActive
                        ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-400/20'
                        : 'bg-white border-stone-200 shadow-xs hover:border-stone-300'
                    }`}
                  >
                    {/* Left Spine Station Node */}
                    <div
                      className={`absolute -left-7 sm:-left-16 top-6 w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 sm:border-[3px] flex items-center justify-center font-mono-board text-[11px] sm:text-xs font-black shadow-md transition-all ${
                        isDone
                          ? 'bg-emerald-600 border-white text-white ring-2 ring-emerald-500'
                          : isActive
                          ? 'bg-amber-400 border-white text-stone-950 ring-4 ring-amber-300 font-black'
                          : 'bg-stone-50 border-stone-300 text-stone-500'
                      }`}
                    >
                      {isDone ? '✓' : `0${cp.phaseNumber}`}
                    </div>

                    {/* Checkpoint Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-200/80">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono-board bg-stone-900 text-white tracking-wider uppercase">
                            STATION CP-0{cp.phaseNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-board font-bold bg-amber-100 text-amber-900 border border-amber-300/60">
                            ZONE {cp.phaseNumber}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-mono-board text-stone-500">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {cp.timeEstimate}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-board font-black bg-amber-400 text-stone-950 animate-pulse">
                              ● CURRENT CHECKPOINT
                            </span>
                          )}
                        </div>

                        <h2 className={`font-signage text-2xl sm:text-3xl font-black tracking-tight ${isDone ? 'text-emerald-950 line-through decoration-emerald-500/50' : 'text-stone-900'}`}>
                          {cp.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                          {cp.objective}
                        </p>
                      </div>

                      {/* Clearance Action Button */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleCheckpoint(cp.id, cp.title)}
                          className={`px-4 py-2 rounded-xl text-xs font-mono-board font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            isDone
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                              : 'bg-stone-900 hover:bg-black text-amber-300 active:scale-95'
                          }`}
                          title={isDone ? 'Mark as incomplete' : 'Clear this checkpoint (+50 XP)'}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isDone ? 'CHECKPOINT CLEARED' : 'CLEAR CHECKPOINT (+50 XP)'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Skills Gained Tags with SDG Mapping */}
                    <div className="pt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono-board font-bold text-stone-400 uppercase mr-1">
                        Competencies Gained:
                      </span>
                      {cp.skillsGained.map((sk) => {
                        const skSdg = getSkillSDG(sk)
                        return (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200"
                            title={`Advancing ${skSdg.badge}: ${skSdg.name}`}
                          >
                            <span>{sk}</span>
                            <span
                              className="px-1.5 py-0.2 rounded text-[8.5px] font-mono-board font-black text-white shadow-2xs"
                              style={{ background: skSdg.color }}
                            >
                              {skSdg.badge}
                            </span>
                          </span>
                        )
                      })}
                    </div>

                    {/* Curated Resources Section (Real Working Links) */}
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-mono-board tracking-wider text-stone-500 font-bold uppercase flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                          <span>CHECKPOINT BOARDING PASSES & CURATED RESOURCES:</span>
                        </div>
                        <span className="text-[10.5px] font-mono-board text-stone-400">
                          Click to open official material ↗
                        </span>
                      </div>

                      {filteredResources.length === 0 ? (
                        <div className="text-xs text-stone-400 italic p-3 bg-stone-50 rounded-xl">
                          No resources match the selected filter. Switch to "All Passes" to see all options.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredResources.map((res: LearningResource, rIdx: number) => {
                            const linkUrl = resolveResourceUrl(res)
                            return (
                              <a
                                key={rIdx}
                                href={linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative p-4 rounded-xl bg-stone-50/80 hover:bg-white border border-stone-200 hover:border-stone-800 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-sm"
                                title={`Open ${res.title} (${res.provider})`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[9.5px] font-black font-mono-board tracking-wider ${
                                        res.type === 'free'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80'
                                          : res.type === 'hrd-corp'
                                          ? 'bg-purple-100 text-purple-900 border border-purple-300/80'
                                          : 'bg-amber-100 text-amber-800 border border-amber-300/80'
                                      }`}
                                    >
                                      {res.cost.toUpperCase()}
                                    </span>
                                    <span className="text-[10.5px] text-stone-500 font-mono-board">{res.duration}</span>
                                  </div>

                                  <h3 className="text-sm font-bold text-stone-900 leading-snug group-hover:text-amber-800 transition-colors">
                                    {res.title}
                                  </h3>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-600 font-medium">
                                  <span className="flex items-center gap-1.5 text-stone-800 font-semibold group-hover:text-stone-950">
                                    <span>{res.provider}</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                  </span>
                                  <span className="text-[10px] font-mono-board text-stone-400 uppercase font-bold">
                                    {res.format}
                                  </span>
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Practical Portfolio Project Deliverable */}
                    <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#FAF6EE] border border-amber-300/60 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono-board text-stone-900 font-black uppercase">
                          <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>CLEARANCE INSPECTION CRITERIA: {cp.practicalProject.title}</span>
                        </div>
                        <span className="text-[10.5px] font-mono-board text-stone-500 font-bold">
                          {cp.practicalProject.deliverables.filter((d) => completedTasks.has(`${cp.id}-${d}`)).length} OF {cp.practicalProject.deliverables.length} VERIFIED
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {cp.practicalProject.summary}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10.5px] font-mono-board text-stone-400 uppercase font-bold">
                          Interactive Deliverable Checklist:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {cp.practicalProject.deliverables.map((deliv, dIdx) => {
                            const taskId = `${cp.id}-${deliv}`
                            const isTaskDone = completedTasks.has(taskId)
                            return (
                              <button
                                key={dIdx}
                                type="button"
                                onClick={() => toggleTask(taskId)}
                                className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                                  isTaskDone
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    isTaskDone
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-stone-300 text-transparent'
                                  }`}
                                >
                                  ✓
                                </span>
                                <span className={`truncate ${isTaskDone ? 'line-through decoration-emerald-400' : ''}`}>
                                  {deliv}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Certificate Badge */}
                    {cp.certificate && (
                      <div className="mt-3.5 flex items-center justify-between flex-wrap gap-2 text-xs text-stone-700 bg-stone-100/90 px-3.5 py-2.5 rounded-xl border border-stone-200">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>
                            Target Credential: <strong className="text-stone-900">{cp.certificate.name}</strong> · Issued by {cp.certificate.issuer}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-board text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold uppercase">
                          {cp.certificate.badgeType}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: EXPLAINABLE MATCH SCORE & ANALYSIS
           ══════════════════════════════════════════════════ */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            {/* Score Rationale Card */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono-board tracking-widest text-stone-500 uppercase font-bold">
                    ALGORITHMIC MATCH EXPLANATION
                  </div>
                  <h2 className="font-signage text-3xl font-black text-stone-900">
                    Why You Scored {pathway.explainableMatch.overallScore}% Fit
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono-board text-xs font-bold self-start sm:self-auto">
                  HIGH PROBABILITY TRANSITION
                </div>
              </div>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                {pathway.explainableMatch.summaryRationale}
              </p>
            </div>

            {/* Score Factor Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pathway.explainableMatch.factors.map((factor, fIdx) => {
                const isPos = factor.status === 'positive'
                const isMarket = factor.status === 'market'

                return (
                  <div
                    key={fIdx}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                      isPos
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : isMarket
                        ? 'bg-amber-50/50 border-amber-300'
                        : 'bg-rose-50/50 border-rose-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-board uppercase font-bold tracking-wider text-stone-500">
                          {factor.status === 'positive' ? 'STRENGTH FACTOR' : factor.status === 'market' ? 'MARKET SIGNAL' : 'GAP TO BRIDGE'}
                        </span>
                        <span
                          className={`font-mono-board text-xs font-black px-2 py-0.5 rounded-md ${
                            factor.weight > 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {factor.weight > 0 ? `+${factor.weight}` : factor.weight} PTS
                        </span>
                      </div>
                      <h3 className="font-signage text-lg font-bold text-stone-900 mt-2">
                        {factor.label}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {factor.detail}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 text-[10.5px] font-mono-board font-medium text-stone-400">
                      Calibrated against APAC hiring signals
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Strengths and Gaps Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-signage text-xl font-black">
                  <Check className="w-5 h-5" />
                  <span>Strengths You Bring (Transferable Assets)</span>
                </div>
                <ul className="space-y-2">
                  {pathway.explainableMatch.strengthsYouBring.map((st, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-700 font-signage text-xl font-black">
                  <Sparkles className="w-5 h-5" />
                  <span>Primary Gaps To Bridge Through Reskilling</span>
                </div>
                <ul className="space-y-2">
                  {pathway.explainableMatch.criticalGapsToClose.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: ROLE REQUIREMENTS & TECH STACK
           ══════════════════════════════════════════════════ */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            {/* Responsibilities */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
              <div className="text-[10px] font-mono-board tracking-widest text-stone-500 uppercase font-bold">
                DAY-TO-DAY BLUEPRINT
              </div>
              <h2 className="font-signage text-2xl sm:text-3xl font-black text-stone-900">
                Core Responsibilities for {station.name}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pathway.roleOverview.responsibilities.map((resp: string, rIdx: number) => (
                  <li key={rIdx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3 text-xs sm:text-sm text-stone-700 leading-snug">
                    <span className="font-mono-board text-xs font-bold text-amber-600 mt-0.5">0{rIdx + 1}</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites & Tech Stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                <div className="font-signage text-xl font-black text-stone-900">
                  Prerequisites Expected
                </div>
                <ul className="space-y-2">
                  {pathway.roleOverview.prerequisites.map((pr: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                <div className="font-signage text-xl font-black text-stone-900">
                  Target Tech Stack
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {pathway.roleOverview.coreTechStack.map((tech: string) => {
                    const isHave = station.skillsHave.some((h) => tech.toLowerCase().includes(h.toLowerCase()))
                    const skSdg = getSkillSDG(tech)
                    return (
                      <span
                        key={tech}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          isHave
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-stone-100 text-stone-800 border border-stone-300'
                        }`}
                      >
                        {isHave ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        <span>{tech}</span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[8.5px] font-mono-board font-black text-white shadow-2xs"
                          style={{ background: skSdg.color }}
                          title={`${skSdg.badge}: ${skSdg.name}`}
                        >
                          {skSdg.badge}
                        </span>
                        {isHave && <span className="text-[10px] font-mono-board text-emerald-700 font-bold">(IN HAND)</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: UN SDG IMPACT & SUSTAINABILITY CONTRIBUTION
           ══════════════════════════════════════════════════ */}
        {activeTab === 'sdg' && (
          <div className="space-y-6">
            {/* Hero SDG Impact Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-rose-950 text-white border border-stone-800 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-mono-board tracking-[0.2em] uppercase font-bold text-rose-300">
                    UNITED NATIONS SUSTAINABLE DEVELOPMENT GOALS (SDG) ALIGNMENT
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono-board font-bold bg-white/10 text-amber-300 border border-white/15">
                  LEAD {sdgMapping.leadTarget}
                </span>
              </div>

              <div>
                <h2 className="font-signage text-2xl sm:text-3xl font-black text-white">
                  {sdgMapping.impactHeadline}
                </h2>
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-4xl pt-2">
                  {sdgMapping.contributionNarrative}
                </p>
              </div>
            </div>

            {/* Primary SDGs Championed Cards */}
            <div className="space-y-3">
              <div className="text-xs font-mono-board tracking-wider text-stone-500 uppercase font-bold">
                GLOBAL GOALS CHAMPIONED BY THIS RESKILLING ROUTE:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sdgMapping.primarySDGs.map((sdgId) => {
                  const g = SDG_GOALS[sdgId]
                  return (
                    <div
                      key={sdgId}
                      className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:shadow-sm transition-all"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: g.color }} />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-mono-board font-black text-white shadow-xs"
                            style={{ background: g.color }}
                          >
                            {g.badge}
                          </span>
                          <span className="text-xs font-mono-board font-bold text-stone-500">
                            {g.primaryTarget}
                          </span>
                        </div>

                        <h3 className="font-signage text-xl font-bold text-stone-900 pt-1">
                          {g.name}
                        </h3>

                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>UN Target:</strong> {g.targetDescription}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 leading-relaxed">
                        <strong className="text-stone-900 font-semibold block mb-0.5">How this role makes an impact:</strong>
                        {g.careerImpactTheme}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Skill-to-SDG Contribution Matrix */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div>
                  <div className="text-[10px] font-mono-board tracking-widest text-stone-500 uppercase font-bold">
                    TECHNICAL COMPETENCY BREAKDOWN
                  </div>
                  <h3 className="font-signage text-xl sm:text-2xl font-black text-stone-900">
                    Skill-to-SDG Contribution Matrix
                  </h3>
                </div>
                <span className="text-xs font-mono-board text-stone-500">
                  {sdgMapping.skillContributions.length} Competencies Mapped
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {sdgMapping.skillContributions.map((item, idx) => {
                  const g = SDG_GOALS[item.sdgId]
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-col justify-between space-y-2 hover:bg-stone-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-board text-xs font-bold text-stone-900">
                          {item.skill}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono-board font-black text-white shadow-2xs"
                          style={{ background: g.color }}
                        >
                          {g.badge}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.howItHelps}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* National & Socio-Economic Impact Statement */}
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-300 text-stone-900 space-y-2">
              <h4 className="font-signage text-lg font-bold text-amber-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Malaysian & Regional Workforce Alignment</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                By grounding technical training in accredited national reskilling programs (<strong>HRD Corp Claimable</strong>) and high-quality open educational resources (<strong>SDG 4</strong>), JobTransit reduces friction for career changers and graduates, directly supporting national targets under the Malaysia Digital Economy Blueprint (MyDIGITAL) and the National AI Roadmap (<strong>SDG 8 & SDG 9</strong>).
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
