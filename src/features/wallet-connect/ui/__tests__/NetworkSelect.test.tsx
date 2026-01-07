/**
 * NetworkSelect Component Tests
 *
 * Constitutional Principle XVI: TDD Discipline
 * Tests for network selection and Wagmi integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { NetworkSelect } from '../NetworkSelect'

// Mock Wagmi hooks
vi.mock('wagmi', () => ({
  useSwitchChain: vi.fn(() => ({
    switchChain: vi.fn(),
  })),
}))

describe('NetworkSelect - Rendering', () => {
  it('should render with selected network', () => {
    render(<NetworkSelect value={1} onChange={() => {}} />)

    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('should display network icon and name', () => {
    render(<NetworkSelect value={42161} onChange={() => {}} />)

    expect(screen.getByText('Arbitrum')).toBeInTheDocument()
  })

  it('should apply disabled state', () => {
    render(<NetworkSelect value={1} onChange={() => {}} disabled />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <NetworkSelect value={1} onChange={() => {}} className="custom-class" />
    )

    const trigger = container.querySelector('.custom-class')
    expect(trigger).toBeInTheDocument()
  })
})

describe('NetworkSelect - Selection Logic', () => {
  it('should call onChange when network is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<NetworkSelect value={1} onChange={onChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    // Select Arbitrum (chainId: 42161)
    const arbitrumOption = screen.getByText('Arbitrum')
    await user.click(arbitrumOption)

    expect(onChange).toHaveBeenCalledWith(42161)
  })

  it('should update displayed network when value changes', () => {
    const { rerender } = render(<NetworkSelect value={1} onChange={() => {}} />)

    expect(screen.getByText('Ethereum')).toBeInTheDocument()

    rerender(<NetworkSelect value={10} onChange={() => {}} />)

    expect(screen.getByText('Optimism')).toBeInTheDocument()
  })
})

describe('NetworkSelect - onChange behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call onChange with chainId when network is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<NetworkSelect value={1} onChange={onChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const polygonOption = screen.getByText('Polygon')
    await user.click(polygonOption)

    // NetworkSelect is a pure UI component - it calls onChange, not switchChain
    // Wallet network switching is handled separately in payment flow
    expect(onChange).toHaveBeenCalledWith(137)
  })

  it('should call onChange with correct chainId for Optimism', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<NetworkSelect value={1} onChange={onChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const optimismOption = screen.getByText('Optimism')
    await user.click(optimismOption)

    expect(onChange).toHaveBeenCalledWith(10)
  })
})

describe('NetworkSelect - Snapshots', () => {
  it('should match snapshot with default state', () => {
    const { container } = render(<NetworkSelect value={1} onChange={() => {}} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with disabled state', () => {
    const { container } = render(<NetworkSelect value={42161} onChange={() => {}} disabled />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with different network', () => {
    const { container } = render(<NetworkSelect value={137} onChange={() => {}} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
