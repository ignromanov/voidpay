import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MagicDustBadge } from '../MagicDustBadge'

describe('MagicDustBadge', () => {
  describe('Backward compatibility (no decimals prop)', () => {
    it('renders label, amount and currency without decimals prop', () => {
      render(
        <MagicDustBadge
          label="Exact amount"
          amount="315.000042"
          currency="USDC"
        />
      )

      expect(screen.getByText('Exact amount:')).toBeInTheDocument()
      expect(screen.getByText('315.000042 USDC')).toBeInTheDocument()
    })

    it('renders with light variant without decimals prop', () => {
      render(
        <MagicDustBadge
          label="Sent"
          amount="100.00"
          currency="USDT"
          variant="light"
        />
      )

      expect(screen.getByText('Sent:')).toBeInTheDocument()
      expect(screen.getByText('100.00 USDT')).toBeInTheDocument()
    })
  })

  describe('Fraction mode (decimals <= 8)', () => {
    it('shows full fractional notation for 6-decimal token (USDC)', () => {
      render(
        <MagicDustBadge
          label="Exact amount"
          amount="315.000042"
          currency="USDC"
          decimals={6}
        />
      )

      expect(screen.getByText('Exact amount:')).toBeInTheDocument()
      expect(screen.getByText('315.000042 USDC')).toBeInTheDocument()
      // No info icon tooltip in fraction mode
      expect(screen.queryByRole('img', { name: /info/i })).not.toBeInTheDocument()
    })

    it('shows full fractional notation at threshold boundary: 8 decimals', () => {
      render(
        <MagicDustBadge
          label="Exact amount"
          amount="0.00000042"
          currency="WBTC"
          decimals={8}
        />
      )

      expect(screen.getByText('0.00000042 WBTC')).toBeInTheDocument()
      // At exactly 8 decimals: fraction mode, no info icon
      expect(screen.queryByTitle(/full precision/i)).not.toBeInTheDocument()
    })
  })

  describe('Atomic mode (decimals > 8)', () => {
    it('shows atomic dust value for 18-decimal token (ETH)', () => {
      render(
        <MagicDustBadge
          label="Exact amount"
          amount="0.000000000000000042"
          currency="ETH"
          decimals={18}
          dustAtomicValue="42"
        />
      )

      // Should show atomic value +42
      expect(screen.getByText('+42 ETH')).toBeInTheDocument()
      // Should NOT show the full fraction directly as the main amount
      expect(screen.queryByText('0.000000000000000042 ETH')).not.toBeInTheDocument()
    })

    it('shows info icon in atomic mode', () => {
      render(
        <MagicDustBadge
          label="Exact amount"
          amount="0.000000000000000042"
          currency="ETH"
          decimals={18}
          dustAtomicValue="42"
        />
      )

      const infoIcon = screen.getByTestId('magic-dust-info-icon')
      expect(infoIcon).toBeInTheDocument()
    })

    it('tooltip reveals full precision string for 18-decimal token', () => {
      render(
        <MagicDustBadge
          label="Exact amount"
          amount="0.000000000000000042"
          currency="ETH"
          decimals={18}
          dustAtomicValue="42"
        />
      )

      const infoIcon = screen.getByTestId('magic-dust-info-icon')
      // title attribute used for native tooltip
      expect(infoIcon).toHaveAttribute('title', '+0.000000000000000042 ETH')
    })

    it('shows atomic mode at threshold boundary: 9 decimals', () => {
      render(
        <MagicDustBadge
          label="Exact amount"
          amount="0.000000042"
          currency="TOKEN9"
          decimals={9}
          dustAtomicValue="42"
        />
      )

      // At 9 decimals: atomic mode
      expect(screen.getByText('+42 TOKEN9')).toBeInTheDocument()
      expect(screen.getByTestId('magic-dust-info-icon')).toBeInTheDocument()
    })
  })
})
