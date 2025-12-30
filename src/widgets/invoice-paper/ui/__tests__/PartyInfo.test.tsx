import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PartyInfo } from '../PartyInfo'

describe('PartyInfo', () => {
  const mockFrom = {
    n: 'Sender Company',
    a: '0xsender',
    e: 'sender@example.com',
    ads: '123 Sender St',
  }

  const mockClient = {
    n: 'Client Name',
    a: '0x123...456',
    e: 'client@example.com',
    ads: '123 Street\nCity, Country',
  }

  it('renders both From and Bill To labels', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText(/From/i)).toBeDefined()
    expect(screen.getByText(/Bill To/i)).toBeDefined()
  })

  it('renders sender name', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText('Sender Company')).toBeDefined()
  })

  it('renders client name', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText('Client Name')).toBeDefined()
  })

  it('renders physical addresses', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText(/123 Sender St/)).toBeDefined()
    expect(screen.getByText(/123 Street/)).toBeDefined()
  })
})
