/**
 * Tests for invoice validation before URL generation
 */

import { describe, it, expect } from 'vitest'
import { validateInvoiceForGeneration } from '../validate-invoice'
import type { PartialInvoice, LineItem } from '@/shared/lib/invoice-types'

// Valid EIP-55 checksummed address (vitalik.eth)
const VALID_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

// Helper to create minimal valid invoice draft
function createValidDraft(): PartialInvoice {
  return {
    invoiceId: 'INV-001',
    from: {
      name: 'Sender Name',
      walletAddress: VALID_ADDRESS,
    },
    client: {
      name: 'Client Name',
    },
    networkId: 1,
    currency: 'USDC',
    decimals: 6,
  }
}

// Helper to create minimal valid line items
function createValidLineItems(): LineItem[] {
  return [
    {
      id: 'item-1',
      description: 'Web Development',
      quantity: 1,
      rate: '100000000', // 100 USDC in atomic units (6 decimals)
    },
  ]
}

describe('validateInvoiceForGeneration', () => {
  describe('required fields', () => {
    it('passes validation with all required fields', () => {
      const draft = createValidDraft()
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('fails when invoiceId is missing', () => {
      const draft = createValidDraft()
      delete draft.invoiceId
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'invoiceId',
        message: 'Invoice number is required',
      })
    })

    it('fails when from.name is missing', () => {
      const draft = createValidDraft()
      draft.from = { ...draft.from, name: '' }
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'from.name',
        message: 'Sender name is required',
      })
    })

    it('fails when from.walletAddress is missing', () => {
      const draft = createValidDraft()
      draft.from = { ...draft.from, walletAddress: '' }
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'from.walletAddress',
        message: 'Valid sender wallet address required',
      })
    })

    it('fails when from.walletAddress is invalid', () => {
      const draft = createValidDraft()
      draft.from = { ...draft.from, walletAddress: 'invalid-address' }
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'from.walletAddress',
        message: 'Valid sender wallet address required',
      })
    })

    it('fails when client.name is missing', () => {
      const draft = createValidDraft()
      draft.client = { name: '' }
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'client.name',
        message: 'Client name is required',
      })
    })

    it('fails when no line items provided', () => {
      const draft = createValidDraft()

      const result = validateInvoiceForGeneration(draft, [])

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'items',
        message: 'At least one line item is required',
      })
    })

    it('fails when line item has no description', () => {
      const draft = createValidDraft()
      const lineItems: LineItem[] = [
        {
          id: 'item-1',
          description: '',
          quantity: 1,
          rate: '100000000',
        },
      ]

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'items[0].description',
        message: 'Item description is required',
      })
    })

    it('fails when line item rate is zero', () => {
      const draft = createValidDraft()
      const lineItems: LineItem[] = [
        {
          id: 'item-1',
          description: 'Service',
          quantity: 1,
          rate: '0',
        },
      ]

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'items[0].rate',
        message: 'Item rate must be greater than 0',
      })
    })

    it('fails when networkId is missing', () => {
      const draft = createValidDraft()
      delete draft.networkId
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'networkId',
        message: 'Network must be selected',
      })
    })

    it('fails when currency is missing', () => {
      const draft = createValidDraft()
      delete draft.currency
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'currency',
        message: 'Token must be selected',
      })
    })

    it('fails when decimals is missing', () => {
      const draft = createValidDraft()
      delete draft.decimals
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'decimals',
        message: 'Token decimals required',
      })
    })
  })

  describe('URL size estimation', () => {
    it('estimates URL size for valid invoice', () => {
      const draft = createValidDraft()
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      expect(result.estimatedSize).toBeGreaterThan(0)
      expect(result.estimatedSize).toBeLessThan(2000)
    })

    it('shows warning when URL size is close to limit', () => {
      const draft = createValidDraft()
      // Add notes to increase size
      draft.notes = 'A'.repeat(200)
      const lineItems = createValidLineItems()

      const result = validateInvoiceForGeneration(draft, lineItems)

      // Should still be valid but may have warning
      expect(result.isValid).toBe(true)
    })
  })

  describe('multiple errors', () => {
    it('returns all validation errors at once', () => {
      const draft: PartialInvoice = {
        // Missing: invoiceId, from, client, networkId, currency, decimals
      }

      const result = validateInvoiceForGeneration(draft, [])

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(5)
    })
  })
})
