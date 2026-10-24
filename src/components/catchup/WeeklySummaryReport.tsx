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
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* =========================================================================
          TOP BANNER: WEEKLY FLASH EDITORIAL MASTHEAD
          ========================================================================= */}
      <header className="rounded-3xl bg-white/70 hover:bg-white/80 backdrop-blur-xl p-6 sm:p-8 border border-stone-200/90 shadow-sm transition-all space-y-5">
        
        {/* Row 1: Issue Tags + Countdown Pill + Redo Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/70 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-white shadow-xs flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Weekly Flash · Top 5 Briefs</span>
            </span>
            <span className="text-xs text-stone-600 font-bold bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
              Issue No. {summary.issueNumber}
            </span>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>⏱️ ~{summary.totalReadTimeMinutes} Min Fast Read</span>
            </span>
          </div>

          {/* Right Action Tools: Redo Button + Share */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={redoWeeklySummary}
              disabled={isRecompiling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                isRecompiling
                  ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                  : 'bg-white hover:bg-stone-900 hover:text-white text-stone-700 border-stone-300'
              }`}
              title="Re-aggregate and re-rank this week's top 5 developments (editable until Sunday night)"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRecompiling ? 'animate-spin text-amber-600' : ''}`} />
              <span>{isRecompiling ? 'Aggregating...' : 'Redo Weekly Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs transition-all cursor-pointer"
              title="Share this weekly issue"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-600" />}
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Headline & Schedule Notification */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{summary.weekRange}</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">Monday Morning Edition</span>
            </div>
            <h1 className="font-hero text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Weekly Tech Flash · Top 5 Defining Breakthroughs
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Curated from the past 7 days across global tech and engineering. Tailored for {currentUser?.name || 'Explorer'}, locked on Sunday night so you can master the week in 5 minutes every Monday morning.
            </p>
          </div>

          {/* Sunday Lock Status Tag */}
          <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200/90 text-right shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Weekly Cycle Status
            </div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1 justify-end pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{countdownStr}</span>
            </div>
          </div>
        </div>

        {/* Recompile feedback banner */}
        {recompileMessage && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{recompileMessage}</span>
          </div>
        )}

        {/* Mode Switcher Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/70">
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setViewStyle('stories')
                setIsPlaying(true)
                setStoryProgress(0)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewStyle === 'stories'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>📱 Flash Stories (Auto-Play Reel)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewStyle === 'list'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-slate-700" />
              <span>📑 One-Pager Scan (Full List)</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-500 font-medium hidden sm:block">
            Supports swapping any card with candidate pool alternatives
          </div>
        </div>

      </header>

      {/* =========================================================================
          LIGHTWEIGHT FEATURE: WEEKLY TREND PULSE (SIGNAL & SHIFTS)
          ========================================================================= */}
      <WeeklyTrendPulseCard
        pulse={summary.trendPulse}
        weekNumber={summary.issueNumber}
        onSkillClick={onSkillClick}
      />

      {/* =========================================================================
          MODE 1: STORIES / REELS 45s EXPRESS VIEWER
          ========================================================================= */}
      {viewStyle === 'stories' && activeArticle && (
        <section className="rounded-3xl bg-slate-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden transition-all">
          
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

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
                  className="h-1.5 rounded-full bg-slate-800 overflow-hidden cursor-pointer group hover:h-2 transition-all relative"
                  title={`Jump to Story ${idx + 1}`}
                >
                  <div
                    className="h-full bg-cyan-400 transition-all duration-100 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </button>
              )
            })}
          </div>

          {/* 2. Story Header Row: Category Badge + Counter + Play/Pause Control */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                ⚡ Flash #{activeArticle.number} · {activeArticle.categoryLabel}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Story {activeStoryIdx + 1} of {topArticles.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer transition-all"
                title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSwapModalSlot(activeStoryIdx)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 cursor-pointer transition-all"
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
                className="font-newspaper-headline text-2xl sm:text-3xl font-black text-white hover:text-cyan-300 transition-colors leading-tight inline-flex items-start gap-2 group/link"
              >
                <span>{activeArticle.title}</span>
                <ExternalLink className="w-5 h-5 text-slate-500 group-hover/link:text-cyan-300 shrink-0 mt-1 transition-colors" />
              </a>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <span>Source: {activeArticle.sourceName}</span>
                <span>·</span>
                <span>Weekly Impact Score: {activeArticle.weeklyScore}</span>
                <span>·</span>
                <span>⏱️ ~45s read</span>
              </div>
            </div>

            {/* 🎯 CORE VERDICT CALLOUT (One-Sentence Summary) */}
            <div className="p-5 rounded-2xl bg-cyan-950/40 border-l-4 border-cyan-400 border border-cyan-900/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>🎯 Core Takeaway (What Happened)</span>
              </div>
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                {activeArticle.coreVerdict}
              </p>
            </div>

            {/* 💡 WHY IT MATTERS */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>💡 Why It Matters (Industry & Career Impact)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {activeArticle.whyItMatters}
              </p>
            </div>

            {/* NEXT TRANSIT */}
            <div className="pt-2 flex items-center justify-end gap-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => onSelectTab('transit')}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>Explore Transit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* 4. Stories Bottom Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 relative z-10">
            <button
              type="button"
              onClick={handlePrevStory}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-xs text-slate-500 font-mono">
              [Keyboard: ← / → to navigate · Space to pause]
            </div>

            <button
              type="button"
              onClick={handleNextStory}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold border border-slate-800 cursor-pointer transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </section>
      )}

      {/* =========================================================================
          MODE 2: ONE-PAGER SCAN LIST (All 5 Cards Visible At Once)
          ========================================================================= */}
      {viewStyle === 'list' && (
        <section className="space-y-5">
          {topArticles.map((art, idx) => {
            const badge = getCategoryBadge(art.category)
            return (
              <article
                key={art.id}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md transition-all space-y-4 group relative"
              >
                {/* Header row: Number + Category Badge + Swap Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-950 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {art.number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.text} border ${badge.border}`}>
                      {art.categoryLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSwapModalSlot(idx)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors cursor-pointer"
                    title="Swap with an alternative story from candidate pool"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                </div>

                {/* Title */}
                <div>
                  <a
                    href={art.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-newspaper-headline text-lg sm:text-xl font-bold text-slate-900 hover:text-blue-700 transition-colors inline-flex items-start gap-1.5"
                  >
                    <span>{art.title}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </a>
                  <div className="text-xs text-stone-500 pt-1">
                    Source: {art.sourceName} · Impact Score: {art.weeklyScore} · ⏱️ ~45s read
                  </div>
                </div>

                {/* Core Verdict Callout */}
                <div className="p-3.5 rounded-xl bg-blue-50/50 border-l-3 border-blue-600 space-y-1">
                  <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    <span>Core Takeaway</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                    {art.coreVerdict}
                  </p>
                </div>

                {/* Why It Matters */}
                <div className="text-xs text-stone-600 leading-relaxed">
                  <strong className="text-stone-800">Industry Impact: </strong>
                  {art.whyItMatters}
                </div>

                {/* Action Link Row */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                  <a
                    href={art.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* =========================================================================
          CANDIDATE SWAP MODAL (Allows user to customize Top 5 from the pool)
          ========================================================================= */}
      {swapModalSlot !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="space-y-0.5">
                <h3 className="font-hero text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>Swap Story #{swapModalSlot + 1} (Candidate Pool)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select an alternative high-impact story from this week's candidate pool to include in your Top 5
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalSlot(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate List */}
            <div className="space-y-3">
              {candidateArticles.map((cand) => (
                <div
                  key={cand.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-blue-400 bg-stone-50/60 hover:bg-blue-50/30 transition-all space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                        {cand.categoryLabel}
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">
                        Source: {cand.sourceName} · Score: {cand.weeklyScore}
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      {cand.title}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1">
                      {cand.coreVerdict}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      swapArticle(swapModalSlot, cand.id)
                      setSwapModalSlot(null)
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all cursor-pointer shrink-0 self-end sm:self-auto shadow-2xs"
                  >
                    Select This
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end border-t border-stone-200">
              <button
                type="button"
                onClick={() => setSwapModalSlot(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
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
        <div className="border-t-2 border-stone-800 pt-4 text-center">
          <p className="text-xs font-newspaper-masthead font-black tracking-[0.25em] text-stone-700 uppercase">
            WEEKLY BRIEFING &nbsp;·&nbsp; READY FOR MONDAY &nbsp;·&nbsp; 5-MINUTE EXPRESS
          </p>
        </div>
      </footer>

    </div>
  )
}
