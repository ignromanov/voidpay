'use client'

import { useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useCreatorStore } from '@/entities/creator'
import { generateMagicDust } from '@/shared/lib/amount-utils'
import { Switch } from '@/shared/ui/switch'
import { Text } from '@/shared/ui/typography'
import { FingerprintIcon, AlertCircleIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'

export interface MagicDustToggleProps {
  className?: string
}

/**
 * MagicDustToggle Component
 *
 * Toggle for enabling/disabling Magic Dust verification.
 * When enabled, generates a dust value and writes it to the active draft
 * so the preview shows the exact dust that will appear in the final URL.
 * When disabled, clears magicDust from the draft.
 *
 * Persisted via preferencesSlice.magicDustEnabled in localStorage.
 */
export function MagicDustToggle({ className }: MagicDustToggleProps) {
  const { magicDustEnabled, hasActiveDraft, hasDraftDust, updatePreferences, updateDraft } = useCreatorStore(
    useShallow((s) => ({
      magicDustEnabled: s.preferences.magicDustEnabled ?? true,
      hasActiveDraft: !!s.activeDraft,
      hasDraftDust: !!s.activeDraft?.data?.magicDust,
      updatePreferences: s.updatePreferences,
      updateDraft: s.updateDraft,
    }))
  )

  // When enabled and draft has no dust yet, generate one.
  // Covers mount AND new draft creation while component is already mounted.
  useEffect(() => {
    if (magicDustEnabled && hasActiveDraft && !hasDraftDust) {
      updateDraft({ magicDust: String(generateMagicDust()) })
    }
  }, [magicDustEnabled, hasActiveDraft, hasDraftDust, updateDraft])

  const setMagicDustEnabled = useCallback(
    (enabled: boolean) => {
      updatePreferences({ magicDustEnabled: enabled })
      if (enabled) {
        updateDraft({ magicDust: String(generateMagicDust()) })
      } else {
        updateDraft({ magicDust: undefined })
      }
    },
    [updatePreferences, updateDraft]
  )

  return (
    <div className={cn('rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FingerprintIcon
            size={16}
            className={cn(magicDustEnabled ? 'text-violet-400' : 'text-zinc-600')}
          />
          <Text variant="tiny" className="font-bold text-zinc-300">
            Magic Dust Verification
          </Text>
        </div>
        <Switch checked={magicDustEnabled} onCheckedChange={setMagicDustEnabled} />
      </div>

      <div className="mt-2 border-t border-zinc-800/50 pt-2">
        {magicDustEnabled ? (
          <Text variant="tiny" className="leading-tight">
            Adds a tiny random amount (e.g. 0.000042) to the total to{' '}
            <strong className="text-zinc-400">instantly verify payment</strong> on-chain without a
            database.
          </Text>
        ) : (
          <div className="flex items-start gap-2">
            <AlertCircleIcon size={12} className="mt-0.5 shrink-0 text-amber-500" />
            <Text variant="tiny" className="leading-tight text-amber-500/80">
              <strong>Warning:</strong> Without Magic Dust, the system cannot auto-detect this
              specific payment. You will need to manually check your wallet and mark the invoice as
              paid.
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
