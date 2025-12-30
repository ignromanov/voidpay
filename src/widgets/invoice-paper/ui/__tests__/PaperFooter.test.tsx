import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaperFooter } from '../PaperFooter'

describe('PaperFooter', () => {
  it('renders default notes with thank you message', () => {
    render(<PaperFooter />)
    expect(screen.getByText(/Thank you for your business/)).toBeDefined()
  })

  it('renders custom notes', () => {
    render(<PaperFooter notes="Custom testing notes" />)
    expect(screen.getByText('Custom testing notes')).toBeDefined()
  })

  it('renders QR code when payment URL is provided', () => {
    const { container } = render(<PaperFooter />)
    // QRCodeSVG renders an svg element
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('renders powered by branding', () => {
    render(<PaperFooter />)
    expect(screen.getByText('Powered by VoidPay')).toBeDefined()
    expect(screen.getByText('Create your own crypto invoice for free.')).toBeDefined()
  })
})
