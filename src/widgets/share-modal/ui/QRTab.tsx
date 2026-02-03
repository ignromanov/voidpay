'use client'

import dynamic from 'next/dynamic'
import { DownloadIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { downloadQRCode } from '../lib/download-qr'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((m) => m.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="h-64 w-64 animate-pulse rounded-lg bg-zinc-800" />,
})

// QR code logo settings (VoidPay black hole)
const QR_LOGO_SETTINGS = {
  src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ4IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjM0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3QzNBRUQiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdDM0FFRCIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9IjAuNyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMxIiBmaWxsPSIjMDkwOTBCIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjIiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=',
  height: 40,
  width: 40,
  excavate: true,
} as const

interface QRTabProps {
  /** URL to encode in QR */
  url: string
}

/**
 * QR code tab with download functionality
 */
export function QRTab({ url }: QRTabProps) {
  return (
    <motion.div
      key="qr-tab"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center justify-center space-y-4 py-4"
    >
      {/* QR code with white background and VoidPay logo */}
      <div data-qr-code className="w-full max-w-[300px] rounded-xl bg-white p-4 shadow-2xl">
        <QRCodeSVG
          value={url}
          size={268}
          level="H" // High error correction allows logo overlay
          marginSize={1}
          className="h-auto w-full"
          imageSettings={QR_LOGO_SETTINGS}
        />
      </div>
      <Text variant="tiny" className="max-w-xs text-center text-zinc-400">
        Show this QR to your client — they can scan and pay from their phone.
      </Text>
      <Button variant="secondary" size="sm" onClick={() => downloadQRCode()}>
        <DownloadIcon size={16} className="mr-1.5" /> Download QR
      </Button>
    </motion.div>
  )
}
