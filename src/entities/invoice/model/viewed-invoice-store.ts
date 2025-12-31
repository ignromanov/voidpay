/**
 * Viewed Invoice Store
 *
 * Persists viewed invoices for navigation history and status tracking.
 * Uses zustand with localStorage persistence.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INVOICE_VIEW_STORE_KEY } from '@/shared/config'
import type { Invoice } from './types'

/**
 * Status of a viewed invoice
 * - pending: Awaiting payment
 * - paid: Payment confirmed
 * - overdue: Past due date
 * - draft: Being edited
 * - empty: No invoice data (placeholder)
 */
export type ViewedInvoiceStatus = 'pending' | 'paid' | 'overdue' | 'draft' | 'empty'

/**
 * A viewed invoice entry
 */
export interface ViewedInvoice {
  /** Unique invoice ID from the invoice data */
  invoiceId: string
  /** Generated URL for sharing */
  invoiceUrl: string
  /** Original invoice data */
  data: Invoice
  /** Current payment status */
  status: ViewedInvoiceStatus
  /** Transaction hash (if paid) */
  txHash?: string
  /** Whether txHash has been validated on-chain */
  txHashValidated?: boolean
  /** ISO 8601 timestamp when invoice was viewed */
  viewedAt: string
  /** Pre-generated hash for /create# template link (optional, for demo invoices) */
  createHash?: string
}

/**
 * Maximum number of invoices to store
 */
const MAX_INVOICES = 50

interface InvoiceViewState {
  /** Schema version for future migrations */
  version: 1
  /** List of viewed invoices, sorted by viewedAt desc */
  invoices: ViewedInvoice[]
}

interface InvoiceViewActions {
  /** Add a new invoice to the store */
  addInvoice: (invoice: Omit<ViewedInvoice, 'viewedAt'>) => void
  /** Update the status of an existing invoice */
  updateStatus: (invoiceId: string, status: ViewedInvoiceStatus) => void
  /** Set transaction hash for an invoice */
  setTxHash: (invoiceId: string, txHash: string, validated?: boolean) => void
  /** Remove an invoice from the store */
  removeInvoice: (invoiceId: string) => void
  /** Get an invoice by ID */
  getInvoice: (invoiceId: string) => ViewedInvoice | undefined
  /** Clear all invoices */
  clearAll: () => void
}

type InvoiceViewStore = InvoiceViewState & InvoiceViewActions

/**
 * Hook to access viewed invoices store
 */
export const useInvoiceViewStore = create<InvoiceViewStore>()(
  persist(
    (set, get) => ({
      version: 1,
      invoices: [],

      addInvoice: (invoice) => {
        set((state) => {
          // Check if invoice already exists
          const existingIndex = state.invoices.findIndex(
            (inv) => inv.invoiceId === invoice.invoiceId
          )

          const newInvoice: ViewedInvoice = {
            ...invoice,
            viewedAt: new Date().toISOString(),
          }

          let updatedInvoices: ViewedInvoice[]

          if (existingIndex >= 0) {
            // Update existing invoice and move to top
            updatedInvoices = [
              newInvoice,
              ...state.invoices.filter((inv) => inv.invoiceId !== invoice.invoiceId),
            ]
          } else {
            // Add new invoice at the top
            updatedInvoices = [newInvoice, ...state.invoices]
          }

          // Limit to MAX_INVOICES
          return {
            invoices: updatedInvoices.slice(0, MAX_INVOICES),
          }
        })
      },

      updateStatus: (invoiceId, status) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.invoiceId === invoiceId ? { ...inv, status } : inv
          ),
        }))
      },

      setTxHash: (invoiceId, txHash, validated = false) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.invoiceId === invoiceId
              ? { ...inv, txHash, txHashValidated: validated, status: 'paid' as const }
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
    }),
    {
      name: INVOICE_VIEW_STORE_KEY,
      version: 1,
    }
  )
)
