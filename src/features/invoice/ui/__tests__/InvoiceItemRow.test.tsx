/**
 * InvoiceItemRow Component Tests
 *
 * Constitutional Principle XVI: TDD Discipline
 * Tests for line item management and calculations
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { InvoiceItemRow } from '../InvoiceItemRow'
import { LineItem } from '@/entities/invoice/model/types'

const mockLineItem: LineItem = {
  id: '123',
  description: 'Web Development Services',
  quantity: 10,
  rate: '100.50',
}

describe('InvoiceItemRow - Field Updates', () => {
  it('should update description when changed', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const descInput = screen.getByPlaceholderText('Item description')
    await user.clear(descInput)
    await user.type(descInput, 'New description')

    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]?.[0]
    expect(lastCall.description).toContain('New description')
  })

  it('should update quantity when changed', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const qtyInput = screen.getByPlaceholderText('Qty')
    await user.clear(qtyInput)
    await user.type(qtyInput, '25')

    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]?.[0]
    expect(lastCall.quantity).toBe(25)
  })

  it('should update rate when changed', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const rateInput = screen.getByPlaceholderText('0.00')
    await user.clear(rateInput)
    await user.type(rateInput, '150.75')

    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]?.[0]
    expect(lastCall.rate).toBe('150.75')
  })

  it('should prevent invalid quantity (negative)', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
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
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const rateInput = screen.getByPlaceholderText('0.00')
    const initialCallCount = onUpdate.mock.calls.length

    await user.clear(rateInput)
    await user.type(rateInput, 'abc')

    // Should not update with invalid characters
    expect(onUpdate).toHaveBeenCalledTimes(initialCallCount + 1) // Only the clear
  })
})

describe('InvoiceItemRow - Line Total Calculation', () => {
  it('should calculate line total correctly', () => {
    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )

    // 10 × 100.50 = 1005.00
    expect(screen.getByText(/1005\.00/)).toBeInTheDocument()
  })

  it('should update line total when quantity changes', async () => {
    const onUpdate = vi.fn((item) => {
      // Re-render with updated item
      rerender(
        <InvoiceItemRow item={item} currencySymbol="USDC" onUpdate={onUpdate} onRemove={() => {}} />
      )
    })
    const user = userEvent.setup()

    const { rerender } = render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="USDC"
        onUpdate={onUpdate}
        onRemove={() => {}}
      />
    )

    const qtyInput = screen.getByPlaceholderText('Qty')
    await user.clear(qtyInput)
    await user.type(qtyInput, '5')

    // 5 × 100.50 = 502.50
    expect(screen.getByText(/502\.50/)).toBeInTheDocument()
  })

  it('should display currency symbol with total', () => {
    render(
      <InvoiceItemRow
        item={mockLineItem}
        currencySymbol="DAI"
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
      rate: '',
    }

    const { container } = render(
      <InvoiceItemRow
        item={emptyItem}
        currencySymbol="ETH"
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with decimal values', () => {
    const decimalItem: LineItem = {
      id: '789',
      description: 'Consulting',
      quantity: 2.5,
      rate: '75.25',
    }

    const { container } = render(
      <InvoiceItemRow
        item={decimalItem}
        currencySymbol="USDC"
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
