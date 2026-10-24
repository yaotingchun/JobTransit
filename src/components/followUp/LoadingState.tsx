import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Calculating adaptive checkpoints...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl shadow-sm text-center animate-pulse">
      <div className="w-12 h-12 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
      <div className="space-y-1">
        <h3 className="font-hero text-base font-bold text-slate-900">{message}</h3>
        <p className="text-xs text-slate-500">
          Analyzing CV evidence against career transit pathways
        </p>
      </div>
    </div>
  )
}

export const ErrorState: React.FC<{
  title?: string
  message: string
  onRetry?: () => void
}> = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 space-y-4 rounded-3xl bg-white/70 border border-rose-200/80 backdrop-blur-xl shadow-lg text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-hero text-lg font-bold text-slate-950">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  )
}
