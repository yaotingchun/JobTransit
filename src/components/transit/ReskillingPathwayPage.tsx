import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Award,
  Layers,
  Clock,
  Sparkles,
  TrendingUp,
  FileCheck,
  Check,
  Filter,
  GraduationCap,
  Briefcase,
  Target,
  Share2,
  BookmarkCheck,
  ChevronRight,
  TrainFront,
} from 'lucide-react'
import { getReskillingPathway, type LearningCheckpoint, type LearningResource } from './pathwayData'
import { LINES, RANK_COLORS, type Station } from './transitData'

interface ReskillingPathwayPageProps {
  station: Station
  allStations: Station[]
  onBackToMap: () => void
  onSelectStation: (stationId: string) => void
  onBoard: () => void
  completedCheckpoints: Set<string>
  onToggleCheckpoint: (checkpointId: string, title: string) => void
}

type TabKey = 'checklist' | 'match' | 'requirements'
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

  const pathway = getReskillingPathway(station.id, station.name, station.code)
  const line = LINES[station.lines[0]]
  const rank = station.topRank
  const accentColor = rank ? RANK_COLORS[rank].ring : line.color

  // Checkpoint completion calculation
  const totalCheckpoints = pathway.checkpoints.length
  const completedCount = pathway.checkpoints.filter((cp) => completedCheckpoints.has(cp.id)).length
  const progressPercent = Math.round((completedCount / (totalCheckpoints || 1)) * 100)

  const filterResource = (res: LearningResource) => {
    if (resourceFilter === 'free') return res.type === 'free'
    if (resourceFilter === 'hrd-corp') return res.type === 'hrd-corp'
    return true
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <article className="w-full space-y-6 pb-20 animate-in fade-in duration-300" aria-label="Personalised Reskilling Pathway">
      {/* ── TOP BREADCRUMB & CONTROL BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 text-stone-100 p-3 sm:px-5 sm:py-3.5 rounded-2xl border border-stone-800 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="back-to-map-btn"
            onClick={onBackToMap}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold font-mono-board tracking-wider text-stone-200 hover:text-white transition-all cursor-pointer group active:scale-95"
            title="Return to Career Metro Map (Esc)"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-amber-400" />
            <span>BACK TO METRO MAP</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono-board bg-black/40 rounded border border-white/20 text-stone-400">
              ESC
            </kbd>
          </button>

          <span className="text-stone-600 hidden md:inline">|</span>

          {/* Destination Switcher Pills */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono-board">
            <span className="text-stone-400 text-[11px] mr-1">DESTINATIONS:</span>
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono-board text-stone-300 hover:text-white transition-all cursor-pointer"
            title="Bookmark destination to Transit Card"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Save Card</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono-board text-stone-300 hover:text-white transition-all cursor-pointer"
            title="Copy pathway link to clipboard"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share Pathway'}</span>
          </button>

          <button
            type="button"
            id="pathway-page-board-btn"
            onClick={onBoard}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold font-mono-board tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <TrainFront className="w-3.5 h-3.5" />
            <span>BOARD THIS ROLE</span>
          </button>
        </div>
      </div>

      {/* ── HERO BANNER: ENAMEL TRANSIT AUTHORITY SIGNAGE ── */}
      <section
        className="relative rounded-[30px] bg-stone-950 text-white p-6 sm:p-8 border-2 border-stone-800 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
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
              · {line.name.toUpperCase()}
            </span>
            {rank && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-amber-400 text-stone-950">
                ★ TOP MATCH #{rank}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-board tracking-widest bg-white/10 text-stone-300">
              {pathway.level.toUpperCase()}
            </span>
          </div>

          <div className="text-[11px] font-mono-board text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{pathway.marketDemandBadge}</span>
          </div>
        </div>

        {/* Title & Quick Stats */}
        <div className="relative mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7 space-y-2">
            <div className="text-[11px] font-mono-board tracking-[0.25em] text-amber-400/90 uppercase">
              PERSONALISED RESKILLING PATHWAY & CURRICULUM
            </div>
            <h1 id="pathway-role-title" className="font-signage text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[0.95]">
              {station.name.toUpperCase()}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed max-w-2xl pt-1">
              {pathway.roleOverview.summary}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono-board text-left">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-stone-400 text-[10px] block">MATCH SCORE</span>
              <span className="font-bold text-emerald-400 text-xl">{station.fit}% FIT</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-stone-400 text-[10px] block">EST. JOURNEY</span>
              <span className="font-bold text-stone-100 text-xl">{station.months} MONTHS</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 col-span-2 sm:col-span-1">
              <span className="text-stone-400 text-[10px] block">TYPICAL SALARY</span>
              <span className="font-bold text-amber-300 text-sm truncate block mt-0.5">{station.salary}</span>
            </div>
          </div>
        </div>

        {/* Pathway Progress Tracker */}
        <div className="relative mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-mono-board text-stone-300">
              Pathway Progress: <strong className="text-white">{completedCount} of {totalCheckpoints} Checkpoints Cleared</strong> ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-72">
            <div className="flex-1 h-2.5 rounded-full bg-white/15 overflow-hidden">
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
      <div className="sticky top-20 z-30 bg-[#F3EFE6]/95 backdrop-blur-md p-2 rounded-2xl border border-stone-300 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            id="tab-btn-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono-board tracking-wider transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>LEARNING CHECKLIST ({totalCheckpoints} STEPS)</span>
          </button>

          <button
            type="button"
            id="tab-btn-match"
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono-board tracking-wider transition-all cursor-pointer ${
              activeTab === 'match'
                ? 'bg-stone-900 text-white shadow-sm'
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono-board tracking-wider transition-all cursor-pointer ${
              activeTab === 'requirements'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>ROLE REQUIREMENTS & SKILL GAPS</span>
          </button>
        </div>

        {/* Quick Resource Filter for Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="flex items-center gap-1.5 text-xs font-mono-board px-2 py-1">
            <span className="text-stone-500 mr-1 flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setResourceFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                resourceFilter === 'all' ? 'bg-stone-800 text-white shadow-xs' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              }`}
            >
              All Resources
            </button>
            <button
              type="button"
              onClick={() => setResourceFilter('free')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                resourceFilter === 'free' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              Free Only
            </button>
            <button
              type="button"
              onClick={() => setResourceFilter('hrd-corp')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                resourceFilter === 'hrd-corp' ? 'bg-purple-700 text-white shadow-xs' : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
              }`}
            >
              HRD Corp (Claimable)
            </button>
          </div>
        )}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="space-y-6">
        {/* ══════════════════════════════════════════════════
            TAB 1: ORDERED LEARNING CHECKLIST & TIMELINE
           ══════════════════════════════════════════════════ */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            {/* Timeline Guide Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-signage text-lg font-black text-amber-950 uppercase tracking-wide">
                  Ordered Chronological Learning Schedule
                </div>
                <p className="text-stone-700 max-w-xl">
                  Each phase builds on the previous one. Clear the practical project and learning resources to mark the checkpoint done and earn XP.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono-board text-xs font-bold text-amber-900 bg-amber-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>+50 XP per cleared checkpoint</span>
              </div>
            </div>

            {/* Checkpoints Stepper */}
            <div className="space-y-6">
              {pathway.checkpoints.map((cp: LearningCheckpoint) => {
                const isDone = completedCheckpoints.has(cp.id)
                const filteredResources = cp.resources.filter(filterResource)

                return (
                  <div
                    key={cp.id}
                    className={`relative rounded-3xl border-2 transition-all p-6 sm:p-7 ${
                      isDone
                        ? 'bg-emerald-500/5 border-emerald-600/40 shadow-xs'
                        : 'bg-white border-stone-300 shadow-sm hover:border-stone-400'
                    }`}
                  >
                    {/* Checkpoint Header & Title */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() => onToggleCheckpoint(cp.id, cp.title)}
                          className="mt-1 text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                          title={isDone ? 'Mark as incomplete' : 'Mark checkpoint complete (+50 XP)'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-7 h-7 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-7 h-7 hover:stroke-emerald-500 text-stone-400" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono-board bg-stone-900 text-white tracking-wider">
                              PHASE {cp.phaseNumber}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-mono-board text-stone-500">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              {cp.timeEstimate}
                            </span>
                          </div>
                          <h2 className={`font-signage text-2xl sm:text-3xl font-bold tracking-wide ${isDone ? 'text-emerald-950 line-through decoration-emerald-500/50' : 'text-stone-900'}`}>
                            {cp.title}
                          </h2>
                          <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">{cp.objective}</p>
                        </div>
                      </div>

                      {/* Skills Gained Tags */}
                      <div className="flex flex-wrap gap-1.5 sm:max-w-xs sm:justify-end pl-11 sm:pl-0">
                        {cp.skillsGained.map((sk) => (
                          <span
                            key={sk}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Curated Resources Section */}
                    <div className="mt-5 pt-4 border-t border-stone-200 space-y-3">
                      <div className="text-[11px] font-mono-board tracking-wider text-stone-500 font-bold uppercase">
                        CURATED LEARNING PROGRAMMES & RESOURCES:
                      </div>

                      {filteredResources.length === 0 ? (
                        <div className="text-xs text-stone-400 italic p-3 bg-stone-50 rounded-xl">
                          No resources match the selected filter. Switch to "All Resources" to see all options.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredResources.map((res: LearningResource, rIdx: number) => (
                            <div
                              key={rIdx}
                              className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 flex flex-col justify-between hover:bg-stone-100 transition-colors shadow-xs"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9.5px] font-black font-mono-board tracking-wider ${
                                      res.type === 'free'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : res.type === 'hrd-corp'
                                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}
                                  >
                                    {res.cost.toUpperCase()}
                                  </span>
                                  <span className="text-[10.5px] text-stone-500 font-mono-board">{res.duration}</span>
                                </div>

                                <h3 className="text-sm font-bold text-stone-900 leading-snug">
                                  {res.title}
                                </h3>
                              </div>

                              <div className="mt-3 pt-2 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-600 font-medium">
                                <span className="flex items-center gap-1 text-stone-700">
                                  <span>{res.provider}</span>
                                  <ExternalLink className="w-3 h-3 text-stone-400 opacity-60" />
                                </span>
                                <span className="text-[10px] font-mono-board text-stone-400 uppercase">{res.format}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Practical Portfolio Project Deliverable */}
                    <div className="mt-4 p-4 rounded-2xl bg-[#FAF6EE] border border-amber-300/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono-board text-stone-900 font-bold uppercase">
                        <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>PRACTICAL PROJECT DELIVERABLE: {cp.practicalProject.title}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{cp.practicalProject.summary}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {cp.practicalProject.deliverables.map((deliv, dIdx) => (
                          <span key={dIdx} className="inline-flex items-center gap-1.5 text-xs text-stone-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {deliv}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certificate Badge */}
                    {cp.certificate && (
                      <div className="mt-3 flex items-center gap-2.5 text-xs text-stone-700 bg-stone-100/80 px-3.5 py-2 rounded-xl border border-stone-200">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Target Credential: <strong>{cp.certificate.name}</strong> · Issued by {cp.certificate.issuer}</span>
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
            <div className="p-6 rounded-3xl bg-white border-2 border-stone-300 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono-board tracking-widest text-stone-500 uppercase">
                    ALGORITHMIC MATCH EXPLANATION
                  </div>
                  <h2 className="font-signage text-3xl font-black text-stone-900">
                    Why You Scored {pathway.explainableMatch.overallScore}% Fit
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono-board text-sm font-bold self-start sm:self-auto">
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
                    className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-3 ${
                      isPos
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : isMarket
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-rose-50/60 border-rose-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-board uppercase font-bold tracking-wider text-stone-500">
                          {factor.status === 'positive' ? 'STRENGTH FACTOR' : factor.status === 'market' ? 'MARKET FACTOR' : 'GAP FACTOR'}
                        </span>
                        <span
                          className={`font-mono-board text-sm font-black px-2 py-0.5 rounded-md ${
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

                    <div className="pt-2 border-t border-stone-300/40 text-[11px] font-mono-board font-medium text-stone-500">
                      Weighted against APAC hiring signals
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Strengths and Gaps Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
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

              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
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
            <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-stone-300 shadow-sm space-y-4">
              <div className="text-[10px] font-mono-board tracking-widest text-stone-500 uppercase">
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
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
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

              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
                <div className="font-signage text-xl font-black text-stone-900">
                  Target Tech Stack
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {pathway.roleOverview.coreTechStack.map((tech: string) => {
                    const isHave = station.skillsHave.some((h) => tech.toLowerCase().includes(h.toLowerCase()))
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
                        {isHave && <span className="text-[10px] font-mono-board text-emerald-700 font-bold">(VERIFIED IN HAND)</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM STICKY ACTION BAR ── */}
      <div className="sticky bottom-4 z-30 p-4 sm:px-6 sm:py-4 rounded-2xl bg-stone-950/95 text-white border border-stone-800 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMap}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold font-mono-board text-stone-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>RETURN TO METRO MAP</span>
          </button>
          <span className="text-xs text-stone-400 font-mono-board hidden md:inline">
            Destination: <strong className="text-amber-300">{station.name}</strong> ({station.salary})
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            id="bottom-board-btn"
            onClick={onBoard}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold font-mono-board tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>BOARD DESTINATION TRAIN</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
