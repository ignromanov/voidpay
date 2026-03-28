'use client'

import { QRCodeSVG } from 'qrcode.react'
import { DownloadIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { track, AnalyticsEvent } from '@/features/analytics'
import { downloadQRCode } from '../lib/download-qr'

interface QRTabProps {
  /** VoidPay invoice URL to encode in QR */
  url: string
}

/**
 * QR code tab with VoidPay link and download functionality.
 * Used in ShareModal — encodes the shareable /pay URL, not EIP-681.
 */
export function QRTab({ url }: QRTabProps) {
  return (
    <motion.div
      key="qr-tab"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center justify-center space-y-4 py-4"
    >
      <div data-qr-code className="w-full max-w-[300px] rounded-xl bg-white p-4 shadow-2xl">
        <QRCodeSVG
          value={url}
          size={268}
          level="M"
          className="h-auto w-full"
        />
      </div>
      <Text variant="tiny" className="max-w-xs text-center text-zinc-400">
        Scan to open invoice in browser
      </Text>
      <Button variant="secondary" size="sm" onClick={() => { track(AnalyticsEvent.SHARE_QR_DOWNLOAD); downloadQRCode() }}>
        <DownloadIcon size={16} className="mr-1.5" /> Download QR
      </Button>
    </motion.div>
  )
}
