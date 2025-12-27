import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { VoidLogo } from '@/shared/ui/void-logo'

interface PaperFooterProps {
  notes?: string | undefined
}

export const PaperFooter: React.FC<PaperFooterProps> = ({ notes }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://voidpay.xyz'

  return (
    <footer className="mt-auto border-t border-zinc-100 pt-8">
      <div className="flex items-start justify-between gap-8">
        <div className="max-w-[500px] flex-1">
          <h4 className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Notes & Terms
          </h4>
          <p className="text-[11px] leading-relaxed whitespace-pre-wrap text-zinc-600">
            {notes ||
              'Thank you for your business. Please ensure the payment is made to the correct wallet address as transactions are irreversible.'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <VoidLogo className="h-4 text-black" />
            <p className="text-[10px] font-medium text-zinc-400">Stateless. Private. Yours.</p>
          </div>
          <div className="rounded-lg border border-zinc-100 p-1.5 shadow-sm">
            <QRCodeSVG value={currentUrl} size={64} level="M" />
          </div>
        </div>
      </div>
    </footer>
  )
}
