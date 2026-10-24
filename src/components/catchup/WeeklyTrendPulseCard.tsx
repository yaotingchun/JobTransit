import React, { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Radio,
  Workflow,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
} from 'lucide-react'
import type { WeeklyTrendPulse } from '../../hooks/useWeeklySummary'

interface WeeklyTrendPulseCardProps {
  pulse?: WeeklyTrendPulse
  weekNumber: number
  onSkillClick?: (skill: string, e: React.MouseEvent) => void
}

export const WeeklyTrendPulseCard: React.FC<WeeklyTrendPulseCardProps> = ({
  pulse,
  weekNumber,
  onSkillClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  // Fallback defaults if pulse data is loading or undefined
  const data: WeeklyTrendPulse = pulse || {
    weekLabel: `WEEK ${weekNumber} · 2026`,
    signalTopic: 'AI Coding Agents',
    maturity: 'established',
    momentum: 'rising',
    paradigmShift: {
      from: 'Code Completion',
      to: 'Autonomous Software Engineering',
    },
    primarySource: {
      title: 'Autonomous Software Engineering & Agentic Tooling',
      domain: 'habab.ru',
      url: 'https://habab.ru/ai-assisted-development?utm_source=chatgpt.com',
    },
    evidence: {
      articleIds: [],
      uniqueEvents: 3,
      historicalComparison: 'Coverage up +50% vs 4-week moving average (3 events vs 2.0 baseline).',
      confidence: 'high',
      keySources: ['news.ycombinator.com', 'infoq.com'],
    },
    summary:
      "This week's coverage suggests a growing industry focus on AI systems that can execute multi-step software engineering tasks, rather than simply generating isolated code snippets.",
    csImpact:
      'Shifts computer science education and engineering focus from isolated syntax authoring to multi-agent orchestration, declarative task specification, and deterministic verification harnesses.',
    trackedSkills: [
      'AI Coding Agents',
      'Multi-Step Workflows',
      'Eval Harnesses',
      'Autonomous Tooling',
    ],
    disclaimer:
      "Trend interpretation is based on this week's news and historical multi-window baseline. Sustained macro-trends require ongoing multi-week observation.",
  }

  // Momentum Visual Info
  const getMomentumBadge = (mom: string) => {
    switch (mom) {
      case 'rising':
        return {
          label: 'Rising Momentum',
          icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
          pillClass: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
        }
      case 'cooling':
        return {
          label: 'Cooling Momentum',
          icon: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
          pillClass: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
        }
      case 'insufficient_data':
        return {
          label: 'Sparse Signals (Insufficient Data)',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
          pillClass: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
        }
      default:
        return {
          label: 'Steady Momentum',
          icon: <Activity className="w-3.5 h-3.5 text-slate-400" />,
          pillClass: 'bg-slate-800 text-slate-300 border-slate-700',
        }
    }
  }

  const momentumInfo = getMomentumBadge(data.momentum)

  return (
    <section className="relative overflow-hidden rounded-[26px] board-panel text-stone-100 border border-stone-800 shadow-2xl transition-all font-sans">
      {/* Header Bar (Departure Board Header Style) */}
      <div className="p-4 sm:p-5 pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Pulsing Signal Beacon */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400 shadow-inner">
            <Radio className="w-4 h-4 animate-pulse text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-signage text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2 uppercase leading-none">
                <span>Weekly Trend Pulse</span>
              </h2>
              <span className="text-[10px] font-mono-board font-black tracking-wider px-2.5 py-0.5 rounded-full bg-stone-900 text-amber-300 border border-amber-400/40 shadow-xs">
                {data.weekLabel}
              </span>
            </div>
            <p className="text-[11px] font-mono-board text-stone-400 font-medium mt-0.5">
              Multi-window historical baseline & evidence-grounded CS horizon
            </p>
          </div>
        </div>

        {/* Toggle / Minimize */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-board font-bold bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700 cursor-pointer transition-colors shadow-2xs"
          title={isExpanded ? 'Collapse Pulse view' : 'Expand Pulse view'}
        >
          <span>{isExpanded ? 'Minimize' : 'View Pulse'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5 relative z-10 animate-in fade-in duration-200">
          
          {/* Top Status Indicators: Maturity + Momentum + Source Anchor */}
          <div className="flex flex-wrap items-center gap-2 font-mono-board">
            
            {/* Maturity Badge */}
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-mono-board font-black uppercase tracking-wider border flex items-center gap-1 ${
                data.maturity === 'emerging'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
              }`}
            >
              {data.maturity === 'emerging' ? <Sparkles className="w-3 h-3 text-purple-400" /> : <ShieldCheck className="w-3 h-3 text-amber-400" />}
              <span>{data.maturity === 'emerging' ? 'Emerging Technology' : 'Established Tech Pillar'}</span>
            </span>

            {/* Momentum Badge */}
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono-board font-black uppercase tracking-wider border flex items-center gap-1 ${momentumInfo.pillClass}`}>
              {momentumInfo.icon}
              <span>{momentumInfo.label}</span>
            </span>

            {/* Primary Source Anchor */}
            {data.primarySource && (
              <a
                href={data.primarySource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-300 hover:text-amber-300 transition-colors bg-stone-900/80 hover:bg-stone-900 px-3 py-1 rounded-full border border-stone-700/80 ml-auto"
                title={data.primarySource.title}
              >
                <span>Anchor: {data.primarySource.domain}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
          </div>

          {/* Topic Headline */}
          <div className="space-y-2">
            <h3 className="font-signage text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
              {data.signalTopic}
            </h3>

            {/* Optional Paradigm Shift Vector (Transit interchange line) */}
            {data.paradigmShift && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-900/90 border border-amber-400/30 text-xs sm:text-sm font-mono-board">
                <span className="text-stone-400 font-bold uppercase text-[10.5px] tracking-wider">Paradigm Shift:</span>
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="text-stone-300">{data.paradigmShift.from}</span>
                  <Workflow className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">{data.paradigmShift.to}</span>
                </div>
              </div>
            )}
          </div>

          {/* Editorial Summary */}
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800/90 space-y-1.5 shadow-sm">
            <div className="text-[11px] font-mono-board font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Coverage Synthesis</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal">
              {data.summary}
            </p>
          </div>

          {/* Structured Evidence Card */}
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2 font-mono-board">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Evidence & Baseline Comparison</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                data.evidence?.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-stone-800 text-stone-300'
              }`}>
                Confidence: {data.evidence?.confidence || 'Medium'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="text-xs text-stone-300 space-y-0.5">
                <span className="text-stone-400 text-[11px] block">Corroborating Events:</span>
                <span className="font-bold text-white text-sm">
                  {data.evidence?.uniqueEvents || 1} Independent Event{(data.evidence?.uniqueEvents || 1) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-stone-300 space-y-0.5">
                <span className="text-stone-400 text-[11px] block">Multi-Window Baseline:</span>
                <span className="text-stone-200 text-xs">
                  {data.evidence?.historicalComparison || 'Consistent with baseline coverage.'}
                </span>
              </div>
            </div>

            {/* Event Breakdown if multiple events */}
            {data.evidence?.eventBreakdown && data.evidence.eventBreakdown.length > 1 && (
              <div className="pt-2 border-t border-stone-800/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Event Deduplication Breakdown:
                </span>
                <div className="space-y-1">
                  {data.evidence.eventBreakdown.map((ev) => (
                    <div key={ev.eventId} className="flex items-center justify-between text-[11px] text-stone-300 bg-stone-950/60 px-2.5 py-1 rounded-lg">
                      <span className="truncate pr-2">• {ev.title}</span>
                      <span className="text-stone-400 text-[10px] shrink-0 font-mono-board">({ev.articleCount} coverage)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.evidence?.keySources && data.evidence.keySources.length > 0 && (
              <div className="pt-2 border-t border-stone-800/70 flex items-center gap-1.5 text-[11px] text-stone-400">
                <span>Coverage Across:</span>
                <div className="flex flex-wrap gap-1">
                  {data.evidence.keySources.map((source) => (
                    <span key={source} className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono-board text-[10px]">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Future Computer Science & Career Impact */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-400 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-board font-bold uppercase tracking-wider text-amber-300">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Future Computer Science & Career Impact</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal">
              {data.csImpact}
            </p>
          </div>

          {/* Tracked Skills (Transit Station badges) */}
          {data.trackedSkills && data.trackedSkills.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-stone-800/70">
              <div className="text-[11px] font-mono-board font-bold text-stone-400 flex items-center justify-between">
                <span>🎯 Fields & Skills Worth Watching:</span>
                <span className="text-[10px] text-stone-500 font-normal">Click to explore transit target</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.trackedSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={(e) => onSkillClick?.(skill, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-board font-bold bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-amber-300 border border-stone-700 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
                    title={`Explore transit path for ${skill}`}
                  >
                    <span>{skill}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caveat & Metadata Traceability */}
          <div className="pt-2 border-t border-stone-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500 font-mono-board">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
              <span>{data.disclaimer}</span>
            </div>
            {data.metadata && (
              <span className="font-mono-board text-[10px] text-stone-500 shrink-0">
                {data.metadata.modelVersion} · Schema v{data.metadata.schemaVersion} · {data.metadata.baselineMetadata?.timezone || 'UTC+8'}
              </span>
            )}
          </div>

        </div>
      )}
    </section>
  )
}
