import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FaqSection } from '../FaqSection'

describe('FaqSection', () => {
  describe('Component Rendering', () => {
    it('should render the component', () => {
      const { container } = render(<FaqSection />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })

    it('should render section heading', () => {
      render(<FaqSection />)
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    })

    it('should render section description', () => {
      render(<FaqSection />)
      expect(screen.getByText('Everything you need to know about VoidPay.')).toBeInTheDocument()
    })

    it('should render all FAQ items', () => {
      render(<FaqSection />)

      expect(screen.getByText('Is VoidPay really free?')).toBeInTheDocument()
      expect(screen.getByText("Why don't you have a token?")).toBeInTheDocument()
      expect(screen.getByText('What if VoidPay shuts down?')).toBeInTheDocument()
      expect(screen.getByText('Can I self-host this?')).toBeInTheDocument()
      expect(screen.getByText('Do you collect any data?')).toBeInTheDocument()
      expect(screen.getByText('What happens if the link breaks?')).toBeInTheDocument()
      expect(screen.getByText('Which wallets are supported?')).toBeInTheDocument()
    })
  })

  describe('Accordion Functionality', () => {
    it('should have first item open by default', () => {
      render(<FaqSection />)

      const firstButton = screen.getByText('Is VoidPay really free?').closest('button')
      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have other items closed by default', () => {
      render(<FaqSection />)

      const secondButton = screen.getByText("Why don't you have a token?").closest('button')
      expect(secondButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should toggle item when clicked', async () => {
      const user = userEvent.setup()
      render(<FaqSection />)

      const secondButton = screen.getByText("Why don't you have a token?").closest('button')
      expect(secondButton).toHaveAttribute('aria-expanded', 'false')

      if (secondButton) {
        await user.click(secondButton)
      }

      await waitFor(() => {
        expect(secondButton).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should close currently open item when opening another', async () => {
      const user = userEvent.setup()
      render(<FaqSection />)

      const firstButton = screen.getByText('Is VoidPay really free?').closest('button')
      const secondButton = screen.getByText("Why don't you have a token?").closest('button')

      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
      expect(secondButton).toHaveAttribute('aria-expanded', 'false')

      if (secondButton) {
        await user.click(secondButton)
      }

      await waitFor(() => {
        expect(firstButton).toHaveAttribute('aria-expanded', 'false')
        expect(secondButton).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should close item when clicking on open item', async () => {
      const user = userEvent.setup()
      render(<FaqSection />)

      const firstButton = screen.getByText('Is VoidPay really free?').closest('button')
      expect(firstButton).toHaveAttribute('aria-expanded', 'true')

      if (firstButton) {
        await user.click(firstButton)
      }

      await waitFor(() => {
        expect(firstButton).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('FAQ Content', () => {
    it('should display answer when item is open', async () => {
      render(<FaqSection />)

      // First item is open by default
      await waitFor(() => {
        expect(
          screen.getByText(/Yes, forever. We don't store your data on any server/)
        ).toBeInTheDocument()
      })
    })

    it('should display newly opened item answer', async () => {
      const user = userEvent.setup()
      render(<FaqSection />)

      const button = screen.getByText("Why don't you have a token?").closest('button')

      if (button) {
        await user.click(button)
      }

      await waitFor(() => {
        expect(
          screen.getByText(/Because we're a tool, not speculation/)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Layout and Styling', () => {
    it('should have proper styling classes', () => {
      const { container } = render(<FaqSection />)

      const section = container.querySelector('section')
      expect(section).toHaveClass('border-t', 'border-zinc-900')
    })

    it('should have accordion container with proper styling', () => {
      const { container } = render(<FaqSection />)

      const accordion = container.querySelector('.rounded-2xl')
      expect(accordion).toHaveClass('border', 'border-zinc-800')
    })
  })

  describe('Accessibility', () => {
    it('should have section with proper ID', () => {
      const { container } = render(<FaqSection />)

      const section = container.querySelector('section')
      expect(section).toHaveAttribute('id', 'faq')
      expect(section).toHaveAttribute('aria-labelledby', 'faq-heading')
    })

    it('should have heading with proper ID', () => {
      render(<FaqSection />)

      const heading = screen.getByText('Frequently Asked Questions')
      expect(heading).toHaveAttribute('id', 'faq-heading')
    })

    it('should have buttons with proper ARIA attributes', () => {
      render(<FaqSection />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-expanded')
      })
    })

    it('should have chevron icons with ARIA hidden', () => {
      const { container } = render(<FaqSection />)

      const chevrons = container.querySelectorAll('[aria-hidden="true"]')
      expect(chevrons.length).toBeGreaterThan(0)
    })
  })

  describe('Chevron Animation', () => {
    it('should rotate chevron when item is open', () => {
      render(<FaqSection />)

      // First button is open by default
      const firstButton = screen.getByText('Is VoidPay really free?').closest('button')
      const chevron = firstButton?.querySelector('[aria-hidden="true"]')

      expect(chevron).toHaveClass('rotate-180')
    })

    it('should not rotate chevron when item is closed', () => {
      render(<FaqSection />)

      const secondButton = screen.getByText("Why don't you have a token?").closest('button')
      const chevron = secondButton?.querySelector('[aria-hidden="true"]')

      expect(chevron).not.toHaveClass('rotate-180')
    })
  })

  describe('Heading Hierarchy', () => {
    it('should use h2 for section heading', () => {
      render(<FaqSection />)

      const heading = screen.getByText('Frequently Asked Questions')
      expect(heading.tagName).toBe('H2')
    })
  })
})
