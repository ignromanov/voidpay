import { render, screen } from '@/shared/lib/test-utils'

import CompareRequestFinancePage from '../page'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/script', () => ({
  default: () => null,
}))

describe('CompareRequestFinancePage', () => {
  it('renders page heading', () => {
    render(<CompareRequestFinancePage />)
    expect(screen.getByRole('heading', { name: 'VoidPay vs Request Finance' })).toBeInTheDocument()
  })

  it('renders quick comparison table', () => {
    render(<CompareRequestFinancePage />)
    expect(screen.getByText('Quick Comparison')).toBeInTheDocument()
    expect(screen.getByText('Free forever')).toBeInTheDocument()
    expect(screen.getByText('From $250/mo (annual)')).toBeInTheDocument()
  })

  it('renders pricing section', () => {
    render(<CompareRequestFinancePage />)
    expect(screen.getByRole('heading', { name: 'Pricing' })).toBeInTheDocument()
  })

  it('renders privacy section', () => {
    render(<CompareRequestFinancePage />)
    expect(screen.getByRole('heading', { name: 'Privacy & Data' })).toBeInTheDocument()
  })

  it('renders who should choose section', () => {
    render(<CompareRequestFinancePage />)
    expect(screen.getByText(/Choose VoidPay if you…/)).toBeInTheDocument()
    expect(screen.getByText(/Choose Request Finance if you…/)).toBeInTheDocument()
  })

  it('renders CTA with link to /create', () => {
    render(<CompareRequestFinancePage />)
    const ctaLink = screen.getByRole('link', { name: /Create Invoice/i })
    expect(ctaLink).toHaveAttribute('href', '/create')
  })

  it('renders reviews section with Capterra rating', () => {
    render(<CompareRequestFinancePage />)
    expect(screen.getByText(/4\.7\/5 on Capterra/)).toBeInTheDocument()
  })

  it('renders disclaimer', () => {
    render(<CompareRequestFinancePage />)
    expect(screen.getByText(/based on publicly available documentation/)).toBeInTheDocument()
  })

  it('renders back to home link', () => {
    render(<CompareRequestFinancePage />)
    const backLinks = screen.getAllByRole('link', { name: /Back to Home/i })
    expect(backLinks.length).toBeGreaterThan(0)
  })
})
