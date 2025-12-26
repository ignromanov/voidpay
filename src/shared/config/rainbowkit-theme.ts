/**
 * RainbowKit Theme Configuration for VoidPay
 *
 * Custom dark theme with Electric Violet (#7C3AED) accent color
 * matching VoidPay's design system.
 *
 * Moved to shared/config for FSD compliance - app layer can import
 * configuration from shared without going through features.
 *
 * @see https://www.rainbowkit.com/docs/custom-theme
 */

import { darkTheme } from '@rainbow-me/rainbowkit'

/**
 * Type for RainbowKit theme variables
 * Inferred from darkTheme() return type since ThemeVars isn't exported
 */
type ThemeVars = ReturnType<typeof darkTheme>

/**
 * VoidPay's primary accent color (Electric Violet)
 * Used throughout the application for interactive elements
 */
export const VOIDPAY_ACCENT_COLOR = '#7C3AED'

/**
 * VoidPay brand colors
 */
export const VOIDPAY_COLORS = {
  accent: VOIDPAY_ACCENT_COLOR,
  accentForeground: '#FFFFFF',
  background: '#09090b', // zinc-950
  modalBackground: '#18181b', // zinc-900
  text: '#fafafa', // zinc-50
  textSecondary: '#a1a1aa', // zinc-400
} as const

/**
 * Custom RainbowKit theme for VoidPay
 *
 * Based on darkTheme with Electric Violet accent and Geist font family.
 * Follows VoidPay's Hybrid Theme Strategy (dark desk, light paper).
 */
export const voidPayTheme: ThemeVars = darkTheme({
  accentColor: VOIDPAY_ACCENT_COLOR,
  accentColorForeground: VOIDPAY_COLORS.accentForeground,
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
})

// Override specific theme values for VoidPay styling
voidPayTheme.colors.modalBackground = VOIDPAY_COLORS.modalBackground
voidPayTheme.fonts.body = 'var(--font-geist-sans), system-ui, sans-serif'

/**
 * Create a customized VoidPay theme with optional overrides
 *
 * @param overrides - Partial theme overrides
 * @returns Customized theme
 */
export function createVoidPayTheme(overrides?: Partial<ThemeVars>): ThemeVars {
  return {
    ...voidPayTheme,
    ...overrides,
    colors: {
      ...voidPayTheme.colors,
      ...(overrides?.colors ?? {}),
    },
    fonts: {
      ...voidPayTheme.fonts,
      ...(overrides?.fonts ?? {}),
    },
    radii: {
      ...voidPayTheme.radii,
      ...(overrides?.radii ?? {}),
    },
    shadows: {
      ...voidPayTheme.shadows,
      ...(overrides?.shadows ?? {}),
    },
  }
}
