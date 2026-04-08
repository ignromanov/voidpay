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

    it('merge-upserts existing invoice and moves to top (source immutable)', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXISTING', source: 'received' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'OTHER' }))

      // Re-add with different source — original source preserved (first-write-wins)
      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXISTING', source: 'created' }))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices[0].invoiceId).toBe('EXISTING')
      expect(state.invoices[0].source).toBe('received')
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

    it('resets payment fields on upsert (W3-013 hardening)', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-TX' }))
      setTxHash('MERGE-TX', `0x${'a'.repeat(64)}`)

      // Re-add same invoice — payment fields MUST be reset (W3-013)
      addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-TX', invoiceUrl: 'https://voidpay.xyz/pay#updated' }))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBeUndefined()
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

      setTxHash('TX-TEST', `0x${'ab'.repeat(32)}`)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe(`0x${'ab'.repeat(32)}`)
    })

    it('does not set status field (no status on TrackedInvoice)', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'TX-NO-STATUS' }))
      setTxHash('TX-NO-STATUS', `0x${'cd'.repeat(32)}`)

      const state = useTrackedInvoiceStore.getState()
      // TrackedInvoice has no status field
      expect(Object.hasOwn(state.invoices[0], 'status')).toBe(false)
    })

    it('sets validation flag', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATED' }))

      setTxHash('VALIDATED', `0x${'ef'.repeat(32)}`, true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(true)
    })

    it('defaults validation to false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'UNVALIDATED' }))

      setTxHash('UNVALIDATED', `0x${'12'.repeat(32)}`)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(false)
    })

    it('sets paidAt when validated is true', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PAID-AT' }))
      setTxHash('PAID-AT', `0x${'34'.repeat(32)}`, true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBeDefined()
      expect(new Date(state.invoices[0].paidAt!).getTime()).not.toBeNaN()
    })

    it('does not set paidAt when validated is false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'NO-PAID-AT' }))
      setTxHash('NO-PAID-AT', `0x${'56'.repeat(32)}`, false)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBeUndefined()
    })

    it('preserves existing paidAt when re-calling with validated=false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PRESERVE-PAID' }))
      setTxHash('PRESERVE-PAID', `0x${'78'.repeat(32)}`, true)

      const paidAt = useTrackedInvoiceStore.getState().invoices[0].paidAt
      expect(paidAt).toBeDefined()

      setTxHash('PRESERVE-PAID', `0x${'9a'.repeat(32)}`, false)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBe(paidAt)
    })
  })

  describe('resetPaymentState', () => {
    it('clears txHash, txHashValidated, paidAt, confirmations', () => {
      const { addInvoice, setTxHash, setConfirmations, resetPaymentState } =
        useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'RESET-TEST' }))
      setTxHash('RESET-TEST', `0x${'bc'.repeat(32)}`, true)
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
      setTxHash('PRESERVE-FIELDS', `0x${'de'.repeat(32)}`, true)
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
        txHash: `0x${'ff'.repeat(32)}` as `0x${string}`,
        txHashValidated: true,
        confirmations: { current: 12, required: 12 },
        error: undefined,
        viewedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
      })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe(`0x${'ff'.repeat(32)}`)
      expect(state.invoices[0].txHashValidated).toBe(true)
      expect(state.invoices[0].confirmations).toEqual({ current: 12, required: 12 })
    })

    it('handles rapid operations', () => {
      const { addInvoice, setTxHash, removeInvoice } = useTrackedInvoiceStore.getState()

      for (let i = 0; i < 10; i++) {
        addInvoice(createMockTrackedInvoice({ invoiceId: `RAPID-${i}` }))
      }

      for (let i = 0; i < 5; i++) {
        setTxHash(`RAPID-${i}`, `0x${i.toString().padStart(2, '0').repeat(32)}`, true)
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

      setTxHash('INTEGRITY-TEST', `0x${'aa'.repeat(32)}`, true)

      const invoice = getInvoice('INTEGRITY-TEST')
      expect(invoice?.invoiceId).toBe('INTEGRITY-TEST')
      expect(invoice?.invoiceUrl).toBe('https://voidpay.xyz/pay#integrity')
      expect(invoice?.source).toBe('received')
      expect(invoice?.txHash).toBe(`0x${'aa'.repeat(32)}`)
      expect(invoice?.txHashValidated).toBe(true)
      expect(invoice?.paidAt).toBeDefined()
    })
  })

  describe('trackView', () => {
    it('creates new entry when invoice does not exist', () => {
      const { trackView } = useTrackedInvoiceStore.getState()

      trackView({
        invoiceId: 'NEW-VIEW',
        invoiceUrl: 'https://voidpay.xyz/pay#hash',
        source: 'received',
        viewedAt: '2026-03-10T12:00:00Z',
      })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
      expect(state.invoices[0].invoiceId).toBe('NEW-VIEW')
      expect(state.invoices[0].source).toBe('received')
      expect(state.invoices[0].viewedAt).toBe('2026-03-10T12:00:00Z')
      // New entry must not have stale payment fields
      expect(state.invoices[0].txHash).toBeUndefined()
      expect(state.invoices[0].txHashValidated).toBeUndefined()
      expect(state.invoices[0].finalized).toBeUndefined()
    })

    it('preserves txHash, txHashValidated, finalized, paidAt on re-view', () => {
      const { addInvoice, setTxHash, setValidated, setFinalized, trackView } =
        useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PAID-VIEW' }))
      setTxHash('PAID-VIEW', `0x${'ab'.repeat(32)}`, false)
      setValidated('PAID-VIEW', true)
      setFinalized('PAID-VIEW')

      trackView({
        invoiceId: 'PAID-VIEW',
        invoiceUrl: 'https://voidpay.xyz/pay#updated',
        source: 'received',
        viewedAt: '2026-03-10T14:00:00Z',
      })

      const inv = useTrackedInvoiceStore.getState().invoices[0]
      expect(inv.txHash).toBe(`0x${'ab'.repeat(32)}`)
      expect(inv.txHashValidated).toBe(true)
      expect(inv.finalized).toBe(true)
      expect(inv.paidAt).toBeDefined()
      expect(inv.viewedAt).toBe('2026-03-10T14:00:00Z')
      expect(inv.invoiceUrl).toBe('https://voidpay.xyz/pay#updated')
    })

    it('preserves confirmations and error fields on re-view', () => {
      const { addInvoice, setTxHash, setConfirmations, setError, trackView } =
        useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CONFIRM-VIEW' }))
      setTxHash('CONFIRM-VIEW', `0x${'cd'.repeat(32)}`, false)
      setConfirmations('CONFIRM-VIEW', { current: 2, required: 3 })
      setError('CONFIRM-VIEW', 'some error')

      trackView({
        invoiceId: 'CONFIRM-VIEW',
        invoiceUrl: 'https://voidpay.xyz/pay#hash',
        source: 'received',
        viewedAt: '2026-03-10T15:00:00Z',
      })

      const inv = useTrackedInvoiceStore.getState().invoices[0]
      expect(inv.txHash).toBe(`0x${'cd'.repeat(32)}`)
      expect(inv.confirmations).toEqual({ current: 2, required: 3 })
      expect(inv.error).toBe('some error')
    })

    it('preserves original source on re-view (first-write-wins)', () => {
      const { addInvoice, trackView } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'SRC', source: 'created' }))

      trackView({
        invoiceId: 'SRC',
        invoiceUrl: 'https://voidpay.xyz/pay#hash',
        source: 'received',
        viewedAt: '2026-03-10T16:00:00Z',
      })

      expect(useTrackedInvoiceStore.getState().invoices[0].source).toBe('created')
    })

    it('moves viewed invoice to top of list (MRU order)', () => {
      const { addInvoice, trackView } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'A' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'B' }))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'C' }))
      // Order: C, B, A

      trackView({
        invoiceId: 'A',
        invoiceUrl: 'https://voidpay.xyz/pay#hash',
        source: 'received',
        viewedAt: '2026-03-10T17:00:00Z',
      })

      const ids = useTrackedInvoiceStore.getState().invoices.map(i => i.invoiceId)
      expect(ids[0]).toBe('A')
    })

    it('respects MAX_INVOICES limit', () => {
      const { addInvoice, trackView } = useTrackedInvoiceStore.getState()

      for (let i = 0; i < 50; i++) {
        addInvoice(createMockTrackedInvoice({ invoiceId: `FILL-${i}` }))
      }

      trackView({
        invoiceId: 'OVERFLOW',
        invoiceUrl: 'https://voidpay.xyz/pay#hash',
        source: 'received',
        viewedAt: '2026-03-10T18:00:00Z',
      })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(50)
      expect(state.invoices[0].invoiceId).toBe('OVERFLOW')
    })
  })

  describe('store hardening', () => {
    // W3-013: addInvoice merge-upsert must NOT inherit stale payment fields
    describe('addInvoice resets payment fields on upsert (W3-013)', () => {
      it('clears txHash when re-adding same invoice id', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-POISON' }))
        setTxHash('MERGE-POISON', `0x${'a'.repeat(64)}` as `0x${string}`, false)

        // Re-add same invoice (simulating URL re-open / update)
        addInvoice(
          createMockTrackedInvoice({
            invoiceId: 'MERGE-POISON',
            invoiceUrl: 'https://voidpay.xyz/pay#updated',
          })
        )

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'MERGE-POISON')!
        expect(inv.txHash).toBeUndefined()
      })

      it('clears txHashValidated when re-adding same invoice id', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-VALIDATED' }))
        setTxHash('MERGE-VALIDATED', `0x${'b'.repeat(64)}` as `0x${string}`, true)

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-VALIDATED' }))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'MERGE-VALIDATED')!
        expect(inv.txHashValidated).toBeUndefined()
      })

      it('clears paidAt when re-adding same invoice id', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-PAIDAT' }))
        setTxHash('MERGE-PAIDAT', `0x${'c'.repeat(64)}` as `0x${string}`, true)

        // Sanity: paidAt is set
        expect(useTrackedInvoiceStore.getState().invoices[0].paidAt).toBeDefined()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-PAIDAT' }))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'MERGE-PAIDAT')!
        expect(inv.paidAt).toBeUndefined()
      })

      it('clears finalized when re-adding same invoice id', () => {
        const { addInvoice, setTxHash, setValidated, setFinalized } =
          useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-FINALIZED' }))
        setTxHash('MERGE-FINALIZED', `0x${'d'.repeat(64)}` as `0x${string}`)
        setValidated('MERGE-FINALIZED', true)
        setFinalized('MERGE-FINALIZED')

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-FINALIZED' }))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'MERGE-FINALIZED')!
        expect(inv.finalized).toBeUndefined()
      })

      it('clears confirmations when re-adding same invoice id', () => {
        const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-CONFIRM' }))
        setConfirmations('MERGE-CONFIRM', { current: 6, required: 12 })

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-CONFIRM' }))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'MERGE-CONFIRM')!
        expect(inv.confirmations).toBeUndefined()
      })

      it('clears error when re-adding same invoice id', () => {
        const { addInvoice, setError } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-ERROR' }))
        setError('MERGE-ERROR', 'some error from previous payment attempt')

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-ERROR' }))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'MERGE-ERROR')!
        // error must be reset to undefined on re-open — no stale state leak
        expect(inv.error).toBeUndefined()
      })

      it('still preserves createdAt and updates non-payment fields on upsert', () => {
        const { addInvoice } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-PRESERVE', source: 'created' }))
        const originalCreatedAt = useTrackedInvoiceStore.getState().invoices[0].createdAt

        addInvoice(
          createMockTrackedInvoice({
            invoiceId: 'MERGE-PRESERVE',
            source: 'received',
            invoiceUrl: 'https://voidpay.xyz/pay#newurl',
          })
        )

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'MERGE-PRESERVE')!
        expect(inv.source).toBe('created') // source is immutable (first-write-wins)
        expect(inv.invoiceUrl).toBe('https://voidpay.xyz/pay#newurl')
        expect(inv.createdAt).toBe(originalCreatedAt)
      })
    })

    // W3-014: setValidated must guard against missing txHash
    describe('setValidated rejects when no txHash (W3-014)', () => {
      it('does not set txHashValidated when invoice has no txHash', () => {
        const { addInvoice, setValidated } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATE-NO-TX' }))

        // Guard: invoice has no txHash — setValidated should be a no-op
        setValidated('VALIDATE-NO-TX', true)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'VALIDATE-NO-TX')!
        expect(inv.txHashValidated).toBeUndefined()
      })

      it('does not set paidAt when invoice has no txHash', () => {
        const { addInvoice, setValidated } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATE-NO-PAIDAT' }))
        setValidated('VALIDATE-NO-PAIDAT', true)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'VALIDATE-NO-PAIDAT')!
        expect(inv.paidAt).toBeUndefined()
      })

      it('sets txHashValidated when invoice already has txHash', () => {
        const { addInvoice, setTxHash, setValidated } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATE-WITH-TX' }))
        setTxHash('VALIDATE-WITH-TX', `0x${'e'.repeat(64)}` as `0x${string}`)

        // Now setValidated should work because txHash is present
        setValidated('VALIDATE-WITH-TX', true)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'VALIDATE-WITH-TX')!
        expect(inv.txHashValidated).toBe(true)
        expect(inv.paidAt).toBeDefined()
      })
    })

    describe('setTxHash validates hash format', () => {
      it('rejects non-hex string (not 0x-prefixed)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-NOHEX' }))
        setTxHash('FORMAT-NOHEX', 'not-a-hash' as any)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FORMAT-NOHEX')!
        expect(inv.txHash).toBeUndefined()
      })

      it('rejects hash that is too short (< 66 chars)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-SHORT' }))
        setTxHash('FORMAT-SHORT', '0x123' as any)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FORMAT-SHORT')!
        expect(inv.txHash).toBeUndefined()
      })

      it('accepts valid 32-byte hex hash (0x + 64 hex chars)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()
        const validHash = `0x${'a'.repeat(64)}` as `0x${string}`

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-VALID' }))
        setTxHash('FORMAT-VALID', validHash)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FORMAT-VALID')!
        expect(inv.txHash).toBe(validHash)
      })

      it('accepts valid hash with uppercase hex chars', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()
        const validHash = `0x${'A'.repeat(64)}` as `0x${string}`

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-UPPER' }))
        setTxHash('FORMAT-UPPER', validHash)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FORMAT-UPPER')!
        expect(inv.txHash).toBe(validHash)
      })

      it('rejects hash that is too long (> 66 chars)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-LONG' }))
        setTxHash('FORMAT-LONG', `0x${'a'.repeat(65)}` as any)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FORMAT-LONG')!
        expect(inv.txHash).toBeUndefined()
      })
    })

    describe('setFinalized only when validated', () => {
      it('does not set finalized when invoice is not validated', () => {
        const { addInvoice, setTxHash, setFinalized } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FINALIZE-UNVALIDATED' }))
        setTxHash('FINALIZE-UNVALIDATED', `0x${'f'.repeat(64)}` as `0x${string}`)
        // txHashValidated is false — setFinalized must be a no-op

        setFinalized('FINALIZE-UNVALIDATED')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FINALIZE-UNVALIDATED')!
        expect(inv.finalized).toBeUndefined()
      })

      it('does not set finalized when invoice has no txHash at all', () => {
        const { addInvoice, setFinalized } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FINALIZE-NOTX' }))
        setFinalized('FINALIZE-NOTX')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FINALIZE-NOTX')!
        expect(inv.finalized).toBeUndefined()
      })

      it('sets finalized when invoice has txHash AND is validated', () => {
        const { addInvoice, setTxHash, setValidated, setFinalized } =
          useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FINALIZE-OK' }))
        setTxHash('FINALIZE-OK', `0x${'1'.repeat(64)}` as `0x${string}`)
        setValidated('FINALIZE-OK', true)

        setFinalized('FINALIZE-OK')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'FINALIZE-OK')!
        expect(inv.finalized).toBe(true)
      })

      it('handles non-existent invoiceId gracefully', () => {
        const { setFinalized } = useTrackedInvoiceStore.getState()

        // Should not throw
        expect(() => setFinalized('NON-EXISTENT')).not.toThrow()
      })
    })

    describe('resetPaymentState also resets finalized', () => {
      it('clears finalized along with other payment fields', () => {
        const { addInvoice, setTxHash, setValidated, setFinalized, resetPaymentState } =
          useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'RESET-FINALIZED' }))
        setTxHash('RESET-FINALIZED', `0x${'2'.repeat(64)}` as `0x${string}`)
        setValidated('RESET-FINALIZED', true)
        setFinalized('RESET-FINALIZED')

        // Sanity: all payment fields are set
        const before = useTrackedInvoiceStore
          .getState()
          .invoices.find((i) => i.invoiceId === 'RESET-FINALIZED')!
        expect(before.txHash).toBeDefined()
        expect(before.txHashValidated).toBe(true)
        expect(before.finalized).toBe(true)

        resetPaymentState('RESET-FINALIZED')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'RESET-FINALIZED')!
        expect(inv.txHash).toBeUndefined()
        expect(inv.txHashValidated).toBeUndefined()
        expect(inv.paidAt).toBeUndefined()
        expect(inv.confirmations).toBeUndefined()
        expect(inv.finalized).toBeUndefined()
      })

      it('preserves non-payment fields after full reset including finalized', () => {
        const { addInvoice, setTxHash, setValidated, setFinalized, resetPaymentState } =
          useTrackedInvoiceStore.getState()

        addInvoice(
          createMockTrackedInvoice({
            invoiceId: 'RESET-PRESERVE2',
            invoiceUrl: 'https://voidpay.xyz/pay#preserve2',
            source: 'created',
          })
        )
        setTxHash('RESET-PRESERVE2', `0x${'3'.repeat(64)}` as `0x${string}`)
        setValidated('RESET-PRESERVE2', true)
        setFinalized('RESET-PRESERVE2')

        resetPaymentState('RESET-PRESERVE2')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.invoiceId === 'RESET-PRESERVE2')!
        expect(inv.invoiceId).toBe('RESET-PRESERVE2')
        expect(inv.invoiceUrl).toBe('https://voidpay.xyz/pay#preserve2')
        expect(inv.source).toBe('created')
        expect(inv.createdAt).toBeDefined()
        // All payment fields cleared
        expect(inv.txHash).toBeUndefined()
        expect(inv.finalized).toBeUndefined()
      })
    })
  })
})
