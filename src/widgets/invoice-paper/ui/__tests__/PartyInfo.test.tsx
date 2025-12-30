import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PartyInfo } from '../PartyInfo'
import { TEST_PARTIES } from '@/shared/lib/test-utils'

describe('PartyInfo', () => {
  const mockFrom = TEST_PARTIES.sender.full
  const mockClient = TEST_PARTIES.client.full

  it('renders both From and Bill To labels', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText(/From/i)).toBeDefined()
    expect(screen.getByText(/Bill To/i)).toBeDefined()
  })

  it('renders sender name', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText(mockFrom.name)).toBeDefined()
  })

  it('renders client name', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText(mockClient.name)).toBeDefined()
  })

  it('renders physical addresses', () => {
    render(<PartyInfo from={mockFrom} client={mockClient} />)
    expect(screen.getByText(/123 Tech Street/)).toBeDefined()
    expect(screen.getByText(/456 Business Ave/)).toBeDefined()
  })
})
