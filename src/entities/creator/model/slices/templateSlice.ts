/**
 * Template Slice
 *
 * Manages saved invoice templates for reuse.
 * Handles template CRUD operations and loading templates into drafts.
 */

import { v4 as uuidv4 } from 'uuid'
import type { StateCreator } from 'zustand'
import type { PartialInvoice, LineItem, DraftState } from '@/entities/invoice'
import type { InvoiceTemplate } from '../types'
import type { CreatorStore } from './types'

/**
 * Template Slice State
 */
export interface TemplateSlice {
  /** Saved templates for reuse */
  templates: InvoiceTemplate[]

  // ========== Template Management ==========

  /**
   * Save the active draft as a template
   */
  saveAsTemplate: (name?: string) => string

  /**
   * Load a template into the active draft
   */
  loadTemplate: (templateId: string) => void

  /**
   * Delete a template
   */
  deleteTemplate: (templateId: string) => void
}

/**
 * Get current Unix timestamp in seconds
 */
function nowUnix(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Get Unix timestamp for a date N days from now
 */
function daysFromNowUnix(days: number): number {
  return nowUnix() + days * 24 * 60 * 60
}

/**
 * Create Template Slice
 */
export const createTemplateSlice: StateCreator<CreatorStore, [], [], TemplateSlice> = (
  set,
  get
) => ({
  // ========== State ==========
  templates: [],

  // ========== Template Management ==========

  saveAsTemplate: (name) => {
    const state = get()
    const { activeDraft, lineItems } = state

    if (!activeDraft) {
      throw new Error('No active draft to save as template')
    }

    const templateId = uuidv4()

    // Get client name for auto-generated template name
    const clientName = activeDraft.data.client?.name ?? 'Untitled'
    const dateStr = activeDraft.data.issuedAt
      ? new Date(activeDraft.data.issuedAt * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    const templateName = name ?? `${clientName} - ${dateStr}`

    // Include line items in template data
    const templateData: PartialInvoice = {
      ...activeDraft.data,
      items: lineItems.map(({ description, quantity, rate }) => ({
        description,
        quantity,
        rate,
      })),
    }

    const template: InvoiceTemplate = {
      templateId,
      name: templateName,
      createdAt: new Date().toISOString(),
      invoiceData: templateData,
    }

    set((state) => ({
      templates: [...state.templates, template],
    }))

    return templateId
  },

  loadTemplate: (templateId) => {
    const state = get()
    const template = state.templates.find((t) => t.templateId === templateId)

    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const draftId = uuidv4()

    // Convert template items to LineItems with ids (handle partial items)
    const lineItems: LineItem[] = (template.invoiceData.items ?? []).map((item) => {
      const rawQty = item.quantity ?? 0
      return {
        id: uuidv4(),
        description: item.description ?? '',
        quantity: typeof rawQty === 'string' ? parseFloat(rawQty) : rawQty,
        rate: item.rate ?? '0',
      }
    })

    const newDraft: DraftState = {
      meta: {
        draftId,
        lastModified: new Date().toISOString(),
      },
      data: {
        ...template.invoiceData,
        // Update dates to current
        issuedAt: nowUnix(),
        dueAt: daysFromNowUnix(30),
      },
    }

    set({
      activeDraft: newDraft,
      lineItems,
    })
  },

  deleteTemplate: (templateId) => {
    set((state) => ({
      templates: state.templates.filter((t) => t.templateId !== templateId),
    }))
  },
})
