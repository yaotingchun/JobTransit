import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, BellRing, Check, Loader2, TrainFront } from 'lucide-react'
import { LINES, LINE_ORDER, STATIONS } from '../transit/transitData'

interface MapBuildStepProps {
  name: string
  onComplete: () => void
}

const BUILD_STEPS = [
  'Plotting your origin hub',
  'Laying the 5 metro lines',
  'Connecting interchanges & fare zones',
  'Lighting your top-3 destinations',
  'Syncing live signals from the skills radar',
]

const STEP_MS = 780
const REDIRECT_MS = 3400

/** Station 08 — assembles the Career Metro, announces it, then redirects to the Transit tab. */
export const MapBuildStep: React.FC<MapBuildStepProps> = ({ name, onComplete }) => {
  const [done, setDone] = useState(0)
  const [created, setCreated] = useState(false)
  const completedRef = useRef(false)

  const finish = () => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }

  // tick through the build steps
  useEffect(() => {
    if (done >= BUILD_STEPS.length) {
      const t = window.setTimeout(() => setCreated(true), 450)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setDone((d) => d + 1), STEP_MS)
    return () => window.clearTimeout(t)
  }, [done])

  // auto-redirect once the "map created" notification has been shown
  useEffect(() => {
    if (!created) return
    const t = window.setTimeout(finish, REDIRECT_MS)
    return () => window.clearTimeout(t)
  }, [created])

  const pct = Math.round((Math.min(done, BUILD_STEPS.length) / BUILD_STEPS.length) * 100)

  return (
    <section className="space-y-6 animate-in fade-in duration-500" aria-labelledby="build-title">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em]">
          <TrainFront className="w-3 h-3" /> STATION 08 · TRANSIT MAP
        </div>
        <h2 id="build-title" className="font-signage text-5xl sm:text-6xl font-black tracking-tight text-stone-900 leading-[0.9] mt-3">
          BUILDING YOUR<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> CAREER METRO</span>
        </h2>
        <p className="text-sm text-stone-700 mt-2 max-w-xl">
          Every role is a station. We&apos;re laying the lines for {name || 'you'} from your profile, radar signals and best-fit matches.
        </p>
      </div>

      <div className="map-frame rounded-[30px] p-2.5 max-w-4xl">
        <div className="px-3 pt-2 pb-3 flex items-center justify-between">
          <span className="font-mono-board text-[10px] text-amber-400 font-bold tracking-widest">CONSTRUCTION · {pct}%</span>
          <span className="font-mono-board text-[10px] tracking-widest text-stone-300">{STATIONS.length} STATIONS · 5 LINES</span>
        </div>

        <div className="rounded-[22px] bg-[#F7F3E9] border border-stone-800/40 p-5 sm:p-6 space-y-5">
          {/* the five lines drawing themselves */}
          <div className="space-y-2.5">
            {LINE_ORDER.map((id, i) => {
              const line = LINES[id]
              const drawn = done > i
              return (
                <div key={id} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-xs"
                    style={{ background: line.color }}
                  >
                    {line.code}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-stone-900/10 overflow-hidden">
                    {drawn && <div key={`${id}-drawn`} className="onb-line-grow h-full rounded-full" style={{ background: line.color }} />}
                  </div>
                  <span className="font-signage text-sm font-extrabold tracking-wider text-stone-700 w-28 hidden sm:block">
                    {line.name.replace(' Line', '').toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* checklist */}
          <ul className="space-y-1.5 pt-1">
            {BUILD_STEPS.map((label, i) => {
              const isDone = done > i
              const isCurrent = done === i
              return (
                <li
                  key={label}
                  className={`flex items-center gap-2.5 font-mono-board text-xs tracking-wide transition-all duration-300 ${
                    isDone ? 'text-stone-900 font-bold' : isCurrent ? 'text-stone-700' : 'text-stone-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isDone ? 'bg-emerald-500 text-white' : 'bg-stone-900/10 text-stone-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : isCurrent ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  </span>
                  {label}
                </li>
              )
            })}
          </ul>

          <div className="h-2.5 rounded-full bg-stone-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notification */}
      {created && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[60] max-w-sm w-[calc(100%-2rem)]" role="status" aria-live="polite">
          <div className="toast-rise rounded-2xl px-4 py-3.5 shadow-2xl border bg-stone-950 border-stone-700 text-stone-100">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-signage text-xl font-black tracking-wider text-amber-300 leading-none">TRANSIT MAP CREATED</div>
                <div className="text-[12px] text-stone-400 mt-1 leading-snug">
                  Your Career Metro is live. Taking you to the Transit tab…
                </div>
                <button
                  type="button"
                  onClick={finish}
                  className="group mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-board text-[11px] font-black tracking-wider cursor-pointer transition-all active:scale-95"
                >
                  RIDE NOW <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="onb-line-grow h-full bg-amber-400" style={{ animationDuration: `${REDIRECT_MS}ms`, animationTimingFunction: 'linear' }} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
