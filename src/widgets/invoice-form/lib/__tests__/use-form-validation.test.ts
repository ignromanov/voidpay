import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFormValidation } from '../use-form-validation'
import type { DraftState, LineItem } from '@/shared/lib/invoice-types'

// Helper to create mock draft
const createMockDraft = (overrides: Partial<DraftState['data']> = {}): DraftState => ({
  meta: {
    draftId: 'test-draft-id',
    lastModified: new Date().toISOString(),
  },
  data: {
    invoiceId: 'INV-001',
    from: {
      name: 'Test Sender',
      walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Valid EIP-55 checksum (vitalik.eth)
    },
    client: {
      name: 'Test Client',
    },
    networkId: 42161,
    currency: 'USDC',
    ...overrides,
  },
})

// Helper to create mock line items
const createMockLineItems = (count: number = 1): LineItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    description: `Service ${i + 1}`,
    quantity: 1,
    rate: '100',
  }))

describe('useFormValidation', () => {
  describe('canGenerate', () => {
    it('should return true when all required fields are valid', () => {
      const draft = createMockDraft()
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(true)
    })

    it('should return false when draft is null', () => {
      const { result } = renderHook(() => useFormValidation(null, []))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when invoiceId is empty', () => {
      const draft = createMockDraft({ invoiceId: '' })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when sender name is empty', () => {
      const draft = createMockDraft({
        from: { name: '', walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when client name is empty', () => {
      const draft = createMockDraft({
        client: { name: '' },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when no line items exist', () => {
      const draft = createMockDraft()
      const lineItems: LineItem[] = []

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when line item has empty description', () => {
      const draft = createMockDraft()
      const lineItems: LineItem[] = [{ id: 'item-1', description: '', quantity: 1, rate: '100' }]

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when line item has zero price', () => {
      const draft = createMockDraft()
      const lineItems: LineItem[] = [
        { id: 'item-1', description: 'Service', quantity: 1, rate: '0' },
      ]

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when more than 5 line items', () => {
      const draft = createMockDraft()
      const lineItems = createMockLineItems(6)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when networkId is missing', () => {
      const draft = createMockDraft({ networkId: 0 })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })

    it('should return false when currency is missing', () => {
      const draft = createMockDraft({ currency: '' })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
    })
  })

  describe('EIP-55 wallet address validation', () => {
    it('should return true for valid checksummed address', () => {
      const draft = createMockDraft({
        from: {
          name: 'Test',
          walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Valid checksum
        },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(true)
      expect(result.current.fieldValidation.senderWallet).toBe(true)
    })

    it('should return true for valid lowercase address (viem accepts it)', () => {
      const draft = createMockDraft({
        from: {
          name: 'Test',
          walletAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // Lowercase
        },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      // viem's isAddress accepts lowercase
      expect(result.current.fieldValidation.senderWallet).toBe(true)
    })

    it('should return false for invalid checksum address', () => {
      const draft = createMockDraft({
        from: {
          name: 'Test',
          walletAddress: '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045', // Wrong checksum (all caps)
        },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      // viem's isAddress enforces strict EIP-55 checksum for mixed-case addresses
      expect(result.current.canGenerate).toBe(false)
      expect(result.current.fieldValidation.senderWallet).toBe(false)
    })

    it('should return false for non-hex characters', () => {
      const draft = createMockDraft({
        from: {
          name: 'Test',
          walletAddress: '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', // Invalid hex
        },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
      expect(result.current.fieldValidation.senderWallet).toBe(false)
    })

    it('should return false for wrong length address', () => {
      const draft = createMockDraft({
        from: {
          name: 'Test',
          walletAddress: '0x123', // Too short
        },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
      expect(result.current.fieldValidation.senderWallet).toBe(false)
    })

    it('should return false for empty wallet address', () => {
      const draft = createMockDraft({
        from: {
          name: 'Test',
          walletAddress: '',
        },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
      expect(result.current.fieldValidation.senderWallet).toBe(false)
    })

    it('should return false for undefined wallet address', () => {
      const draft = createMockDraft({
        from: {
          name: 'Test',
          walletAddress: undefined,
        },
      })
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.canGenerate).toBe(false)
      expect(result.current.fieldValidation.senderWallet).toBe(false)
    })
  })

  describe('fieldValidation', () => {
    it('should track individual field validation states', () => {
      const draft = createMockDraft()
      const lineItems = createMockLineItems(1)

      const { result } = renderHook(() => useFormValidation(draft, lineItems))

      expect(result.current.fieldValidation).toEqual({
        invoiceId: true,
        senderName: true,
        senderWallet: true,
        clientName: true,
        lineItems: true,
        network: true,
        token: true,
      })
    })

    it('should return all false for null draft', () => {
      const { result } = renderHook(() => useFormValidation(null, []))

      expect(result.current.fieldValidation).toEqual({
        invoiceId: false,
        senderName: false,
        senderWallet: false,
        clientName: false,
        lineItems: false,
        network: false,
        token: false,
      })
    })
  })
})
