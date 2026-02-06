import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ActionSlot } from '../ui/ActionSlot'

describe('ActionSlot', () => {
  it('renders children when provided', () => {
    render(
      <ActionSlot>
        <button>Pay Now</button>
      </ActionSlot>
    )
    expect(screen.getByText('Pay Now')).toBeDefined()
  })

  it('renders default prompt when no children', () => {
    render(<ActionSlot />)
    expect(screen.getByText('Connect Wallet to Pay')).toBeDefined()
  })

  it('renders wallet icon in default prompt', () => {
    const { container } = render(<ActionSlot />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('does not render default prompt when children exist', () => {
    render(
      <ActionSlot>
        <button>Custom Button</button>
      </ActionSlot>
    )
    expect(screen.queryByText('Connect Wallet to Pay')).toBeNull()
  })

  it('wraps content in a styled container', () => {
    const { container } = render(<ActionSlot />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('mt-2')
  })
})
