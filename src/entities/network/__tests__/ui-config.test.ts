import { describe, it, expect } from 'vitest'
import { NETWORK_BADGES, BLOCK_EXPLORERS, NETWORK_SHADOWS } from '../config/ui-config'

describe('Network UI Config Extensions', () => {
  it('has badges for all supported networks', () => {
    const supportedIds = [1, 42161, 10, 137]
    supportedIds.forEach((id) => {
      const badge = NETWORK_BADGES[id]
      expect(badge).toBeDefined()
      expect(badge!.variant).toBeDefined()
    })
  })

  it('has block explorers for all supported networks', () => {
    const supportedIds = [1, 42161, 10, 137]
    supportedIds.forEach((id) => {
      const explorer = BLOCK_EXPLORERS[id]
      expect(explorer).toBeDefined()
      expect(explorer!.name).toBeDefined()
      expect(explorer!.url).toContain('http')
    })
  })

  it('has shadows for all supported networks', () => {
    const supportedIds = [1, 42161, 10, 137]
    supportedIds.forEach((id) => {
      const shadow = NETWORK_SHADOWS[id]
      expect(shadow).toBeDefined()
      expect(shadow!).toContain('shadow')
    })
  })
})
