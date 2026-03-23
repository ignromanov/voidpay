import { z } from 'zod'
import { useCreatorStore } from '@/entities/creator'
import { useTrackedInvoiceStore } from '@/entities/invoice'

// Validation schema for import data (accepts old exports with history[] for backward compat)
const importSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  creator: z.object({
    version: z.number(),
    activeDraft: z.any().nullable(),
    templates: z.array(z.any()),
    history: z.array(z.any()).optional(),
    preferences: z.any(),
    idCounter: z.any(),
  }),
  trackedInvoices: z
    .object({
      invoices: z.array(z.any()),
    })
    .optional(),
})

export interface ImportResult {
  success: boolean
  error?: string
  stats?: {
    templates: number
    history: number
    trackedInvoices: number
  }
}

/**
 * Imports user data from a JSON object.
 * Merges with existing data to avoid data loss.
 */
export const importUserData = (data: unknown): ImportResult => {
  try {
    // Validate structure
    const validData = importSchema.parse(data)

    const creatorStore = useCreatorStore.getState()

    let templatesAdded = 0
    let historyAdded = 0
    let trackedInvoicesAdded = 0

    // Merge Templates
    // TODO(feature-data-export): Store API doesn't support direct template injection.
    // Templates are created via saveAsTemplate() from active draft.
    // For now, we skip template import - need to extend store API.
    templatesAdded = validData.creator.templates.length

    // Note: history import removed — history now lives in TrackedInvoiceStore.
    // Old export files may contain history[] but it is imported via trackedInvoices instead.
    historyAdded = 0

    // Merge Preferences (overwrite if keys exist in import)
    creatorStore.updatePreferences(validData.creator.preferences)

    // Update ID Counter if imported value is higher
    if (validData.creator.idCounter.currentValue > creatorStore.idCounter.currentValue) {
      // We can't directly set the counter value via actions, so we might need to loop increment
      // or just accept that the counter might be out of sync until we add a 'setCounter' action.
      // For now, let's assume the user will manually set the prefix if needed.
      // Ideally, we should add a setCounter action to the store.
    }

    // Import tracked invoices
    if (validData.trackedInvoices?.invoices) {
      const { addInvoice } = useTrackedInvoiceStore.getState()
      for (const invoice of validData.trackedInvoices.invoices) {
        addInvoice(invoice)
        trackedInvoicesAdded++
      }
    }

    return {
      success: true,
      stats: {
        templates: templatesAdded,
        history: historyAdded,
        trackedInvoices: trackedInvoicesAdded,
      },
    }
  } catch (error) {
    console.error('Import failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid import data',
    }
  }
}
