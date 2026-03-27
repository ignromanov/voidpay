import { describe, it, expect, beforeEach } from 'vitest'
import { useCreatorStore } from '../../useCreatorStore'

describe('utilitySlice', () => {
  beforeEach(() => {
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      preferences: { includeOgImage: true, magicDustEnabled: true },
      idCounter: { currentValue: 1, prefix: 'INV' },
    })
  })

  describe('clearAllData', () => {
    it('resets store to initial state', () => {
      // Populate store with data
      useCreatorStore.setState({
        activeDraft: {
          meta: { draftId: 'test-123', lastModified: '2024-01-01' },
          data: { invoiceId: 'INV-999', networkId: 42161 },
        },
        lineItems: [{ id: '1', description: 'test', quantity: 1, rate: '100' }],
        idCounter: { currentValue: 99, prefix: 'BILL' },
      })

      const { clearAllData } = useCreatorStore.getState()
      clearAllData()

      const state = useCreatorStore.getState()
      expect(state.activeDraft).toBeNull()
      expect(state.lineItems).toEqual([])
      expect(state.templates).toEqual([])
      expect(state.idCounter.currentValue).toBe(1)
      expect(state.idCounter.prefix).toBe('INV')
    })
  })
})
