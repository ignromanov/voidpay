import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks — declared before imports so vi.mock hoisting works correctly
// ---------------------------------------------------------------------------

// Track which chainId the public client was requested for (W3-007)
let mockChainId: number | undefined = undefined

const mockGetTransactionReceipt = vi.fn()
const mockGetTransaction = vi.fn()

vi.mock('wagmi', () => ({
  usePublicClient: vi.fn((opts?: { chainId?: number }) => {
    mockChainId = opts?.chainId
    return {
      getTransactionReceipt: (...args: unknown[]) => mockGetTransactionReceipt(...args),
      getTransaction: (...args: unknown[]) => mockGetTransaction(...args),
    }
  }),
}))

// verify-receipt — module to be created together with the hook
const mockVerifyNativeReceipt = vi.fn()
const mockVerifyErc20Receipt = vi.fn()

vi.mock('../../lib/verify-receipt', () => ({
  verifyNativeReceipt: (...args: unknown[]) => mockVerifyNativeReceipt(...args),
  verifyErc20Receipt: (...args: unknown[]) => mockVerifyErc20Receipt(...args),
}))

// TrackedInvoice store
const mockSetTxHash = vi.fn()
const mockSetValidated = vi.fn()
const mockSetError = vi.fn()
const mockGetInvoice = vi.fn()
const mockInvoices: Array<{ invoiceId: string; txHash?: string }> = []

vi.mock('@/entities/invoice', () => ({
  useTrackedInvoiceStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const store = {
      invoices: mockInvoices,
      setTxHash: mockSetTxHash,
      setValidated: mockSetValidated,
      setError: mockSetError,
      getInvoice: mockGetInvoice,
    }
    return selector ? selector(store) : store
  }),
}))

// ---------------------------------------------------------------------------
// Subject under test (module doesn't exist yet — RED phase)
// ---------------------------------------------------------------------------
import { useManualVerify } from '../use-manual-verify'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const VALID_TX_HASH = '0xdeadbeef00000000000000000000000000000000000000000000000000000001' as `0x${string}`
const OTHER_TX_HASH = '0xaaaa000000000000000000000000000000000000000000000000000000000002' as `0x${string}`

const RECIPIENT = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const EXACT_TOTAL = 1_000_000_000_000_000_000n // 1 ETH in wei
const NETWORK_ID = 1

const BASE_PARAMS = {
  invoiceId: 'INV-MANUAL-001',
  networkId: NETWORK_ID,
  recipient: RECIPIENT,
  exactTotal: EXACT_TOTAL,
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useManualVerify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChainId = undefined
    mockInvoices.length = 0

    // Default: no matching tx in store for any invoice
    mockGetInvoice.mockReturnValue(undefined)

    // Default: getTransaction returns a native tx to recipient
    mockGetTransaction.mockResolvedValue({
      hash: VALID_TX_HASH,
      to: RECIPIENT,
      value: EXACT_TOTAL,
      blockHash: '0x1234',
    })

    // Default: getTransactionReceipt returns success
    mockGetTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      transactionHash: VALID_TX_HASH,
      logs: [],
    })

    // Default verify results
    mockVerifyNativeReceipt.mockReturnValue({
      verified: true,
      actualAmount: EXACT_TOTAL,
      expectedAmount: EXACT_TOTAL,
    })
    mockVerifyErc20Receipt.mockReturnValue({
      verified: true,
      actualAmount: 1_000_000n,
      expectedAmount: 1_000_000n,
    })
  })

  // -------------------------------------------------------------------------
  // Test 1: Invalid format rejected before any network call (FR-030)
  // -------------------------------------------------------------------------
  it('rejects short/non-hash strings without making any network call', async () => {
    const { result } = renderHook(() => useManualVerify(BASE_PARAMS))

    await act(async () => {
      await result.current.verify('not-a-hash')
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error).toMatch(/invalid/i)
    expect(mockGetTransaction).not.toHaveBeenCalled()
    expect(mockGetTransactionReceipt).not.toHaveBeenCalled()
    expect(mockSetTxHash).not.toHaveBeenCalled()
  })

  it('rejects 0x-prefixed hash shorter than 66 chars without any network call', async () => {
    const { result } = renderHook(() => useManualVerify(BASE_PARAMS))

    await act(async () => {
      await result.current.verify('0x123')
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error).toMatch(/invalid/i)
    expect(mockGetTransaction).not.toHaveBeenCalled()
    expect(mockGetTransactionReceipt).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Test 2: txHash already linked to another invoice (W3-006)
  // -------------------------------------------------------------------------
  it('rejects txHash already linked to a different invoice in the store', async () => {
    // Another invoice already has this txHash
    mockInvoices.push({ invoiceId: 'INV-OTHER-999', txHash: VALID_TX_HASH })

    const { result } = renderHook(() => useManualVerify(BASE_PARAMS))

    await act(async () => {
      await result.current.verify(VALID_TX_HASH)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error).toMatch(/already linked|already used/i)
    expect(mockGetTransaction).not.toHaveBeenCalled()
    expect(mockSetTxHash).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Test 3: Network call uses the invoice's networkId (W3-007)
  // -------------------------------------------------------------------------
  it('fetches transaction using the invoice networkId as chainId', async () => {
    const { result } = renderHook(() =>
      useManualVerify({ ...BASE_PARAMS, networkId: 42161 })
    )

    await act(async () => {
      await result.current.verify(VALID_TX_HASH)
    })

    // The public client must have been instantiated for the correct chain
    expect(mockChainId).toBe(42161)
  })

  // -------------------------------------------------------------------------
  // Test 4: Recipient mismatch → rejected (FR-033)
  // -------------------------------------------------------------------------
  it('rejects tx where tx.to does not match invoice recipient', async () => {
    const wrongRecipient = '0x1111111111111111111111111111111111111111'
    mockGetTransaction.mockResolvedValue({
      hash: VALID_TX_HASH,
      to: wrongRecipient, // wrong recipient
      value: EXACT_TOTAL,
      blockHash: '0x1234',
    })

    const { result } = renderHook(() => useManualVerify(BASE_PARAMS))

    await act(async () => {
      await result.current.verify(VALID_TX_HASH)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error).toMatch(/recipient|address/i)
    expect(mockSetTxHash).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Test 5: Amount matches → setTxHash called + result.verified = true
  // -------------------------------------------------------------------------
  it('calls setTxHash and returns verified=true when amount matches', async () => {
    const { result } = renderHook(() => useManualVerify(BASE_PARAMS))

    await act(async () => {
      await result.current.verify(VALID_TX_HASH)
    })

    await waitFor(() => {
      expect(result.current.result).toBeDefined()
    })

    expect(result.current.result?.verified).toBe(true)
    expect(result.current.result?.actualAmount).toBe(EXACT_TOTAL)
    expect(result.current.result?.expectedAmount).toBe(EXACT_TOTAL)
    expect(mockSetTxHash).toHaveBeenCalledWith(
      'INV-MANUAL-001',
      VALID_TX_HASH,
      false, // soft-verified; verification hook takes over
    )
    expect(result.current.error).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // Test 6: Amount mismatch → both amounts shown, not paid
  // -------------------------------------------------------------------------
  it('shows both amounts and does NOT call setTxHash when amount mismatches', async () => {
    const actualAmount = 900_000_000_000_000_000n // 0.9 ETH
    mockVerifyNativeReceipt.mockReturnValue({
      verified: false,
      actualAmount,
      expectedAmount: EXACT_TOTAL,
      error: `Amount mismatch: expected ${EXACT_TOTAL}, got ${actualAmount}`,
    })

    const { result } = renderHook(() => useManualVerify(BASE_PARAMS))

    await act(async () => {
      await result.current.verify(VALID_TX_HASH)
    })

    await waitFor(() => {
      expect(result.current.result).toBeDefined()
    })

    expect(result.current.result?.verified).toBe(false)
    expect(result.current.result?.actualAmount).toBe(actualAmount)
    expect(result.current.result?.expectedAmount).toBe(EXACT_TOTAL)
    expect(mockSetTxHash).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Test 7: Pending tx (no receipt yet) → "still pending" message
  // -------------------------------------------------------------------------
  it('reports "still pending" when getTransactionReceipt returns null', async () => {
    mockGetTransactionReceipt.mockResolvedValue(null)

    const { result } = renderHook(() => useManualVerify(BASE_PARAMS))

    await act(async () => {
      await result.current.verify(VALID_TX_HASH)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error).toMatch(/pending|not yet mined/i)
    expect(mockSetTxHash).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Test 8: Valid ERC-20 tx → verifyErc20Receipt used, setTxHash called
  // -------------------------------------------------------------------------
  it('uses verifyErc20Receipt for ERC-20 invoices and calls setTxHash on match', async () => {
    const TOKEN_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
    const erc20Total = 1_000_000n // 1 USDC (6 decimals)

    const transferLog = {
      address: TOKEN_ADDRESS as `0x${string}`,
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as `0x${string}`,
        '0x0000000000000000000000000000000000000000000000000000000000000001' as `0x${string}`,
        `0x000000000000000000000000${RECIPIENT.slice(2).toLowerCase()}` as `0x${string}`,
      ],
      data: '0x00000000000000000000000000000000000000000000000000000000000f4240' as `0x${string}`,
    }

    mockGetTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      transactionHash: VALID_TX_HASH,
      logs: [transferLog],
    })

    // For ERC-20 the tx itself doesn't carry ETH value; `to` is the token contract
    mockGetTransaction.mockResolvedValue({
      hash: VALID_TX_HASH,
      to: TOKEN_ADDRESS, // ERC-20: tx.to is the token contract, not recipient
      value: 0n,
      blockHash: '0x1234',
    })

    mockVerifyErc20Receipt.mockReturnValue({
      verified: true,
      actualAmount: erc20Total,
      expectedAmount: erc20Total,
    })

    const { result } = renderHook(() =>
      useManualVerify({
        ...BASE_PARAMS,
        exactTotal: erc20Total,
        tokenAddress: TOKEN_ADDRESS,
      })
    )

    await act(async () => {
      await result.current.verify(VALID_TX_HASH)
    })

    await waitFor(() => {
      expect(result.current.result).toBeDefined()
    })

    // Must use ERC-20 verifier, not native
    expect(mockVerifyErc20Receipt).toHaveBeenCalledWith(
      expect.objectContaining({ logs: expect.any(Array) }),
      TOKEN_ADDRESS,
      RECIPIENT,
      erc20Total,
    )
    expect(mockVerifyNativeReceipt).not.toHaveBeenCalled()

    expect(result.current.result?.verified).toBe(true)
    expect(mockSetTxHash).toHaveBeenCalledWith('INV-MANUAL-001', VALID_TX_HASH, false)
  })
})
