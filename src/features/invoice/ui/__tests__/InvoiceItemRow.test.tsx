/**
 * InvoiceItemRow Component Tests
 *
 * Constitutional Principle XVI: TDD Discipline
 * Tests for line item management and calculations
 *
 * All rates are in atomic units (e.g., $100.50 with 6 decimals = "100500000")
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { InvoiceItemRow } from '../InvoiceItemRow'
import type { LineItem } from '@/entities/invoice'

// $100.50 in atomic units (6 decimals)
const mockLineItem: LineItem = {
  id: '123',
  description: 'Web Development Services',
  quantity: 10,
  rate: '100500000', // $100.50 in atomic units
}

describe('InvoiceItemRow - Field Updates', () => {
  it('should update description when changed', async () => {
    const onUpdate = vi.fn()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const descInput = screen.getByPlaceholderText('Item description') as HTMLInputElement
    fireEvent.change(descInput, { target: { value: 'New description' } })

    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]?.[0]
    expect(lastCall.description).toBe('New description')
  })

  it('should update quantity when changed', async () => {
    const onUpdate = vi.fn()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const qtyInput = screen.getByPlaceholderText('Qty') as HTMLInputElement
    fireEvent.change(qtyInput, { target: { value: '25' } })

    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]?.[0]
    expect(lastCall.quantity).toBe(25)
  })

  it('should update rate to atomic units when changed', async () => {
    const onUpdate = vi.fn()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const rateInput = screen.getByPlaceholderText('0.00') as HTMLInputElement
    fireEvent.change(rateInput, { target: { value: '150.75' } })

    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]?.[0]
    // $150.75 should be converted to atomic units: 150750000
    expect(lastCall.rate).toBe('150750000')
  })

  it('should prevent invalid quantity (negative)', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const qtyInput = screen.getByPlaceholderText('Qty')
    await user.clear(qtyInput)
    await user.type(qtyInput, '-5')

    // Should not call onUpdate with negative value
    const calls = onUpdate.mock.calls
    const hasNegativeCall = calls.some(([item]) => item.quantity < 0)
    expect(hasNegativeCall).toBe(false)
  })

  it('should prevent invalid rate (non-decimal)', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const rateInput = screen.getByPlaceholderText('0.00')
    const initialCallCount = onUpdate.mock.calls.length

    await user.clear(rateInput)
    await user.type(rateInput, 'abc')

    // Should only update on clear (to '0'), not with invalid characters
    expect(onUpdate).toHaveBeenCalledTimes(initialCallCount + 1)
  })
})

describe('InvoiceItemRow - Line Total Calculation', () => {
  it('should calculate line total correctly', () => {
    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )

    // 10 × $100.50 = $1,005.00 (with thousand separator)
    expect(screen.getByText(/1,005\.00/)).toBeInTheDocument()
  })

  it('should update line total when quantity changes', async () => {
    const onUpdate = vi.fn((item) => {
      // Re-render with updated item
      rerender(
        <InvoiceItemRow
          item={item}
          currencySymbol="USDC"
          decimals={6}
          onUpdate={onUpdate}
          onRemove={() => {}}
        />
      )
    })
    const user = userEvent.setup()

    const { rerender } = render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const qtyInput = screen.getByPlaceholderText('Qty')
    await user.clear(qtyInput)
    await user.type(qtyInput, '5')

    // 5 × $100.50 = $502.50
    expect(screen.getByText(/502\.50/)).toBeInTheDocument()
  })

  it('should display currency symbol with total', () => {
    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="DAI"
        decimals={6}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )

    expect(screen.getByText(/DAI/)).toBeInTheDocument()
  })

  it('should handle zero quantity', () => {
    const zeroItem = { ...mockLineItem, quantity: 0 }

    render(
      <InvoiceItemRow
        item={zeroItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )

    expect(screen.getByText(/0\.00/)).toBeInTheDocument()
  })
})

describe('InvoiceItemRow - Remove Action', () => {
  it('should call onRemove when remove button clicked', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={() => {}}
        onRemove={onRemove}
      />
    )

    const removeButton = screen.getByLabelText('Remove item')
    await user.click(removeButton)

    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})

describe('InvoiceItemRow - Snapshots', () => {
  it('should match snapshot with default state', () => {
    const { container } = render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with empty values', () => {
    const emptyItem: LineItem = {
      id: '456',
      description: '',
      quantity: 0,
      rate: '0',
    }

    const { container } = render(
      <InvoiceItemRow
        item={emptyItem}
        currencySymbol="ETH"
        decimals={18}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with decimal values', () => {
    // $75.25 in atomic units
    const decimalItem: LineItem = {
      id: '789',
      description: 'Consulting',
      quantity: 2.5,
      rate: '75250000', // $75.25 atomic units
    }

    const { container } = render(
      <InvoiceItemRow
        item={decimalItem}
        currencySymbol="USDC"
        decimals={6}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
