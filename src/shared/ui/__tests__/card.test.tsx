/**
 * Card component tests
 * TDD: These tests are written FIRST and must FAIL until implementation
 */
import { describe, expect, it } from 'vitest'
import { renderWithUser, screen } from './test-utils'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../card'

describe('Card', () => {
  // T050-test: Default variant (backward compatibility)
  describe('default variant', () => {
    it('renders with default styling', () => {
      renderWithUser(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
    })

    it('applies custom className', () => {
      renderWithUser(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      )
      expect(screen.getByTestId('card')).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLDivElement | null }
      renderWithUser(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('applies default variant styles when variant not specified', () => {
      renderWithUser(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-zinc-900/50')
      expect(card).toHaveClass('border-zinc-800')
    })
  })

  // T051-test: Glass variant
  describe('glass variant', () => {
    it('applies glass variant styles', () => {
      renderWithUser(
        <Card variant="glass" data-testid="card">
          Content
        </Card>
      )
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('backdrop-blur-xl')
      expect(card).toHaveClass('bg-zinc-950/30')
    })

    it('maintains base styles with glass variant', () => {
      renderWithUser(
        <Card variant="glass" data-testid="card">
          Content
        </Card>
      )
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
    })
  })

  // T052-test: Sub-components
  describe('sub-components', () => {
    it('renders CardHeader', () => {
      renderWithUser(<CardHeader data-testid="header">Header</CardHeader>)
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('renders CardTitle', () => {
      renderWithUser(<CardTitle data-testid="title">Title</CardTitle>)
      expect(screen.getByTestId('title')).toBeInTheDocument()
    })

    it('renders CardDescription', () => {
      renderWithUser(<CardDescription data-testid="desc">Description</CardDescription>)
      expect(screen.getByTestId('desc')).toBeInTheDocument()
    })

    it('renders CardContent', () => {
      renderWithUser(<CardContent data-testid="content">Content</CardContent>)
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('renders CardFooter', () => {
      renderWithUser(<CardFooter data-testid="footer">Footer</CardFooter>)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders full card composition', () => {
      renderWithUser(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Invoice #001</CardTitle>
            <CardDescription>Payment details</CardDescription>
          </CardHeader>
          <CardContent>Amount: $100</CardContent>
          <CardFooter>Due: Dec 1</CardFooter>
        </Card>
      )
      expect(screen.getByText('Invoice #001')).toBeInTheDocument()
      expect(screen.getByText('Payment details')).toBeInTheDocument()
      expect(screen.getByText('Amount: $100')).toBeInTheDocument()
      expect(screen.getByText('Due: Dec 1')).toBeInTheDocument()
    })
  })
})
