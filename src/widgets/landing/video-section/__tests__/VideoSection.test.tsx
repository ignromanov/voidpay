/**
 * VideoSection Tests
 * Feature: 012-landing-page
 * User Story: US1 (First Impression), US2 (Convert to Action)
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// useReducedMotion is globally mocked via vitest.config.ts (returns true = reduced motion)
// This exercises the reduced-motion code path (controls visible, autoPlay off)

// Mock next/link with forwardRef for Radix Slot compatibility
vi.mock('next/link', () => ({
  default: vi.fn().mockImplementation(({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}))

// Mock Button to avoid Radix Slot issues in tests
vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual('@/shared/ui')
  return {
    ...actual,
    Button: vi.fn(({ children, asChild, ...props }) => {
      if (asChild) {
        const linkEl = children as React.ReactElement<{ href: string; children: React.ReactNode }>
        return (
          <a href={linkEl.props.href} {...props}>
            {linkEl.props.children}
          </a>
        )
      }
      return <button {...props}>{children}</button>
    }),
  }
})

import { VideoSection } from '../VideoSection'

describe('VideoSection', () => {
  describe('Copy', () => {
    it('should render the eyebrow label', () => {
      render(<VideoSection />)
      expect(screen.getByText('One invoice. Start to finish.')).toBeInTheDocument()
    })

    it('should render the headline', () => {
      render(<VideoSection />)
      expect(screen.getByText('Watch a $42 invoice get paid.')).toBeInTheDocument()
    })

    it('should render the subheadline', () => {
      render(<VideoSection />)
      expect(screen.getByText(/No account\. No server\./)).toBeInTheDocument()
    })

    it('should render the figcaption', () => {
      render(<VideoSection />)
      expect(screen.getByText('Silent by design. Captions tell the story.')).toBeInTheDocument()
    })

    it('should render the CTA button linking to /create', () => {
      render(<VideoSection />)
      const link = screen.getByRole('link', { name: /create your own/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/create')
    })

    it('should render the CTA microcopy', () => {
      render(<VideoSection />)
      expect(screen.getByText(/No signup\. Takes 30 seconds\./)).toBeInTheDocument()
    })
  })

  describe('Video element', () => {
    it('should render a video element with correct src and poster', () => {
      render(<VideoSection />)
      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('src', '/video/voidpay-16x9-v2.mp4')
      expect(video).toHaveAttribute('poster', '/video/poster-scene5.png')
    })

    it('should have muted, loop, playsInline, and preload="none"', () => {
      render(<VideoSection />)
      const video = document.querySelector('video')
      expect(video).toHaveAttribute('muted')
      expect(video).toHaveAttribute('loop')
      expect(video).toHaveAttribute('playsinline')
      expect(video).toHaveAttribute('preload', 'none')
    })

    it('should show controls in reduced-motion mode (global mock returns true)', () => {
      render(<VideoSection />)
      const video = document.querySelector('video')
      // Global useReducedMotion mock returns true → controls should be present
      expect(video).toHaveAttribute('controls')
    })

    it('should have an accessible aria-label', () => {
      render(<VideoSection />)
      const video = document.querySelector('video')
      expect(video).toHaveAttribute('aria-label')
      expect(video?.getAttribute('aria-label')).toMatch(/VoidPay/)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-labelledby on section', () => {
      render(<VideoSection />)
      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'video-section-heading')
    })

    it('should have a heading with id matching aria-labelledby', () => {
      render(<VideoSection />)
      const heading = document.querySelector('#video-section-heading')
      expect(heading).toBeInTheDocument()
    })

    it('should wrap video in figure with figcaption', () => {
      render(<VideoSection />)
      const figure = document.querySelector('figure')
      expect(figure).toBeInTheDocument()
      const figcaption = figure?.querySelector('figcaption')
      expect(figcaption).toBeInTheDocument()
    })
  })
})
