/**
 * NetworkBackground Widget Contract
 *
 * Full-viewport ambient background with network-themed floating shapes.
 * Uses Framer Motion for animations and AnimatePresence for theme transitions.
 */

import type { HTMLAttributes } from 'react'

/**
 * Supported blockchain network themes
 */
export type NetworkTheme = 'arbitrum' | 'optimism' | 'polygon' | 'ethereum' | 'base' | 'voidpay'

/**
 * Shape types per network theme
 */
export type ShapeType = 'triangle' | 'circle' | 'hexagon' | 'rhombus' | 'blob'

/**
 * Animation types per network theme
 */
export type AnimationType = 'float' | 'pulse' | 'rotate' | 'sway' | 'drift' | 'morph'

/**
 * Theme configuration structure
 */
export interface ThemeConfig {
  primary: string
  secondary: string
  shape: ShapeType
  animation: AnimationType
  shapeCount: number
}

/**
 * Network theme color and animation configurations
 */
export const NETWORK_THEMES: Record<NetworkTheme, ThemeConfig> = {
  arbitrum: {
    primary: '#12AAFF',
    secondary: '#28A0F0',
    shape: 'triangle',
    animation: 'float',
    shapeCount: 8,
  },
  optimism: {
    primary: '#FF0420',
    secondary: '#FF5C5C',
    shape: 'circle',
    animation: 'pulse',
    shapeCount: 8,
  },
  polygon: {
    primary: '#8247E5',
    secondary: '#A77CF2',
    shape: 'hexagon',
    animation: 'rotate',
    shapeCount: 6,
  },
  ethereum: {
    primary: '#627EEA',
    secondary: '#8B9EF5',
    shape: 'rhombus',
    animation: 'sway',
    shapeCount: 8,
  },
  base: {
    primary: '#0052FF',
    secondary: '#3D7DFF',
    shape: 'circle',
    animation: 'drift',
    shapeCount: 6,
  },
  voidpay: {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    shape: 'blob',
    animation: 'morph',
    shapeCount: 10,
  },
} as const

export interface NetworkBackgroundProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Network theme controlling colors and shape type
   * Falls back to 'ethereum' for unknown values
   * @default 'ethereum'
   */
  theme?: NetworkTheme
}

/**
 * Component requirements (FR-005 to FR-010):
 *
 * FR-005: Support 6 theme variants
 * FR-006: Each theme renders unique shapes with network-specific colors
 * FR-007: Shapes animate continuously with blur and opacity effects
 * FR-008: Theme transitions crossfade over 1.5 seconds via AnimatePresence
 * FR-009: Include noise texture overlay and vignette layer for readability
 * FR-010: Fixed position, full viewport, pointer-events-none, z-index 0
 */

export const NETWORK_BACKGROUND_TOKENS = {
  /** Theme transition duration */
  transitionDuration: 1.5,
  /** Base z-index for background layer */
  zIndex: 0,
  /** Noise texture opacity */
  noiseOpacity: 0.03,
  /** Vignette gradient strength */
  vignetteStrength: 0.5,
} as const
