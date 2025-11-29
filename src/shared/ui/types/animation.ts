/**
 * Animation utility types for brand visual components
 * @module shared/ui/types/animation
 */

/**
 * Animation state for components with multiple animation speeds
 */
export type AnimationState = 'idle' | 'hover' | 'loading' | 'disabled'

/**
 * Reduced motion preference from user system settings
 */
export type MotionPreference = 'no-preference' | 'reduce'

/**
 * Animation duration presets in milliseconds
 */
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
  // Component-specific durations
  auroraCycle: 8000,
  accretionIdle: 6000,
  accretionHover: 2000,
  accretionLoading: 500,
  crescentPulse: 3000,
  networkTransition: 1500,
} as const

/**
 * Easing functions for animations
 */
export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring'

/**
 * Props for components that support reduced motion
 */
export interface ReducedMotionProps {
  /**
   * Force disable all animations (overrides system preference)
   */
  disableAnimations?: boolean
}

/**
 * Generic animation config for reusable patterns
 */
export interface AnimationConfig {
  duration: number
  easing: AnimationEasing
  delay?: number
  repeat?: boolean | number
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}
