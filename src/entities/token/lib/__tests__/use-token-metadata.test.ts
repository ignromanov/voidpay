import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTokenMetadata } from '../use-token-metadata'
import type { UseReadContractsReturnType } from 'wagmi'

// Mock wagmi
vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))

// Import the mocked function for type safety
import { useReadContracts } from 'wagmi'

const mockUseReadContracts = useReadContracts as unknown as ReturnType<typeof vi.fn>

describe('useTokenMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('input validation', () => {
    it('should return null when address is undefined', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() => useTokenMetadata(undefined, 1))

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should return null when chainId is undefined', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', undefined)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should return null when address is invalid (not EIP-55 compliant with mixed case)', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      // All caps (invalid checksum for USDC address)
      const { result } = renderHook(() =>
        useTokenMetadata('0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should return null when address has non-hex characters', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should return null when address is too short', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() => useTokenMetadata('0x123', 1))

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should return null when address is empty string', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() => useTokenMetadata('', 1))

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })
  })

  describe('successful fetches', () => {
    it('should return loading state initially when valid inputs provided', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isError).toBe(false)
    })

    it('should return metadata when all contracts return success', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'success', result: 'USD Coin' },
          { status: 'success', result: 'USDC' },
          { status: 'success', result: 6 },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toEqual({
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should accept lowercase address (viem isAddress accepts it)', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'success', result: 'USD Coin' },
          { status: 'success', result: 'USDC' },
          { status: 'success', result: 6 },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1)
      )

      expect(result.current.data).toEqual({
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should accept valid checksummed address', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'success', result: 'USD Coin' },
          { status: 'success', result: 'USDC' },
          { status: 'success', result: 6 },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toEqual({
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should return null when any contract call fails', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'success', result: 'USD Coin' },
          { status: 'failure', error: new Error('Contract call failed') },
          { status: 'success', result: 6 },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should return null when first contract call fails', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'failure', error: new Error('Name call failed') },
          { status: 'success', result: 'USDC' },
          { status: 'success', result: 6 },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should return null when third contract call fails', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'success', result: 'USD Coin' },
          { status: 'success', result: 'USDC' },
          { status: 'failure', error: new Error('Decimals call failed') },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should return null when data array is incomplete', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'success', result: 'USD Coin' },
          { status: 'success', result: 'USDC' },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should return null when data is empty', () => {
      mockUseReadContracts.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should propagate isError and error from useReadContracts', () => {
      const mockError = new Error('Network error')
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(true)
      expect(result.current.error).toBe(mockError)
    })

    it('should return null error when useReadContracts error is undefined', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: undefined,
      } as UseReadContractsReturnType)

      const { result } = renderHook(() =>
        useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 1)
      )

      expect(result.current.error).toBeNull()
    })
  })

  describe('contract call behavior', () => {
    it('should not call contracts when address is invalid', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      renderHook(() => useTokenMetadata('0xINVALID', 1))

      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          contracts: [],
          query: {
            enabled: false,
          },
        })
      )
    })

    it('should not call contracts when chainId is missing', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      renderHook(() => useTokenMetadata('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', undefined))

      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          contracts: [],
          query: {
            enabled: false,
          },
        })
      )
    })

    it('should call contracts with correct parameters when inputs are valid', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as UseReadContractsReturnType)

      const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      const chainId = 1

      renderHook(() => useTokenMetadata(address, chainId))

      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          contracts: [
            expect.objectContaining({
              address,
              functionName: 'name',
              chainId,
            }),
            expect.objectContaining({
              address,
              functionName: 'symbol',
              chainId,
            }),
            expect.objectContaining({
              address,
              functionName: 'decimals',
              chainId,
            }),
          ],
          query: {
            enabled: true,
          },
        })
      )
    })
  })
})
