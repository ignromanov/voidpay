'use client'

import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useCreatorStore } from '@/entities/creator'
import { Switch } from '@/shared/ui/switch'
import { Text } from '@/shared/ui/typography'
import { ImageIcon, EyeOffIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'

export interface OgImageCheckboxProps {
  className?: string
}

/**
 * OgImageCheckbox Component
 *
 * Toggle for enabling/disabling OG image preview in generated invoice URLs.
 * When enabled, invoice preview appears in social media shares (Twitter, Telegram, etc).
 * When disabled, no preview is shown (more private).
 *
 * Persisted via preferencesSlice.includeOgImage in localStorage.
 */
export function OgImageCheckbox({ className }: OgImageCheckboxProps) {
  // Use shallow comparison to prevent re-renders from unrelated preference changes
  const { includeOgImage, updatePreferences } = useCreatorStore(
    useShallow((s) => ({
      includeOgImage: s.preferences.includeOgImage ?? true,
      updatePreferences: s.updatePreferences,
    }))
  )

  const handleChange = useCallback(
    (enabled: boolean) => {
      updatePreferences({ includeOgImage: enabled })
    },
    [updatePreferences]
  )

  return (
    <div className={cn('rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon
            size={16}
            className={cn(includeOgImage ? 'text-violet-400' : 'text-zinc-600')}
            aria-hidden="true"
          />
          <Text variant="tiny" className="font-bold text-zinc-300">
            Social Media Preview
          </Text>
        </div>
        <Switch checked={includeOgImage} onCheckedChange={handleChange} />
      </div>

      <div className="mt-2 border-t border-zinc-800/50 pt-2">
        {includeOgImage ? (
          <Text variant="tiny" className="leading-tight">
            Shows invoice preview when sharing on{' '}
            <strong className="text-zinc-400">Twitter, Telegram, etc</strong>. Includes minimal
            public metadata.
          </Text>
        ) : (
          <div className="flex items-start gap-2">
            <EyeOffIcon size={12} className="mt-0.5 shrink-0 text-zinc-500" />
            <Text variant="tiny" className="leading-tight text-zinc-500">
              No preview card when sharing. More private, but less visual appeal in social feeds.
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
