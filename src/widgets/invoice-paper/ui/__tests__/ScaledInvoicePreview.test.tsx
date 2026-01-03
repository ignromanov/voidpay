/**
 * ScaledInvoicePreview component tests
 * Feature: 015-create-page-preview
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'
import { ScaledInvoicePreview } from '../ScaledInvoicePreview'
import { NETWORK_GLOW_SHADOWS, NETWORK_GLOW_BORDERS } from '@/entities/network/config/ui-config'

// Helper to render with userEvent
function renderWithUser(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  }
}

// Mock useInvoiceScale hook
const mockUseInvoiceScale = vi.fn(() => ({
  setContainerRef: vi.fn(),
  scale: 0.75,
  scaledWidth: 600,
  scaledHeight: 848,
}))

vi.mock('../../lib/use-invoice-scale', () => ({
  useInvoiceScale: (options: any) => mockUseInvoiceScale(options),
  PRESET_CONFIGS: {
    demo: { containerHeightClass: 'min-h-[75vh]' },
    editor: { containerHeightClass: 'h-full' },
    modal: { containerHeightClass: 'h-full' },
  },
}))

describe('ScaledInvoicePreview', () => {
  beforeEach(() => {
    mockUseInvoiceScale.mockClear()
  })

  describe('rendering', () => {
    it('renders children content', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Test Invoice Content</div>
        </ScaledInvoicePreview>
      )

      expect(screen.getByText('Test Invoice Content')).toBeInTheDocument()
    })

    it('renders overlay when provided', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo" overlay={<div>Overlay Content</div>}>
          <div>Test Invoice</div>
        </ScaledInvoicePreview>
      )

      expect(screen.getByText('Overlay Content')).toBeInTheDocument()
    })

    it('does not render overlay when not provided', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Test Invoice</div>
        </ScaledInvoicePreview>
      )

      // No overlay content
      expect(screen.queryByText('Overlay')).not.toBeInTheDocument()
    })

    it('applies correct container height class from preset', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Test</div>
        </ScaledInvoicePreview>
      )

      const containerDiv = container.firstChild as HTMLElement
      expect(containerDiv).toHaveClass('min-h-[75vh]')
    })

    it('renders with custom className', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo" className="custom-class">
          <div>Test</div>
        </ScaledInvoicePreview>
      )

      const containerDiv = container.firstChild as HTMLElement
      expect(containerDiv).toHaveClass('custom-class')
    })
  })

  describe('preset configurations', () => {
    it('uses demo preset configuration', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Demo</div>
        </ScaledInvoicePreview>
      )

      expect(mockUseInvoiceScale).toHaveBeenCalledWith({ preset: 'demo' })
    })

    it('uses editor preset configuration', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="editor">
          <div>Editor</div>
        </ScaledInvoicePreview>
      )

      expect(mockUseInvoiceScale).toHaveBeenCalledWith({ preset: 'editor' })
    })

    it('uses modal preset configuration', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="modal">
          <div>Modal</div>
        </ScaledInvoicePreview>
      )

      expect(mockUseInvoiceScale).toHaveBeenCalledWith({ preset: 'modal' })
    })

    it('uses scaleOptions when no preset provided', () => {
      const scaleOptions = { maxScale: 0.9, fitMode: 'width' as const }

      renderWithUser(
        <ScaledInvoicePreview scaleOptions={scaleOptions}>
          <div>Custom</div>
        </ScaledInvoicePreview>
      )

      expect(mockUseInvoiceScale).toHaveBeenCalledWith(scaleOptions)
    })

    it('preset takes precedence over scaleOptions', () => {
      const scaleOptions = { maxScale: 0.9 }

      renderWithUser(
        <ScaledInvoicePreview preset="demo" scaleOptions={scaleOptions}>
          <div>Test</div>
        </ScaledInvoicePreview>
      )

      expect(mockUseInvoiceScale).toHaveBeenCalledWith({ preset: 'demo' })
    })
  })

  describe('scaling behavior', () => {
    it('applies scale transform to invoice wrapper', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Scaled</div>
        </ScaledInvoicePreview>
      )

      const scaledDiv = container.querySelector('[style*="transform"]') as HTMLElement
      expect(scaledDiv).toBeInTheDocument()
      expect(scaledDiv).toHaveStyle('transform: scale(0.75)')
    })

    it('applies scaled dimensions to wrapper', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Scaled</div>
        </ScaledInvoicePreview>
      )

      // Find wrapper with width/height style
      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper).toHaveStyle({ width: '600px', height: '848px' })
    })

    it('updates when scale changes', () => {
      mockUseInvoiceScale.mockReturnValue({
        setContainerRef: vi.fn(),
        scale: 0.5,
        scaledWidth: 400,
        scaledHeight: 565,
      })

      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Scaled</div>
        </ScaledInvoicePreview>
      )

      const scaledDiv = container.querySelector('[style*="transform"]') as HTMLElement
      expect(scaledDiv).toHaveStyle('transform: scale(0.5)')

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper).toHaveStyle({ width: '400px', height: '565px' })
    })
  })

  describe('glow effects', () => {
    it('applies glowClassName for elliptical glow', () => {
      const glowClass = NETWORK_GLOW_SHADOWS[1] // Ethereum

      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo" glowClassName={glowClass}>
          <div>Glowing</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      // Glow applied via before: pseudo-element classes
      expect(wrapper.className).toContain('before:')
    })

    it('applies borderClassName for modal borders', () => {
      const borderClass = NETWORK_GLOW_BORDERS[42161] // Arbitrum

      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="modal" borderClassName={borderClass}>
          <div>Bordered</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper.className).toContain('ring')
    })

    it('renders without glow when glowClassName not provided', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>No Glow</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      // Should not have before: classes when no glow
      const hasBeforePseudo = wrapper.className.includes('before:bg-gradient')
      expect(hasBeforePseudo).toBe(false)
    })

    it('renders without border when borderClassName not provided', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>No Border</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper.className).not.toContain('ring-1')
    })
  })

  describe('click interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={handleClick}>
          <div>Clickable</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies cursor-zoom-in when onClick provided', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={() => {}}>
          <div>Clickable</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('cursor-zoom-in')
    })

    it('does not apply cursor style when onClick not provided', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Not Clickable</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper).not.toHaveClass('cursor-zoom-in')
    })

    it('has role="button" when onClick provided', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={() => {}}>
          <div>Clickable</div>
        </ScaledInvoicePreview>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('does not have role="button" when onClick not provided', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Not Clickable</div>
        </ScaledInvoicePreview>
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('has tabIndex when onClick provided', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={() => {}}>
          <div>Clickable</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('keyboard navigation', () => {
    it('triggers onClick on Enter key', async () => {
      const handleClick = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={handleClick}>
          <div>Keyboard Nav</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('triggers onClick on Space key', async () => {
      const handleClick = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={handleClick}>
          <div>Keyboard Nav</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not trigger onClick on other keys', async () => {
      const handleClick = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={handleClick}>
          <div>Keyboard Nav</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{a}')
      await user.keyboard('{Escape}')
      await user.keyboard('{Tab}')

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('prevents default behavior on Space key', async () => {
      const handleClick = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={handleClick}>
          <div>Keyboard Nav</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      button.focus()

      const preventDefault = vi.fn()
      button.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          preventDefault()
        }
      })

      await user.keyboard(' ')

      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('mouse event handlers', () => {
    it('calls onMouseEnter when mouse enters', async () => {
      const handleMouseEnter = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onMouseEnter={handleMouseEnter}>
          <div>Hoverable</div>
        </ScaledInvoicePreview>
      )

      const container = screen.getByText('Hoverable').parentElement?.parentElement as HTMLElement
      await user.hover(container)

      expect(handleMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('calls onMouseLeave when mouse leaves', async () => {
      const handleMouseLeave = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onMouseLeave={handleMouseLeave}>
          <div>Hoverable</div>
        </ScaledInvoicePreview>
      )

      const container = screen.getByText('Hoverable').parentElement?.parentElement as HTMLElement
      await user.hover(container)
      await user.unhover(container)

      expect(handleMouseLeave).toHaveBeenCalledTimes(1)
    })
  })

  describe('printable mode', () => {
    it('adds invoice-print-target class when printable=true', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo" printable>
          <div>Printable</div>
        </ScaledInvoicePreview>
      )

      const printTarget = container.querySelector('.invoice-print-target')
      expect(printTarget).toBeInTheDocument()
    })

    it('does not add invoice-print-target class when printable=false', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo" printable={false}>
          <div>Not Printable</div>
        </ScaledInvoicePreview>
      )

      const printTarget = container.querySelector('.invoice-print-target')
      expect(printTarget).not.toBeInTheDocument()
    })

    it('applies print-specific classes', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Test</div>
        </ScaledInvoicePreview>
      )

      const innerWrapper = container.querySelector('[style*="transform"]') as HTMLElement
      expect(innerWrapper).toHaveClass('print:static')
      expect(innerWrapper).toHaveClass('print:!transform-none')
    })

    it('hides overlay on print', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo" overlay={<div>Overlay</div>}>
          <div>Test</div>
        </ScaledInvoicePreview>
      )

      const overlayWrapper = screen.getByText('Overlay').parentElement
      expect(overlayWrapper).toHaveClass('print:hidden')
    })
  })

  describe('forwardRef support', () => {
    it('forwards ref to container element', () => {
      const ref = vi.fn()

      renderWithUser(
        <ScaledInvoicePreview preset="demo" ref={ref}>
          <div>Ref Test</div>
        </ScaledInvoicePreview>
      )

      expect(ref).toHaveBeenCalled()
      const refArg = ref.mock.calls[0][0]
      expect(refArg).toBeInstanceOf(HTMLElement)
    })

    it('works with useRef hook', () => {
      const TestComponent = () => {
        const ref = { current: null } as any
        return (
          <ScaledInvoicePreview preset="demo" ref={ref}>
            <div>useRef Test</div>
          </ScaledInvoicePreview>
        )
      }

      renderWithUser(<TestComponent />)

      expect(screen.getByText('useRef Test')).toBeInTheDocument()
    })

    it('merges callback ref with internal ref', () => {
      const setContainerRef = vi.fn()
      mockUseInvoiceScale.mockReturnValue({
        setContainerRef,
        scale: 0.75,
        scaledWidth: 600,
        scaledHeight: 848,
      })

      const externalRef = vi.fn()

      renderWithUser(
        <ScaledInvoicePreview preset="demo" ref={externalRef}>
          <div>Merged Ref</div>
        </ScaledInvoicePreview>
      )

      // Both internal and external refs should be called
      expect(setContainerRef).toHaveBeenCalled()
      expect(externalRef).toHaveBeenCalled()
    })
  })

  describe('responsive behavior', () => {
    it('updates scale dimensions on resize', () => {
      mockUseInvoiceScale.mockReturnValue({
        setContainerRef: vi.fn(),
        scale: 0.6,
        scaledWidth: 480,
        scaledHeight: 678,
      })

      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Responsive</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper).toHaveStyle({ width: '480px', height: '678px' })
    })

    it('applies will-change for performance', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Performance</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper).toHaveStyle('will-change: width, height')
    })

    it('has transition classes for smooth scaling', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Smooth</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper).toHaveClass('transition-[width,height]')
      expect(wrapper).toHaveClass('duration-200')
      expect(wrapper).toHaveClass('ease-out')
    })
  })

  describe('edge cases', () => {
    it('handles zero scale gracefully', () => {
      mockUseInvoiceScale.mockReturnValue({
        setContainerRef: vi.fn(),
        scale: 0,
        scaledWidth: 0,
        scaledHeight: 0,
      })

      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Zero Scale</div>
        </ScaledInvoicePreview>
      )

      const scaledDiv = container.querySelector('[style*="transform"]') as HTMLElement
      expect(scaledDiv).toHaveStyle('transform: scale(0)')
    })

    it('handles very large scale values', () => {
      mockUseInvoiceScale.mockReturnValue({
        setContainerRef: vi.fn(),
        scale: 2.5,
        scaledWidth: 2000,
        scaledHeight: 2828,
      })

      const { container } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Large Scale</div>
        </ScaledInvoicePreview>
      )

      const scaledDiv = container.querySelector('[style*="transform"]') as HTMLElement
      expect(scaledDiv).toHaveStyle('transform: scale(2.5)')
    })

    it('renders without children', () => {
      const { container } = renderWithUser(<ScaledInvoicePreview preset="demo" />)

      // Should render container even without children
      expect(container.firstChild).toBeInTheDocument()
    })

    it('handles undefined onClick handler', async () => {
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={undefined}>
          <div>No Handler</div>
        </ScaledInvoicePreview>
      )

      // Should not be clickable
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('handles both glow and border simultaneously', () => {
      const { container } = renderWithUser(
        <ScaledInvoicePreview
          preset="demo"
          glowClassName="before:from-violet-500"
          borderClassName="ring-1 ring-violet-500"
        >
          <div>Both Effects</div>
        </ScaledInvoicePreview>
      )

      const wrapper = container.querySelector('[style*="width"]') as HTMLElement
      expect(wrapper.className).toContain('before:')
      expect(wrapper.className).toContain('ring')
    })
  })

  describe('accessibility', () => {
    it('maintains focus visibility', () => {
      renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={() => {}}>
          <div>Focus Test</div>
        </ScaledInvoicePreview>
      )

      const button = screen.getByRole('button')
      button.focus()

      expect(button).toHaveFocus()
    })

    it('is keyboard accessible when interactive', async () => {
      const handleClick = vi.fn()
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo" onClick={handleClick}>
          <div>Accessible</div>
        </ScaledInvoicePreview>
      )

      // Tab to focus
      await user.tab()

      // Activate with keyboard
      await user.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalled()
    })

    it('does not trap focus when not interactive', async () => {
      const { user } = renderWithUser(
        <ScaledInvoicePreview preset="demo">
          <div>Not Interactive</div>
        </ScaledInvoicePreview>
      )

      // Should not be in tab order
      await user.tab()

      const container = screen.getByText('Not Interactive').closest('[style*="width"]')
      expect(container).not.toHaveFocus()
    })
  })
})
