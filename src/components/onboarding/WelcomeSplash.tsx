import React, { useEffect } from 'react'
import { MapPinned } from 'lucide-react'

interface WelcomeSplashProps {
  name: string
  onDone: () => void
}

const SHOW_MS = 5200

/** Station 01 — a fading "welcome aboard" sequence that hands off to the CV upload. */
export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ name, onDone }) => {
  useEffect(() => {
    const t = window.setTimeout(onDone, SHOW_MS)
    return () => window.clearTimeout(t)
  }, [onDone])

  const parts = (name || 'Explorer').trim().split(/\s+/)
  const first = parts[0]
  const rest = parts.slice(1).join(' ')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6">
      <div className="onb-fade-out w-full flex justify-center" style={{ animationDelay: '4.3s' }}>
        <div className="hud-card rounded-[36px] px-6 sm:px-14 py-12 sm:py-16 text-center w-full max-w-3xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(60%_60%_at_50%_0%,rgba(251,191,36,0.14),transparent_70%)]" />

          <div
            className="onb-fade-up relative inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-stone-950 text-[10px] font-mono-board font-black tracking-[0.25em]"
            style={{ animationDelay: '200ms' }}
          >
            <MapPinned className="w-3 h-3" /> JOBTRANSIT · CAREER METRO
          </div>

          <p
            className="onb-fade-up relative font-mono-board text-xs sm:text-sm tracking-[0.4em] text-amber-300 font-bold mt-9"
            style={{ animationDelay: '1000ms' }}
          >
            WELCOME ABOARD
          </p>

          <h1
            className="onb-fade-up relative font-signage text-6xl sm:text-8xl font-black text-white uppercase leading-[0.9] mt-3 tracking-tight"
            style={{ animationDelay: '1700ms' }}
          >
            {first}
            {rest && <span className="text-transparent [-webkit-text-stroke:2px_#FBBF24]"> {rest}</span>}
          </h1>

          <p
            className="onb-fade-up relative text-sm sm:text-base text-stone-300 mt-6 max-w-md mx-auto leading-relaxed"
            style={{ animationDelay: '2500ms' }}
          >
            Let&apos;s build your personal Career Metro — a route from where you are to where the AI market is heading.
          </p>

          {/* little line that draws itself */}
          <div className="relative mt-9 mx-auto w-full max-w-xs h-5 flex items-center onb-fade-up" style={{ animationDelay: '3100ms' }}>
            <div className="onb-line-grow absolute left-1 right-1 h-1 rounded-full bg-amber-400" style={{ animationDelay: '3200ms' }} />
            {[0, 50, 100].map((p) => (
              <span
                key={p}
                className="absolute w-3.5 h-3.5 rounded-full bg-white border-[3px] border-amber-400"
                style={{ left: `calc(${p}% - ${p === 0 ? 0 : p === 100 ? 14 : 7}px)` }}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="font-mono-board text-[11px] font-bold tracking-widest text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
      >
        SKIP INTRO →
      </button>
    </div>
  )
}
