'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex items-center gap-3 shadow-xl',
          title: 'text-white font-sans text-sm',
          description: 'text-zinc-400 font-sans text-xs',
          success: 'border-emerald-500/50',
          error: 'border-rose-500/50',
          loading: 'border-violet-500/50',
        },
      }}
      visibleToasts={3}
      richColors={false}
    />
  )
}
