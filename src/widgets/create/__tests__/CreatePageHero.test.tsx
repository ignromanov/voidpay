import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CreatePageHero } from '../CreatePageHero'

describe('CreatePageHero', () => {
  it('renders exactly one h1', () => {
    render(<CreatePageHero />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
  })

  it('h1 contains the expected title text', () => {
    render(<CreatePageHero />)
    expect(
      screen.getByRole('heading', { level: 1, name: /Crypto Invoice Generator/i })
    ).toBeInTheDocument()
  })

  it('renders the intro paragraph', () => {
    render(<CreatePageHero />)
    expect(screen.getByText(/Fill the form, get a shareable link/i)).toBeInTheDocument()
  })
})
