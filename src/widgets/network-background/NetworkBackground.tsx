'use client'

import { useCreatorStore } from '@/entities/creator'
import { cn } from '@/shared/lib/utils'
import type { NetworkTheme } from '@/shared/ui/constants/brand-tokens'

export interface NetworkBackgroundProps {
  /**
   * Additional className
   */
  className?: string
}

// Theme-specific accent colors for gradient blobs
const THEME_COLORS: Record<NetworkTheme, { primary: string; secondary: string }> = {
  ethereum: { primary: 'bg-violet-600/10', secondary: 'bg-indigo-600/10' },
  arbitrum: { primary: 'bg-blue-600/10', secondary: 'bg-cyan-600/10' },
  optimism: { primary: 'bg-red-600/10', secondary: 'bg-orange-600/10' },
  polygon: { primary: 'bg-purple-600/10', secondary: 'bg-violet-600/10' },
}

/**
 * NetworkBackground — Client component for dynamic theme-aware background
 *
 * Reads theme from useCreatorStore (uiSlice).
 * Renders gradient blobs that match the selected network theme.
 *
 * Usage:
 * ```tsx
 * // In layout.tsx (once for all pages)
 * <NetworkBackground />
 *
 * // Pages set theme via store:
 * const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
 * useEffect(() => setNetworkTheme('arbitrum'), [])
 * ```
 */
export function NetworkBackground({ className }: NetworkBackgroundProps) {
  const theme = useCreatorStore((s) => s.networkTheme)
  const colors = THEME_COLORS[theme] || THEME_COLORS.ethereum

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-[1] print:hidden', className)}
      aria-hidden="true"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent" />

      {/* Animated gradient blobs */}
      <div
        className={cn(
          'absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl transition-colors duration-700',
          colors.primary
        )}
      />
      <div
        className={cn(
          'absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl transition-colors duration-700',
          colors.secondary
        )}
      />
    </div>
  )
}
