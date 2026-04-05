/**
 * Tracked Invoice Store
 *
 * Persists tracked invoices for navigation history and payment status tracking.
 * Uses zustand with localStorage persistence.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INVOICE_VIEW_STORE_KEY } from '@/shared/config'
import type { ConfirmationProgress } from '@/shared/lib/invoice-types'

export type InvoiceSource = 'created' | 'received'

/**
 * A tracked invoice entry
 */
export interface TrackedInvoice {
  /** Unique storage key derived from invoice URL hash fragment (stable identifier) */
  key: string
  /** Unique invoice ID from the invoice data (display only, not unique across senders) */
  invoiceId: string
  /** Generated URL for sharing */
  invoiceUrl: string
  /** Whether invoice was created by or received by the user */
  source: InvoiceSource
  /** Transaction hash (if paid) */
  txHash?: `0x${string}`
  /** Whether txHash has been validated on-chain */
  txHashValidated?: boolean
  /** Whether payment has been fully finalized (deep confirmation) */
  finalized?: boolean
  /** Block confirmation progress (during polling) */
  confirmations?: ConfirmationProgress
  /** Last payment error message */
  error?: string | null
  /** ISO 8601 timestamp when entry was created */
  createdAt: string
  /** ISO 8601 timestamp when invoice was last viewed */
  viewedAt?: string
  /** ISO 8601 timestamp when invoice was paid */
  paidAt?: string
}

/**
 * Maximum number of invoices to store
 */
const MAX_INVOICES = 50

/**
 * Extracts the unique hash key from an invoice URL.
 * Uses the URL fragment (hash) as the stable identifier.
 */
function extractHashKey(invoiceUrl: string): string {
  try {
    const hashIndex = invoiceUrl.indexOf('#')
    if (hashIndex === -1) return invoiceUrl
    return invoiceUrl.slice(hashIndex + 1)
  } catch {
    return invoiceUrl
  }
}

/**
 * Shared upsert logic for addInvoice and trackView.
 * Merges data into existing entry (or creates new), returns updated array.
 */
// Allows undefined values for optional fields (needed for exactOptionalPropertyTypes)
type UpsertData = {
  [K in keyof TrackedInvoice]?: TrackedInvoice[K] | undefined
} & { key: string; invoiceId: string }

function _upsertInvoice(
  invoices: TrackedInvoice[],
  data: UpsertData,
): TrackedInvoice[] {
  const existing = invoices.find((inv) => inv.key === data.key)
  const base = {
    ...existing,
    ...data,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }

  if (!base.invoiceUrl || !base.source) {
    console.warn('[TrackedInvoiceStore] Skipping upsert: missing required fields', data.key)
    return invoices
  }

  // Safe: required fields verified by guard above, optional undefined fields are valid at runtime
  const merged = {
    ...base,
    key: base.key,
    invoiceId: base.invoiceId,
    invoiceUrl: base.invoiceUrl,
    source: base.source,
    createdAt: base.createdAt,
  } as TrackedInvoice

  const filtered = invoices.filter((inv) => inv.key !== data.key)
  return [merged, ...filtered].slice(0, MAX_INVOICES)
}

interface TrackedInvoiceState {
  invoices: TrackedInvoice[]
}

interface TrackedInvoiceStore extends TrackedInvoiceState {
  // actions:
  addInvoice: (invoice: Omit<TrackedInvoice, 'createdAt' | 'key'>) => void
  trackView: (data: {
    key: string
    invoiceId: string
    invoiceUrl: string
    source: InvoiceSource
    viewedAt: string
  }) => void
  setTxHash: (key: string, txHash: `0x${string}`, validated?: boolean) => void
  setValidated: (key: string, validated: boolean) => void
  setFinalized: (key: string) => void
  setConfirmations: (key: string, confirmations?: ConfirmationProgress) => void
  setError: (key: string, error: string | null) => void
  getInvoice: (key: string) => TrackedInvoice | undefined
  removeInvoice: (key: string) => void
  clearAll: () => void
  resetPaymentState: (key: string) => void
}

/**
 * Hook to access tracked invoices store
 */
export const useTrackedInvoiceStore = create<TrackedInvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (invoice) => {
        set((state) => {
          const key = extractHashKey(invoice.invoiceUrl)
          const existing = state.invoices.find(
            (inv) => inv.key === key
          )
          // W3-013: reset payment-critical fields on merge to prevent stale state
          const safeDefaults = {
            txHash: undefined,
            txHashValidated: undefined,
            paidAt: undefined,
            finalized: undefined,
            confirmations: undefined,
            error: undefined,
          }
          return {
            invoices: _upsertInvoice(state.invoices, {
              ...safeDefaults,
              ...invoice,
              key,
              createdAt: existing?.createdAt ?? new Date().toISOString(),
            }),
          }
        })
      },

      trackView: (data) => {
        set((state) => ({
          invoices: _upsertInvoice(state.invoices, data),
        }))
      },

      setTxHash: (key, txHash, validated = false) => {
        const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/
        if (!TX_HASH_REGEX.test(txHash)) return

        const exists = get().invoices.some(inv => inv.key === key)
        if (!exists) {
          console.warn('[TrackedInvoiceStore] setTxHash called for unknown invoice:', { key, txHash })
        }
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.key === key
              ? {
                  ...inv,
                  txHash,
                  txHashValidated: validated,
                  ...(validated ? { paidAt: new Date().toISOString() } : {}),
                }
              : inv
          ),
        }))
      },

      setValidated: (key, validated) => {
        // W3-014: guard against missing txHash
        const invoice = get().invoices.find(inv => inv.key === key)
        if (!invoice?.txHash) return

        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.key === key
              ? {
                  ...inv,
                  txHashValidated: validated,
                  ...(validated ? { paidAt: new Date().toISOString() } : {}),
                }
              : inv
          ),
        }))
      },

      setFinalized: (key) => {
        const invoice = get().invoices.find(inv => inv.key === key)
        if (!invoice?.txHashValidated) return
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.key === key
              ? { ...inv, finalized: true }
              : inv
          ),
        }))
      },

      setConfirmations: (key, confirmations) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.key !== key) return inv
            if (confirmations === undefined) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { confirmations: _c, ...rest } = inv
              return rest
            }
            // Same-value guard: skip update if nothing changed
            if (inv.confirmations?.current === confirmations.current &&
                inv.confirmations?.required === confirmations.required) return inv
            return { ...inv, confirmations }
          }),
        }))
      },

      setError: (key, error) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.key === key
              ? { ...inv, error }
              : inv
          ),
        }))
      },

      removeInvoice: (key) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.key !== key),
        }))
      },

      getInvoice: (key) => {
        return get().invoices.find((inv) => inv.key === key)
      },

      clearAll: () => {
        set({ invoices: [] })
      },

      resetPaymentState: (key) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.key !== key) return inv
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { txHash, txHashValidated, paidAt, confirmations, finalized, ...rest } = inv
            return rest
          }),
        }))
      },
    }),
    {
      name: INVOICE_VIEW_STORE_KEY,
      version: 2,
      migrate: (persisted, version): TrackedInvoiceState => {
        try {
          const state = persisted as Record<string, unknown>
          if (!state || typeof state !== 'object' || !Array.isArray(state.invoices)) {
            return { invoices: [] }
          }
          
          // Version 1 -> 2 migration: generate key from invoiceUrl for existing entries
          if (version === 1) {
            const migratedInvoices = (state.invoices as Array<TrackedInvoice & { key?: string }>).map((inv) => ({
              ...inv,
              key: inv.key ?? extractHashKey(inv.invoiceUrl),
            }))
            return { invoices: migratedInvoices as TrackedInvoice[] }
          }
          
          return { invoices: state.invoices as TrackedInvoice[] }
        } catch {
          return { invoices: [] }
        }
      },
    }
  )
)
