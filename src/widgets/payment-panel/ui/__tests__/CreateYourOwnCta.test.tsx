import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: vi.fn(({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  )),
}))

import { CreateYourOwnCta } from '../CreateYourOwnCta'

describe('CreateYourOwnCta', () => {
  it('renders create link', () => {
    render(<CreateYourOwnCta />)

    expect(screen.getByText(/create your own invoice/i)).toBeInTheDocument()
  })

  it('links to /create', () => {
    render(<CreateYourOwnCta />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/create')
  })
})
