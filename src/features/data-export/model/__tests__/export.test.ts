import { describe, it, expect, beforeEach } from 'vitest'
import { useCreatorStore } from '@/entities/creator'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { exportUserData } from '../export'

describe('exportUserData', () => {
  beforeEach(() => {
    useCreatorStore.setState({
      version: 1,
      activeDraft: null,
      lineItems: [],
      templates: [],
      preferences: { includeOgImage: true, magicDustEnabled: true },
      idCounter: { currentValue: 1, prefix: 'INV' },
    })
    useTrackedInvoiceStore.setState({ invoices: [] })
  })

  it('returns version 1 export structure', () => {
    const data = exportUserData()

    expect(data.version).toBe(1)
    expect(data.exportedAt).toBeDefined()
    expect(data.creator).toBeDefined()
    expect(data.trackedInvoices).toBeDefined()
  })

  it('includes creator store state', () => {
    useCreatorStore.setState({ idCounter: { currentValue: 42, prefix: 'BILL' } })

    const data = exportUserData()

    expect(data.creator.idCounter.currentValue).toBe(42)
    expect(data.creator.idCounter.prefix).toBe('BILL')
  })

  it('includes tracked invoices', () => {
    useTrackedInvoiceStore.setState({
      invoices: [{
        invoiceId: 'INV-001',
        invoiceUrl: 'https://voidpay.xyz/pay#test',
        source: 'created',
        createdAt: '2024-01-01T00:00:00Z',
      }],
    })

    const data = exportUserData()

    expect(data.trackedInvoices.invoices).toHaveLength(1)
  })

  it('exportedAt is a valid ISO date', () => {
    const data = exportUserData()
    const date = new Date(data.exportedAt)

    expect(date.getTime()).not.toBeNaN()
  })
})
