/**
 * Brand design tokens for VoidPay visual components
 * @module shared/ui/constants/brand-tokens
 */

/**
 * Network theme identifier
 */
export type NetworkTheme = 'ethereum' | 'arbitrum' | 'optimism' | 'polygon'

/**
 * Shape types for network backgrounds
 */
export type ShapeType = 'triangle' | 'circle' | 'hexagon' | 'rhombus' | 'blob'

/**
 * Animation patterns for background shapes
 */
export type AnimationPattern = 'float' | 'pulse' | 'rotate' | 'sway' | 'drift' | 'morph'

/**
 * Theme configuration for network backgrounds
 */
export interface ThemeConfig {
  /** Primary color for the theme */
  primary: string
  /** Secondary color for the theme */
  secondary: string
  /** Shape type to render */
  shape: ShapeType
  /** Animation pattern */
  animation: AnimationPattern
  /** Number of shapes to render */
  shapeCount: number
}

/**
 * Network theme color and shape configurations
 * Used by NetworkBackground widget
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
} as const

/**
 * Size presets for logo components
 */
export const SIZE_PRESETS = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
} as const

/**
 * Size preset keys
 */
export type SizePreset = keyof typeof SIZE_PRESETS

/**
 * CSS custom property names for brand components
 */
export const CSS_VARS = {
  // VoidLogo
  voidLogoGlow: '--void-logo-glow',
  voidLogoPulseDuration: '--void-logo-pulse-duration',

  // Button void
  accretionDiskIdleDuration: '--accretion-disk-idle-duration',
  accretionDiskHoverDuration: '--accretion-disk-hover-duration',
  accretionDiskLoadingDuration: '--accretion-disk-loading-duration',

  // AuroraText
  auroraGradient: '--aurora-gradient',
  auroraAnimationDuration: '--aurora-animation-duration',

  // NetworkBackground
  networkTransitionDuration: '--network-transition-duration',
} as const

/**
 * Aurora gradient color stops
 * Used for AuroraText component
 */
export const AURORA_GRADIENT = 'linear-gradient(90deg, #8b5cf6, #6366f1, #a855f7, #8b5cf6)' as const

/**
 * VoidLogo glow color with opacity
 */
export const VOID_LOGO_GLOW = 'rgba(124, 58, 237, 0.6)' as const

/**
 * Electric Violet brand color
 */
export const ELECTRIC_VIOLET = '#7C3AED' as const

/**
 * Validation: Check if a string is a valid NetworkTheme
 */
export function isValidNetworkTheme(theme: string): theme is NetworkTheme {
  return theme in NETWORK_THEMES
}

/**
 * Validation: Check if a number or preset is valid for size
 */
export function isValidSize(size: string | number): boolean {
  if (typeof size === 'number') {
    return size > 0
  }
  return size in SIZE_PRESETS
}

/**
 * Get numeric size from preset or number
 */
export function getSizeValue(size: SizePreset | number): number {
  if (typeof size === 'number') {
    return size
  }
  return SIZE_PRESETS[size]
}
