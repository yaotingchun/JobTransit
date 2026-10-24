import React, { useState } from 'react'
import { Terminal, Check, UserCheck, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { MOCK_PROFILES } from '../../data/mockProfiles'

export interface CustomProfileInfo {
  id: string
  name: string
  subtitle: string
  description?: string
}

interface MockProfileSelectorProps {
  currentProfileId: string
  onSelectProfile: (profileId: string) => void
  disabled?: boolean
  customProfile?: CustomProfileInfo | null
}

export const MockProfileSelector: React.FC<MockProfileSelectorProps> = ({
  currentProfileId,
  onSelectProfile,
  disabled = false,
  customProfile = null,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const isCustomActive = currentProfileId === 'extracted_cv' || (customProfile && currentProfileId === customProfile.id)
  const activeProfile = isCustomActive && customProfile
    ? customProfile
    : MOCK_PROFILES[currentProfileId] || MOCK_PROFILES.student_cs

  return (
    <div className="w-full max-w-2xl text-left">
      {/* Discreet Developer Toggle Bar */}
      <div className="rounded-xl bg-white/25 border border-white/40 backdrop-blur-2xl overflow-hidden transition-all shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
              isCustomActive ? 'bg-emerald-100/90 text-emerald-700' : 'bg-blue-100/80 text-blue-700'
            }`}>
              {isCustomActive ? <FileText className="w-2.5 h-2.5" /> : <Terminal className="w-2.5 h-2.5" />}
            </div>
            <span className="font-semibold text-slate-800">
              {isCustomActive ? 'Uploaded CV Profile: ' : 'Test CV Profile: '}
              <span className={`font-bold ${isCustomActive ? 'text-emerald-700' : 'text-blue-700'}`}>
                {activeProfile.name}
              </span>{' '}
              ({activeProfile.subtitle})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="text-[11px] hidden sm:inline">
              {isOpen ? 'Collapse' : 'Switch profile'}
            </span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Collapsible Panel */}
        {isOpen && (
          <div className="p-3 sm:p-4 pt-1 border-t border-slate-200/50 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <p className="text-[11px] text-slate-500 pb-1">
              Select your uploaded CV or test with standard mock profiles:
            </p>

            <div className={`grid grid-cols-1 ${customProfile ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-2`}>
              {customProfile && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelectProfile(customProfile.id)
                    setIsOpen(false)
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                    isCustomActive
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-emerald-600" />
                      <span>{customProfile.name}</span>
                    </span>
                    {isCustomActive && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-semibold text-emerald-900 leading-tight">
                    {customProfile.subtitle}
                  </p>

                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {customProfile.description || 'Parsed directly from your uploaded CV document.'}
                  </p>
                </button>
              )}

              {Object.values(MOCK_PROFILES).map((item) => {
                const isActive = !isCustomActive && currentProfileId === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelectProfile(item.id)
                      setIsOpen(false)
                    }}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                      isActive
                        ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        <span>{item.name}</span>
                      </span>
                      {isActive && (
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-semibold text-blue-900 leading-tight">
                      {item.subtitle}
                    </p>

                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
