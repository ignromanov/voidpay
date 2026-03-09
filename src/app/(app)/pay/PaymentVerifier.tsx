'use client'

import { Web3Provider } from '@/features/wallet-connect/providers'
import { usePaymentVerification, useFinalizationTracker } from '@/features/payment'
import type { Invoice } from '@/shared/lib/invoice-types'

interface PaymentVerifierProps {
  invoice: Invoice
  invoiceId: string
  txHash: `0x${string}`
  exactTotal: string
}

/**
 * Headless verification effect — runs both hooks inside Web3Provider:
 * 1. usePaymentVerification — receipt check + soft block confirmations
 * 2. useFinalizationTracker — background deep finalization + reorg detection
 * Writes results to TrackedInvoiceStore. Renders nothing visible.
 */
function VerificationEffect(props: PaymentVerifierProps) {
  usePaymentVerification(props)
  useFinalizationTracker({
    invoiceId: props.invoiceId,
    txHash: props.txHash,
    networkId: props.invoice.networkId,
  })
  return null
}

/**
 * PaymentVerifier — Scoped Web3 wrapper for payment verification.
 *
 * Loaded via next/dynamic with ssr:false. Mounts only when txHash
 * is available. Runs receipt verification + block confirmation counting
 * and writes results to the TrackedInvoiceStore.
 */
export function PaymentVerifier(props: PaymentVerifierProps) {
  return (
    <Web3Provider>
      <VerificationEffect {...props} />
    </Web3Provider>
  )
}
