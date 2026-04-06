/**
 * T040-test: Unit test for network theme colors
 *
 * Tests the color themes for each supported network.
 */

import { describe, it, expect } from 'vitest'
import { NETWORK_THEMES, getNetworkTheme, getNetworkThemeColor, DEFAULT_NETWORK_THEME } from '../network-themes'
import { NETWORK_PALETTE } from '@/shared/ui/constants/network-palette'

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

    it('should have theme for Base', () => {
      const theme = NETWORK_THEMES[8453]
      expect(theme).toBeDefined()
      expect(theme?.name).toBe('Base')
      expect(theme?.primary).toBe('#0052FF')
    })

    it('should have distinct primary colors for each mainnet', () => {
      const eth = NETWORK_THEMES[1]
      const arb = NETWORK_THEMES[42161]
      const op = NETWORK_THEMES[10]
      const poly = NETWORK_THEMES[137]
      const base = NETWORK_THEMES[8453]
      const colors = [eth!.primary, arb!.primary, op!.primary, poly!.primary, base!.primary]
      expect(new Set(colors).size).toBe(5)
    })

    it('should derive testnet themes from mainnet parents via withTestnets', () => {
      expect(NETWORK_THEMES[11155111]?.primary).toBe(NETWORK_THEMES[1]?.primary)
      expect(NETWORK_THEMES[84532]?.primary).toBe(NETWORK_THEMES[8453]?.primary)
      expect(NETWORK_THEMES[421614]?.primary).toBe(NETWORK_THEMES[42161]?.primary)
    })

    it('should derive colors from canonical NETWORK_PALETTE', () => {
      expect(NETWORK_THEMES[8453]?.primary).toBe(NETWORK_PALETTE.base.primary)
      expect(NETWORK_THEMES[42161]?.primary).toBe(NETWORK_PALETTE.arbitrum.primary)
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

    it('should return theme for testnet chain IDs', () => {
      const baseSepoliaTheme = getNetworkTheme(84532)
      expect(baseSepoliaTheme).toBeDefined()
      expect(baseSepoliaTheme?.primary).toBe('#0052FF')
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
      expect(color).toBe(DEFAULT_NETWORK_THEME.primary)
    })
  })
})
