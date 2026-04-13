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
  /**
   * Mark invoice as validated (soft-confirmed / finalized).
   *
   * `paidAtMs` — wall-clock timestamp of the transaction's block in milliseconds
   * since epoch. Fetched by the caller via `publicClient.getBlock({ blockNumber })`.
   *
   * Semantic: an explicit `paidAtMs` always wins over any existing value (so a
   * later caller that successfully fetched the block can upgrade an earlier
   * fallback write). Undefined falls back to `Date.now()` only when no `paidAt`
   * is set yet, so a subsequent undefined call never downgrades a real block
   * timestamp back to wall-clock.
   */
  setValidated: (contentHash: string, validated: boolean, paidAtMs?: number) => void
  setFinalized: (contentHash: string) => void
  setConfirmations: (contentHash: string, confirmations?: ConfirmationProgress) => void
  setError: (contentHash: string, error: string | null) => void
  getInvoice: (contentHash: string) => TrackedInvoice | undefined
  removeInvoice: (contentHash: string) => void
  clearAll: () => void
  resetPaymentState: (contentHash: string) => void
}

import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'

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

        const existing = get().invoices.find(inv => inv.contentHash === contentHash)
        if (!existing) {
          console.warn('[TrackedInvoiceStore] setTxHash called for unknown invoice:', { contentHash, txHash })
          return
        }

        // No-op: same hash re-linked with equal-or-weaker status.
        // Prevents downgrading `txHashValidated: true → false` (or wiping
        // `paidAt`) when a later discovery/polling path re-reports the same
        // already-validated transaction on a fresh mount (e.g. after reload).
        if (existing.txHash === txHash && existing.txHashValidated && !validated) return

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

      setValidated: (contentHash, validated, paidAtMs) => {
        // W3-014: guard against missing txHash
        const invoice = get().invoices.find(inv => inv.contentHash === contentHash)
        if (!invoice?.txHash) return

        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.contentHash !== contentHash) return inv
            const next: TrackedInvoice = { ...inv, txHashValidated: validated }
            if (validated) {
              if (paidAtMs !== undefined) {
                // Explicit block timestamp: always wins (upgrades any fallback).
                next.paidAt = new Date(paidAtMs).toISOString()
              } else if (!inv.paidAt) {
                // No explicit value and nothing stored yet: wall-clock fallback.
                next.paidAt = new Date().toISOString()
              }
            }
            return next
          }),
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
      migrate: (persisted, version): TrackedInvoiceState => {
        try {
          const state = persisted as Record<string, unknown>
          if (!state || typeof state !== 'object' || !Array.isArray(state.invoices)) {
            return { invoices: [] }
          }

          if (version < 2) {
            const invoices = (state.invoices as Array<Record<string, unknown>>)
              .map((inv) => {
                const url = (inv.invoiceUrl as string) ?? ''
                const hashIndex = url.indexOf('#')
                const fragment = hashIndex === -1 ? '' : url.slice(hashIndex + 1)
                if (!fragment) return null
                const contentHash = bytesToHex(sha256(new TextEncoder().encode(fragment)))
                return { ...inv, contentHash } as TrackedInvoice
              })
              .filter((inv): inv is TrackedInvoice => inv !== null)
            return { invoices }
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

// Cross-tab sync removed: rehydrate() re-triggers migration from stale tabs
// that still write version 1. Will be re-added with BroadcastChannel after
// migration period is over (all users on v2).
// See: https://github.com/pmndrs/zustand/pull/3336
