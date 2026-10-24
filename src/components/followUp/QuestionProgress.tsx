import React from 'react'
import { Route } from 'lucide-react'
import type { SessionProgress } from '../../types/followUpQuestion'

interface QuestionProgressProps {
  progress: SessionProgress
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({ progress }) => {
  const { currentStepIndex, totalKnownQuestions, isReviewReady } = progress

  // Calculate percentage dynamically based on current active checkpoint step
  const totalSteps = Math.max(totalKnownQuestions, currentStepIndex, 1)
  const percentage = isReviewReady
    ? 100
    : Math.max(12, Math.min(96, Math.round((currentStepIndex / totalSteps) * 100)))

  return (
    <div className="space-y-2.5 pb-3 border-b border-white/40">
      <div className="flex items-center justify-between gap-3 text-xs">
        {/* Stage pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/40 border border-white/60 text-blue-700 font-bold tracking-wider uppercase text-[9px] backdrop-blur-md shadow-2xs">
          <Route className="w-2.5 h-2.5 text-blue-600" />
          <span>CAREER CHECKPOINT</span>
        </div>

        {/* Step indicator with flip animation */}
        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
          <span key={currentStepIndex} className="font-semibold text-slate-900 step-number-flip">
            Step {currentStepIndex}
          </span>
          <span className="text-slate-300">/</span>
          <span>~{Math.max(totalKnownQuestions, currentStepIndex)} checkpoints</span>
        </div>
      </div>

      {/* Progress Track with Active Station Beacon */}
      <div className="relative w-full h-1.5 rounded-full bg-slate-200/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 transition-all duration-500 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Active Station Node Beacon */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-blue-600 station-node-pulse shadow-xs" />
        </div>
      </div>
    </div>
  )
}
