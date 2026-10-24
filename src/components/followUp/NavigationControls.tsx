import React from 'react'
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react'

interface NavigationControlsProps {
  canGoBack: boolean
  onBack: () => void
  onContinue: () => void
  onSkip?: () => void
  canSkip: boolean
  isContinueDisabled: boolean
  isSubmitting?: boolean
  isLastQuestion?: boolean
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  canGoBack,
  onBack,
  onContinue,
  onSkip,
  canSkip,
  isContinueDisabled,
  isSubmitting = false,
  isLastQuestion = false,
}) => {
  return (
    <div className="pt-3 border-t border-white/40 flex flex-wrap items-center justify-between gap-2.5">
      {/* Back button */}
      <div>
        {canGoBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/40 hover:bg-white/70 border border-white/50 backdrop-blur-md shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Right actions: Skip + Continue */}
      <div className="flex items-center gap-2">
        {canSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/40 hover:bg-white/70 border border-white/50 backdrop-blur-md shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Skip for now</span>
            <SkipForward className="w-3.5 h-3.5 text-slate-600" />
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={isContinueDisabled || isSubmitting}
          className={`relative overflow-hidden group inline-flex items-center gap-1.5 px-5 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none active:scale-95 ${
            isContinueDisabled || isSubmitting
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-slate-950 hover:bg-slate-900 text-white shadow-[0_8px_20px_-4px_rgba(15,23,42,0.25)] hover:shadow-[0_10px_22px_-4px_rgba(15,23,42,0.35)]'
          }`}
        >
          {!isContinueDisabled && !isSubmitting && <div className="btn-shimmer-sweep" />}
          <span className="relative z-10">{isLastQuestion ? 'Review Transit Card' : 'Continue'}</span>
          <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}
