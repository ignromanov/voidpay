/**
 * Utility Slice
 *
 * Provides utility actions that affect the entire store.
 * Handles global operations like clearing all data.
 */

import type { StateCreator } from 'zustand'
import type { CreatorStore } from './types'

/**
 * Utility Slice State
 */
export interface UtilitySlice {
  // ========== Utility ==========

  /**
   * Clear all data (reset to initial state)
   */
  clearAllData: () => void
}

/**
 * Initial state for reset
 */
const initialState = {
  version: 1 as const,
  activeDraft: null,
  lineItems: [],
  templates: [],
  history: [],
  preferences: {},
  idCounter: {
    currentValue: 1,
    prefix: 'INV',
  },
}

/**
 * Create Utility Slice
 */
export const createUtilitySlice: StateCreator<CreatorStore, [], [], UtilitySlice> = (set) => ({
  // ========== Utility ==========

  clearAllData: () => {
    set(initialState)
  },
})
