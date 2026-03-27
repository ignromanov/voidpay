/**
 * TemplateList component tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { useCreatorStore } from '@/entities/creator'
import { TemplateList } from '../TemplateList'
import type { InvoiceTemplate } from '@/entities/invoice'

const makeTemplate = (overrides?: Partial<InvoiceTemplate>): InvoiceTemplate => ({
  templateId: 'tpl-001',
  name: 'Test Template',
  createdAt: '2024-01-15T10:00:00.000Z',
  invoiceData: {
    currency: 'USDC',
    client: { name: 'Acme Corp' },
    items: [{ description: 'Service', quantity: 1, rate: '100' }],
  },
  ...overrides,
})

describe('TemplateList', () => {
  beforeEach(() => {
    useCreatorStore.setState({
      templates: [],
      activeDraft: null,
      lineItems: [],
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('empty state', () => {
    it('renders empty state message when no templates exist', () => {
      render(<TemplateList />)
      expect(screen.getByText(/no saved templates yet/i)).toBeInTheDocument()
    })

    it('renders instruction to save a draft', () => {
      render(<TemplateList />)
      expect(screen.getByText(/save a draft as a template/i)).toBeInTheDocument()
    })
  })

  describe('with templates', () => {
    beforeEach(() => {
      useCreatorStore.setState({
        templates: [makeTemplate()],
      })
    })

    it('renders template name', () => {
      render(<TemplateList />)
      expect(screen.getByText('Test Template')).toBeInTheDocument()
    })

    it('renders formatted creation date', () => {
      render(<TemplateList />)
      expect(screen.getByText(/jan 15, 2024/i)).toBeInTheDocument()
    })

    it('renders client name', () => {
      render(<TemplateList />)
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })

    it('renders currency', () => {
      render(<TemplateList />)
      expect(screen.getByText('USDC')).toBeInTheDocument()
    })

    it('renders item count', () => {
      render(<TemplateList />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders Load button', () => {
      render(<TemplateList />)
      expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument()
    })

    it('renders Delete button', () => {
      render(<TemplateList />)
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('shows N/A for missing client name', () => {
      useCreatorStore.setState({
        templates: [makeTemplate({ invoiceData: { client: undefined } })],
      })
      render(<TemplateList />)
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })
  })

  describe('template loading', () => {
    it('calls loadTemplate and onTemplateLoad when Load is clicked', async () => {
      const loadTemplate = vi.fn()
      useCreatorStore.setState({
        templates: [makeTemplate()],
        loadTemplate,
      })

      const onTemplateLoad = vi.fn()
      const user = userEvent.setup()
      render(<TemplateList onTemplateLoad={onTemplateLoad} />)

      await user.click(screen.getByRole('button', { name: /load/i }))

      expect(loadTemplate).toHaveBeenCalledWith('tpl-001')
      expect(onTemplateLoad).toHaveBeenCalledWith('tpl-001')
    })

    it('does not call onTemplateLoad when prop is not provided', async () => {
      const loadTemplate = vi.fn()
      useCreatorStore.setState({
        templates: [makeTemplate()],
        loadTemplate,
      })

      const user = userEvent.setup()
      render(<TemplateList />)

      await user.click(screen.getByRole('button', { name: /load/i }))

      expect(loadTemplate).toHaveBeenCalledWith('tpl-001')
    })
  })

  describe('template deletion', () => {
    it('shows confirmation UI when Delete is clicked', async () => {
      useCreatorStore.setState({ templates: [makeTemplate()] })
      const user = userEvent.setup()
      render(<TemplateList />)

      await user.click(screen.getByRole('button', { name: /delete/i }))

      expect(screen.getByText(/delete this template/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('calls deleteTemplate when Confirm is clicked', async () => {
      const deleteTemplate = vi.fn()
      useCreatorStore.setState({
        templates: [makeTemplate()],
        deleteTemplate,
      })
      const user = userEvent.setup()
      render(<TemplateList />)

      await user.click(screen.getByRole('button', { name: /delete/i }))
      await user.click(screen.getByRole('button', { name: /confirm/i }))

      expect(deleteTemplate).toHaveBeenCalledWith('tpl-001')
    })

    it('hides confirmation UI when Cancel is clicked', async () => {
      useCreatorStore.setState({ templates: [makeTemplate()] })
      const user = userEvent.setup()
      render(<TemplateList />)

      await user.click(screen.getByRole('button', { name: /delete/i }))
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.queryByText(/delete this template/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })

  describe('multiple templates', () => {
    it('renders all templates', () => {
      useCreatorStore.setState({
        templates: [
          makeTemplate({ templateId: 'tpl-001', name: 'Template One' }),
          makeTemplate({ templateId: 'tpl-002', name: 'Template Two' }),
        ],
      })
      render(<TemplateList />)

      expect(screen.getByText('Template One')).toBeInTheDocument()
      expect(screen.getByText('Template Two')).toBeInTheDocument()
    })

    it('only shows confirm UI for the clicked template', async () => {
      useCreatorStore.setState({
        templates: [
          makeTemplate({ templateId: 'tpl-001', name: 'Template One' }),
          makeTemplate({ templateId: 'tpl-002', name: 'Template Two' }),
        ],
      })
      const user = userEvent.setup()
      render(<TemplateList />)

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])

      // Only one confirm prompt visible
      expect(screen.getAllByText(/delete this template/i)).toHaveLength(1)
    })
  })
})
