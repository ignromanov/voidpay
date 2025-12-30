import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PartyInfo } from '../PartyInfo'

describe('PartyInfo', () => {
  const mockFrom = {
    name: 'Sender Company',
    walletAddress: '0xsender',
    email: 'sender@example.com',
    physicalAddress: '123 Sender St',
  }

  const mockClient = {
    name: 'Client Name',
    walletAddress: '0x123...456',
    email: 'client@example.com',
    physicalAddress: '123 Street\nCity, Country',
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
