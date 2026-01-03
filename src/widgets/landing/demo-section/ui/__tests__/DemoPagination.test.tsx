/**
 * DemoPagination Component Tests
 * Tests for demo carousel pagination dots
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DemoPagination } from '../DemoPagination'

describe('DemoPagination', () => {
  const mockItems = [{ invoiceId: 'INV-001' }, { invoiceId: 'INV-002' }, { invoiceId: 'INV-003' }]

  const defaultProps = {
    items: mockItems,
    activeIndex: 0,
    onSelect: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders correct number of pagination dots', () => {
      render(<DemoPagination {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })

    it('renders accessible labels for each dot', () => {
      render(<DemoPagination {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'View invoice INV-001' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'View invoice INV-002' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'View invoice INV-003' })).toBeInTheDocument()
    })

    it('renders with single item', () => {
      render(<DemoPagination {...defaultProps} items={[{ invoiceId: 'INV-001' }]} />)

      expect(screen.getAllByRole('button')).toHaveLength(1)
    })

    it('renders with empty items array', () => {
      render(<DemoPagination {...defaultProps} items={[]} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Active state', () => {
    it('applies active styling to current index', () => {
      const { container } = render(<DemoPagination {...defaultProps} activeIndex={1} />)

      const buttons = container.querySelectorAll('button')
      const activeIndicator = buttons[1]?.querySelector('span')
      const inactiveIndicator = buttons[0]?.querySelector('span')

      expect(activeIndicator?.className).toContain('w-6')
      expect(activeIndicator?.className).toContain('bg-violet-500')
      expect(inactiveIndicator?.className).toContain('w-2')
      expect(inactiveIndicator?.className).toContain('bg-zinc-600')
    })

    it('updates active styling when activeIndex changes', () => {
      const { rerender, container } = render(<DemoPagination {...defaultProps} activeIndex={0} />)

      let buttons = container.querySelectorAll('button')
      expect(buttons[0]?.querySelector('span')?.className).toContain('bg-violet-500')

      rerender(<DemoPagination {...defaultProps} activeIndex={2} />)

      buttons = container.querySelectorAll('button')
      expect(buttons[2]?.querySelector('span')?.className).toContain('bg-violet-500')
      expect(buttons[0]?.querySelector('span')?.className).toContain('bg-zinc-600')
    })
  })

  describe('Interaction', () => {
    it('calls onSelect with correct index when clicked', () => {
      const onSelect = vi.fn()
      render(<DemoPagination {...defaultProps} onSelect={onSelect} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1]!)

      expect(onSelect).toHaveBeenCalledWith(1)
    })

    it('calls onSelect for each dot click', () => {
      const onSelect = vi.fn()
      render(<DemoPagination {...defaultProps} onSelect={onSelect} />)

      const buttons = screen.getAllByRole('button')

      fireEvent.click(buttons[0]!)
      expect(onSelect).toHaveBeenCalledWith(0)

      fireEvent.click(buttons[2]!)
      expect(onSelect).toHaveBeenCalledWith(2)

      expect(onSelect).toHaveBeenCalledTimes(2)
    })

    it('allows clicking currently active dot', () => {
      const onSelect = vi.fn()
      render(<DemoPagination {...defaultProps} onSelect={onSelect} activeIndex={0} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0]!)

      expect(onSelect).toHaveBeenCalledWith(0)
    })
  })

  describe('Accessibility', () => {
    it('buttons have type="button" to prevent form submission', () => {
      render(<DemoPagination {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('has focus-visible ring for keyboard navigation', () => {
      const { container } = render(<DemoPagination {...defaultProps} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('focus-visible:ring-2')
      expect(button?.className).toContain('focus-visible:ring-violet-500')
    })
  })

  describe('Styling', () => {
    it('applies hover effect classes', () => {
      const { container } = render(<DemoPagination {...defaultProps} />)

      const indicator = container.querySelector('button span')
      expect(indicator?.className).toContain('group-hover:scale-125')
    })

    it('applies transition classes for smooth animation', () => {
      const { container } = render(<DemoPagination {...defaultProps} />)

      const indicator = container.querySelector('button span')
      expect(indicator?.className).toContain('transition-all')
      expect(indicator?.className).toContain('duration-200')
    })
  })
})
