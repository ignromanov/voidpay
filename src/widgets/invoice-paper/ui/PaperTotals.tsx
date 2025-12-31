import React from 'react'
import { Totals } from '../lib/calculate-totals'
import { InvoicePaperVariant, InvoiceStatus } from '../types'
import { PaymentInfo } from './PaymentInfo'
import { TotalsSection } from './TotalsSection'

interface PaperTotalsProps {
  totals: Totals
  currency: string
  taxPercent?: string | undefined
  discountPercent?: string | undefined
  showMagicDust?: boolean
  showQR?: boolean
  invoiceUrl?: string
  // Payment details props
  networkId: number
  senderAddress?: string | undefined
  tokenAddress?: string | undefined
  txHash?: string | undefined
  txHashValidated?: boolean | undefined
  variant?: InvoicePaperVariant
  /** Invoice status - affects QR visibility */
  status?: InvoiceStatus
}

export const PaperTotals = React.memo<PaperTotalsProps>(
  ({
    totals,
    currency,
    taxPercent,
    discountPercent,
    showMagicDust = true,
    showQR = true,
    invoiceUrl,
    networkId,
    senderAddress,
    tokenAddress,
    txHash,
    txHashValidated = true,
    variant = 'default',
    status,
  }) => {
    return (
      <section className="border-t-2 border-zinc-700 pt-4">
        <div className="flex items-start gap-4">
          <PaymentInfo
            networkId={networkId}
            senderAddress={senderAddress}
            currency={currency}
            tokenAddress={tokenAddress}
            txHash={txHash}
            txHashValidated={txHashValidated}
            invoiceUrl={invoiceUrl}
            showQR={showQR}
            variant={variant}
            status={status}
          />

          <TotalsSection
            totals={totals}
            currency={currency}
            taxPercent={taxPercent}
            discountPercent={discountPercent}
            showMagicDust={showMagicDust}
          />
        </div>
      </section>
    )
  }
)

PaperTotals.displayName = 'PaperTotals'
