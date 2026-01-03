/**
 * UI Slice
 *
 * Manages transient UI state (not persisted to localStorage).
 * Includes network theme for dynamic background colors.
 */

import type { StateCreator } from 'zustand'
import type { NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import type { CreatorStore } from './types'

/**
 * UI Slice State
 */
export interface UiSlice {
  /** Current network theme for background */
  networkTheme: NetworkTheme

  // ========== UI State Management ==========

  /**
   * Set network theme for background
   */
  setNetworkTheme: (theme: NetworkTheme) => void
}

/**
 * Create UI Slice
 *
 * Note: This slice should be excluded from persist middleware
 * to avoid saving transient UI state.
 */
export const createUiSlice: StateCreator<CreatorStore, [], [], UiSlice> = (set) => ({
  // ========== State ==========
  networkTheme: 'ethereum',

  // ========== UI State Management ==========

  setNetworkTheme: (theme) => {
    set({ networkTheme: theme })
  },
})
