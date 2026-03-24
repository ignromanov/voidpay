'use client'

import { LinkIcon, QrCodeIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'
import type { ShareTab } from '../lib/types'

interface TabSwitcherProps {
  activeTab: ShareTab
  onTabChange: (tab: ShareTab) => void
}

/**
 * Segmented control for switching between Link and QR tabs
 */
export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex rounded-lg border border-zinc-800 bg-zinc-950/50 p-1">
      <button
        type="button"
        onClick={() => onTabChange('link')}
        className={cn(
          'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors',
          activeTab === 'link'
            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-300'
        )}
      >
        <LinkIcon size={16} /> Link
      </button>
      <button
        type="button"
        onClick={() => onTabChange('qr')}
        className={cn(
          'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors',
          activeTab === 'qr'
            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-300'
        )}
      >
        <QrCodeIcon size={16} /> QR Code
      </button>
    </div>
  )
}
