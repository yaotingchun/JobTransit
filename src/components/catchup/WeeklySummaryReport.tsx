import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  ArrowRight,
  Share2,
  Check,
  Calendar,
  Clock,
  RotateCw,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  ListFilter,
  RefreshCw,
  X,
  Target,
  Flame,
} from 'lucide-react'
import type { NavTab, UserProfile } from '../Navbar'
import { useWeeklySummary } from '../../hooks/useWeeklySummary'
import { WeeklyTrendPulseCard } from './WeeklyTrendPulseCard'

export interface WeeklySummaryReportProps {
  currentUser: UserProfile
  onSelectTab: (tab: NavTab) => void
  onSkillClick: (skill: string, e: React.MouseEvent) => void
  liveArticles?: any[]
}

function getCategoryBadge(cat: string) {
  switch (cat) {
    case 'ai-ml':
      return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', label: 'AI & Machine Learning' }
    case 'software-engineering':
      return { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'Software Engineering' }
    case 'data-cloud':
      return { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', label: 'Data & Cloud' }
    case 'security':
      return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Cybersecurity' }
    case 'career-industry':
      return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Industry & Careers' }
    default:
      return { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', label: 'General Tech' }
  }
}

/** Deterministic pseudo-barcode from a string (matching Transit StationTicket). */
const TicketBarcode: React.FC<{ seed: string }> = ({ seed }) => {
  const bars: number[] = []
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  for (let i = 0; i < 30; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    bars.push(1 + (h % 3))
  }
  let x = 0
  return (
    <svg width="100%" height="22" viewBox="0 0 120 22" preserveAspectRatio="none" className="opacity-40">
      {bars.map((b, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={b} height="22" fill="#1C1917" /> : null
        x += b + 0.8
        return rect
      })}
    </svg>
  )
}

export const WeeklySummaryReport: React.FC<WeeklySummaryReportProps> = ({
  currentUser,
  onSelectTab,
  onSkillClick,
}) => {
  const {
    summary,
    topArticles,
    candidateArticles,
    isRecompiling,
    recompileMessage,
    countdownStr,
    swapArticle,
    redoWeeklySummary,
  } = useWeeklySummary()

  const [viewStyle, setViewStyle] = useState<'stories' | 'list'>('stories')
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [storyProgress, setStoryProgress] = useState(0) // 0 to 100
  const [swapModalSlot, setSwapModalSlot] = useState<number | null>(null)

  const STORY_DURATION_MS = 20000 // 20s auto-advance per story
  const TICK_INTERVAL_MS = 100
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Stories auto-play timer
  useEffect(() => {
    if (viewStyle !== 'stories' || !isPlaying || topArticles.length === 0) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      return
    }

    progressTimerRef.current = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story
          setActiveStoryIdx((idx) => {
            if (idx + 1 < topArticles.length) return idx + 1
            setIsPlaying(false) // Finished all 5 stories
            return idx
          })
          return 0
        }
        return prev + (TICK_INTERVAL_MS / STORY_DURATION_MS) * 100
      })
    }, TICK_INTERVAL_MS)

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [viewStyle, isPlaying, topArticles.length, activeStoryIdx])

  const handleNextStory = () => {
    setStoryProgress(0)
    if (activeStoryIdx < topArticles.length - 1) {
      setActiveStoryIdx((prev) => prev + 1)
    } else {
      setActiveStoryIdx(0)
    }
  }

  const handlePrevStory = () => {
    setStoryProgress(0)
    if (activeStoryIdx > 0) {
      setActiveStoryIdx((prev) => prev - 1)
    } else {
      setActiveStoryIdx(topArticles.length - 1)
    }
  }

  const handleShare = () => {
    setCopiedLink(true)
    navigator.clipboard?.writeText(window.location.href)
    setTimeout(() => setCopiedLink(false), 2200)
  }

  const activeArticle = topArticles[activeStoryIdx] || topArticles[0]

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-16 transit-root">

      {/* =========================================================================
          TOP BANNER: WEEKLY FLASH HEADER + WEEKLY CYCLE HUD (Matches Transit Tab Header)
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          {/* Top Mission / Tag Pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em] shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Weekly Flash · Top 5 Briefs</span>
            </div>
            <span className="text-xs font-mono-board text-stone-700 font-bold bg-white/90 px-3 py-1 rounded-full border border-stone-300 shadow-2xs">
              Issue No. {summary.issueNumber}
            </span>
            <span className="text-xs font-mono-board text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>⏱️ ~{summary.totalReadTimeMinutes} Min Fast Read</span>
            </span>
          </div>

          {/* Big Signage Title with Outlined Stroke Accent matching Screenshot */}
          <h1 className="font-signage text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[0.9] mt-3">
            WEEKLY TECH<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> FLASH</span>
          </h1>

          <div className="text-xs sm:text-sm font-mono-board font-bold text-amber-800 mt-1.5 uppercase tracking-wider">
            Weekly Tech Flash · Top 5 Defining Breakthroughs
          </div>

          <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-xl font-medium leading-relaxed">
            Curated from the past 7 days across global tech and engineering. Tailored for {currentUser?.name || 'Explorer'}, locked on Sunday night so you can master the week in 5 minutes every Monday morning.
          </p>

          <div className="text-xs font-mono-board text-stone-500 mt-2.5 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold text-stone-700">{summary.weekRange}</span>
            <span>·</span>
            <span className="text-emerald-700 font-bold">Monday Morning Edition</span>
          </div>
        </div>

        {/* Weekly Cycle HUD Card (Matches Player HUD in screenshot!) */}
        <div className="hud-card rounded-[24px] p-3.5 pr-5 flex items-center gap-4 self-start lg:self-auto shrink-0 shadow-lg">
          {/* Circular Level / Issue Gauge */}
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r={26} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r={26}
                fill="none"
                stroke="#FBBF24"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={163.36}
                strokeDashoffset={32.67}
                style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[8px] font-mono-board text-stone-400 tracking-widest leading-none">ISSUE</span>
              <span className="font-signage text-2xl font-black text-white leading-none">{summary.issueNumber}</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-mono-board tracking-[0.2em] text-amber-300 font-bold">
              Weekly Cycle Status
            </div>
            <div className="font-signage text-xl font-black text-white tracking-wide leading-tight flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>{countdownStr}</span>
            </div>
            <div className="text-[10px] font-mono-board text-stone-400 tabular-nums">
              ⏱️ ~{summary.totalReadTimeMinutes} Min Fast Read
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-3 gap-3 pl-4 border-l border-white/10">
            <div className="text-center">
              <Flame className="w-4 h-4 mx-auto text-amber-400" />
              <div className="font-mono-board text-sm font-bold text-white tabular-nums mt-0.5">{topArticles.length}</div>
              <div className="text-[8.5px] font-mono-board text-stone-400 tracking-widest">BRIEFS</div>
            </div>
            <div className="text-center">
              <RotateCw className="w-4 h-4 mx-auto text-sky-400" />
              <div className="font-mono-board text-sm font-bold text-white tabular-nums mt-0.5">SUN</div>
              <div className="text-[8.5px] font-mono-board text-stone-400 tracking-widest">LOCKED</div>
            </div>
            <div className="text-center">
              <Target className="w-4 h-4 mx-auto text-emerald-400" />
              <div className="font-mono-board text-sm font-bold text-white tabular-nums mt-0.5">5/5</div>
              <div className="text-[8.5px] font-mono-board text-stone-400 tracking-widest">CHARTED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recompile feedback banner */}
      {recompileMessage && (
        <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs font-medium text-amber-900 flex items-center gap-2 animate-in fade-in font-mono-board shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{recompileMessage}</span>
        </div>
      )}

      {/* Control Dock: Mode Switcher + Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Mode Switcher pill dock */}
        <div className="inline-flex p-1.5 rounded-full bg-stone-950 border border-stone-800 shadow-md gap-2 font-mono-board">
          <button
            type="button"
            onClick={() => {
              setViewStyle('stories')
              setIsPlaying(true)
              setStoryProgress(0)
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
              viewStyle === 'stories'
                ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.02]'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-stone-950 fill-current" />
            <span>📱 Flash Stories (Auto-Play Reel)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewStyle('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
              viewStyle === 'list'
                ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.02]'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-stone-950" />
            <span>📑 One-Pager Scan (Full List)</span>
          </button>
        </div>

        {/* Action Tools: Redo Button + Share */}
        <div className="flex items-center gap-2 font-mono-board">
          <button
            type="button"
            onClick={redoWeeklySummary}
            disabled={isRecompiling}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${
              isRecompiling
                ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                : 'bg-stone-900 hover:bg-black text-amber-300 border-stone-800'
            }`}
            title="Re-aggregate and re-rank this week's top 5 developments (editable until Sunday night)"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRecompiling ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRecompiling ? 'Aggregating...' : 'Redo Weekly Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-200 hover:border-stone-400 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Share this weekly issue"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-600" />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="text-[11px] font-mono-board text-stone-500 font-medium pl-1">
        Supports swapping any card with candidate pool alternatives
      </div>

      {/* =========================================================================
          FEATURE 1: WEEKLY TREND PULSE (Departure Board Style)
          ========================================================================= */}
      <WeeklyTrendPulseCard
        pulse={summary.trendPulse}
        weekNumber={summary.issueNumber}
        onSkillClick={onSkillClick}
      />

      {/* =========================================================================
          MODE 1: STORIES / REELS 45s EXPRESS VIEWER (Enamel Cabin Frame)
          ========================================================================= */}
      {viewStyle === 'stories' && activeArticle && (
        <section className="map-frame rounded-[30px] p-2.5 shadow-2xl">
          <div className="rounded-[22px] board-panel text-white p-6 sm:p-10 relative overflow-hidden border border-stone-800">
            {/* Subtle Ambient Background Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* 1. Multi-Segment Progress Bars (Top 5 Stories) */}
            <div className="grid grid-cols-5 gap-2 pb-6 relative z-10">
              {topArticles.map((art, idx) => {
                let pct = 0
                if (idx < activeStoryIdx) pct = 100
                else if (idx === activeStoryIdx) pct = storyProgress
                else pct = 0

                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => {
                      setActiveStoryIdx(idx)
                      setStoryProgress(0)
                    }}
                    className="h-1.5 rounded-full bg-stone-800 overflow-hidden cursor-pointer group hover:h-2 transition-all relative"
                    title={`Jump to Story ${idx + 1}`}
                  >
                    <div
                      className="h-full bg-amber-400 transition-all duration-100 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </button>
                )
              })}
            </div>

            {/* 2. Story Header Row: Category Badge + Counter + Play/Pause Control */}
            <div className="flex items-center justify-between pb-5 border-b border-stone-800/80 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono-board font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs">
                  ⚡ Flash #{activeArticle.number} · {activeArticle.categoryLabel}
                </span>
                <span className="text-xs font-mono-board text-stone-400 font-semibold">
                  Story {activeStoryIdx + 1} of {topArticles.length}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono-board">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 cursor-pointer transition-all shadow-2xs"
                  title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSwapModalSlot(activeStoryIdx)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-amber-300 border border-amber-500/40 cursor-pointer transition-all shadow-2xs"
                  title="Swap with an alternative story from this week's candidate pool"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              </div>
            </div>

            {/* 3. Main Story Content */}
            <div className="py-7 space-y-6 relative z-10">
              {/* Title with Source Link */}
              <div className="space-y-2">
                <a
                  href={activeArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-signage text-3xl sm:text-5xl font-black text-white hover:text-amber-300 transition-colors leading-tight inline-flex items-start gap-2 group/link tracking-wide uppercase"
                >
                  <span>{activeArticle.title}</span>
                  <ExternalLink className="w-6 h-6 text-stone-500 group-hover/link:text-amber-300 shrink-0 mt-1 transition-colors" />
                </a>
                <div className="text-xs font-mono-board text-stone-400 font-medium flex items-center gap-2">
                  <span>Source: {activeArticle.sourceName}</span>
                  <span>·</span>
                  <span>Weekly Impact Score: {activeArticle.weeklyScore}</span>
                  <span>·</span>
                  <span>⏱️ ~45s read</span>
                </div>
              </div>

              {/* 🎯 CORE VERDICT CALLOUT (One-Sentence Summary) */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-400 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono-board font-black uppercase tracking-wider text-amber-300">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>🎯 Core Takeaway (What Happened)</span>
                </div>
                <p className="text-sm sm:text-base text-stone-100 font-medium leading-relaxed">
                  {activeArticle.coreVerdict}
                </p>
              </div>

              {/* 💡 WHY IT MATTERS */}
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono-board font-black uppercase tracking-wider text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>💡 Why It Matters (Industry & Career Impact)</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
                  {activeArticle.whyItMatters}
                </p>
              </div>

              {/* NEXT TRANSIT */}
              <div className="pt-2 flex items-center justify-end gap-4 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => onSelectTab('transit')}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-board font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <span>Explore Transit</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
                </button>
              </div>
            </div>

            {/* 4. Stories Bottom Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-800/80 relative z-10 font-mono-board">
              <button
                type="button"
                onClick={handlePrevStory}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold border border-stone-800 cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-stone-500 hidden sm:block">
                [Keyboard: ← / → to navigate · Space to pause]
              </div>

              <button
                type="button"
                onClick={handleNextStory}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold border border-stone-800 cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          MODE 2: ONE-PAGER SCAN LIST (Station Tickets with Stripes)
          ========================================================================= */}
      {viewStyle === 'list' && (
        <section className="space-y-5">
          {topArticles.map((art, idx) => {
            const badge = getCategoryBadge(art.category)
            return (
              <article
                key={art.id}
                className="ticket-paper bg-[#FAF7F0] border-2 border-stone-900 rounded-[26px] overflow-hidden shadow-[6px_6px_0_0_rgba(28,25,23,0.95)] transition-all group relative"
              >
                {/* Station Ticket Diagonal Stripes Header Bar (matching screenshot) */}
                <div className="relative px-5 py-3 bg-amber-400 text-stone-950 flex items-center justify-between border-b-2 border-stone-900 font-mono-board overflow-hidden">
                  <div className="absolute inset-0 opacity-20 ticket-stripes pointer-events-none" />
                  <div className="relative flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-stone-950 text-amber-300 font-mono-board font-black text-xs flex items-center justify-center shadow-xs">
                      {art.number}
                    </span>
                    <span className="text-xs font-mono-board font-black tracking-widest uppercase text-stone-950">
                      {art.categoryLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSwapModalSlot(idx)}
                    className="relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-board font-bold text-amber-300 bg-stone-950 hover:bg-black border border-stone-900 transition-colors cursor-pointer shadow-xs active:scale-95"
                    title="Swap with an alternative story from candidate pool"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                </div>

                <div className="p-6 sm:p-7 space-y-4">
                  {/* Title */}
                  <div>
                    <a
                      href={art.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-signage text-2xl sm:text-3xl font-black text-stone-900 hover:text-amber-600 transition-colors inline-flex items-start gap-2 tracking-wide leading-snug uppercase group/link"
                    >
                      <span>{art.title}</span>
                      <ExternalLink className="w-4 h-4 text-stone-400 group-hover/link:text-amber-600 shrink-0 mt-1" />
                    </a>
                    <div className="text-xs font-mono-board text-stone-500 pt-1">
                      Source: {art.sourceName} · Impact Score: {art.weeklyScore} · ⏱️ ~45s read
                    </div>
                  </div>

                  {/* Core Verdict Callout */}
                  <div className="p-4 rounded-xl bg-amber-50/90 border-l-4 border-amber-500 space-y-1 shadow-2xs">
                    <div className="text-[11px] font-mono-board font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Target className="w-3.5 h-3.5 text-amber-600" />
                      <span>Core Takeaway</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      {art.coreVerdict}
                    </p>
                  </div>

                  {/* Why It Matters */}
                  <div className="text-xs text-stone-600 leading-relaxed font-medium">
                    <strong className="text-stone-900 font-bold">Industry Impact: </strong>
                    {art.whyItMatters}
                  </div>

                  {/* Action Link Row with Authentic Ticket Barcode */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-300/80 font-mono-board">
                    <div className="w-44 max-w-full">
                      <TicketBarcode seed={art.id + art.number} />
                    </div>
                    <a
                      href={art.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-900 hover:text-black hover:underline font-bold inline-flex items-center gap-1.5 self-end sm:self-auto"
                    >
                      <span>Read Full Story</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* =========================================================================
          CANDIDATE SWAP MODAL (Transit Station Inspector Style)
          ========================================================================= */}
      {swapModalSlot !== null && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-[28px] bg-[#FAF7F0] border-2 border-stone-900 shadow-[8px_8px_0_0_rgba(28,25,23,0.95)] p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-300">
              <div className="space-y-0.5">
                <h3 className="font-signage text-2xl font-black text-stone-900 flex items-center gap-2 uppercase tracking-wide">
                  <Layers className="w-5 h-5 text-amber-600" />
                  <span>Swap Story #{swapModalSlot + 1} (Candidate Pool)</span>
                </h3>
                <p className="text-xs font-mono-board text-stone-500">
                  Select an alternative high-impact story from this week's candidate pool to include in your Top 5
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalSlot(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate List */}
            <div className="space-y-3">
              {candidateArticles.map((cand) => (
                <div
                  key={cand.id}
                  className="p-4 rounded-xl border-2 border-stone-200 hover:border-amber-500 bg-white hover:bg-amber-50/20 transition-all space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 font-mono-board">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 text-amber-300">
                        {cand.categoryLabel}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Source: {cand.sourceName} · Score: {cand.weeklyScore}
                      </span>
                    </div>
                    <div className="font-signage font-black text-base text-stone-900 uppercase tracking-wide">
                      {cand.title}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1 font-medium">
                      {cand.coreVerdict}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      swapArticle(swapModalSlot, cand.id)
                      setSwapModalSlot(null)
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-950 hover:bg-amber-400 hover:text-stone-950 text-amber-300 text-xs font-mono-board font-black transition-all cursor-pointer shrink-0 self-end sm:self-auto shadow-2xs active:scale-95"
                  >
                    Select This
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end border-t-2 border-stone-300">
              <button
                type="button"
                onClick={() => setSwapModalSlot(null)}
                className="px-4 py-2 rounded-xl font-mono-board text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM FOOTER (STAY INFORMED  ·  STAY AHEAD)
          ========================================================================= */}
      <footer className="pt-6 border-t border-stone-300">
        <div className="border-t-2 border-stone-900 pt-4 text-center">
          <p className="text-xs font-mono-board font-black tracking-[0.25em] text-stone-700 uppercase">
            WEEKLY BRIEFING &nbsp;·&nbsp; READY FOR MONDAY &nbsp;·&nbsp; 5-MINUTE EXPRESS
          </p>
        </div>
      </footer>

    </div>
  )
}
