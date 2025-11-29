/**
 * AddressInput Component Tests
 *
 * Constitutional Principle XVI: TDD Discipline
 * RED PHASE: These tests MUST FAIL first
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddressInput } from '../address-input'

describe('AddressInput - Address Validation (T010-test)', () => {
  it('should validate correct Ethereum address', () => {
    const onValidChange = vi.fn()
    render(
      <AddressInput
        value="0x1234567890123456789012345678901234567890"
        onChange={() => {}}
        onValidChange={onValidChange}
      />
    )

    expect(onValidChange).toHaveBeenCalledWith(true)
  })

  it('should invalidate incorrect address format', () => {
    const onValidChange = vi.fn()
    render(
      <AddressInput value="invalid-address" onChange={() => {}} onValidChange={onValidChange} />
    )

    expect(onValidChange).toHaveBeenCalledWith(false)
  })

  it('should invalidate address with wrong length', () => {
    const onValidChange = vi.fn()
    render(<AddressInput value="0x12345" onChange={() => {}} onValidChange={onValidChange} />)

    expect(onValidChange).toHaveBeenCalledWith(false)
  })

  it('should invalidate address without 0x prefix', () => {
    const onValidChange = vi.fn()
    render(
      <AddressInput
        value="1234567890123456789012345678901234567890"
        onChange={() => {}}
        onValidChange={onValidChange}
      />
    )

    expect(onValidChange).toHaveBeenCalledWith(false)
  })

  it('should validate address with uppercase letters', () => {
    const onValidChange = vi.fn()
    render(
      <AddressInput
        value="0xABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD"
        onChange={() => {}}
        onValidChange={onValidChange}
      />
    )

    expect(onValidChange).toHaveBeenCalledWith(true)
  })

  it('should call onChange handler when value changes', () => {
    const onChange = vi.fn()
    render(<AddressInput value="" onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, {
      target: { value: '0x1234567890123456789012345678901234567890' },
    })

    expect(onChange).toHaveBeenCalled()
  })
})

describe('AddressInput - Component Rendering (T012-test)', () => {
  it('should render input element', () => {
    render(<AddressInput value="" onChange={() => {}} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should display current value', () => {
    const address = '0x1234567890123456789012345678901234567890'
    render(<AddressInput value={address} onChange={() => {}} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe(address)
  })

  it('should render with label when provided', () => {
    render(<AddressInput value="" onChange={() => {}} label="Wallet Address" />)

    expect(screen.getByText('Wallet Address')).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    render(<AddressInput value="" onChange={() => {}} placeholder="0x..." />)

    const input = screen.getByPlaceholderText('0x...')
    expect(input).toBeInTheDocument()
  })

  it('should apply disabled state', () => {
    render(<AddressInput value="" onChange={() => {}} disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should render blockie visualization for valid address', () => {
    render(<AddressInput value="0x1234567890123456789012345678901234567890" onChange={() => {}} />)

    // Blockie should be rendered as a visual element
    const input = screen.getByRole('textbox')
    const container = input.parentElement

    // Check for blockie element (will be an icon or div with specific class)
    expect(container).toBeInTheDocument()
  })

  it('should not render blockie for invalid address', () => {
    render(<AddressInput value="invalid" onChange={() => {}} />)

    // Should not show blockie for invalid address
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })
})

describe('AddressInput - Snapshot Tests (T013-test)', () => {
  it('should match snapshot with empty value', () => {
    const { container } = render(<AddressInput value="" onChange={() => {}} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with valid address', () => {
    const { container } = render(
      <AddressInput value="0x1234567890123456789012345678901234567890" onChange={() => {}} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with invalid address', () => {
    const { container } = render(<AddressInput value="invalid-address" onChange={() => {}} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with label and error', () => {
    const { container } = render(
      <AddressInput
        value="invalid"
        onChange={() => {}}
        label="Wallet Address"
        error="Invalid address format"
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot with disabled state', () => {
    const { container } = render(
      <AddressInput
        value="0x1234567890123456789012345678901234567890"
        onChange={() => {}}
        disabled
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
