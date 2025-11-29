/**
 * Textarea component tests
 * TDD: These tests are written FIRST and must FAIL until implementation
 */
import { describe, expect, it } from 'vitest'
import { renderWithUser, screen } from './test-utils'
import { Textarea } from '../textarea'

describe('Textarea', () => {
  // T020-test: Default state rendering
  describe('default state', () => {
    it('renders with base styling', () => {
      renderWithUser(<Textarea data-testid="textarea" />)
      const textarea = screen.getByTestId('textarea')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('rounded-lg')
      expect(textarea).toHaveClass('border')
      expect(textarea).toHaveClass('bg-zinc-900/50')
    })

    it('applies custom className', () => {
      renderWithUser(<Textarea className="custom-class" data-testid="textarea" />)
      expect(screen.getByTestId('textarea')).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLTextAreaElement | null }
      renderWithUser(<Textarea ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })

    it('applies placeholder', () => {
      renderWithUser(<Textarea placeholder="Enter notes" />)
      expect(screen.getByPlaceholderText('Enter notes')).toBeInTheDocument()
    })

    it('has minimum height', () => {
      renderWithUser(<Textarea data-testid="textarea" />)
      expect(screen.getByTestId('textarea')).toHaveClass('min-h-[80px]')
    })
  })

  // T021-test: Label support
  describe('label support', () => {
    it('renders label when provided', () => {
      renderWithUser(<Textarea label="Notes" data-testid="textarea" />)
      expect(screen.getByText('Notes')).toBeInTheDocument()
    })

    it('associates label with textarea via id', () => {
      renderWithUser(<Textarea label="Description" id="desc" />)
      const textarea = screen.getByLabelText('Description')
      expect(textarea).toHaveAttribute('id', 'desc')
    })

    it('generates unique id when not provided', () => {
      renderWithUser(<Textarea label="Notes" data-testid="textarea" />)
      const textarea = screen.getByTestId('textarea')
      expect(textarea).toHaveAttribute('id')
    })
  })

  // T022-test: Resize disabled
  describe('resize disabled', () => {
    it('has resize-none class', () => {
      renderWithUser(<Textarea data-testid="textarea" />)
      expect(screen.getByTestId('textarea')).toHaveClass('resize-none')
    })
  })
})
