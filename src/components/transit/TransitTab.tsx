import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  ArrowRight,
  Coins,
  Eye,
  EyeOff,
  FileCheck,
  Flame,
  Footprints,
  GraduationCap,
  MapPinned,
  Trophy,
  Globe2,
} from 'lucide-react'
import type { UserProfile } from '../Navbar'
import { TransitMap } from './TransitMap'
import { DepartureBoard } from './DepartureBoard'
import { StationTicket } from './StationTicket'
import { ReskillingPathwayPage } from './ReskillingPathwayPage'
import { getReskillingPathway } from './pathwayData'
import { SDG_GOALS, type SDGId } from './sdgData'
import {
  LINES,
  LINE_ORDER,
  MISSIONS,
  ORIGIN_ID,
  ROUTE_LABELS,
  STAMPS,
  STATIONS,
  STATION_MAP,
  TOP_PICKS,
  XP_PER_LEVEL,
  findRoutes,
  levelTitle,
  zoneOf,
  type LineId,
  type Route,
} from './transitData'

interface TransitTabProps {
  currentUser: UserProfile
}

interface Toast {
  id: number
  text: string
  sub?: string
  tone: 'xp' | 'stamp' | 'warn' | 'level'
}

/** Mini linear strip diagram for a route card. */
const RouteStrip: React.FC<{ route: Route }> = ({ route }) => {
  const n = route.stations.length
  if (n < 2) return null
  const w = 300
  const pad = 10
  const step = (w - pad * 2) / (n - 1)
  return (
    <svg viewBox={`0 0 ${w} 46`} className="w-full h-[46px]">
      {route.steps.map((st, i) => {
        const x1 = pad + i * step
        const x2 = pad + (i + 1) * step
        const walk = st.edge?.line === 'walk'
        const color = walk ? '#57534E' : LINES[st.edge?.line as LineId]?.color || '#888'
        return (
          <line
            key={i}
            x1={x1}
            y1={14}
            x2={x2}
            y2={14}
            stroke={color}
            strokeWidth={walk ? 2.5 : 6}
            strokeDasharray={walk ? '0.1 6' : undefined}
            strokeLinecap="round"
          />
        )
      })}
      {route.stations.map((id, i) => {
        const s = STATION_MAP[id]
        if (!s) return null
        const x = pad + i * step
        const transfer =
          i > 0 &&
          i < n - 1 &&
          route.steps[i - 1]?.edge?.line &&
          route.steps[i]?.edge?.line &&
          route.steps[i - 1].edge.line !== route.steps[i].edge.line
        const end = i === n - 1
        return (
          <g key={id}>
            <circle cx={x} cy={14} r={transfer || end || i === 0 ? 6 : 4.5} fill="#fff" stroke="#1C1917" strokeWidth={transfer || end ? 3 : 2} />
            <text x={x} y={38} textAnchor={i === 0 ? 'start' : end ? 'end' : 'middle'} fontSize="9" fontWeight="800" fill="#57534E" className="font-signage" letterSpacing="0.5">
              {s.label[0]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const START_XP = 6340

export const TransitTab: React.FC<TransitTabProps> = ({ currentUser }) => {
  const [selectedId, setSelectedId] = useState<string>(TOP_PICKS[0].id)
  const [activeCalloutId, setActiveCalloutId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [routeIdx, setRouteIdx] = useState(0)
  const [trainKey, setTrainKey] = useState(1)
  const [hiddenLines, setHiddenLines] = useState<Set<LineId>>(new Set())
  const [showAlts, setShowAlts] = useState(true)
  const [discovered, setDiscovered] = useState<Set<string>>(new Set())
  const [xp, setXp] = useState(START_XP)
  const [tokens, setTokens] = useState(5)
  const [missionsDone, setMissionsDone] = useState<Set<string>>(new Set())
  const [stamps, setStamps] = useState<Set<string>>(new Set(['first-ride']))
  const [toasts, setToasts] = useState<Toast[]>([])
  const [scrambleKey, setScrambleKey] = useState(0)
  const [lastScan, setLastScan] = useState(() => Date.now() - 12 * 60_000)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [marketJitter, setMarketJitter] = useState<Record<string, number>>({})
  const [visited, setVisited] = useState<Set<string>>(new Set([TOP_PICKS[0].id]))
  const [routesViewed, setRoutesViewed] = useState<Set<string>>(new Set())
  const [planned, setPlanned] = useState<string | null>(null)
  const [transitView, setTransitView] = useState<'map' | 'pathway'>('map')
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('jobtransit_completed_checkpoints')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [checklistTab, setChecklistTab] = useState<'missions' | 'pathway'>('missions')
  const toastId = useRef(0)

  // Listen to hash changes for deep linking to / from full page pathway
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash
      if (hash.startsWith('#pathway-')) {
        const roleId = hash.replace('#pathway-', '')
        if (STATION_MAP[roleId]) {
          setSelectedId(roleId)
          setTransitView('pathway')
        }
      } else if (hash === '#transit' || hash === '' || hash === '#map') {
        setTransitView('map')
      }
    }

    handleHashCheck()
    window.addEventListener('hashchange', handleHashCheck)
    return () => window.removeEventListener('hashchange', handleHashCheck)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('jobtransit_completed_checkpoints', JSON.stringify(Array.from(completedCheckpoints)))
    } catch (e) {
      console.warn('Unable to write completed checkpoints to localStorage', e)
    }
  }, [completedCheckpoints])

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const levelProgress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { ...t, id }])
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2800)
  }, [])

  const xpRef = useRef(START_XP)
  const awardXp = useCallback(
    (amount: number, text: string) => {
      const prev = xpRef.current
      const next = prev + amount
      xpRef.current = next
      setXp(next)
      pushToast({ text: `+${amount} XP`, sub: text, tone: 'xp' })
      if (Math.floor(next / XP_PER_LEVEL) > Math.floor(prev / XP_PER_LEVEL)) {
        const lvl = Math.floor(next / XP_PER_LEVEL) + 1
        setTokens((tk) => tk + 2)
        window.setTimeout(
          () => pushToast({ text: `LEVEL ${lvl} UNLOCKED`, sub: `${levelTitle(lvl)} · +2 ◈ tokens`, tone: 'level' }),
          350,
        )
      }
    },
    [pushToast],
  )

  const earnStamp = useCallback(
    (id: string) => {
      if (stamps.has(id)) return
      setStamps((prev) => new Set(prev).add(id))
      const st = STAMPS.find((s) => s.id === id)
      if (st) window.setTimeout(() => pushToast({ text: 'PASSPORT STAMP', sub: st.name, tone: 'stamp' }), 500)
    },
    [stamps, pushToast],
  )

  const completeMission = useCallback(
    (id: string) => {
      if (missionsDone.has(id)) return
      const m = MISSIONS.find((x) => x.id === id)
      if (!m) return
      setMissionsDone((prev) => new Set(prev).add(id))
      awardXp(m.xp, `Mission · ${m.title}`)
    },
    [missionsDone, awardXp],
  )

  const handleToggleCheckpoint = useCallback(
    (checkpointId: string, title: string) => {
      setCompletedCheckpoints((prev) => {
        const next = new Set(prev)
        const wasDone = next.has(checkpointId)
        if (wasDone) {
          next.delete(checkpointId)
          pushToast({ text: 'CHECKPOINT RESET', sub: title, tone: 'warn' })
        } else {
          next.add(checkpointId)
          awardXp(50, `Checkpoint Cleared · ${title}`)
        }
        return next
      })
    },
    [awardXp, pushToast],
  )

  // ── Derived ──
  const selected = STATION_MAP[selectedId]
  const selectedLocked = !!selected.locked && !discovered.has(selected.id)
  const routes = useMemo(() => findRoutes(selectedId), [selectedId])
  const activeRoute = routes[routeIdx] ?? routes[0] ?? null
  const ghostRoutes = showAlts ? routes.filter((r) => r !== activeRoute) : []
  const rolePathway = useMemo(() => {
    if (selected.id === ORIGIN_ID || selectedLocked) return null
    return getReskillingPathway(selected.id, selected.name, selected.code)
  }, [selected.id, selected.name, selected.code, selectedLocked])

  const routeMonths = useMemo(() => {
    const out: Record<string, number> = {}
    STATIONS.forEach((p) => {
      out[p.id] = findRoutes(p.id, 1)[0]?.months ?? p.months
    })
    return out
  }, [])

  const market = useMemo(() => {
    const out: Record<string, number> = {}
    STATIONS.forEach((p) => {
      out[p.id] = Math.max(0, Math.min(99, (p.signal?.market ?? 80) + (marketJitter[p.id] ?? 0)))
    })
    return out
  }, [marketJitter])

  const minutesSinceScan = Math.max(0, Math.floor((nowTick - lastScan) / 60_000))
  const lockedTotal = STATIONS.filter((s) => s.locked).length
  const charted = STATIONS.length - lockedTotal + discovered.size

  // ── Actions ──
  const handleSelect = (id: string, openPathway = false) => {
    setSelectedId(id)
    setActiveCalloutId(id)
    setRouteIdx(0)
    setRoutesViewed(new Set())
    const st = STATION_MAP[id]
    const isLocked = !!st?.locked && !discovered.has(id)
    if (!isLocked && id !== ORIGIN_ID) {
      setTrainKey((k) => k + 1)
      if (openPathway) {
        setTransitView('pathway')
        window.location.hash = `#pathway-${id}`
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    if (!visited.has(id)) {
      const next = new Set(visited).add(id)
      setVisited(next)
      if (next.size >= 8) earnStamp('cartographer')
    }
  }

  const handleBackToMap = () => {
    setTransitView('map')
    setActiveCalloutId(null)
    window.location.hash = '#transit'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenPathway = (id?: string) => {
    const targetId = typeof id === 'string' ? id : selected.id
    const st = STATION_MAP[targetId]
    const isLocked = !!st?.locked && !discovered.has(targetId)
    if (targetId !== ORIGIN_ID && !isLocked) {
      setSelectedId(targetId)
      setTransitView('pathway')
      window.location.hash = `#pathway-${targetId}`
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRouteSelect = (i: number) => {
    setRouteIdx(i)
    setTrainKey((k) => k + 1)
    const next = new Set(routesViewed).add(String(i))
    setRoutesViewed(next)
    if (next.size >= 2) completeMission('compare')
  }

  const handleScout = () => {
    if (tokens < 2) {
      pushToast({ text: 'NOT ENOUGH TOKENS', sub: 'Complete missions to earn ◈', tone: 'warn' })
      return
    }
    setTokens((t) => t - 2)
    setDiscovered((prev) => new Set(prev).add(selectedId))
    pushToast({ text: 'STATION REVEALED', sub: STATION_MAP[selectedId].name, tone: 'stamp' })
    earnStamp('fog')
    completeMission('scout')
    setTrainKey((k) => k + 1)
  }

  const handleBoard = () => {
    setTrainKey((k) => k + 1)
    setPlanned(selectedId)
    if (selected.topRank) completeMission('board')
    if (activeRoute && activeRoute.transfers > 0) earnStamp('interchange')
    if (routeIdx === 0 && selected.topRank) earnStamp('express')
    pushToast({ text: 'JOURNEY SAVED', sub: `${selected.name} added to your Transit Card`, tone: 'xp' })
  }

  const handleRescan = () => {
    setScrambleKey((k) => k + 1)
    setLastScan(Date.now())
    setNowTick(Date.now())
    const j: Record<string, number> = {}
    STATIONS.forEach((p) => (j[p.id] = Math.floor(Math.random() * 6) - 2))
    setMarketJitter(j)
    earnStamp('trend')
  }

  const toggleLine = (l: LineId) =>
    setHiddenLines((prev) => {
      const next = new Set(prev)
      if (next.has(l)) next.delete(l)
      else next.add(l)
      return next
    })

  // Circular level ring
  const R = 26
  const C = 2 * Math.PI * R

  // ── DEDICATED FULL-PAGE VIEW FOR RESKILLING PATHWAY ──
  if (transitView === 'pathway' && selected.id !== ORIGIN_ID && !selectedLocked) {
    return (
      <section id="transit-pathway-view" className="relative space-y-6 transit-root" aria-labelledby="transit-pathway-title">
        <ReskillingPathwayPage
          station={selected}
          allStations={STATIONS}
          onBackToMap={handleBackToMap}
          onSelectStation={(id) => handleSelect(id, true)}
          onBoard={handleBoard}
          completedCheckpoints={completedCheckpoints}
          onToggleCheckpoint={handleToggleCheckpoint}
        />

        {/* Floating Toasts */}
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast-rise rounded-2xl px-4 py-2.5 shadow-2xl border min-w-[200px] ${
                t.tone === 'warn'
                  ? 'bg-rose-950 border-rose-700 text-rose-100'
                  : t.tone === 'level'
                    ? 'bg-amber-400 border-amber-300 text-stone-950'
                    : 'bg-stone-950 border-stone-700 text-stone-100'
              }`}
            >
              <div className={`font-signage text-lg font-black tracking-wider leading-none ${t.tone === 'xp' ? 'text-amber-300' : ''}`}>
                {t.text}
              </div>
              {t.sub && <div className={`text-[11px] mt-0.5 ${t.tone === 'level' ? 'text-stone-800' : 'text-stone-400'}`}>{t.sub}</div>}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="transit" className="relative space-y-6 transit-root" aria-labelledby="transit-title">
      {/* ── HEADER + PLAYER HUD ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em]">
              <MapPinned className="w-3 h-3" /> LINE CONTROL · CAREER METRO
            </div>
            {selected.id !== ORIGIN_ID && !selectedLocked && (
              <button
                type="button"
                onClick={() => handleOpenPathway()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-mono-board font-black tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                title={`Open full Reskilling Pathway page for ${selected.name}`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>VIEW RESKILLING PATHWAY PAGE →</span>
              </button>
            )}
          </div>
          <h2 id="transit-title" className="font-signage text-5xl sm:text-6xl font-black tracking-tight text-stone-900 leading-[0.9] mt-3">
            YOUR CAREER<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> METRO</span>
          </h2>
          <p className="text-sm text-stone-600 mt-2 max-w-xl">
            Every role is a station. Ride a line, transfer at interchanges, clear the fog — three destinations are lit up for you
            from your skill fit, preferences and live AI-market signals.
          </p>
        </div>

        {/* Player card */}
        <div className="hud-card rounded-[24px] p-3.5 pr-5 flex items-center gap-4 self-start lg:self-auto" id="player-hud">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                stroke="#FBBF24"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - levelProgress)}
                style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[8px] font-mono-board text-stone-400 tracking-widest leading-none">LVL</span>
              <span className="font-signage text-2xl font-black text-white leading-none">{level}</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono-board tracking-[0.2em] text-amber-300">{levelTitle(level).toUpperCase()}</div>
            <div className="font-signage text-xl font-black text-white tracking-wide leading-tight truncate">
              {(currentUser?.name || 'Explorer').toUpperCase()}
            </div>
            <div className="text-[10px] font-mono-board text-stone-400 tabular-nums">
              {xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
            </div>
          </div>
          <div className="hidden sm:grid grid-cols-3 gap-3 pl-4 border-l border-white/10">
            <div className="text-center">
              <Coins className="w-4 h-4 mx-auto text-amber-300" />
              <div className="font-mono-board text-sm font-bold text-white tabular-nums mt-0.5">{tokens}</div>
              <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest">TOKENS</div>
            </div>
            <div className="text-center">
              <Flame className="w-4 h-4 mx-auto text-orange-400" />
              <div className="font-mono-board text-sm font-bold text-white mt-0.5">5</div>
              <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest">STREAK</div>
            </div>
            <div className="text-center">
              <Eye className="w-4 h-4 mx-auto text-sky-300" />
              <div className="font-mono-board text-sm font-bold text-white tabular-nums mt-0.5">
                {charted}/{STATIONS.length}
              </div>
              <div className="text-[8.5px] font-mono-board text-stone-500 tracking-widest">CHARTED</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── UN SDG ALIGNMENT BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-[11px] font-mono-board tracking-wider uppercase font-bold text-stone-200">
            UN SDG Global Goals Mapping:
          </span>
          <span className="text-xs text-stone-400 hidden sm:inline">
            Every station & reskilling pathway advances the United Nations 2030 Agenda
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['sdg-4', 'sdg-8', 'sdg-9', 'sdg-10', 'sdg-12'] as SDGId[]).map((id) => {
            const g = SDG_GOALS[id]
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono-board font-black text-white shadow-2xs"
                style={{ background: g.color }}
                title={`${g.badge}: ${g.name} (${g.primaryTarget}) — ${g.targetDescription}`}
              >
                <span>{g.badge}</span>
                <span className="font-normal opacity-90 hidden md:inline">· {g.shortTitle}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* ── MAP + SIDE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 space-y-5">
          {/* Enamel-framed map */}
          <div className="map-frame rounded-[30px] p-2 sm:p-2.5" id="transit-map-card">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2 pb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono-board text-[10px] text-amber-400 font-bold mr-1 hidden sm:inline-block tracking-widest">
                  LINES:
                </span>
                {LINE_ORDER.map((l) => {
                  const off = hiddenLines.has(l)
                  return (
                    <button
                      key={l}
                      id={`line-toggle-${l}`}
                      type="button"
                      onClick={() => toggleLine(l)}
                      title={`${LINES[l].name} — ${LINES[l].tagline}`}
                      className={`group flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full border transition-all cursor-pointer ${
                        off ? 'border-white/10 opacity-35' : 'border-white/20 bg-white/10 hover:bg-white/20 shadow-sm'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-xs"
                        style={{ background: LINES[l].color }}
                      >
                        {LINES[l].code}
                      </span>
                      <span className="font-signage text-[13px] font-extrabold tracking-wider text-stone-100">
                        {LINES[l].name.replace(' Line', '').toUpperCase()}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="toggle-alternatives-btn"
                  onClick={() => setShowAlts((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono-board tracking-widest text-stone-200 hover:bg-white/15 transition-all cursor-pointer"
                >
                  {showAlts ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
                  <span>{showAlts ? 'SHOWING ALTS' : 'ALTS HIDDEN'}</span>
                </button>
              </div>
            </div>

            <div className="rounded-[22px] overflow-hidden overflow-x-auto custom-scrollbar bg-[#F7F3E9] border border-stone-800/40">
              <div className="min-w-[760px]">
                <TransitMap
                  selectedId={selectedId}
                  activeCalloutId={activeCalloutId}
                  onCloseCallout={() => setActiveCalloutId(null)}
                  hoveredId={hoveredId}
                  discovered={discovered}
                  activeRoute={selectedLocked ? null : activeRoute}
                  ghostRoutes={selectedLocked ? [] : ghostRoutes}
                  hiddenLines={hiddenLines}
                  trainKey={trainKey}
                  userInitial={(currentUser?.name || 'E').charAt(0).toUpperCase()}
                  onHover={setHoveredId}
                  onSelect={handleSelect}
                  onOpenPathway={handleOpenPathway}
                />
              </div>
            </div>

            {/* Official Transit Authority Map Legend */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-3 pt-3 pb-1 text-[10px] font-mono-board tracking-wider text-stone-300">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white/90 shadow-sm" />
                <span className="font-bold text-amber-300">TOP-3 MATCH</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-white ring-[3px] ring-stone-900 ring-inset border border-white" />
                <span>INTERCHANGE HUB</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-stone-300" />
                <span>SKILL-BRIDGE WALKWAY</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 border-t-2 border-dashed border-stone-300" />
                <span>ALTERNATIVE ROUTE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-stone-400" />
                <span>PLANNED EXTENSION</span>
              </span>
              <span className="ml-auto text-stone-400 hidden md:inline-block">
                1 FARE ZONE ≈ 1 CAREER HORIZON
              </span>
            </div>
          </div>

          {/* ── ROUTE PLANNER ── */}
          <div className="planner-card rounded-[26px] p-5" id="route-planner">
            <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
              <div>
                <div className="text-[10px] font-mono-board tracking-[0.25em] text-stone-500">JOURNEY PLANNER</div>
                <h3 className="font-signage text-2xl font-black tracking-wide text-stone-900 leading-tight">
                  {selected.id === ORIGIN_ID ? 'PICK A DESTINATION' : `ROUTES TO ${selected.name.toUpperCase()}`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {selected.id !== ORIGIN_ID && !selectedLocked && (
                  <button
                    type="button"
                    id="planner-open-pathway-btn"
                    onClick={() => handleOpenPathway()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-amber-300 hover:bg-black text-xs font-mono-board font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>RESKILLING PATHWAY</span>
                  </button>
                )}
                {routes.length > 0 && (
                  <span className="text-[10px] font-mono-board tracking-wider text-stone-500 hidden sm:inline-block">
                    {routes.length} ROUTE{routes.length > 1 ? 'S' : ''} FOUND
                  </span>
                )}
              </div>
            </div>

            {selected.id === ORIGIN_ID ? (
              <p className="text-sm text-stone-500">You are standing on the origin platform. Tap any station to plan a journey.</p>
            ) : selectedLocked ? (
              <p className="text-sm text-stone-500">Scout this station first to reveal its routes.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {routes.map((r, i) => {
                  const active = r === activeRoute
                  const lbl = ROUTE_LABELS[i] ?? ROUTE_LABELS[2]
                  return (
                    <button
                      key={r.id}
                      id={`route-option-${i}`}
                      type="button"
                      onClick={() => handleRouteSelect(i)}
                      className={`text-left rounded-2xl p-3.5 border-2 transition-all duration-200 cursor-pointer ${
                        active
                          ? 'border-stone-900 bg-white shadow-[6px_6px_0_0_#1C1917] -translate-x-0.5 -translate-y-0.5'
                          : 'border-stone-300 bg-white/60 hover:border-stone-500 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-signage text-lg font-black tracking-wider ${active ? 'text-stone-900' : 'text-stone-600'}`}>
                          {lbl.name.toUpperCase()}
                        </span>
                        {i === 0 && (
                          <span className="text-[9px] font-mono-board tracking-widest px-1.5 py-0.5 rounded bg-amber-400 text-stone-900 font-bold">
                            FASTEST
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-stone-500 mb-1">{lbl.hint}</div>
                      <RouteStrip route={r} />
                      <div className="mt-1 grid grid-cols-4 gap-1 font-mono-board text-center">
                        <div>
                          <div className="text-[8.5px] tracking-widest text-stone-400">STOPS</div>
                          <div className="text-sm font-bold text-stone-900">{r.stations.length - 1}</div>
                        </div>
                        <div>
                          <div className="text-[8.5px] tracking-widest text-stone-400 flex items-center justify-center gap-0.5">
                            <ArrowLeftRight className="w-2.5 h-2.5" />
                            XFER
                          </div>
                          <div className="text-sm font-bold text-stone-900">{r.transfers}</div>
                        </div>
                        <div>
                          <div className="text-[8.5px] tracking-widest text-stone-400">RIDE</div>
                          <div className="text-sm font-bold text-stone-900">{r.months}mo</div>
                        </div>
                        <div>
                          <div className="text-[8.5px] tracking-widest text-stone-400">XP</div>
                          <div className="text-sm font-bold text-amber-600">{r.xp}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── COMMUTE & CAREER CHECKLIST ── */}
          <div className="planner-card rounded-[26px] p-5" id="daily-missions">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-stone-900" />
                <h3 className="font-signage text-xl font-black tracking-wider text-stone-900">
                  {checklistTab === 'missions' || !rolePathway
                    ? "COMMUTE CHECKLIST · MISSIONS"
                    : `${selected.name.toUpperCase()} · LEARNING CHECKLIST`}
                </h3>
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  id="tab-checklist-missions"
                  onClick={() => setChecklistTab('missions')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-board tracking-wider font-bold transition-all cursor-pointer ${
                    checklistTab === 'missions' || !rolePathway
                      ? 'bg-stone-900 text-amber-300 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  DAILY MISSIONS ({missionsDone.size}/{MISSIONS.length})
                </button>
                {rolePathway && (
                  <button
                    type="button"
                    id="tab-checklist-pathway"
                    onClick={() => setChecklistTab('pathway')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono-board tracking-wider font-bold transition-all cursor-pointer ${
                      checklistTab === 'pathway'
                        ? 'bg-stone-900 text-amber-300 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    LEARNING STEPS ({rolePathway.checkpoints.filter((c) => completedCheckpoints.has(c.id)).length}/{rolePathway.checkpoints.length})
                  </button>
                )}
              </div>
            </div>

            {/* Checklist Tab 1: Daily Missions */}
            {(checklistTab === 'missions' || !rolePathway) && (
              <div className="space-y-2">
                {MISSIONS.map((m) => {
                  const done = missionsDone.has(m.id)
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 border transition-all ${
                        done ? 'bg-emerald-50 border-emerald-200' : 'bg-white/70 border-stone-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (!done) {
                            completeMission(m.id)
                            setTokens((t) => t + 1)
                          }
                        }}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                          done ? 'bg-emerald-600 border-emerald-600 text-white rotate-[-6deg]' : 'border-stone-300 text-transparent hover:border-stone-400'
                        }`}
                      >
                        ✓
                      </button>
                      <span className={`flex-1 text-sm ${done ? 'text-emerald-900 line-through decoration-emerald-400 font-medium' : 'text-stone-800'}`}>
                        {m.title}
                      </span>
                      <span className="font-mono-board text-xs font-bold text-amber-600">+{m.xp} XP</span>
                      {!m.auto && !done && (
                        <button
                          type="button"
                          id={`mission-${m.id}-btn`}
                          onClick={() => {
                            completeMission(m.id)
                            setTokens((t) => t + 1)
                          }}
                          className="text-[10px] font-mono-board tracking-widest px-2.5 py-1 rounded-md bg-stone-900 text-amber-300 hover:bg-black cursor-pointer transition-all active:scale-95"
                        >
                          START
                        </button>
                      )}
                    </div>
                  )
                })}

                {planned && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-stone-600 pt-2 border-t border-stone-200">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Transit Card destination: <strong className="text-stone-900">{STATION_MAP[planned]?.name ?? planned}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Checklist Tab 2: Role Learning Checkpoints */}
            {checklistTab === 'pathway' && rolePathway && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1 px-1">
                  <span>Ordered learning checkpoints for transition from your background</span>
                  <button
                    type="button"
                    onClick={() => handleOpenPathway()}
                    className="inline-flex items-center gap-1 font-mono-board font-bold text-stone-800 hover:text-black underline underline-offset-2"
                  >
                    <span>Full Syllabus & Resources</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {rolePathway.checkpoints.map((cp) => {
                  const done = completedCheckpoints.has(cp.id)
                  return (
                    <div
                      key={cp.id}
                      className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${
                        done ? 'bg-emerald-50 border-emerald-200' : 'bg-white/70 border-stone-200 hover:bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCheckpoint(cp.id, cp.title)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 transition-all cursor-pointer ${
                          done ? 'bg-emerald-600 border-emerald-600 text-white rotate-[-6deg]' : 'border-stone-300 text-transparent hover:border-emerald-500'
                        }`}
                        title={done ? 'Mark as incomplete' : 'Mark checkpoint complete (+50 XP)'}
                      >
                        ✓
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className={`text-sm font-bold ${done ? 'text-emerald-950 line-through decoration-emerald-400' : 'text-stone-900'}`}>
                            {cp.title}
                          </h4>
                          <span className="text-[10px] font-mono-board text-stone-500 shrink-0 font-medium">
                            {cp.timeEstimate}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">{cp.objective}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {cp.skillsGained.slice(0, 3).map((sk) => (
                            <span key={sk} className="text-[10px] font-mono-board px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                              {sk}
                            </span>
                          ))}
                          <span className="ml-auto font-mono-board text-[11px] font-bold text-amber-600">
                            +50 XP
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="xl:col-span-4 space-y-5">
          <DepartureBoard
            picks={TOP_PICKS}
            originName={STATION_MAP[ORIGIN_ID].name}
            selectedId={selectedId}
            routeMonths={routeMonths}
            market={market}
            scrambleKey={scrambleKey}
            minutesSinceScan={minutesSinceScan}
            onSelect={handleSelect}
            onRescan={handleRescan}
          />
          <StationTicket
            key={selected.id}
            station={selected}
            zone={zoneOf(selected)}
            route={activeRoute}
            locked={selectedLocked}
            tokens={tokens}
            market={market[selected.id]}
            onScout={handleScout}
            onBoard={handleBoard}
            onOpenPathway={() => handleOpenPathway()}
          />
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-rise rounded-2xl px-4 py-2.5 shadow-2xl border min-w-[200px] ${
              t.tone === 'warn'
                ? 'bg-rose-950 border-rose-700 text-rose-100'
                : t.tone === 'level'
                  ? 'bg-amber-400 border-amber-300 text-stone-950'
                  : 'bg-stone-950 border-stone-700 text-stone-100'
            }`}
          >
            <div className={`font-signage text-lg font-black tracking-wider leading-none ${t.tone === 'xp' ? 'text-amber-300' : ''}`}>
              {t.text}
            </div>
            {t.sub && <div className={`text-[11px] mt-0.5 ${t.tone === 'level' ? 'text-stone-800' : 'text-stone-400'}`}>{t.sub}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
