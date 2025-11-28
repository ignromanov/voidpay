/**
 * T040-test: Unit test for network theme colors
 *
 * Tests the color themes for each supported network.
 */

import { describe, it, expect } from 'vitest'
import {
  NETWORK_THEMES,
  getNetworkTheme,
  getNetworkThemeColor,
} from '../network-themes'

describe('network-themes', () => {
  describe('NETWORK_THEMES', () => {
    it('should have theme for Ethereum mainnet', () => {
      const theme = NETWORK_THEMES[1]
      expect(theme).toBeDefined()
      expect(theme?.name).toBe('Ethereum')
    })

    it('should have theme for Arbitrum', () => {
      const theme = NETWORK_THEMES[42161]
      expect(theme).toBeDefined()
      expect(theme?.name).toBe('Arbitrum')
    })

    it('should have theme for Optimism', () => {
      const theme = NETWORK_THEMES[10]
      expect(theme).toBeDefined()
      expect(theme?.name).toBe('Optimism')
    })

    it('should have theme for Polygon', () => {
      const theme = NETWORK_THEMES[137]
      expect(theme).toBeDefined()
      expect(theme?.name).toBe('Polygon')
    })

    it('should have distinct primary colors for each network', () => {
      const eth = NETWORK_THEMES[1]
      const arb = NETWORK_THEMES[42161]
      const op = NETWORK_THEMES[10]
      const poly = NETWORK_THEMES[137]
      expect(eth).toBeDefined()
      expect(arb).toBeDefined()
      expect(op).toBeDefined()
      expect(poly).toBeDefined()
      const colors = [eth!.primary, arb!.primary, op!.primary, poly!.primary]
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(4)
    })
  })

  describe('getNetworkTheme', () => {
    it('should return correct theme for known chain IDs', () => {
      const ethTheme = getNetworkTheme(1)
      expect(ethTheme).toBeDefined()
      expect(ethTheme?.name).toBe('Ethereum')
    })

    it('should return undefined for unknown chain IDs', () => {
      const unknownTheme = getNetworkTheme(999999)
      expect(unknownTheme).toBeUndefined()
    })
  })

  describe('getNetworkThemeColor', () => {
    it('should return primary color for known chain', () => {
      const color = getNetworkThemeColor(1, 'primary')
      expect(color).toBeDefined()
      expect(typeof color).toBe('string')
    })

    it('should return fallback for unknown chain', () => {
      const color = getNetworkThemeColor(999999, 'primary')
      expect(color).toBeDefined() // Should return default fallback
    })
  })
})
