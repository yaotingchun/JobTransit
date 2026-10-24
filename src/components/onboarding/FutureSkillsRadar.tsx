import React, { useMemo, useState } from 'react'
import { ArrowRight, Radar, TrendingDown, TrendingUp, TriangleAlert, Sparkles } from 'lucide-react'
import { buildRadarSignals, type FlowProfileSnapshot, type RadarSignal } from './onboardingData'

interface FutureSkillsRadarProps {
  snapshot: FlowProfileSnapshot
  onContinue: () => void
}

type Filter = 'all' | 'role' | 'skill'

const RISING = '#10B981'
const DECLINING = '#F43F5E'
const CX = 180
const CY = 180
const RING_MAX = 168

interface Blip {
  signal: RadarSignal
  n: number
  x: number
  y: number
}

/** Rising signals fan out on the right half of the scope, declining ones on the left. */
function layoutBlips(all: RadarSignal[], visible: RadarSignal[]): Blip[] {
  const out: Blip[] = []
  ;(['rising', 'declining'] as const).forEach((dir) => {
    const group = visible.filter((s) => s.direction === dir)
    group.forEach((signal, i) => {
      const t = group.length === 1 ? 0.5 : i / (group.length - 1)
      const angle = ((-68 + 136 * t) * Math.PI) / 180
      const jitter = i % 2 === 0 ? -9 : 9
      const r = Math.max(34, Math.min(RING_MAX - 14, 38 + (signal.magnitude / 100) * 116 + jitter))
      const dx = Math.cos(angle) * r
      const dy = Math.sin(angle) * r
      out.push({
        signal,
        n: all.findIndex((s) => s.id === signal.id) + 1,
        x: CX + (dir === 'rising' ? dx : -dx),
        y: CY + dy,
      })
    })
  })
  return out
}

export const FutureSkillsRadar: React.FC<FutureSkillsRadarProps> = ({ snapshot, onContinue }) => {
  const signals = useMemo(() => buildRadarSignals(snapshot.skills), [snapshot.skills])
  const [filter, setFilter] = useState<Filter>('all')
  const [activeId, setActiveId] = useState<string | null>(() => signals.find((s) => s.direction === 'rising')?.id ?? signals[0]?.id ?? null)

  const visible = useMemo(() => signals.filter((s) => filter === 'all' || s.kind === filter), [signals, filter])
  const rising = visible.filter((s) => s.direction === 'rising')
  const declining = visible.filter((s) => s.direction === 'declining')
  const blips = useMemo(() => layoutBlips(signals, visible), [signals, visible])

  const active = signals.find((s) => s.id === activeId) ?? signals[0]
  const ownedRising = signals.filter((s) => s.owned && s.direction === 'rising')
  const ownedDeclining = signals.filter((s) => s.owned && s.direction === 'declining')

  const numberOf = (s: RadarSignal) => signals.findIndex((x) => x.id === s.id) + 1

  const handleSelectSignal = (id: string, scrollIntoView = false) => {
    setActiveId(id)
    if (scrollIntoView) {
      const el = document.getElementById(`mover-signal-${id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  const renderRow = (s: RadarSignal) => {
    const isRising = s.direction === 'rising'
    const color = isRising ? RISING : DECLINING
    const isActive = s.id === activeId
    return (
      <button
        key={s.id}
        id={`mover-signal-${s.id}`}
        type="button"
        onClick={() => handleSelectSignal(s.id, false)}
        className={`w-full text-left rounded-2xl border-2 px-3.5 py-3 transition-all cursor-pointer flex items-start gap-3 ${
          isActive
            ? 'border-stone-900 bg-white shadow-[3px_3px_0_0_rgba(28,25,23,0.9)]'
            : 'border-stone-200 bg-[#FAF7F0] hover:border-stone-400 hover:bg-white'
        }`}
      >
        <span
          className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-mono-board text-[11px] font-black text-white shadow-xs"
          style={{ background: color }}
        >
          {numberOf(s)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-signage text-lg font-black tracking-wide text-stone-900 uppercase leading-none">{s.label}</span>
            <span className="px-1.5 py-0.5 rounded bg-stone-900 text-amber-300 font-mono-board text-[9px] font-bold tracking-widest uppercase">
              {s.kind}
            </span>
            {s.owned && (
              <span
                className={`px-1.5 py-0.5 rounded font-mono-board text-[9px] font-black tracking-widest uppercase ${
                  isRising ? 'bg-amber-400 text-stone-950' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isRising ? '✓ On your pass' : 'On your pass · at risk'}
              </span>
            )}
          </span>
          <span className="mt-1 flex items-center gap-2 font-mono-board text-[11px] font-bold" style={{ color }}>
            {isRising ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {s.metric}
            <span className="text-stone-400 font-medium">· {s.tag}</span>
          </span>
          <span className="block mt-1 text-[11.5px] text-stone-600 leading-snug">{s.detail}</span>
        </span>
      </button>
    )
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-500" aria-labelledby="radar-title">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em]">
            <Radar className="w-3 h-3" /> STATION 06 · FUTURE SKILLS RADAR
          </div>
          <h2
            id="radar-title"
            className="font-signage text-5xl sm:text-6xl font-black tracking-tight text-stone-900 leading-[0.9] mt-3"
          >
            FUTURE SKILLS<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> RADAR</span>
          </h2>
          <p className="text-sm text-stone-700 mt-2 max-w-2xl">
            Which skills and roles are <strong className="text-emerald-700">rising</strong> or{' '}
            <strong className="text-rose-700">declining</strong> — based on identifiable AI-trend and job-market signals from the
            Trend tab.
          </p>
          <p className="mt-1.5 font-mono-board text-[10px] tracking-widest text-stone-500">
            SOURCE · TREND TAB · LINKEDIN POSTING SNAPSHOT (OPENINGS YoY &amp; SKILL MENTIONS YoY)
          </p>
        </div>

        <div className="hud-card rounded-[24px] p-3.5 pr-5 flex items-center gap-5 self-start lg:self-auto">
          <div className="text-center">
            <div className="font-signage text-3xl font-black text-emerald-400 leading-none tabular-nums">
              {signals.filter((s) => s.direction === 'rising').length}
            </div>
            <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest mt-1">RISING</div>
          </div>
          <div className="w-px h-9 bg-white/10" />
          <div className="text-center">
            <div className="font-signage text-3xl font-black text-rose-400 leading-none tabular-nums">
              {signals.filter((s) => s.direction === 'declining').length}
            </div>
            <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest mt-1">DECLINING</div>
          </div>
          <div className="w-px h-9 bg-white/10" />
          <div className="text-center">
            <div className="font-signage text-3xl font-black text-amber-300 leading-none tabular-nums">
              {ownedRising.length + ownedDeclining.length}
            </div>
            <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest mt-1">YOUR SKILLS IN MOTION</div>
          </div>
        </div>
      </div>

      {/* ── Scope + signal lists ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Radar scope */}
        <div className="xl:col-span-5 space-y-4">
          <div className="map-frame rounded-[30px] p-2.5">
            <div className="flex items-center justify-between px-3 pt-2 pb-2">
              <span className="font-mono-board text-[10px] text-amber-400 font-bold tracking-widest">MARKET SCOPE · LIVE</span>
              <span className="flex items-center gap-1.5 font-mono-board text-[10px] tracking-widest text-stone-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SWEEPING
              </span>
            </div>

            <div className="rounded-[22px] overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#1d2a22_0%,#10150f_70%)] border border-stone-800/60">
              <svg viewBox="0 0 360 360" className="w-full h-auto block" role="img" aria-label="Future skills radar">
                <defs>
                  <linearGradient id="onb-sweep" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity="0" />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.38" />
                  </linearGradient>
                </defs>

                {/* rings + crosshair */}
                {[56, 112, RING_MAX].map((r) => (
                  <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray={r === RING_MAX ? undefined : '3 5'} />
                ))}
                <line x1={CX} y1={CY - RING_MAX} x2={CX} y2={CY + RING_MAX} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <line x1={CX - RING_MAX} y1={CY} x2={CX + RING_MAX} y2={CY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* half labels */}
                <text x={CX + 92} y={22} textAnchor="middle" fontSize="10" fontWeight="800" fill={RISING} className="font-mono-board" letterSpacing="2">
                  RISING ▸
                </text>
                <text x={CX - 92} y={22} textAnchor="middle" fontSize="10" fontWeight="800" fill={DECLINING} className="font-mono-board" letterSpacing="2">
                  ◂ DECLINING
                </text>

                {/* sweep */}
                <g className="onb-radar-sweep">
                  <path d={`M${CX} ${CY} L${CX + RING_MAX} ${CY} A${RING_MAX} ${RING_MAX} 0 0 0 ${CX + 128.7} ${CY - 108} Z`} fill="url(#onb-sweep)" />
                  <line x1={CX} y1={CY} x2={CX + RING_MAX} y2={CY} stroke="#FBBF24" strokeWidth="1.5" strokeOpacity="0.85" />
                </g>

                {/* blips */}
                {blips.map(({ signal, n, x, y }, i) => {
                  const color = signal.direction === 'rising' ? RISING : DECLINING
                  const isActive = signal.id === activeId
                  return (
                    <g
                      key={signal.id}
                      className="cursor-pointer"
                      onClick={() => handleSelectSignal(signal.id, true)}
                      role="button"
                      aria-label={`${signal.label}: ${signal.metric}`}
                    >
                      <g className="onb-blip" style={{ animationDelay: `${i * 70}ms` }}>
                        {isActive && <circle cx={x} cy={y} r="19" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="3 3" />}
                        {signal.owned && <circle cx={x} cy={y} r="15" fill="none" stroke="#FBBF24" strokeWidth="2.5" />}
                        <circle cx={x} cy={y} r="11" fill={color} stroke="#fff" strokeWidth="1.5" />
                        <text x={x} y={y + 3.4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" className="font-mono-board">
                          {n}
                        </text>
                      </g>
                    </g>
                  )
                })}

                {/* you */}
                <circle cx={CX} cy={CY} r="13" fill="#FBBF24" stroke="#1C1917" strokeWidth="2.5" />
                <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill="#1C1917" className="font-signage">
                  {(snapshot.name || 'Y').charAt(0).toUpperCase()}
                </text>
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-3 pt-3 pb-1.5 text-[10px] font-mono-board tracking-wider text-stone-300">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: RISING }} /> RISING</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: DECLINING }} /> DECLINING</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400" /> ON YOUR PASS</span>
              <span className="text-stone-500">· FURTHER OUT = STRONGER MOVE</span>
            </div>
          </div>

          {/* Selected signal readout */}
          {active && (
            <div className="board-panel rounded-[22px] p-4 text-stone-100">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-board text-[10px] tracking-widest text-amber-300 font-bold">
                  SIGNAL #{numberOf(active)} · {active.kind.toUpperCase()}
                </span>
                <span
                  className="px-2 py-0.5 rounded font-mono-board text-[10px] font-black tracking-widest"
                  style={{ background: active.direction === 'rising' ? RISING : DECLINING, color: '#0C0A09' }}
                >
                  {active.direction.toUpperCase()}
                </span>
              </div>
              <div className="font-signage text-2xl font-black tracking-wide uppercase mt-1.5 leading-tight">{active.label}</div>
              <div className="font-mono-board text-sm font-bold mt-1" style={{ color: active.direction === 'rising' ? '#34D399' : '#FB7185' }}>
                {active.metric}
              </div>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{active.detail}</p>
              {active.pivot && (
                <p className="mt-2 text-xs text-amber-300 font-semibold">Pivot → {active.pivot}</p>
              )}
            </div>
          )}
        </div>

        {/* Signal lists */}
        <div className="xl:col-span-7">
          <div className="planner-card rounded-[28px] p-4 sm:p-5 flex flex-col h-[540px] sm:h-[580px] xl:h-[635px]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-stone-900/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono-board text-[10px] font-black tracking-widest">MOVERS</span>
                <span className="font-mono-board text-xs text-stone-500 font-bold">WHAT THE MARKET IS DOING NOW</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-board text-[9px] text-stone-500 font-bold hidden sm:inline tracking-wider">
                  SCROLL FOR ALL {visible.length}
                </span>
                <div className="flex items-center gap-1 p-1 rounded-full bg-stone-900">
                  {(['all', 'role', 'skill'] as Filter[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full font-mono-board text-[10px] font-black tracking-widest transition-all cursor-pointer ${
                        filter === f ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'ALL' : f === 'role' ? 'ROLES' : 'SKILLS'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable list with custom transit scrollbar */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-4 mt-3 planner-scrollbar custom-scrollbar"
              tabIndex={0}
              aria-label="Market movers list"
            >
              {rising.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-signage text-xl font-black tracking-wider text-emerald-700 sticky top-0 bg-[#FBF8F1]/95 backdrop-blur-xs py-1.5 z-10">
                    <TrendingUp className="w-5 h-5" /> RISING <span className="font-mono-board text-xs text-stone-400">({rising.length})</span>
                  </div>
                  <div className="space-y-2">{rising.map(renderRow)}</div>
                </div>
              )}

              {declining.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 font-signage text-xl font-black tracking-wider text-rose-700 sticky top-0 bg-[#FBF8F1]/95 backdrop-blur-xs py-1.5 z-10">
                    <TrendingDown className="w-5 h-5" /> DECLINING <span className="font-mono-board text-xs text-stone-400">({declining.length})</span>
                  </div>
                  <div className="space-y-2">{declining.map(renderRow)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal read-out + continue ── */}
      <div className="board-panel rounded-[24px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
            {ownedDeclining.length > 0 ? <TriangleAlert className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </span>
          <div className="text-sm text-stone-200 leading-relaxed min-w-0">
            <div className="font-mono-board text-[10px] tracking-widest text-amber-300 font-bold mb-0.5">READ-OUT FOR {(snapshot.name || 'YOU').toUpperCase()}</div>
            {ownedRising.length > 0 && (
              <p>
                You already hold <strong className="text-emerald-300">{ownedRising.length} rising skill{ownedRising.length > 1 ? 's' : ''}</strong>:{' '}
                {ownedRising.map((s) => s.label.split(/[&(]/)[0].trim()).join(', ')}.
              </p>
            )}
            {ownedDeclining.length > 0 && (
              <p>
                <strong className="text-rose-300">Heads up:</strong>{' '}
                {ownedDeclining.map((s) => s.label.split(/[&(/]/)[0].trim()).join(', ')} {ownedDeclining.length > 1 ? 'are' : 'is'} fading —
                worth pivoting.
              </p>
            )}
            {ownedRising.length === 0 && ownedDeclining.length === 0 && (
              <p>None of your current skills are big market movers yet — the next stop shows exactly which ones to add.</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="group shrink-0 h-14 px-8 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-board text-sm font-black tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
        >
          <span>NEXT STOP · MY BEST-FIT ROLES</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  )
}
