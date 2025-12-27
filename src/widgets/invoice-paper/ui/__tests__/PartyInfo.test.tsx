import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PartyInfo } from '../PartyInfo'

describe('PartyInfo', () => {
  const mockClient = {
    n: 'Client Name',
    a: '0x123...456',
    ads: '123 Street\nCity, Country',
  }

  it('renders client name and label', () => {
    render(<PartyInfo client={mockClient} />)
    expect(screen.getByText(/BILL TO/i)).toBeDefined()
    expect(screen.getByText('Client Name')).toBeDefined()
  })

  it('renders wallet address', () => {
    render(<PartyInfo client={mockClient} />)
    expect(screen.getByText('0x123...456')).toBeDefined()
  })

  it('renders physical address with line breaks', () => {
    render(<PartyInfo client={mockClient} />)
    expect(screen.getByText(/123 Street/)).toBeDefined()
    expect(screen.getByText(/City, Country/)).toBeDefined()
  })
})
