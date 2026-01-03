/**
 * Critical Icons Tests
 * Tests for inline SVG icons used in above-the-fold components
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  LockIcon,
  ServerOffIcon,
  GlobeIcon,
  GithubIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  WalletIcon,
  HashIcon,
} from '../critical-icons'

describe('Critical Icons', () => {
  describe('ArrowRightIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<ArrowRightIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('uses default size of 24', () => {
      const { container } = render(<ArrowRightIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '24')
      expect(svg).toHaveAttribute('height', '24')
    })

    it('accepts custom size', () => {
      const { container } = render(<ArrowRightIcon size={16} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '16')
      expect(svg).toHaveAttribute('height', '16')
    })

    it('accepts string size', () => {
      const { container } = render(<ArrowRightIcon size="2rem" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '2rem')
    })

    it('passes through className', () => {
      const { container } = render(<ArrowRightIcon className="text-red-500" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('text-red-500')
    })
  })

  describe('ArrowLeftIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<ArrowLeftIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('accepts custom size', () => {
      const { container } = render(<ArrowLeftIcon size={20} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '20')
    })
  })

  describe('LockIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<LockIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('contains rect element for lock body', () => {
      const { container } = render(<LockIcon />)
      expect(container.querySelector('rect')).toBeInTheDocument()
    })
  })

  describe('ServerOffIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<ServerOffIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('contains multiple path elements', () => {
      const { container } = render(<ServerOffIcon />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThan(1)
    })
  })

  describe('GlobeIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<GlobeIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('contains circle element', () => {
      const { container } = render(<GlobeIcon />)
      expect(container.querySelector('circle')).toBeInTheDocument()
    })
  })

  describe('GithubIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<GithubIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('MailIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<MailIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('contains rect element for envelope', () => {
      const { container } = render(<MailIcon />)
      expect(container.querySelector('rect')).toBeInTheDocument()
    })
  })

  describe('PhoneIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<PhoneIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('MapPinIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<MapPinIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('contains circle element for pin center', () => {
      const { container } = render(<MapPinIcon />)
      expect(container.querySelector('circle')).toBeInTheDocument()
    })
  })

  describe('WalletIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<WalletIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('HashIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<HashIcon />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('contains line elements for hash symbol', () => {
      const { container } = render(<HashIcon />)
      const lines = container.querySelectorAll('line')
      expect(lines.length).toBe(4) // Hash has 4 lines
    })
  })

  describe('Common SVG attributes', () => {
    const icons = [
      { name: 'ArrowRightIcon', Component: ArrowRightIcon },
      { name: 'LockIcon', Component: LockIcon },
      { name: 'GlobeIcon', Component: GlobeIcon },
      { name: 'MailIcon', Component: MailIcon },
    ]

    icons.forEach(({ name, Component }) => {
      it(`${name} has correct viewBox`, () => {
        const { container } = render(<Component />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      })

      it(`${name} has stroke set to currentColor`, () => {
        const { container } = render(<Component />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('stroke', 'currentColor')
      })

      it(`${name} has fill set to none`, () => {
        const { container } = render(<Component />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('fill', 'none')
      })

      it(`${name} has strokeWidth of 2`, () => {
        const { container } = render(<Component />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('stroke-width', '2')
      })
    })
  })

  describe('Aria attributes', () => {
    it('passes aria-hidden attribute', () => {
      const { container } = render(<ArrowRightIcon aria-hidden="true" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('passes aria-label attribute', () => {
      const { container } = render(<LockIcon aria-label="Security" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-label', 'Security')
    })
  })
})
