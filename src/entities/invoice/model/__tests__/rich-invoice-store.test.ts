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
    overrides: Partial<Omit<TrackedInvoice, 'createdAt' | 'key'>> = {},
    hash: string = 'abc123'
  ): Omit<TrackedInvoice, 'createdAt' | 'key'> {
    return {
      invoiceId: 'INV-001',
      invoiceUrl: `https://voidpay.xyz/pay#${hash}`,
      source: 'received' as const,
      ...overrides,
    }
  }

  // Helper to extract key from invoiceUrl (same as store logic)
  function getKey(invoiceUrl: string): string {
    const hashIndex = invoiceUrl.indexOf('#')
    return hashIndex === -1 ? invoiceUrl : invoiceUrl.slice(hashIndex + 1)
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
      expect(state.invoices[0].key).toBe('abc123')
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

      addInvoice(createMockTrackedInvoice({ invoiceId: 'FIRST' }, 'hash1'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'SECOND' }, 'hash2'))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].invoiceId).toBe('SECOND')
      expect(state.invoices[1].invoiceId).toBe('FIRST')
      expect(state.invoices[0].key).toBe('hash2')
      expect(state.invoices[1].key).toBe('hash1')
    })

    it('merge-upserts existing invoice (same hash) and moves to top', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXISTING', source: 'received' }, 'samehash'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'OTHER' }, 'otherhash'))

      // Re-add with same hash but different invoiceId - should upsert
      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXISTING-UPDATED', source: 'created' }, 'samehash'))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices[0].invoiceId).toBe('EXISTING-UPDATED')
      expect(state.invoices[0].source).toBe('created')
      expect(state.invoices[0].key).toBe('samehash')
    })

    it('preserves existing createdAt on upsert', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PRESERVE' }, 'preservehash'))
      const originalCreatedAt = useTrackedInvoiceStore.getState().invoices[0].createdAt

      // Re-add same invoice with same hash
      addInvoice(createMockTrackedInvoice({ invoiceId: 'PRESERVE' }, 'preservehash'))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].createdAt).toBe(originalCreatedAt)
      expect(state.invoices[0].key).toBe('preservehash')
    })

    it('resets payment fields on upsert (W3-013 hardening)', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-TX' }, 'mergehash'))
      setTxHash('mergehash', `0x${'a'.repeat(64)}`)

      // Re-add same invoice — payment fields MUST be reset (W3-013)
      addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-TX', invoiceUrl: 'https://voidpay.xyz/pay#mergehash' }))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBeUndefined()
      expect(state.invoices[0].invoiceUrl).toBe('https://voidpay.xyz/pay#mergehash')
      expect(state.invoices[0].key).toBe('mergehash')
    })

    it('allows different invoices with same invoiceId but different hashes (collision fix)', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      // Two different senders both use INV-2026-001
      addInvoice(createMockTrackedInvoice({ invoiceId: 'INV-2026-001' }, 'senderA-hash'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'INV-2026-001' }, 'senderB-hash'))

      const state = useTrackedInvoiceStore.getState()
      // Both should exist because they have different keys
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices[0].key).toBe('senderB-hash')
      expect(state.invoices[1].key).toBe('senderA-hash')
      expect(state.invoices[0].invoiceId).toBe('INV-2026-001')
      expect(state.invoices[1].invoiceId).toBe('INV-2026-001')
    })

    it('limits to MAX_INVOICES (50)', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      for (let i = 0; i < 55; i++) {
        addInvoice(createMockTrackedInvoice({ invoiceId: `INV-${i.toString().padStart(3, '0')}` }, `hash${i}`))
      }

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(50)
      expect(state.invoices[0].invoiceId).toBe('INV-054')
      expect(state.invoices[0].key).toBe('hash54')
    })
  })

  describe('setTxHash', () => {
    it('sets transaction hash by key', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'TX-TEST' }, 'txhash'))

      setTxHash('txhash', `0x${'ab'.repeat(32)}`)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe(`0x${'ab'.repeat(32)}`)
    })

    it('does not set txHash if key not found', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'TX-TEST' }, 'txhash'))
      setTxHash('wrong-key', `0x${'ab'.repeat(32)}`)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBeUndefined()
    })

    it('sets validation flag', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATED' }, 'validatedhash'))

      setTxHash('validatedhash', `0x${'ef'.repeat(32)}`, true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(true)
    })

    it('defaults validation to false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'UNVALIDATED' }, 'unvalidatedhash'))

      setTxHash('unvalidatedhash', `0x${'12'.repeat(32)}`)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(false)
    })

    it('sets paidAt when validated is true', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PAID-AT' }, 'paidathash'))
      setTxHash('paidathash', `0x${'34'.repeat(32)}`, true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBeDefined()
      expect(new Date(state.invoices[0].paidAt!).getTime()).not.toBeNaN()
    })

    it('does not set paidAt when validated is false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'NO-PAID-AT' }, 'nopaidathash'))
      setTxHash('nopaidathash', `0x${'56'.repeat(32)}`, false)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBeUndefined()
    })

    it('preserves existing paidAt when re-calling with validated=false', () => {
      const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PRESERVE-PAID' }, 'preservepaidhash'))
      setTxHash('preservepaidhash', `0x${'78'.repeat(32)}`, true)

      const paidAt = useTrackedInvoiceStore.getState().invoices[0].paidAt
      expect(paidAt).toBeDefined()

      setTxHash('preservepaidhash', `0x${'9a'.repeat(32)}`, false)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].paidAt).toBe(paidAt)
    })
  })

  describe('resetPaymentState', () => {
    it('clears txHash, txHashValidated, paidAt, confirmations', () => {
      const { addInvoice, setTxHash, setConfirmations, resetPaymentState } =
        useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'RESET-TEST' }, 'resethash'))
      setTxHash('resethash', `0x${'bc'.repeat(32)}`, true)
      setConfirmations('resethash', { current: 6, required: 12 })

      resetPaymentState('resethash')

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
          invoiceUrl: 'https://voidpay.xyz/pay#preservehash',
          source: 'created',
        }, 'preservehash')
      )
      setTxHash('preservehash', `0x${'de'.repeat(32)}`, true)
      setError('preservehash', 'some error')

      resetPaymentState('preservehash')

      const state = useTrackedInvoiceStore.getState()
      const inv = state.invoices[0]
      expect(inv.invoiceId).toBe('PRESERVE-FIELDS')
      expect(inv.invoiceUrl).toBe('https://voidpay.xyz/pay#preservehash')
      expect(inv.source).toBe('created')
      expect(inv.error).toBe('some error')
      expect(inv.createdAt).toBeDefined()
      expect(inv.key).toBe('preservehash')
    })

    it('handles non-existent key gracefully', () => {
      const { addInvoice, resetPaymentState } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'KEEP' }, 'keephash'))

      resetPaymentState('NON-EXISTENT')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
      expect(state.invoices[0].invoiceId).toBe('KEEP')
    })
  })

  describe('removeInvoice', () => {
    it('removes invoice by key', () => {
      const { addInvoice, removeInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'TO-REMOVE' }, 'removehash'))
      expect(useTrackedInvoiceStore.getState().invoices).toHaveLength(1)

      removeInvoice('removehash')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(0)
    })

    it('does not remove invoice with different key but same invoiceId', () => {
      const { addInvoice, removeInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'SAME-ID' }, 'hashA'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'SAME-ID' }, 'hashB'))
      expect(useTrackedInvoiceStore.getState().invoices).toHaveLength(2)

      removeInvoice('hashA')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
      expect(state.invoices[0].key).toBe('hashB')
      expect(state.invoices[0].invoiceId).toBe('SAME-ID')
    })

    it('handles non-existent key gracefully', () => {
      const { addInvoice, removeInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'KEEP' }, 'keephash'))

      removeInvoice('NON-EXISTENT')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
    })

    it('removes only specified invoice', () => {
      const { addInvoice, removeInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'FIRST' }, 'hash1'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'SECOND' }, 'hash2'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'THIRD' }, 'hash3'))

      removeInvoice('hash2')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(2)
      expect(state.invoices.map((i) => i.invoiceId)).toEqual(['THIRD', 'FIRST'])
      expect(state.invoices.map((i) => i.key)).toEqual(['hash3', 'hash1'])
    })
  })

  describe('getInvoice', () => {
    it('returns invoice by key', () => {
      const { addInvoice, getInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'FIND-ME' }, 'findmehash'))

      const invoice = getInvoice('findmehash')

      expect(invoice).toBeDefined()
      expect(invoice?.invoiceId).toBe('FIND-ME')
      expect(invoice?.key).toBe('findmehash')
    })

    it('returns undefined for non-existent key', () => {
      const { getInvoice } = useTrackedInvoiceStore.getState()

      const invoice = getInvoice('NON-EXISTENT')

      expect(invoice).toBeUndefined()
    })

    it('returns undefined for matching invoiceId but different key', () => {
      const { addInvoice, getInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'LOOK-FOR-ME' }, 'hash123'))

      const invoice = getInvoice('different-hash')

      expect(invoice).toBeUndefined()
    })
  })

  describe('clearAll', () => {
    it('removes all invoices', () => {
      const { addInvoice, clearAll } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'ONE' }, 'hash1'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'TWO' }, 'hash2'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'THREE' }, 'hash3'))

      expect(useTrackedInvoiceStore.getState().invoices).toHaveLength(3)

      clearAll()

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(0)
    })
  })

  describe('setConfirmations', () => {
    it('sets confirmation progress by key', () => {
      const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CONFIRM-TEST' }, 'confirmhash'))
      setConfirmations('confirmhash', { current: 3, required: 12 })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].confirmations).toEqual({ current: 3, required: 12 })
    })

    it('clears confirmations when undefined', () => {
      const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CLEAR-CONFIRM' }, 'clearhash'))
      setConfirmations('clearhash', { current: 5, required: 12 })
      setConfirmations('clearhash', undefined)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].confirmations).toBeUndefined()
    })

    it('handles non-existent key gracefully', () => {
      const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXIST' }, 'existhash'))
      setConfirmations('nonexistent', { current: 1, required: 12 })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].confirmations).toBeUndefined()
    })
  })

  describe('setError', () => {
    it('sets error message by key', () => {
      const { addInvoice, setError } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'ERROR-TEST' }, 'errorhash'))
      setError('errorhash', 'Transaction reverted')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].error).toBe('Transaction reverted')
    })

    it('clears error with null', () => {
      const { addInvoice, setError } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CLEAR-ERROR' }, 'clearhash'))
      setError('clearhash', 'Some error')
      setError('clearhash', null)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].error).toBeNull()
    })

    it('handles non-existent key gracefully', () => {
      const { addInvoice, setError } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'EXIST' }, 'existhash'))
      setError('nonexistent', 'Error')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].error).toBeUndefined()
    })
  })

  describe('setValidated', () => {
    it('sets validated by key when txHash exists', () => {
      const { addInvoice, setTxHash, setValidated } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATE-TEST' }, 'validatehash'))
      setTxHash('validatehash', `0x${'aa'.repeat(32)}`)
      setValidated('validatehash', true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBe(true)
      expect(state.invoices[0].paidAt).toBeDefined()
    })

    it('does not set validated if no txHash', () => {
      const { addInvoice, setValidated } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'NO-TX' }, 'notxhash'))
      setValidated('notxhash', true)

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHashValidated).toBeUndefined()
      expect(state.invoices[0].paidAt).toBeUndefined()
    })
  })

  describe('setFinalized', () => {
    it('sets finalized by key when validated', () => {
      const { addInvoice, setTxHash, setValidated, setFinalized } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'FINALIZE-TEST' }, 'finalizehash'))
      setTxHash('finalizehash', `0x${'bb'.repeat(32)}`)
      setValidated('finalizehash', true)
      setFinalized('finalizehash')

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].finalized).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles invoice with source=created', () => {
      const { addInvoice } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({
        invoiceId: 'CREATED-SOURCE',
        source: 'created',
      }, 'createdhash'))

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].source).toBe('created')
      expect(state.invoices[0].key).toBe('createdhash')
    })

    it('handles invoice with all optional fields', () => {
      const { addInvoice, setTxHash, setConfirmations } = useTrackedInvoiceStore.getState()

      addInvoice({
        invoiceId: 'FULL-OPTIONS',
        invoiceUrl: 'https://voidpay.xyz/pay#fullhash',
        source: 'received',
      })
      setTxHash('fullhash', `0x${'ff'.repeat(32)}` as `0x${string}`, true)
      setConfirmations('fullhash', { current: 12, required: 12 })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices[0].txHash).toBe(`0x${'ff'.repeat(32)}`)
      expect(state.invoices[0].txHashValidated).toBe(true)
      expect(state.invoices[0].confirmations).toEqual({ current: 12, required: 12 })
      expect(state.invoices[0].key).toBe('fullhash')
    })

    it('handles rapid operations', () => {
      const { addInvoice, setTxHash, removeInvoice } = useTrackedInvoiceStore.getState()

      for (let i = 0; i < 10; i++) {
        addInvoice(createMockTrackedInvoice({ invoiceId: `RAPID-${i}` }, `rapid${i}`))
      }

      for (let i = 0; i < 5; i++) {
        setTxHash(`rapid${i}`, `0x${i.toString().padStart(2, '0').repeat(32)}`, true)
      }

      for (let i = 5; i < 8; i++) {
        removeInvoice(`rapid${i}`)
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
        invoiceUrl: 'https://voidpay.xyz/pay#integrityhash',
        source: 'received',
      })

      setTxHash('integrityhash', `0x${'aa'.repeat(32)}`, true)

      const invoice = getInvoice('integrityhash')
      expect(invoice?.invoiceId).toBe('INTEGRITY-TEST')
      expect(invoice?.invoiceUrl).toBe('https://voidpay.xyz/pay#integrityhash')
      expect(invoice?.source).toBe('received')
      expect(invoice?.txHash).toBe(`0x${'aa'.repeat(32)}`)
      expect(invoice?.txHashValidated).toBe(true)
      expect(invoice?.paidAt).toBeDefined()
      expect(invoice?.key).toBe('integrityhash')
    })
  })

  describe('trackView', () => {
    it('creates new entry when key does not exist', () => {
      const { trackView } = useTrackedInvoiceStore.getState()

      trackView({
        key: 'newviewhash',
        invoiceId: 'NEW-VIEW',
        invoiceUrl: 'https://voidpay.xyz/pay#newviewhash',
        source: 'received',
        viewedAt: '2026-03-10T12:00:00Z',
      })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(1)
      expect(state.invoices[0].invoiceId).toBe('NEW-VIEW')
      expect(state.invoices[0].source).toBe('received')
      expect(state.invoices[0].viewedAt).toBe('2026-03-10T12:00:00Z')
      expect(state.invoices[0].key).toBe('newviewhash')
      // New entry must not have stale payment fields
      expect(state.invoices[0].txHash).toBeUndefined()
      expect(state.invoices[0].txHashValidated).toBeUndefined()
      expect(state.invoices[0].finalized).toBeUndefined()
    })

    it('preserves txHash, txHashValidated, finalized, paidAt on re-view', () => {
      const { addInvoice, setTxHash, setValidated, setFinalized, trackView } =
        useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'PAID-VIEW' }, 'paidviewhash'))
      setTxHash('paidviewhash', `0x${'ab'.repeat(32)}`, false)
      setValidated('paidviewhash', true)
      setFinalized('paidviewhash')

      trackView({
        key: 'paidviewhash',
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
      expect(inv.key).toBe('paidviewhash')
    })

    it('preserves confirmations and error fields on re-view', () => {
      const { addInvoice, setTxHash, setConfirmations, setError, trackView } =
        useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'CONFIRM-VIEW' }, 'confirmviewhash'))
      setTxHash('confirmviewhash', `0x${'cd'.repeat(32)}`, false)
      setConfirmations('confirmviewhash', { current: 2, required: 3 })
      setError('confirmviewhash', 'some error')

      trackView({
        key: 'confirmviewhash',
        invoiceId: 'CONFIRM-VIEW',
        invoiceUrl: 'https://voidpay.xyz/pay#confirmviewhash',
        source: 'received',
        viewedAt: '2026-03-10T15:00:00Z',
      })

      const inv = useTrackedInvoiceStore.getState().invoices[0]
      expect(inv.txHash).toBe(`0x${'cd'.repeat(32)}`)
      expect(inv.confirmations).toEqual({ current: 2, required: 3 })
      expect(inv.error).toBe('some error')
      expect(inv.key).toBe('confirmviewhash')
    })

    it('updates source on re-view', () => {
      const { addInvoice, trackView } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'SRC', source: 'created' }, 'srchash'))

      trackView({
        key: 'srchash',
        invoiceId: 'SRC',
        invoiceUrl: 'https://voidpay.xyz/pay#srchash',
        source: 'received',
        viewedAt: '2026-03-10T16:00:00Z',
      })

      expect(useTrackedInvoiceStore.getState().invoices[0].source).toBe('received')
    })

    it('moves viewed invoice to top of list (MRU order)', () => {
      const { addInvoice, trackView } = useTrackedInvoiceStore.getState()

      addInvoice(createMockTrackedInvoice({ invoiceId: 'A' }, 'hashA'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'B' }, 'hashB'))
      addInvoice(createMockTrackedInvoice({ invoiceId: 'C' }, 'hashC'))
      // Order: C, B, A

      trackView({
        key: 'hashA',
        invoiceId: 'A',
        invoiceUrl: 'https://voidpay.xyz/pay#hashA',
        source: 'received',
        viewedAt: '2026-03-10T17:00:00Z',
      })

      const ids = useTrackedInvoiceStore.getState().invoices.map(i => i.invoiceId)
      expect(ids[0]).toBe('A')
    })

    it('respects MAX_INVOICES limit', () => {
      const { addInvoice, trackView } = useTrackedInvoiceStore.getState()

      for (let i = 0; i < 50; i++) {
        addInvoice(createMockTrackedInvoice({ invoiceId: `FILL-${i}` }, `fill${i}`))
      }

      trackView({
        key: 'overflowhash',
        invoiceId: 'OVERFLOW',
        invoiceUrl: 'https://voidpay.xyz/pay#overflowhash',
        source: 'received',
        viewedAt: '2026-03-10T18:00:00Z',
      })

      const state = useTrackedInvoiceStore.getState()
      expect(state.invoices).toHaveLength(50)
      expect(state.invoices[0].invoiceId).toBe('OVERFLOW')
      expect(state.invoices[0].key).toBe('overflowhash')
    })
  })

  describe('store hardening', () => {
    // W3-013: addInvoice merge-upsert must NOT inherit stale payment fields
    describe('addInvoice resets payment fields on upsert (W3-013)', () => {
      it('clears txHash when re-adding same invoice hash', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-POISON' }, 'mergepoisonhash'))
        setTxHash('mergepoisonhash', `0x${'a'.repeat(64)}` as `0x${string}`, false)

        // Re-add same invoice (simulating URL re-open / update)
        addInvoice(
          createMockTrackedInvoice({
            invoiceId: 'MERGE-POISON',
            invoiceUrl: 'https://voidpay.xyz/pay#mergepoisonhash',
          }, 'mergepoisonhash')
        )

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'mergepoisonhash')!
        expect(inv.txHash).toBeUndefined()
      })

      it('clears txHashValidated when re-adding same invoice hash', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-VALIDATED' }, 'mergevalidatedhash'))
        setTxHash('mergevalidatedhash', `0x${'b'.repeat(64)}` as `0x${string}`, true)

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-VALIDATED' }, 'mergevalidatedhash'))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'mergevalidatedhash')!
        expect(inv.txHashValidated).toBeUndefined()
      })

      it('clears paidAt when re-adding same invoice hash', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-PAIDAT' }, 'mergepaidathash'))
        setTxHash('mergepaidathash', `0x${'c'.repeat(64)}` as `0x${string}`, true)

        // Sanity: paidAt is set
        expect(useTrackedInvoiceStore.getState().invoices[0].paidAt).toBeDefined()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-PAIDAT' }, 'mergepaidathash'))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'mergepaidathash')!
        expect(inv.paidAt).toBeUndefined()
      })

      it('clears finalized when re-adding same invoice hash', () => {
        const { addInvoice, setTxHash, setValidated, setFinalized } =
          useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-FINALIZED' }, 'mergefinalizedhash'))
        setTxHash('mergefinalizedhash', `0x${'d'.repeat(64)}` as `0x${string}`)
        setValidated('mergefinalizedhash', true)
        setFinalized('mergefinalizedhash')

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-FINALIZED' }, 'mergefinalizedhash'))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'mergefinalizedhash')!
        expect(inv.finalized).toBeUndefined()
      })

      it('clears confirmations when re-adding same invoice hash', () => {
        const { addInvoice, setConfirmations } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-CONFIRM' }, 'mergeconfirmhash'))
        setConfirmations('mergeconfirmhash', { current: 6, required: 12 })

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-CONFIRM' }, 'mergeconfirmhash'))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'mergeconfirmhash')!
        expect(inv.confirmations).toBeUndefined()
      })

      it('clears error when re-adding same invoice hash', () => {
        const { addInvoice, setError } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-ERROR' }, 'mergeerrorhash'))
        setError('mergeerrorhash', 'some error from previous payment attempt')

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-ERROR' }, 'mergeerrorhash'))

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'mergeerrorhash')!
        // error must be reset to undefined on re-open — no stale state leak
        expect(inv.error).toBeUndefined()
      })

      it('still preserves createdAt and updates non-payment fields on upsert', () => {
        const { addInvoice } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'MERGE-PRESERVE', source: 'created' }, 'mergepreservehash'))
        const originalCreatedAt = useTrackedInvoiceStore.getState().invoices[0].createdAt

        // Re-add with same hash but different source - invoiceUrl should use the same hash
        addInvoice(
          createMockTrackedInvoice({
            invoiceId: 'MERGE-PRESERVE',
            source: 'received',
          }, 'mergepreservehash')
        )

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'mergepreservehash')!
        expect(inv.source).toBe('received')
        expect(inv.invoiceUrl).toBe('https://voidpay.xyz/pay#mergepreservehash')
        expect(inv.createdAt).toBe(originalCreatedAt)
      })
    })

    // W3-014: setValidated must guard against missing txHash
    describe('setValidated rejects when no txHash (W3-014)', () => {
      it('does not set txHashValidated when invoice has no txHash', () => {
        const { addInvoice, setValidated } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATE-NO-TX' }, 'validatenotxhash'))

        // Guard: invoice has no txHash — setValidated should be a no-op
        setValidated('validatenotxhash', true)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'validatenotxhash')!
        expect(inv.txHashValidated).toBeUndefined()
      })

      it('does not set paidAt when invoice has no txHash', () => {
        const { addInvoice, setValidated } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATE-NO-PAIDAT' }, 'validatenopaidathash'))
        setValidated('validatenopaidathash', true)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'validatenopaidathash')!
        expect(inv.paidAt).toBeUndefined()
      })

      it('sets txHashValidated when invoice already has txHash', () => {
        const { addInvoice, setTxHash, setValidated } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'VALIDATE-WITH-TX' }, 'validatewithtxhash'))
        setTxHash('validatewithtxhash', `0x${'e'.repeat(64)}` as `0x${string}`)

        // Now setValidated should work because txHash is present
        setValidated('validatewithtxhash', true)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'validatewithtxhash')!
        expect(inv.txHashValidated).toBe(true)
        expect(inv.paidAt).toBeDefined()
      })
    })

    describe('setTxHash validates hash format', () => {
      it('rejects non-hex string (not 0x-prefixed)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-NOHEX' }, 'formatnohexhash'))
        setTxHash('formatnohexhash', 'not-a-hash' as any)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'formatnohexhash')!
        expect(inv.txHash).toBeUndefined()
      })

      it('rejects hash that is too short (< 66 chars)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-SHORT' }, 'formatshorthash'))
        setTxHash('formatshorthash', '0x123' as any)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'formatshorthash')!
        expect(inv.txHash).toBeUndefined()
      })

      it('accepts valid 32-byte hex hash (0x + 64 hex chars)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()
        const validHash = `0x${'a'.repeat(64)}` as `0x${string}`

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-VALID' }, 'formatvalidhash'))
        setTxHash('formatvalidhash', validHash)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'formatvalidhash')!
        expect(inv.txHash).toBe(validHash)
      })

      it('accepts valid hash with uppercase hex chars', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()
        const validHash = `0x${'A'.repeat(64)}` as `0x${string}`

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-UPPER' }, 'formatupperhash'))
        setTxHash('formatupperhash', validHash)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'formatupperhash')!
        expect(inv.txHash).toBe(validHash)
      })

      it('rejects hash that is too long (> 66 chars)', () => {
        const { addInvoice, setTxHash } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FORMAT-LONG' }, 'formatlonghash'))
        setTxHash('formatlonghash', `0x${'a'.repeat(65)}` as any)

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'formatlonghash')!
        expect(inv.txHash).toBeUndefined()
      })
    })

    describe('setFinalized only when validated', () => {
      it('does not set finalized when invoice is not validated', () => {
        const { addInvoice, setTxHash, setFinalized } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FINALIZE-UNVALIDATED' }, 'finalizeunvalidatedhash'))
        setTxHash('finalizeunvalidatedhash', `0x${'f'.repeat(64)}` as `0x${string}`)
        // txHashValidated is false — setFinalized must be a no-op

        setFinalized('finalizeunvalidatedhash')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'finalizeunvalidatedhash')!
        expect(inv.finalized).toBeUndefined()
      })

      it('does not set finalized when invoice has no txHash at all', () => {
        const { addInvoice, setFinalized } = useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FINALIZE-NOTX' }, 'finalizenotxhash'))
        setFinalized('finalizenotxhash')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'finalizenotxhash')!
        expect(inv.finalized).toBeUndefined()
      })

      it('sets finalized when invoice has txHash AND is validated', () => {
        const { addInvoice, setTxHash, setValidated, setFinalized } =
          useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'FINALIZE-OK' }, 'finalizeokhash'))
        setTxHash('finalizeokhash', `0x${'1'.repeat(64)}` as `0x${string}`)
        setValidated('finalizeokhash', true)

        setFinalized('finalizeokhash')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'finalizeokhash')!
        expect(inv.finalized).toBe(true)
      })

      it('handles non-existent key gracefully', () => {
        const { setFinalized } = useTrackedInvoiceStore.getState()

        // Should not throw
        expect(() => setFinalized('NON-EXISTENT')).not.toThrow()
      })
    })

    describe('resetPaymentState also resets finalized', () => {
      it('clears finalized along with other payment fields', () => {
        const { addInvoice, setTxHash, setValidated, setFinalized, resetPaymentState } =
          useTrackedInvoiceStore.getState()

        addInvoice(createMockTrackedInvoice({ invoiceId: 'RESET-FINALIZED' }, 'resetfinalizedhash'))
        setTxHash('resetfinalizedhash', `0x${'2'.repeat(64)}` as `0x${string}`)
        setValidated('resetfinalizedhash', true)
        setFinalized('resetfinalizedhash')

        // Sanity: all payment fields are set
        const before = useTrackedInvoiceStore
          .getState()
          .invoices.find((i) => i.key === 'resetfinalizedhash')!
        expect(before.txHash).toBeDefined()
        expect(before.txHashValidated).toBe(true)
        expect(before.finalized).toBe(true)

        resetPaymentState('resetfinalizedhash')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'resetfinalizedhash')!
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
            invoiceUrl: 'https://voidpay.xyz/pay#resetpreserve2hash',
            source: 'created',
          }, 'resetpreserve2hash')
        )
        setTxHash('resetpreserve2hash', `0x${'3'.repeat(64)}` as `0x${string}`)
        setValidated('resetpreserve2hash', true)
        setFinalized('resetpreserve2hash')

        resetPaymentState('resetpreserve2hash')

        const state = useTrackedInvoiceStore.getState()
        const inv = state.invoices.find((i) => i.key === 'resetpreserve2hash')!
        expect(inv.invoiceId).toBe('RESET-PRESERVE2')
        expect(inv.invoiceUrl).toBe('https://voidpay.xyz/pay#resetpreserve2hash')
        expect(inv.source).toBe('created')
        expect(inv.createdAt).toBeDefined()
        // All payment fields cleared
        expect(inv.txHash).toBeUndefined()
        expect(inv.finalized).toBeUndefined()
      })
    })

    describe('key-based collision prevention', () => {
      it('prevents collision between invoices with same invoiceId but different hashes', () => {
        const { addInvoice, setTxHash, getInvoice } = useTrackedInvoiceStore.getState()

        // Sender A sends invoice INV-001 with hashA
        addInvoice(createMockTrackedInvoice({ invoiceId: 'INV-001' }, 'senderAhash'))
        setTxHash('senderAhash', `0x${'aa'.repeat(32)}`)

        // Sender B sends invoice INV-001 with hashB (different invoice data)
        addInvoice(createMockTrackedInvoice({ invoiceId: 'INV-001' }, 'senderBhash'))
        setTxHash('senderBhash', `0x${'bb'.repeat(32)}`)

        const state = useTrackedInvoiceStore.getState()
        expect(state.invoices).toHaveLength(2)

        // Each invoice should have its own txHash
        const invoiceA = getInvoice('senderAhash')
        const invoiceB = getInvoice('senderBhash')

        expect(invoiceA?.txHash).toBe(`0x${'aa'.repeat(32)}`)
        expect(invoiceB?.txHash).toBe(`0x${'bb'.repeat(32)}`)
        expect(invoiceA?.invoiceId).toBe('INV-001')
        expect(invoiceB?.invoiceId).toBe('INV-001')
      })

      it('allows same invoice to be stored with different URLs (different hashes)', () => {
        const { addInvoice } = useTrackedInvoiceStore.getState()

        // Same invoice data, but different hash due to different salt/timestamp
        addInvoice(createMockTrackedInvoice({ invoiceId: 'SAME' }, 'hash1'))
        addInvoice(createMockTrackedInvoice({ invoiceId: 'SAME' }, 'hash2'))
        addInvoice(createMockTrackedInvoice({ invoiceId: 'SAME' }, 'hash3'))

        const state = useTrackedInvoiceStore.getState()
        expect(state.invoices).toHaveLength(3)
        expect(state.invoices.every(i => i.invoiceId === 'SAME')).toBe(true)
        expect(new Set(state.invoices.map(i => i.key)).size).toBe(3)
      })
    })
  })
})
