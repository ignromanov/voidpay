'use client'

import { useCallback } from 'react'
import { Image as ImageIcon, HelpCircle } from 'lucide-react'
import { useShallow } from 'zustand/shallow'

import { useCreatorStore } from '@/entities/creator'
import { Switch } from '@/shared/ui/switch'
import { Text } from '@/shared/ui/typography'
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
            className={cn('h-4 w-4', includeOgImage ? 'text-violet-400' : 'text-zinc-600')}
            aria-hidden="true"
          />
          <Text variant="tiny" className="font-bold text-zinc-300">
            Social Media Preview
          </Text>
          <div className="group relative">
            <HelpCircle className="h-3 w-3 cursor-help text-zinc-600" />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded border border-zinc-800 bg-zinc-900 p-2 text-center font-sans text-[10px] text-zinc-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Disabling hides invoice preview in social media shares (Twitter, Telegram, etc). More
              private but less visual.
            </div>
          </div>
        </div>
        <Switch checked={includeOgImage} onCheckedChange={handleChange} />
      </div>
    </div>
  )
}
