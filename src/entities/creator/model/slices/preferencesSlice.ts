/**
 * Preferences Slice
 *
 * Manages user preferences for invoice creation defaults.
 * Handles preference updates and resets.
 */

import type { StateCreator } from 'zustand'
import type { UserPreferences } from '../types'
import type { CreatorStore } from './types'

/**
 * Preferences Slice State
 */
export interface PreferencesSlice {
  /** User preferences (default settings) */
  preferences: UserPreferences

  // ========== Preferences Management ==========

  /**
   * Update user preferences
   */
  updatePreferences: (prefs: Partial<UserPreferences>) => void

  /**
   * Reset preferences to defaults (empty)
   */
  resetPreferences: () => void
}

/**
 * Create Preferences Slice
 */
export const createPreferencesSlice: StateCreator<CreatorStore, [], [], PreferencesSlice> = (
  set
) => ({
  // ========== State ==========
  preferences: {},

  // ========== Preferences Management ==========

  updatePreferences: (prefs) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        ...prefs,
      },
    }))
  },

  resetPreferences: () => {
    set({ preferences: {} })
  },
})
