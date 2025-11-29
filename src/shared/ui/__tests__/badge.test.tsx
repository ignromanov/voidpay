/**
 * Badge component tests
 * TDD: These tests are written FIRST and must FAIL until implementation
 */
import { describe, expect, it } from 'vitest'
import { renderWithUser, screen } from './test-utils'
import { Badge } from '../badge'

describe('Badge', () => {
  // T030-test: Default variant
  describe('default variant', () => {
    it('renders with default styling', () => {
      renderWithUser(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('rounded-md')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('text-xs')
      expect(badge).toHaveClass('font-semibold')
    })

    it('applies default variant classes', () => {
      renderWithUser(<Badge data-testid="badge">Status</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-zinc-900')
      expect(badge).toHaveClass('text-zinc-300')
      expect(badge).toHaveClass('border-zinc-800')
    })

    it('applies custom className', () => {
      renderWithUser(<Badge className="custom-class">Test</Badge>)
      expect(screen.getByText('Test')).toHaveClass('custom-class')
    })
  })

  // T031-test: Success variant
  describe('success variant', () => {
    it('applies success variant classes', () => {
      renderWithUser(
        <Badge variant="success" data-testid="badge">
          Paid
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-emerald-500/10')
      expect(badge).toHaveClass('text-emerald-400')
      expect(badge).toHaveClass('border-emerald-500/20')
    })
  })

  // T032-test: Warning variant
  describe('warning variant', () => {
    it('applies warning variant classes', () => {
      renderWithUser(
        <Badge variant="warning" data-testid="badge">
          Pending
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-amber-500/10')
      expect(badge).toHaveClass('text-amber-400')
      expect(badge).toHaveClass('border-amber-500/20')
    })
  })

  // T033-test: Outline variant
  describe('outline variant', () => {
    it('applies outline variant classes', () => {
      renderWithUser(
        <Badge variant="outline" data-testid="badge">
          Draft
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-transparent')
      expect(badge).toHaveClass('border-zinc-700')
      expect(badge).toHaveClass('text-zinc-400')
    })
  })
})
