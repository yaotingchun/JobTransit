import React from 'react'
import type { CardPassData, CardTheme } from './types'
import trainLogoImg from '../../assets/JobTransitTrainLogo.png'

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

  // Default & Primary Theme: Authentic "Creative License" with Train Logo and User Name
  return <CreativeLicenseFront data={data} />
}

// ─── Theme: USER LICENSE (With Train Logo & No Signature) ──────────────────────
export const CreativeLicenseFront: React.FC<{ data: CardPassData }> = ({ data }) => {
  const cardholderName = (data.holderName || data.firstName || 'TRANSIT USER').trim().toUpperCase()

  // Train Logo from uploaded user image
  const trainLogoSrc =
    data.photoUrl && !data.photoUrl.includes('dicebear') && !data.photoUrl.includes('avatar')
      ? data.photoUrl
      : trainLogoImg

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#f4f5f7] text-slate-800 font-sans">
      {/* ── Corner Geometric Accents ── */}
      {/* Top Left Diagonal Orange & Slate Band */}
      <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none z-10 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <polygon points="0,0 48,0 0,48" fill="#f97316" />
          <polygon points="0,48 54,0 58,0 0,58" fill="#ffffff" />
          <polygon points="0,58 64,0 74,0 0,74" fill="#cbd5e1" opacity="0.8" />
        </svg>
      </div>

      {/* Bottom Right Emerald Teal Corner Tab */}
      <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none z-10 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <path d="M 100 45 L 45 100 L 100 100 Z" fill="#0d9488" />
          <path d="M 100 35 L 35 100 L 40 100 L 100 40 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* ── Background Watermark: Prism Logo & "VALID UNTIL IT DOESN'T" ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative opacity-[0.08] flex flex-col items-center translate-x-12 translate-y-2">
          <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
            <path d="M 50 15 L 78 62 L 62 62 L 50 40 L 38 62 L 22 62 Z" fill="#f97316" />
            <path d="M 66 65 L 82 65 L 50 12 L 40 28 Z" fill="#334155" />
            <circle cx="50" cy="50" r="10" fill="#0d9488" />
          </svg>
          <div className="font-mono text-[7px] text-slate-800 text-center uppercase tracking-widest mt-0.5">
            <span className="block">VALID</span>
            <span className="block">UNTIL</span>
            <span className="block">IT DOESN'T</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid (Scaled to fit 100% without any clipping) ── */}
      <div className="relative z-10 h-full p-2.5 sm:p-3.5 flex flex-col justify-between">
        {/* Top Header Row: 5 Stars & #OF LICENSE 0051 */}
        <div className="flex items-start justify-between pl-8 sm:pl-10">
          {/* Centered 5 Stars */}
          <div className="flex items-center gap-1.5 pt-0.5 ml-4 sm:ml-8">
            <svg className="w-3.5 h-3.5 fill-[#f97316]" viewBox="0 0 24 24">
              <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-[#334155]" viewBox="0 0 24 24">
              <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-[#0d9488]" viewBox="0 0 24 24">
              <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-[#f97316]" viewBox="0 0 24 24">
              <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-[#334155]" viewBox="0 0 24 24">
              <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" />
            </svg>
          </div>

          {/* License Number Block */}
          <div className="text-right leading-none">
            <span className="text-[7.5px] font-mono font-bold tracking-wider text-[#334155] uppercase block">
              #OF LICENSE
            </span>
            <span className="font-mono font-black text-xl sm:text-[24px] text-[#f97316] tracking-wider block mt-0.5">
              {data.licenseNumber || '0051'}
            </span>
          </div>
        </div>

        {/* Mid Section: Left Column (Barcode & Corner Space) + Right Column (User Name, Form Grid, Role) */}
        <div className="grid grid-cols-12 gap-2.5 sm:gap-3 items-center flex-1 my-auto">
          {/* ── Left Column (Col 1-5): Security Barcode above corner illustration ── */}
          <div className="col-span-5 flex flex-col items-center justify-start h-full pt-1 sm:pt-2">
            {/* High-Resolution Security Barcode */}
            <div className="text-center w-full pl-2 sm:pl-3">
              <svg className="w-32 sm:w-36 h-4 sm:h-4.5 mx-auto" viewBox="0 0 120 20" fill="#0f172a">
                <rect x="0" y="0" width="2" height="20" />
                <rect x="4" y="0" width="1" height="20" />
                <rect x="7" y="0" width="3" height="20" />
                <rect x="12" y="0" width="2" height="20" />
                <rect x="16" y="0" width="1" height="20" />
                <rect x="19" y="0" width="3" height="20" />
                <rect x="24" y="0" width="2" height="20" />
                <rect x="28" y="0" width="1" height="20" />
                <rect x="31" y="0" width="4" height="20" />
                <rect x="37" y="0" width="1" height="20" />
                <rect x="40" y="0" width="2" height="20" />
                <rect x="44" y="0" width="3" height="20" />
                <rect x="49" y="0" width="1" height="20" />
                <rect x="52" y="0" width="3" height="20" />
                <rect x="57" y="0" width="2" height="20" />
                <rect x="61" y="0" width="4" height="20" />
                <rect x="67" y="0" width="1" height="20" />
                <rect x="70" y="0" width="2" height="20" />
                <rect x="74" y="0" width="3" height="20" />
                <rect x="79" y="0" width="1" height="20" />
                <rect x="82" y="0" width="3" height="20" />
                <rect x="87" y="0" width="2" height="20" />
                <rect x="91" y="0" width="4" height="20" />
                <rect x="97" y="0" width="1" height="20" />
                <rect x="100" y="0" width="3" height="20" />
                <rect x="105" y="0" width="2" height="20" />
                <rect x="109" y="0" width="1" height="20" />
                <rect x="112" y="0" width="3" height="20" />
                <rect x="117" y="0" width="2" height="20" />
              </svg>
              <span className="text-[6.5px] sm:text-[7px] font-mono tracking-widest text-slate-700 font-bold block mt-0.5">
                {data.passId || 'SR-VISUAL-0051'}
              </span>
            </div>
          </div>

          {/* ── Right Column (Col 6-12): User Name, Form Grid, Role, Expertise ── */}
          <div className="col-span-7 flex flex-col justify-between h-full pl-0.5">
            {/* Title: TRANSIT PASS */}
            <div>
              <h2 className="font-hero font-black text-xl sm:text-2xl leading-none tracking-tight uppercase truncate">
                <span className="text-[#1e293b] block">TRANSIT</span>
                <span className="text-[#059669] block mt-0.5">PASS</span>
              </h2>
              <p className="font-mono text-[5.5px] sm:text-[6.5px] text-slate-500 leading-tight mt-1 max-w-[220px]">
                This transit pass empowers you to navigate your career without limits — unlock your full potential to shape a world of boundless possibilities.
              </p>
            </div>

            {/* Official ID Box Grid (WITHOUT SIGNATURE - Clean, fully visible) */}
            <div className="my-1 border border-slate-300 rounded-sm bg-white/70 overflow-hidden divide-y divide-slate-300 text-left">
              {/* Name Box (Uses profile name!) */}
              <div className="px-2 py-0.5">
                <span className="text-[5px] font-mono uppercase text-slate-400 block">Name</span>
                <span className="text-[10px] sm:text-[11px] font-black text-[#1e293b] font-mono tracking-wider block leading-tight truncate">
                  {cardholderName}
                </span>
              </div>

              {/* Occupation Box */}
              <div className="px-2 py-0.5">
                <span className="text-[5px] font-mono uppercase text-slate-400 block">Occupation</span>
                <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#1e293b] font-mono tracking-wider block leading-tight truncate">
                  {data.occupation || 'PROFESSIONAL'}
                </span>
              </div>

              {/* D.O.B & Nationality split */}
              <div className="grid grid-cols-2 divide-x divide-slate-300">
                <div className="px-2 py-0.5">
                  <span className="text-[5px] font-mono uppercase text-slate-400 block">D.O.B</span>
                  <span className="text-[9px] sm:text-[9.5px] font-bold text-[#1e293b] font-mono block leading-tight">
                    {data.dob || '15/09/2000'}
                  </span>
                </div>
                <div className="px-2 py-0.5">
                  <span className="text-[5px] font-mono uppercase text-slate-400 block">Nationality</span>
                  <span className="text-[9px] sm:text-[9.5px] font-bold text-[#1e293b] font-mono block leading-tight truncate">
                    {data.nationality || 'MALAYSIA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Header Banner (Completely visible!) */}
            <div className="my-0.5">
              <h3 className="font-hero font-extrabold text-base sm:text-lg text-[#1e293b] tracking-wider uppercase leading-none truncate">
                {data.roleBadge || data.occupation || 'TRANSIT USER'}
              </h3>
            </div>

            {/* Expertise Box at Bottom (Completely visible inside the card!) */}
            <div className="border border-slate-300 rounded-sm bg-white/70 px-2 py-0.5 max-w-[92%]">
              <span className="text-[5px] font-mono uppercase text-slate-400 block">Expertise</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-[#1e293b] font-mono tracking-wide block leading-tight truncate">
                {data.expertise || data.industry || 'CAREER TRANSIT MEMBER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Train Illustration in the Corner (Transparent & compact) ── */}
      <div className="absolute bottom-0 left-0 w-43 sm:w-52 h-45 sm:h-54 pointer-events-none z-10 select-none">
        <img
          src={trainLogoSrc}
          alt="JobTransit Train Visual"
          className="w-full h-full object-contain object-bottom-left drop-shadow-[0_10px_6px_rgba(15,23,42,0.12)]"
        />
      </div>

      {/* Realistic Plastic Card Rim & Corner Bevel */}
      <div className="absolute inset-0 rounded-[22px] border border-white/60 pointer-events-none z-20" />
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.15)] pointer-events-none z-20" />
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
