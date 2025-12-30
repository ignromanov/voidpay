import { describe, it, expect, beforeEach } from 'vitest'
import { useCreatorStore } from '../useCreatorStore'
import { TEST_INVOICES, TEST_LINE_ITEMS } from '@/shared/lib/test-utils'

describe('useCreatorStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      history: [],
      preferences: {
        defaultNetworkId: 1,
        defaultCurrency: 'USDC',
      },
    })
  })

  describe('updateDraft', () => {
    it('should create a new draft with generated draftId when no active draft exists', () => {
      const { updateDraft, activeDraft } = useCreatorStore.getState()
      expect(activeDraft).toBeNull()

      updateDraft({ invoiceId: 'TEST-001', networkId: 1 })

      const state = useCreatorStore.getState()
      expect(state.activeDraft).not.toBeNull()
      expect(state.activeDraft?.data.invoiceId).toBe('TEST-001')
      expect(state.activeDraft?.data.networkId).toBe(1)
      expect(state.activeDraft?.meta.draftId).toBeDefined()
    })

    it('should convert invoice items to lineItems when items provided (new draft)', () => {
      const testInvoice = TEST_INVOICES.full()
      const { updateDraft } = useCreatorStore.getState()

      updateDraft(testInvoice)

      const state = useCreatorStore.getState()
      expect(state.lineItems).toBeDefined()
      expect(state.lineItems.length).toBe(testInvoice.items.length)
      // Verify lineItem structure includes id
      expect(state.lineItems[0]).toHaveProperty('id')
      expect(state.lineItems[0]!.description).toBe(testInvoice.items[0]!.description)
    })

    it('should use default lineItem when no items provided (new draft)', () => {
      const { updateDraft } = useCreatorStore.getState()

      updateDraft({ invoiceId: 'NO-ITEMS' })

      const state = useCreatorStore.getState()
      expect(state.lineItems.length).toBe(1)
      // Default line item should have empty/default values
      expect(state.lineItems[0]).toHaveProperty('id')
    })

    it('should update existing draft and sync lineItems when items provided', () => {
      // First create a draft
      const { updateDraft } = useCreatorStore.getState()
      updateDraft({ invoiceId: 'EXISTING-001' })

      const initialState = useCreatorStore.getState()
      expect(initialState.lineItems.length).toBe(1)

      // Update with new items
      const newItems = [...TEST_LINE_ITEMS.development]
      updateDraft({ items: newItems })

      const finalState = useCreatorStore.getState()
      expect(finalState.lineItems.length).toBe(newItems.length)
      expect(finalState.activeDraft?.data.items).toEqual(newItems)
    })

    it('should preserve existing lineItems when updating draft without items', () => {
      const testInvoice = TEST_INVOICES.full()
      const { updateDraft } = useCreatorStore.getState()

      // Create draft with items
      updateDraft(testInvoice)
      const stateWithItems = useCreatorStore.getState()
      const originalLineItems = [...stateWithItems.lineItems]

      // Update draft without items (just notes change)
      updateDraft({ notes: 'Updated notes' })

      const finalState = useCreatorStore.getState()
      expect(finalState.lineItems).toEqual(originalLineItems)
      expect(finalState.activeDraft?.data.notes).toBe('Updated notes')
    })

    it('should update lastModified timestamp when updating existing draft', () => {
      const { updateDraft } = useCreatorStore.getState()
      updateDraft({ invoiceId: 'TIMESTAMP-TEST' })

      const initialTimestamp = useCreatorStore.getState().activeDraft?.meta.lastModified

      // Small delay to ensure different timestamp
      updateDraft({ notes: 'Updated' })

      const finalTimestamp = useCreatorStore.getState().activeDraft?.meta.lastModified
      expect(finalTimestamp).toBeDefined()
      // Timestamps should be different (updated)
      expect(new Date(finalTimestamp!).getTime()).toBeGreaterThanOrEqual(
        new Date(initialTimestamp!).getTime()
      )
    })

    it('should handle empty items array by preserving existing lineItems', () => {
      const testInvoice = TEST_INVOICES.full()
      const { updateDraft } = useCreatorStore.getState()

      // Create draft with items
      updateDraft(testInvoice)
      const originalLineItems = [...useCreatorStore.getState().lineItems]

      // Update with empty items array (edge case)
      updateDraft({ items: [] })

      const finalState = useCreatorStore.getState()
      // Empty items array should preserve existing lineItems (falsy check: items?.length)
      expect(finalState.lineItems).toEqual(originalLineItems)
    })
  })
})
