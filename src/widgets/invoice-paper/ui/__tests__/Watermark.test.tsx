import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Watermark } from '../Watermark'

describe('Watermark', () => {
  it('does not render for pending status', () => {
    const { container } = render(<Watermark status="pending" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders DRAFT for draft status', () => {
    render(<Watermark status="draft" />)
    expect(screen.getByText('DRAFT')).toBeDefined()
  })

  it('renders PAID with date for paid status', () => {
    render(<Watermark status="paid" date="DEC 27, 2024" />)
    expect(screen.getByText('PAID')).toBeDefined()
    expect(screen.getByText('DEC 27, 2024')).toBeDefined()
  })
})
