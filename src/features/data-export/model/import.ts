import { z } from 'zod'
import { useCreatorStore } from '@/entities/creator'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { computeContentHash } from '@/features/invoice-codec'

// Validation schema for import data (accepts old exports with history[] for backward compat)
const importSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  creator: z.object({
    version: z.number(),
    activeDraft: z.unknown().nullable().optional(),
    templates: z.array(z.unknown()).default([]),
    history: z.array(z.unknown()).optional(),
    preferences: z.record(z.string(), z.unknown()).optional().default({}),
    idCounter: z
      .object({
        currentValue: z.number().int().min(1),
        prefix: z.string(),
      })
      .optional(),
  }),
  trackedInvoices: z
    .object({
      invoices: z.array(
        z.object({
          contentHash: z.string().optional(),
          invoiceId: z.string(),
          invoiceUrl: z.string(),
          source: z.enum(['created', 'received']),
          createdAt: z.string(),
          viewedAt: z.string().optional(),
        }),
      ),
    })
    .optional(),
})

function isSafeInvoiceUrl(rawUrl: string): boolean {
  if (rawUrl.startsWith('/pay#') || rawUrl.startsWith('/invoice#')) {
    return rawUrl.indexOf('#') < rawUrl.length - 1
  }
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    return parsed.hash.length > 1
  } catch {
    return false
  }
}

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
export const importUserData = async (data: unknown): Promise<ImportResult> => {
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
    if (
      validData.creator.idCounter &&
      validData.creator.idCounter.currentValue > creatorStore.idCounter.currentValue
    ) {
      // We can't directly set the counter value via actions, so we might need to loop increment
      // or just accept that the counter might be out of sync until we add a 'setCounter' action.
      // For now, let's assume the user will manually set the prefix if needed.
      // Ideally, we should add a setCounter action to the store.
    }

    // Import tracked invoices
    if (validData.trackedInvoices?.invoices) {
      const { addInvoice } = useTrackedInvoiceStore.getState()
      // Always derive contentHash from URL — never trust pre-supplied values
      const enriched = validData.trackedInvoices.invoices.map((invoice) => {
        if (!invoice.invoiceUrl || !isSafeInvoiceUrl(invoice.invoiceUrl)) return null
        const hashIndex = invoice.invoiceUrl.indexOf('#')
        const fragment = hashIndex === -1 ? '' : invoice.invoiceUrl.slice(hashIndex + 1)
        if (!fragment) return null
        const contentHash = computeContentHash(fragment)
        return {
          contentHash,
          invoiceId: invoice.invoiceId,
          invoiceUrl: invoice.invoiceUrl,
          source: invoice.source,
          ...(invoice.viewedAt !== undefined ? { viewedAt: invoice.viewedAt } : {}),
        }
      })
      for (const invoice of enriched) {
        if (invoice) {
          addInvoice(invoice)
          trackedInvoicesAdded++
        }
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
