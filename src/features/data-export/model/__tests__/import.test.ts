import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCreatorStore } from '@/entities/creator'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { importUserData } from '../import'

// Mock computeContentHash used by import for legacy entries without contentHash
vi.mock('@/features/invoice-codec', () => ({
  computeContentHash: vi.fn((fragment: string) => `${fragment}-computed-hash`),
}))

describe('importUserData', () => {
  beforeEach(() => {
    useCreatorStore.setState({
      preferences: { includeOgImage: true, magicDustEnabled: true },
      idCounter: { currentValue: 1, prefix: 'INV' },
      templates: [],
    })
    useTrackedInvoiceStore.setState({ invoices: [] })
  })

  const validImport = {
    version: 1 as const,
    exportedAt: '2024-01-01T00:00:00Z',
    creator: {
      version: 1,
      activeDraft: null,
      templates: [{ id: 't1', name: 'Template 1' }],
      preferences: { includeOgImage: false },
      idCounter: { currentValue: 5, prefix: 'INV' },
    },
    trackedInvoices: {
      invoices: [
        {
          contentHash: 'abc-hash',
          invoiceId: 'INV-001',
          invoiceUrl: 'https://voidpay.xyz/pay#abc',
          source: 'created' as const,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    },
  }

  it('returns success with stats on valid import', async () => {
    const result = await importUserData(validImport)

    expect(result.success).toBe(true)
    expect(result.stats).toEqual({
      templates: 1,
      history: 0,
      trackedInvoices: 1,
      skippedInvoices: 0,
    })
  })

  it('merges preferences from import', async () => {
    await importUserData(validImport)

    const { preferences } = useCreatorStore.getState()
    expect(preferences.includeOgImage).toBe(false)
  })

  it('imports tracked invoices', async () => {
    await importUserData(validImport)

    const { invoices } = useTrackedInvoiceStore.getState()
    expect(invoices.length).toBeGreaterThanOrEqual(1)
  })

  it('handles import without trackedInvoices', async () => {
    const { trackedInvoices: _, ...withoutTracked } = validImport
    const result = await importUserData(withoutTracked)

    expect(result.success).toBe(true)
    expect(result.stats?.trackedInvoices).toBe(0)
  })

  it('returns error on invalid data', async () => {
    const result = await importUserData({ invalid: true })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error on null input', async () => {
    const result = await importUserData(null)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error on wrong version', async () => {
    const result = await importUserData({ ...validImport, version: 99 })

    expect(result.success).toBe(false)
  })

  it('strips forged validation flags and skips unsafe URLs on import', async () => {
    const { useTrackedInvoiceStore } = await import('@/entities/invoice')
    useTrackedInvoiceStore.getState().clearAll()

    const forgedInvoice = {
      contentHash: 'forged-hash-1',
      invoiceId: 'INV-FORGED',
      invoiceUrl: '/pay#validpayload',
      source: 'received' as const,
      txHash: ('0x' + 'a'.repeat(64)) as `0x${string}`,
      txHashValidated: true,
      finalized: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    const unsafeUrlInvoice = {
      contentHash: 'unsafe-hash-1',
      invoiceId: 'INV-XSS',
      invoiceUrl: 'javascript:alert(1)',
      source: 'received' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    }

    const result = await importUserData({
      ...validImport,
      trackedInvoices: {
        ...validImport.trackedInvoices,
        invoices: [forgedInvoice, unsafeUrlInvoice],
      },
    })

    expect(result.success).toBe(true)
    const stored = useTrackedInvoiceStore.getState().invoices
    const storedForged = stored.find((inv) => inv.invoiceId === 'INV-FORGED')
    expect(storedForged).toBeDefined()
    expect(storedForged?.contentHash).toBe('validpayload-computed-hash')
    expect(storedForged?.txHash).toBeUndefined()
    expect(storedForged?.txHashValidated).toBeUndefined()
    expect(storedForged?.finalized).toBeUndefined()
    expect(stored.find((inv) => inv.invoiceId === 'INV-XSS')).toBeUndefined()
  })

  it('does not downgrade payment state of an existing invoice on re-import', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [
        {
          contentHash: 'abc-computed-hash',
          invoiceId: 'INV-001',
          invoiceUrl: 'https://voidpay.xyz/pay#abc',
          source: 'created',
          createdAt: '2026-01-01T00:00:00.000Z',
          txHash: ('0x' + 'a'.repeat(64)) as `0x${string}`,
          txHashValidated: true,
          paidAt: '2026-01-02T00:00:00.000Z',
          finalized: true,
        },
      ],
    })

    const result = await importUserData(validImport)

    expect(result.success).toBe(true)
    const stored = useTrackedInvoiceStore.getState().invoices
    expect(stored).toHaveLength(1)
    expect(stored[0]?.txHashValidated).toBe(true)
    expect(stored[0]?.finalized).toBe(true)
    expect(stored[0]?.txHash).toBe('0x' + 'a'.repeat(64))
    expect(stored[0]?.paidAt).toBe('2026-01-02T00:00:00.000Z')
  })

  describe('preferences hardening', () => {
    const withPrefs = (preferences: unknown) => ({
      ...validImport,
      creator: { ...validImport.creator, preferences },
    })

    it('ignores a non-boolean magicDustEnabled', async () => {
      const result = await importUserData(withPrefs({ magicDustEnabled: 'no' }))

      expect(result.success).toBe(true)
      expect(useCreatorStore.getState().preferences.magicDustEnabled).toBe(true)
    })

    it('does not apply unknown preference keys', async () => {
      await importUserData(withPrefs({ evil: 'x', includeOgImage: false }))

      const prefs = useCreatorStore.getState().preferences as Record<string, unknown>
      expect(prefs.evil).toBeUndefined()
      expect(prefs.includeOgImage).toBe(false)
    })

    it('applies valid booleans', async () => {
      await importUserData(withPrefs({ includeOgImage: false, magicDustEnabled: false }))

      const { preferences } = useCreatorStore.getState()
      expect(preferences.includeOgImage).toBe(false)
      expect(preferences.magicDustEnabled).toBe(false)
    })

    it('keeps valid keys when a sibling key is garbage', async () => {
      await importUserData(withPrefs({ includeOgImage: false, defaultCurrency: 42 }))

      const { preferences } = useCreatorStore.getState()
      expect(preferences.includeOgImage).toBe(false)
      expect(preferences.defaultCurrency).toBeUndefined()
    })
  })

  describe('invoice URL origin check', () => {
    const importUrl = (invoiceUrl: string) =>
      importUserData({
        ...validImport,
        trackedInvoices: {
          invoices: [
            {
              invoiceId: 'INV-U',
              invoiceUrl,
              source: 'received',
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      })

    it('rejects off-origin absolute URLs', async () => {
      const result = await importUrl('https://evil.tld/pay#abc')

      expect(result.stats?.trackedInvoices).toBe(0)
      expect(result.stats?.skippedInvoices).toBe(1)
      expect(useTrackedInvoiceStore.getState().invoices).toHaveLength(0)
    })

    it('accepts canonical-origin, current-origin and relative URLs', async () => {
      for (const url of [
        'https://voidpay.xyz/pay#abc',
        `${window.location.origin}/pay#def`,
        '/invoice#ghi',
      ]) {
        const result = await importUrl(url)
        expect(result.stats?.trackedInvoices).toBe(1)
        useTrackedInvoiceStore.setState({ invoices: [] })
      }
    })
  })

  describe('per-entry tolerance (legacy backups)', () => {
    it('imports valid entries, skips and counts garbage ones', async () => {
      const result = await importUserData({
        version: 1,
        exportedAt: '2026-02-28T00:00:00Z',
        creator: { version: 1 },
        trackedInvoices: {
          invoices: [
            { invoiceId: 'OLD-1', invoiceUrl: '/pay#aaa', source: 'created' },
            { invoiceUrl: '/pay#bbb', source: 'created' },
            'garbage',
            {
              invoiceId: 'OLD-2',
              invoiceUrl: '/pay#ccc',
              source: 'received',
              createdAt: '2026-02-01T00:00:00Z',
            },
          ],
        },
      })

      expect(result.success).toBe(true)
      expect(result.stats?.trackedInvoices).toBe(2)
      expect(result.stats?.skippedInvoices).toBe(2)
      const ids = useTrackedInvoiceStore.getState().invoices.map((i) => i.invoiceId)
      expect(ids.sort()).toEqual(['OLD-1', 'OLD-2'])
    })

    it('accepts the oldest export shape (payer store, history[], no trackedInvoices)', async () => {
      const result = await importUserData({
        version: 1,
        exportedAt: '2025-12-01T00:00:00Z',
        creator: {
          version: 1,
          activeDraft: null,
          templates: [],
          history: [{ id: 'x' }],
          preferences: {},
          idCounter: { currentValue: 3, prefix: 'INV' },
        },
        payer: { version: 1, receipts: [] },
      })

      expect(result.success).toBe(true)
      expect(result.stats?.skippedInvoices).toBe(0)
    })
  })

  describe('payment status notice', () => {
    it('adds the notice when new invoices were imported', async () => {
      const result = await importUserData(validImport)

      expect(result.notice).toBe(
        "Payment status isn't restored from backups — use Check all to re-verify."
      )
    })

    it('omits the notice when nothing new was imported', async () => {
      const { trackedInvoices: _, ...withoutTracked } = validImport
      const result = await importUserData(withoutTracked)

      expect(result.notice).toBeUndefined()
    })
  })
})
