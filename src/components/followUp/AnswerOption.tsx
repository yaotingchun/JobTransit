import React from 'react'
import { Check } from 'lucide-react'
import type { QuestionOption, SelectionType } from '../../types/followUpQuestion'

interface AnswerOptionProps {
  option: QuestionOption
  selectionType: SelectionType
  isSelected: boolean
  onToggle: (optionId: string) => void
  disabled?: boolean
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  selectionType,
  isSelected,
  onToggle,
  disabled = false,
}) => {
  const isMultiple = selectionType === 'multiple'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onToggle(option.id)
    }
  }

  return (
    <div
      role={isMultiple ? 'checkbox' : 'radio'}
      aria-checked={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onToggle(option.id)}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.98] ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-white/20 border-white/20'
          : isSelected
          ? 'bg-blue-50/75 border-2 border-blue-600 shadow-xs backdrop-blur-md scale-[1.005]'
          : 'bg-white/35 hover:bg-white/60 border border-white/50 hover:border-white/75 backdrop-blur-md shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Indicator icon */}
      <div className="shrink-0">
        <div
          className={`flex items-center justify-center transition-all duration-200 ${
            isMultiple ? 'w-4 h-4 rounded-md' : 'w-4 h-4 rounded-full'
          } ${
            isSelected
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'border-[1.5px] border-slate-300/90 bg-white/80 group-hover:border-slate-400'
          }`}
        >
          {isSelected && (
            <Check className="w-2.5 h-2.5 stroke-[3] animate-in zoom-in duration-150" />
          )}
        </div>
      </div>

      {/* Option Details */}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span
          className={`font-hero text-xs sm:text-sm font-bold tracking-tight leading-snug transition-colors ${
            isSelected ? 'text-blue-950' : 'text-slate-900 group-hover:text-slate-950'
          }`}
        >
          {option.label}
        </span>

        {option.badge && (
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-blue-100 text-blue-700 border border-blue-200/70 shrink-0">
            {option.badge}
          </span>
        )}
      </div>
    </div>
  )
}
