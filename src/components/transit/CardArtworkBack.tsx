import React, { useState } from 'react'
import type { CardPassData, CardTheme } from './types'
import { Copy, Check } from 'lucide-react'
import metroBackArtwork from '../../assets/MetroBackArtwork.png'

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
    navigator.clipboard?.writeText(data.email || 'user@jobtransit.ai')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#FAF7EE] text-slate-900 font-sans p-3 sm:p-4 flex justify-between gap-3 border-[2.5px] sm:border-[3px] border-[#18181b] rounded-[22px]">
      {/* ── Left Half: Artwork from user reference image ── */}
      <div className="relative z-10 h-full aspect-[327/480] rounded-xl overflow-hidden border-2 border-[#18181b] shadow-xs bg-[#FAF7EE] shrink-0 flex items-center justify-center">
        <img
          src={metroBackArtwork}
          alt="JobTransit Career Navigator Metro Artwork"
          className="w-full h-full object-contain object-center"
        />
      </div>

      {/* ── Right Half: Prominent Monospace Terminal Box with ENLARGED Typography ── */}
      <div className="relative z-10 flex-1 border-2 border-[#18181b] rounded-xl p-3 sm:p-4.5 bg-white/90 backdrop-blur-xs flex flex-col justify-between text-left font-mono shadow-xs overflow-hidden">
        {/* Section 1: Skills & Capabilities */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-slate-300 pb-1">
            <span className="text-xs sm:text-sm md:text-[15px] font-black text-slate-950 tracking-wider uppercase">
              Skills & Capabilities
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-emerald-700 font-black">
              ● VERIFIED
            </span>
          </div>
          <p className="text-[11px] sm:text-xs md:text-[13.5px] font-bold text-slate-900 leading-snug mt-2 line-clamp-3">
            {data.skills && data.skills.length > 0
              ? data.skills.slice(0, 6).join(' • ')
              : 'Problem Solving • Strategic Planning • System Architecture • Technical Execution'}
          </p>
        </div>

        {/* Section 2: Tools & Software (With larger badge tags) */}
        <div className="my-auto py-1">
          <div className="flex items-center justify-between border-b-2 border-slate-300 pb-1">
            <span className="text-xs sm:text-sm md:text-[15px] font-black text-slate-950 tracking-wider uppercase">
              Tools & Software
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-600 font-black uppercase">
              STACK
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(data.softwareList && data.softwareList.length > 0
              ? data.softwareList
              : data.skills && data.skills.length > 0
              ? data.skills.slice(0, 5)
              : ['Git', 'VS Code', 'Docker', 'Postman', 'Figma']
            ).slice(0, 5).map((sw) => (
              <span
                key={sw}
                className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-950 text-[11px] sm:text-xs md:text-[13px] font-black font-mono tracking-tight shadow-2xs"
              >
                {sw}
              </span>
            ))}
          </div>
        </div>

        {/* Section 3: Contact & Verification */}
        <div className="border-t-2 border-slate-300 pt-1.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm md:text-[15px] font-black text-slate-950 tracking-wider uppercase">
              Contact & Connect
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-600 font-black uppercase">
              AUTHENTICATED
            </span>
          </div>
          <div className="text-[11px] sm:text-xs md:text-[13px] text-slate-950 font-mono space-y-1.5 mt-1.5 font-bold">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-slate-600 font-black">EMAIL:</span>
              <span className="truncate max-w-[210px] text-slate-950 font-bold">{data.email || 'user@jobtransit.ai'}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                title="Copy Email"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
            {data.phone ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-black">PHONE:</span>
                <span className="text-slate-950 font-bold">{data.phone}</span>
              </div>
            ) : null}
            {data.github ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-black">GITHUB:</span>
                <span className="truncate max-w-[210px] text-slate-950 font-bold">{data.github.replace(/^https?:\/\/(?:www\.)?github\.com\//i, '@')}</span>
              </div>
            ) : null}
            {data.linkedin ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-black">LINKEDIN:</span>
                <span className="truncate max-w-[210px] text-slate-950 font-bold">{data.linkedin.replace(/^https?:\/\/(?:[a-zA-Z0-9-_]+\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-black">PASS ID:</span>
                <span className="text-slate-950 font-bold">{data.passId || 'JT-DYYAQX-2026'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Border & Realistic Bevel */}
      <div className="absolute inset-0 rounded-[22px] border border-white/50 pointer-events-none" />
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.12)] pointer-events-none" />
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
