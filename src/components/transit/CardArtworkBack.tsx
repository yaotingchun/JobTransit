import React, { useState } from 'react'
import type { CardPassData, CardTheme } from './types'
import { Copy, Check } from 'lucide-react'

interface CardArtworkBackProps {
  data: CardPassData
  theme: CardTheme
  onNfcTap?: () => void
}

export const CardArtworkBack: React.FC<CardArtworkBackProps> = ({
  data,
  theme,
  onNfcTap,
}) => {
  if (theme === 'metro-taipei' || theme === 'jobtransit-obsidian' || theme === 'emerald-line') {
    return <ClassicTransitBack data={data} theme={theme} onNfcTap={onNfcTap} />
  }

  // Default & Primary: Creative License Back matching user reference image
  return <CreativeLicenseBack data={data} onNfcTap={onNfcTap} />
}

// ─── Theme: CREATIVE LICENSE BACK (User's Reference Image) ────────────────────
export const CreativeLicenseBack: React.FC<{
  data: CardPassData
  onNfcTap?: () => void
}> = ({ data }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(data.email || 'xyncatalyst51@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#f4f5f7] text-slate-800 font-sans p-4 sm:p-5 flex justify-between gap-3">
      {/* ── Corner Geometric Accents (Matching Front) ── */}
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

      {/* ── Left Half: Logo, Sticker Cluster, & Matisse Quote ── */}
      <div className="relative z-10 w-[42%] flex flex-col justify-between pl-6 sm:pl-8 py-1">
        {/* Large Prism Geometric Logo */}
        <div className="pt-2">
          <svg className="w-20 sm:w-24 h-16 sm:h-20" viewBox="0 0 100 80" fill="none">
            {/* Orange Upper Triangle */}
            <polygon points="45,5 75,55 52,55 38,30" fill="#f97316" />
            {/* Navy Slate Lower Segment */}
            <polygon points="56,28 78,56 60,78 44,55" fill="#334155" />
            {/* Teal/Mint Circle Node */}
            <circle cx="78" cy="70" r="9" fill="#10b981" />
          </svg>
        </div>

        {/* ── Streetwear / Indie Sticker Cluster ── */}
        <div className="relative -mt-2 my-auto pl-1">
          {/* Sticker 1: Yellow Screw Graphic Sticker */}
          <div className="relative z-10 inline-block bg-[#facc15] border-2 border-black rounded-xs px-2 py-0.5 shadow-sm transform -rotate-3 hover:scale-105 transition-transform">
            <svg className="w-20 sm:w-24 h-5" viewBox="0 0 100 20" fill="none">
              {/* Screw head cross */}
              <circle cx="12" cy="10" r="7" fill="#fef08a" stroke="#000" strokeWidth="1.5" />
              <line x1="12" y1="5" x2="12" y2="15" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              <line x1="7" y1="10" x2="17" y2="10" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              {/* Screw shaft & threads */}
              <rect x="19" y="8" width="70" height="4" fill="#000" />
              {/* Thread ridges */}
              {[...Array(12)].map((_, i) => (
                <line
                  key={i}
                  x1={24 + i * 5}
                  y1="5"
                  x2={28 + i * 5}
                  y2="15"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>

          {/* Sticker 2: Red "STAY OUT EVERYBODY" Sticker */}
          <div className="relative z-20 -mt-2 ml-4 inline-block bg-[#dc2626] border-2 border-white rounded-xs px-2 py-0.5 shadow-md transform rotate-2">
            <div className="font-hero font-black text-[9px] sm:text-[10px] text-white uppercase leading-none tracking-tight text-center">
              <span>STAY OUT</span>
              <span className="block">EVERYBODY</span>
            </div>
          </div>

          {/* Sticker 3: Blue "SICK, SAD WORLD" Sticker */}
          <div className="relative z-30 -mt-2 inline-block bg-[#60a5fa] border border-blue-900 rounded-xs px-2 py-0.5 shadow-sm transform -rotate-1">
            <span
              className="font-black text-[9px] sm:text-[10px] text-slate-950 uppercase tracking-tight block"
              style={{ fontFamily: 'Impact, sans-serif' }}
            >
              SICK, SAD WORLD
            </span>
          </div>

          {/* Sticker 4: Yellow Oval "NO SUBSTITUTE" Sticker */}
          <div className="relative z-40 -mt-1 ml-2 inline-block bg-[#fde047] border-2 border-black rounded-full px-2.5 py-0.5 shadow-sm transform rotate-4">
            <span className="font-hero font-black text-[8px] sm:text-[9px] text-black uppercase tracking-wider block">
              NO SUBSTITUTE
            </span>
          </div>
        </div>

        {/* Quote at Bottom Left: Matisse quote */}
        <div className="font-mono text-[7px] sm:text-[8px] text-slate-600 leading-tight">
          <p className="italic">"{data.quote || 'Creativity takes courage.'}"</p>
          <p className="mt-0.5 text-slate-400">- {data.quoteAuthor || 'Henri Matisse'}</p>
        </div>
      </div>

      {/* ── Right Half: Monospace Information Terminal Box ── */}
      <div className="relative z-10 w-[58%] border border-slate-400 rounded-sm p-3 sm:p-4 bg-white/50 backdrop-blur-xs flex flex-col justify-between text-left font-mono">
        {/* Section 1: Skills */}
        <div>
          <div className="text-right">
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 italic">
              Skills
            </span>
          </div>
          <p className="text-[7.5px] sm:text-[8.5px] text-slate-700 leading-relaxed text-right mt-0.5">
            {data.skills && data.skills.length > 0
              ? data.skills.join(', ')
              : 'Problem Solving, Strategic Planning, System Architecture, Technical Execution'}
          </p>
        </div>

        {/* Section 2: Tools & Software */}
        <div className="text-right my-auto py-1">
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 block italic">
            Tools & Technologies
          </span>
          <div className="text-[7.5px] sm:text-[8.5px] text-slate-600 leading-tight space-y-0.5 mt-0.5">
            {(data.softwareList && data.softwareList.length > 0
              ? data.softwareList
              : data.skills && data.skills.length > 0
              ? data.skills.slice(0, 5)
              : ['Git', 'VS Code', 'Docker', 'Postman', 'Figma']
            ).map((sw) => (
              <p key={sw}>{sw}</p>
            ))}
          </div>
        </div>

        {/* Section 3: Contact */}
        <div className="text-right border-t border-slate-300 pt-1.5">
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 block italic">
            Contact
          </span>
          <div className="text-[7px] sm:text-[8px] text-slate-600 font-mono mt-0.5 space-y-0.5">
            {data.phone ? <p>PH: {data.phone}</p> : null}
            <p className="flex items-center justify-end gap-1">
              <span>Gmail: {data.email || 'user@jobtransit.ai'}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-0.5 hover:bg-slate-200 rounded cursor-pointer"
                title="Copy Email"
              >
                {copied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
              </button>
            </p>
            <p>INS: {data.instagram || `@${(data.holderName || 'transit').toLowerCase().replace(/\s+/g, '_')}`}</p>
          </div>
        </div>
      </div>

      {/* Card Border & Bevel */}
      <div className="absolute inset-0 rounded-[22px] border border-white/60 pointer-events-none" />
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.15)] pointer-events-none" />
    </div>
  )
}

// ─── Classic Transit Back Component (Retained for alternate themes) ───────────
const ClassicTransitBack: React.FC<{
  data: CardPassData
  theme: CardTheme
  onNfcTap?: () => void
}> = ({ data, theme }) => {
  const isObsidian = theme === 'jobtransit-obsidian'
  const isEmerald = theme === 'emerald-line'

  const bgColor = isObsidian ? 'bg-[#0b0f19]' : isEmerald ? 'bg-[#062c22]' : 'bg-[#181a20]'

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${bgColor} text-slate-100 flex flex-col justify-between p-4`}>
      <div className="w-full h-8 bg-black/60 rounded-xs flex items-center px-3 text-[8px] font-mono text-white/40">
        MAGNETIC STRIPE // ISO/IEC 7810 ID-1
      </div>
      <div className="flex justify-between items-center my-auto">
        <div>
          <span className="text-xs font-bold text-white">{data.holderName}</span>
          <p className="text-[10px] text-white/60">{data.roleTitle}</p>
          <p className="text-[9px] text-white/40 font-mono mt-1">PASS: {data.passId}</p>
        </div>
        <div className="text-right">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
            {data.matchScore}% Verified
          </span>
        </div>
      </div>
      <div className="border-t border-white/10 pt-2 flex justify-between items-center text-[8px] text-white/40 font-mono">
        <span>{data.serialNumber}</span>
        <span className="text-emerald-400">AUTHENTICATED</span>
      </div>
    </div>
  )
}
