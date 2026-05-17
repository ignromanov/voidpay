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
  /** Total amount in atomic units for PaymentQR URI generation */
  amount?: string | undefined
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
    amount,
    networkId,
    senderAddress,
    tokenAddress,
    txHash,
    txHashValidated = true,
    variant = 'default',
    status,
  }) => {
    return (
      <section className="border-t-2 border-zinc-700 pt-4 overflow-hidden">
        <div className="flex items-start gap-8 overflow-hidden">
          <PaymentInfo
            networkId={networkId}
            senderAddress={senderAddress}
            currency={currency}
            tokenAddress={tokenAddress}
            txHash={txHash}
            txHashValidated={txHashValidated}
            amount={amount}

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
