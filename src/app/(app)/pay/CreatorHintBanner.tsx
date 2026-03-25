'use client'

import { useState, useEffect } from 'react'
import { STORAGE_KEYS } from '@/shared/config'
import { XIcon } from '@/shared/ui/icons'
import { motion, AnimatePresence } from '@/shared/ui/motion'

interface CreatorHintBannerProps {
  isCreator: boolean
}

/**
 * Soft dismissible banner shown when a creator opens their own invoice on /pay.
 * Suggests navigating to /invoice for tracking.
 * Dismissed state persisted in localStorage.
 */
export function CreatorHintBanner({ isCreator }: CreatorHintBannerProps) {
  const [dismissed, setDismissed] = useState(true) // default hidden to prevent flash
  const [invoiceUrl, setInvoiceUrl] = useState('')

  useEffect(() => {
    if (!isCreator) return
    setInvoiceUrl(`/invoice${window.location.hash}`)
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HINT_DISMISSED)
      setDismissed(stored === 'true')
    } catch {
      setDismissed(false)
    }
  }, [isCreator])

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEYS.HINT_DISMISSED, 'true')
    } catch {
      // Storage write failed — hint stays dismissed for this session only
    }
  }

  return (
    <AnimatePresence>
      {isCreator && !dismissed && invoiceUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mb-2 flex items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/80 px-4 py-2.5 backdrop-blur-sm"
        >
          <p className="text-sm text-zinc-300">
            This is your invoice{' · '}
            <a
              href={invoiceUrl}
              className="font-medium text-white underline underline-offset-2 hover:text-zinc-200"
            >
              Track status →
            </a>
          </p>
          <button
            onClick={handleDismiss}
            className="ml-3 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-white"
            aria-label="Dismiss hint"
          >
            <XIcon size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
