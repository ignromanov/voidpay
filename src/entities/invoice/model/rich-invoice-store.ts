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
  /** SHA-256 content hash — unique storage key derived from URL fragment (bytes32-compatible) */
  contentHash: string
  /** Unique invoice ID from the invoice data */
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
 * Shared upsert logic for addInvoice and trackView.
 * Merges data into existing entry (or creates new), returns updated array.
 */
// Allows undefined values for optional fields (needed for exactOptionalPropertyTypes)
type UpsertData = {
  [K in keyof TrackedInvoice]?: TrackedInvoice[K] | undefined
} & { contentHash: string; invoiceId: string }

function _upsertInvoice(
  invoices: TrackedInvoice[],
  data: UpsertData,
): TrackedInvoice[] {
  const existing = invoices.find((inv) => inv.contentHash === data.contentHash)
  const base = {
    ...existing,
    ...data,
    // Preserve original source: 'created' must not be overwritten by 'received'
    source: existing?.source ?? data.source,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }

  if (!base.invoiceUrl || !base.source) {
    console.warn('[TrackedInvoiceStore] Skipping upsert: missing required fields', data.contentHash)
    return invoices
  }

  // Safe: required fields verified by guard above, optional undefined fields are valid at runtime
  const merged = {
    ...base,
    contentHash: base.contentHash,
    invoiceId: base.invoiceId,
    invoiceUrl: base.invoiceUrl,
    source: base.source,
    createdAt: base.createdAt,
  } as TrackedInvoice

  const filtered = invoices.filter((inv) => inv.contentHash !== data.contentHash)
  return [merged, ...filtered].slice(0, MAX_INVOICES)
}

interface TrackedInvoiceState {
  invoices: TrackedInvoice[]
}

interface TrackedInvoiceStore extends TrackedInvoiceState {
  // actions:
  addInvoice: (invoice: Omit<TrackedInvoice, 'createdAt'>) => void
  trackView: (data: {
    contentHash: string
    invoiceId: string
    invoiceUrl: string
    source: InvoiceSource
    viewedAt: string
  }) => void
  setTxHash: (contentHash: string, txHash: `0x${string}`, validated?: boolean) => void
  setValidated: (contentHash: string, validated: boolean) => void
  setFinalized: (contentHash: string) => void
  setConfirmations: (contentHash: string, confirmations?: ConfirmationProgress) => void
  setError: (contentHash: string, error: string | null) => void
  getInvoice: (contentHash: string) => TrackedInvoice | undefined
  removeInvoice: (contentHash: string) => void
  clearAll: () => void
  resetPaymentState: (contentHash: string) => void
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
          const existing = state.invoices.find(
            (inv) => inv.contentHash === invoice.contentHash
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
              createdAt: existing?.createdAt ?? new Date().toISOString(),
            }),
          }
        })
      },

      trackView: (data) => {
        set((state) => ({
          invoices: _upsertInvoice(state.invoices, {
            contentHash: data.contentHash,
            invoiceId: data.invoiceId,
            invoiceUrl: data.invoiceUrl,
            source: data.source,
            viewedAt: data.viewedAt,
          }),
        }))
      },

      setTxHash: (contentHash, txHash, validated = false) => {
        const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/
        if (!TX_HASH_REGEX.test(txHash)) return

        const exists = get().invoices.some(inv => inv.contentHash === contentHash)
        if (!exists) {
          console.warn('[TrackedInvoiceStore] setTxHash called for unknown invoice:', { contentHash, txHash })
          return
        }
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.contentHash === contentHash
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

      setValidated: (contentHash, validated) => {
        // W3-014: guard against missing txHash
        const invoice = get().invoices.find(inv => inv.contentHash === contentHash)
        if (!invoice?.txHash) return

        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.contentHash === contentHash
              ? {
                  ...inv,
                  txHashValidated: validated,
                  ...(validated ? { paidAt: new Date().toISOString() } : {}),
                }
              : inv
          ),
        }))
      },

      setFinalized: (contentHash) => {
        const invoice = get().invoices.find(inv => inv.contentHash === contentHash)
        if (!invoice?.txHashValidated) return
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.contentHash === contentHash
              ? { ...inv, finalized: true }
              : inv
          ),
        }))
      },

      setConfirmations: (contentHash, confirmations) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.contentHash !== contentHash) return inv
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

      setError: (contentHash, error) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.contentHash === contentHash
              ? { ...inv, error }
              : inv
          ),
        }))
      },

      removeInvoice: (contentHash) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.contentHash !== contentHash),
        }))
      },

      getInvoice: (contentHash) => {
        return get().invoices.find((inv) => inv.contentHash === contentHash)
      },

      clearAll: () => {
        set({ invoices: [] })
      },

      resetPaymentState: (contentHash) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.contentHash !== contentHash) return inv
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
      migrate: async (persisted, version): Promise<TrackedInvoiceState> => {
        try {
          const state = persisted as Record<string, unknown>
          if (!state || typeof state !== 'object' || !Array.isArray(state.invoices)) {
            return { invoices: [] }
          }

          if (version === 1) {
            // Inline SHA-256 to avoid FSD violation (entities can't import features).
            // Must stay frozen at SHA-256 — future algorithm changes go in new versions.
            const sha256 = async (input: string): Promise<string> => {
              const data = new TextEncoder().encode(input)
              const buf = await crypto.subtle.digest('SHA-256', data)
              return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
            }
            // Use allSettled so one corrupted entry does not destroy the entire store
            const results = await Promise.allSettled(
              (state.invoices as Array<Record<string, unknown>>).map(async (inv) => {
                const url = (inv.invoiceUrl as string) ?? ''
                const hashIndex = url.indexOf('#')
                const fragment = hashIndex === -1 ? '' : url.slice(hashIndex + 1)
                const contentHash = fragment ? await sha256(fragment) : ''
                return { ...inv, contentHash } as TrackedInvoice
              })
            )
            const migrated = results
              .filter((r): r is PromiseFulfilledResult<TrackedInvoice> => r.status === 'fulfilled')
              .map((r) => r.value)
              .filter((inv) => inv.contentHash !== '')
            return { invoices: migrated }
          }

          return { invoices: state.invoices as TrackedInvoice[] }
        } catch (e) {
          console.warn('[TrackedInvoiceStore] Migration failed, resetting store:', e)
          return { invoices: [] }
        }
      },
    }
  )
)

// Cross-tab sync: rehydrate store when another tab updates localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === INVOICE_VIEW_STORE_KEY) {
      void useTrackedInvoiceStore.persist.rehydrate()
    }
  })
}
