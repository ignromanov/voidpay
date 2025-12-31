'use client'

import { ReactNode } from 'react'
import { PixiBackground } from './PixiBackground'
import type { NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { cn } from '@/shared/lib/utils'

export interface PageLayoutProps {
  /**
   * Network theme for animated background
   * @default 'ethereum'
   */
  theme?: NetworkTheme

  /**
   * Page content
   */
  children: ReactNode

  /**
   * Additional className for content container
   */
  className?: string

  /**
   * Whether to show animated background
   * @default false
   */
  showBackground?: boolean
}

/**
 * PageLayout — Layout wrapper for app pages with NetworkBackground
 *
 * Features:
 * - Static background fallback (zinc-950 with gradients)
 * - Animated PixiBackground on z-[1]
 * - Content container on z-10
 * - Full viewport height without scroll
 *
 * Usage:
 * ```tsx
 * <PageLayout theme="ethereum">
 *   <YourContent />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  theme = 'ethereum',
  children,
  className,
  showBackground = false,
}: PageLayoutProps) {
  return (
    <>
      {/* Layer 0: Static fallback background (hidden on print) */}
      <StaticBackground theme={theme} />

      {/* Layer 1: Animated network background (hidden on print) */}
      {showBackground && (
        <PixiBackground theme={theme} className="fixed inset-0 z-[1] print:hidden" />
      )}

      {/* Layer 10: Page content */}
      <div
        className={cn(
          'fixed inset-0 z-10 flex flex-col overflow-hidden',
          'py-14 px-2',
          'sm:py-14 sm:px-4',
          'lg:py-16',
          'print:static print:p-0 print:overflow-visible',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

/**
 * Static background with theme-aware gradients
 * Shown immediately before PixiBackground loads
 */
function StaticBackground({ theme }: { theme: NetworkTheme }) {
  // Theme-specific accent colors
  const accentColors: Record<NetworkTheme, { primary: string; secondary: string }> = {
    ethereum: { primary: 'bg-violet-600/5', secondary: 'bg-indigo-600/5' },
    arbitrum: { primary: 'bg-blue-600/5', secondary: 'bg-cyan-600/5' },
    optimism: { primary: 'bg-red-600/5', secondary: 'bg-orange-600/5' },
    polygon: { primary: 'bg-purple-600/5', secondary: 'bg-violet-600/5' },
  }

  const colors = accentColors[theme] || accentColors.ethereum

  return (
    <div className="fixed inset-0 z-[0] bg-zinc-950 print:hidden">
      {/* Gradient glow matching network theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent" />
      <div className={cn('absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl', colors.primary)} />
      <div className={cn('absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl', colors.secondary)} />
    </div>
  )
}
