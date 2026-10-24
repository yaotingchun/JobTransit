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
  Layers,
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
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-stone-900 to-slate-950 text-white border border-slate-800 shadow-xl transition-all">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="p-5 sm:p-6 pb-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Pulsing Signal Beacon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shadow-inner">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Weekly Trend Pulse</span>
              </h2>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {data.weekLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Multi-window historical baseline & evidence-grounded CS horizon
            </p>
          </div>
        </div>

        {/* Toggle / Minimize */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
          title={isExpanded ? 'Collapse Pulse view' : 'Expand Pulse view'}
        >
          <span>{isExpanded ? 'Minimize' : 'View Pulse'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5 relative z-10 animate-in fade-in duration-200">
          
          {/* Top Status Indicators: Maturity + Momentum + Source Anchor */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Maturity Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                data.maturity === 'emerging'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}
            >
              {data.maturity === 'emerging' ? <Sparkles className="w-3 h-3 text-purple-400" /> : <ShieldCheck className="w-3 h-3 text-sky-400" />}
              <span>{data.maturity === 'emerging' ? 'Emerging Technology' : 'Established Tech Pillar'}</span>
            </span>

            {/* Momentum Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${momentumInfo.pillClass}`}>
              {momentumInfo.icon}
              <span>{momentumInfo.label}</span>
            </span>

            {/* Primary Source Anchor */}
            {data.primarySource && (
              <a
                href={data.primarySource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-cyan-300 transition-colors bg-slate-800/60 hover:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700/60 ml-auto"
                title={data.primarySource.title}
              >
                <span>Anchor: {data.primarySource.domain}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
          </div>

          {/* Topic Headline */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {data.signalTopic}
            </h3>

            {/* Optional Paradigm Shift Vector */}
            {data.paradigmShift && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-cyan-500/30 text-xs sm:text-sm">
                <span className="text-slate-400 font-medium">Paradigm Shift:</span>
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <span className="text-slate-300">{data.paradigmShift.from}</span>
                  <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300">{data.paradigmShift.to}</span>
                </div>
              </div>
            )}
          </div>

          {/* Editorial Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-1.5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Coverage Synthesis</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {data.summary}
            </p>
          </div>

          {/* Structured Evidence Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Evidence & Baseline Comparison</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                data.evidence?.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
              }`}>
                Confidence: {data.evidence?.confidence || 'Medium'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="text-xs text-slate-300 space-y-0.5">
                <span className="text-slate-400 text-[11px] block">Corroborating Events:</span>
                <span className="font-bold text-white text-sm">
                  {data.evidence?.uniqueEvents || 1} Independent Event{(data.evidence?.uniqueEvents || 1) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-0.5">
                <span className="text-slate-400 text-[11px] block">Multi-Window Baseline:</span>
                <span className="text-slate-200 text-xs">
                  {data.evidence?.historicalComparison || 'Consistent with baseline coverage.'}
                </span>
              </div>
            </div>

            {/* Event Breakdown if multiple events */}
            {data.evidence?.eventBreakdown && data.evidence.eventBreakdown.length > 1 && (
              <div className="pt-2 border-t border-slate-800/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Event Deduplication Breakdown:
                </span>
                <div className="space-y-1">
                  {data.evidence.eventBreakdown.map((ev) => (
                    <div key={ev.eventId} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/40 px-2.5 py-1 rounded-lg">
                      <span className="truncate pr-2">• {ev.title}</span>
                      <span className="text-slate-500 text-[10px] shrink-0 font-mono">({ev.articleCount} coverage)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.evidence?.keySources && data.evidence.keySources.length > 0 && (
              <div className="pt-2 border-t border-slate-800/70 flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Coverage Across:</span>
                <div className="flex flex-wrap gap-1">
                  {data.evidence.keySources.map((source) => (
                    <span key={source} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Future Computer Science & Career Impact */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Future Computer Science & Career Impact</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {data.csImpact}
            </p>
          </div>

          {/* Tracked Skills (Clickable radar chips) */}
          {data.trackedSkills && data.trackedSkills.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-800/70">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>🎯 Fields & Skills Worth Watching:</span>
                <span className="text-[10px] text-slate-500 font-normal">Click to explore transit target</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.trackedSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={(e) => onSkillClick?.(skill, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer shadow-xs"
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
          <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>{data.disclaimer}</span>
            </div>
            {data.metadata && (
              <span className="font-mono text-[10px] text-slate-500 shrink-0">
                {data.metadata.modelVersion} · Schema v{data.metadata.schemaVersion} · {data.metadata.baselineMetadata?.timezone || 'UTC+8'}
              </span>
            )}
          </div>

        </div>
      )}
    </section>
  )
}
