/**
 * TokenSelect Component Tests
 *
 * Constitutional Principle XVI: TDD Discipline
 * Tests for token selection and network filtering
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TokenSelect } from '../TokenSelect'
import { NETWORK_TOKENS } from '../../model/tokens'

describe('TokenSelect - Token Filtering by Chain', () => {
  it('should display tokens for Ethereum (chainId: 1)', () => {
    const onChange = vi.fn()
    const ethTokens = NETWORK_TOKENS[1]!

    render(<TokenSelect chainId={1} value={ethTokens[0]!} onChange={onChange} />)

    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('should display tokens for Arbitrum (chainId: 42161)', () => {
    const onChange = vi.fn()
    const arbTokens = NETWORK_TOKENS[42161]!

    render(<TokenSelect chainId={42161} value={arbTokens[0]!} onChange={onChange} />)

    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('should update token list when chainId changes', () => {
    const onChange = vi.fn()
    const ethTokens = NETWORK_TOKENS[1]!

    const { rerender } = render(
      <TokenSelect chainId={1} value={ethTokens[0]!} onChange={onChange} />
    )

    expect(screen.getByText('ETH')).toBeInTheDocument()

    const polygonTokens = NETWORK_TOKENS[137]!
    rerender(<TokenSelect chainId={137} value={polygonTokens[0]!} onChange={onChange} />)

    expect(screen.getByText('POL')).toBeInTheDocument()
  })

  it('should handle network with no tokens', () => {
    const onChange = vi.fn()

    render(
      <TokenSelect
        chainId={999999} // Invalid chainId
        value={null}
        onChange={onChange}
      />
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })
})

describe('TokenSelect - Selection Logic', () => {
  it('should call onChange when token is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<TokenSelect chainId={1} value={null} onChange={onChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const usdcOption = screen.getByText('USDC')
    await user.click(usdcOption)

    expect(onChange).toHaveBeenCalled()
    const calledToken = onChange.mock.calls[0]![0]!
    expect(calledToken.symbol).toBe('USDC')
  })

  it('should display selected token in trigger', () => {
    const onChange = vi.fn()
    const ethTokens = NETWORK_TOKENS[1]!
    const usdc = ethTokens.find((t) => t.symbol === 'USDC')!

    render(<TokenSelect chainId={1} value={usdc} onChange={onChange} />)

    expect(screen.getByText('USDC')).toBeInTheDocument()
  })

  it('should render token icon with correct color', () => {
    const onChange = vi.fn()
    const ethTokens = NETWORK_TOKENS[1]!
    const usdc = ethTokens.find((t) => t.symbol === 'USDC')!

    const { container } = render(<TokenSelect chainId={1} value={usdc} onChange={onChange} />)

    const icon = container.querySelector('.bg-blue-500')
    expect(icon).toBeInTheDocument()
  })
})

describe('TokenSelect - Custom Token Support', () => {
  it('should show custom token option when allowCustom=true', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<TokenSelect chainId={1} value={null} onChange={onChange} allowCustom={true} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(screen.getByText('Custom Token')).toBeInTheDocument()
  })

  it('should hide custom token option when allowCustom=false', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<TokenSelect chainId={1} value={null} onChange={onChange} allowCustom={false} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(screen.queryByText('Custom Token')).not.toBeInTheDocument()
  })
})

describe('TokenSelect - Snapshots', () => {
  it('should match snapshot with default state', () => {
    const { container } = render(<TokenSelect chainId={1} value={null} onChange={() => {}} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with selected token', () => {
    const ethTokens = NETWORK_TOKENS[1]!
    const { container } = render(
      <TokenSelect chainId={1} value={ethTokens[1]!} onChange={() => {}} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot without custom token option', () => {
    const { container } = render(
      <TokenSelect chainId={42161} value={null} onChange={() => {}} allowCustom={false} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
