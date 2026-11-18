import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor, TEST_INVOICES } from '@/shared/lib/test-utils'

let mockHash = ''
vi.mock('@/shared/lib/hooks', () => ({
  useHashFragment: () => mockHash,
}))

const mockParseInvoiceHash = vi.fn()
const mockMapParseError = vi.fn(() => 'CORRUPTED_DATA' as const)
vi.mock('@/features/invoice-codec', () => ({
  parseInvoiceHash: (...args: unknown[]) => mockParseInvoiceHash(...args),
  mapParseErrorToDecodeType: (...args: unknown[]) => mockMapParseError(...args),
}))

const mockTrack = vi.fn()
vi.mock('@/features/analytics', () => ({
  track: (...args: unknown[]) => mockTrack(...args),
  AnalyticsEvent: {
    ERROR_DECODE: 'error_decode',
    INVOICE_VIEW: 'invoice_view',
    PAY_VERIFY: 'pay_verify',
  },
  getReferrerDomain: () => 'direct',
}))

vi.mock('@/features/payment', () => ({
  usePaymentPolling: () => ({
    mode: 'idle',
    isLoading: false,
    startAutoCheck: vi.fn(),
    startManualCheck: vi.fn(),
    startAggressivePolling: vi.fn(),
    startWatching: vi.fn(),
    stop: vi.fn(),
  }),
}))

import { useInvoiceView } from '../use-invoice-view'
import { useTrackedInvoiceStore } from '@/entities/invoice'

describe('useInvoiceView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHash = ''
    useTrackedInvoiceStore.setState({ invoices: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets EMPTY_HASH error after hydration when hash is empty', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useInvoiceView({ source: 'received' }))

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current.errorType).toBe('EMPTY_HASH')
    expect(result.current.invoice).toBeNull()
    expect(mockTrack).toHaveBeenCalledWith('error_decode', {
      error_type: 'EMPTY_HASH',
      page: 'pay',
    })
  })

  it('decodes valid hash and populates invoice and contentHash', async () => {
    const invoice = TEST_INVOICES.minimal()
    mockHash = 'valid-hash-fragment'
    mockParseInvoiceHash.mockResolvedValue({
      success: true,
      data: invoice,
      contentHash: '0xcontenthash123',
    })

    const { result } = renderHook(() => useInvoiceView({ source: 'received' }))

    await waitFor(() => {
      expect(result.current.invoice).toEqual(invoice)
    })
    expect(result.current.contentHash).toBe('0xcontenthash123')
    expect(result.current.errorType).toBeNull()
    expect(result.current.panelStatus).toBe('pending')
  })

  it('maps decode error when parseInvoiceHash fails', async () => {
    mockHash = 'corrupted-hash'
    mockParseInvoiceHash.mockResolvedValue({
      success: false,
      error: new Error('bad payload'),
    })

    const { result } = renderHook(() => useInvoiceView({ source: 'created' }))

    await waitFor(() => {
      expect(result.current.errorType).toBe('CORRUPTED_DATA')
    })
    expect(result.current.invoice).toBeNull()
  })
})
