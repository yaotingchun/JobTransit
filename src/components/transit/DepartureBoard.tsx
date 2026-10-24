import React, { useEffect, useState } from 'react'
import { RefreshCw, Radio } from 'lucide-react'
import { LINES, MARKET_TICKER, RANK_COLORS, type Station } from './transitData'

const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%+'

/** Split-flap text that scrambles and settles character-by-character. */
export const FlapText: React.FC<{ text: string; len: number; scrambleKey?: number; size?: 'sm' | 'md' }> = ({
  text,
  len,
  scrambleKey = 0,
  size = 'md',
}) => {
  const target = text.toUpperCase().padEnd(len, ' ').slice(0, len)
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    let frame = 0
    const settleAt = target.split('').map((_, i) => 4 + i + Math.floor(Math.random() * 5))
    const last = Math.max(...settleAt)
    const id = window.setInterval(() => {
      frame++
      setDisplay(
        target
          .split('')
          .map((c, i) => (c === ' ' || frame >= settleAt[i] ? c : FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]))
          .join(''),
      )
      if (frame >= last) window.clearInterval(id)
    }, 42)
    return () => window.clearInterval(id)
  }, [target, scrambleKey])

  return (
    <span className={`flap-row ${size === 'sm' ? 'flap-sm' : ''}`} aria-label={text}>
      {display.split('').map((c, i) => (
        <span key={i} className="flap-cell" aria-hidden="true">
          {c === ' ' ? '\u00A0' : c}
        </span>
      ))}
    </span>
  )
}

interface DepartureBoardProps {
  picks: Station[]
  originName: string
  selectedId: string
  routeMonths: Record<string, number>
  market: Record<string, number>
  scrambleKey: number
  minutesSinceScan: number
  onSelect: (id: string) => void
  onRescan: () => void
}

const STATUS = [
  { text: 'BOARDING', cls: 'text-amber-300 board-blink' },
  { text: 'ON TIME', cls: 'text-emerald-300' },
  { text: 'ARRIVING', cls: 'text-sky-300' },
]

export const DepartureBoard: React.FC<DepartureBoardProps> = ({
  picks,
  originName,
  selectedId,
  routeMonths,
  market,
  scrambleKey,
  minutesSinceScan,
  onSelect,
  onRescan,
}) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')

  return (
    <div className="board-panel rounded-[26px] p-4 sm:p-5 text-stone-100 relative overflow-hidden" id="departure-board">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono-board tracking-[0.25em] text-amber-400/90">
            <Radio className="w-3 h-3" /> LIVE · AI SIGNAL FEED
          </div>
          <h3 className="font-signage text-[26px] leading-none font-black tracking-wide mt-1.5">NEXT DEPARTURES</h3>
          <p className="text-[10.5px] font-mono-board text-stone-400 mt-1 tracking-wider">
            FROM <span className="text-stone-200">{originName.toUpperCase()}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono-board text-2xl font-bold text-amber-300 tabular-nums leading-none">
            {hh}
            <span className="board-blink">:</span>
            {mm}
          </div>
          <div className="text-[9px] font-mono-board text-stone-500 mt-1 tracking-widest">LOCAL</div>
        </div>
      </div>

      {/* Column header */}
      <div className="mt-4 grid grid-cols-[28px_1fr_44px] gap-2 text-[9px] font-mono-board tracking-[0.2em] text-stone-500 px-1">
        <span>#</span>
        <span>DESTINATION</span>
        <span className="text-right">FIT</span>
      </div>

      {/* Rows */}
      <div className="mt-1.5 space-y-1.5">
        {picks.map((s, i) => {
          const rank = s.topRank ?? 1
          const isSel = s.id === selectedId
          const line = LINES[s.lines[0]]
          const status = STATUS[i] ?? STATUS[1]
          return (
            <button
              key={s.id}
              id={`departure-${s.id}`}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full text-left rounded-2xl px-2 py-2 transition-all duration-200 cursor-pointer border ${
                isSel ? 'bg-white/[0.07] border-amber-400/40' : 'border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <div className="grid grid-cols-[28px_1fr_44px] gap-2 items-center">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center font-signage font-black text-sm text-white shadow-[0_0_14px_var(--g)]"
                  style={{ background: RANK_COLORS[rank].ring, ['--g' as string]: RANK_COLORS[rank].ring }}
                >
                  {rank}
                </span>
                <div className="min-w-0 overflow-hidden">
                  <FlapText text={s.name} len={22} scrambleKey={scrambleKey} size="sm" />
                </div>
                <span className="font-mono-board text-right text-[15px] font-bold text-emerald-300 tabular-nums">{s.fit}%</span>
              </div>
              <div className="mt-1.5 ml-[36px] flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono-board tracking-wider">
                <span className="flex items-center gap-1 text-stone-300">
                  <span
                    className="w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center text-white"
                    style={{ background: line.color }}
                  >
                    {line.code}
                  </span>
                  PLAT {line.code}
                </span>
                <span className="text-stone-400">{routeMonths[s.id] ?? s.months} MO</span>
                <span className="text-emerald-300">▲{s.signal?.demandDelta}%</span>
                <span className="text-stone-400">
                  MKT <span className="text-stone-200">{market[s.id]}</span>
                </span>
                <span className={`ml-auto font-bold ${status.cls}`}>{status.text}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Ticker */}
      <div className="mt-4 rounded-xl bg-black/50 border border-white/5 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#121316] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#121316] to-transparent z-10" />
        <div className="board-marquee whitespace-nowrap py-2 font-mono-board text-[10.5px] tracking-widest text-amber-300/90">
          {[...MARKET_TICKER, ...MARKET_TICKER].map((t, i) => (
            <span key={i} className="mx-4">
              ◆ {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-mono-board tracking-wider text-stone-500">
        <span>
          SIGNALS UPDATED {minutesSinceScan === 0 ? 'JUST NOW' : `${minutesSinceScan} MIN AGO`}
        </span>
        <button
          type="button"
          id="rescan-market-btn"
          onClick={onRescan}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 transition-colors cursor-pointer group"
        >
          <RefreshCw className="w-3 h-3 transition-transform duration-500 group-hover:rotate-180" />
          RE-SCAN MARKET
        </button>
      </div>
    </div>
  )
}
