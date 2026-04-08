/**
 * Template Slice
 *
 * Manages saved invoice templates for reuse.
 * Handles template CRUD operations and loading templates into drafts.
 */

import { v4 as uuidv4 } from 'uuid'
import type { StateCreator } from 'zustand'
import type { PartialInvoice } from '@/entities/invoice'
import { nowUnix, daysFromNowUnix } from '@/shared/lib/date-time'
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

    // Include line items; strip computed fields
    // (total is baked at generation, magicDust is per-invoice)
    const templateData: PartialInvoice = {
      ...activeDraft.data,
      total: undefined,
      magicDust: undefined,
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

    state.replaceDraft({
      ...template.invoiceData,
      magicDust: undefined,
      issuedAt: nowUnix(),
      dueAt: daysFromNowUnix(30),
    })
  },

  deleteTemplate: (templateId) => {
    set((state) => ({
      templates: state.templates.filter((t) => t.templateId !== templateId),
    }))
  },
})
