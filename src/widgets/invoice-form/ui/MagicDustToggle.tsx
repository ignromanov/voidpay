'use client'

import { Fingerprint, AlertCircle } from 'lucide-react'

import { useCreatorStore } from '@/entities/creator'
import { Switch, Text } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export interface MagicDustToggleProps {
  className?: string
}

/**
 * MagicDustToggle Component
 *
 * Toggle for enabling/disabling Magic Dust verification.
 * When enabled, adds a tiny random amount to invoice total for payment matching.
 * When disabled, shows warning about manual verification.
 *
 * Persisted via preferencesSlice.magicDustEnabled in localStorage.
 */
export function MagicDustToggle({ className }: MagicDustToggleProps) {
  const magicDustEnabled = useCreatorStore((s) => s.preferences.magicDustEnabled ?? true)
  const updatePreferences = useCreatorStore((s) => s.updatePreferences)

  const setMagicDustEnabled = (enabled: boolean) => {
    updatePreferences({ magicDustEnabled: enabled })
  }

  return (
    <div className={cn('rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fingerprint
            className={cn('h-4 w-4', magicDustEnabled ? 'text-violet-400' : 'text-zinc-600')}
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
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
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
