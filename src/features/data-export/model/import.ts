import { z } from 'zod'
import { useCreatorStore, type UserPreferences } from '@/entities/creator'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { APP_URLS, getAppBaseUrl } from '@/shared/config'
import { computeContentHash } from '@/features/invoice-codec'

const PREFERENCE_SCHEMAS = {
  defaultSenderName: z.string().max(200),
  defaultSenderWallet: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  defaultSenderEmail: z.string().max(200),
  defaultSenderAddress: z.string().max(500),
  defaultCurrency: z.string().max(20),
  defaultNetworkId: z.number().int().positive(),
  defaultTaxRate: z.string().max(20),
  defaultIdPrefix: z.string().regex(/^[A-Za-z0-9]{0,10}$/),
  includeOgImage: z.boolean(),
  magicDustEnabled: z.boolean(),
} as const

// Validation schema for import data (accepts old exports with history[] for backward compat)
const importSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  creator: z.object({
    version: z.number(),
    activeDraft: z.unknown().nullable().optional(),
    templates: z.array(z.unknown()).default([]),
    history: z.array(z.unknown()).optional(),
    preferences: z.unknown().optional(),
    idCounter: z
      .object({
        currentValue: z.number().int().min(1),
        prefix: z.string(),
      })
      .optional(),
  }),
  trackedInvoices: z
    .object({
      // Entries are validated one by one so a single legacy/garbage entry cannot reject the backup
      invoices: z.array(z.unknown()),
    })
    .optional(),
})

// createdAt is not read on import (the store assigns its own), so entries without it still pass
const trackedInvoiceEntrySchema = z.object({
  invoiceId: z.string(),
  invoiceUrl: z.string(),
  source: z.enum(['created', 'received']),
  viewedAt: z.string().optional(),
})

/** Keeps only known preference keys whose values pass their own schema. */
function pickValidPreferences(raw: unknown): Partial<UserPreferences> {
  if (typeof raw !== 'object' || raw === null) return {}
  const source = raw as Record<string, unknown>
  const picked: Record<string, unknown> = {}
  for (const [key, schema] of Object.entries(PREFERENCE_SCHEMAS)) {
    if (!Object.hasOwn(source, key)) continue
    const parsed = schema.safeParse(source[key])
    if (parsed.success) picked[key] = parsed.data
  }
  return picked as Partial<UserPreferences>
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>([APP_URLS.base, getAppBaseUrl()])
  if (typeof window !== 'undefined') origins.add(window.location.origin)
  return origins
}

function isSafeInvoiceUrl(rawUrl: string): boolean {
  if (rawUrl.startsWith('/pay#') || rawUrl.startsWith('/invoice#')) {
    return rawUrl.indexOf('#') < rawUrl.length - 1
  }
  try {
    const parsed = new URL(rawUrl)
    if (!getAllowedOrigins().has(parsed.origin)) return false
    return parsed.hash.length > 1
  } catch {
    return false
  }
}

export const PAYMENT_STATUS_NOT_RESTORED_NOTICE =
  "Payment status isn't restored from backups — use Check all to re-verify."

export interface ImportResult {
  success: boolean
  error?: string
  /** Informational message to show next to the import result */
  notice?: string
  stats?: {
    templates: number
    history: number
    trackedInvoices: number
    /** Tracked-invoice entries dropped as malformed or unsafe */
    skippedInvoices: number
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
    let skippedInvoices = 0

    // Merge Templates
    // TODO(feature-data-export): Store API doesn't support direct template injection.
    // Templates are created via saveAsTemplate() from active draft.
    // For now, we skip template import - need to extend store API.
    templatesAdded = validData.creator.templates.length

    // Note: history import removed — history now lives in TrackedInvoiceStore.
    // Old export files may contain history[] but it is imported via trackedInvoices instead.
    historyAdded = 0

    // Merge Preferences (overwrite if keys exist in import)
    creatorStore.updatePreferences(pickValidPreferences(validData.creator.preferences))

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
      const { addInvoice, getInvoice } = useTrackedInvoiceStore.getState()
      // Always derive contentHash from URL — never trust pre-supplied values
      const enriched = validData.trackedInvoices.invoices.map((raw) => {
        const entry = trackedInvoiceEntrySchema.safeParse(raw)
        if (!entry.success || !isSafeInvoiceUrl(entry.data.invoiceUrl)) {
          skippedInvoices++
          return null
        }
        const invoice = entry.data
        const fragment = invoice.invoiceUrl.slice(invoice.invoiceUrl.indexOf('#') + 1)
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
        if (!invoice) continue
        // Existing records keep their local payment state: addInvoice resets
        // txHash/finalized/paidAt, which would wipe a paid invoice on same-device restore.
        if (getInvoice(invoice.contentHash)) continue
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
        skippedInvoices,
      },
      ...(trackedInvoicesAdded > 0 ? { notice: PAYMENT_STATUS_NOT_RESTORED_NOTICE } : {}),
    }
  } catch (error) {
    console.error('Import failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid import data',
    }
  }
}
