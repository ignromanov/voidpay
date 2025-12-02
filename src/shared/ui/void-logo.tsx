'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
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
 * Renders an SVG logo as a black hole with subtle violet glow effect.
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
  const [mounted, setMounted] = useState(false)

  // Only enable animations after hydration to prevent SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate numeric size from preset or direct number
  let numericSize: number
  if (typeof size === 'number') {
    // Clamp to minimum size
    numericSize = Math.max(size, MIN_SIZE)
  } else {
    numericSize = getSizeValue(size)
  }

  // Determine if animation should be applied (only after mount)
  const shouldAnimate = mounted && !isStatic && !prefersReducedMotion

  return (
    <svg
      width={numericSize}
      height={numericSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VoidPay Logo"
      className={cn('relative', shouldAnimate && 'animate-blackhole-pulse', className)}
    >
      <defs>
        {/* Subtle glow filter */}
        <filter id="subtle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Тонкое свечение контура — фирменный violet */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="#7C3AED"
        strokeWidth="1"
        opacity="0.4"
        filter="url(#subtle-glow)"
      />

      {/* Основной контур — тонкий, subtle */}
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke="#7C3AED"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Черная дыра — абсолютный void */}
      <circle cx="50" cy="50" r="31" fill="#09090B" />

      {/* Глубокий центр */}
      <circle cx="50" cy="50" r="22" fill="#000000" />
    </svg>
  )
}
