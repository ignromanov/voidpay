/**
 * NewInvoiceDialog component tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { useCreatorStore } from '@/entities/creator'
import { NewInvoiceDialog } from '../NewInvoiceDialog'
import type { Invoice } from '@/entities/invoice'

const mockActiveDraft: { meta: { draftId: string }; invoiceData: Partial<Invoice> } = {
  meta: { draftId: 'draft-001' },
  invoiceData: { invoiceId: 'INV-001' },
}

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
}

describe('NewInvoiceDialog', () => {
  beforeEach(() => {
    useCreatorStore.setState({
      activeDraft: mockActiveDraft as Parameters<typeof useCreatorStore.setState>[0]['activeDraft'],
      templates: [],
      lineItems: [],
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('visibility', () => {
    it('renders nothing when isOpen is false', () => {
      render(<NewInvoiceDialog {...defaultProps} isOpen={false} />)
      expect(screen.queryByText(/create new invoice/i)).not.toBeInTheDocument()
    })

    it('renders the dialog when isOpen is true', () => {
      render(<NewInvoiceDialog {...defaultProps} />)
      expect(screen.getByText(/create new invoice/i)).toBeInTheDocument()
    })
  })

  describe('dialog content', () => {
    it('renders the active draft warning', () => {
      render(<NewInvoiceDialog {...defaultProps} />)
      expect(screen.getByText(/you have an active draft/i)).toBeInTheDocument()
    })

    it('renders the save as template checkbox unchecked by default', () => {
      render(<NewInvoiceDialog {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('renders the "Save current draft as template" label', () => {
      render(<NewInvoiceDialog {...defaultProps} />)
      expect(screen.getByText(/save current draft as template/i)).toBeInTheDocument()
    })

    it('renders Cancel button', () => {
      render(<NewInvoiceDialog {...defaultProps} />)
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('renders Discard Draft button', () => {
      render(<NewInvoiceDialog {...defaultProps} />)
      expect(screen.getByRole('button', { name: /discard draft/i })).toBeInTheDocument()
    })

    it('renders Continue button when checkbox is unchecked', () => {
      render(<NewInvoiceDialog {...defaultProps} />)
      expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
    })
  })

  describe('checkbox interaction', () => {
    it('changes button label to "Save & Continue" when checkbox is checked', async () => {
      const user = userEvent.setup()
      render(<NewInvoiceDialog {...defaultProps} />)

      await user.click(screen.getByRole('checkbox'))

      expect(screen.getByRole('button', { name: /save & continue/i })).toBeInTheDocument()
    })

    it('reverts button label when checkbox is unchecked again', async () => {
      const user = userEvent.setup()
      render(<NewInvoiceDialog {...defaultProps} />)

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('checkbox'))

      expect(screen.getByRole('button', { name: /^continue$/i })).toBeInTheDocument()
    })
  })

  describe('button actions', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(<NewInvoiceDialog {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls clearDraft and onConfirm when Discard Draft is clicked', async () => {
      const clearDraft = vi.fn()
      const onConfirm = vi.fn()
      useCreatorStore.setState({ clearDraft })

      const user = userEvent.setup()
      render(<NewInvoiceDialog {...defaultProps} onConfirm={onConfirm} />)

      await user.click(screen.getByRole('button', { name: /discard draft/i }))

      expect(clearDraft).toHaveBeenCalledOnce()
      expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('calls clearDraft and onConfirm when Continue is clicked (no template save)', async () => {
      const clearDraft = vi.fn()
      const saveAsTemplate = vi.fn()
      const onConfirm = vi.fn()
      useCreatorStore.setState({ clearDraft, saveAsTemplate })

      const user = userEvent.setup()
      render(<NewInvoiceDialog {...defaultProps} onConfirm={onConfirm} />)

      await user.click(screen.getByRole('button', { name: /^continue$/i }))

      expect(saveAsTemplate).not.toHaveBeenCalled()
      expect(clearDraft).toHaveBeenCalledOnce()
      expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('calls saveAsTemplate, clearDraft, and onConfirm when "Save & Continue" is clicked', async () => {
      const clearDraft = vi.fn()
      const saveAsTemplate = vi.fn()
      const onConfirm = vi.fn()
      useCreatorStore.setState({ clearDraft, saveAsTemplate })

      const user = userEvent.setup()
      render(<NewInvoiceDialog {...defaultProps} onConfirm={onConfirm} />)

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /save & continue/i }))

      expect(saveAsTemplate).toHaveBeenCalledOnce()
      expect(clearDraft).toHaveBeenCalledOnce()
      expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('does not call saveAsTemplate when activeDraft is null and checkbox is checked', async () => {
      const clearDraft = vi.fn()
      const saveAsTemplate = vi.fn()
      const onConfirm = vi.fn()
      useCreatorStore.setState({ activeDraft: null, clearDraft, saveAsTemplate })

      const user = userEvent.setup()
      render(<NewInvoiceDialog {...defaultProps} onConfirm={onConfirm} />)

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /save & continue/i }))

      expect(saveAsTemplate).not.toHaveBeenCalled()
      expect(clearDraft).toHaveBeenCalledOnce()
      expect(onConfirm).toHaveBeenCalledOnce()
    })
  })
})
