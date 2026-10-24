import React, { useState } from 'react'
import {
  Navbar,
  type NavTab,
  type UserProfile,
} from './Navbar'
import {
  ArrowRight,
  Bot,
  Database,
  Brain,
  Sparkles,
  MapPinned,
  GraduationCap,
  Flame,
  Coins,
  Eye,
  Compass,
  TrendingUp,
  Newspaper,
  ChevronRight,
  TrainFront,
} from 'lucide-react'
import { CatchupTab } from './catchup/CatchupTab'
import { TransitTab } from './transit/TransitTab'
import catchupBg from '../assets/catchup-bg.png'
import { FollowUpPage } from './followUp/FollowUpPage'
import { TrendView } from './trend/TrendView'
import { ProfileOnboarding } from './ProfileOnboarding'
interface HomepageProps {
  currentUser: UserProfile
  onLogout: () => void
}

interface TopRolePick {
  id: string
  code: string
  rank: number
  title: string
  lineName: string
  lineCode: string
  lineColor: string
  badgeBg: string
  fit: number
  months: number
  salary: string
  blurb: string
  skillsHave: string[]
  skillsBridge: string[]
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

const TOP_ROLES: TopRolePick[] = [
  {
    id: 'agentic',
    code: 'A-03',
    rank: 1,
    title: 'Agentic AI Engineer',
    lineName: 'Agent Line',
    lineCode: 'A',
    lineColor: '#F59E0B',
    badgeBg: 'bg-amber-400 text-stone-950',
    fit: 78,
    months: 4,
    salary: 'RM 12k – 18k',
    blurb: 'Architect autonomous multi-step agents that plan, call tools and self-correct across production environments.',
    skillsHave: ['TypeScript', 'Node.js', 'REST APIs'],
    skillsBridge: ['LangGraph', 'Tool Calling', 'Agent Evals'],
    icon: Bot,
  },
  {
    id: 'pipeline',
    code: 'D-04',
    rank: 2,
    title: 'Data Pipeline Engineer',
    lineName: 'Data Line',
    lineCode: 'D',
    lineColor: '#10B981',
    badgeBg: 'bg-emerald-400 text-stone-950',
    fit: 72,
    months: 3,
    salary: 'RM 10k – 14k',
    blurb: 'Scale real-time streaming, vector ingest, and enterprise ETL data pipelines powering low-latency AI apps.',
    skillsHave: ['PostgreSQL', 'Node.js', 'REST APIs'],
    skillsBridge: ['Apache Kafka', 'dbt', 'Vector DBs'],
    icon: Database,
  },
  {
    id: 'ai-eng',
    code: 'I-03',
    rank: 3,
    title: 'AI Engineer',
    lineName: 'Intelligence Line',
    lineCode: 'I',
    lineColor: '#8B5CF6',
    badgeBg: 'bg-purple-400 text-stone-950',
    fit: 68,
    months: 4,
    salary: 'RM 12k – 17k',
    blurb: 'Blend frontier foundation models, contextual retrieval, and UX into high-impact user experiences.',
    skillsHave: ['TypeScript', 'REST APIs', 'Prompt Design'],
    skillsBridge: ['Python', 'PyTorch', 'Fine-Tuning', 'Embeddings'],
    icon: Brain,
  },
]

export const Homepage: React.FC<HomepageProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home')

  // Player progress (matches TransitTab state)
  const [xp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jobtransit_xp')
      return saved ? Number(saved) : 180
    } catch {
      return 180
    }
  })

  const XP_PER_LEVEL = 500
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const levelProgress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL
  const R = 24
  const C = 2 * Math.PI * R

  const handleNavigateToPathway = (stationId: string) => {
    window.location.hash = `#pathway-${stationId}`
    setActiveTab('transit')
  }

  if (activeTab === 'follow-up') {
    return (
      <FollowUpPage
        currentUser={currentUser}
        onLogout={onLogout}
        onNavigateTab={setActiveTab}
      />
    )
  }

  return (
    <div className="relative h-screen w-full font-sans overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-900 text-stone-100 selection:bg-amber-400/30 selection:text-amber-200 transition-colors duration-500">
      {/* ── Background Layer: Atmospheric Cloudy Sky & Specular Wash (Shared with Transit & Catchup) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={catchupBg}
          alt="Cloudy Sky Background"
          className="w-full h-full object-cover object-center filter saturate-[1.05] brightness-[0.98] transition-opacity duration-700"
        />
        {/* Subtle atmospheric wash for pristine legibility and specular light contrast */}
        <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-slate-900/30" />
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className={`relative z-10 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 mx-auto space-y-8 ${activeTab === 'profile' ? 'max-w-[1680px]' : 'max-w-7xl'}`}>
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* ── 2. HERO DASHBOARD COMMAND CENTER + PLAYER HUD ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em] shadow-xs">
                  <MapPinned className="w-3 h-3 text-amber-400" />
                  CAREER METRO · MISSION CONTROL
                </div>

                <h1 className="font-signage text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[0.9] mt-3">
                  CAREER CONTROL<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> DECK</span>
                </h1>

                <p className="text-sm sm:text-base text-stone-700 mt-2.5 max-w-2xl font-medium leading-relaxed">
                  Welcome back, <strong className="text-stone-950 font-bold">{currentUser?.name || 'Explorer'}</strong>.
                  Your command center for navigating AI career shifts. Real-time market telemetry, customized transit lines,
                  and curated technical intelligence.
                </p>

                {/* Primary Fast Actions */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('transit')}
                    className="px-5 py-2.5 rounded-full bg-stone-950 hover:bg-stone-900 text-white font-mono-board text-xs font-bold tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 group"
                  >
                    <TrainFront className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>LAUNCH CAREER METRO</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('catchup')}
                    className="px-5 py-2.5 rounded-full bg-white/70 hover:bg-white text-stone-900 font-mono-board text-xs font-bold tracking-wider border border-white/90 shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Newspaper className="w-3.5 h-3.5 text-stone-700" />
                    <span>INTELLIGENCE WIRE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('trend')}
                    className="px-5 py-2.5 rounded-full bg-white/70 hover:bg-white text-stone-900 font-mono-board text-xs font-bold tracking-wider border border-white/90 shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-stone-700" />
                    <span>2026 DISRUPTION RADAR</span>
                  </button>
                </div>
              </div>

              {/* Player Command HUD (matching TransitTab styling) */}
              <div className="hud-card rounded-[24px] p-4 pr-6 flex items-center gap-4 self-start lg:self-auto shrink-0" id="player-hud">
                <div className="relative w-16 h-16 shrink-0">
                  <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                    <circle
                      cx="32"
                      cy="32"
                      r={R}
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={C}
                      strokeDashoffset={C * (1 - levelProgress)}
                      style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[8px] font-mono-board text-stone-400 tracking-widest leading-none">LVL</span>
                    <span className="font-signage text-2xl font-black text-white leading-none">{level}</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] font-mono-board tracking-[0.2em] text-amber-300 font-bold">NAVIGATOR</div>
                  <div className="font-signage text-xl font-black text-white tracking-wide leading-tight truncate">
                    {(currentUser?.name || 'Explorer').toUpperCase()}
                  </div>
                  <div className="text-[10px] font-mono-board text-stone-400 tabular-nums">
                    {xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
                  </div>
                </div>

                <div className="hidden sm:grid grid-cols-3 gap-3 pl-4 border-l border-white/10">
                  <div className="text-center">
                    <Coins className="w-4 h-4 mx-auto text-amber-300" />
                    <div className="font-mono-board text-sm font-bold text-white tabular-nums mt-0.5">4</div>
                    <div className="text-[8px] font-mono-board text-stone-400 tracking-widest">TOKENS</div>
                  </div>
                  <div className="text-center">
                    <Flame className="w-4 h-4 mx-auto text-orange-400" />
                    <div className="font-mono-board text-sm font-bold text-white mt-0.5">5</div>
                    <div className="text-[8px] font-mono-board text-stone-400 tracking-widest">STREAK</div>
                  </div>
                  <div className="text-center">
                    <Eye className="w-4 h-4 mx-auto text-sky-300" />
                    <div className="font-mono-board text-sm font-bold text-white tabular-nums mt-0.5">3/21</div>
                    <div className="text-[8px] font-mono-board text-stone-400 tracking-widest">CHARTED</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. FOUR TELEMETRY QUICK-KPI TILES (LIGHT MODE) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tile 1: Origin Platform */}
              <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono-board tracking-widest text-amber-700 font-bold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-600" /> ORIGIN HUB
                  </div>
                  <div className="font-signage text-xl font-black text-stone-900">HUB-01 FULL-STACK</div>
                  <div className="text-[11px] text-stone-500">All 5 Transit Lines Connected</div>
                </div>
                <span className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-800 flex items-center justify-center font-signage text-xl font-black">
                  A
                </span>
              </div>

              {/* Tile 2: Primary Target Match */}
              <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono-board tracking-widest text-emerald-700 font-bold flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-600" /> TOP DESTINATION
                  </div>
                  <div className="font-signage text-xl font-black text-stone-900">AGENTIC AI ENGINEER</div>
                  <div className="text-[11px] text-stone-500">78% Match · 4 MO Horizon</div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono-board text-xs font-black">
                  #1
                </span>
              </div>

              {/* Tile 3: Market Velocity */}
              <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono-board tracking-widest text-sky-700 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-600" /> MARKET VELOCITY
                  </div>
                  <div className="font-signage text-xl font-black text-stone-900">+34% QoQ HIRING</div>
                  <div className="text-[11px] text-stone-500">Surge in APAC Agent Roles</div>
                </div>
                <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-mono-board text-xs font-bold">
                  ⚡
                </span>
              </div>

              {/* Tile 4: Today's Intelligence Pulse */}
              <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-md border border-stone-200/90 text-stone-900 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono-board tracking-widest text-purple-700 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> INTELLIGENCE WIRE
                  </div>
                  <div className="font-signage text-xl font-black text-stone-900">HERMES 3 RELEASED</div>
                  <div className="text-[11px] text-stone-500">Open Agentic Function Calling</div>
                </div>
                <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-signage text-base font-black">
                  NEW
                </span>
              </div>
            </div>

            {/* ── 4. THE TWO CORE PILLARS: TOP 3 ROLES + DAILY NEWS CATCHUP (LIGHT MODE) ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              {/* ── PILLAR A: TOP 3 ROLES FOR YOU (DEPARTURES BOARD - LIGHT) ── */}
              <div className="xl:col-span-7 flex flex-col">
                <div className="rounded-[28px] p-4 sm:p-5 bg-white/90 backdrop-blur-md border border-stone-300/80 shadow-[0_16px_36px_rgba(28,25,23,0.06)] flex-1 flex flex-col justify-between space-y-3">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-stone-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono-board text-[10px] font-black tracking-widest shadow-xs">
                          DEPARTURES
                        </span>
                        <span className="font-mono-board text-xs text-stone-500 font-bold">LIVE CAREER RADAR</span>
                      </div>
                      <h2 className="font-signage text-2xl sm:text-3xl font-black text-stone-900 tracking-wide mt-0.5">
                        TOP 3 ROLES FOR YOU
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('transit')}
                      className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-black text-white font-mono-board text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Full Metro Map</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>

                  {/* Top 3 Destination Role Cards (Compact & Light Mode) */}
                  <div className="space-y-2.5 flex-1 flex flex-col justify-between my-1">
                    {TOP_ROLES.map((role) => {
                      const IconComp = role.icon
                      return (
                        <div
                          key={role.id}
                          className="group relative rounded-xl bg-[#EEF0F3] hover:bg-white border-2 border-stone-300 hover:border-stone-400 p-3 sm:px-3.5 sm:py-2.5 transition-all shadow-xs"
                        >
                          {/* Row 1: Line Badge + Code + Rank + Icon + Title + Telemetry */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-xs shrink-0"
                                style={{ background: role.lineColor }}
                              >
                                {role.lineCode}
                              </span>
                              <span className="font-mono-board text-xs text-amber-700 font-bold shrink-0">
                                [{role.code}]
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider shrink-0 ${role.badgeBg}`}>
                                ★ TOP #{role.rank}
                              </span>
                              <IconComp className="w-4 h-4 shrink-0" style={{ color: role.lineColor }} />
                              <h3 className="font-signage text-base sm:text-lg font-black text-stone-900 tracking-wide group-hover:text-amber-600 transition-colors truncate">
                                {role.title.toUpperCase()}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2.5 font-mono-board text-[11px] shrink-0">
                              <span className="text-emerald-700 font-bold">{role.fit}% FIT</span>
                              <span className="text-stone-300 hidden sm:inline">•</span>
                              <span className="text-stone-600 font-medium hidden sm:inline">{role.months} MO</span>
                              <span className="text-stone-300 hidden md:inline">•</span>
                              <span className="text-amber-700 font-bold hidden md:inline">{role.salary}</span>
                            </div>
                          </div>

                          {/* Row 2: Short 1-line blurb */}
                          <p className="text-[11px] text-stone-600 line-clamp-1 mt-1 leading-snug">
                            {role.blurb}
                          </p>

                          {/* Row 3: Bridge Skills Tags + View Pathway CTA */}
                          <div className="mt-2 pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono-board">
                              <span className="text-stone-500 mr-0.5 font-bold text-[9px]">BRIDGE:</span>
                              {role.skillsBridge.map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-bold"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleNavigateToPathway(role.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-board text-[10.5px] font-black tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                            >
                              <GraduationCap className="w-3.5 h-3.5 text-stone-950" />
                              <span>View Pathway</span>
                              <ChevronRight className="w-3.5 h-3.5 text-stone-950" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── PILLAR B: DAILY NEWS CATCHUP (LIVE INTELLIGENCE WIRE - LIGHT) ── */}
              <div className="xl:col-span-5 flex flex-col">
                <div className="rounded-[28px] p-4 sm:p-5 bg-white/90 backdrop-blur-md border border-stone-300/80 shadow-[0_16px_36px_rgba(28,25,23,0.06)] flex-1 flex flex-col justify-between space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono-board text-[10px] text-emerald-700 font-bold tracking-widest">
                          LIVE INTELLIGENCE WIRE
                        </span>
                      </div>
                      <h2 className="font-signage text-2xl sm:text-3xl font-black text-stone-900 tracking-wide mt-0.5">
                        DAILY NEWS CATCHUP
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('catchup')}
                      className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-black text-white font-mono-board text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span>All Briefs</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>

                  {/* Featured Story 1: Hermes 3 */}
                  <div className="rounded-2xl bg-[#EEF0F3] hover:bg-white border-2 border-stone-300 p-3.5 space-y-2.5 hover:border-emerald-500/50 transition-all shadow-xs">
                    <div className="flex items-start gap-3">
                      {/* Stylized Neon Emerald 'H' Artwork */}
                      <div className="w-12 h-14 rounded-xl bg-gradient-to-br from-emerald-100 via-teal-50 to-white border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="font-signage text-2xl font-black text-emerald-600 drop-shadow-xs">
                          H
                        </span>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-600 text-white tracking-wider">
                            NEW MODEL
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-stone-950 tracking-wider">
                            AGENTIC
                          </span>
                        </div>
                        <h4 className="font-signage text-base font-black text-stone-900 tracking-wide leading-tight">
                          HERMES 3 Released: Open Agent Model
                        </h4>
                        <p className="text-xs text-stone-600 leading-snug">
                          Frontier open LLM optimized for structured tool use, recursive planning, and autonomous loops.
                        </p>
                      </div>
                    </div>

                    {/* Why It Matters Callout */}
                    <div className="p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 space-y-0.5">
                      <div className="text-[9.5px] font-mono-board text-amber-800 font-bold uppercase tracking-wider">
                        ⚡ Why it matters for your transition:
                      </div>
                      <p className="text-[11px] leading-relaxed text-stone-700">
                        Achieves 2.4x higher tool accuracy. Unlocks primary bridge skills for <strong>Agentic AI Engineer</strong>.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono-board text-stone-500 pt-0.5">
                      <span>Source: Nous Research • Today</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('catchup')}
                        className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Read full brief</span>
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                      </button>
                    </div>
                  </div>

                  {/* Secondary Story 2: APAC AI Hiring Pulse */}
                  <div className="rounded-2xl bg-[#EEF0F3] hover:bg-white border-2 border-stone-300 p-3 space-y-1.5 hover:border-sky-500/50 transition-all shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-mono-board text-[9px] font-bold">
                        MARKET PULSE
                      </span>
                      <span className="text-[10px] font-mono-board text-stone-500">2d ago</span>
                    </div>

                    <h4 className="font-signage text-base font-black text-stone-900 tracking-wide leading-tight">
                      APAC AI Hiring Shift: Orchestration & Evaluation Lead Demand
                    </h4>

                    <p className="text-xs text-stone-600 leading-snug">
                      Annual engineering survey shows a 140% surge in postings requiring LangGraph, Tool Calling, and automated evaluation harnesses.
                    </p>

                    <div className="text-[10px] font-mono-board text-stone-500 pt-0.5 flex items-center justify-between">
                      <span>Source: TechCareers Index</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('catchup')}
                        className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Fast Action to Catchup Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('catchup')}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-mono-board text-xs font-bold tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-sm"
                  >
                    <span>Open Complete Intelligence Feed (3 Unread)</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Global Footer Note */}
            <footer className="pt-8 pb-4 border-t border-stone-300 text-center text-xs font-mono-board text-stone-500 space-y-1">
              <p>© 2026 JobTransit Inc. Career navigation built for the AI transformation era.</p>
              <p className="text-stone-400">Your skills. Your next destination. A route that adapts.</p>
            </footer>
          </div>
        )}

        {/* ── CATCHUP TAB (NEWS & INTELLIGENCE) ── */}
        {activeTab === 'catchup' && (
          <CatchupTab
            currentUser={currentUser}
            onSelectTab={setActiveTab}
            onLogout={onLogout}
          />
        )}

        {/* ── TRANSIT TAB (GAMIFIED CAREER METRO) ── */}
        {activeTab === 'transit' && <TransitTab currentUser={currentUser} />}

        {/* ── TREND TAB: LinkedIn Job Postings & Disruption Radar ── */}
        {activeTab === 'trend' && <TrendView />}

        {/* ── PROFILE TAB (ONBOARDING & 3D TRANSIT PASS) ── */}
        {activeTab === 'profile' && (
          <ProfileOnboarding
            currentUser={currentUser}
            onClose={() => setActiveTab('home')}
          />
        )}
      </main>
    </div>
  )
}
