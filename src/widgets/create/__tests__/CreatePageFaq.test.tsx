import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CreatePageFaq } from '../CreatePageFaq'
import { FAQ_ITEMS } from '../config/faq-items'

describe('CreatePageFaq', () => {
  it('renders one <dt> per FAQ_ITEMS entry (single-source contract)', () => {
    render(<CreatePageFaq />)
    const terms = document.querySelectorAll('dt')
    expect(terms).toHaveLength(FAQ_ITEMS.length)
  })

  it('renders all question texts', () => {
    render(<CreatePageFaq />)
    for (const { question } of FAQ_ITEMS) {
      expect(screen.getByText(question)).toBeInTheDocument()
    }
  })

  it('renders the section heading', () => {
    render(<CreatePageFaq />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByText('Common Questions')).toBeInTheDocument()
  })
})
