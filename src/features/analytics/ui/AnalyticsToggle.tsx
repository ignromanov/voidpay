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
    return <div className="h-11 w-11 sm:h-6 sm:w-6" aria-hidden="true" />
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:h-auto sm:w-auto sm:rounded sm:p-1 sm:hover:bg-transparent"
      aria-label={enabled ? 'Disable analytics tracking' : 'Enable analytics tracking'}
      title={enabled ? 'Analytics: On' : 'Analytics: Off'}
    >
      {enabled ? (
        <EyeIcon className="h-4 w-4" />
      ) : (
        <EyeOffIcon className="h-4 w-4" />
      )}
    </button>
  )
}
