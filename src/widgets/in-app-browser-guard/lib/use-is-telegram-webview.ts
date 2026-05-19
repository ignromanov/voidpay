'use client'

import { useState, useEffect } from 'react'
import { isTelegramWebView } from '@/shared/lib'

/**
 * Returns whether the current runtime is Telegram WebView.
 *
 * Returns false on the first (SSR) render to avoid hydration mismatch,
 * then updates to the real value after mount.
 */
export function useIsTelegramWebView(): boolean {
  const [isTg, setIsTg] = useState(false)

  useEffect(() => {
    setIsTg(isTelegramWebView())
  }, [])

  return isTg
}
