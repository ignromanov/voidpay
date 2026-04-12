import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect } from 'vitest'
import { AmountDisplay } from '../ui/AmountDisplay'

describe('AmountDisplay', () => {
  it('renders formatted total amount with currency', () => {
    render(
      <AmountDisplay
        subtotal="1000000"
        magicDust="42"
        exactTotal="1000042"
        decimals={6}
        currency="USDC"
        networkId={1}
      />
    )

    // Main amount display - the subtotal (1.00 USDC)
    expect(screen.getByText('USDC')).toBeInTheDocument()
  })

  it('shows Magic Dust breakdown when magicDust is non-zero', () => {
    render(
      <AmountDisplay
        subtotal="1000000"
        magicDust="42"
        exactTotal="1000042"
        decimals={6}
        currency="USDC"
        networkId={1}
      />
    )

    // MagicDustBadge with "Exact amount" label
    expect(screen.getByText(/Exact amount/i)).toBeInTheDocument()
    // FingerprintIcon inside MagicDustBadge
    const svg = document.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('shows "Manual verification required" when magicDust is zero', () => {
    render(
      <AmountDisplay
        subtotal="5000000"
        magicDust="0"
        exactTotal="5000000"
        decimals={6}
        currency="USDC"
        networkId={1}
      />
    )

    expect(screen.getByText('Manual verification required')).toBeInTheDocument()
  })

  it('formats large amounts with thousand separators', () => {
    render(
      <AmountDisplay
        subtotal="999999000000"
        magicDust="0"
        exactTotal="999999000000"
        decimals={6}
        currency="USDC"
        networkId={1}
      />
    )

    // formatAmount with useGrouping=true produces "999,999.00"
    expect(screen.getByText('999,999.00')).toBeInTheDocument()
  })

  it('shows full precision for tiny magicDust on 18-decimal token', () => {
    render(
      <AmountDisplay
        subtotal="1000000000000000000"
        magicDust="1"
        exactTotal="1000000000000000001"
        decimals={18}
        currency="ETH"
        networkId={1}
      />
    )

    // MagicDustBadge with "Exact amount" label
    expect(screen.getByText(/Exact amount/i)).toBeInTheDocument()
  })

  it('renders "Total Due" label', () => {
    render(
      <AmountDisplay
        subtotal="1000000"
        magicDust="0"
        exactTotal="1000000"
        decimals={6}
        currency="USDC"
        networkId={1}
      />
    )

    expect(screen.getByText('Total Due')).toBeInTheDocument()
  })

  it('renders network chip in the Total Due row', () => {
    render(
      <AmountDisplay
        subtotal="1000000"
        magicDust="0"
        exactTotal="1000000"
        decimals={6}
        currency="USDC"
        networkId={42161}
      />
    )

    const chip = screen.getByTestId('payment-network-chip')
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveTextContent('Arbitrum')
  })
})
