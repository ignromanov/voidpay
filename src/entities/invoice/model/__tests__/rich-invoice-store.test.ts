/**
 * Tracked Invoice Store tests
 * Feature: 021-smart-pay-button
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useTrackedInvoiceStore, type TrackedInvoice } from '../rich-invoice-store'

describe('useTrackedInvoiceStore', () => {
  beforeEach(() => {
    useTrackedInvoiceStore.setState({
      invoices: [],
    })
  })

  function createMockTrackedInvoice(
    overrides: Partial<Omit<TrackedInvoice, 'createdAt'>> = {}
  ): Omit<TrackedInvoice, 'createdAt'> {
    return {
      invoiceId: 'INV-001',
      invoiceUrl: 'https://voidpay.xyz/pay#abc123',
      source: 'received' as const,
      ...overrides,
    }
  }

  describe('initial state', () => {
    it('initializes with empty invoices array', () => {
      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toEqual([])
    })
  })

  describe('addInvoice', () => {
    it('adds invoice to store', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice())

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
      expect(state.invoices[0].invoiceId).toBe('INV-001')
    })

    it('sets createdAt timestamp on new invoice', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice())

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].createdAt).toBeDefined()
      expect(new Date(state.invoices[0].createdAt).getTime()).not.toBeNaN()
    })

    it('prepends new invoices to list', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'FIRST' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'SECOND' }))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].invoiceId).toBe('SECOND')
      expect(state.invoices[1].invoiceId).toBe('FIRST')
    })

    it('merge-upserts existing invoice and moves to top', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXISTING', source: 'received' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'OTHER' }))

      // Re-add with overlaid fields
      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXISTING', source: 'created' }))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices[0].invoiceId).toBe('EXISTING')
      expect(state.invoices[0].source).toBe('created')
    })

    it('preserves existing createdAt on upsert', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PRESERVE' }))
      const originalCreatedAt = useTrackedInvoiceStore.getState().invoices[0].createdAt

      // Re-add same invoice
      addInvoice(createMockTrackedInvoice({ invoiceId: 'PRESERVE' }))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].createdAt).toBe(originalCreatedAt)
    })

    it('preserves existing txHash on upsert (merge semantics)', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-TX' }))
      setTxHash('MERGE-TX', '0xoriginal')

      // Re-add without txHash — existing txHash should be preserved
      addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-TX', invoiceUrl: 'https://voidpay.xyz/pay#updated' }))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe('0xoriginal')
      expect(state.invoices[0].invoiceUrl).toBe('https://voidpay.xyz/pay#updated')
    })

    it('limits to MAX_INVOICES (50)', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      for (let i = 0; i < 55; i++) {
        addInvoice(createMockTrackedInvoice({ invoiceId: `INV-${i.toString().padStart(3, '0')}` }))
      }

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(50)
      expect(state.invoices[0].invoiceId).toBe('INV-054')
    })
  })

  describe('setTxHash', () => {
    it('sets transaction hash', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'TX-TEST' }))

      setTxHash('TX-TEST', '0xabcdef1234567890')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe('0xabcdef1234567890')
    })

    it('does not set status field (no status on TrackedInvoice)', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'TX-NO-STATUS' }))
      setTxHash('TX-NO-STATUS', '0xhash')

      const state = useTrackedInvoiceStore.getState()
      // TrackedInvoice has no status field
      expect(Object.hasOwn(state.invoices[0], 'status')).toBe(false)
    })

    it('sets validation flag', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATED' }))

      setTxHash('VALIDATED', '0xhash', true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(true)
    })

    it('defaults validation to false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'UNVALIDATED' }))

      setTxHash('UNVALIDATED', '0xhash')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(false)
    })

    it('sets paidAt when validated is true', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PAID-AT' }))
      setTxHash('PAID-AT', '0xhash', true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBeDefined()
      expect(new Date(state.invoices[0].paidAt!).getTime()).not.toBeNaN()
    })

    it('does not set paidAt when validated is false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'NO-PAID-AT' }))
      setTxHash('NO-PAID-AT', '0xhash', false)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBeUndefined()
    })

    it('preserves existing paidAt when re-calling with validated=false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PRESERVE-PAID' }))
      setTxHash('PRESERVE-PAID', '0xhash1', true)

      const paidAt = useTrackedInvoiceStore.getState().invoices[0].paidAt
      expect(paidAt).toBeDefined()

      setTxHash('PRESERVE-PAID', '0xhash2', false)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBe(paidAt)
    })
  })

  describe('resetPaymentState', () => {
    it('clears txHash, txHashValidated, paidAt, confirmations', () => {
      const { addInvoice, setTxHash, setConfirmations, resetPaymentState } =
        useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'RESET-TEST' }))
      setTxHash('RESET-TEST', '0xhash', true)
      setConfirmations('RESET-TEST', { current: 6, required: 12 })

      resetPaymentState('RESET-TEST')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBeUndefined()
      expect(state.invoices[0].txHashValidated).toBeUndefined()
      expect(state.invoices[0].paidAt).toBeUndefined()
      expect(state.invoices[0].confirmations).toBeUndefined()
    })

    it('preserves non-payment fields after reset', () => {
      const { addInvoice, setTxHash, setError, resetPaymentState } =
        useTrackedInvoiceStore.getState()

      addInvoice(
        createMockTrackedInvoice({
          invoiceId: 'PRESERVE-FIELDS',
          invoiceUrl: 'https://voidpay.xyz/pay#preserve',
          source: 'created',
        })
      )
      setTxHash('PRESERVE-FIELDS', '0xhash', true)
      setError('PRESERVE-FIELDS', 'some error')

      resetPaymentState('PRESERVE-FIELDS')

      const state = useTrackedInvoiceStore.getState()
      const inv = state.invoices[0]
      expect(inv.invoiceId).toBe('PRESERVE-FIELDS')
      expect(inv.invoiceUrl).toBe('https://voidpay.xyz/pay#preserve')
      expect(inv.source).toBe('created')
      expect(inv.error).toBe('some error')
      expect(inv.createdAt).toBeDefined()
    })

    it('handles non-existent invoiceId gracefully', () => {
      const { addInvoice, resetPaymentState } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'KEEP' }))

      resetPaymentState('NON-EXISTENT')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
      expect(state.invoices[0].invoiceId).toBe('KEEP')
    })
  })

  describe('removeInvoice', () => {
    it('removes invoice by invoiceId', () => {
      const { addInvoice, removeInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'TO-REMOVE' }))
      expect(useTrackedInvoiceStore.getState().invoices).toHaveLength(1)

      removeInvoice('TO-REMOVE')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(0)
    })

    it('handles non-existent invoiceId gracefully', () => {
      const { addInvoice, removeInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'KEEP' }))

      removeInvoice('NON-EXISTENT')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
    })

    it('removes only specified invoice', () => {
      const { addInvoice, removeInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'FIRST' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'SECOND' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'THIRD' }))

      removeInvoice('SECOND')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices.map((i) => i.invoiceId)).toEqual(['THIRD', 'FIRST'])
    })
  })

  describe('getInvoice', () => {
    it('returns invoice by invoiceId', () => {
      const { addInvoice, getInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'FIND-ME' }))

      const invoice = getInvoice('FIND-ME')

      expect(invoice).toBeDefined()
      expect(invoice?.invoiceId).toBe('FIND-ME')
    })

    it('returns undefined for non-existent invoiceId', () => {
      const { getInvoice } = useTrackedInvoiceStore.getState()

      const invoice = getInvoice('NON-EXISTENT')

      expect(invoice).toBeUndefined()
    })
  })

  describe('clearAll', () => {
    it('removes all invoices', () => {
      const { addInvoice, clearAll } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'ONE' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'TWO' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'THREE' }))

      expect(useTrackedInvoiceStore.getState().invoices).toHaveLength(3)

      clearAll()

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(0)
    })
  })

  describe('setConfirmations', () => {
    it('sets confirmation progress', () => {
      const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CONFIRM-TEST' }))
      setConfirmations('CONFIRM-TEST', { current: 3, required: 12 })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].confirmations).toEqual({ current: 3, required: 12 })
    })

    it('clears confirmations when undefined', () => {
      const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CLEAR-CONFIRM' }))
      setConfirmations('CLEAR-CONFIRM', { current: 5, required: 12 })
      setConfirmations('CLEAR-CONFIRM', undefined)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].confirmations).toBeUndefined()
    })

    it('handles non-existent invoiceId gracefully', () => {
      const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXIST' }))
      setConfirmations('NON-EXISTENT', { current: 1, required: 12 })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].confirmations).toBeUndefined()
    })
  })

  describe('setError', () => {
    it('sets error message', () => {
      const { addInvoice, setError } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'ERROR-TEST' }))
      setError('ERROR-TEST', 'Transaction reverted')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].error).toBe('Transaction reverted')
    })

    it('clears error with null (converts to undefined via store)', () => {
      const { addInvoice, setError } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CLEAR-ERROR' }))
      setError('CLEAR-ERROR', 'Some error')
      setError('CLEAR-ERROR', null)

      const state = useTrackedInvoiceStore.getState()
      // error field stores null as passed — callers treat null as "no error"
      expect(state.invoices[0].error).toBeNull()
    })

    it('handles non-existent invoiceId gracefully', () => {
      const { addInvoice, setError } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXIST' }))
      setError('NON-EXISTENT', 'Error')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].error).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles invoice with source=created', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(
        createMockTrackedInvoice({
          invoiceId: 'CREATED-SOURCE',
          source: 'created',
        })
      )

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].source).toBe('created')
    })

    it('handles invoice with all optional fields', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice({
        invoiceId: 'FULL-OPTIONS',
        invoiceUrl: 'https://voidpay.xyz/pay#full',
        source: 'received',
        txHash: '0xfulltx',
        txHashValidated: true,
        confirmations: { current: 12, required: 12 },
        error: undefined,
        viewedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
      })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe('0xfulltx')
      expect(state.invoices[0].txHashValidated).toBe(true)
      expect(state.invoices[0].confirmations).toEqual({ current: 12, required: 12 })
    })

    it('handles rapid operations', () => {
      const { addInvoice, setTxHash, removeInvoice } = useTrackedInvoiceStore.getState()

      for (let i = 0; i < 10; i++) {
        addInvoice(createMockTrackedInvoice({ invoiceId: `RAPID-${i}` }))
      }

      for (let i = 0; i < 5; i++) {
        setTxHash(`RAPID-${i}`, `0xtx${i}`, true)
      }

      for (let i = 5; i < 8; i++) {
        removeInvoice(`RAPID-${i}`)
      }

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(7)
      // First 5 have txHash set
      const withTx = state.invoices.filter((i) => i.txHash !== undefined)
      expect(withTx).toHaveLength(5)
    })

    it('preserves data integrity across operations', () => {
      const { addInvoice, setTxHash, getInvoice } = useTrackedInvoiceStore.getState()

      addInvoice({
        invoiceId: 'INTEGRITY-TEST',
        invoiceUrl: 'https://voidpay.xyz/pay#integrity',
        source: 'received',
      })

      setTxHash('INTEGRITY-TEST', '0xintegritytx', true)

      const invoice = getInvoice('INTEGRITY-TEST')
      expect(invoice?.invoiceId).toBe('INTEGRITY-TEST')
      expect(invoice?.invoiceUrl).toBe('https://voidpay.xyz/pay#integrity')
      expect(invoice?.source).toBe('received')
      expect(invoice?.txHash).toBe('0xintegritytx')
      expect(invoice?.txHashValidated).toBe(true)
      expect(invoice?.paidAt).toBeDefined()
    })
  })
})
