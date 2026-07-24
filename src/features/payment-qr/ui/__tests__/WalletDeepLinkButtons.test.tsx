import { describe, it, expect } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils'
import { WalletDeepLinkButtons } from '../WalletDeepLinkButtons'

const nativeProps = {
  recipientAddress: '0x1111111111111111111111111111111111111111',
  chainId: 1,
  amount: '1000000000000042',
  displayedExactTotal: '1000000000000042',
} as const

const tokenProps = {
  ...nativeProps,
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
} as const

describe('WalletDeepLinkButtons', () => {
  describe('native-asset invoice (no tokenAddress)', () => {
    it('renders a dominant MetaMask button', () => {
      render(<WalletDeepLinkButtons {...nativeProps} />)
      const mm = screen.getByRole('link', { name: /open in metamask/i })
      expect(mm).toHaveAttribute('href', expect.stringContaining('link.metamask.io'))
    })

    it('renders the generic "Use a different wallet" text link', () => {
      render(<WalletDeepLinkButtons {...nativeProps} />)
      const generic = screen.getByRole('link', { name: /use a different wallet/i })
      expect(generic).toHaveAttribute('href', expect.stringContaining('ethereum:'))
    })

    it('MetaMask button appears before the generic text link in DOM', () => {
      render(<WalletDeepLinkButtons {...nativeProps} />)
      const mm = screen.getByRole('link', { name: /open in metamask/i })
      const generic = screen.getByRole('link', { name: /use a different wallet/i })
      expect(
        mm.compareDocumentPosition(generic) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })
  })

  describe('token invoice (tokenAddress present)', () => {
    it('renders the MetaMask button', () => {
      render(<WalletDeepLinkButtons {...tokenProps} />)
      expect(screen.getByRole('link', { name: /open in metamask/i })).toBeInTheDocument()
    })

    it('does not render the generic link', () => {
      render(<WalletDeepLinkButtons {...tokenProps} />)
      expect(screen.queryByRole('link', { name: /use a different wallet/i })).not.toBeInTheDocument()
    })
  })

  it('shows the do-not-change-amount caveat', () => {
    render(<WalletDeepLinkButtons {...nativeProps} />)
    expect(screen.getByText(/do not change the amount/i)).toBeInTheDocument()
  })
})
