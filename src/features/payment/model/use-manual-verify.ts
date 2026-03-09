import { useState, useCallback } from 'react'
import { isAddressEqual } from 'viem'
import type { Address } from 'viem'
import { usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { verifyNativeReceipt, verifyErc20Receipt } from '../lib/verify-receipt'

export interface UseManualVerifyParams {
  invoiceId: string
  networkId: number
  recipient: string
  exactTotal: bigint
  tokenAddress?: string
}

export interface ManualVerifyResult {
  verified: boolean
  actualAmount: bigint
  expectedAmount: bigint
}

export interface UseManualVerifyResult {
  verify: (txHash: string) => Promise<void>
  isLoading: boolean
  result?: ManualVerifyResult
  error?: string
}

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/

export function useManualVerify({
  invoiceId,
  networkId,
  recipient,
  exactTotal,
  tokenAddress,
}: UseManualVerifyParams): UseManualVerifyResult {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ManualVerifyResult | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const publicClient = usePublicClient({ chainId: networkId })

  const setTxHash = useTrackedInvoiceStore((s) => s.setTxHash)

  const verify = useCallback(async (txHash: string): Promise<void> => {
    setError(undefined)
    setResult(undefined)

    // FR-030: format validation first — before any network call
    if (!TX_HASH_REGEX.test(txHash)) {
      setError('Invalid transaction hash format')
      return
    }

    // W3-006: uniqueness check — reject if linked to a different invoice
    const alreadyLinked = useTrackedInvoiceStore.getState().invoices.some(
      (inv) => inv.txHash === txHash && inv.invoiceId !== invoiceId,
    )
    if (alreadyLinked) {
      setError('Transaction hash is already linked to another invoice')
      return
    }

    if (!publicClient) {
      setError('No wallet client available for this network')
      return
    }

    setIsLoading(true)
    try {
      const hash = txHash as `0x${string}`

      // W3-007: fetch receipt on the invoice's networkId only
      const receipt = await publicClient.getTransactionReceipt({ hash })

      if (!receipt) {
        setError('Transaction is still pending')
        return
      }

      let verifyResult: { verified: boolean; actualAmount: bigint; expectedAmount: bigint; error?: string }

      if (tokenAddress) {
        // ERC-20: verify via logs, skip tx.to recipient check (tx.to is the token contract)
        const erc20Receipt = {
          logs: receipt.logs as Array<{
            address: `0x${string}`
            topics: [`0x${string}`, ...`0x${string}`[]]
            data: `0x${string}`
          }>,
        }
        verifyResult = verifyErc20Receipt(erc20Receipt, tokenAddress, recipient, exactTotal)
      } else {
        // Native: fetch tx for value, then check recipient (FR-033)
        const tx = await publicClient.getTransaction({ hash })

        if (!tx.to || !isAddressEqual(tx.to as Address, recipient as Address)) {
          setError('Transaction recipient address does not match invoice recipient')
          return
        }

        verifyResult = verifyNativeReceipt({ value: tx.value }, exactTotal)
      }

      const finalResult: ManualVerifyResult = {
        verified: verifyResult.verified,
        actualAmount: verifyResult.actualAmount,
        expectedAmount: verifyResult.expectedAmount,
      }

      setResult(finalResult)

      if (verifyResult.verified) {
        setTxHash(invoiceId, hash, false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }, [invoiceId, recipient, exactTotal, tokenAddress, publicClient, setTxHash])

  const ret: UseManualVerifyResult = { verify, isLoading }
  if (result !== undefined) ret.result = result
  if (error !== undefined) ret.error = error
  return ret
}
