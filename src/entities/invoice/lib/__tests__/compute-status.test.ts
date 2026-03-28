/**
 * computeInvoiceStatus Tests
 * Entity: invoice
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computeInvoiceStatus } from '../compute-status'
import type { TrackedInvoice } from '../../model/rich-invoice-store'

vi.mock('@/shared/lib/date-time', () => ({
  isDueDatePassed: vi.fn(),
}))

import { isDueDatePassed } from '@/shared/lib/date-time'

const mockIsDueDatePassed = vi.mocked(isDueDatePassed)

function makeTracked(overrides: Partial<TrackedInvoice> = {}): TrackedInvoice {
  return {
    invoiceId: 'inv-test-001',
    invoiceUrl: 'https://voidpay.xyz/pay#abc',
    source: 'received',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('computeInvoiceStatus', () => {
  beforeEach(() => {
    mockIsDueDatePassed.mockReturnValue(false)
  })

  it('returns "pending" when no txHash and due date is not passed', () => {
    const result = computeInvoiceStatus({
      tracked: makeTracked(),
      dueAt: 9999999999,
    })

    expect(result).toBe('pending')
  })

  it('returns "overdue" when no txHash and due date is passed', () => {
    mockIsDueDatePassed.mockReturnValue(true)

    const result = computeInvoiceStatus({
      tracked: makeTracked(),
      dueAt: 1000000000,
    })

    expect(result).toBe('overdue')
  })

  it('returns "confirming" when txHash present and not yet validated', () => {
    const result = computeInvoiceStatus({
      tracked: makeTracked({ txHash: '0xabc123', txHashValidated: false }),
      dueAt: 9999999999,
    })

    expect(result).toBe('confirming')
  })

  it('returns "paid" when txHash present and validated', () => {
    const result = computeInvoiceStatus({
      tracked: makeTracked({ txHash: '0xabc123', txHashValidated: true }),
      dueAt: 9999999999,
    })

    expect(result).toBe('paid')
  })

  it('priority: "confirming" beats "overdue" when txHash present but not validated and due date passed', () => {
    mockIsDueDatePassed.mockReturnValue(true)

    const result = computeInvoiceStatus({
      tracked: makeTracked({ txHash: '0xabc123', txHashValidated: false }),
      dueAt: 1000000000,
    })

    expect(result).toBe('confirming')
  })

  it('priority: "paid" beats "overdue" when txHash validated and due date passed', () => {
    mockIsDueDatePassed.mockReturnValue(true)

    const result = computeInvoiceStatus({
      tracked: makeTracked({ txHash: '0xabc123', txHashValidated: true }),
      dueAt: 1000000000,
    })

    expect(result).toBe('paid')
  })

  it('returns "pending" when no dueAt and no txHash', () => {
    const result = computeInvoiceStatus({
      tracked: makeTracked(),
    })

    expect(result).toBe('pending')
    expect(mockIsDueDatePassed).not.toHaveBeenCalled()
  })

  it('returns "pending" when tracked is undefined and no dueAt', () => {
    const result = computeInvoiceStatus({})

    expect(result).toBe('pending')
  })

  it('returns "pending" when tracked is undefined and due date is not passed', () => {
    const result = computeInvoiceStatus({ dueAt: 9999999999 })

    expect(result).toBe('pending')
  })
})
