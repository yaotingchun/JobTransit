import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  EDGES,
  LINES,
  LINE_ORDER,
  MAP_H,
  MAP_W,
  ORIGIN_ID,
  RANK_COLORS,
  STATIONS,
  STATION_MAP,
  ZONE_RADII,
  edgePath,
  pointsToPath,
  type LineId,
  type Route,
  type Station,
} from './transitData'
import { ZoomIn, ZoomOut, RotateCcw, ArrowRight, GraduationCap, X } from 'lucide-react'

interface TransitMapProps {
  selectedId: string
  activeCalloutId?: string | null
  onCloseCallout?: () => void
  hoveredId: string | null
  discovered: Set<string>
  activeRoute: Route | null
  ghostRoutes: Route[]
  hiddenLines: Set<LineId>
  trainKey: number
  userInitial: string
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  onOpenPathway?: (id: string) => void
}

const PAPER = '#F7F3E9'
const PAPER_GRID = '#E3DAC6'
const INK = '#1C1917'

/** Generates polyline string for ambient shuttle trains. */
function linePolyline(line: LineId): string {
  const pts: [number, number][] = []
  EDGES.filter((e) => e.line === line).forEach((e, i) => {
    const a = STATION_MAP[e.from]
    const b = STATION_MAP[e.to]
    if (!a || !b) return
    const seg: [number, number][] = [[a.x, a.y], ...e.bends, [b.x, b.y]]
    pts.push(...(i === 0 ? seg : seg.slice(1)))
  })
  return pointsToPath(pts)
}

function labelLayout(s: Station) {
  const fs = 12
  const lh = 13.5
  const off = s.kind === 'origin' ? 24 : s.topRank ? 20 : s.kind === 'interchange' ? 18 : 14
  const n = s.label.length

  switch (s.labelPos) {
    case 'n':
      return {
        x: s.x,
        y: s.y - off - (n - 1) * lh,
        anchor: 'middle' as const,
        lh,
        fs,
      }
    case 's':
      return {
        x: s.x,
        y: s.y + off + fs,
        anchor: 'middle' as const,
        lh,
        fs,
      }
    case 'w':
      return {
        x: s.x - off - 2,
        y: s.y - ((n - 1) * lh) / 2 + 4,
        anchor: 'end' as const,
        lh,
        fs,
      }
    default:
      return {
        x: s.x + off + 2,
        y: s.y - ((n - 1) * lh) / 2 + 4,
        anchor: 'start' as const,
        lh,
        fs,
      }
  }
}

export const TransitMap: React.FC<TransitMapProps> = ({
  selectedId,
  activeCalloutId,
  onCloseCallout,
  hoveredId,
  discovered,
  activeRoute,
  ghostRoutes,
  hiddenLines,
  trainKey,
  userInitial,
  onHover,
  onSelect,
  onOpenPathway,
}) => {
  const motionRef = useRef<SVGAnimateMotionElement>(null)
  const origin = STATION_MAP[ORIGIN_ID]

  // Internal fallback callout state if not controlled by parent
  const [localCalloutId, setLocalCalloutId] = useState<string | null>(null)
  const currentCalloutId = activeCalloutId !== undefined ? activeCalloutId : localCalloutId
  const calloutStation = currentCalloutId ? STATION_MAP[currentCalloutId] : null

  const handleDismissCallout = () => {
    if (onCloseCallout) {
      onCloseCallout()
    } else {
      setLocalCalloutId(null)
    }
  }

  // Dismiss active callout with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentCalloutId) {
        handleDismissCallout()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentCalloutId, onCloseCallout])

  // Zoom & Pan state for interactive metro map experience
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const handleZoomIn = () => setZoom((z) => Math.min(2.0, Number((z + 0.25).toFixed(2))))
  const handleZoomOut = () => setZoom((z) => Math.max(0.85, Number((z - 0.25).toFixed(2))))
  const handleResetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const routeEdgeIds = useMemo(
    () => new Set(activeRoute?.steps.map((s) => s.edge.id) ?? []),
    [activeRoute],
  )
  const routeStations = useMemo(() => new Set(activeRoute?.stations ?? []), [activeRoute])
  const routePath = activeRoute ? pointsToPath(activeRoute.points) : ''
  const routeLen = useMemo(() => {
    if (!activeRoute) return 0
    let len = 0
    for (let i = 1; i < activeRoute.points.length; i++) {
      const [x1, y1] = activeRoute.points[i - 1]
      const [x2, y2] = activeRoute.points[i]
      len += Math.hypot(x2 - x1, y2 - y1)
    }
    return len
  }, [activeRoute])

  useLayoutEffect(() => {
    if (trainKey > 0 && motionRef.current) {
      try {
        motionRef.current.beginElement()
      } catch {
        /* SMIL fallback */
      }
    }
  }, [trainKey, routePath])

  const isLocked = (s: Station) => !!s.locked && !discovered.has(s.id)

  // Coordinate grid labels (A-L across width, 1-8 down height)
  const gridCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L']
  const gridRows = ['1', '2', '3', '4', '5', '6']

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="w-full h-full select-none"
        role="img"
        aria-label="Interactive career transit map"
      >
        <defs>
          {/* Subtle architectural coordinate grid */}
          <pattern id="tm-subgrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={PAPER_GRID} strokeWidth="0.5" opacity="0.4" />
          </pattern>
          <pattern id="tm-main-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#tm-subgrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke={PAPER_GRID} strokeWidth="0.9" opacity="0.75" />
            {/* Fine coordinate crosshair at intersections */}
            <path d="M -4 0 L 4 0 M 0 -4 L 0 4" stroke="#B8AC90" strokeWidth="0.8" opacity="0.6" />
          </pattern>

          {/* Under construction / planned extension hatch pattern */}
          <pattern id="tm-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#D3C7AB" strokeWidth="1.5" opacity="0.4" />
          </pattern>

          {/* Glow filter for active route & top picks */}
          <filter id="tm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic Zoom & Pan Group */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 200ms ease-out' }}
        >
          {/* ── Base Cartographic Canvas ── */}
          <rect width={MAP_W} height={MAP_H} fill={PAPER} />
          <rect width={MAP_W} height={MAP_H} fill="url(#tm-main-grid)" />

          {/* Subtle perimeter coordinate ruler border */}
          <rect x="1" y="1" width={MAP_W - 2} height={MAP_H - 2} fill="none" stroke="#C5B89B" strokeWidth="1.2" opacity="0.5" />
          <rect x="8" y="8" width={MAP_W - 16} height={MAP_H - 16} fill="none" stroke="#C5B89B" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4" />

          {/* Ruler alphanumeric grid markers along top & bottom */}
          {gridCols.map((c, i) => (
            <g key={c} className="font-mono-board" fontSize="9" fill="#9C8E72" fontWeight="700">
              <text x={80 + i * 100} y="20" textAnchor="middle">
                {c}
              </text>
              <text x={80 + i * 100} y={MAP_H - 12} textAnchor="middle">
                {c}
              </text>
            </g>
          ))}
          {gridRows.map((r, i) => (
            <g key={r} className="font-mono-board" fontSize="9" fill="#9C8E72" fontWeight="700">
              <text x="18" y={90 + i * 95} textAnchor="middle">
                {r}
              </text>
              <text x={MAP_W - 18} y={90 + i * 95} textAnchor="middle">
                {r}
              </text>
            </g>
          ))}

          {/* ── Fare Zones: Clean Concentric Transit Boundaries ── */}
          {ZONE_RADII.map((r) => (
            <circle
              key={r}
              cx={origin.x}
              cy={origin.y}
              r={r}
              fill="none"
              stroke="#BFAF8A"
              strokeWidth="1.2"
              strokeDasharray="3 8"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}

          {/* Authentic Transit Zone Watermarks */}
          <g className="font-signage" fontSize="12" fontWeight="800" letterSpacing="3.5" fill="#A89770" opacity="0.85">
            <text x={origin.x} y={origin.y + ZONE_RADII[0] - 12} textAnchor="middle">
              ZONE 1 · CORE FOUNDATION
            </text>
            <text x={origin.x + 380} y={origin.y + 270} textAnchor="middle">
              ZONE 2 · ROLE SPECIALIZATION
            </text>
            <text x={origin.x + 640} y={origin.y + 270} textAnchor="middle">
              ZONE 3 · ADVANCED AI SYSTEMS
            </text>
            <text x={MAP_W - 70} y={MAP_H - 24} textAnchor="end">
              ZONE 4 · FRONTIER RESEARCH
            </text>
          </g>

          {/* ── Official Transit Authority Compass Rose ── */}
          <g transform="translate(68, 64)" opacity="0.85">
            <circle r="22" fill="#FDFCFA" stroke="#A89770" strokeWidth="1" />
            <circle r="16" fill="none" stroke="#A89770" strokeWidth="0.6" strokeDasharray="1.5 3" />
            <path d="M0 -20 L4 0 L0 3 L-4 0 Z" fill={INK} />
            <path d="M0 20 L4 0 L0 -3 L-4 0 Z" fill="#A89770" />
            <path d="M-20 0 L0 4 L3 0 L0 -4 Z" fill="#C5B89B" />
            <path d="M20 0 L0 4 L-3 0 L0 -4 Z" fill="#C5B89B" />
            <circle r="2.5" fill="#FDFCFA" stroke={INK} strokeWidth="1" />
            <text y="-25" textAnchor="middle" fontSize="8.5" fontWeight="900" fill={INK} className="font-signage" letterSpacing="1.5">
              GROWTH
            </text>
          </g>

          {/* ── Metro Track Lines (Outer Casing + Inner Line Color) ── */}
          <g strokeLinecap="round" strokeLinejoin="round" fill="none">
            {EDGES.filter((e) => e.line !== 'walk').map((e) => {
              const color = LINES[e.line as LineId].color
              const hidden = hiddenLines.has(e.line as LineId)
              const dimmed = !!activeRoute && !routeEdgeIds.has(e.id)
              const d = edgePath(e)
              return (
                <g key={e.id} style={{ opacity: hidden ? 0.05 : dimmed ? 0.28 : 1, transition: 'opacity 350ms ease' }}>
                  {/* Heavy white/cream track casing prevents line bleed */}
                  <path d={d} stroke={PAPER} strokeWidth="14" />
                  {/* Core colored transit rail */}
                  <path d={d} stroke={color} strokeWidth="7.5" />
                  {/* Inner specular line reflection for sleek transit feel */}
                  <path d={d} stroke="#FFFFFF" strokeWidth="1.2" opacity="0.3" />
                </g>
              )
            })}

            {/* ── Walking Transfers (Inter-Line Skill Bridges) ── */}
            {EDGES.filter((e) => e.line === 'walk').map((e) => {
              const dimmed = !!activeRoute && !routeEdgeIds.has(e.id)
              const d = edgePath(e)
              return (
                <g key={e.id} style={{ opacity: dimmed ? 0.3 : 1, transition: 'opacity 350ms ease' }}>
                  {/* Transfer tunnel casing */}
                  <path d={d} stroke={PAPER} strokeWidth="12" />
                  <path d={d} stroke="#78716C" strokeWidth="4" strokeDasharray="3 6" strokeLinecap="round" />
                  <path d={d} stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 6" strokeLinecap="round" />
                </g>
              )
            })}
          </g>

          {/* ── Ghost Alternative Routes (Dashed Overlays) ── */}
          {ghostRoutes.map((r) => (
            <path
              key={r.id}
              d={pointsToPath(r.points)}
              fill="none"
              stroke={INK}
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
              className="metro-ghost"
            />
          ))}

          {/* ── Active Route Highlight ── */}
          {activeRoute && (
            <g fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none">
              <path d={routePath} stroke={INK} strokeWidth="18" opacity="0.09" />
              <path d={routePath} stroke="#FFFFFF" strokeWidth="3" strokeDasharray="3 14" className="metro-flow" />
            </g>
          )}

          {/* ── Ambient Metro Shuttles ── */}
          <g pointerEvents="none">
            {LINE_ORDER.filter((l) => !hiddenLines.has(l)).map((l, i) => (
              <circle key={l} r="3.6" fill="#FFFFFF" stroke={LINES[l].color} strokeWidth="2.2" opacity={activeRoute ? 0.35 : 0.9}>
                <animateMotion
                  dur={`${12 + i * 2.2}s`}
                  repeatCount="indefinite"
                  path={linePolyline(l)}
                  keyPoints="0;1;0"
                  keyTimes="0;0.5;1"
                  calcMode="linear"
                />
              </circle>
            ))}
          </g>

          {/* ── Stations Layer ── */}
          {STATIONS.map((s) => {
            const locked = isLocked(s)
            const isOrigin = s.id === ORIGIN_ID
            const isSelected = s.id === selectedId
            const isHovered = s.id === hoveredId
            const onRoute = routeStations.has(s.id)
            const hiddenAll = s.lines.every((l) => hiddenLines.has(l)) && !isOrigin
            const dim = hiddenAll || (!!activeRoute && !onRoute && !isOrigin && !s.topRank)
            const rank = s.topRank
            const lay = labelLayout(s)
            const lineColor = LINES[s.lines[0]].color

            return (
              <g
                key={s.id}
                id={`station-${s.id}`}
                role="button"
                tabIndex={0}
                aria-label={locked ? 'Uncharted station' : `${s.name} (${s.code})`}
                className="cursor-pointer outline-none metro-station"
                style={{ opacity: dim ? 0.35 : 1, transition: 'opacity 350ms ease' }}
                onMouseEnter={() => onHover(s.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(s.id)}
                onBlur={() => onHover(null)}
                onClick={() => {
                  if (activeCalloutId === undefined) {
                    setLocalCalloutId(s.id)
                  }
                  onSelect(s.id)
                }}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault()
                    if (activeCalloutId === undefined) {
                      setLocalCalloutId(s.id)
                    }
                    onSelect(s.id)
                  }
                }}
              >
                {/* Generous touch/click hit area */}
                <circle cx={s.x} cy={s.y} r="24" fill="transparent" />

                {/* Selection Spinner Reticle */}
                {isSelected && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isOrigin ? 26 : rank ? 22 : 18}
                    fill="none"
                    stroke={INK}
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    className="metro-spin"
                  />
                )}

                {/* ── Station Glyphs by Role/Type ── */}
                {isOrigin ? (
                  /* ORIGIN PLATFORM (FULL-STACK DEVELOPER) */
                  <g>
                    <circle cx={s.x} cy={s.y} r="18" fill="none" stroke={INK} strokeWidth="2.5" className="metro-pulse" />
                    <circle cx={s.x} cy={s.y} r="16" fill={INK} stroke="#FFFFFF" strokeWidth="4" />
                    <text x={s.x} y={s.y + 5.5} textAnchor="middle" fontSize="14" fontWeight="900" fill="#FFFFFF" className="font-signage">
                      {userInitial}
                    </text>

                    {/* Vintage Enamel "YOU ARE HERE" Marker */}
                    <g transform={`translate(${s.x} ${s.y - 36})`} pointerEvents="none">
                      <rect x="-44" y="-12" width="88" height="22" rx="4" fill={INK} stroke="#FBBF24" strokeWidth="1.2" />
                      <path d="M -5 10 L 0 16 L 5 10 Z" fill={INK} />
                      <text y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" letterSpacing="1.5" fill="#FCD34D" className="font-signage">
                        YOU ARE HERE
                      </text>
                    </g>
                  </g>
                ) : locked ? (
                  /* UNCHARTED / PLANNED EXTENSION (Clean Architectural Blueprint) */
                  <g>
                    <circle cx={s.x} cy={s.y} r="10" fill="#FAF7F0" stroke="#78716C" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx={s.x} cy={s.y} r="3" fill="#A8A29E" />
                    {/* Small clean lock badge */}
                    <g transform={`translate(${s.x + 8} ${s.y - 8})`}>
                      <circle r="7" fill="#292524" />
                      <path
                        d="M -2.5 0 h 5 v 4 h -5 Z M -1.8 0 v -1.8 a 1.8 1.8 0 0 1 3.6 0 v 1.8"
                        fill="none"
                        stroke="#FEF3C7"
                        strokeWidth="1.1"
                      />
                    </g>
                  </g>
                ) : rank ? (
                  /* TOP-3 FEATURED DESTINATION STATION */
                  <g>
                    {/* Radiant Radar Ring */}
                    <circle cx={s.x} cy={s.y} r="17" fill={RANK_COLORS[rank].ring} opacity="0.3" className="metro-pulse" />
                    <circle cx={s.x} cy={s.y} r="14" fill={RANK_COLORS[rank].ring} stroke="#FFFFFF" strokeWidth="3.5" filter="url(#tm-glow)" />
                    <text x={s.x} y={s.y + 5.5} textAnchor="middle" fontSize="14" fontWeight="900" fill="#FFFFFF" className="font-signage">
                      {rank}
                    </text>
                  </g>
                ) : s.kind === 'interchange' ? (
                  /* MAJOR TRANSFER INTERCHANGE */
                  <g>
                    <circle cx={s.x} cy={s.y} r="11" fill="#FFFFFF" stroke={INK} strokeWidth="4" />
                    <circle cx={s.x} cy={s.y} r="4" fill={INK} />
                  </g>
                ) : s.kind === 'terminus' ? (
                  /* TERMINUS BULLET */
                  <g>
                    <circle cx={s.x} cy={s.y} r="10" fill="#FFFFFF" stroke={lineColor} strokeWidth="4.5" />
                    <circle cx={s.x} cy={s.y} r="3.5" fill={lineColor} />
                  </g>
                ) : (
                  /* STANDARD TRANSIT STOP */
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isHovered ? 8.5 : 7}
                    fill="#FFFFFF"
                    stroke={lineColor}
                    strokeWidth="4"
                    style={{ transition: 'r 180ms ease' }}
                  />
                )}

                {/* ── Station Name & Alphanumeric Code ── */}
                <g>
                  {/* Station Code Badge Pill */}
                  <g
                    transform={`translate(${lay.anchor === 'end' ? lay.x - 30 : lay.anchor === 'middle' ? lay.x : lay.x}, ${
                      lay.y - lay.lh - 3
                    })`}
                  >
                    <rect
                      x={lay.anchor === 'middle' ? -18 : lay.anchor === 'end' ? -10 : 0}
                      y="-7"
                      width="36"
                      height="12"
                      rx="3"
                      fill={locked ? '#E7E5E4' : s.topRank ? RANK_COLORS[s.topRank].bg : '#FFFFFF'}
                      stroke={locked ? '#A8A29E' : s.topRank ? RANK_COLORS[s.topRank].border : '#D6D3D1'}
                      strokeWidth="1"
                    />
                    <text
                      x={lay.anchor === 'middle' ? 0 : lay.anchor === 'end' ? 8 : 18}
                      y="2"
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="800"
                      fill={locked ? '#78716C' : s.topRank ? RANK_COLORS[s.topRank].text : '#44403C'}
                      className="font-mono-board"
                    >
                      {s.code}
                    </text>
                  </g>

                  {/* High-Contrast Metro Signage Text */}
                  <text
                    x={lay.x}
                    y={lay.y}
                    textAnchor={lay.anchor}
                    fontSize={lay.fs}
                    fontWeight="800"
                    letterSpacing="0.6"
                    fill={locked ? '#78716C' : INK}
                    stroke={PAPER}
                    strokeWidth="4.5"
                    paintOrder="stroke"
                    strokeLinejoin="round"
                    className="font-signage"
                  >
                    {(locked ? ['UNCHARTED', 'ROLE'] : s.label).map((ln, i) => (
                      <tspan key={i} x={lay.x} dy={i === 0 ? 0 : lay.lh}>
                        {ln}
                      </tspan>
                    ))}
                  </text>
                </g>
              </g>
            )
          })}

          {/* ── Commuter Train Vehicle along Active Route ── */}
          {activeRoute && trainKey > 0 && (
            <g key={`${activeRoute.id}-${trainKey}`} pointerEvents="none" className="metro-train">
              <g filter="url(#tm-glow)">
                {/* Sleek Bullet Train Body */}
                <rect x="-16" y="-7.5" width="32" height="15" rx="7.5" fill={INK} stroke="#FFFFFF" strokeWidth="2.2" />
                <rect x="-9" y="-3.5" width="5.5" height="4" rx="1" fill="#FCD34D" />
                <rect x="-1" y="-3.5" width="5.5" height="4" rx="1" fill="#FCD34D" />
                <circle cx="12" cy="0" r="2.8" fill="#FEF3C7" />
              </g>
              <animateMotion
                ref={motionRef}
                begin="indefinite"
                dur={`${Math.max(2.0, routeLen / 280)}s`}
                fill="freeze"
                rotate="auto"
                path={routePath}
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.45 0 0.2 1"
                keyPoints="0;1"
              />
            </g>
          )}
        </g>
      </svg>

      {/* ── Interactive Map Controls (Zoom / Pan / Fit) ── */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-stone-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset View"
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Network Indicator Badge in Bottom-Left ── */}
      <div className="absolute bottom-3 left-4 z-20 hidden sm:flex items-center gap-2 bg-stone-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[10px] font-mono-board text-stone-300 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>CAREER METRO · ALL 5 LINES ACTIVE</span>
      </div>


      {/* ── Interactive Station Callout Popover on Click (with Button to View Pathway) ── */}
      {calloutStation && calloutStation.id !== ORIGIN_ID && (() => {
        // Calculate dynamic coordinates accounting for zoom and pan
        const stationSvgX = (calloutStation.x - MAP_W / 2) * zoom + MAP_W / 2 + pan.x
        const stationSvgY = (calloutStation.y - MAP_H / 2) * zoom + MAP_H / 2 + pan.y
        const posX = (stationSvgX / MAP_W) * 100
        const posY = (stationSvgY / MAP_H) * 100

        // Adaptive vertical orientation: stations in upper half place callout below; lower half place above
        const isUpper = stationSvgY <= MAP_H * 0.48
        const CARD_W = 295

        return (
          <div
            className="absolute z-35 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
            style={{
              // Horizontal clamp: guarantees card stays safely within map boundaries (14px margins)
              left: `clamp(14px, calc(${posX}% - ${CARD_W / 2}px), calc(100% - ${CARD_W + 14}px))`,
              width: `${CARD_W}px`,
              // Vertical clamp: guarantees card never clips outside top or bottom edges
              ...(isUpper
                ? { top: `clamp(14px, calc(${posY}% + 22px), calc(100% - 250px))` }
                : { bottom: `clamp(14px, calc(${100 - posY}% + 22px), calc(100% - 250px))` }),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl bg-stone-950/95 text-stone-100 p-4 shadow-[0_20px_45px_rgba(0,0,0,0.65)] border-2 border-amber-400 backdrop-blur-md max-h-[calc(100%-28px)] overflow-y-auto custom-scrollbar">
              {/* Callout Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {calloutStation.lines.map((l) => (
                    <span
                      key={l}
                      className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-xs"
                      style={{ background: LINES[l].color }}
                    >
                      {LINES[l].code}
                    </span>
                  ))}
                  <span className="font-mono-board text-[10px] text-amber-300 font-bold">[{calloutStation.code}]</span>
                  {calloutStation.topRank && (
                    <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-amber-400 text-stone-950">
                      ★ TOP #{calloutStation.topRank}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  id="dismiss-map-callout-btn"
                  onClick={handleDismissCallout}
                  className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Dismiss Callout"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Station Title */}
              <h4 className="font-signage text-lg font-black tracking-wide leading-tight text-white">
                {calloutStation.name.toUpperCase()}
              </h4>

              {isLocked(calloutStation) ? (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-stone-400">
                    This station is uncharted in fog. Spend tokens on the ticket inspector to reveal routes and skills.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-stone-300 line-clamp-2 mt-1 leading-snug">
                    {calloutStation.blurb}
                  </p>

                  {/* Metrics Pill Grid */}
                  <div className="mt-2.5 pt-2 border-t border-stone-800 grid grid-cols-3 gap-1.5 font-mono-board text-center text-[10px]">
                    <div className="bg-white/5 p-1 rounded-lg">
                      <div className="text-stone-400">FIT</div>
                      <div className="text-emerald-400 font-bold">{calloutStation.fit}%</div>
                    </div>
                    <div className="bg-white/5 p-1 rounded-lg">
                      <div className="text-stone-400">RIDE</div>
                      <div className="text-stone-200 font-bold">{calloutStation.months} MO</div>
                    </div>
                    <div className="bg-white/5 p-1 rounded-lg">
                      <div className="text-stone-400">SALARY</div>
                      <div className="text-amber-300 font-bold truncate">{calloutStation.salary.split('–')[0]}</div>
                    </div>
                  </div>

                  {/* The button to click into the detailed view */}
                  <button
                    type="button"
                    id="map-callout-view-pathway-btn"
                    onClick={() => onOpenPathway?.(calloutStation.id)}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-board text-xs font-black tracking-wider flex items-center justify-between shadow-lg transition-all active:scale-95 cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
                      <span>View Detailed Pathway</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
