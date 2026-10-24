import React from 'react'
import type { CardPassData, CardTheme } from './types'
import metroTrainGraphic from '../../assets/MetroTrainGraphic.png'
import metroCardTopTab from '../../assets/MetroCardTopTab.png'
import adminLicenseBadge from '../../assets/AdminLicenseBadge.png'

interface CardArtworkFrontProps {
  data: CardPassData
  theme: CardTheme
}

export const CardArtworkFront: React.FC<CardArtworkFrontProps> = ({ data, theme }) => {
  if (theme === 'metro-taipei') {
    return <MetroTaipeiFront data={data} />
  }

  if (theme === 'jobtransit-obsidian') {
    return <ObsidianFront data={data} />
  }

  if (theme === 'emerald-line') {
    return <EmeraldFront data={data} />
  }

  // Default & Primary Theme: Authentic "JobTransit Metro Card" matching user reference design
  return <CreativeLicenseFront data={data} />
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

// ─── Theme: JOBTRANSIT METRO PASS (Matching Reference Card Exact Design) ──────
export const CreativeLicenseFront: React.FC<{ data: CardPassData }> = ({ data }) => {
  const cardholderName = (data.holderName || data.firstName || 'ALEXANDER J. MERCER').trim().toUpperCase()

  const hasCustomPhoto =
    data.photoUrl &&
    !data.photoUrl.includes('dicebear') &&
    !data.photoUrl.includes('avatar') &&
    !data.photoUrl.includes('JobTransitTrainLogo')

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#FAF7EE] text-[#18181b] font-sans border-[2.5px] sm:border-[3px] border-[#18181b] rounded-[22px] p-2.5 sm:p-3.5 flex flex-col justify-between">
      {/* ── Top Hanging Tab (Centered at Top Edge) ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex justify-center pointer-events-none">
        <img
          src={metroCardTopTab}
          alt="JobTransit Career Navigator"
          className="h-5 sm:h-6.5 md:h-7.5 w-auto object-contain"
        />
      </div>

      {/* ── Top Row: 6 Stars on Left, #OF LICENSE on Right ── */}
      <div className="flex items-start justify-between w-full pt-0.5 z-10">
        {/* Top-Left: 6 Stars (Orange, Black, Green, Black, Orange, Black) */}
        <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5">
          <StarIcon color="#ea580c" />
          <StarIcon color="#18181b" />
          <StarIcon color="#059669" />
          <StarIcon color="#18181b" />
          <StarIcon color="#ea580c" />
          <StarIcon color="#18181b" />
        </div>

        {/* Top-Right: #OF LICENSE & Big Orange Number */}
        <div className="text-right leading-none">
          <span className="text-[7.5px] sm:text-[8.5px] md:text-[9px] font-mono font-black tracking-wider text-[#18181b] uppercase block">
            #OF LICENSE
          </span>
          <span className="font-mono font-black text-xl sm:text-2xl md:text-[27px] text-[#ea580c] tracking-tight block mt-0.5">
            {data.licenseNumber || '8618'}
          </span>
        </div>
      </div>

      {/* ── Mid Section: 2 Columns (Left: Barcode, Train Graphic, 5 Stars; Right: Info Grid) ── */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center flex-1 my-auto w-full z-10">
        {/* ── Left Column (Col 1-5): Barcode + Metro Artwork + 5 Stars ── */}
        <div className="col-span-5 flex flex-col justify-between items-center h-full py-0.5">
          {/* Barcode Box */}
          <div className="w-full bg-white border-[1.5px] sm:border-2 border-[#18181b] rounded-lg sm:rounded-xl py-1 px-2 flex flex-col items-center justify-center text-center shadow-xs">
            <svg className="w-full max-w-[125px] sm:max-w-[140px] h-3.5 sm:h-4.5" viewBox="0 0 120 20" fill="#18181b">
              <rect x="0" y="0" width="2.5" height="20" />
              <rect x="4" y="0" width="1.2" height="20" />
              <rect x="7" y="0" width="3" height="20" />
              <rect x="12" y="0" width="2" height="20" />
              <rect x="16" y="0" width="1.2" height="20" />
              <rect x="19" y="0" width="3.2" height="20" />
              <rect x="24" y="0" width="2" height="20" />
              <rect x="28" y="0" width="1.2" height="20" />
              <rect x="31" y="0" width="4" height="20" />
              <rect x="37" y="0" width="1.2" height="20" />
              <rect x="40" y="0" width="2.2" height="20" />
              <rect x="44" y="0" width="3" height="20" />
              <rect x="49" y="0" width="1.2" height="20" />
              <rect x="52" y="0" width="3.2" height="20" />
              <rect x="57" y="0" width="2" height="20" />
              <rect x="61" y="0" width="4" height="20" />
              <rect x="67" y="0" width="1.2" height="20" />
              <rect x="70" y="0" width="2.2" height="20" />
              <rect x="74" y="0" width="3" height="20" />
              <rect x="79" y="0" width="1.2" height="20" />
              <rect x="82" y="0" width="3.2" height="20" />
              <rect x="87" y="0" width="2" height="20" />
              <rect x="91" y="0" width="4" height="20" />
              <rect x="97" y="0" width="1.2" height="20" />
              <rect x="100" y="0" width="3" height="20" />
              <rect x="105" y="0" width="2.2" height="20" />
              <rect x="109" y="0" width="1.2" height="20" />
              <rect x="112" y="0" width="3.2" height="20" />
              <rect x="117" y="0" width="2.5" height="20" />
            </svg>
            <span className="font-mono font-bold text-[6.5px] sm:text-[7.5px] md:text-[8px] tracking-widest text-[#18181b] block mt-0.5 uppercase leading-none">
              {data.passId || 'JT-DYYAQX-2026'}
            </span>
          </div>

          {/* Metro Illustration Artwork */}
          <div className="w-full my-1 sm:my-1.5 flex items-center justify-center">
            {hasCustomPhoto ? (
              <div className="w-full border-[1.5px] sm:border-2 border-[#18181b] rounded-xl sm:rounded-2xl overflow-hidden aspect-square bg-[#FAF0DC] relative shadow-xs">
                <img src={data.photoUrl} alt="Photo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <img
                src={metroTrainGraphic}
                alt="JobTransit Metro Card Illustration"
                className="w-full max-h-[145px] sm:max-h-[175px] object-contain drop-shadow-xs"
              />
            )}
          </div>

          {/* Bottom Stars (5 Stars: Orange, Black, Green, Orange, Black) */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 pt-0.5">
            <StarIcon color="#ea580c" />
            <StarIcon color="#18181b" />
            <StarIcon color="#059669" />
            <StarIcon color="#ea580c" />
            <StarIcon color="#18181b" />
          </div>
        </div>

        {/* ── Right Column (Col 6-12): TRANSIT PASS, ID Data Box, Role, Expertise ── */}
        <div className="col-span-7 flex flex-col justify-between h-full pl-0.5 text-left">
          {/* Main Title: TRANSIT PASS */}
          <div>
            <h2 className="font-sans font-black text-xl sm:text-2xl md:text-[27px] text-[#18181b] leading-[0.88] tracking-tight uppercase">
              <span className="block">TRANSIT</span>
              <span className="block mt-0.5">PASS</span>
            </h2>
            <p className="font-mono text-[5.5px] sm:text-[6.8px] md:text-[7.5px] text-[#18181b]/85 leading-tight mt-1 max-w-[280px]">
              This transit pass empowers you to navigate your career without limits - unlock your full potential to shape a world of boundless possibilities.
            </p>
          </div>

          {/* ID Form Grid Box */}
          <div className="relative mt-1 sm:mt-1.5 border-[1.5px] sm:border-2 border-[#18181b] rounded-lg sm:rounded-xl bg-white overflow-visible divide-y-[1.5px] sm:divide-y-2 divide-[#18181b] shadow-xs">
            {/* Overlapping ADMIN/LICENSE Badge */}
            <div className="absolute -top-3 right-1 sm:right-1.5 z-10">
              <img
                src={adminLicenseBadge}
                alt="ADMIN/LICENSE"
                className="h-4.5 sm:h-5.5 w-auto object-contain drop-shadow-xs"
              />
            </div>

            {/* NAME */}
            <div className="px-2 sm:px-2.5 py-0.5 sm:py-1">
              <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                NAME
              </span>
              <span className="text-[10px] sm:text-[12px] md:text-[13px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight truncate mt-0.5">
                {cardholderName}
              </span>
            </div>

            {/* OCCUPATION */}
            <div className="px-2 sm:px-2.5 py-0.5 sm:py-1">
              <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                OCCUPATION
              </span>
              <span className="text-[9px] sm:text-[11px] md:text-[12px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight truncate mt-0.5">
                {data.occupation || 'SOFTWARE PROFESSIONAL'}
              </span>
            </div>

            {/* D.O.B & NATIONALITY */}
            <div className="grid grid-cols-2 divide-x-[1.5px] sm:divide-x-2 divide-[#18181b]">
              <div className="px-2 sm:px-2.5 py-0.5 sm:py-1">
                <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                  D.O.B
                </span>
                <span className="text-[8.5px] sm:text-[10px] md:text-[11px] font-black text-[#18181b] font-mono tracking-widest uppercase block leading-tight mt-0.5">
                  {data.dob || '15/09/2005'}
                </span>
              </div>
              <div className="px-2 sm:px-2.5 py-0.5 sm:py-1">
                <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
                  NATIONALITY
                </span>
                <span className="text-[8.5px] sm:text-[10px] md:text-[11px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight truncate mt-0.5">
                  {data.nationality || 'JOHOR'}
                </span>
              </div>
            </div>
          </div>

          {/* Large Role Title under ID Box */}
          <div className="mt-1 sm:mt-1.5">
            <h3 className="font-sans font-black text-[12.5px] sm:text-[15px] md:text-[17px] text-[#18181b] tracking-wide uppercase leading-none truncate">
              {data.roleBadge || data.occupation || 'SOFTWARE PROFESSIONAL'}
            </h3>
          </div>

          {/* Expertise Box at Bottom */}
          <div className="border-[1.5px] sm:border-2 border-[#18181b] rounded-lg sm:rounded-xl bg-white px-2 sm:px-2.5 py-0.5 sm:py-1 mt-1 text-left shadow-xs">
            <span className="text-[5px] sm:text-[6px] font-mono font-bold uppercase tracking-wider text-[#18181b]/60 block leading-none">
              EXPERTISE
            </span>
            <span className="text-[8.5px] sm:text-[10px] md:text-[11px] font-black text-[#18181b] font-mono tracking-wider uppercase block leading-tight truncate mt-0.5">
              {data.expertise || data.industry || 'TECHNOLOGY'}
            </span>
          </div>
        </div>
      </div>

      {/* Realistic Plastic Card Rim & Corner Bevel */}
      <div className="absolute inset-0 rounded-[22px] border border-white/50 pointer-events-none z-20" />
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.12)] pointer-events-none z-20" />
    </div>
  )
}

// ─── Alternate Themes (Metro Taipei, Obsidian, Emerald) ────────────────────────
const MetroTaipeiFront: React.FC<{ data: CardPassData }> = ({ data }) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#ef5125]">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 110% 90% at 55% 45%, #f9632d 0%, #ee4b1f 60%, #dc3e14 100%)',
        }}
      />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 315" preserveAspectRatio="none">
        <defs>
          <linearGradient id="blueWaveGrad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="navyMountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <circle cx="275" cy="155" r="48" fill="#cbd5e1" opacity="0.95" />
        <path d="M 230 195 Q 310 165, 380 185 T 500 170 L 500 240 L 230 240 Z" fill="#867452" />
        <path d="M 380 185 Q 440 145, 500 162 L 500 215 L 380 215 Z" fill="#786644" />
        <g fill="#1e293b">
          <rect x="259.2" y="120" width="1.6" height="20" />
          <polygon points="260,116 258.5,123 261.5,123" />
          <rect x="257.5" y="132" width="5" height="5" />
          <polygon points="257,137 263,137 264.5,143 255.5,143" />
          <polygon points="256.5,143 263.5,143 265,149 255,149" />
          <polygon points="256,149 264,149 265.5,155 254.5,155" />
          <polygon points="255.5,155 264.5,155 266,161 254,161" />
          <polygon points="255,161 265,161 266.5,168 253.5,168" />
          <polygon points="254,168 266,168 267.5,176 252.5,176" />
          <rect x="251" y="176" width="18" height="28" />
          <rect x="238" y="185" width="13" height="20" />
          <rect x="269" y="172" width="18" height="34" />
        </g>
        <g>
          <path d="M 330 198 Q 345 192, 360 198 L 358 202 L 332 202 Z" fill="#ef4444" />
          <rect x="336" y="205" width="18" height="22" fill="#f1f5f9" />
          <rect x="306" y="210" width="16" height="22" fill="#ea580c" />
        </g>
        <path d="M 285 242 C 320 220, 360 255, 410 215 C 440 195, 475 220, 500 200 L 500 315 L 260 315 Z" fill="url(#blueWaveGrad)" />
        <path d="M 0 160 C 30 162, 70 178, 110 172 C 150 168, 180 188, 220 182 C 245 178, 260 192, 290 230 C 310 255, 340 265, 360 315 L 0 315 Z" fill="url(#navyMountainGrad)" />
      </svg>
      <div className="absolute top-4 left-5 flex items-center gap-2.5 z-10">
        <div className="w-8 h-8 rounded-full border border-white/30 bg-black/10 flex items-center justify-center">
          <span className="text-white text-xs font-bold">M</span>
        </div>
        <div className="leading-none text-white">
          <span className="font-extrabold text-base italic">metro</span>
          <span className="font-serif italic text-xs block opacity-95">Taipei</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-6 z-10 text-white">
        <div className="font-hero font-extrabold text-5xl leading-none">{data.hours}</div>
        <div className="mt-1 flex items-start gap-1.5">
          <span className="text-[#ea580c] text-xs font-black">◀</span>
          <div>
            <div className="font-bold text-xs">{data.hours} 小時票</div>
            <div className="font-medium text-[11px] text-white/90">{data.hours} Hours Pass</div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-5 z-10 text-right">
        <span className="text-[8px] uppercase text-white/75 font-semibold font-mono">
          TAIPEI RAPID TRANSIT CORPORATION
        </span>
      </div>
    </div>
  )
}

const ObsidianFront: React.FC<{ data: CardPassData }> = ({ data }) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 text-white p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <span className="font-hero font-bold text-cyan-300">JobTransit AI</span>
        <span className="text-[9px] text-cyan-400 font-mono border border-cyan-500/30 px-2 py-0.5 rounded-full">EXPRESS ROUTE</span>
      </div>
      <div>
        <div className="font-hero font-extrabold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300">{data.hours}H</div>
        <p className="text-xs text-cyan-200 mt-1">{data.roleTitle}</p>
      </div>
      <p className="text-[8px] text-white/40 font-mono">JOBTRANSIT SYSTEM ARCHITECTURE</p>
    </div>
  )
}

const EmeraldFront: React.FC<{ data: CardPassData }> = ({ data }) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#064e3b] text-white p-5 flex flex-col justify-between">
      <span className="font-hero font-bold text-emerald-200">Emerald Line</span>
      <div>
        <div className="font-hero font-extrabold text-5xl text-emerald-100">{data.hours}</div>
        <p className="text-xs text-emerald-300 mt-1">Green Transit Pass</p>
      </div>
      <p className="text-[8px] text-emerald-300/70 font-mono">EMERALD TRANSIT LINE CORPORATION</p>
    </div>
  )
}
