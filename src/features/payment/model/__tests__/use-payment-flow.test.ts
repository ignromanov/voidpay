import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock wagmi hooks
const mockSendTransaction = vi.fn()
const mockWriteContract = vi.fn()
const mockResetSend = vi.fn()
const mockResetWrite = vi.fn()
let mockSendData: `0x${string}` | undefined = undefined
let mockSendError: Error | null = null
let mockSendPending = false
let mockWriteData: `0x${string}` | undefined = undefined
let mockWriteError: Error | null = null
let mockWritePending = false
let mockReceiptLoading = false
let mockReceiptSuccess = false
let mockReceiptError: Error | null = null
let mockReceiptData: { status: string } | undefined = undefined
let mockIsConnected = true
let mockChainId: number | undefined = 1
const mockOpenConnectModal = vi.fn()
let mockConnectModalOpen = false

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    isConnected: mockIsConnected,
    address: '0xTestAddress',
    chainId: mockChainId,
    connector: { id: 'test' },
  })),
  useSendTransaction: vi.fn(() => ({
    data: mockSendData,
    isPending: mockSendPending,
    error: mockSendError,
    sendTransaction: mockSendTransaction,
    reset: mockResetSend,
  })),
  useWriteContract: vi.fn(() => ({
    data: mockWriteData,
    isPending: mockWritePending,
    error: mockWriteError,
    writeContract: mockWriteContract,
    reset: mockResetWrite,
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    isLoading: mockReceiptLoading,
    isSuccess: mockReceiptSuccess,
    error: mockReceiptError,
    data: mockReceiptData,
  })),
  useChainId: vi.fn(() => mockChainId),
}))

// Mock RainbowKit
vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(() => ({
    openConnectModal: mockOpenConnectModal,
    connectModalOpen: mockConnectModalOpen,
  })),
}))

// Mock entities/network
vi.mock('@/entities/network', () => ({
  useNetworkSwitch: vi.fn(() => ({
    switchToChain: vi.fn(),
    isSwitching: false,
    currentChainId: 1,
    error: null,
    chains: [],
  })),
  useNetworkMismatch: vi.fn(() => ({
    hasMismatch: false,
    expectedChainId: 1,
    actualChainId: 1,
    expectedChainName: 'Ethereum',
    actualChainName: 'Ethereum',
  })),
}))

// Mock toast
const mockToastInfo = vi.fn()
vi.mock('@/shared/lib/toast', () => ({
  toast: { info: (...args: unknown[]) => mockToastInfo(...args) },
}))

// Mock invoice store
const mockSetTxHash = vi.fn()
const mockSetError = vi.fn()

vi.mock('@/entities/invoice', () => ({
  useTrackedInvoiceStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const store = { setTxHash: mockSetTxHash, setError: mockSetError }
    return selector ? selector(store) : store
  }),
}))

import { usePaymentFlow } from '../use-payment-flow'
import type { Invoice } from '@/entities/invoice'

const mockInvoice: Invoice = {
  version: 2,
  invoiceId: 'INV-001',
  currency: 'ETH',
  networkId: 1,
  decimals: 18,
  from: {
    walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  },
  items: [],
} as Invoice

describe('usePaymentFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendData = undefined
    mockSendError = null
    mockSendPending = false
    mockWriteData = undefined
    mockWriteError = null
    mockWritePending = false
    mockReceiptLoading = false
    mockReceiptSuccess = false
    mockReceiptError = null
    mockReceiptData = undefined
    mockIsConnected = true
    mockChainId = 1
    mockConnectModalOpen = false
  })

  it('returns initial idle state', () => {
    const { result } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )
    expect(result.current.step).toBe('idle')
  })

  it('handlePay dispatches START(sending) for native token on correct network', () => {
    const { result } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    act(() => {
      result.current.handlePay()
    })

    expect(result.current.step).toBe('sending')

  })

  it('calls sendTransaction for native token when step is sending', () => {
    const { result } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    act(() => {
      result.current.handlePay()
    })

    // The hook should call sendTransaction when entering sending state
    expect(mockSendTransaction).toHaveBeenCalled()
  })

  it('calls writeContract for ERC-20 token when step is sending', () => {
    const erc20Invoice = {
      ...mockInvoice,
      currency: 'USDC',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
    } as Invoice

    const { result } = renderHook(() =>
      usePaymentFlow({ invoice: erc20Invoice, invoiceId: 'INV-001', exactTotal: '1000000' })
    )

    act(() => {
      result.current.handlePay()
    })

    expect(mockWriteContract).toHaveBeenCalled()
  })

  it('provides idleSubState derived from wallet context', () => {
    const { result } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )
    expect(result.current.idleSubState).toBe('ready')
  })

  // US2: Auto-connect from disconnected
  it('dispatches START(connecting) when disconnected', () => {
    mockIsConnected = false
    const { result } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    expect(result.current.idleSubState).toBe('disconnected')

    act(() => {
      result.current.handlePay()
    })

    expect(result.current.step).toBe('connecting')

  })

  // US3: Auto-switch from wrong network
  it('dispatches START(switching) when connected on wrong network', async () => {
    mockIsConnected = true
    mockChainId = 1

    // Need to re-mock useNetworkMismatch to return hasMismatch=true
    const { useNetworkMismatch } = await import('@/entities/network')
    vi.mocked(useNetworkMismatch).mockReturnValue({
      hasMismatch: true,
      expectedChainId: 137,
      actualChainId: 1,
      expectedChainName: 'Polygon',
      actualChainName: 'Ethereum',
    })

    const { result } = renderHook(() =>
      usePaymentFlow({ invoice: { ...mockInvoice, networkId: 137 }, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    expect(result.current.idleSubState).toBe('wrong-network')

    act(() => {
      result.current.handlePay()
    })

    expect(result.current.step).toBe('switching')

  })

  it('error during sending resets to idle with error', async () => {
    // Ensure we're testing the normal flow (connected, correct network)
    mockIsConnected = true
    mockChainId = 1

    // Ensure useNetworkMismatch returns no mismatch
    const { useNetworkMismatch } = await import('@/entities/network')
    vi.mocked(useNetworkMismatch).mockReturnValue({
      hasMismatch: false,
      expectedChainId: 1,
      actualChainId: 1,
      expectedChainName: 'Ethereum',
      actualChainName: 'Ethereum',
    })

    const { result, rerender } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    // Start payment
    act(() => {
      result.current.handlePay()
    })
    expect(result.current.step).toBe('sending')

    // Simulate wagmi error
    mockSendError = Object.assign(new Error('User rejected the request.'), {
      shortMessage: 'User rejected the request.',
      name: 'UserRejectedRequestError',
    })
    rerender()

    // Should silently reset to idle (no error state) and show toast
    expect(result.current.step).toBe('idle')
    expect(result.current.error).toBeNull()
    expect(mockToastInfo).toHaveBeenCalledWith('Payment canceled')
  })

  it('calls store.setError when error occurs', async () => {
    // Ensure we're testing the normal flow (connected, correct network)
    mockIsConnected = true
    mockChainId = 1

    const { useNetworkMismatch } = await import('@/entities/network')
    vi.mocked(useNetworkMismatch).mockReturnValue({
      hasMismatch: false,
      expectedChainId: 1,
      actualChainId: 1,
      expectedChainName: 'Ethereum',
      actualChainName: 'Ethereum',
    })

    const { result, rerender } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    act(() => {
      result.current.handlePay()
    })

    mockSendError = new Error('Something went wrong')
    rerender()

    expect(mockSetError).toHaveBeenCalledWith(
      'INV-001',
      'Unexpected error: Something went wrong. Please try again.',
    )
  })

  it('error resets step to idle', async () => {
    mockIsConnected = true
    mockChainId = 1

    const { useNetworkMismatch } = await import('@/entities/network')
    vi.mocked(useNetworkMismatch).mockReturnValue({
      hasMismatch: false,
      expectedChainId: 1,
      actualChainId: 1,
      expectedChainName: 'Ethereum',
      actualChainName: 'Ethereum',
    })

    const { result, rerender } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    act(() => {
      result.current.handlePay()
    })
    expect(result.current.step).toBe('sending')

    mockSendError = new Error('Insufficient funds')
    rerender()

    expect(result.current.step).toBe('idle')
    expect(result.current.error).not.toBeNull()
  })

  it('calls resetSend and resetWrite when handlePay is called after an error', async () => {
    mockIsConnected = true
    mockChainId = 1

    const { useNetworkMismatch } = await import('@/entities/network')
    vi.mocked(useNetworkMismatch).mockReturnValue({
      hasMismatch: false,
      expectedChainId: 1,
      actualChainId: 1,
      expectedChainName: 'Ethereum',
      actualChainName: 'Ethereum',
    })

    const { result, rerender } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    // Trigger initial payment
    act(() => {
      result.current.handlePay()
    })
    expect(result.current.step).toBe('sending')

    // Simulate error to return to idle
    mockSendError = new Error('Insufficient funds')
    rerender()
    expect(result.current.step).toBe('idle')

    // Clear error so it doesn't re-fire the error effect
    mockSendError = null
    rerender()

    // Retry — should call reset functions
    act(() => {
      result.current.handlePay()
    })

    expect(mockResetSend).toHaveBeenCalled()
    expect(mockResetWrite).toHaveBeenCalled()
  })

  it('dispatches ERROR when receipt status is reverted', async () => {
    mockIsConnected = true
    mockChainId = 1

    const { useNetworkMismatch } = await import('@/entities/network')
    vi.mocked(useNetworkMismatch).mockReturnValue({
      hasMismatch: false,
      expectedChainId: 1,
      actualChainId: 1,
      expectedChainName: 'Ethereum',
      actualChainName: 'Ethereum',
    })

    const { result, rerender } = renderHook(() =>
      usePaymentFlow({ invoice: mockInvoice, invoiceId: 'INV-001', exactTotal: '1000000000000000000' })
    )

    // Start payment and get to sending state
    act(() => {
      result.current.handlePay()
    })
    expect(result.current.step).toBe('sending')

    // Simulate TX hash arriving → confirming
    mockSendData = '0xdeadbeef' as `0x${string}`
    rerender()
    expect(result.current.step).toBe('confirming')

    // Simulate reverted receipt
    mockReceiptSuccess = true
    mockReceiptData = { status: 'reverted' }
    rerender()

    expect(result.current.step).toBe('idle')
    expect(result.current.error).not.toBeNull()
    expect(result.current.error?.message).toContain('rejected by the blockchain')
  })
})
