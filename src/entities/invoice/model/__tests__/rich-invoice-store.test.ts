/**
 * Viewed Invoice Store tests
 * Feature: 015-create-page-preview
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useRichInvoiceStore, type RichInvoice } from '../rich-invoice-store'

describe('useRichInvoiceStore', () => {
  beforeEach(() => {
    // Reset store state
    useRichInvoiceStore.setState({
      version: 1,
      invoices: [],
    })
  })

  const createMockInvoice = (
    overrides: Partial<RichInvoice> = {}
  ): Omit<RichInvoice, 'createdAt'> => ({
    invoiceId: 'INV-001',
    invoiceUrl: 'https://voidpay.xyz/pay#abc123',
    data: {
      version: 2,
      invoiceId: 'INV-001',
      issuedAt: 1704067200,
      dueAt: 1706745600,
      networkId: 1,
      currency: 'USDC',
      decimals: 6,
      from: { name: 'Sender', walletAddress: '0x1234567890123456789012345678901234567890' },
      client: { name: 'Client' },
      items: [{ description: 'Service', quantity: 1, rate: '100' }],
    },
    status: 'pending',
    ...overrides,
  })

  describe('initial state', () => {
    it('initializes with empty invoices array', () => {
      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toEqual([])
      expect(state.version).toBe(1)
    })
  })

  describe('addInvoice', () => {
    it('adds invoice to store', () => {
      const { addInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice())

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
      expect(state.invoices[0].invoiceId).toBe('INV-001')
    })

    it('sets createdAt timestamp', () => {
      const { addInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice())

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].createdAt).toBeDefined()
      expect(new Date(state.invoices[0].createdAt).getTime()).not.toBeNaN()
    })

    it('prepends new invoices to list', () => {
      const { addInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'FIRST' }))
      addInvoice(createMockInvoice({ invoiceId: 'SECOND' }))

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].invoiceId).toBe('SECOND')
      expect(state.invoices[1].invoiceId).toBe('FIRST')
    })

    it('updates existing invoice and moves to top', () => {
      const { addInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'EXISTING', status: 'pending' }))
      addInvoice(createMockInvoice({ invoiceId: 'OTHER' }))

      // Re-add existing with new status
      addInvoice(createMockInvoice({ invoiceId: 'EXISTING', status: 'paid' }))

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices[0].invoiceId).toBe('EXISTING')
      expect(state.invoices[0].status).toBe('paid')
    })

    it('limits to MAX_INVOICES (50)', () => {
      const { addInvoice } = useRichInvoiceStore.getState()

      // Add 55 invoices
      for (let i = 0; i < 55; i++) {
        addInvoice(createMockInvoice({ invoiceId: `INV-${i.toString().padStart(3, '0')}` }))
      }

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(50)
      // Most recent should be first
      expect(state.invoices[0].invoiceId).toBe('INV-054')
    })
  })

  describe('updateStatus', () => {
    it('updates invoice status', () => {
      const { addInvoice, updateStatus } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'STATUS-TEST', status: 'pending' }))

      updateStatus('STATUS-TEST', 'paid')

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].status).toBe('paid')
    })

    it('handles non-existent invoiceId gracefully', () => {
      const { addInvoice, updateStatus } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'KEEP', status: 'pending' }))

      updateStatus('NON-EXISTENT', 'paid')

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].status).toBe('pending')
    })

    it('supports all status types', () => {
      const { addInvoice, updateStatus } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'MULTI-STATUS' }))

      const statuses = ['pending', 'paid', 'overdue', 'draft', 'empty'] as const

      for (const status of statuses) {
        updateStatus('MULTI-STATUS', status)
        expect(useRichInvoiceStore.getState().invoices[0].status).toBe(status)
      }
    })
  })

  describe('setTxHash', () => {
    it('sets transaction hash and marks as paid', () => {
      const { addInvoice, setTxHash } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'TX-TEST', status: 'pending' }))

      setTxHash('TX-TEST', '0xabcdef1234567890')

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe('0xabcdef1234567890')
      expect(state.invoices[0].status).toBe('paid')
    })

    it('sets validation flag', () => {
      const { addInvoice, setTxHash } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'VALIDATED' }))

      setTxHash('VALIDATED', '0xhash', true)

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(true)
    })

    it('defaults validation to false', () => {
      const { addInvoice, setTxHash } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'UNVALIDATED' }))

      setTxHash('UNVALIDATED', '0xhash')

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(false)
    })
  })

  describe('removeInvoice', () => {
    it('removes invoice by invoiceId', () => {
      const { addInvoice, removeInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'TO-REMOVE' }))
      expect(useRichInvoiceStore.getState().invoices).toHaveLength(1)

      removeInvoice('TO-REMOVE')

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(0)
    })

    it('handles non-existent invoiceId gracefully', () => {
      const { addInvoice, removeInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'KEEP' }))

      removeInvoice('NON-EXISTENT')

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
    })

    it('removes only specified invoice', () => {
      const { addInvoice, removeInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'FIRST' }))
      addInvoice(createMockInvoice({ invoiceId: 'SECOND' }))
      addInvoice(createMockInvoice({ invoiceId: 'THIRD' }))

      removeInvoice('SECOND')

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices.map((i) => i.invoiceId)).toEqual(['THIRD', 'FIRST'])
    })
  })

  describe('getInvoice', () => {
    it('returns invoice by invoiceId', () => {
      const { addInvoice, getInvoice } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'FIND-ME' }))

      const invoice = getInvoice('FIND-ME')

      expect(invoice).toBeDefined()
      expect(invoice?.invoiceId).toBe('FIND-ME')
    })

    it('returns undefined for non-existent invoiceId', () => {
      const { getInvoice } = useRichInvoiceStore.getState()

      const invoice = getInvoice('NON-EXISTENT')

      expect(invoice).toBeUndefined()
    })
  })

  describe('clearAll', () => {
    it('removes all invoices', () => {
      const { addInvoice, clearAll } = useRichInvoiceStore.getState()

      addInvoice(createMockInvoice({ invoiceId: 'ONE' }))
      addInvoice(createMockInvoice({ invoiceId: 'TWO' }))
      addInvoice(createMockInvoice({ invoiceId: 'THREE' }))

      expect(useRichInvoiceStore.getState().invoices).toHaveLength(3)

      clearAll()

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('handles invoice with createHash', () => {
      const { addInvoice } = useRichInvoiceStore.getState()

      addInvoice(
        createMockInvoice({
          invoiceId: 'WITH-HASH',
          createHash: 'N4IgbghgTg9g...',
        })
      )

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].createHash).toBe('N4IgbghgTg9g...')
    })

    it('handles invoice with all optional fields', () => {
      const { addInvoice } = useRichInvoiceStore.getState()

      addInvoice({
        invoiceId: 'FULL-OPTIONS',
        invoiceUrl: 'https://voidpay.xyz/pay#full',
        data: {
          version: 2,
          invoiceId: 'FULL-OPTIONS',
          issuedAt: 1704067200,
          dueAt: 1706745600,
          networkId: 137,
          currency: 'MATIC',
          decimals: 18,
          tokenAddress: '0xtoken',
          from: {
            name: 'Full Sender',
            walletAddress: '0xsender',
            email: 'sender@test.com',
            physicalAddress: '123 Main St',
          },
          client: {
            name: 'Full Client',
            walletAddress: '0xclient',
            email: 'client@test.com',
          },
          items: [{ description: 'Full Service', quantity: 5, rate: '200' }],
          tax: '10',
          discount: '5',
          notes: 'Full invoice with all fields',
        },
        status: 'paid',
        txHash: '0xfulltx',
        txHashValidated: true,
        createHash: 'fullhash',
      })

      const state = useRichInvoiceStore.getState()
      expect(state.invoices[0].data.tokenAddress).toBe('0xtoken')
      expect(state.invoices[0].data.notes).toBe('Full invoice with all fields')
    })

    it('handles rapid operations', () => {
      const { addInvoice, updateStatus, setTxHash, removeInvoice } = useRichInvoiceStore.getState()

      // Rapid adds
      for (let i = 0; i < 10; i++) {
        addInvoice(createMockInvoice({ invoiceId: `RAPID-${i}` }))
      }

      // Rapid status updates
      for (let i = 0; i < 10; i++) {
        updateStatus(`RAPID-${i}`, 'paid')
      }

      // Set tx hashes
      for (let i = 0; i < 5; i++) {
        setTxHash(`RAPID-${i}`, `0xtx${i}`)
      }

      // Remove some
      for (let i = 5; i < 8; i++) {
        removeInvoice(`RAPID-${i}`)
      }

      const state = useRichInvoiceStore.getState()
      expect(state.invoices).toHaveLength(7)
      expect(state.invoices.every((i) => i.status === 'paid')).toBe(true)
    })

    it('preserves data integrity across operations', () => {
      const { addInvoice, updateStatus, setTxHash, getInvoice } = useRichInvoiceStore.getState()

      const originalData = {
        version: 2 as const,
        invoiceId: 'INTEGRITY-TEST',
        issuedAt: 1704067200,
        dueAt: 1706745600,
        networkId: 42161,
        currency: 'ARB',
        decimals: 18,
        from: { name: 'Important Sender', walletAddress: '0xintegrity' as `0x${string}` },
        client: { name: 'Important Client' },
        items: [{ description: 'Critical Service', quantity: 10, rate: '1000' }],
      }

      addInvoice({
        invoiceId: 'INTEGRITY-TEST',
        invoiceUrl: 'https://voidpay.xyz/pay#integrity',
        data: originalData,
        status: 'pending',
      })

      updateStatus('INTEGRITY-TEST', 'paid')
      setTxHash('INTEGRITY-TEST', '0xintegritytx', true)

      const invoice = getInvoice('INTEGRITY-TEST')
      expect(invoice?.data).toEqual(originalData)
      expect(invoice?.status).toBe('paid')
      expect(invoice?.txHash).toBe('0xintegritytx')
    })
  })
})
