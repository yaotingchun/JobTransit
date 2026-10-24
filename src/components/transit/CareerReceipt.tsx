import React, { useState } from 'react'
import type { CardPassData } from './types'
import { Copy, Check, Printer, X, FileText } from 'lucide-react'

export interface CareerReceiptProps {
  cardData: CardPassData
  personal?: any
  education?: any
  skills?: any
  career?: any
  onClose?: () => void
}

export const CareerReceipt: React.FC<CareerReceiptProps> = ({
  cardData,
  personal,
  education,
  skills,
  career,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)

  // Current formatted date
  const now = new Date()
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ]
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

  // Deterministic 6-digit Auth Code from passId or licenseNumber
  const authCode = Math.abs(
    (cardData.passId || 'JT-PASS').split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 900000
  ) + 100000

  const holderName = (cardData.holderName || personal?.full_name || 'ALEXANDER J. MERCER').trim().toUpperCase()
  const licenseNum = cardData.licenseNumber || '8618'
  const passId = cardData.passId || 'JT-DYYAQX-2026'

  // Compile detailed receipt items: ITEM is the section name, AMT is the information for that section
  interface ReceiptItem {
    label: string // Section name (e.g. NAME, EMAIL, PHONE)
    val: string   // Information for that section
  }

  const items: ReceiptItem[] = [
    { label: 'NAME', val: holderName },
    { label: 'EMAIL', val: (cardData.email || personal?.email || 'user@jobtransit.ai').toLowerCase() },
    { label: 'PHONE', val: cardData.phone || personal?.phone_number || '+60 12-345 6789' },
    { label: 'LOCATION', val: personal?.location || 'Johor Bahru, Johor' },
    { label: 'NATIONALITY', val: cardData.nationality || 'Johor' },
    { label: 'D.O.B', val: cardData.dob || '15/09/2005' },
    { label: 'OCCUPATION', val: cardData.occupation || 'Software Professional' },
    { label: 'TARGET ROLE', val: cardData.roleBadge || cardData.roleTitle || 'Software Professional' },
    { label: 'EDUCATION', val: education?.institution_name || 'University of Technology, Malaysia' },
    { label: 'DEGREE', val: education?.degree_level || education?.field_of_study || 'Bachelor of Computer Science' },
    { label: 'EXPERIENCE', val: `${personal?.years_of_experience ?? 0.5} yrs` },
    { label: 'WORK MODE', val: career?.preferred_work_mode || 'hybrid' },
    { label: 'EXPERTISE', val: cardData.expertise || cardData.industry || 'Technology' },
  ]

  // Add categorized skills if available
  if (skills?.technical_skills && skills.technical_skills.length > 0) {
    items.push({
      label: 'TECH SKILLS',
      val: skills.technical_skills.slice(0, 4).join(', '),
    })
  } else if (cardData.skills && cardData.skills.length > 0) {
    items.push({
      label: 'TECH SKILLS',
      val: cardData.skills.slice(0, 4).join(', '),
    })
  }

  if (skills?.tools_and_technologies && skills.tools_and_technologies.length > 0) {
    items.push({
      label: 'TOOLS & TECH',
      val: skills.tools_and_technologies.slice(0, 4).join(', '),
    })
  } else if (cardData.softwareList && cardData.softwareList.length > 0) {
    items.push({
      label: 'TOOLS & TECH',
      val: cardData.softwareList.slice(0, 4).join(', '),
    })
  }

  if (skills?.ai_skills && skills.ai_skills.length > 0) {
    items.push({
      label: 'AI / ML',
      val: skills.ai_skills.slice(0, 3).join(', '),
    })
  }

  if (skills?.soft_skills && skills.soft_skills.length > 0) {
    items.push({
      label: 'SOFT SKILLS',
      val: skills.soft_skills.slice(0, 3).join(', '),
    })
  }

  if (skills?.other_skills && skills.other_skills.length > 0) {
    items.push({
      label: 'OTHER SKILLS',
      val: skills.other_skills.slice(0, 3).join(', '),
    })
  }

  if (personal?.github_url) {
    items.push({
      label: 'GITHUB',
      val: personal.github_url.replace(/^https?:\/\/(?:www\.)?github\.com\//i, '@'),
    })
  }

  if (personal?.linkedin_url) {
    items.push({
      label: 'LINKEDIN',
      val: personal.linkedin_url.replace(/^https?:\/\/(?:[a-zA-Z0-9-_]+\.)?linkedin\.com\/in\//i, '').replace(/\/$/, ''),
    })
  }

  // Format receipt text for clipboard
  const handleCopyText = () => {
    const lines = [
      '==========================================',
      '               JOBTRANSIT',
      '          CAREER PASS RECEIPT',
      `ORDER #${licenseNum} FOR ${holderName}`,
      dateStr,
      '------------------------------------------',
      'QTY  ITEM             AMT',
      '------------------------------------------',
      ...items.map((it, idx) => {
        const qty = String(idx + 1).padStart(2, '0')
        const itemLabel = it.label.padEnd(16, ' ').slice(0, 16)
        return `${qty}   ${itemLabel} ${it.val}`
      }),
      '------------------------------------------',
      `ITEM COUNT:                            ${items.length}`,
      `TOTAL MATCH SCORE:                     ${cardData.matchScore || 98}%`,
      '------------------------------------------',
      `CARD #: **** **** **** ${licenseNum}`,
      `AUTH CODE: ${authCode}`,
      `CARDHOLDER: ${holderName}`,
      `PASS ID: ${passId}`,
      '',
      '        THANK YOU FOR VISITING!',
      '             jobtransit.ai',
      '==========================================',
    ]
    navigator.clipboard?.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="relative w-full max-w-md mx-auto my-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* ── Top Utility Action Bar ── */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Career Receipt</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-700 text-[11px] font-mono font-bold border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Copy receipt as text"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-700 text-[11px] font-mono font-bold border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Print receipt"
          >
            <Printer className="w-3 h-3 text-slate-500" />
            <span>PRINT</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200 shadow-2xs cursor-pointer transition-all"
              title="Close receipt view"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Realistic Paper Receipt Envelope ── */}
      <div
        className="relative text-slate-900 select-text filter drop-shadow-[0_20px_35px_rgba(15,23,42,0.18)]"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
        }}
      >
        {/* Top Perforated / Jagged Zigzag Tear Edge */}
        <div className="w-full h-3 overflow-hidden text-[#fafaf7] leading-none">
          <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 100 10" fill="currentColor">
            <polygon points="0.00,10 1.67,0 3.33,10 5.00,0 6.67,10 8.33,0 10.00,10 11.67,0 13.33,10 15.00,0 16.67,10 18.33,0 20.00,10 21.67,0 23.33,10 25.00,0 26.67,10 28.33,0 30.00,10 31.67,0 33.33,10 35.00,0 36.67,10 38.33,0 40.00,10 41.67,0 43.33,10 45.00,0 46.67,10 48.33,0 50.00,10 51.67,0 53.33,10 55.00,0 56.67,10 58.33,0 60.00,10 61.67,0 63.33,10 65.00,0 66.67,10 68.33,0 70.00,10 71.67,0 73.33,10 75.00,0 76.67,10 78.33,0 80.00,10 81.67,0 83.33,10 85.00,0 86.67,10 88.33,0 90.00,10 91.67,0 93.33,10 95.00,0 96.67,10 98.33,0 100,10 100,10 0,10" />
          </svg>
        </div>

        {/* Receipt Body (Crinkled thermal paper gradient) */}
        <div
          className="relative px-6 sm:px-8 py-5 text-slate-900 overflow-hidden"
          style={{
            background: 'linear-gradient(125deg, #fdfdfc 0%, #f7f7f3 25%, #ffffff 45%, #f4f4ee 70%, #fafaf6 100%)',
          }}
        >
          {/* Subtle Crinkle Crease Lighting Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 40px, transparent 40px, transparent 80px)',
            }}
          />

          {/* ── Receipt Header ── */}
          <div className="relative z-10 text-center space-y-1">
            <h1 className="font-black text-2xl sm:text-3xl tracking-widest leading-none text-slate-950 uppercase">
              JOBTRANSIT
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-600 uppercase">
              CAREER TRANSIT PASS RECEIPT
            </p>
            <div className="pt-2 text-[10px] sm:text-[11px] font-semibold text-slate-800 tracking-wider space-y-0.5 text-left">
              <p>ORDER #{licenseNum} FOR {holderName}</p>
              <p>{dateStr}</p>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="relative z-10 my-2.5 border-b-2 border-dashed border-slate-400" />

          {/* ── Table Header: QTY  ITEM  AMT ── */}
          <div className="relative z-10 flex items-center text-[10px] sm:text-[11px] font-black text-slate-950 tracking-wider">
            <span className="w-7 shrink-0 text-left">QTY</span>
            <span className="w-28 sm:w-32 shrink-0 text-left pl-1">ITEM</span>
            <span className="flex-1 text-right">AMT</span>
          </div>

          {/* Dashed Separator */}
          <div className="relative z-10 my-2 border-b-2 border-dashed border-slate-400" />

          {/* ── Items List ── */}
          <div className="relative z-10 space-y-1.5 text-[9.5px] sm:text-[10.5px] text-slate-900 font-semibold tracking-wide">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-start leading-snug">
                <span className="w-7 shrink-0 font-mono text-slate-500">{String(idx + 1).padStart(2, '0')}</span>
                <span className="w-28 sm:w-32 shrink-0 text-left font-black uppercase text-slate-900 pl-1 pr-1 truncate">{it.label}</span>
                <span className="flex-1 text-right font-mono font-semibold uppercase text-slate-950 break-words">{it.val}</span>
              </div>
            ))}
          </div>

          {/* Dashed Separator */}
          <div className="relative z-10 my-3 border-b-2 border-dashed border-slate-400" />

          {/* ── Totals ── */}
          <div className="relative z-10 space-y-1 text-[10px] sm:text-[11px] font-bold text-slate-900 tracking-wider">
            <div className="flex justify-between">
              <span>ITEM COUNT:</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between text-slate-950 font-black">
              <span>MATCH SCORE:</span>
              <span>{cardData.matchScore || 98}%</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>STATIONS UNLOCKED:</span>
              <span className="truncate max-w-[170px] uppercase">
                {cardData.stationsUnlocked || 'VERIFIED'}
              </span>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="relative z-10 my-3 border-b-2 border-dashed border-slate-400" />

          {/* ── Cardholder & Auth Info ── */}
          <div className="relative z-10 space-y-0.5 text-[9.5px] sm:text-[10.5px] font-semibold text-slate-800 tracking-wider text-left uppercase">
            <p>CARD #: **** **** **** {licenseNum}</p>
            <p>AUTH CODE: {authCode}</p>
            <p>CARDHOLDER: {holderName}</p>
            <p>VALIDITY: VALID UNTIL IT DOESN'T</p>
          </div>

          {/* ── Receipt Footer: Thank you & Barcode ── */}
          <div className="relative z-10 mt-5 pt-2 text-center space-y-2">
            <p className="text-[10.5px] sm:text-[11.5px] font-black tracking-widest text-slate-900 uppercase">
              THANK YOU FOR VISITING!
            </p>

            {/* High-Resolution Thermal Barcode SVG */}
            <div className="py-1">
              <svg className="w-56 sm:w-64 h-11 sm:h-13 mx-auto" viewBox="0 0 140 28" fill="#18181b">
                <rect x="0" y="0" width="3" height="28" />
                <rect x="5" y="0" width="1.5" height="28" />
                <rect x="8" y="0" width="3.5" height="28" />
                <rect x="14" y="0" width="2" height="28" />
                <rect x="18" y="0" width="1.5" height="28" />
                <rect x="22" y="0" width="3.5" height="28" />
                <rect x="28" y="0" width="2.5" height="28" />
                <rect x="33" y="0" width="1.5" height="28" />
                <rect x="36" y="0" width="4.5" height="28" />
                <rect x="43" y="0" width="1.5" height="28" />
                <rect x="47" y="0" width="2.5" height="28" />
                <rect x="51" y="0" width="3.5" height="28" />
                <rect x="57" y="0" width="1.5" height="28" />
                <rect x="60" y="0" width="3.5" height="28" />
                <rect x="66" y="0" width="2.5" height="28" />
                <rect x="71" y="0" width="4.5" height="28" />
                <rect x="78" y="0" width="1.5" height="28" />
                <rect x="81" y="0" width="2.5" height="28" />
                <rect x="86" y="0" width="3.5" height="28" />
                <rect x="92" y="0" width="1.5" height="28" />
                <rect x="95" y="0" width="3.5" height="28" />
                <rect x="101" y="0" width="2.5" height="28" />
                <rect x="106" y="0" width="4.5" height="28" />
                <rect x="113" y="0" width="1.5" height="28" />
                <rect x="116" y="0" width="3.5" height="28" />
                <rect x="122" y="0" width="2.5" height="28" />
                <rect x="127" y="0" width="1.5" height="28" />
                <rect x="130" y="0" width="3.5" height="28" />
                <rect x="136" y="0" width="3" height="28" />
              </svg>
              <p className="text-[8px] sm:text-[9px] font-mono tracking-widest text-slate-700 mt-1 uppercase">
                {passId}
              </p>
            </div>

            <p className="text-[9.5px] font-mono tracking-wider text-slate-700 lowercase">
              jobtransit.ai
            </p>

            {/* Bottom Brand Mark */}
            <div className="pt-2 flex items-center justify-center gap-1.5 opacity-80">
              <svg className="w-4 h-4 text-slate-900" viewBox="0 0 40 40" fill="none">
                <path d="M18 10L24 6L21 16L18 10Z" fill="#ea580c" />
                <path d="M10 24L6 18L16 21L10 24Z" fill="#2563eb" />
                <path d="M26 24L30 30L20 27L26 24Z" fill="#64748b" />
              </svg>
              <span className="font-mono font-black text-xs tracking-wider text-slate-900">JobTransit</span>
            </div>
          </div>
        </div>

        {/* Bottom Perforated / Jagged Zigzag Tear Edge */}
        <div className="w-full h-3 overflow-hidden text-[#fafaf7] leading-none rotate-180">
          <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 100 10" fill="currentColor">
            <polygon points="0.00,10 1.67,0 3.33,10 5.00,0 6.67,10 8.33,0 10.00,10 11.67,0 13.33,10 15.00,0 16.67,10 18.33,0 20.00,10 21.67,0 23.33,10 25.00,0 26.67,10 28.33,0 30.00,10 31.67,0 33.33,10 35.00,0 36.67,10 38.33,0 40.00,10 41.67,0 43.33,10 45.00,0 46.67,10 48.33,0 50.00,10 51.67,0 53.33,10 55.00,0 56.67,10 58.33,0 60.00,10 61.67,0 63.33,10 65.00,0 66.67,10 68.33,0 70.00,10 71.67,0 73.33,10 75.00,0 76.67,10 78.33,0 80.00,10 81.67,0 83.33,10 85.00,0 86.67,10 88.33,0 90.00,10 91.67,0 93.33,10 95.00,0 96.67,10 98.33,0 100,10 100,10 0,10" />
          </svg>
        </div>
      </div>
    </div>
  )
}
