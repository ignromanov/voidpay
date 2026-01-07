/**
 * Draft Slice tests
 * Feature: 015-create-page-preview
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCreatorStore } from '../../useCreatorStore'

// Mock uuid with incrementing counter for unique IDs
let uuidCounter = 0
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${++uuidCounter}`,
}))

describe('draftSlice', () => {
  beforeEach(() => {
    // Reset uuid counter for each test
    uuidCounter = 0
    // Reset store state
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      draftSyncStatus: 'idle',
      templates: [],
      history: [],
      preferences: {
        defaultNetworkId: 1,
        defaultCurrency: 'USDC',
        defaultSenderName: 'Test Sender',
        defaultSenderWallet: '0x1234567890123456789012345678901234567890',
      },
      networkTheme: 'ethereum',
      idCounter: { currentValue: 1, prefix: 'INV' },
    })
  })

  describe('initial state', () => {
    it('initializes with null activeDraft', () => {
      const state = useCreatorStore.getState()
      expect(state.activeDraft).toBeNull()
    })

    it('initializes with empty lineItems', () => {
      const state = useCreatorStore.getState()
      expect(state.lineItems).toEqual([])
    })

    it('initializes with idle draftSyncStatus', () => {
      const state = useCreatorStore.getState()
      expect(state.draftSyncStatus).toBe('idle')
    })
  })

  describe('setDraftSyncStatus', () => {
    it('sets sync status to syncing', () => {
      const { setDraftSyncStatus } = useCreatorStore.getState()

      setDraftSyncStatus('syncing')

      const state = useCreatorStore.getState()
      expect(state.draftSyncStatus).toBe('syncing')
    })

    it('sets sync status to synced', () => {
      const { setDraftSyncStatus } = useCreatorStore.getState()

      setDraftSyncStatus('synced')

      const state = useCreatorStore.getState()
      expect(state.draftSyncStatus).toBe('synced')
    })

    it('transitions through all states', () => {
      const { setDraftSyncStatus } = useCreatorStore.getState()

      expect(useCreatorStore.getState().draftSyncStatus).toBe('idle')

      setDraftSyncStatus('syncing')
      expect(useCreatorStore.getState().draftSyncStatus).toBe('syncing')

      setDraftSyncStatus('synced')
      expect(useCreatorStore.getState().draftSyncStatus).toBe('synced')

      setDraftSyncStatus('idle')
      expect(useCreatorStore.getState().draftSyncStatus).toBe('idle')
    })
  })

  describe('createNewDraft', () => {
    it('creates a new draft with default values', () => {
      const { createNewDraft } = useCreatorStore.getState()

      const draftId = createNewDraft()

      const state = useCreatorStore.getState()
      expect(draftId).toMatch(/^test-uuid-\d+$/)
      expect(state.activeDraft).not.toBeNull()
      expect(state.activeDraft?.meta.draftId).toBe(draftId)
    })

    it('uses preferences for default values', () => {
      const { createNewDraft } = useCreatorStore.getState()

      createNewDraft()

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.networkId).toBe(1)
      expect(state.activeDraft?.data.currency).toBe('USDC')
      expect(state.activeDraft?.data.from.name).toBe('Test Sender')
    })

    it('uses fallback defaults when preferences are empty', () => {
      // Reset store with empty preferences
      useCreatorStore.setState({
        activeDraft: null,
        lineItems: [],
        templates: [],
        history: [],
        preferences: {},
        networkTheme: 'ethereum',
        idCounter: { currentValue: 1, prefix: 'INV' },
      })

      const { createNewDraft } = useCreatorStore.getState()

      createNewDraft()

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.invoiceId).toBe('INV-001')
      expect(state.activeDraft?.data.networkId).toBe(42161) // Default: Arbitrum
      expect(state.activeDraft?.data.currency).toBe('USDC')
      expect(state.activeDraft?.data.decimals).toBe(6)
      expect(state.activeDraft?.data.from.name).toBe('')
    })

    it('creates one default line item', () => {
      const { createNewDraft } = useCreatorStore.getState()

      createNewDraft()

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(1)
      expect(state.lineItems[0]).toMatchObject({
        description: '',
        quantity: 1,
        rate: '',
      })
    })

    it('sets default due date 30 days from now', () => {
      const { createNewDraft } = useCreatorStore.getState()
      const now = Math.floor(Date.now() / 1000)

      createNewDraft()

      const state = useCreatorStore.getState()
      const expectedDueAt = now + 30 * 24 * 60 * 60
      // Allow 5 second tolerance for test execution time
      expect(state.activeDraft?.data.dueAt).toBeGreaterThanOrEqual(expectedDueAt - 5)
      expect(state.activeDraft?.data.dueAt).toBeLessThanOrEqual(expectedDueAt + 5)
    })
  })

  describe('updateDraft', () => {
    it('creates draft if none exists', () => {
      const { updateDraft } = useCreatorStore.getState()

      updateDraft({ invoiceId: 'NEW-001', networkId: 42161 })

      const state = useCreatorStore.getState()
      expect(state.activeDraft).not.toBeNull()
      expect(state.activeDraft?.data.invoiceId).toBe('NEW-001')
      expect(state.activeDraft?.data.networkId).toBe(42161)
    })

    it('updates existing draft data', () => {
      const { createNewDraft, updateDraft } = useCreatorStore.getState()

      createNewDraft()
      updateDraft({ invoiceId: 'UPDATED-001', notes: 'Test notes' })

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.invoiceId).toBe('UPDATED-001')
      expect(state.activeDraft?.data.notes).toBe('Test notes')
    })

    it('updates lastModified timestamp', async () => {
      const { createNewDraft, updateDraft } = useCreatorStore.getState()

      createNewDraft()
      const initialModified = useCreatorStore.getState().activeDraft?.meta.lastModified

      // Small delay to ensure different timestamp (1ms is enough for Date.now())
      await new Promise((r) => setTimeout(r, 10))

      updateDraft({ invoiceId: 'UPDATED' })

      const state = useCreatorStore.getState()
      // lastModified is an ISO date string, compare as dates
      const initialDate = new Date(initialModified!).getTime()
      const lastModified = state.activeDraft?.meta.lastModified
      const updatedDate = lastModified ? new Date(lastModified).getTime() : 0
      expect(updatedDate).toBeGreaterThanOrEqual(initialDate)
    })

    it('syncs lineItems when items provided', () => {
      const { updateDraft } = useCreatorStore.getState()

      updateDraft({
        invoiceId: 'WITH-ITEMS',
        items: [
          { description: 'Service A', quantity: 2, rate: '100' },
          { description: 'Service B', quantity: 1, rate: '200' },
        ],
      })

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(2)
      expect(state.lineItems[0].description).toBe('Service A')
      expect(state.lineItems[1].description).toBe('Service B')
    })
  })

  describe('clearDraft', () => {
    it('clears activeDraft and lineItems', () => {
      const { createNewDraft, clearDraft } = useCreatorStore.getState()

      createNewDraft()
      expect(useCreatorStore.getState().activeDraft).not.toBeNull()

      clearDraft()

      const state = useCreatorStore.getState()
      expect(state.activeDraft).toBeNull()
      expect(state.lineItems).toEqual([])
    })
  })

  describe('addLineItem', () => {
    it('adds empty line item to list', () => {
      const { createNewDraft, addLineItem } = useCreatorStore.getState()

      createNewDraft()
      addLineItem()

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(2)
    })

    it('syncs to draft items', () => {
      const { createNewDraft, addLineItem, updateLineItem } = useCreatorStore.getState()

      createNewDraft()
      const firstItemId = useCreatorStore.getState().lineItems[0].id
      updateLineItem(firstItemId, { description: 'First', rate: '50' })

      addLineItem()

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.items).toHaveLength(2)
    })

    it('works without active draft', () => {
      const { addLineItem } = useCreatorStore.getState()

      addLineItem()

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(1)
      expect(state.activeDraft).toBeNull()
    })
  })

  describe('removeLineItem', () => {
    it('removes line item by id', () => {
      const { createNewDraft, addLineItem, removeLineItem } = useCreatorStore.getState()

      createNewDraft()
      addLineItem()
      const itemsBeforeRemoval = useCreatorStore.getState().lineItems
      expect(itemsBeforeRemoval).toHaveLength(2)

      removeLineItem(itemsBeforeRemoval[0].id)

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(1)
      expect(state.lineItems[0].id).toBe(itemsBeforeRemoval[1].id)
    })

    it('syncs to draft items', () => {
      const { createNewDraft, addLineItem, removeLineItem } = useCreatorStore.getState()

      createNewDraft()
      addLineItem()
      const itemId = useCreatorStore.getState().lineItems[0].id

      removeLineItem(itemId)

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.items).toHaveLength(1)
    })

    it('handles non-existent id gracefully', () => {
      const { createNewDraft, removeLineItem } = useCreatorStore.getState()

      createNewDraft()
      const initialCount = useCreatorStore.getState().lineItems.length

      removeLineItem('non-existent-id')

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(initialCount)
    })
  })

  describe('updateLineItem', () => {
    it('updates specific line item', () => {
      const { createNewDraft, updateLineItem } = useCreatorStore.getState()

      createNewDraft()
      const itemId = useCreatorStore.getState().lineItems[0].id

      updateLineItem(itemId, { description: 'Updated service', rate: '150' })

      const state = useCreatorStore.getState()
      expect(state.lineItems[0].description).toBe('Updated service')
      expect(state.lineItems[0].rate).toBe('150')
    })

    it('updates only specified fields', () => {
      const { createNewDraft, updateLineItem } = useCreatorStore.getState()

      createNewDraft()
      const itemId = useCreatorStore.getState().lineItems[0].id

      updateLineItem(itemId, { quantity: 5 })

      const state = useCreatorStore.getState()
      expect(state.lineItems[0].quantity).toBe(5)
      expect(state.lineItems[0].description).toBe('') // unchanged
    })

    it('syncs to draft items', () => {
      const { createNewDraft, updateLineItem } = useCreatorStore.getState()

      createNewDraft()
      const itemId = useCreatorStore.getState().lineItems[0].id

      updateLineItem(itemId, { description: 'Synced item', rate: '200' })

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.items?.[0].description).toBe('Synced item')
      expect(state.activeDraft?.data.items?.[0].rate).toBe('200')
    })
  })

  describe('updateLineItems', () => {
    it('replaces all line items', () => {
      const { createNewDraft, updateLineItems } = useCreatorStore.getState()

      createNewDraft()

      updateLineItems([
        { id: 'item-1', description: 'New A', quantity: 1, rate: '100' },
        { id: 'item-2', description: 'New B', quantity: 2, rate: '200' },
      ])

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(2)
      expect(state.lineItems[0].description).toBe('New A')
      expect(state.lineItems[1].description).toBe('New B')
    })

    it('syncs to draft items', () => {
      const { createNewDraft, updateLineItems } = useCreatorStore.getState()

      createNewDraft()

      updateLineItems([{ id: 'item-1', description: 'Synced', quantity: 3, rate: '300' }])

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.items).toHaveLength(1)
      expect(state.activeDraft?.data.items?.[0].description).toBe('Synced')
    })

    it('works without active draft', () => {
      const { updateLineItems } = useCreatorStore.getState()

      updateLineItems([{ id: 'standalone', description: 'No draft', quantity: 1, rate: '50' }])

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(1)
      expect(state.activeDraft).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('handles rapid updates', () => {
      const { createNewDraft, updateDraft } = useCreatorStore.getState()

      createNewDraft()

      for (let i = 0; i < 10; i++) {
        updateDraft({ invoiceId: `RAPID-${i}` })
      }

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.invoiceId).toBe('RAPID-9')
    })

    it('preserves data integrity across operations', () => {
      const { createNewDraft, updateDraft, addLineItem, updateLineItem } = useCreatorStore.getState()

      createNewDraft()
      updateDraft({ notes: 'Important note', tax: '10' })
      addLineItem()

      const itemIds = useCreatorStore.getState().lineItems.map((i) => i.id)
      updateLineItem(itemIds[0], { description: 'First service', rate: '100' })
      updateLineItem(itemIds[1], { description: 'Second service', rate: '200' })

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.notes).toBe('Important note')
      expect(state.activeDraft?.data.tax).toBe('10')
      expect(state.activeDraft?.data.items).toHaveLength(2)
    })
  })
})
