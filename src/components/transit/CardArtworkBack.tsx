import React, { useState } from 'react'
import type { CardPassData, CardTheme } from './types'
import { Copy, Check, Wifi, ShieldCheck } from 'lucide-react'
import metroBackArtwork from '../../assets/MetroBackArtwork.png'

interface CardArtworkBackProps {
  data: CardPassData
  theme: CardTheme
  onNfcTap?: () => void
}

export const CardArtworkBack: React.FC<CardArtworkBackProps> = ({
  data,
  onNfcTap,
}) => {
  // Primary & Official: Creative License Back with original design + new design & layout
  return <CreativeLicenseBack data={data} onNfcTap={onNfcTap} />
}

/**
 * ─── THEME: CREATIVE LICENSE BACK (Original Design + New Design & Layout) ─────
 * Keeps the original artwork, skills & capabilities, tools & software, contact & connect,
 * while incorporating the new magnetic stripe, layout, and rapid transit authority features.
 */
export const CreativeLicenseBack: React.FC<{
  data: CardPassData
  onNfcTap?: () => void
}> = ({ data, onNfcTap }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const emailToCopy = data.email || 'user@jobtransit.ai'
    let copiedSuccess = false

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailToCopy)
        copiedSuccess = true
      }
    } catch (err) {
      console.warn('Clipboard writeText failed:', err)
    }

    if (!copiedSuccess) {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = emailToCopy
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        copiedSuccess = true
      } catch (fallbackErr) {
        console.error('Fallback copy error:', fallbackErr)
      }
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const passId = data.passId || 'JT-DYYAQX-2026'

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#FAF7EE] text-slate-900 font-sans p-2.5 sm:p-3 flex flex-col justify-between border-[2.5px] sm:border-[3px] border-[#18181b] rounded-[22px] shadow-xs">
      {/* ── Top: Authentic Magnetic Stripe (New Layout) ── */}
      <div className="w-full h-5 sm:h-6 bg-[#18181b] rounded-md flex items-center justify-between px-2.5 text-[6.5px] sm:text-[7.5px] font-mono text-white/70 tracking-widest shrink-0 shadow-inner mb-1.5">
        <span className="flex items-center gap-1.5 text-stone-300 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          MAGNETIC STRIPE // ISO/IEC 7810 ID-1
        </span>
        <span className="text-amber-400 font-bold hidden sm:inline">RAPID TRANSIT AUTHORITY • ALL LINES UNLOCKED</span>
        <span className="text-stone-400 font-mono">AUTH: {passId}</span>
      </div>

      {/* ── Mid Section: Original 2-Half Layout ── */}
      <div className="flex-1 flex justify-between gap-2 sm:gap-3 min-h-0 items-stretch">
        {/* ── Left Half: Original Artwork (Train, Stars, Quote, #OF LICENSE) ── */}
        <div className="relative z-10 h-full aspect-[327/480] rounded-xl overflow-hidden border-2 border-[#18181b] shadow-xs bg-[#FAF7EE] shrink-0 flex items-center justify-center">
          <img
            src={metroBackArtwork}
            alt="JobTransit Career Navigator Metro Artwork"
            className="w-full h-full object-contain object-center"
          />
        </div>

        {/* ── Right Half: Original Monospace Terminal Box with ENLARGED Typography ── */}
        <div className="relative z-10 flex-1 border-2 border-[#18181b] rounded-xl p-2 sm:p-3 bg-white/95 backdrop-blur-xs flex flex-col justify-between text-left font-mono shadow-xs overflow-hidden">
          {/* Section 1: Skills & Capabilities */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-300 pb-0.5">
              <span className="text-[10px] sm:text-xs md:text-[13px] font-black text-slate-950 tracking-wider uppercase">
                Skills & Capabilities
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-mono text-emerald-700 font-black flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                VERIFIED
              </span>
            </div>
            <p className="text-[9px] sm:text-[10.5px] md:text-[12px] font-bold text-slate-900 leading-snug mt-1 line-clamp-2 sm:line-clamp-3">
              {data.skills && data.skills.length > 0
                ? data.skills.slice(0, 6).join(' • ')
                : 'Problem Solving • Strategic Planning • System Architecture • Technical Execution'}
            </p>
          </div>

          {/* Section 2: Tools & Software (STACK) */}
          <div className="my-auto py-0.5">
            <div className="flex items-center justify-between border-b-2 border-slate-300 pb-0.5">
              <span className="text-[10px] sm:text-xs md:text-[13px] font-black text-slate-950 tracking-wider uppercase">
                Tools & Software
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-mono text-slate-600 font-black uppercase">
                STACK
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(data.softwareList && data.softwareList.length > 0
                ? data.softwareList
                : data.skills && data.skills.length > 0
                ? data.skills.slice(0, 5)
                : ['Git', 'VS Code', 'Docker', 'Postman', 'Figma']
              ).slice(0, 5).map((sw) => (
                <span
                  key={sw}
                  className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-950 text-[9px] sm:text-[10.5px] md:text-[11.5px] font-black font-mono tracking-tight shadow-2xs"
                >
                  {sw}
                </span>
              ))}
            </div>
          </div>

          {/* Section 3: Contact & Verification */}
          <div className="border-t-2 border-slate-300 pt-1 space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs md:text-[13px] font-black text-slate-950 tracking-wider uppercase">
                Contact & Connect
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-mono text-slate-600 font-black uppercase">
                AUTHENTICATED
              </span>
            </div>
            <div className="text-[9px] sm:text-[10.5px] md:text-[11.5px] text-slate-950 font-mono space-y-0.5 font-bold">
              <div
                data-interactive="true"
                onClick={handleCopyEmail}
                className="flex items-center justify-between gap-1 p-0.5 -mx-0.5 rounded hover:bg-slate-100 cursor-pointer transition-colors group"
                title="Click to copy email address"
              >
                <span className="text-slate-600 font-black shrink-0">EMAIL:</span>
                <span className="truncate max-w-[155px] text-slate-950 font-bold select-all">{data.email || 'user@jobtransit.ai'}</span>
                <button
                  type="button"
                  data-interactive="true"
                  onClick={handleCopyEmail}
                  className="p-0.5 hover:bg-slate-200 rounded cursor-pointer shrink-0 flex items-center gap-0.5"
                  title="Copy Email"
                >
                  {copied ? (
                    <span className="flex items-center gap-0.5 text-[7.5px] sm:text-[8px] text-emerald-600 font-black">
                      <Check className="w-3 h-3 text-emerald-600" />
                      COPIED!
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  )}
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
                  <span className="truncate max-w-[170px] text-slate-950 font-bold">{data.github.replace(/^https?:\/\/(?:www\.)?github\.com\//i, '@')}</span>
                </div>
              ) : null}
              {data.linkedin ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-black">LINKEDIN:</span>
                  <span className="truncate max-w-[170px] text-slate-950 font-bold">{data.linkedin.replace(/^https?:\/\/(?:[a-zA-Z0-9-_]+\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-black">PASS ID:</span>
                  <span className="text-slate-950 font-bold">{passId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Footer: Rapid Transit Notice & Interactive NFC Tap (New Layout) ── */}
      <div className="px-1 pt-1.5 border-t border-stone-300 flex items-center justify-between text-[6.5px] sm:text-[7.5px] font-mono text-stone-500 font-bold uppercase tracking-wider shrink-0">
        <span className="truncate max-w-[320px]">
          JOBTRANSIT RAPID TRANSIT AUTHORITY • VALID ALL LINES & PLATFORMS
        </span>
        <button
          type="button"
          data-interactive="true"
          onClick={onNfcTap}
          className="text-stone-900 font-black shrink-0 flex items-center gap-1 cursor-pointer hover:text-amber-700 transition-colors"
          title="Simulate NFC Tap"
        >
          <Wifi className="w-2.5 h-2.5 rotate-90 text-amber-600" />
          NFC TAP ENABLED
        </button>
      </div>

      {/* Card Border & Realistic Bevel */}
      <div className="absolute inset-0 rounded-[22px] border border-white/50 pointer-events-none" />
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.12)] pointer-events-none" />
    </div>
  )
}

