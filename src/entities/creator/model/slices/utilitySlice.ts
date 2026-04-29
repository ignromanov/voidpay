/**
 * Utility Slice
 *
 * Provides utility actions that affect the entire store.
 * Handles global operations like clearing all data.
 */

import type { StateCreator } from 'zustand'
import type { CreatorStore } from './types'
import { CREATOR_INITIAL_STATE } from '../initial-state'

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
 * Create Utility Slice
 */
export const createUtilitySlice: StateCreator<CreatorStore, [], [], UtilitySlice> = (set) => ({
  // ========== Utility ==========

  clearAllData: () => {
    set(CREATOR_INITIAL_STATE)
  },
})
