import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { PaymentReceipt } from '../../invoice/model/types'
import { STORAGE_KEYS } from '@/shared/config/storage-keys'

// ============================================================================
// Types
// ============================================================================

export interface PayerStoreState {
  version: number

  // Payment receipts
  receipts: PaymentReceipt[]
}

export interface PayerStoreActions {
  // Receipt Actions
  addReceipt: (receipt: PaymentReceipt) => void
  deleteReceipt: (receiptId: string) => void
  clearAllReceipts: () => void

  // System Actions
  reset: () => void
}

type PayerStore = PayerStoreState & PayerStoreActions

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: PayerStoreState = {
  version: 1,
  receipts: [],
}

// ============================================================================
// Store Implementation
// ============================================================================

export const usePayerStore = create<PayerStore>()(
  persist(
    immer((set) => ({
      ...INITIAL_STATE,

      // Receipt Actions
      addReceipt: (receipt) =>
        set((state) => {
          // Check if receipt already exists to prevent duplicates
          const exists = state.receipts.some(
            (r: PaymentReceipt) => r.receiptId === receipt.receiptId
          )
          if (!exists) {
            // Add to beginning of list
            state.receipts.unshift(receipt)
          }
        }),

      deleteReceipt: (receiptId) =>
        set((state) => {
          state.receipts = state.receipts.filter((r: PaymentReceipt) => r.receiptId !== receiptId)
        }),

      clearAllReceipts: () =>
        set((state) => {
          state.receipts = []
        }),

      // System Actions
      reset: () => set(INITIAL_STATE),
    })),
    {
      name: STORAGE_KEYS.PAYER, // 'voidpay:payer'
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        version: state.version,
        receipts: state.receipts,
      }),
    }
  )
)
