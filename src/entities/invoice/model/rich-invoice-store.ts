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

interface TrackedInvoiceStore {
  invoices: TrackedInvoice[]
  // actions:
  addInvoice: (invoice: Omit<TrackedInvoice, 'createdAt'>) => void
  setTxHash: (invoiceId: string, txHash: `0x${string}`, validated?: boolean) => void
  setValidated: (invoiceId: string, validated: boolean) => void
  setFinalized: (invoiceId: string) => void
  setConfirmations: (invoiceId: string, confirmations?: ConfirmationProgress) => void
  setError: (invoiceId: string, error: string | null) => void
  getInvoice: (invoiceId: string) => TrackedInvoice | undefined
  removeInvoice: (invoiceId: string) => void
  clearAll: () => void
  resetPaymentState: (invoiceId: string) => void
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
            (inv) => inv.invoiceId === invoice.invoiceId
          )
          // W3-013: reset all payment-critical fields on merge to prevent stale state
          const safeDefaults = {
            txHash: undefined,
            txHashValidated: undefined,
            paidAt: undefined,
            finalized: undefined,
            confirmations: undefined,
            error: undefined,
          }
          const merged = {
            ...existing,
            ...safeDefaults,
            ...invoice,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
          } as TrackedInvoice
          const filtered = state.invoices.filter(
            (inv) => inv.invoiceId !== invoice.invoiceId
          )
          return { invoices: [merged, ...filtered].slice(0, MAX_INVOICES) }
        })
      },

      setTxHash: (invoiceId, txHash, validated = false) => {
        const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/
        if (!TX_HASH_REGEX.test(txHash)) return

        const exists = get().invoices.some(inv => inv.invoiceId === invoiceId)
        if (!exists) {
          console.warn('[TrackedInvoiceStore] setTxHash called for unknown invoice:', { invoiceId, txHash })
        }
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.invoiceId === invoiceId
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

      setValidated: (invoiceId, validated) => {
        // W3-014: guard against missing txHash
        const invoice = get().invoices.find(inv => inv.invoiceId === invoiceId)
        if (!invoice?.txHash) return

        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.invoiceId === invoiceId
              ? {
                  ...inv,
                  txHashValidated: validated,
                  ...(validated ? { paidAt: new Date().toISOString() } : {}),
                }
              : inv
          ),
        }))
      },

      setFinalized: (invoiceId) => {
        const invoice = get().invoices.find(inv => inv.invoiceId === invoiceId)
        if (!invoice?.txHashValidated) return
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.invoiceId === invoiceId
              ? { ...inv, finalized: true }
              : inv
          ),
        }))
      },

      setConfirmations: (invoiceId, confirmations) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.invoiceId !== invoiceId) return inv
            if (confirmations === undefined) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { confirmations: _c, ...rest } = inv
              return rest
            }
            return { ...inv, confirmations }
          }),
        }))
      },

      setError: (invoiceId, error) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.invoiceId === invoiceId
              ? { ...inv, error }
              : inv
          ),
        }))
      },

      removeInvoice: (invoiceId) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.invoiceId !== invoiceId),
        }))
      },

      getInvoice: (invoiceId) => {
        return get().invoices.find((inv) => inv.invoiceId === invoiceId)
      },

      clearAll: () => {
        set({ invoices: [] })
      },

      resetPaymentState: (invoiceId) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.invoiceId !== invoiceId) return inv
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { txHash, txHashValidated, paidAt, confirmations, finalized, ...rest } = inv
            return rest
          }),
        }))
      },
    }),
    {
      name: INVOICE_VIEW_STORE_KEY,
      version: 1,
      migrate: (persisted) => persisted as TrackedInvoiceStore,
    }
  )
)
