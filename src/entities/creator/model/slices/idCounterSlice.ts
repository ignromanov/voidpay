/**
 * ID Counter Slice
 *
 * Manages auto-incrementing invoice ID counter.
 * Handles ID generation and counter configuration.
 */

import type { StateCreator } from 'zustand'
import type { InvoiceIDCounter } from '../types'
import type { CreatorStore } from './types'

/**
 * ID Counter Slice State
 */
export interface IdCounterSlice {
  /** Auto-incrementing ID counter */
  idCounter: InvoiceIDCounter

  // ========== Invoice ID Counter ==========

  /**
   * Generate the next invoice ID and increment counter
   */
  generateNextInvoiceId: () => string

  /**
   * Update the ID counter prefix
   */
  updateIdPrefix: (prefix: string) => void

  /**
   * Reset the counter to a specific value
   */
  resetCounter: (value: number) => void
}

/**
 * Create ID Counter Slice
 */
export const createIdCounterSlice: StateCreator<CreatorStore, [], [], IdCounterSlice> = (
  set,
  get
) => ({
  // ========== State ==========
  idCounter: {
    currentValue: 1,
    prefix: 'INV',
  },

  // ========== Invoice ID Counter ==========

  generateNextInvoiceId: () => {
    const state = get()
    const { idCounter } = state

    const paddedNumber = idCounter.currentValue.toString().padStart(3, '0')
    const invoiceId = `${idCounter.prefix}-${paddedNumber}`

    // Increment counter
    set((state) => ({
      idCounter: {
        ...state.idCounter,
        currentValue: state.idCounter.currentValue + 1,
      },
    }))

    return invoiceId
  },

  updateIdPrefix: (prefix) => {
    // Validate prefix (max 10 chars, alphanumeric only)
    if (prefix.length > 10 || !/^[a-zA-Z0-9]*$/.test(prefix)) {
      throw new Error('Invalid prefix: max 10 chars, alphanumeric only')
    }

    set((state) => ({
      idCounter: {
        ...state.idCounter,
        prefix: prefix || 'INV',
      },
    }))
  },

  resetCounter: (value) => {
    if (value < 1) {
      throw new Error('Counter value must be >= 1')
    }

    set((state) => ({
      idCounter: {
        ...state.idCounter,
        currentValue: value,
      },
    }))
  },
})
