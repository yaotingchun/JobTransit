import React from 'react'
import type {
  FollowUpQuestion,
  SessionProgress,
} from '../../types/followUpQuestion'
import { AnswerOption } from './AnswerOption'
import { NavigationControls } from './NavigationControls'
import { QuestionProgress } from './QuestionProgress'

interface QuestionPanelProps {
  question: FollowUpQuestion
  selectedOptionIds: string[]
  onToggleOption: (optionId: string) => void
  onContinue: () => void
  onBack: () => void
  onSkip?: () => void
  canGoBack: boolean
  isSubmitting?: boolean
  validationError?: string | null
  progress: SessionProgress
  isLastQuestion?: boolean
  slideDirection?: 'forward' | 'backward'
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  selectedOptionIds,
  onToggleOption,
  onContinue,
  onBack,
  onSkip,
  canGoBack,
  isSubmitting = false,
  validationError,
  progress,
  isLastQuestion = false,
  slideDirection = 'forward',
}) => {
  const isContinueDisabled = question.required && selectedOptionIds.length === 0

  return (
    <div className="relative w-full max-w-[740px] min-h-[460px] mx-auto rounded-2xl sm:rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-5 sm:p-6 flex flex-col justify-between transition-all overflow-hidden">
      {/* Top: Progress Header (Station Checkpoint) */}
      <QuestionProgress progress={progress} />

      {/* Center: Metro Station Slide Question Content (comfortably spaced below progress bar) */}
      <div
        key={question.id}
        className={`flex-1 flex flex-col justify-start pt-5 sm:pt-6 pb-2 space-y-4 ${
          slideDirection === 'forward' ? 'metro-slide-in-right' : 'metro-slide-in-left'
        }`}
      >
        <div>
          <h2 className="font-hero text-base sm:text-lg font-extrabold tracking-tight text-slate-950 leading-snug">
            {question.prompt}
          </h2>
        </div>

        {/* Validation error alert if triggered */}
        {validationError && (
          <div
            role="alert"
            className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 animate-in fade-in"
          >
            {validationError}
          </div>
        )}

        {/* Options Grid (Consistent 2-column layout for all questions to keep identical container dimensions) */}
        <div
          role={question.selectionType === 'multiple' ? 'group' : 'radiogroup'}
          aria-label={question.prompt}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        >
          {question.options.map((option, index) => {
            const isSelected = selectedOptionIds.includes(option.id)

            return (
              <div
                key={option.id}
                className="option-stagger-in"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <AnswerOption
                  option={option}
                  selectionType={question.selectionType}
                  isSelected={isSelected}
                  onToggle={onToggleOption}
                  disabled={isSubmitting}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom: Navigation Controls */}
      <NavigationControls
        canGoBack={canGoBack}
        onBack={onBack}
        onContinue={onContinue}
        onSkip={onSkip}
        canSkip={!!question.allowSkip || !question.required}
        isContinueDisabled={isContinueDisabled}
        isSubmitting={isSubmitting}
        isLastQuestion={isLastQuestion}
      />
    </div>
  )
}
