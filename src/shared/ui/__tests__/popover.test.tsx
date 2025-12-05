import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/shared/test-utils'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  popoverContentVariants,
} from '../popover'

describe('Popover Component', () => {
  it('should render trigger button', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )

    expect(screen.getByRole('button', { name: /open popover/i })).toBeInTheDocument()
  })

  it('should open popover when trigger is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )

    await user.click(screen.getByRole('button', { name: /open popover/i }))

    expect(screen.getByText('Popover content')).toBeInTheDocument()
  })

  it('should close popover when clicking outside', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      </div>
    )

    await user.click(screen.getByRole('button', { name: /open popover/i }))
    expect(screen.getByText('Popover content')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
  })

  it('should call onOpenChange when popover state changes', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )

    await user.click(screen.getByRole('button', { name: /open popover/i }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('should support controlled open state', () => {
    render(
      <Popover open={true}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Controlled popover</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Controlled popover')).toBeInTheDocument()
  })

  it('should render PopoverClose that closes popover', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <p>Content</p>
          <PopoverClose>Close</PopoverClose>
        </PopoverContent>
      </Popover>
    )

    await user.click(screen.getByRole('button', { name: /open/i }))
    expect(screen.getByText('Content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('should render PopoverAnchor for custom positioning', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverAnchor data-testid="anchor">
          <span>Anchor element</span>
        </PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content near anchor</PopoverContent>
      </Popover>
    )

    expect(screen.getByTestId('anchor')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /open/i }))
    expect(screen.getByText('Content near anchor')).toBeInTheDocument()
  })

  it('should apply custom className to content', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-class" data-testid="content">
          Content
        </PopoverContent>
      </Popover>
    )

    await user.click(screen.getByRole('button', { name: /open/i }))

    expect(screen.getByTestId('content')).toHaveClass('custom-class')
  })

  it('should support different alignments', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent align="start" data-testid="content">
          Content
        </PopoverContent>
      </Popover>
    )

    await user.click(screen.getByRole('button', { name: /open/i }))
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })
})

describe('popoverContentVariants', () => {
  it('should return default size class', () => {
    const classes = popoverContentVariants()
    expect(classes).toContain('w-72')
  })

  it('should return sm size class', () => {
    const classes = popoverContentVariants({ size: 'sm' })
    expect(classes).toContain('w-56')
  })

  it('should return lg size class', () => {
    const classes = popoverContentVariants({ size: 'lg' })
    expect(classes).toContain('w-96')
  })

  it('should return auto size class', () => {
    const classes = popoverContentVariants({ size: 'auto' })
    expect(classes).toContain('w-auto')
  })
})
