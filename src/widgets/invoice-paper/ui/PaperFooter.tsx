import React from 'react'

interface PaperFooterProps {
  notes?: string | undefined
}

export const PaperFooter = React.memo<PaperFooterProps>(({ notes }) => {
  return (
    <footer
      className="mt-6 border-t border-zinc-200 pt-4"
      role="contentinfo"
      aria-label="Invoice footer with notes and branding"
    >
      {/* Row 1: Headers */}
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Notes & Terms</h4>
        <span className="text-xs text-zinc-500">
          Powered by{' '}
          <a
            href="https://voidpay.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-black transition-colors hover:text-violet-600"
          >
            VoidPay
          </a>
        </span>
      </div>

      {/* Row 2: Content */}
      <div className="flex items-baseline justify-between gap-8">
        <p className="max-w-[450px] flex-1 text-xs leading-relaxed whitespace-pre-wrap text-zinc-600">
          {notes ??
            'Thank you for your business. Please ensure the payment is made to the correct wallet address as transactions are irreversible.'}
        </p>
        <span className="flex-shrink-0 text-[10px] tracking-wide text-zinc-400">
          Stateless. Private. Yours.
        </span>
      </div>
    </footer>
  )
})

PaperFooter.displayName = 'PaperFooter'
