import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/shared/test-utils'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  dialogContentVariants,
} from '../dialog'

describe('Dialog Component', () => {
  it('should render trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument()
  })

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render DialogHeader with correct styles', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: /open/i }))

    const header = screen.getByTestId('dialog-header')
    expect(header).toHaveClass('flex', 'flex-col')
  })

  it('should render DialogFooter with correct styles', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter data-testid="dialog-footer">
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: /open/i }))

    const footer = screen.getByTestId('dialog-footer')
    expect(footer).toHaveClass('flex')
  })

  it('should call onOpenChange when dialog state changes', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))
    expect(onOpenChange).toHaveBeenCalledWith(true)

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should support controlled open state', () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('dialogContentVariants', () => {
  it('should return default size class', () => {
    const classes = dialogContentVariants()
    expect(classes).toContain('max-w-lg')
  })

  it('should return sm size class', () => {
    const classes = dialogContentVariants({ size: 'sm' })
    expect(classes).toContain('max-w-md')
  })

  it('should return lg size class', () => {
    const classes = dialogContentVariants({ size: 'lg' })
    expect(classes).toContain('max-w-2xl')
  })

  it('should return xl size class', () => {
    const classes = dialogContentVariants({ size: 'xl' })
    expect(classes).toContain('max-w-4xl')
  })

  it('should return full size class', () => {
    const classes = dialogContentVariants({ size: 'full' })
    expect(classes).toContain('max-w-[95vw]')
  })
})

describe('DialogClose', () => {
  it('should close dialog when clicked', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose>Custom Close</DialogClose>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: /open/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /custom close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
