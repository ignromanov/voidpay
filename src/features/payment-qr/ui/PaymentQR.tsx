'use client'

import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCodeIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'
import { buildPaymentUri } from '../lib/build-payment-uri'

/**
 * VoidPay black hole logo — light variant (white outer circle for black-on-white QR)
 */
const QR_LOGO_LIGHT = {
  src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ4IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjM0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3QzNBRUQiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdDM0FFRCIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9IjAuNyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMxIiBmaWxsPSIjMDkwOTBCIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjIiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=',
  excavate: true,
} as const

/**
 * VoidPay black hole logo — dark variant (dark outer circle for white-on-dark QR)
 * The outer circle matches zinc-950 so it blends with the transparent QR background.
 */
const QR_LOGO_DARK = {
  src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ4IiBmaWxsPSIjMDkwOTBCIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdDM0FFRCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN0MzQUVEIiBzdHJva2Utd2lkdGg9IjEuNSIgb3BhY2l0eT0iMC43Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzEiIGZpbGw9IiMwOTA5MEIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMiIgZmlsbD0iIzAwMDAwMCIvPjwvc3ZnPg==',
  excavate: true,
} as const

export interface PaymentQRProps {
  /** Recipient wallet address */
  recipientAddress?: string | undefined
  /** Chain ID (e.g., 1 for Ethereum) */
  chainId?: number | undefined
  /** Total amount in atomic units (bigint string, e.g. "1500000042") */
  amount?: string | undefined
  /** Token contract address (undefined for native tokens like ETH) */
  tokenAddress?: string | undefined
  /** QR code size in pixels @defaultValue 128 */
  size?: number
  /** Color variant: 'light' = black on white, 'dark' = white on transparent @defaultValue 'light' */
  variant?: 'light' | 'dark'
  /** Show VoidPay logo in QR center @defaultValue false */
  showLogo?: boolean
  /** Additional CSS class */
  className?: string
}

export function PaymentQR({
  recipientAddress,
  chainId,
  amount,
  tokenAddress,
  size = 128,
  variant = 'light',
  showLogo = false,
  className,
}: PaymentQRProps) {
  const paymentUri = useMemo(() => {
    if (!recipientAddress || !chainId || !amount) return undefined
    return buildPaymentUri({ recipientAddress, chainId, amount, tokenAddress })
  }, [recipientAddress, chainId, amount, tokenAddress])

  if (!paymentUri) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded',
          variant === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-100',
          className
        )}
        style={{ width: size, height: size }}
        role="img"
        aria-label="QR code unavailable"
        data-testid="payment-qr-placeholder"
      >
        <QrCodeIcon
          size={Math.round(size * 0.35)}
          className={variant === 'dark' ? 'text-zinc-600' : 'text-zinc-300'}
        />
      </div>
    )
  }

  const isDark = variant === 'dark'
  const logoSize = Math.max(24, Math.round(size * 0.15))
  const logoBase = isDark ? QR_LOGO_DARK : QR_LOGO_LIGHT

  return (
    <QRCodeSVG
      value={paymentUri}
      size={size}
      level="H"
      marginSize={1}
      fgColor={isDark ? '#ffffff' : '#000000'}
      bgColor={isDark ? 'transparent' : '#ffffff'}
      {...(showLogo && { imageSettings: { ...logoBase, height: logoSize, width: logoSize } })}
      className={className}
      data-testid="payment-qr"
    />
  )
}
