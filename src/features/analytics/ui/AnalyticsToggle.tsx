'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/shared/ui/switch'
import { useHydrated } from '@/shared/lib/hooks'
import { isAnalyticsDisabled, setAnalyticsDisabled } from '../lib/analytics-storage'

/**
 * Analytics opt-out toggle for Footer
 *
 * Provides transparent control over Umami analytics tracking.
 * State persists in localStorage via Umami's built-in key.
 */
export function AnalyticsToggle() {
  const hydrated = useHydrated()
  const [enabled, setEnabled] = useState(true) // Default: tracking enabled

  // Sync with localStorage after hydration
  useEffect(() => {
    if (hydrated) {
      setEnabled(!isAnalyticsDisabled())
    }
  }, [hydrated])

  const handleChange = (checked: boolean) => {
    setEnabled(checked)
    setAnalyticsDisabled(!checked)
  }

  // Show placeholder during SSR to avoid hydration mismatch
  if (!hydrated) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-zinc-500">Analytics</span>
        <div className="h-4 w-8 rounded-full bg-zinc-700" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-zinc-500">Analytics</span>
      <Switch
        size="sm"
        checked={enabled}
        onCheckedChange={handleChange}
        aria-label={enabled ? 'Disable analytics tracking' : 'Enable analytics tracking'}
      />
    </div>
  )
}
