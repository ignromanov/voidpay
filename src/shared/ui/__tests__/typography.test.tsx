/**
 * Typography component tests (Heading + Text)
 * TDD: These tests are written FIRST and must FAIL until implementation
 */
import { describe, expect, it } from 'vitest'
import { renderWithUser, screen } from './test-utils'
import { Heading, Text } from '../typography'

describe('Heading', () => {
  // T040-test: Heading variants
  describe('variants', () => {
    it('renders hero variant', () => {
      renderWithUser(<Heading variant="hero">Hero Title</Heading>)
      const heading = screen.getByText('Hero Title')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('text-5xl')
      expect(heading).toHaveClass('font-black')
      expect(heading).toHaveClass('tracking-tighter')
    })

    it('renders h1 variant', () => {
      renderWithUser(<Heading variant="h1">H1 Title</Heading>)
      const heading = screen.getByText('H1 Title')
      expect(heading).toHaveClass('text-3xl')
      expect(heading).toHaveClass('font-black')
    })

    it('renders h2 variant (default)', () => {
      renderWithUser(<Heading>H2 Title</Heading>)
      const heading = screen.getByText('H2 Title')
      expect(heading).toHaveClass('text-2xl')
      expect(heading).toHaveClass('font-bold')
    })

    it('renders h3 variant', () => {
      renderWithUser(<Heading variant="h3">H3 Title</Heading>)
      const heading = screen.getByText('H3 Title')
      expect(heading).toHaveClass('text-xl')
    })

    it('renders h4 variant', () => {
      renderWithUser(<Heading variant="h4">H4 Title</Heading>)
      const heading = screen.getByText('H4 Title')
      expect(heading).toHaveClass('text-sm')
      expect(heading).toHaveClass('uppercase')
      expect(heading).toHaveClass('tracking-widest')
    })
  })

  // T041-test: Polymorphic as prop
  describe('polymorphic as prop', () => {
    it('renders as h1 by default for hero variant', () => {
      renderWithUser(<Heading variant="hero">Hero</Heading>)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('renders as h2 by default for h2 variant', () => {
      renderWithUser(<Heading variant="h2">Title</Heading>)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('overrides element with as prop', () => {
      renderWithUser(
        <Heading variant="hero" as="h3">
          Hero as H3
        </Heading>
      )
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      renderWithUser(<Heading className="custom-class">Title</Heading>)
      expect(screen.getByText('Title')).toHaveClass('custom-class')
    })
  })
})

describe('Text', () => {
  // T042-test: Text variants
  describe('variants', () => {
    it('renders body variant (default)', () => {
      renderWithUser(<Text>Body text</Text>)
      const text = screen.getByText('Body text')
      expect(text).toBeInTheDocument()
      expect(text).toHaveClass('text-base')
      expect(text).toHaveClass('text-zinc-400')
    })

    it('renders large variant', () => {
      renderWithUser(<Text variant="large">Large text</Text>)
      const text = screen.getByText('Large text')
      expect(text).toHaveClass('text-lg')
    })

    it('renders small variant', () => {
      renderWithUser(<Text variant="small">Small text</Text>)
      const text = screen.getByText('Small text')
      expect(text).toHaveClass('text-sm')
      expect(text).toHaveClass('text-zinc-500')
    })

    it('renders tiny variant', () => {
      renderWithUser(<Text variant="tiny">Tiny text</Text>)
      const text = screen.getByText('Tiny text')
      expect(text).toHaveClass('text-xs')
    })

    it('renders muted variant', () => {
      renderWithUser(<Text variant="muted">Muted text</Text>)
      const text = screen.getByText('Muted text')
      expect(text).toHaveClass('text-zinc-600')
    })

    it('renders label variant', () => {
      renderWithUser(<Text variant="label">Label text</Text>)
      const text = screen.getByText('Label text')
      expect(text).toHaveClass('text-[10px]')
      expect(text).toHaveClass('uppercase')
      expect(text).toHaveClass('font-bold')
    })
  })

  // T043-test: Polymorphic as prop
  describe('polymorphic as prop', () => {
    it('renders as p by default for body variant', () => {
      renderWithUser(<Text data-testid="text">Body</Text>)
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('P')
    })

    it('renders as span by default for tiny variant', () => {
      renderWithUser(
        <Text variant="tiny" data-testid="text">
          Tiny
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('SPAN')
    })

    it('overrides element with as prop', () => {
      renderWithUser(
        <Text as="div" data-testid="text">
          Div text
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('DIV')
    })

    it('applies custom className', () => {
      renderWithUser(<Text className="custom-class">Text</Text>)
      expect(screen.getByText('Text')).toHaveClass('custom-class')
    })
  })

  // T044-test: Mono prop
  describe('mono prop', () => {
    it('applies monospace font class when mono is true', () => {
      renderWithUser(
        <Text mono data-testid="text">
          Monospace
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('font-mono')
    })

    it('does not apply monospace font by default', () => {
      renderWithUser(<Text data-testid="text">Normal</Text>)
      const text = screen.getByTestId('text')
      expect(text).not.toHaveClass('font-mono')
    })
  })
})
