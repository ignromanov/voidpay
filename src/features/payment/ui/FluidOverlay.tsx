'use client'

import { motion } from '@/shared/ui/motion'
import { useReducedMotion } from '@/shared/ui'
import type { TargetAndTransition, Transition } from 'framer-motion'
import type { PaymentStep } from '../model/types'

interface FluidOverlayProps {
  step: PaymentStep
  className?: string
}

// ---------------------------------------------------------------------------
// Per-step gradient palettes — color journey through the payment flow
// violet(280) → blue-violet(268) → indigo(252) → magenta(300) → blue(240) → emerald(165)
// ---------------------------------------------------------------------------

const GRADIENTS: Record<PaymentStep, { primary: string; secondary: string; glow: string }> = {
  idle: {
    primary:   'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(45% 0.27 280 / 0.5) 0%, oklch(52% 0.22 285 / 0.3) 40%, transparent 70%)',
    secondary: 'radial-gradient(ellipse 70% 50% at 45% 55%, oklch(57% 0.24 290 / 0.4) 0%, oklch(66% 0.17 290 / 0.2) 50%, transparent 70%)',
    glow:      'radial-gradient(circle at center, oklch(45% 0.27 280 / 0.3) 0%, transparent 60%)',
  },
  connecting: {
    primary:   'radial-gradient(ellipse 85% 65% at 50% 50%, oklch(48% 0.25 268 / 0.55) 0%, oklch(55% 0.20 272 / 0.3) 40%, transparent 70%)',
    secondary: 'radial-gradient(ellipse 72% 52% at 44% 56%, oklch(60% 0.22 265 / 0.4) 0%, oklch(65% 0.17 270 / 0.2) 50%, transparent 70%)',
    glow:      'radial-gradient(circle at center, oklch(50% 0.24 268 / 0.3) 0%, transparent 60%)',
  },
  switching: {
    primary:   'radial-gradient(ellipse 85% 65% at 50% 50%, oklch(50% 0.23 252 / 0.55) 0%, oklch(57% 0.19 256 / 0.3) 40%, transparent 70%)',
    secondary: 'radial-gradient(ellipse 72% 52% at 44% 56%, oklch(62% 0.20 248 / 0.4) 0%, oklch(67% 0.16 255 / 0.2) 50%, transparent 70%)',
    glow:      'radial-gradient(circle at center, oklch(52% 0.22 252 / 0.3) 0%, transparent 60%)',
  },
  sending: {
    primary:   'radial-gradient(ellipse 90% 70% at 50% 50%, oklch(48% 0.28 300 / 0.6) 0%, oklch(55% 0.24 305 / 0.35) 40%, transparent 70%)',
    secondary: 'radial-gradient(ellipse 75% 55% at 46% 54%, oklch(58% 0.25 295 / 0.45) 0%, oklch(64% 0.20 308 / 0.2) 50%, transparent 70%)',
    glow:      'radial-gradient(circle at center, oklch(50% 0.26 300 / 0.3) 0%, transparent 60%)',
  },
  confirming: {
    primary:   'radial-gradient(ellipse 90% 70% at 50% 50%, oklch(48% 0.22 240 / 0.6) 0%, oklch(55% 0.18 244 / 0.35) 40%, transparent 70%)',
    secondary: 'radial-gradient(ellipse 75% 55% at 46% 54%, oklch(58% 0.20 236 / 0.45) 0%, oklch(64% 0.16 248 / 0.2) 50%, transparent 70%)',
    glow:      'radial-gradient(circle at center, oklch(50% 0.20 240 / 0.3) 0%, transparent 60%)',
  },
  success: {
    primary:   'radial-gradient(ellipse 100% 80% at 50% 50%, oklch(72% 0.18 165 / 0.5) 0%, oklch(76% 0.15 175 / 0.3) 50%, transparent 70%)',
    secondary: 'radial-gradient(ellipse 80% 60% at 48% 52%, oklch(75% 0.16 170 / 0.4) 0%, oklch(78% 0.14 185 / 0.2) 50%, transparent 70%)',
    glow:      'radial-gradient(circle at center, oklch(72% 0.18 165 / 0.3) 0%, transparent 60%)',
  },
}

type Intensity = 'calm' | 'active' | 'intense'

/** Animation intensity tier derived from step */
function getIntensity(step: PaymentStep): Intensity {
  switch (step) {
    case 'connecting':
    case 'switching':
      return 'active'
    case 'sending':
    case 'confirming':
      return 'intense'
    default:
      return 'calm'
  }
}

// ---------------------------------------------------------------------------
// Animation lookup maps — keyed by intensity, success handled separately
// ---------------------------------------------------------------------------

const LAYER1_ANIMATE: Record<Intensity, TargetAndTransition> = {
  calm:    { opacity: [0.15, 0.22, 0.15], scale: [1, 1.04, 1] },
  active:  { opacity: [0.4, 0.55, 0.4], scale: [1, 1.05, 1] },
  intense: { opacity: [0.6, 0.75, 0.6], scale: [1, 1.08, 1] },
}
const LAYER1_ANIMATE_SUCCESS: TargetAndTransition = { opacity: [0.5, 0.9, 0.3], scale: [1, 1.4, 1.1] }

const LAYER1_TRANSITION: Record<Intensity, Transition> = {
  calm:    { duration: 9, repeat: Infinity, ease: 'easeInOut' },
  active:  { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  intense: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
}
const LAYER1_TRANSITION_SUCCESS: Transition = { duration: 1.2, times: [0, 0.4, 1], ease: 'easeOut' }

const LAYER2_ANIMATE: Record<Intensity, TargetAndTransition> = {
  calm:    { opacity: [0.1, 0.18, 0.1], x: [-1, 1, -1], y: [1, -1, 1] },
  active:  { opacity: [0.25, 0.4, 0.25], x: [-2, 2, -2], y: [1, -1, 1] },
  intense: { opacity: [0.4, 0.55, 0.4], x: [-3, 3, -3], y: [2, -2, 2] },
}
const LAYER2_ANIMATE_SUCCESS: TargetAndTransition = { opacity: [0.3, 0.7, 0.2], x: [0, 5, 0], y: [0, -5, 0] }

const LAYER2_TRANSITION: Record<Intensity, Transition> = {
  calm:    { duration: 11, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] },
  active:  { duration: 3.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] },
  intense: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] },
}
const LAYER2_TRANSITION_SUCCESS: Transition = { duration: 1, times: [0, 0.5, 1], ease: 'easeOut' }

const LAYER3_OPACITY: Record<Intensity, number> = {
  calm:    0.04,
  active:  0.1,
  intense: 0.15,
}

/**
 * Fluid Overlay — organic gradient animation layer for SmartPayButton.
 *
 * Each payment step gets its own color palette, creating a visual
 * journey: violet → blue-violet → indigo → magenta → deep-blue → emerald.
 * Animation intensity scales with step urgency.
 */
export function FluidOverlay({ step, className }: FluidOverlayProps) {
  const prefersReducedMotion = useReducedMotion()
  const { primary, secondary, glow } = GRADIENTS[step]

  if (prefersReducedMotion) {
    return (
      <div className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className ?? ''}`}>
        <div className="absolute inset-0 rounded-[inherit] opacity-30" style={{ background: primary }} />
      </div>
    )
  }

  const isSuccess = step === 'success'
  const intensity = getIntensity(step)

  return (
    <div className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className ?? ''}`}>
      {/* Layer 1: Primary morphing blob */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] blur-xl"
        animate={isSuccess ? LAYER1_ANIMATE_SUCCESS : LAYER1_ANIMATE[intensity]}
        transition={isSuccess ? LAYER1_TRANSITION_SUCCESS : LAYER1_TRANSITION[intensity]}
        style={{ background: primary }}
      />

      {/* Layer 2: Secondary blob (offset, counter-phase) */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] blur-2xl"
        animate={isSuccess ? LAYER2_ANIMATE_SUCCESS : LAYER2_ANIMATE[intensity]}
        transition={isSuccess ? LAYER2_TRANSITION_SUCCESS : LAYER2_TRANSITION[intensity]}
        style={{ background: secondary }}
      />

      {/* Layer 3: Soft inner glow (non-morphing stabilizer) */}
      {!isSuccess && (
        <motion.div
          className="absolute inset-0 rounded-[inherit]"
          animate={{ opacity: LAYER3_OPACITY[intensity] }}
          transition={{ duration: 0.4 }}
          style={{ background: glow }}
        />
      )}

      {/* Layer 4: Success bloom */}
      {isSuccess && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] blur-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.8, 0.4], scale: [0.9, 1.3, 1.05] }}
          transition={{ duration: 1, times: [0, 0.4, 1], ease: 'easeOut' }}
          style={{ background: primary }}
        />
      )}
    </div>
  )
}
