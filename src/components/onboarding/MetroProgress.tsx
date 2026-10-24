import React from 'react'
import { Check } from 'lucide-react'

export const ONBOARDING_STATIONS = [
  { id: 'welcome', short: 'BOARD', label: 'Welcome' },
  { id: 'upload', short: 'CV + IN', label: 'CV & LinkedIn' },
  { id: 'verify', short: 'VERIFY', label: 'Verify info' },
  { id: 'followup', short: 'ASK', label: 'Follow-up' },
  { id: 'card', short: 'PASS', label: 'Transit card' },
  { id: 'radar', short: 'RADAR', label: 'Skills radar' },
  { id: 'match', short: 'MATCH', label: 'Best-fit roles' },
  { id: 'map', short: 'METRO', label: 'Transit map' },
] as const

interface MetroProgressProps {
  activeIndex: number
}

/** Horizontal metro-line progress: stations fill in amber as the rider moves along the line. */
export const MetroProgress: React.FC<MetroProgressProps> = ({ activeIndex }) => {
  const n = ONBOARDING_STATIONS.length
  const ratio = Math.max(0, Math.min(1, activeIndex / (n - 1)))
  const inset = 100 / n / 2 // centre of the first / last station column, in %

  return (
    <nav className="hud-card rounded-[24px] px-3 sm:px-6 pt-4 pb-3" aria-label="Onboarding progress">
      <div className="relative">
        {/* track */}
        <div className="absolute top-[11px] h-1 rounded-full bg-white/10" style={{ left: `${inset}%`, right: `${inset}%` }} />
        {/* filled line */}
        <div
          className="absolute top-[11px] h-1 rounded-full bg-amber-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(251,191,36,0.55)]"
          style={{ left: `${inset}%`, width: `${(100 - inset * 2) * ratio}%` }}
        />

        <ol className="relative flex items-start">
          {ONBOARDING_STATIONS.map((st, i) => {
            const done = i < activeIndex
            const current = i === activeIndex
            return (
              <li key={st.id} className="flex-1 flex flex-col items-center gap-1.5" aria-current={current ? 'step' : undefined}>
                <span
                  className={`relative z-10 w-[26px] h-[26px] rounded-full flex items-center justify-center border-[3px] transition-all duration-500 ${
                    done
                      ? 'bg-amber-400 border-amber-300 text-stone-950'
                      : current
                        ? 'bg-white border-amber-400 text-stone-950 ring-4 ring-amber-400/30 scale-110'
                        : 'bg-stone-800 border-stone-600 text-stone-500'
                  }`}
                >
                  {done ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="font-mono-board text-[9px] font-black">{i + 1}</span>
                  )}
                </span>
                <span
                  className={`font-mono-board text-[8.5px] sm:text-[9.5px] font-bold tracking-widest text-center leading-tight ${
                    current ? 'text-amber-300' : done ? 'text-stone-300' : 'text-stone-600'
                  } ${current ? '' : 'hidden sm:block'}`}
                >
                  {st.short}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
