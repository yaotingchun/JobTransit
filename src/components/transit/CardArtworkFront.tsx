import React from 'react'
import type { CardPassData, CardTheme } from './types'
import metroTrainGraphic from '../../assets/MetroTrainGraphic.png'
import metroCardTopTab from '../../assets/MetroCardTopTab.png'
import adminLicenseBadge from '../../assets/AdminLicenseBadge.png'
import { LINES, type LineId } from './transitData'

interface CardArtworkFrontProps {
  data: CardPassData
  theme: CardTheme
}

export const CardArtworkFront: React.FC<CardArtworkFrontProps> = ({ data }) => {
  // Primary & Official Theme: Career Metro Transit Pass
  return <CareerMetroFront data={data} />
}

// ─── Reusable 5-Point Star SVG ────────────────────────────────────────────────
const StarIcon: React.FC<{ color: string; className?: string }> = ({
  color,
  className = 'w-3 h-3 sm:w-3.5 sm:h-3.5',
}) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill={color}>
    <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" />
  </svg>
)

/** 10-segment gauge matching StationTicket.tsx in Transit section */
const Gauge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const filled = Math.min(10, Math.max(1, Math.round(value / 10)))
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between leading-none mb-0.5">
        <span className="text-[6.5px] sm:text-[7.5px] font-mono-board tracking-[0.12em] text-[#18181b]/70 font-bold uppercase">
          {label}
        </span>
        <span className="font-mono-board text-[7.5px] sm:text-[8.5px] font-black text-[#18181b] tabular-nums">
          {value}%
        </span>
      </div>
      <div className="flex gap-[2px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="h-2 sm:h-2.5 flex-1 rounded-[1.5px] transition-all duration-300"
            style={{
              background: i < filled ? color : 'rgba(24,24,27,0.18)',
              transform: i < filled ? 'scaleY(1)' : 'scaleY(0.75)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/** Deterministic pseudo-barcode from a string seed */
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
    <svg width="100%" height="16" viewBox="0 0 120 16" preserveAspectRatio="none">
      {bars.map((b, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={b} height="16" fill="#18181b" /> : null
        x += b + 0.6
        return rect
      })}
    </svg>
  )
}

/**
 * ─── CAREER METRO TRANSIT PASS (FRONT) ───────────────────────────────────────
 * 1. Keeps all original information & renewed information.
 * 2. Places SKILL FIT, CAREER PREFERENCE, and AI + MARKET PULSE below the picture.
 * 3. Keeps the original right-side structure, variables, and typography.
 */
export const CareerMetroFront: React.FC<{ data: CardPassData }> = ({ data }) => {
  const cardholderName = (data.holderName || data.firstName || 'ALEXANDER J. MERCER').trim().toUpperCase()
  const licenseNum = data.licenseNumber || '8618'
  const passId = data.passId || `JT-${licenseNum}-2026`

  const hasCustomPhoto =
    data.photoUrl &&
    !data.photoUrl.includes('dicebear') &&
    !data.photoUrl.includes('avatar') &&
    !data.photoUrl.includes('JobTransitTrainLogo')

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#FAF7EE] text-[#18181b] font-sans border-[2.5px] sm:border-[3px] border-[#18181b] rounded-[22px] p-2.5 sm:p-3 flex flex-col justify-between shadow-xs">
      {/* ── Top Hanging Tab (Centered at Top Edge) ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex justify-center pointer-events-none">
        <img
          src={metroCardTopTab}
          alt="JobTransit Career Navigator"
          className="h-4.5 sm:h-5.5 md:h-6.5 w-auto object-contain"
        />
      </div>

      {/* ── Top Row: 6 Stars & Transit Badges on Left, #OF LICENSE on Right ── */}
      <div className="flex items-start justify-between w-full pt-0.5 z-10 shrink-0">
        {/* Top-Left: 6 Stars + Transit Line Badges [A] [D] [I] + Zone Badge */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <StarIcon color="#ea580c" />
            <StarIcon color="#18181b" />
            <StarIcon color="#059669" />
            <StarIcon color="#18181b" />
            <StarIcon color="#ea580c" />
            <StarIcon color="#18181b" />
          </div>

          {/* Transit Line Badges [A] [D] [I] & ZONE 1 */}
          <div className="hidden sm:flex items-center gap-1 ml-1 pl-1 border-l border-stone-300">
            {(['amber', 'emerald', 'violet'] as LineId[]).map((l) => (
              <span
                key={l}
                className="w-3.5 h-3.5 rounded-full text-white text-[7.5px] font-black flex items-center justify-center shadow-2xs"
                style={{ background: LINES[l]?.color || '#1C1917' }}
              >
                {LINES[l]?.code || 'A'}
              </span>
            ))}
            <span className="px-1 py-0.2 rounded-xs bg-stone-900 text-amber-300 text-[7px] font-mono-board font-black">
              ZONE 1
            </span>
          </div>
        </div>

        {/* Top-Right: #OF LICENSE & Big Orange Number */}
        <div className="text-right leading-none">
          <span className="text-[7px] sm:text-[8px] md:text-[8.5px] font-mono font-black tracking-wider text-[#18181b] uppercase block">
            #OF LICENSE
          </span>
          <span className="font-mono font-black text-lg sm:text-xl md:text-2xl text-[#ea580c] tracking-tight block mt-0.5">
            {licenseNum}
          </span>
        </div>
      </div>

      {/* ── Mid Section: 2 Columns ── */}
      <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-center flex-1 my-auto w-full z-10 min-h-0">
        {/* ── Left Column (Col 1-5): Enlarged Picture + Gauges + Transparent Barcode (No Stars) ── */}
        <div className="col-span-5 flex flex-col justify-between items-center h-full py-0.5 space-y-1">
          {/* 2. Bigger Picture on Front */}
          <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-visible py-0.5">
            {hasCustomPhoto ? (
              <div className="w-full h-full max-h-[160px] sm:max-h-[185px] border-2 border-[#18181b] rounded-xl overflow-hidden aspect-[4/3] bg-[#FAF0DC] relative shadow-xs">
                <img src={data.photoUrl} alt="Passholder" className="w-full h-full object-cover" />
              </div>
            ) : (
              <img
                src={metroTrainGraphic}
                alt="JobTransit Metro Card Illustration"
                className="w-full h-auto max-h-[160px] sm:max-h-[185px] object-contain drop-shadow-sm scale-115 sm:scale-120"
              />
            )}
          </div>

          {/* 3. Gauges Directly Below Picture (White Background Removed) */}
          <div className="w-full space-y-0.5 sm:space-y-1 px-0.5 shrink-0">
            <Gauge label="SKILL FIT" value={data.matchScore || 85} color="#0E9F6E" />
            <Gauge label="CAREER PREF" value={data.careerPrefScore || 88} color="#1F8FD6" />
            <Gauge label="AI + MARKET" value={data.aiMarketScore || 94} color="#E39B0B" />
          </div>

          {/* Barcode Placed Where Stars Were, Background Removed */}
          <div className="w-full flex flex-col items-center justify-center pt-0.5 shrink-0">
            <Barcode seed={passId} />
            <span className="font-mono font-bold text-[6px] sm:text-[7px] tracking-widest text-[#18181b] block mt-0.5 uppercase leading-none">
              {passId}
            </span>
          </div>
        </div>

        {/* ── Right Column (Col 6-12): Original Variables & Structure (Instruction 3) ── */}
        <div className="col-span-7 flex flex-col justify-between h-full pl-0.5 text-left space-y-1">
          {/* 4. Main Title: TRANSIT PASS (Shown in a Single Line) */}
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <h2 className="font-sans font-black text-base sm:text-lg md:text-[21px] text-[#18181b] leading-none tracking-tight uppercase whitespace-nowrap">
                TRANSIT PASS
              </h2>
              <span className="px-1.5 py-0.5 rounded-sm bg-stone-900 text-amber-300 text-[6.5px] sm:text-[7.5px] font-mono-board font-black whitespace-nowrap shrink-0">
                LVL 1 • 6,340 XP
              </span>
            </div>
            <p className="font-mono text-[5.5px] sm:text-[6.5px] md:text-[7.2px] text-[#18181b]/85 leading-tight mt-1 max-w-[280px]">
              This transit pass empowers you to navigate your career without limits - unlock your full potential to shape a world of boundless possibilities.
            </p>
          </div>

          {/* ID Form Grid Box */}
          <div className="relative mt-0.5 border-[1.5px] sm:border-2 border-[#18181b] rounded-lg sm:rounded-xl bg-white overflow-visible divide-y-[1.5px] sm:divide-y-2 divide-[#18181b] shadow-xs">
            {/* Overlapping ADMIN/LICENSE Badge */}
            <div className="absolute -top-3 right-1 sm:right-1.5 z-10">
              <img
                src={adminLicenseBadge}
                alt="ADMIN/LICENSE"
                className="h-4 sm:h-5 w-auto object-contain drop-shadow-xs"
              />
            </div>

            {/* NAME */}
            <div className="px-2 py-0.5 sm:py-1">
              <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                NAME
              </span>
              <span className="text-[10px] sm:text-[11px] md:text-[12px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight truncate mt-0.5">
                {cardholderName}
              </span>
            </div>

            {/* OCCUPATION */}
            <div className="px-2 py-0.5 sm:py-1">
              <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                OCCUPATION
              </span>
              <span className="text-[8.5px] sm:text-[10px] md:text-[11px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight truncate mt-0.5">
                {data.occupation || 'SOFTWARE PROFESSIONAL'}
              </span>
            </div>

            {/* D.O.B & NATIONALITY */}
            <div className="grid grid-cols-2 divide-x-[1.5px] sm:divide-x-2 divide-[#18181b]">
              <div className="px-2 py-0.5 sm:py-1">
                <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                  D.O.B
                </span>
                <span className="text-[8px] sm:text-[9.5px] md:text-[10px] font-black text-[#18181b] font-mono tracking-widest uppercase block leading-tight mt-0.5">
                  {data.dob || '15/09/2005'}
                </span>
              </div>
              <div className="px-2 py-0.5 sm:py-1">
                <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                  NATIONALITY
                </span>
                <span className="text-[8px] sm:text-[9.5px] md:text-[10px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight mt-0.5 truncate">
                  {data.nationality || 'MALAYSIA'}
                </span>
              </div>
            </div>
          </div>

          {/* Target Role Badge (Shown in whole with enlarged bold font, placed neatly before VERIFIED status) */}
          <div className="my-0.5 sm:my-1 flex items-center justify-between gap-1.5 min-w-0">
            <span className="flex-1 min-w-0 font-sans font-black text-sm sm:text-[15px] md:text-base text-[#18181b] tracking-tight uppercase leading-tight break-words">
              {data.roleBadge || 'CAREER TRANSIT USER'}
            </span>
            <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 self-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              VERIFIED
            </span>
          </div>

          {/* Expertise Form Field */}
          <div className="border-[1.5px] sm:border-2 border-[#18181b] rounded-md sm:rounded-lg px-2 py-0.5 sm:py-1 bg-white shadow-2xs">
            <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
              EXPERTISE
            </span>
            <span className="text-[8px] sm:text-[9.5px] md:text-[10.5px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight truncate mt-0.5">
              {data.expertise || data.roleTitle || 'CAREER NAVIGATOR'}
            </span>
          </div>

          {/* Renewed Transit Information Row */}
          <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-mono-board text-stone-600 font-bold border-t border-stone-300 pt-0.5">
            <span>RIDE: 3 MO · +350 XP</span>
            <span className="text-stone-900 font-black">5 ◈ FARE TOKENS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
