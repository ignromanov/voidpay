'use client'

import { Toaster as SonnerToaster } from 'sonner'
import { CheckCircle2, XCircle, Loader2, Info } from 'lucide-react'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      className="!z-[9999] print:hidden"
      style={{ bottom: '50px' }}
      gap={12}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        error: <XCircle className="h-5 w-5 text-rose-400" />,
        loading: <Loader2 className="h-5 w-5 animate-spin text-violet-400" />,
        info: <Info className="h-5 w-5 text-blue-400" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group pointer-events-auto bg-zinc-800/80 border border-zinc-600/50 rounded-xl p-4 flex items-center gap-3 shadow-xl backdrop-blur-md transition-all hover:border-zinc-500 hover:bg-zinc-700/80',
          title: 'text-white font-sans text-sm font-medium',
          description: 'text-zinc-400 font-sans text-xs mt-1',
          success: 'border-emerald-500/40',
          error: 'border-rose-500/40',
          loading: 'border-violet-500/40',
          info: 'border-blue-500/40',
          closeButton:
            'cursor-pointer bg-zinc-700/50 border border-zinc-600/50 hover:bg-zinc-600/60 text-zinc-300 hover:text-zinc-100 rounded-md transition-all',
        },
      }}
      visibleToasts={3}
      richColors={false}
      closeButton
      duration={4000}
    />
  )
}
