/**
 * AuroraText Component Contract
 *
 * Animated gradient text effect using background-clip.
 * Cycles through violet/indigo/purple colors with aurora-like animation.
 */

import type { ElementType, HTMLAttributes, ReactNode } from 'react'

/**
 * Allowed HTML elements for polymorphic rendering
 */
export type AuroraTextElement = 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'

export interface AuroraTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Text content to display with aurora effect
   */
  children: ReactNode

  /**
   * HTML element to render as (polymorphic)
   * @default 'span'
   */
  as?: AuroraTextElement
}

/**
 * Design tokens for AuroraText
 */
export const AURORA_TEXT_TOKENS = {
  /** Gradient colors (violet-500, indigo-400, purple-500) */
  gradient: 'linear-gradient(90deg, #8b5cf6, #6366f1, #a855f7, #8b5cf6)',
  /** Background size for animation (200% to allow movement) */
  backgroundSize: '200% auto',
  /** Animation duration */
  animationDuration: '8s',
  /** Drop shadow color */
  shadowColor: 'rgba(139, 92, 246, 0.3)',
  /** Drop shadow offset */
  shadowOffset: '0 2px 4px',
} as const

/**
 * Component requirements (FR-019 to FR-022):
 *
 * FR-019: Apply animated background gradient using bg-clip-text
 * FR-020: Gradient cycles through violet-500, indigo-400, purple-500
 * FR-021: Animation uses background-position keyframes at 200% width
 * FR-022: Apply subtle violet drop shadow
 */

/**
 * Tailwind classes for AuroraText
 */
export const AURORA_TEXT_CLASSES = {
  base: 'bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-indigo-400 to-purple-500',
  animation: 'animate-aurora bg-[length:200%_auto]',
  shadow: 'drop-shadow-[0_2px_4px_rgba(139,92,246,0.3)]',
} as const
