import React from 'react'
import { Check, CloudFog, Lock, Sparkles, TrainFront, TrendingUp, GraduationCap, ArrowRight } from 'lucide-react'
import { LINES, ORIGIN_ID, RANK_COLORS, type Route, type Station } from './transitData'

interface StationTicketProps {
  station: Station
  zone: number
  route: Route | null
  locked: boolean
  tokens: number
  market: number | undefined
  onScout: () => void
  onBoard: () => void
  onOpenPathway: () => void
}

/** 10-segment gauge, like a fuel/power meter. */
const Gauge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const filled = Math.round(value / 10)
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[9.5px] font-mono-board tracking-[0.18em] text-stone-500">{label}</span>
        <span className="font-mono-board text-xs font-bold text-stone-900 tabular-nums">{value}</span>
      </div>
      <div className="mt-1 flex gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 flex-1 rounded-[2px] transition-all duration-500"
            style={{
              background: i < filled ? color : 'rgba(120,113,108,0.18)',
              transitionDelay: `${i * 35}ms`,
              transform: i < filled ? 'scaleY(1)' : 'scaleY(0.7)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const w = 96
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 4) - 2])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
    </svg>
  )
}

/** Deterministic pseudo-barcode from a string. */
const Barcode: React.FC<{ seed: string }> = ({ seed }) => {
  const bars: number[] = []
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  for (let i = 0; i < 34; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    bars.push(1 + (h % 3))
  }
  let x = 0
  return (
    <svg width="100%" height="30" viewBox="0 0 120 30" preserveAspectRatio="none">
      {bars.map((b, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={b} height="30" fill="#1C1917" /> : null
        x += b + 0.6
        return rect
      })}
    </svg>
  )
}

export const StationTicket: React.FC<StationTicketProps> = ({
  station: s,
  zone,
  route,
  locked,
  tokens,
  market,
  onScout,
  onBoard,
  onOpenPathway,
}) => {
  const isOrigin = s.id === ORIGIN_ID
  const line = LINES[s.lines[0]]
  const accent = s.topRank ? RANK_COLORS[s.topRank].ring : line.color

  const signal = s.signal ?? {
    skillFit: s.fit,
    preference: Math.max(65, Math.min(95, s.fit + 4)),
    market: market ?? Math.max(70, Math.min(96, s.fit + 8)),
    demandDelta: Math.max(14, Math.floor(s.fit * 0.32)),
    trend: [s.fit - 14, s.fit - 11, s.fit - 8, s.fit - 9, s.fit - 4, s.fit - 2, s.fit + 1, s.fit + 5],
    notes: [
      `Strong hiring velocity across regional tech employers (${s.salary} / month)`,
      `High skill synergy with your existing full-stack foundation`,
      `Rapid industry adoption driving demand for ${s.name} capabilities`,
    ],
  }

  return (
    <div className="ticket-paper rounded-[22px] overflow-hidden relative" id="station-ticket">
      {/* Coloured header band */}
      <div className="relative px-5 pt-4 pb-3 text-white" style={{ background: accent }}>
        <div className="absolute inset-0 opacity-20 ticket-stripes" />
        <div className="relative flex items-center justify-between text-[10px] font-mono-board tracking-[0.2em]">
          <span className="flex items-center gap-1">
            {s.lines.map((l) => (
              <span
                key={l}
                className="w-4 h-4 rounded-full bg-white text-[9px] font-black flex items-center justify-center"
                style={{ color: LINES[l].color }}
              >
                {LINES[l].code}
              </span>
            ))}
            <span className="ml-1.5">{isOrigin ? 'ORIGIN' : `ZONE ${zone}`}</span>
          </span>
          <span>
            {s.topRank
              ? `TOP PICK #${s.topRank}`
              : isOrigin
                ? 'YOU ARE HERE'
                : locked
                  ? 'PLANNED EXTENSION'
                  : line.name.toUpperCase()}
          </span>
        </div>
        <h3 className="relative font-signage text-[28px] leading-[0.95] font-black tracking-wide mt-2">{s.name.toUpperCase()}</h3>
      </div>

      <div className="px-5 pt-3.5 pb-4 space-y-3.5">
        <p className="text-xs text-stone-600 leading-relaxed">{s.blurb}</p>

        {locked && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900">
            <div className="flex items-center gap-2">
              <CloudFog className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-[11px] leading-tight font-medium">
                <span className="font-bold">Uncharted Station:</span> Spend tokens to scout and unlock routes on the metro map.
              </div>
            </div>
            <button
              type="button"
              id="scout-station-btn"
              onClick={onScout}
              disabled={tokens < 2}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-amber-300 text-xs font-bold font-mono-board tracking-wider hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
            >
              <Lock className="w-3 h-3" />
              SCOUT · 2 ◈
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          <Gauge label="SKILL FIT" value={signal.skillFit} color="#0E9F6E" />
          <Gauge label="CAREER PREFERENCE" value={signal.preference} color="#1F8FD6" />
          <Gauge label="AI + MARKET PULSE" value={market ?? signal.market} color="#E39B0B" />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-stone-900/[0.04] border border-stone-900/10 px-3 py-2">
          <div>
            <div className="text-[9.5px] font-mono-board tracking-[0.18em] text-stone-500">8-WEEK DEMAND</div>
            <div className="flex items-center gap-1 text-sm font-bold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />+{signal.demandDelta}% QoQ
            </div>
          </div>
          <Sparkline data={signal.trend} color={accent} />
        </div>
        <ul className="space-y-1.5">
          {signal.notes.map((n) => (
            <li key={n} className="flex gap-2 text-[11.5px] text-stone-700 leading-snug">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-px" style={{ color: accent }} />
              {n}
            </li>
          ))}
        </ul>

        {/* Skills */}
        <div className="space-y-2">
          <div className="text-[9.5px] font-mono-board tracking-[0.18em] text-stone-500">
            {isOrigin ? 'SKILLS ON YOUR CARD' : 'TICKETS IN HAND'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {s.skillsHave.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-600/10 text-emerald-800 border border-emerald-700/15">
                <Check className="w-3 h-3" />
                {k}
              </span>
            ))}
          </div>
          {s.skillsGap.length > 0 && (
            <>
              <div className="text-[9.5px] font-mono-board tracking-[0.18em] text-stone-500 pt-1">FARES TO PAY · SKILL GAPS</div>
              <div className="flex flex-wrap gap-1.5">
                {s.skillsGap.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-stone-800 border border-dashed border-stone-400">
                    {k}
                    <span className="text-amber-600 font-mono-board text-[10px]">◈</span>
                  </span>
                ))}
              </div>
            </>
          )}
          {/* Personalised Reskilling Pathway Action Button */}
          {!isOrigin && (
            <button
              type="button"
              id="ticket-open-reskilling-pathway"
              onClick={onOpenPathway}
              className="w-full mt-3 py-2.5 px-3.5 rounded-xl bg-stone-900 hover:bg-black text-amber-300 font-mono-board text-xs font-bold flex items-center justify-between border border-amber-400/40 shadow-sm transition-all active:scale-98 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Reskilling Pathway & Learning Plan</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-stone-300">
                <span>View Plan</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Perforation */}
      {!isOrigin && (
        <>
          <div className="ticket-perf relative h-5">
            <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[var(--ticket-bg)]" />
            <span className="absolute -right-2.5 top-0 w-5 h-5 rounded-full bg-[var(--ticket-bg)]" />
            <span className="absolute left-4 right-4 top-1/2 border-t-2 border-dashed border-stone-300" />
          </div>

          {/* Stub */}
          <div className="px-5 pb-5 pt-1 grid grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 font-mono-board">
                <div>
                  <div className="text-[9px] tracking-[0.18em] text-stone-500">RIDE</div>
                  <div className="text-sm font-bold text-stone-900">{route?.months ?? s.months} MO</div>
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.18em] text-stone-500">STOPS</div>
                  <div className="text-sm font-bold text-stone-900">{route ? route.stations.length - 1 : Math.max(1, zone)}</div>
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.18em] text-stone-500">REWARD</div>
                  <div className="text-sm font-bold text-amber-600">+{s.xp}</div>
                </div>
              </div>
              <div className="text-[10px] font-mono-board text-stone-500 tracking-wider">{s.salary} / MONTH</div>
              <div className="opacity-80">
                <Barcode seed={s.id} />
              </div>
            </div>
            <button
              type="button"
              id="board-train-btn"
              onClick={onBoard}
              className="group h-full min-h-[96px] w-[92px] rounded-2xl bg-stone-900 hover:bg-black text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)]"
            >
              <TrainFront className="w-6 h-6 text-amber-300 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="font-signage text-base font-black tracking-wider leading-none">BOARD</span>
              <span className="text-[9px] font-mono-board text-stone-400 tracking-widest">THIS LINE</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
