'use client'

import { cn } from '@/lib/utils'
import { type SizePreset, getSizeValue } from './constants/brand-tokens'
import { useReducedMotion } from './hooks/use-reduced-motion'

export interface VoidLogoProps {
  /** Custom CSS classes to merge with defaults */
  className?: string
  /** Size preset or custom dimensions */
  size?: SizePreset | number
  /** Disable pulse animation */
  static?: boolean
}

const MIN_SIZE = 16

/**
 * VoidPay brand logo component
 *
 * Renders an SVG logo with eclipse body, crescent mask, and violet glow effect.
 * Includes optional pulse animation that respects prefers-reduced-motion.
 *
 * @component
 * @example
 * ```tsx
 * // Default (md size, animated)
 * <VoidLogo />
 *
 * // Large, static
 * <VoidLogo size="lg" static />
 *
 * // Custom size
 * <VoidLogo size={128} />
 * ```
 */
export function VoidLogo({ className, size = 'md', static: isStatic = false }: VoidLogoProps) {
  const prefersReducedMotion = useReducedMotion()

  // Calculate numeric size from preset or direct number
  let numericSize: number
  if (typeof size === 'number') {
    // Clamp to minimum size
    numericSize = Math.max(size, MIN_SIZE)
  } else {
    numericSize = getSizeValue(size)
  }

  // Determine if animation should be applied
  const shouldAnimate = !isStatic && !prefersReducedMotion

  return (
    <svg
      width={numericSize}
      height={numericSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VoidPay Logo"
      className={cn('relative', shouldAnimate && 'animate-crescent-pulse', className)}
    >
      <defs>
        {/* Radial gradient for glow effect */}
        <radialGradient id="void-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>

        {/* Crescent mask for void effect */}
        <mask id="void-mask">
          <rect width="100" height="100" fill="white" />
          {/* Offset circle to create crescent */}
          <circle cx="60" cy="50" r="35" fill="black" />
        </mask>
      </defs>

      {/* Glow layer */}
      <circle cx="50" cy="50" r="45" fill="url(#void-glow)" className="opacity-60" />

      {/* Eclipse body with crescent mask */}
      <circle cx="50" cy="50" r="40" fill="#7C3AED" mask="url(#void-mask)" />

      {/* Event horizon ring */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#A78BFA" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}
