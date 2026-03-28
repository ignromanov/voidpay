'use client'

import { Web3Provider } from '@/features/wallet-connect/providers'
import { SmartPayButton } from '@/features/payment'
import type { SmartPayButtonProps } from '@/features/payment'

/**
 * PayButton — Scoped Web3 wrapper for SmartPayButton.
 *
 * Loaded via next/dynamic with ssr:false so the rest of PayWorkspace
 * (InvoicePaper, PaymentPanel shell) renders immediately while
 * wagmi/rainbowkit load in the background.
 */
export function PayButton(props: SmartPayButtonProps) {
  return (
    <Web3Provider>
      <SmartPayButton {...props} />
    </Web3Provider>
  )
}
