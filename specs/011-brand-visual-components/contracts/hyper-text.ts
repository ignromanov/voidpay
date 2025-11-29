/**
 * HyperText Component Contract
 *
 * Character-by-character scramble reveal animation.
 * Creates a "decryption" effect useful for revealing text dynamically.
 */

import type { HTMLAttributes } from 'react'

export interface HyperTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Text to display with scramble effect
   */
  text: string

  /**
   * Total animation duration in milliseconds
   * @default 300
   * @min 50
   * @max 5000
   */
  duration?: number

  /**
   * Trigger animation on initial mount
   * @default true
   */
  animateOnLoad?: boolean

  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void
}

/**
 * Character pool for scramble effect
 * Only uppercase alphanumeric for consistency
 */
export const SCRAMBLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Characters that remain static during animation (prevent layout shift)
 */
export const STATIC_CHARACTERS = /[\s.,!?;:'"()\-\[\]{}]/

/**
 * Design tokens for HyperText
 */
export const HYPER_TEXT_TOKENS = {
  /** Default animation duration */
  defaultDuration: 300,
  /** Minimum duration (prevents too-fast animation) */
  minDuration: 50,
  /** Maximum duration (prevents infinite-feeling animation) */
  maxDuration: 5000,
  /** Scramble character pool */
  characters: SCRAMBLE_CHARACTERS,
  /** Static character pattern */
  staticPattern: STATIC_CHARACTERS,
} as const

/**
 * Component requirements (FR-023 to FR-027):
 *
 * FR-023: Scramble text characters during reveal animation
 * FR-024: Reveal progresses character-by-character from start to end
 * FR-025: Spaces, periods, commas remain static during animation
 * FR-026: Duration prop controls total animation time
 * FR-027: animateOnLoad prop allows disabling initial animation
 */

/**
 * Animation state type
 */
export type HyperTextState = 'idle' | 'animating' | 'complete'

/**
 * Hook return type for useHyperText
 */
export interface UseHyperTextResult {
  /** Current displayed text (may include scrambled characters) */
  displayText: string
  /** Current animation state */
  state: HyperTextState
  /** Trigger a new animation */
  triggerAnimation: () => void
  /** Whether animation is currently running */
  isAnimating: boolean
}
