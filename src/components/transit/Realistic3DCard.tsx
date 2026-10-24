import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { CardPassData, CardTheme } from './types'
import { CardArtworkFront } from './CardArtworkFront'
import { CardArtworkBack } from './CardArtworkBack'

export interface Realistic3DCardProps {
  data: CardPassData
  theme: CardTheme
  onNfcTap?: () => void
  showGlare?: boolean
  className?: string
  cardMaxWidth?: string
  // External imperative control bindings
  isSpinning?: boolean
  onSpinChange?: (spinning: boolean) => void
  isFlipped?: boolean
  onFlipChange?: (flipped: boolean) => void
}

export interface Realistic3DCardRef {
  flip: () => void
  startSpin: () => void
  stopSpin: () => void
  reset: () => void
}

export const Realistic3DCard = React.forwardRef<Realistic3DCardRef, Realistic3DCardProps>(
  (
    {
      data,
      theme,
      onNfcTap,
      showGlare = true,
      className = '',
      cardMaxWidth = '660px',
      isSpinning: externalIsSpinning,
      onSpinChange,
      isFlipped: externalIsFlipped,
      onFlipChange,
    },
    ref
  ) => {
    // 3D Angles in degrees
    const [rotX, setRotX] = useState<number>(0)
    const [rotY, setRotY] = useState<number>(0)

    // Internal state if not controlled externally
    const [internalFlipped, setInternalFlipped] = useState(false)
    const isFlipped = externalIsFlipped !== undefined ? externalIsFlipped : internalFlipped

    const [internalSpinning, setInternalSpinning] = useState(false)
    const isSpinning = externalIsSpinning !== undefined ? externalIsSpinning : internalSpinning

    // Interaction flags
    const [isDragging, setIsDragging] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [isAnimatingFlip, setIsAnimatingFlip] = useState(false)

    // Physics & Drag Tracking
    const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number; time: number }>({
      x: 0,
      y: 0,
      rotX: 0,
      rotY: 0,
      time: 0,
    })
    const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 })
    const lastPointerRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 })
    const dragDistanceRef = useRef<number>(0)
    const rafIdRef = useRef<number | null>(null)
    const cardContainerRef = useRef<HTMLDivElement>(null)

    // Respect reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Sync external flip state with rotY
    const setFlipped = useCallback(
      (newFlipped: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof newFlipped === 'function' ? newFlipped(isFlipped) : newFlipped
        if (onFlipChange) {
          onFlipChange(next)
        } else {
          setInternalFlipped(next)
        }
      },
      [isFlipped, onFlipChange]
    )

    const setSpinning = useCallback(
      (newSpinning: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof newSpinning === 'function' ? newSpinning(isSpinning) : newSpinning
        if (onSpinChange) {
          onSpinChange(next)
        } else {
          setInternalSpinning(next)
        }
      },
      [isSpinning, onSpinChange]
    )

    // ─── Flip Action ────────────────────────────────────────────────────────────
    const flipCard = useCallback(() => {
      if (isSpinning) {
        setSpinning(false)
      }
      setIsAnimatingFlip(true)
      const nextFlipped = !isFlipped
      setFlipped(nextFlipped)

      // Calculate nearest 180-degree multiple aligned with flip state
      setRotY((prev) => {
        const base = Math.round(prev / 360) * 360
        return nextFlipped ? base + 180 : base
      })

      // Level out vertical pitch slightly for clean presentation
      setRotX((prev) => prev * 0.3)

      setTimeout(() => {
        setIsAnimatingFlip(false)
      }, 750)
    }, [isFlipped, isSpinning, setFlipped, setSpinning])

    // ─── Reset Action ───────────────────────────────────────────────────────────
    const resetView = useCallback(() => {
      setSpinning(false)
      setIsAnimatingFlip(true)
      setRotX(0)
      setRotY(isFlipped ? 180 : 0)
      velocityRef.current = { vx: 0, vy: 0 }
      setTimeout(() => {
        setIsAnimatingFlip(false)
      }, 650)
    }, [isFlipped, setSpinning])

    // Expose methods to ref
    React.useImperativeHandle(ref, () => ({
      flip: flipCard,
      startSpin: () => setSpinning(true),
      stopSpin: () => setSpinning(false),
      reset: resetView,
    }))

    // ─── Continuous Spin Loop (Turntable Animation) ─────────────────────────────
    useEffect(() => {
      if (!isSpinning || isDragging || prefersReducedMotion) return

      let lastTime = performance.now()
      const spinSpeed = 38 // degrees per second

      const animateSpin = (now: number) => {
        const delta = (now - lastTime) / 1000
        lastTime = now

        setRotY((prev) => (prev + spinSpeed * delta) % 3600)
        rafIdRef.current = requestAnimationFrame(animateSpin)
      }

      rafIdRef.current = requestAnimationFrame(animateSpin)
      return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      }
    }, [isSpinning, isDragging, prefersReducedMotion])

    // ─── Inertia Deceleration Loop ──────────────────────────────────────────────
    useEffect(() => {
      if (isDragging || isSpinning || isAnimatingFlip) return

      const { vx, vy } = velocityRef.current
      if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) return

      let animationFrame: number

      const applyInertia = () => {
        velocityRef.current.vx *= 0.93 // friction
        velocityRef.current.vy *= 0.93

        setRotY((prev) => prev + velocityRef.current.vx)
        setRotX((prev) => Math.max(-55, Math.min(55, prev + velocityRef.current.vy)))

        if (
          Math.abs(velocityRef.current.vx) > 0.05 ||
          Math.abs(velocityRef.current.vy) > 0.05
        ) {
          animationFrame = requestAnimationFrame(applyInertia)
        } else {
          velocityRef.current = { vx: 0, vy: 0 }
        }
      }

      animationFrame = requestAnimationFrame(applyInertia)
      return () => cancelAnimationFrame(animationFrame)
    }, [isDragging, isSpinning, isAnimatingFlip])

    // ─── Pointer Event Handlers (Mouse & Touch Dragging) ─────────────────────────
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      // Only primary mouse button or touch
      if (e.button !== 0) return

      // Stop any existing animation
      if (isSpinning) setSpinning(false)
      velocityRef.current = { vx: 0, vy: 0 }
      dragDistanceRef.current = 0

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        rotX,
        rotY,
        time: performance.now(),
      }

      lastPointerRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
      }

      setIsDragging(true)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const now = performance.now()

      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x
        const deltaY = e.clientY - dragStartRef.current.y
        dragDistanceRef.current = Math.hypot(deltaX, deltaY)

        // Calculate velocity for natural inertia release
        const dt = Math.max(1, now - lastPointerRef.current.time)
        const dx = e.clientX - lastPointerRef.current.x
        const dy = e.clientY - lastPointerRef.current.y

        // Track smoothed velocity
        velocityRef.current = {
          vx: (dx / dt) * 14,
          vy: -(dy / dt) * 14,
        }

        lastPointerRef.current = {
          x: e.clientX,
          y: e.clientY,
          time: now,
        }

        // Sensitivity: 0.45 degrees per pixel
        const sensitivity = 0.45
        setRotY(dragStartRef.current.rotY + deltaX * sensitivity)
        setRotX(
          Math.max(
            -55,
            Math.min(55, dragStartRef.current.rotX - deltaY * sensitivity)
          )
        )
      } else if (isHovered && !isSpinning && !prefersReducedMotion) {
        // Subtle cursor-following micro-tilt when hovering (not dragging)
        if (!cardContainerRef.current) return
        const rect = cardContainerRef.current.getBoundingClientRect()
        const relativeX = (e.clientX - rect.left) / rect.width - 0.5
        const relativeY = (e.clientY - rect.top) / rect.height - 0.5

        const tiltX = -relativeY * 12 // pitch
        const tiltY = relativeX * 14 // yaw
        const baseRotY = isFlipped ? 180 : 0

        setRotX((prev) => prev * 0.85 + tiltX * 0.15)
        setRotY((prev) => prev * 0.85 + (baseRotY + tiltY) * 0.15)
      }
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      setIsDragging(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // ignore if already released
      }

      // If user moved less than 6px, treat as a direct CLICK TO FLIP!
      if (dragDistanceRef.current < 6) {
        flipCard()
      } else {
        // Clamp velocity for pleasant deceleration
        velocityRef.current.vx = Math.max(-18, Math.min(18, velocityRef.current.vx))
        velocityRef.current.vy = Math.max(-14, Math.min(14, velocityRef.current.vy))
      }
    }

    const handlePointerLeave = () => {
      setIsHovered(false)
      if (!isDragging && !isSpinning && !isAnimatingFlip) {
        // Smoothly settle back to neutral tilt
        setRotX((prev) => prev * 0.7)
      }
    }

    // ─── Keyboard Accessibility ─────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        flipCard()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setRotY((prev) => prev + 15)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setRotY((prev) => prev - 15)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setRotX((prev) => Math.min(50, prev + 10))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setRotX((prev) => Math.max(-50, prev - 10))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        resetView()
      }
    }

    // ─── Dynamic Physics Computations for Lighting & Ground Shadows ──────────────
    // 1. Specular Glare Coordinates
    const normalizedY = ((rotY % 360) + 360) % 360
    const glareX = 50 + Math.sin((normalizedY * Math.PI) / 180) * 45
    const glareY = 50 - Math.sin((rotX * Math.PI) / 180) * 45

    // 2. Realistic Ground Shadow Physics:
    // When card turns edge-on (90° or 270°), shadow width narrows to a thin sliver (|cos(rotY)|).
    const cosY = Math.abs(Math.cos((normalizedY * Math.PI) / 180))
    const shadowScaleX = Math.max(0.12, cosY * 0.88 + 0.12)
    const shadowScaleY = Math.max(0.65, 1 - Math.abs(rotX) / 120)
    const shadowOffsetY = 36 + rotX * 0.4
    const shadowBlur = 24 + (1 - cosY) * 14 + (isHovered ? 8 : 0)
    const shadowOpacity = Math.max(0.2, cosY * 0.42 + 0.18)

    // Elevation lift
    const cardElevationZ = isDragging ? 32 : isHovered ? 18 : 0

    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none py-8 sm:py-12 px-4 ${className}`}
        style={{ perspective: '1200px' }}
      >
        {/* ── Dynamic Cast Shadow on Floor ── */}
        <div
          className="absolute pointer-events-none transition-all duration-150 ease-out z-0"
          style={{
            bottom: '24px',
            width: '85%',
            maxWidth: '580px',
            height: '46px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 75%)',
            filter: `blur(${shadowBlur}px)`,
            opacity: shadowOpacity,
            transform: `translate3d(0, ${shadowOffsetY}px, 0) scale(${shadowScaleX}, ${shadowScaleY})`,
            willChange: 'transform, filter, opacity',
          }}
        />

        {/* Ambient Contact Shadow directly below the card */}
        <div
          className="absolute pointer-events-none z-0"
          style={{
            bottom: '36px',
            width: '72%',
            maxWidth: '460px',
            height: '20px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.35) 0%, transparent 70%)',
            filter: 'blur(10px)',
            opacity: cosY * 0.6,
            transform: `scaleX(${shadowScaleX})`,
          }}
        />

        {/* ── 3D Card Interactive Container ── */}
        <div
          ref={cardContainerRef}
          role="button"
          tabIndex={0}
          aria-label="3D Interactive Career Transit Pass. Press Space to flip, Arrow keys to tilt, Escape to reset."
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handlePointerLeave}
          className={`relative touch-none outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50 rounded-[22px] transition-transform ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            width: '100%',
            maxWidth: cardMaxWidth || '660px',
            aspectRatio: '1.586', // Standard credit/transit card ratio
            transformStyle: 'preserve-3d',
            transform: `translate3d(0, 0, ${cardElevationZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDragging
              ? 'none'
              : isAnimatingFlip
              ? 'transform 0.72s cubic-bezier(0.25, 1, 0.5, 1)'
              : 'transform 0.18s ease-out',
            willChange: 'transform',
          }}
        >
          {/* ── Realistic Card Physical Thickness (0.76mm Plastic Core Edge) ── */}
          <div
            className="absolute inset-0 rounded-[22px] pointer-events-none"
            style={{
              transform: 'translateZ(-0.8px)',
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.4),
                0 2px 4px rgba(0, 0, 0, 0.2),
                0 12px 28px -4px rgba(15, 23, 42, 0.28)
              `,
            }}
          />

          {/* ── FRONT FACE (rotateY: 0deg, translateZ: 1.2px) ── */}
          <div
            className="absolute inset-0 w-full h-full rounded-[22px] overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(1.2px)',
            }}
          >
            <CardArtworkFront data={data} theme={theme} />

            {/* Specular Glare & Plastic Luster for Front */}
            {showGlare && (
              <div
                className="absolute inset-0 rounded-[22px] pointer-events-none mix-blend-overlay transition-opacity duration-200"
                style={{
                  background: `radial-gradient(circle 380px at ${glareX}% ${glareY}%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.12) 32%, transparent 68%)`,
                  opacity: isHovered || isDragging || isSpinning ? 1 : 0.75,
                }}
              />
            )}

            {/* Diagonal Holographic Sheen Stripe */}
            <div
              className="absolute -inset-full pointer-events-none opacity-20 mix-blend-color-dodge transition-transform duration-700"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
                transform: `translateX(${(normalizedY / 360) * 100 - 50}%)`,
              }}
            />
          </div>

          {/* ── BACK FACE (rotateY: 180deg, translateZ: 1.2px) ── */}
          <div
            className="absolute inset-0 w-full h-full rounded-[22px] overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1.2px)',
            }}
          >
            <CardArtworkBack data={data} theme={theme} onNfcTap={onNfcTap} />

            {/* Specular Glare for Back */}
            {showGlare && (
              <div
                className="absolute inset-0 rounded-[22px] pointer-events-none mix-blend-overlay transition-opacity duration-200"
                style={{
                  background: `radial-gradient(circle 380px at ${100 - glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 32%, transparent 68%)`,
                  opacity: isHovered || isDragging || isSpinning ? 0.9 : 0.65,
                }}
              />
            )}
          </div>
        </div>

        {/* Micro hint underneath the card */}
        <p className="mt-6 text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-2 pointer-events-none select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>Click to flip • Drag freely to rotate in 3D</span>
        </p>
      </div>
    )
  }
)

Realistic3DCard.displayName = 'Realistic3DCard'
