'use client'

import { cn } from '@/lib/utils'
import { useHyperText } from './hooks/use-hyper-text'

export interface HyperTextProps {
  /** Text to display with scramble effect */
  text: string
  /** Total animation duration in milliseconds */
  duration?: number
  /** Trigger animation on initial mount */
  animateOnLoad?: boolean
  /** Custom CSS classes */
  className?: string
  /** Callback when animation completes */
  onAnimationComplete?: () => void
}

/**
 * HyperText component - Character scramble reveal animation
 *
 * Reveals text character-by-character with scrambling effect.
 * Static characters (spaces, punctuation) are never scrambled.
 * Re-animates automatically when text prop changes.
 *
 * @component
 * @example
 * ```tsx
 * // Default (animated on load)
 * <HyperText text="Welcome" />
 *
 * // Custom duration
 * <HyperText text="Fast reveal" duration={150} />
 *
 * // No animation on load
 * <HyperText text="Static" animateOnLoad={false} />
 *
 * // With completion callback
 * <HyperText
 *   text="Done!"
 *   onAnimationComplete={() => console.log('Finished')}
 * />
 * ```
 */
export function HyperText({
  text,
  duration = 300,
  animateOnLoad = true,
  className,
  onAnimationComplete,
}: HyperTextProps) {
  const { displayText } = useHyperText(text, duration, animateOnLoad, onAnimationComplete)

  return (
    <span className={cn('inline-block font-mono tracking-wide', className)}>{displayText}</span>
  )
}
