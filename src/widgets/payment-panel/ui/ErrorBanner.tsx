import { motion, AnimatePresence } from '@/shared/ui/motion'
import { AlertTriangleIcon, XIcon } from '@/shared/ui/icons'

interface ErrorBannerProps {
  error?: string | null
  onDismiss: () => void
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mt-2"
          >
            <AlertTriangleIcon size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold block mb-0.5">Error</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss error"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <XIcon size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
