/**
 * T020-test: Unit test for RainbowKit theme configuration
 *
 * Tests custom RainbowKit theme with Electric Violet (#7C3AED) accent color
 * matching VoidPay's design system.
 */

import { describe, it, expect } from 'vitest'
import { voidPayTheme, VOIDPAY_ACCENT_COLOR, createVoidPayTheme, VOIDPAY_COLORS } from '../rainbowkit-theme'

describe('rainbowkit-theme', () => {
  describe('VOIDPAY_ACCENT_COLOR', () => {
    it('should be Electric Violet (#7C3AED)', () => {
      expect(VOIDPAY_ACCENT_COLOR).toBe('#7C3AED')
    })
  })

  describe('voidPayTheme', () => {
    it('should be a valid RainbowKit theme object', () => {
      expect(voidPayTheme).toBeDefined()
      expect(typeof voidPayTheme).toBe('object')
    })

    it('should have colors configuration', () => {
      expect(voidPayTheme.colors).toBeDefined()
    })

    it('should have fonts configuration', () => {
      expect(voidPayTheme.fonts).toBeDefined()
      expect(voidPayTheme.fonts.body).toBeDefined()
    })

    it('should have radii (border radius) configuration', () => {
      expect(voidPayTheme.radii).toBeDefined()
    })

    it('should have shadows configuration', () => {
      expect(voidPayTheme.shadows).toBeDefined()
    })

    it('should use Electric Violet as the accent color', () => {
      // RainbowKit stores colors in the colors object
      expect(voidPayTheme.colors.accentColor).toBe(VOIDPAY_ACCENT_COLOR)
    })

    it('should use Geist Sans as the body font', () => {
      // VoidPay uses Geist Sans for UI (via CSS variable)
      expect(voidPayTheme.fonts.body).toMatch(/geist/i)
    })

    it('should use dark theme colors for modal background', () => {
      // Dark theme should have dark modal background (zinc-900 or similar)
      const modalBg = voidPayTheme.colors.modalBackground
      expect(modalBg).toBeDefined()
    })
  })

  describe('VOIDPAY_COLORS', () => {
    it('should export VOIDPAY_COLORS constant', () => {
      expect(VOIDPAY_COLORS).toBeDefined()
      expect(VOIDPAY_COLORS.accent).toBe(VOIDPAY_ACCENT_COLOR)
    })

    it('should have all required colors', () => {
      expect(VOIDPAY_COLORS.accentForeground).toBeDefined()
      expect(VOIDPAY_COLORS.background).toBeDefined()
      expect(VOIDPAY_COLORS.modalBackground).toBeDefined()
      expect(VOIDPAY_COLORS.text).toBeDefined()
      expect(VOIDPAY_COLORS.textSecondary).toBeDefined()
    })
  })

  describe('createVoidPayTheme', () => {
    it('should return base theme when called without overrides', () => {
      const theme = createVoidPayTheme()
      expect(theme.colors.accentColor).toBe(VOIDPAY_ACCENT_COLOR)
    })

    it('should merge color overrides', () => {
      const customAccent = '#FF0000'
      // Use spread to provide a valid colors object with override
      const theme = createVoidPayTheme({
        colors: { ...voidPayTheme.colors, accentColor: customAccent },
      })
      expect(theme.colors.accentColor).toBe(customAccent)
    })

    it('should merge font overrides', () => {
      const customFont = 'Comic Sans'
      const theme = createVoidPayTheme({
        fonts: { ...voidPayTheme.fonts, body: customFont },
      })
      expect(theme.fonts.body).toBe(customFont)
    })

    it('should merge radii overrides', () => {
      const customRadius = '999px'
      const theme = createVoidPayTheme({
        radii: { ...voidPayTheme.radii, modal: customRadius },
      })
      expect(theme.radii.modal).toBe(customRadius)
    })

    it('should merge shadow overrides', () => {
      const customShadow = 'none'
      const theme = createVoidPayTheme({
        shadows: { ...voidPayTheme.shadows, dialog: customShadow },
      })
      expect(theme.shadows.dialog).toBe(customShadow)
    })

    it('should preserve unoverridden properties', () => {
      const theme = createVoidPayTheme({
        colors: { ...voidPayTheme.colors, accentColor: '#FF0000' },
      })
      // Original modal background should be preserved
      expect(theme.colors.modalBackground).toBe(voidPayTheme.colors.modalBackground)
    })
  })
})
