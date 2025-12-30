import React from 'react'
import { APP_URLS } from '@/shared/config'
import { VoidLogo } from '@/shared/ui'

interface PaperFooterProps {
  notes?: string | undefined
}

export const PaperFooter = React.memo<PaperFooterProps>(({ notes }) => {
  return (
    <footer
      className="mt-12 flex items-start justify-between border-t border-dashed border-zinc-300 pt-6"
      role="contentinfo"
      aria-label="Invoice footer with notes and branding"
    >
      {/* Left: Thank you message and notes */}
      <div className="flex-1 pr-12">
        <div>
          <p className="text-sm font-bold text-black">Thank you for your business!</p>
          <p className="mt-1 max-w-[400px] text-xs leading-relaxed text-zinc-500">
            {notes ??
              'Payment is due by the date shown above. Please send the exact amount to the wallet address provided.'}
          </p>
        </div>
      </div>

      {/* Right: VoidPay branding (subtle) */}
      <div className="flex shrink-0 flex-col items-end opacity-50">
        <div className="mb-1 flex items-center gap-1.5">
          <VoidLogo className="h-3 w-3" />
          <a
            href={APP_URLS.base}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold tracking-widest text-zinc-900 uppercase transition-colors hover:text-violet-700"
          >
            Powered by VoidPay
          </a>
        </div>
        <a
          href={APP_URLS.base}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[8px] text-zinc-500 transition-colors hover:text-violet-600"
        >
          Create your own crypto invoice for free.
        </a>
      </div>
    </footer>
  )
})

PaperFooter.displayName = 'PaperFooter'
