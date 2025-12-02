import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AuroraText } from '../aurora-text'

describe('AuroraText', () => {
  describe('Default rendering', () => {
    it('should render children text', () => {
      const { container } = render(<AuroraText>Hello World</AuroraText>)

      // Text appears twice: sr-only + visible
      expect(container.textContent).toBe('Hello WorldHello World')
    })

    it('should render as span by default', () => {
      const { container } = render(<AuroraText>Text</AuroraText>)

      const element = container.querySelector('span')
      expect(element).toBeInTheDocument()
    })

    it('should have bg-clip-text for gradient effect', () => {
      const { container } = render(<AuroraText>Gradient</AuroraText>)

      const inner = container.querySelector('[aria-hidden="true"]')
      expect(inner?.className).toContain('bg-clip-text')
    })

    it('should have aurora animation class', () => {
      const { container } = render(<AuroraText>Animated</AuroraText>)

      const inner = container.querySelector('[aria-hidden="true"]')
      expect(inner?.className).toContain('animate-aurora')
    })

    it('should have accessibility sr-only text', () => {
      const { container } = render(<AuroraText>Accessible</AuroraText>)

      const srOnly = container.querySelector('.sr-only')
      expect(srOnly).toBeInTheDocument()
      expect(srOnly?.textContent).toBe('Accessible')
    })
  })

  describe('Custom colors', () => {
    it('should apply custom colors to gradient', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff']
      const { container } = render(<AuroraText colors={customColors}>Colorful</AuroraText>)

      const inner = container.querySelector('[aria-hidden="true"]') as HTMLElement
      expect(inner?.style.backgroundImage).toContain('#ff0000')
      expect(inner?.style.backgroundImage).toContain('#00ff00')
      expect(inner?.style.backgroundImage).toContain('#0000ff')
    })

    it('should use violet/indigo/purple colors by default', () => {
      const { container } = render(<AuroraText>Default Colors</AuroraText>)

      const inner = container.querySelector('[aria-hidden="true"]') as HTMLElement
      // violet-500, indigo-500, purple-500
      expect(inner?.style.backgroundImage).toContain('#8b5cf6')
      expect(inner?.style.backgroundImage).toContain('#6366f1')
      expect(inner?.style.backgroundImage).toContain('#a855f7')
    })
  })

  describe('Animation speed', () => {
    it('should apply custom animation speed', () => {
      const { container } = render(<AuroraText speed={2}>Fast</AuroraText>)

      const inner = container.querySelector('[aria-hidden="true"]') as HTMLElement
      expect(inner?.style.animationDuration).toBe('5s') // 10 / 2 = 5
    })

    it('should have default speed of 10s', () => {
      const { container } = render(<AuroraText>Default Speed</AuroraText>)

      const inner = container.querySelector('[aria-hidden="true"]') as HTMLElement
      expect(inner?.style.animationDuration).toBe('10s') // 10 / 1 = 10
    })
  })

  describe('className merge', () => {
    it('should merge custom className with defaults', () => {
      const { container } = render(<AuroraText className="text-4xl font-bold">Custom</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('text-4xl')
      expect(element.className).toContain('font-bold')
    })
  })

  describe('Children handling', () => {
    it('should handle empty children', () => {
      const { container } = render(<AuroraText>{''}</AuroraText>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle React nodes as children', () => {
      const { container } = render(
        <AuroraText>
          <strong>Bold</strong> and <em>italic</em>
        </AuroraText>
      )

      expect(container.querySelector('strong')).toBeInTheDocument()
      expect(container.querySelector('em')).toBeInTheDocument()
    })
  })
})
