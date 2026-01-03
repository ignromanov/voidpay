/**
 * History Slice tests
 * Feature: 015-create-page-preview
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCreatorStore } from '../../useCreatorStore'

// Mock uuid for deterministic tests
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234'),
}))

describe('historySlice', () => {
  beforeEach(() => {
    // Reset store state
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      history: [],
      preferences: {
        defaultNetworkId: 1,
        defaultCurrency: 'USDC',
      },
      networkTheme: 'ethereum',
      idCounter: { currentValue: 1, prefix: 'INV' },
    })
  })

  describe('initial state', () => {
    it('initializes with empty history', () => {
      const state = useCreatorStore.getState()
      expect(state.history).toEqual([])
    })
  })

  describe('addHistoryEntry', () => {
    it('adds entry to history', () => {
      const { addHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'INV-001',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://voidpay.xyz/pay#abc123',
      })

      const state = useCreatorStore.getState()
      expect(state.history).toHaveLength(1)
      expect(state.history[0].invoice.invoiceId).toBe('INV-001')
      expect(state.history[0].generatedUrl).toBe('https://voidpay.xyz/pay#abc123')
    })

    it('adds entry with auto-generated entryId and createdAt', () => {
      const { addHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'INV-002',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://voidpay.xyz/pay#def456',
      })

      const state = useCreatorStore.getState()
      expect(state.history[0].entryId).toBe('test-uuid-1234')
      expect(state.history[0].createdAt).toBeDefined()
    })

    it('prepends new entries to history', () => {
      const { addHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'FIRST',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://example.com/1',
      })

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'SECOND',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://example.com/2',
      })

      const state = useCreatorStore.getState()
      expect(state.history[0].invoice.invoiceId).toBe('SECOND')
      expect(state.history[1].invoice.invoiceId).toBe('FIRST')
    })

    it('auto-prunes history at 100 entries', () => {
      const { addHistoryEntry } = useCreatorStore.getState()

      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        addHistoryEntry({
          invoice: {
            version: 2,
            invoiceId: `INV-${i.toString().padStart(3, '0')}`,
            issuedAt: 1704067200,
            dueAt: 1706745600,
            networkId: 1,
            currency: 'USDC',
            decimals: 6,
            from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
            client: { name: 'Client' },
            items: [],
          },
          generatedUrl: `https://example.com/${i}`,
        })
      }

      const state = useCreatorStore.getState()
      expect(state.history).toHaveLength(100)
      // Most recent should be first
      expect(state.history[0].invoice.invoiceId).toBe('INV-104')
    })
  })

  describe('deleteHistoryEntry', () => {
    it('removes entry by entryId', () => {
      const { addHistoryEntry, deleteHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'TO-DELETE',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://example.com/delete',
      })

      const entryId = useCreatorStore.getState().history[0].entryId

      deleteHistoryEntry(entryId)

      const state = useCreatorStore.getState()
      expect(state.history).toHaveLength(0)
    })

    it('handles non-existent entryId gracefully', () => {
      const { addHistoryEntry, deleteHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'KEEP',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://example.com/keep',
      })

      deleteHistoryEntry('non-existent-id')

      const state = useCreatorStore.getState()
      expect(state.history).toHaveLength(1)
    })
  })

  describe('duplicateHistoryEntry', () => {
    it('creates new draft from history entry', () => {
      const { addHistoryEntry, duplicateHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'ORIGINAL',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 42161, // Arbitrum
          currency: 'ETH',
          decimals: 18,
          from: { name: 'Original Sender', walletAddress: '0xabc' as `0x${string}` },
          client: { name: 'Original Client' },
          items: [{ description: 'Service', quantity: 1, rate: '100' }],
        },
        generatedUrl: 'https://example.com/original',
      })

      const entryId = useCreatorStore.getState().history[0].entryId
      const draftId = duplicateHistoryEntry(entryId)

      const state = useCreatorStore.getState()
      expect(draftId).toBe('test-uuid-1234')
      expect(state.activeDraft).not.toBeNull()
      expect(state.activeDraft?.data.networkId).toBe(42161)
      expect(state.activeDraft?.data.currency).toBe('ETH')
      expect(state.activeDraft?.data.from.name).toBe('Original Sender')
    })

    it('resets dates for duplicated draft', () => {
      const { addHistoryEntry, duplicateHistoryEntry } = useCreatorStore.getState()
      const now = Math.floor(Date.now() / 1000)

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'OLD-DATES',
          issuedAt: 1609459200, // Jan 1, 2021
          dueAt: 1612137600, // Feb 1, 2021
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://example.com/old',
      })

      const entryId = useCreatorStore.getState().history[0].entryId
      duplicateHistoryEntry(entryId)

      const state = useCreatorStore.getState()
      // issuedAt should be close to now
      expect(state.activeDraft?.data.issuedAt).toBeGreaterThanOrEqual(now - 5)
      // dueAt should be ~30 days from now
      const expectedDue = now + 30 * 24 * 60 * 60
      expect(state.activeDraft?.data.dueAt).toBeGreaterThanOrEqual(expectedDue - 5)
    })

    it('restores line items from history', () => {
      const { addHistoryEntry, duplicateHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'WITH-ITEMS',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [
            { description: 'Item A', quantity: 2, rate: '50' },
            { description: 'Item B', quantity: 1, rate: '100' },
          ],
        },
        generatedUrl: 'https://example.com/items',
      })

      const entryId = useCreatorStore.getState().history[0].entryId
      duplicateHistoryEntry(entryId)

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(2)
      expect(state.lineItems[0].description).toBe('Item A')
      expect(state.lineItems[1].description).toBe('Item B')
    })

    it('throws error for non-existent entry', () => {
      const { duplicateHistoryEntry } = useCreatorStore.getState()

      expect(() => duplicateHistoryEntry('non-existent')).toThrow('History entry non-existent not found')
    })

    it('creates default line item if history has no items', () => {
      const { addHistoryEntry, duplicateHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'NO-ITEMS',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://example.com/no-items',
      })

      const entryId = useCreatorStore.getState().history[0].entryId
      duplicateHistoryEntry(entryId)

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(1)
      expect(state.lineItems[0].description).toBe('')
    })
  })

  describe('pruneHistory', () => {
    it('trims history to 100 entries', () => {
      // Manually set history with more than 100 entries
      const largeHistory = Array.from({ length: 120 }, (_, i) => ({
        entryId: `entry-${i}`,
        createdAt: new Date().toISOString(),
        invoice: {
          version: 2 as const,
          invoiceId: `INV-${i}`,
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: `https://example.com/${i}`,
      }))

      useCreatorStore.setState({ history: largeHistory })

      const { pruneHistory } = useCreatorStore.getState()
      pruneHistory()

      const state = useCreatorStore.getState()
      expect(state.history).toHaveLength(100)
    })

    it('does nothing if history is under 100', () => {
      const { addHistoryEntry, pruneHistory } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'SINGLE',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 1,
          currency: 'USDC',
          decimals: 6,
          from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
          client: { name: 'Client' },
          items: [],
        },
        generatedUrl: 'https://example.com/single',
      })

      pruneHistory()

      const state = useCreatorStore.getState()
      expect(state.history).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('handles history entry with all optional fields', () => {
      const { addHistoryEntry } = useCreatorStore.getState()

      addHistoryEntry({
        invoice: {
          version: 2,
          invoiceId: 'FULL',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 137, // Polygon
          currency: 'MATIC',
          decimals: 18,
          from: {
            name: 'Full Sender',
            walletAddress: '0xfull' as `0x${string}`,
            email: 'sender@example.com',
            physicalAddress: '123 Main St',
          },
          client: {
            name: 'Full Client',
            walletAddress: '0xclient' as `0x${string}`,
            email: 'client@example.com',
          },
          items: [{ description: 'Full service', quantity: 5, rate: '500' }],
          tax: '10',
          discount: '5',
          notes: 'Complete invoice with all fields',
        },
        generatedUrl: 'https://example.com/full',
      })

      const state = useCreatorStore.getState()
      expect(state.history[0].invoice.from.email).toBe('sender@example.com')
      expect(state.history[0].invoice.notes).toBe('Complete invoice with all fields')
    })
  })
})
