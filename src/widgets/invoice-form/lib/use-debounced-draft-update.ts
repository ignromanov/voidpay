import { useCallback, useRef, useEffect } from 'react'
import { useCreatorStore } from '@/entities/creator'
import type { PartialInvoice } from '@/shared/lib/invoice-types'

/** Delay before showing "synced" status (debounces rapid changes) */
const SYNCING_DEBOUNCE_MS = 500

/** Duration to show "synced" status before returning to "idle" */
const SYNCED_DISPLAY_MS = 2000

/**
 * Draft Update Hook with Sync Status
 *
 * Updates the store IMMEDIATELY (synchronous) for reactive UI,
 * but debounces the sync status badge to avoid flickering:
 * - 'syncing': User is actively editing (shown immediately, stays until debounce)
 * - 'synced': Changes are complete (shown after SYNCING_DEBOUNCE_MS of inactivity)
 * - 'idle': No recent changes (shown after SYNCED_DISPLAY_MS)
 *
 * @returns updateDraft function that syncs both store and status
 *
 * @example
 * ```tsx
 * const updateDraft = useDebouncedDraftUpdate()
 * updateDraft({ invoiceId: 'INV-001' }) // Store updates immediately, badge shows "syncing"
 * // After 500ms of no changes: badge shows "synced"
 * // After 2s more: badge shows "idle"
 * ```
 */
export function useDebouncedDraftUpdate() {
  const storeUpdateDraft = useCreatorStore((s) => s.updateDraft)
  const setDraftSyncStatus = useCreatorStore((s) => s.setDraftSyncStatus)
  const syncingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncingTimeoutRef.current) {
        clearTimeout(syncingTimeoutRef.current)
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [])

  const updateDraft = useCallback(
    (updates: PartialInvoice) => {
      // 1. Update store IMMEDIATELY (sync) - UI stays reactive
      storeUpdateDraft(updates)

      // 2. Show "syncing" status immediately
      setDraftSyncStatus('syncing')

      // 3. Clear any pending "synced" or "idle" transitions
      if (syncingTimeoutRef.current) {
        clearTimeout(syncingTimeoutRef.current)
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }

      // 4. After user stops typing for SYNCING_DEBOUNCE_MS, show "synced"
      syncingTimeoutRef.current = setTimeout(() => {
        setDraftSyncStatus('synced')
        syncingTimeoutRef.current = null

        // 5. After SYNCED_DISPLAY_MS, return to "idle"
        idleTimeoutRef.current = setTimeout(() => {
          setDraftSyncStatus('idle')
          idleTimeoutRef.current = null
        }, SYNCED_DISPLAY_MS)
      }, SYNCING_DEBOUNCE_MS)
    },
    [storeUpdateDraft, setDraftSyncStatus]
  )

  return updateDraft
}
