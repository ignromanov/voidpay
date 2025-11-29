'use client'

import { cn } from '@/lib/utils'
import { useReducedMotion } from './hooks/use-reduced-motion'

interface VoidButtonOverlayProps {
  isLoading?: boolean
  isDisabled?: boolean
}

/**
 * Accretion disk overlay for void button variant
 *
 * Renders a conic gradient spinning disk with event horizon mask.
 * Animation speed varies by state: idle (6s), hover (2s), loading (0.5s).
 */
export function VoidButtonOverlay({ isLoading, isDisabled }: VoidButtonOverlayProps) {
  const prefersReducedMotion = useReducedMotion()

  if (isDisabled || prefersReducedMotion) {
    // No accretion disk when disabled or reduced motion
    return null
  }

  const animationClass = isLoading
    ? 'animate-accretion-loading'
    : 'animate-accretion-idle group-hover:animate-accretion-hover'

  return (
    <>
      {/* Accretion disk layer */}
      <div
        data-accretion-disk
        className={cn(
          'absolute inset-0 rounded-md opacity-50',
          'bg-accretion-disk',
          animationClass,
          isLoading && 'opacity-100'
        )}
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            #7C3AED 90deg,
            #FFFFFF 180deg,
            #7C3AED 270deg,
            transparent 360deg
          )`,
          maskImage: 'radial-gradient(circle, transparent 30%, black 40%, black 100%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 30%, black 40%, black 100%)',
        }}
      />

      {/* Event horizon (black center) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-md"
        style={{
          background: 'radial-gradient(circle, #000 0%, #000 35%, transparent 40%)',
        }}
      />

      {/* Glow layer */}
      <div
        className={cn(
          'absolute inset-0 rounded-md opacity-40 blur-md',
          isLoading && 'opacity-70 blur-lg'
        )}
        style={{
          background: 'radial-gradient(circle, #7C3AED, transparent 70%)',
        }}
      />
    </>
  )
}
