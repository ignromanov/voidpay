import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect } from 'vitest'
import { StatusChip } from '../ui/StatusChip'
import type { PaymentPanelStatus } from '../types'

describe('StatusChip', () => {
  const statuses: PaymentPanelStatus[] = ['pending', 'confirming', 'paid', 'overdue']

  it.each(statuses)('renders correct label for "%s" status', (status) => {
    render(<StatusChip status={status} />)

    const expectedLabels: Record<PaymentPanelStatus, string> = {
      pending: 'Pending',
      confirming: 'Confirming',
      paid: 'Paid',
      overdue: 'Overdue',
    }

    expect(screen.getByText(expectedLabels[status])).toBeDefined()
  })

  it('renders icon for each status', () => {
    const { container } = render(<StatusChip status="pending" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('applies amber chip color for pending', () => {
    const { container } = render(<StatusChip status="pending" />)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-amber-500/10')
    expect(chip.className).toContain('text-amber-400')
  })

  it('applies emerald chip color for paid', () => {
    const { container } = render(<StatusChip status="paid" />)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-emerald-500/10')
    expect(chip.className).toContain('text-emerald-400')
  })

  it('applies red chip color for overdue', () => {
    const { container } = render(<StatusChip status="overdue" />)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-red-500/10')
    expect(chip.className).toContain('text-red-400')
  })

  it('applies blue chip color for confirming', () => {
    const { container } = render(<StatusChip status="confirming" />)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-blue-500/10')
    expect(chip.className).toContain('text-blue-400')
  })
})
