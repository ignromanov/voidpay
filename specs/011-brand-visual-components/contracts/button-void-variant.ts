/**
 * Button void Variant Contract
 *
 * Black hole visual metaphor with spinning accretion disk,
 * event horizon mask, and gravity-responsive animations.
 */

import type { VariantProps } from 'class-variance-authority'

/**
 * Animation states for void button
 */
export type VoidButtonState = 'idle' | 'hover' | 'loading' | 'disabled'

/**
 * Animation timing per state
 */
export const VOID_BUTTON_TIMINGS: Record<VoidButtonState, string> = {
  idle: '6s',
  hover: '2s',
  loading: '0.5s',
  disabled: '0s', // No animation
} as const

/**
 * Extended button variants including void
 */
export const BUTTON_VARIANTS = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline:
    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
  void: 'relative bg-black text-white overflow-hidden hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]',
} as const

/**
 * Void button layer structure (z-order bottom to top):
 * 1. Accretion disk (conic gradient, rotating)
 * 2. Event horizon (black circle mask)
 * 3. Content layer (text/icons)
 */
export interface VoidButtonLayers {
  accretionDisk: {
    gradient: string
    rotation: string
    blur: string
  }
  eventHorizon: {
    background: string
    size: string
  }
  content: {
    hoverScale: number
  }
}

export const VOID_BUTTON_LAYERS: VoidButtonLayers = {
  accretionDisk: {
    gradient:
      'conic-gradient(from 0deg, transparent 0deg, #7C3AED 90deg, white 180deg, #7C3AED 270deg, transparent 360deg)',
    rotation: 'animate-accretion-idle',
    blur: 'blur-[2px]',
  },
  eventHorizon: {
    background: 'bg-black',
    size: 'inset-[4px]', // Creates black center
  },
  content: {
    hoverScale: 0.95, // Simulates gravitational pull
  },
} as const

/**
 * Component requirements (FR-011 to FR-018):
 *
 * FR-011: Integrate with existing Button variant system
 * FR-012: Accretion disk uses conic gradient pattern
 * FR-013: Idle state: 6s rotation, moderate glow
 * FR-014: Hover state: 2s rotation, intense glow, suction shadow
 * FR-015: Loading state: 0.5s rotation, expanded glow, pulsing content
 * FR-016: Disabled state: No disk, grayscale, reduced opacity
 * FR-017: Event horizon mask above accretion disk
 * FR-018: Content scales to 0.95 on hover (gravitational compression)
 */

/**
 * CSS classes for void button states
 */
export const VOID_STATE_CLASSES: Record<VoidButtonState, string> = {
  idle: '[&_.accretion]:animate-accretion-idle [&_.accretion]:opacity-60',
  hover: '[&_.accretion]:animate-accretion-hover [&_.accretion]:opacity-100 [&_.content]:scale-95',
  loading:
    '[&_.accretion]:animate-accretion-loading [&_.accretion]:opacity-100 [&_.content]:animate-pulse',
  disabled: '[&_.accretion]:hidden grayscale opacity-50',
} as const
