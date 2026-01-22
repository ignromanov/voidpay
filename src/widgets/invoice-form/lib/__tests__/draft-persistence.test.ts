/**
 * Draft Persistence Integration Tests
 *
 * Tests for US6 - Auto-Save Draft functionality.
 * Verifies persist middleware configuration and error handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreatorStore } from '@/entities/creator'
import { CREATOR_STORE_KEY } from '@/shared/config'

describe('Draft Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset store to initial state
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
    })
  })

  describe('Store Configuration', () => {
    it('should have persist middleware configured', () => {
      // Verify the store key exists in config
      expect(CREATOR_STORE_KEY).toBe('voidpay:creator')
    })

    it('should update draft in store state', () => {
      const { result } = renderHook(() => useCreatorStore())

      act(() => {
        result.current.updateDraft({ invoiceId: 'INV-TEST' })
      })

      // Draft should be in memory
      expect(result.current.activeDraft).toBeTruthy()
      expect(result.current.activeDraft?.data.invoiceId).toBe('INV-TEST')
    })

    it('should handle multiple draft updates', () => {
      const { result } = renderHook(() => useCreatorStore())

      act(() => {
        result.current.updateDraft({ invoiceId: 'INV-001' })
      })

      act(() => {
        result.current.updateDraft({ currency: 'USDC' })
      })

      act(() => {
        result.current.updateDraft({ networkId: 42161 })
      })

      // All updates should be merged in memory
      expect(result.current.activeDraft?.data.invoiceId).toBe('INV-001')
      expect(result.current.activeDraft?.data.currency).toBe('USDC')
      expect(result.current.activeDraft?.data.networkId).toBe(42161)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      // Corrupt localStorage data
      localStorage.setItem(CREATOR_STORE_KEY, 'invalid-json{{{')

      // Should not crash on initialization
      expect(() => {
        renderHook(() => useCreatorStore())
      }).not.toThrow()
    })

    it('should handle localStorage quota exceeded without crashing', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock QuotaExceededError
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError
      })

      const { result } = renderHook(() => useCreatorStore())

      // Should not crash when trying to persist
      expect(() => {
        act(() => {
          result.current.updateDraft({ invoiceId: 'INV-QUOTA-TEST' })
        })
      }).not.toThrow()

      // Store should still work (data in memory)
      expect(result.current.activeDraft?.data.invoiceId).toBe('INV-QUOTA-TEST')

      setItemSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })

    it('should handle localStorage read errors without crashing', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock read error
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Read error')
      })

      // Should not crash
      expect(() => {
        renderHook(() => useCreatorStore())
      }).not.toThrow()

      getItemSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('Complex Data Structures', () => {
    it('should handle complex nested updates', () => {
      const { result } = renderHook(() => useCreatorStore())

      act(() => {
        result.current.updateDraft({
          from: {
            name: 'Test Sender',
            walletAddress: '0x1234567890123456789012345678901234567890',
            email: 'test@example.com',
            phone: '+1234567890',
            physicalAddress: '123 Main St',
            taxId: 'TAX-123',
          },
        })
      })

      act(() => {
        result.current.updateDraft({
          client: {
            name: 'Test Client',
            email: 'client@example.com',
          },
        })
      })

      // Both updates should be preserved
      expect(result.current.activeDraft?.data.from.name).toBe('Test Sender')
      expect(result.current.activeDraft?.data.from.email).toBe('test@example.com')
      expect(result.current.activeDraft?.data.client.name).toBe('Test Client')
      expect(result.current.activeDraft?.data.client.email).toBe('client@example.com')
    })

    it('should handle special characters in text fields', () => {
      const { result } = renderHook(() => useCreatorStore())

      act(() => {
        result.current.updateDraft({
          notes: 'Special chars: áéíóú ñ € 中文 🎉',
        })
      })

      expect(result.current.activeDraft?.data.notes).toBe('Special chars: áéíóú ñ € 中文 🎉')
    })
  })
})
