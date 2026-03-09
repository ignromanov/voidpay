/**
 * useBatchCheck — Batch discovery hook for history page
 * Feature: 023-payment-verification, Phase 8 (US7)
 *
 * Checks all pending `source:'created'` invoices (no txHash) sequentially
 * against /api/transfers. If a match is found, calls setTxHash to trigger
 * the verification flow. Processes with 2s delay between requests.
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { matchTransfer } from '../lib/match-transfer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INTER_INVOICE_DELAY_MS = 2_000

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseBatchCheckResult {
  isChecking: boolean
  progress: { checked: number; total: number }
  checkAll: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBatchCheck(): UseBatchCheckResult {
  const invoices = useTrackedInvoiceStore((s) => s.invoices)
  const setTxHash = useTrackedInvoiceStore((s) => s.setTxHash)

  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState<{ checked: number; total: number }>({
    checked: 0,
    total: 0,
  })

  // Abort controller ref — cancelled on unmount or when a new checkAll is called
  const abortRef = useRef<AbortController | null>(null)

  // Abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const checkAll = useCallback(() => {
    // Cancel any in-flight run
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Filter: only pending created invoices (no txHash)
    const pending = invoices.filter(
      (inv) => inv.source === 'created' && !inv.txHash,
    )

    if (pending.length === 0) {
      setIsChecking(false)
      setProgress({ checked: 0, total: 0 })
      return
    }

    setIsChecking(true)
    setProgress({ checked: 0, total: pending.length })

    // Run sequentially via async IIFE
    void (async () => {
      for (let i = 0; i < pending.length; i++) {
        if (controller.signal.aborted) break

        const invoice = pending[i]!

        // Add inter-invoice delay (skip for first)
        if (i > 0) {
          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, INTER_INVOICE_DELAY_MS)
            controller.signal.addEventListener('abort', () => {
              clearTimeout(timer)
              resolve()
            })
          })
        }

        if (controller.signal.aborted) break

        try {
          // Extract hash fragment from stored URL
          if (!invoice.invoiceUrl) continue
          const hashIndex = invoice.invoiceUrl.indexOf('#')
          if (hashIndex < 0) continue
          const hashFragment = invoice.invoiceUrl.substring(hashIndex + 1)

          // Decode invoice to get transfer params
          const decoded = parseInvoiceHash(hashFragment)
          if (!decoded.success) continue

          const inv = decoded.data
          const toAddress = inv.from?.walletAddress
          if (!toAddress) continue

          const category: 'external' | 'erc20' = inv.tokenAddress ? 'erc20' : 'external'
          const exactTotal = BigInt(inv.total ?? '0')

          const response = await fetch('/api/transfers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toAddress,
              chainId: inv.networkId,
              category,
              fromBlock: '0x1',
              ...(inv.tokenAddress ? { contractAddress: inv.tokenAddress } : {}),
            }),
            signal: controller.signal,
          })

          if (response.ok) {
            const data = (await response.json()) as { transfers: Parameters<typeof matchTransfer>[0] }
            const match = matchTransfer(data.transfers, exactTotal)
            if (match) {
              setTxHash(invoice.invoiceId, match.hash, false)
            }
          }
        } catch {
          // Ignore fetch errors (network, abort) — continue with next invoice
        }

        if (!controller.signal.aborted) {
          setProgress((prev) => ({ ...prev, checked: prev.checked + 1 }))
        }
      }

      if (!controller.signal.aborted) {
        setIsChecking(false)
      }
    })()
  }, [invoices, setTxHash])

  return { isChecking, progress, checkAll }
}
