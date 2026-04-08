import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NetworkBadge } from '../ui/NetworkBadge'

describe('NetworkBadge', () => {
  it('renders network name for known chain ID', () => {
    render(<NetworkBadge networkId={1} />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('renders "Unknown" for unrecognized chain ID', () => {
    render(<NetworkBadge networkId={99999} />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('renders Arbitrum for chain ID 42161', () => {
    render(<NetworkBadge networkId={42161} />)
    expect(screen.getByText('Arbitrum')).toBeInTheDocument()
  })

  it('renders Optimism for chain ID 10', () => {
    render(<NetworkBadge networkId={10} />)
    expect(screen.getByText('Optimism')).toBeInTheDocument()
  })
})
