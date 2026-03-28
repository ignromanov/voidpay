'use client'

import { Web3ReadProvider } from '@/features/wallet-connect/providers'
import { usePaymentVerification, useFinalizationTracker } from '@/features/payment'
import type { Invoice } from '@/shared/lib/invoice-types'

interface InvoiceVerifierProps {
  invoice: Invoice
  invoiceId: string
  txHash: `0x${string}`
  exactTotal: string
  onReorgDetected?: (() => void) | undefined
}

function VerificationEffect(props: InvoiceVerifierProps) {
  usePaymentVerification(props)
  useFinalizationTracker({
    invoiceId: props.invoiceId,
    txHash: props.txHash,
    networkId: props.invoice.networkId,
    onReorgDetected: props.onReorgDetected,
  })
  return null
}

/**
 * InvoiceVerifier — Read-only Web3 wrapper for payment verification.
 *
 * Same as PaymentVerifier but uses Web3ReadProvider (no RainbowKit).
 * Only needs publicClient for receipt checks and block confirmations.
 */
export function InvoiceVerifier(props: InvoiceVerifierProps) {
  return (
    <Web3ReadProvider>
      <VerificationEffect {...props} />
    </Web3ReadProvider>
  )
}
