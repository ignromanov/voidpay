import { useState } from 'react'
import { getAddress } from 'viem'
import { usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { verifyNativeReceipt, verifyErc20Receipt } from './verify-receipt'

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

  const { invoices, setTxHash } = useTrackedInvoiceStore((s) => ({
    invoices: (s as { invoices: Array<{ invoiceId: string; txHash?: string }> }).invoices,
    setTxHash: (s as { setTxHash: (id: string, hash: string, validated: boolean) => void }).setTxHash,
  })) as { invoices: Array<{ invoiceId: string; txHash?: string }>; setTxHash: (id: string, hash: string, validated: boolean) => void }

  const verify = async (txHash: string): Promise<void> => {
    setError(undefined)
    setResult(undefined)

    // FR-030: format validation first — before any network call
    if (!TX_HASH_REGEX.test(txHash)) {
      setError('Invalid transaction hash format')
      return
    }

    // W3-006: uniqueness check — reject if linked to a different invoice
    const alreadyLinked = invoices.some(
      (inv) => inv.txHash === txHash && inv.invoiceId !== invoiceId,
    )
    if (alreadyLinked) {
      setError('Transaction hash is already linked to another invoice')
      return
    }

    setIsLoading(true)
    try {
      const hash = txHash as `0x${string}`

      // W3-007: fetch receipt on the invoice's networkId only
      const receipt = await publicClient!.getTransactionReceipt({ hash })

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
        const tx = await publicClient!.getTransaction({ hash })

        const normalizedTxTo = tx.to ? getAddress(tx.to) : null
        const normalizedRecipient = getAddress(recipient)

        if (normalizedTxTo !== normalizedRecipient) {
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
  }

  const ret: UseManualVerifyResult = { verify, isLoading }
  if (result !== undefined) ret.result = result
  if (error !== undefined) ret.error = error
  return ret
}
