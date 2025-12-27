import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaymentDetails } from '../PaymentDetails'

describe('PaymentDetails', () => {
  it('renders payment details header and network', () => {
    render(<PaymentDetails networkId={1} senderAddress="0x123" currency="ETH" />)
    expect(screen.getByText(/Payment Details/i)).toBeDefined()
    expect(screen.getByText(/Network/i)).toBeDefined()
  })

  it('renders sender address', () => {
    render(<PaymentDetails networkId={1} senderAddress="0x1234567890abcdef" currency="ETH" />)
    expect(screen.getByText((content) => content.includes('0x1234567890abcdef'))).toBeDefined()
  })

  it('renders transaction hash when provided', () => {
    render(
      <PaymentDetails
        networkId={1}
        senderAddress="0x123"
        currency="ETH"
        txHash="0xabcdef1234567890"
      />
    )
    expect(screen.getByTitle('View on Block Explorer')).toBeDefined()
    expect(screen.getByText(/0xabcdef1234567890/i)).toBeDefined()
  })
})
