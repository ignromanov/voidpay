'use client'

import { useState, useEffect } from 'react'
import { ShieldIcon } from '@/shared/ui/icons'
import { useHydrated } from '@/shared/lib/hooks'
import { cn } from '@/shared/lib/utils'
import { isAnalyticsDisabled, setAnalyticsDisabled } from '../lib/analytics-storage'

export function AnalyticsToggle() {
  const hydrated = useHydrated()
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (hydrated) {
      setEnabled(!isAnalyticsDisabled())
    }
  }, [hydrated])

  const handleToggle = () => {
    const next = !enabled
    setEnabled(next)
    setAnalyticsDisabled(!next)
  }

  if (!hydrated) {
    return <div className="h-4 w-4" />
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'group relative rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
        enabled
          ? 'text-zinc-500 hover:text-zinc-300'
          : 'text-zinc-600 hover:text-zinc-400',
      )}
      aria-label={enabled ? 'Disable analytics tracking' : 'Enable analytics tracking'}
      title={enabled ? 'Analytics: On' : 'Analytics: Off'}
    >
      <ShieldIcon className="h-3.5 w-3.5" />
      {enabled && (
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
    </button>
  )
}
