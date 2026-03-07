import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock state for wagmi hooks
let mockReceiptData: {
  blockNumber: bigint
  status: string
  logs: Array<{ topics: string[]; data: string; address: string }>
  transactionHash: `0x${string}`
} | undefined = undefined
let mockReceiptLoading = false
let mockReceiptSuccess = false
let mockReceiptError: Error | null = null
let mockCurrentBlockNumber: bigint = 100n

vi.mock('wagmi', () => ({
  useWaitForTransactionReceipt: vi.fn(() => ({
    data: mockReceiptData,
    isLoading: mockReceiptLoading,
    isSuccess: mockReceiptSuccess,
    error: mockReceiptError,
  })),
  useBlockNumber: vi.fn(() => ({
    data: mockCurrentBlockNumber,
  })),
  usePublicClient: vi.fn(() => ({
    getTransaction: vi.fn().mockResolvedValue({
      hash: '0xabc123' as `0x${string}`,
      value: 1000000000000000000n,
    }),
    getTransactionReceipt: vi.fn().mockResolvedValue(mockReceiptData),
  })),
}))

// Mock verify functions (modules to implement)
const mockVerifyNativeReceipt = vi.fn()
const mockVerifyErc20Receipt = vi.fn()

vi.mock('../verify-receipt', () => ({
  verifyNativeReceipt: (...args: unknown[]) => mockVerifyNativeReceipt(...args),
  verifyErc20Receipt: (...args: unknown[]) => mockVerifyErc20Receipt(...args),
}))

// Mock invoice store
const mockSetValidated = vi.fn()
const mockSetError = vi.fn()
const mockSetConfirmations = vi.fn()

vi.mock('@/entities/invoice', () => ({
  useTrackedInvoiceStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const store = {
      setValidated: mockSetValidated,
      setError: mockSetError,
      setConfirmations: mockSetConfirmations,
    }
    return selector ? selector(store) : store
  }),
}))

import { usePaymentVerification } from '../use-payment-verification'
import type { Invoice } from '@/entities/invoice'

const MOCK_TX_HASH = '0xdeadbeef00000000000000000000000000000000000000000000000000000001' as `0x${string}`

const mockNativeInvoice: Invoice = {
  version: 2,
  invoiceId: 'INV-NATIVE-001',
  currency: 'ETH',
  networkId: 1,
  decimals: 18,
  from: {
    walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  },
  items: [],
} as Invoice

const mockErc20Invoice: Invoice = {
  version: 2,
  invoiceId: 'INV-ERC20-001',
  currency: 'USDC',
  networkId: 1,
  decimals: 6,
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  from: {
    walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  },
  items: [],
} as Invoice

describe('usePaymentVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReceiptData = undefined
    mockReceiptLoading = false
    mockReceiptSuccess = false
    mockReceiptError = null
    mockCurrentBlockNumber = 100n

    mockVerifyNativeReceipt.mockReturnValue({ matched: true, actualAmount: '1000000000000000000' })
    mockVerifyErc20Receipt.mockReturnValue({ matched: true, actualAmount: '1000000' })
  })

  // Test case 1: Native tx verified → soft confirm counting → setValidated called after threshold
  it('native tx: calls setValidated after reaching ETH soft confirmation threshold (3 blocks)', async () => {
    // ETH needs 3 blocks confirmation (FR-008)
    const receiptBlockNumber = 97n // mined at block 97
    mockReceiptData = {
      blockNumber: receiptBlockNumber,
      status: 'success',
      logs: [],
      transactionHash: MOCK_TX_HASH,
    }
    mockReceiptSuccess = true
    // Current block = 100, receipt block = 97, delta = 3 — threshold met
    mockCurrentBlockNumber = 100n

    const { result } = renderHook(() =>
      usePaymentVerification({
        invoice: mockNativeInvoice,
        invoiceId: 'INV-NATIVE-001',
        txHash: MOCK_TX_HASH,
        exactTotal: '1000000000000000000',
      })
    )

    await waitFor(() => {
      expect(mockSetValidated).toHaveBeenCalledWith('INV-NATIVE-001', true)
    })

    expect(mockSetError).not.toHaveBeenCalled()
  })

  // Test case 2: ERC-20 tx verified → soft confirm → setValidated
  it('ERC-20 tx: calls setValidated after soft confirmation threshold', async () => {
    // Arbitrum/Optimism needs 1 block, but we test with networkId=1 (ETH) here via ERC-20
    const receiptBlockNumber = 97n
    mockReceiptData = {
      blockNumber: receiptBlockNumber,
      status: 'success',
      logs: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          ],
          data: '0x00000000000000000000000000000000000000000000000000000000000f4240',
        },
      ],
      transactionHash: MOCK_TX_HASH,
    }
    mockReceiptSuccess = true
    mockCurrentBlockNumber = 100n // delta = 3, ETH threshold met

    const { result } = renderHook(() =>
      usePaymentVerification({
        invoice: mockErc20Invoice,
        invoiceId: 'INV-ERC20-001',
        txHash: MOCK_TX_HASH,
        exactTotal: '1000000',
      })
    )

    await waitFor(() => {
      expect(mockSetValidated).toHaveBeenCalledWith('INV-ERC20-001', true)
    })

    expect(mockSetError).not.toHaveBeenCalled()
  })

  // Test case 3: Amount mismatch → error state (no setValidated called)
  it('amount mismatch: calls setError and does NOT call setValidated', async () => {
    mockVerifyNativeReceipt.mockReturnValue({
      matched: false,
      actualAmount: '900000000000000000', // wrong amount
    })

    mockReceiptData = {
      blockNumber: 97n,
      status: 'success',
      logs: [],
      transactionHash: MOCK_TX_HASH,
    }
    mockReceiptSuccess = true
    mockCurrentBlockNumber = 100n

    renderHook(() =>
      usePaymentVerification({
        invoice: mockNativeInvoice,
        invoiceId: 'INV-NATIVE-001',
        txHash: MOCK_TX_HASH,
        exactTotal: '1000000000000000000',
      })
    )

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(
        'INV-NATIVE-001',
        expect.stringContaining("amount doesn't match"),
      )
    })

    expect(mockSetValidated).not.toHaveBeenCalled()
  })

  // Test case 4: Confirmation progress updates (e.g., "2/3" exposed by hook)
  it('exposes confirmation progress with current/required counts', async () => {
    const receiptBlockNumber = 98n // mined at block 98
    mockReceiptData = {
      blockNumber: receiptBlockNumber,
      status: 'success',
      logs: [],
      transactionHash: MOCK_TX_HASH,
    }
    mockReceiptSuccess = true
    // current block = 99, delta = 1 — only 1 of 3 blocks confirmed
    mockCurrentBlockNumber = 99n

    const { result } = renderHook(() =>
      usePaymentVerification({
        invoice: mockNativeInvoice,
        invoiceId: 'INV-NATIVE-001',
        txHash: MOCK_TX_HASH,
        exactTotal: '1000000000000000000',
      })
    )

    await waitFor(() => {
      expect(result.current.confirmations).toBeDefined()
      expect(result.current.confirmations?.current).toBeGreaterThanOrEqual(1)
      expect(result.current.confirmations?.required).toBe(3) // ETH threshold
    })
  })

  // Test case 5: Block counting until threshold reached (ETH needs 3 blocks)
  it('does NOT call setValidated until block threshold is reached', async () => {
    const receiptBlockNumber = 98n
    mockReceiptData = {
      blockNumber: receiptBlockNumber,
      status: 'success',
      logs: [],
      transactionHash: MOCK_TX_HASH,
    }
    mockReceiptSuccess = true
    // current block = 99, delta = 1 — ETH needs 3, threshold NOT met
    mockCurrentBlockNumber = 99n

    const { result, rerender } = renderHook(() =>
      usePaymentVerification({
        invoice: mockNativeInvoice,
        invoiceId: 'INV-NATIVE-001',
        txHash: MOCK_TX_HASH,
        exactTotal: '1000000000000000000',
      })
    )

    // Wait a tick — threshold not met, setValidated must NOT be called yet
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(mockSetValidated).not.toHaveBeenCalled()

    // Advance to block 101 (delta = 3, threshold met)
    mockCurrentBlockNumber = 101n
    rerender()

    await waitFor(() => {
      expect(mockSetValidated).toHaveBeenCalledWith('INV-NATIVE-001', true)
    })
  })

  // Test case 6: Page reload during soft-confirm → re-fetches receipt and resumes from current block
  it('resumes soft-confirmation progress from current block height on re-mount (page reload)', async () => {
    // Simulate: tx was submitted, page reloaded, now we re-mount the hook.
    // Receipt already exists (block 97), current block is already 99 (2/3 confirmed).
    const receiptBlockNumber = 97n
    mockReceiptData = {
      blockNumber: receiptBlockNumber,
      status: 'success',
      logs: [],
      transactionHash: MOCK_TX_HASH,
    }
    mockReceiptSuccess = true
    // current block = 99: delta = 2, NOT yet at threshold 3
    mockCurrentBlockNumber = 99n

    const { result, rerender } = renderHook(() =>
      usePaymentVerification({
        invoice: mockNativeInvoice,
        invoiceId: 'INV-NATIVE-001',
        txHash: MOCK_TX_HASH,
        exactTotal: '1000000000000000000',
      })
    )

    // Hook should reflect 2 confirmations out of 3 (re-fetched from chain)
    await waitFor(() => {
      expect(result.current.confirmations).toBeDefined()
      expect(result.current.confirmations?.current).toBe(2)
      expect(result.current.confirmations?.required).toBe(3)
    })

    // Still NOT validated yet
    expect(mockSetValidated).not.toHaveBeenCalled()

    // Block advances to 100 — delta = 3, threshold met
    mockCurrentBlockNumber = 100n
    rerender()

    await waitFor(() => {
      expect(mockSetValidated).toHaveBeenCalledWith('INV-NATIVE-001', true)
    })
  })
})
