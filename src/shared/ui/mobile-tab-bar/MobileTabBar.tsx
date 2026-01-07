'use client'

import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
}

export interface MobileTabBarProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function MobileTabBar({ tabs, activeTab, onTabChange, className }: MobileTabBarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 mx-auto mb-4 flex w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/50 p-1 backdrop-blur-md lg:hidden',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all',
            activeTab === tab.id
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
