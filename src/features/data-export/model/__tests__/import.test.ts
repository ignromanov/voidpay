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
})
