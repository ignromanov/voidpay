/**
 * Template Slice tests
 * Feature: 015-create-page-preview
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCreatorStore } from '../../useCreatorStore'

// Mock uuid with incrementing counter for unique IDs
let uuidCounter = 0
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${++uuidCounter}`,
}))

describe('templateSlice', () => {
  beforeEach(() => {
    // Reset uuid counter for each test
    uuidCounter = 0
    // Reset store state
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      history: [],
      preferences: {
        defaultNetworkId: 1,
        defaultCurrency: 'USDC',
      },
      networkTheme: 'ethereum',
      idCounter: { currentValue: 1, prefix: 'INV' },
    })
  })

  describe('initial state', () => {
    it('initializes with empty templates', () => {
      const state = useCreatorStore.getState()
      expect(state.templates).toEqual([])
    })
  })

  describe('saveAsTemplate', () => {
    it('saves current draft as template', () => {
      const { createNewDraft, updateDraft, saveAsTemplate } = useCreatorStore.getState()

      createNewDraft()
      updateDraft({
        invoiceId: 'TEMPLATE-SOURCE',
        networkId: 42161,
        currency: 'ETH',
        client: { name: 'Template Client' },
      })

      const templateId = saveAsTemplate('My Template')

      const state = useCreatorStore.getState()
      expect(templateId).toMatch(/^test-uuid-\d+$/)
      expect(state.templates).toHaveLength(1)
      expect(state.templates[0].name).toBe('My Template')
      expect(state.templates[0].invoiceData.networkId).toBe(42161)
    })

    it('auto-generates template name from client and date', () => {
      const { createNewDraft, updateDraft, saveAsTemplate } = useCreatorStore.getState()

      createNewDraft()
      updateDraft({
        client: { name: 'Acme Corp' },
      })

      saveAsTemplate() // No name provided

      const state = useCreatorStore.getState()
      expect(state.templates[0].name).toContain('Acme Corp')
      expect(state.templates[0].name).toMatch(/Acme Corp - \d{4}-\d{2}-\d{2}/)
    })

    it('includes line items in template', () => {
      const { createNewDraft, updateLineItem, saveAsTemplate } = useCreatorStore.getState()

      createNewDraft()
      const itemId = useCreatorStore.getState().lineItems[0].id
      updateLineItem(itemId, { description: 'Template Service', rate: '150', quantity: 2 })

      saveAsTemplate('With Items')

      const state = useCreatorStore.getState()
      expect(state.templates[0].invoiceData.items).toHaveLength(1)
      expect(state.templates[0].invoiceData.items?.[0].description).toBe('Template Service')
      expect(state.templates[0].invoiceData.items?.[0].rate).toBe('150')
    })

    it('throws error if no active draft', () => {
      const { saveAsTemplate } = useCreatorStore.getState()

      expect(() => saveAsTemplate('No Draft')).toThrow('No active draft to save as template')
    })

    it('sets createdAt timestamp', () => {
      const { createNewDraft, saveAsTemplate } = useCreatorStore.getState()

      createNewDraft()
      saveAsTemplate('Timestamped')

      const state = useCreatorStore.getState()
      expect(state.templates[0].createdAt).toBeDefined()
      // Should be a valid ISO date string
      expect(new Date(state.templates[0].createdAt).getTime()).not.toBeNaN()
    })
  })

  describe('loadTemplate', () => {
    it('loads template into active draft', () => {
      const { createNewDraft, updateDraft, saveAsTemplate, clearDraft, loadTemplate } =
        useCreatorStore.getState()

      // Create and save template
      createNewDraft()
      updateDraft({
        networkId: 10, // Optimism
        currency: 'OP',
        from: { name: 'Template Sender', walletAddress: '0xtemplate' as `0x${string}` },
        client: { name: 'Template Client' },
      })
      saveAsTemplate('Loadable Template')

      const templateId = useCreatorStore.getState().templates[0].templateId

      // Clear and load
      clearDraft()
      expect(useCreatorStore.getState().activeDraft).toBeNull()

      loadTemplate(templateId)

      const state = useCreatorStore.getState()
      expect(state.activeDraft).not.toBeNull()
      expect(state.activeDraft?.data.networkId).toBe(10)
      expect(state.activeDraft?.data.currency).toBe('OP')
    })

    it('resets dates to current for loaded template', () => {
      const { createNewDraft, updateDraft, saveAsTemplate, clearDraft, loadTemplate } =
        useCreatorStore.getState()
      const now = Math.floor(Date.now() / 1000)

      createNewDraft()
      updateDraft({ client: { name: 'Date Test' } })
      saveAsTemplate('Date Template')

      const templateId = useCreatorStore.getState().templates[0].templateId

      clearDraft()
      loadTemplate(templateId)

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.issuedAt).toBeGreaterThanOrEqual(now - 5)
      const expectedDue = now + 30 * 24 * 60 * 60
      expect(state.activeDraft?.data.dueAt).toBeGreaterThanOrEqual(expectedDue - 5)
    })

    it('restores line items from template', () => {
      const { createNewDraft, updateLineItem, addLineItem, saveAsTemplate, clearDraft, loadTemplate } =
        useCreatorStore.getState()

      createNewDraft()
      const firstItemId = useCreatorStore.getState().lineItems[0].id
      updateLineItem(firstItemId, { description: 'First', rate: '100' })
      addLineItem()
      const secondItemId = useCreatorStore.getState().lineItems[1].id
      updateLineItem(secondItemId, { description: 'Second', rate: '200' })

      saveAsTemplate('Multi-Item Template')
      const templateId = useCreatorStore.getState().templates[0].templateId

      clearDraft()
      loadTemplate(templateId)

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(2)
      expect(state.lineItems[0].description).toBe('First')
      expect(state.lineItems[1].description).toBe('Second')
    })

    it('throws error for non-existent template', () => {
      const { loadTemplate } = useCreatorStore.getState()

      expect(() => loadTemplate('non-existent')).toThrow('Template non-existent not found')
    })

    it('handles template with no items', () => {
      const { createNewDraft, saveAsTemplate, clearDraft, loadTemplate } = useCreatorStore.getState()

      createNewDraft()
      // Clear line items before saving
      useCreatorStore.setState({ lineItems: [] })
      saveAsTemplate('Empty Items Template')

      const templateId = useCreatorStore.getState().templates[0].templateId

      clearDraft()
      loadTemplate(templateId)

      const state = useCreatorStore.getState()
      expect(state.lineItems).toHaveLength(0)
    })

    it('converts string quantities to numbers', () => {
      // Manually create a template with string quantity (edge case from old data)
      useCreatorStore.setState({
        templates: [
          {
            templateId: 'string-qty-template',
            name: 'String Qty',
            createdAt: new Date().toISOString(),
            invoiceData: {
              version: 2,
              invoiceId: 'QTY-TEST',
              issuedAt: 1704067200,
              dueAt: 1706745600,
              networkId: 1,
              currency: 'USDC',
              decimals: 6,
              from: { name: 'Sender', walletAddress: '0x1234' as `0x${string}` },
              client: { name: 'Client' },
              items: [
                // @ts-expect-error - Testing edge case with string quantity
                { description: 'String Qty Item', quantity: '5', rate: '100' },
              ],
            },
          },
        ],
      })

      const { loadTemplate } = useCreatorStore.getState()
      loadTemplate('string-qty-template')

      const state = useCreatorStore.getState()
      expect(state.lineItems[0].quantity).toBe(5)
      expect(typeof state.lineItems[0].quantity).toBe('number')
    })
  })

  describe('deleteTemplate', () => {
    it('removes template by templateId', () => {
      const { createNewDraft, saveAsTemplate, deleteTemplate } = useCreatorStore.getState()

      createNewDraft()
      saveAsTemplate('To Delete')
      const templateId = useCreatorStore.getState().templates[0].templateId

      expect(useCreatorStore.getState().templates).toHaveLength(1)

      deleteTemplate(templateId)

      const state = useCreatorStore.getState()
      expect(state.templates).toHaveLength(0)
    })

    it('handles non-existent templateId gracefully', () => {
      const { createNewDraft, saveAsTemplate, deleteTemplate } = useCreatorStore.getState()

      createNewDraft()
      saveAsTemplate('Keep Me')

      deleteTemplate('non-existent')

      const state = useCreatorStore.getState()
      expect(state.templates).toHaveLength(1)
    })

    it('removes only specified template when multiple exist', () => {
      const { createNewDraft, saveAsTemplate, deleteTemplate, clearDraft } = useCreatorStore.getState()

      // Create first template
      createNewDraft()
      saveAsTemplate('Template 1')

      // Create second template (need new draft)
      clearDraft()
      createNewDraft()
      saveAsTemplate('Template 2')

      const templates = useCreatorStore.getState().templates
      expect(templates).toHaveLength(2)

      deleteTemplate(templates[0].templateId)

      const state = useCreatorStore.getState()
      expect(state.templates).toHaveLength(1)
      expect(state.templates[0].name).toBe('Template 2')
    })
  })

  describe('edge cases', () => {
    it('preserves all invoice data in template', () => {
      const { createNewDraft, updateDraft, saveAsTemplate } = useCreatorStore.getState()

      createNewDraft()
      updateDraft({
        invoiceId: 'FULL-DATA',
        networkId: 137,
        currency: 'MATIC',
        tokenAddress: '0xtoken' as `0x${string}`,
        from: {
          name: 'Complete Sender',
          walletAddress: '0xsender' as `0x${string}`,
          email: 'sender@test.com',
          physicalAddress: '123 Sender St',
        },
        client: {
          name: 'Complete Client',
          walletAddress: '0xclient' as `0x${string}`,
          email: 'client@test.com',
        },
        tax: '15',
        discount: '10',
        notes: 'Full template notes',
      })

      saveAsTemplate('Complete Template')

      const state = useCreatorStore.getState()
      const templateData = state.templates[0].invoiceData
      expect(templateData.tokenAddress).toBe('0xtoken')
      expect(templateData.from?.email).toBe('sender@test.com')
      expect(templateData.tax).toBe('15')
      expect(templateData.notes).toBe('Full template notes')
    })

    it('handles multiple template operations', () => {
      const { createNewDraft, saveAsTemplate, loadTemplate, deleteTemplate, clearDraft } =
        useCreatorStore.getState()

      // Create multiple templates
      for (let i = 0; i < 5; i++) {
        clearDraft()
        createNewDraft()
        saveAsTemplate(`Template ${i}`)
      }

      expect(useCreatorStore.getState().templates).toHaveLength(5)

      // Load one
      const templateId = useCreatorStore.getState().templates[2].templateId
      loadTemplate(templateId)

      // Delete two
      const templatesToDelete = useCreatorStore.getState().templates.slice(0, 2)
      templatesToDelete.forEach((t) => deleteTemplate(t.templateId))

      const state = useCreatorStore.getState()
      expect(state.templates).toHaveLength(3)
      expect(state.activeDraft).not.toBeNull()
    })
  })
})
