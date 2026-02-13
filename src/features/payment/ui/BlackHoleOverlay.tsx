'use client'

import { cn } from '@/shared/lib/utils'
import { motion } from '@/shared/ui/motion'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'

/**
 * Visual intensity states for the black hole effect.
 * Mapped from PaymentStep in SmartPayButton.
 */
export type BlackHoleState = 'idle' | 'active' | 'intense' | 'success'

interface BlackHoleOverlayProps {
  state: BlackHoleState
  className?: string
}

/** Rotation speed per revolution (seconds) for inner/outer accretion disks */
const ROTATION_SPEEDS: Record<BlackHoleState, { inner: number; outer: number }> = {
  idle: { inner: 4, outer: 8 },
  active: { inner: 2, outer: 4 },
  intense: { inner: 0.5, outer: 1.5 },
  success: { inner: 4, outer: 8 },
}

/** Opacity config per state for glow + disk layers */
const GLOW_CONFIG: Record<BlackHoleState, { near: number; far: number; disk: number }> = {
  idle: { near: 0.3, far: 0.2, disk: 0.5 },
  active: { near: 0.5, far: 0.35, disk: 0.7 },
  intense: { near: 0.8, far: 0.5, disk: 1.0 },
  success: { near: 0.9, far: 0.7, disk: 0.3 },
}

/**
 * Enhanced black hole overlay for SmartPayButton.
 *
 * Features:
 * - Dual accretion disks (inner blue-shifted fast + outer red-shifted slow)
 * - Event horizon with subtle violet edge tint
 * - Volumetric glow (near sharp + far atmospheric breathing)
 * - State-aware: idle → active → intense → success burst
 * - Hybrid animation: CSS keyframes for rotation, Framer Motion for transitions
 */
export function BlackHoleOverlay({ state, className }: BlackHoleOverlayProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) return null

  const speeds = ROTATION_SPEEDS[state]
  const glow = GLOW_CONFIG[state]
  const isSuccess = state === 'success'

  return (
    <div className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', className)}>
      {/* Layer 1a: Inner accretion ring — blue-shifted, fast */}
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        animate={{ opacity: isSuccess ? 0 : glow.disk }}
        transition={{ duration: 0.4 }}
        style={{
          background: `conic-gradient(
            from 0deg,
            oklch(0% 0 0 / 0%) 0deg,
            oklch(72% 0.22 270) 80deg,
            oklch(95% 0.05 270) 180deg,
            oklch(72% 0.22 270) 280deg,
            oklch(0% 0 0 / 0%) 360deg
          )`,
          maskImage: 'radial-gradient(circle, transparent 25%, black 38%, transparent 55%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 25%, black 38%, transparent 55%)',
          animationName: 'accretion-idle',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDuration: `${speeds.inner}s`,
          willChange: 'transform',
        }}
      />

      {/* Layer 1b: Outer accretion ring — red-shifted, slow, counter-rotating */}
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        animate={{ opacity: isSuccess ? 0 : glow.disk * 0.6 }}
        transition={{ duration: 0.4 }}
        style={{
          background: `conic-gradient(
            from 180deg,
            oklch(0% 0 0 / 0%) 0deg,
            oklch(55% 0.24 310) 90deg,
            oklch(70% 0.18 295) 180deg,
            oklch(55% 0.24 310) 270deg,
            oklch(0% 0 0 / 0%) 360deg
          )`,
          maskImage: 'radial-gradient(circle, transparent 50%, black 60%, black 100%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 50%, black 60%, black 100%)',
          animationName: 'accretion-idle',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDuration: `${speeds.outer}s`,
          animationDirection: 'reverse',
          willChange: 'transform',
        }}
      />

      {/* Layer 2: Event horizon — black center with subtle violet edge tint */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `radial-gradient(circle,
            oklch(0% 0 0) 0%,
            oklch(5% 0.06 280) 28%,
            oklch(0% 0 0) 33%,
            transparent 38%
          )`,
        }}
      />

      {/* Layer 3a: Near glow — sharp, mix-blend-screen for additive light */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] blur-sm mix-blend-screen"
        animate={
          isSuccess
            ? { opacity: [glow.near, 1, 0.5], scale: [1, 2.5, 1.1] }
            : { opacity: glow.near, scale: 1 }
        }
        transition={
          isSuccess
            ? { duration: 1, times: [0, 0.3, 1], ease: 'easeOut' }
            : { duration: 0.4 }
        }
        style={{
          background: 'radial-gradient(circle, oklch(60% 0.25 280 / 80%) 0%, transparent 50%)',
        }}
      />

      {/* Layer 3b: Far glow — atmospheric with breathing pulse */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] blur-xl"
        animate={
          isSuccess
            ? { opacity: [glow.far, 1, 0.4], scale: [1, 3, 1.2] }
            : { opacity: [glow.far, glow.far + 0.12, glow.far], scale: [1, 1.06, 1] }
        }
        transition={
          isSuccess
            ? { duration: 1.2, times: [0, 0.25, 1], ease: 'easeOut' }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{
          background: 'radial-gradient(circle, oklch(55% 0.22 280 / 60%) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
