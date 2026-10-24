import React, { useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Home,
  Code2,
  Sparkles,
} from 'lucide-react'
import type { CareerProfile } from '../../types/careerProfile'

interface CompletionStateProps {
  sessionId: string
  finalProfile: CareerProfile
  onReset: () => void
  onReturnHome?: () => void
}

export const CompletionState: React.FC<CompletionStateProps> = ({
  sessionId,
  finalProfile,
  onReset,
  onReturnHome,
}) => {
  const [copied, setCopied] = useState(false)
  const [showJson, setShowJson] = useState(false)

  const jsonString = JSON.stringify(finalProfile, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `career-transit-profile-${sessionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 fade-in duration-300">
      {/* Success Hero Banner */}
      <div className="rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
        {/* Ambient Celebration Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-b from-emerald-400/20 via-sky-300/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-600 flex items-center justify-center shadow-md animate-in bounce-in duration-500">
            <CheckCircle2 className="w-9 h-9 stroke-[2.3]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Career Transit Profile Activated</span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Your Transit Card is Ready!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Your CV evidence and confirmed preferences have been consolidated into a structured Career Transit Profile, validated by the backend engine.
            </p>
          </div>

          {/* Metadata pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100/80 border border-slate-200 text-xs text-slate-600 font-mono">
            <span>Session: <span className="font-semibold text-slate-900">{sessionId}</span></span>
            <span>•</span>
            <span>Validated: <span className="text-emerald-700 font-semibold">100% Complete</span></span>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onReturnHome && (
              <button
                type="button"
                onClick={onReturnHome}
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm shadow-[0_10px_25px_-5px_rgba(15,23,42,0.3)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowJson(!showJson)}
              className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200/90 shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>{showJson ? 'Hide Contract JSON' : 'Inspect Structured Profile'}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Test Another Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* JSON Payload Inspector & Downstream Integration Box */}
      {showJson && (
        <div className="rounded-3xl bg-slate-900 text-slate-100 p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-semibold text-sky-400">
                STRUCTURED PROFILE CONTRACT (FOR CAREER-MATCHING & TRANSIT-MAP)
              </span>
              <p className="text-xs text-slate-400">
                Conforms strictly to CareerProfile TypeScript schema with evidence provenance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-xs leading-relaxed overflow-x-auto text-sky-200 max-h-96 custom-scrollbar border border-slate-800">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  )
}
