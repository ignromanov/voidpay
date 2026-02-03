/**
 * Tests for building full Invoice from draft and line items
 */

import { describe, it, expect } from 'vitest'
import { buildInvoiceFromDraft } from '../build-invoice'
import type { PartialInvoice, LineItem } from '@/shared/lib/invoice-types'

describe('buildInvoiceFromDraft', () => {
  it('builds complete invoice from draft and line items', () => {
    const draft: PartialInvoice = {
      invoiceId: 'INV-001',
      iss: '2026-01-26',
      due: '2026-02-26',
      from: {
        name: 'Sender Company',
        walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        email: 'sender@example.com',
      },
      client: {
        name: 'Client Company',
        email: 'client@example.com',
      },
      networkId: 1,
      currency: 'USDC',
      decimals: 6,
      notes: 'Thank you for your business',
    }

    const lineItems: LineItem[] = [
      {
        id: 'temp-1',
        description: 'Web Development',
        quantity: 10,
        rate: '100000000', // 100 USDC
      },
      {
        id: 'temp-2',
        description: 'Design Services',
        quantity: 5,
        rate: '50000000', // 50 USDC
      },
    ]

    const invoice = buildInvoiceFromDraft(draft, lineItems)

    // Check all fields are transferred
    expect(invoice.invoiceId).toBe('INV-001')
    expect(invoice.iss).toBe('2026-01-26')
    expect(invoice.due).toBe('2026-02-26')
    expect(invoice.from.name).toBe('Sender Company')
    expect(invoice.from.walletAddress).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    expect(invoice.client.name).toBe('Client Company')
    expect(invoice.networkId).toBe(1)
    expect(invoice.currency).toBe('USDC')
    expect(invoice.decimals).toBe(6)
    expect(invoice.notes).toBe('Thank you for your business')

    // Check items are converted (id stripped)
    expect(invoice.items).toHaveLength(2)
    expect(invoice.items[0]).toEqual({
      description: 'Web Development',
      quantity: 10,
      rate: '100000000',
    })
    expect(invoice.items[1]).toEqual({
      description: 'Design Services',
      quantity: 5,
      rate: '50000000',
    })

    // Ensure id is NOT in final items
    expect((invoice.items[0] as LineItem).id).toBeUndefined()
  })

  it('handles optional fields gracefully', () => {
    const draft: PartialInvoice = {
      invoiceId: 'INV-002',
      from: {
        name: 'Sender',
        walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      },
      client: {
        name: 'Client',
      },
      networkId: 42161,
      currency: 'ETH',
      decimals: 18,
      // No iss, due, notes, tax, discount
    }

    const lineItems: LineItem[] = [
      {
        id: 'temp-1',
        description: 'Service',
        quantity: 1,
        rate: '1000000000000000000', // 1 ETH
      },
    ]

    const invoice = buildInvoiceFromDraft(draft, lineItems)

    expect(invoice.invoiceId).toBe('INV-002')
    expect(invoice.iss).toBeUndefined()
    expect(invoice.due).toBeUndefined()
    expect(invoice.notes).toBeUndefined()
    expect(invoice.items).toHaveLength(1)
  })

  it('preserves tax and discount fields', () => {
    const draft: PartialInvoice = {
      invoiceId: 'INV-003',
      from: {
        name: 'Sender',
        walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      },
      client: {
        name: 'Client',
      },
      networkId: 1,
      currency: 'USDC',
      decimals: 6,
      tax: '10%',
      discount: '5%',
    }

    const lineItems: LineItem[] = [
      {
        id: 'temp-1',
        description: 'Product',
        quantity: 2,
        rate: '50000000',
      },
    ]

    const invoice = buildInvoiceFromDraft(draft, lineItems)

    expect(invoice.tax).toBe('10%')
    expect(invoice.discount).toBe('5%')
  })

  it('handles empty line items array', () => {
    const draft: PartialInvoice = {
      invoiceId: 'INV-004',
      from: {
        name: 'Sender',
        walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      },
      client: {
        name: 'Client',
      },
      networkId: 1,
      currency: 'USDC',
      decimals: 6,
    }

    const invoice = buildInvoiceFromDraft(draft, [])

    expect(invoice.items).toEqual([])
  })
})
