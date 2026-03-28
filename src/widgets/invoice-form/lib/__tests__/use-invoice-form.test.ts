import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock form subscription tracking
const mockWatch = vi.fn()
const mockReset = vi.fn()
const mockGetValues = vi.fn(() => ({ invoiceId: 'INV-001' }))
const mockFormState = { touchedFields: {}, errors: {}, isDirty: false, isValid: true }

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    watch: mockWatch,
    reset: mockReset,
    getValues: mockGetValues,
    formState: mockFormState,
  })),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => vi.fn()),
}))

// Mock creator store
const mockUpdateDraft = vi.fn()
const mockSetDraftSyncStatus = vi.fn()
let mockActiveDraft: { data: { invoiceId: string } } | null = null

vi.mock('@/entities/creator', () => ({
  useCreatorStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const store = {
      activeDraft: mockActiveDraft,
      updateDraft: mockUpdateDraft,
      setDraftSyncStatus: mockSetDraftSyncStatus,
    }
    return selector ? selector(store) : store
  }),
}))

vi.mock('@/shared/lib/invoice-types', () => ({
  invoiceFormSchema: {},
}))

vi.mock('@/shared/lib/validation', () => ({
  ETH_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  isValidAddress: vi.fn(() => true),
}))

import { useInvoiceForm } from '../use-invoice-form'

describe('useInvoiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActiveDraft = null
    // Default: watch returns an unsubscribe function
    mockWatch.mockReturnValue({ invoiceId: '', from: {}, client: {} })
    mockWatch.mockImplementation((cb?: unknown) => {
      if (typeof cb === 'function') {
        return { unsubscribe: vi.fn() }
      }
      return { invoiceId: '', from: {}, client: {} }
    })
  })

  it('default (no args): creates form.watch subscription', () => {
    renderHook(() => useInvoiceForm())

    // form.watch is called as a subscription (with callback)
    const watchCalls = mockWatch.mock.calls
    const subscriptionCall = watchCalls.find((call) => typeof call[0] === 'function')
    expect(subscriptionCall).toBeDefined()
  })

  it('enabled=false: does not create form.watch subscription', () => {
    renderHook(() => useInvoiceForm({ enabled: false }))

    // form.watch may be called for values (no callback), but NOT as subscription
    const watchCalls = mockWatch.mock.calls
    const subscriptionCall = watchCalls.find((call) => typeof call[0] === 'function')
    expect(subscriptionCall).toBeUndefined()
  })

  it('enabled=false: does not reset form on store change', () => {
    mockActiveDraft = { data: { invoiceId: 'INV-NEW' } } as typeof mockActiveDraft

    renderHook(() => useInvoiceForm({ enabled: false }))

    expect(mockReset).not.toHaveBeenCalled()
  })

  it('enabled=true: resets form when store invoiceId changes', () => {
    mockActiveDraft = { data: { invoiceId: 'INV-CHANGED' } } as typeof mockActiveDraft
    mockGetValues.mockReturnValue({ invoiceId: 'INV-OLD' })

    renderHook(() => useInvoiceForm({ enabled: true }))

    expect(mockReset).toHaveBeenCalled()
  })
})
