'use client'

import { useState, useEffect } from 'react'
import { EyeIcon, EyeOffIcon } from '@/shared/ui/icons'
import { useHydrated } from '@/shared/lib/hooks'
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
      className="cursor-pointer rounded p-1 text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      aria-label={enabled ? 'Disable analytics tracking' : 'Enable analytics tracking'}
      title={enabled ? 'Analytics: On' : 'Analytics: Off'}
    >
      {enabled ? (
        <EyeIcon className="h-3.5 w-3.5" />
      ) : (
        <EyeOffIcon className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
