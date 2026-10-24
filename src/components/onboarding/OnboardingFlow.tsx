import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import type { UserProfile } from '../Navbar'
import { ProfileOnboarding } from '../ProfileOnboarding'
import catchupBg from '../../assets/catchup-bg.png'
import logoImg from '../../assets/JobTransitLogo.png'
import { MetroProgress, ONBOARDING_STATIONS } from './MetroProgress'
import { WelcomeSplash } from './WelcomeSplash'
import { FutureSkillsRadar } from './FutureSkillsRadar'
import { RoleMatchStep } from './RoleMatchStep'
import { MapBuildStep } from './MapBuildStep'
import type { FlowProfileSnapshot, FlowStage } from './onboardingData'

interface OnboardingFlowProps {
  currentUser: UserProfile
  /** Called once the whole journey is finished — the app should then open the Transit tab. */
  onComplete: () => void
  onLogout: () => void
}

type Phase = 'welcome' | 'profile' | 'radar' | 'match' | 'building'

const STAGE_INDEX: Record<FlowStage, number> = { upload: 1, verify: 2, followup: 3, card: 4 }

/**
 * New-rider onboarding. One continuous journey, styled like the Transit tab:
 * welcome → CV + LinkedIn → verify → follow-up → transit card → future skills radar
 * → best-fit role match → "transit map created" → Transit tab.
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ currentUser, onComplete, onLogout }) => {
  const [phase, setPhase] = useState<Phase>('welcome')
  const [stage, setStage] = useState<FlowStage>('upload')
  const [snapshot, setSnapshot] = useState<FlowProfileSnapshot>({
    name: currentUser.name,
    skills: [],
    targetRoles: [],
    currentTitle: '',
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleWelcomeDone = useCallback(() => setPhase('profile'), [])
  const handleStageChange = useCallback((s: FlowStage) => setStage(s), [])
  const handleProfileDone = useCallback((snap: FlowProfileSnapshot) => {
    setSnapshot(snap)
    setPhase('radar')
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase])

  const activeIndex =
    phase === 'welcome' ? 0
    : phase === 'profile' ? STAGE_INDEX[stage]
    : phase === 'radar' ? 5
    : phase === 'match' ? 6
    : 7

  return (
    <div
      ref={scrollRef}
      className="onb-transit transit-root relative h-screen w-full font-sans overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-900 text-stone-100 selection:bg-amber-400/30 selection:text-amber-200"
    >
      {/* Shared atmospheric background (same sky as Home / Transit) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img src={catchupBg} alt="" className="w-full h-full object-cover object-center filter saturate-[1.05] brightness-[0.98]" />
        <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-slate-900/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16 space-y-6 text-stone-900">
        {phase !== 'welcome' && (
          <>
            <header className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 select-none">
                <img src={logoImg} alt="JobTransit" className="w-9 h-9 object-contain drop-shadow-sm" />
                <div className="flex flex-col">
                  <span className="font-hero text-xl font-bold tracking-tight text-stone-950 leading-none">JobTransit</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 font-mono-board text-[10px] tracking-[0.25em] text-stone-700 font-bold">
                    NEW RIDER ONBOARDING · STATION {Math.min(activeIndex + 1, ONBOARDING_STATIONS.length)}/{ONBOARDING_STATIONS.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/60 hover:bg-white border border-white/80 text-stone-700 hover:text-stone-950 font-mono-board text-[11px] font-bold tracking-wider backdrop-blur-md transition-all cursor-pointer active:scale-95"
                title="Sign out — your onboarding will resume next time"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SIGN OUT</span>
              </button>
            </header>

            <MetroProgress activeIndex={activeIndex} />
          </>
        )}

        {phase === 'welcome' && <WelcomeSplash name={currentUser.name} onDone={handleWelcomeDone} />}

        {phase === 'profile' && (
          <ProfileOnboarding
            currentUser={currentUser}
            flowMode
            onFlowStageChange={handleStageChange}
            onFlowContinue={handleProfileDone}
          />
        )}

        {phase === 'radar' && <FutureSkillsRadar snapshot={snapshot} onContinue={() => setPhase('match')} />}

        {phase === 'match' && <RoleMatchStep snapshot={snapshot} onContinue={() => setPhase('building')} />}

        {phase === 'building' && <MapBuildStep name={snapshot.name} onComplete={onComplete} />}
      </div>
    </div>
  )
}
