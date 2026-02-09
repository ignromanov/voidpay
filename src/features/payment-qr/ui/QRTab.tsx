'use client'

import { DownloadIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { PaymentQR } from './PaymentQR'
import { downloadQRCode } from '../lib/download-qr'
import type { Invoice } from '@/shared/lib/invoice-types'

interface QRTabProps {
  /** Invoice data for EIP-681 URI generation */
  invoice: Invoice
}

/**
 * QR code tab with EIP-681 payment URI and download functionality.
 * Used in ShareModal for /create flow.
 */
export function QRTab({ invoice }: QRTabProps) {
  return (
    <motion.div
      key="qr-tab"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center justify-center space-y-4 py-4"
    >
      {/* QR code with white background and VoidPay logo */}
      <div data-qr-code className="w-full max-w-[300px] rounded-xl bg-white p-4 shadow-2xl">
        <PaymentQR
          recipientAddress={invoice.from.walletAddress}
          chainId={invoice.networkId}
          amount={invoice.total}
          tokenAddress={invoice.tokenAddress}
          size={268}
          variant="light"
          showLogo
          className="h-auto w-full"
        />
      </div>
      <Text variant="tiny" className="max-w-xs text-center text-zinc-400">
        Scan with your mobile wallet to pay
      </Text>
      <Button variant="secondary" size="sm" onClick={() => downloadQRCode()}>
        <DownloadIcon size={16} className="mr-1.5" /> Download QR
      </Button>
    </motion.div>
  )
}
