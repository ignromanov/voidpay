import { describe, it, expect } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils'
import { WalletDeepLinkButtons } from '../WalletDeepLinkButtons'

const props = {
  recipientAddress: '0x1111111111111111111111111111111111111111',
  chainId: 1,
  amount: '1000000000000042',
  displayedExactTotal: '1000000000000042',
} as const

describe('WalletDeepLinkButtons', () => {
  it('renders a branded MetaMask button + a generic "Open in wallet" button', () => {
    render(<WalletDeepLinkButtons {...props} />)
    const mm = screen.getByRole('link', { name: /metamask/i })
    expect(mm).toHaveAttribute('href', expect.stringContaining('link.metamask.io'))
    const generic = screen.getByRole('link', { name: /open in wallet/i })
    expect(generic).toHaveAttribute('href', expect.stringContaining('ethereum:'))
  })

  it('shows the do-not-change-amount caveat', () => {
    render(<WalletDeepLinkButtons {...props} />)
    expect(screen.getByText(/do not change the amount/i)).toBeInTheDocument()
  })
})
