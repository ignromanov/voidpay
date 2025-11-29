/**
 * Input component tests
 * TDD: These tests are written FIRST and must FAIL until implementation
 */
import { describe, expect, it } from 'vitest'
import { Mail, Search } from 'lucide-react'
import { renderWithUser, screen } from './test-utils'
import { Input } from '../input'

describe('Input', () => {
  // T010-test: Default state rendering
  describe('default state', () => {
    it('renders with base styling', () => {
      renderWithUser(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('rounded-lg')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('bg-zinc-900/50')
    })

    it('applies custom className', () => {
      renderWithUser(<Input className="custom-class" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLInputElement | null }
      renderWithUser(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('applies placeholder', () => {
      renderWithUser(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })
  })

  // T011-test: Label and error state
  describe('label and error state', () => {
    it('renders label when provided', () => {
      renderWithUser(<Input label="Email" data-testid="input" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('renders error message when provided', () => {
      renderWithUser(<Input error="Required field" data-testid="input" />)
      expect(screen.getByText('Required field')).toBeInTheDocument()
    })

    it('applies error styling to input', () => {
      renderWithUser(<Input error="Error" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('border-red-500/50')
    })

    it('shows both label and error together', () => {
      renderWithUser(<Input label="Email" error="Invalid email" data-testid="input" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  // T012-test: Icon support
  describe('icon support', () => {
    it('renders leading icon by default', () => {
      renderWithUser(<Input icon={<Mail data-testid="icon" />} data-testid="input" />)
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('applies left padding when icon is leading', () => {
      renderWithUser(<Input icon={<Mail />} data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('pl-9')
    })

    it('renders trailing icon when position is trailing', () => {
      renderWithUser(
        <Input icon={<Search data-testid="icon" />} iconPosition="trailing" data-testid="input" />
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('applies right padding when icon is trailing', () => {
      renderWithUser(<Input icon={<Search />} iconPosition="trailing" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('pr-9')
    })
  })

  // T013-test: Accessibility
  describe('accessibility', () => {
    it('associates label with input via id', () => {
      renderWithUser(<Input label="Username" id="username" />)
      const input = screen.getByLabelText('Username')
      expect(input).toHaveAttribute('id', 'username')
    })

    it('sets aria-invalid when error is present', () => {
      renderWithUser(<Input error="Error" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('sets aria-describedby for error message', () => {
      renderWithUser(<Input error="Error" id="test" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-describedby', 'test-error')
    })

    it('generates unique id when not provided', () => {
      renderWithUser(<Input label="Email" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('id')
    })
  })
})
