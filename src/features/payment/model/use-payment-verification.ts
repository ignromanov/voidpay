import { useCallback, useEffect, useRef, useState } from 'react'
import { useWaitForTransactionReceipt, useBlockNumber, usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { verifyNativeReceipt, verifyErc20Receipt } from '../lib/verify-receipt'
import type { VerificationResult } from '../lib/verify-receipt'
import { formatErrorMessage } from '../lib/error-messages'
import { getSoftConfirmations } from '@/entities/network'
import type { Invoice } from '@/entities/invoice'
import type { ConfirmationProgress } from '@/shared/lib/invoice-types'

export interface UsePaymentVerificationParams {
  invoice: Invoice
  contentHash: string
  txHash: `0x${string}`
  exactTotal: string
  enabled?: boolean
}

export interface UsePaymentVerificationResult {
  isVerifying: boolean
  isConfirming: boolean
  confirmations: ConfirmationProgress | undefined
  error: string | undefined
}

export function usePaymentVerification({
  invoice,
  contentHash,
  txHash,
  exactTotal,
  enabled = true,
}: UsePaymentVerificationParams): UsePaymentVerificationResult {
  const chainId = invoice.networkId
  const tokenAddress = invoice.tokenAddress
  const recipientAddress = invoice.from?.walletAddress

  const setValidated = useTrackedInvoiceStore((s) => s.setValidated)
  const setStoreError = useTrackedInvoiceStore((s) => s.setError)
  const setConfirmations = useTrackedInvoiceStore((s) => s.setConfirmations)

  const publicClient = usePublicClient({ chainId })

  const [verifyDone, setVerifyDone] = useState(false)
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined)
  const [txBlockNumber, setTxBlockNumber] = useState<bigint | undefined>(undefined)
  const [confirmations, setLocalConfirmations] = useState<ConfirmationProgress | undefined>(
    undefined,
  )

  const {
    data: receipt,
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
    query: { enabled: enabled !== false },
    onReplaced: (replacement) => {
      // Verification is read-only — we just track the new hash for display continuity.
      // The useWaitForTransactionReceipt hook automatically continues waiting on the new hash.
      // We don't update the store's setTxHash here because use-payment-flow owns that — but
      // usePaymentVerification is called AFTER payment completes, so here we only log and
      // let the internal hash swap happen transparently.
      if (replacement.reason === 'cancelled') {
        console.warn('[usePaymentVerification] Transaction was cancelled during verification')
      }
    },
  })

  // Stop watching blocks once soft-confirmation is reached or verification failed
  const needsBlockWatch = (!verifyDone && !verifyError) || (confirmations !== undefined && confirmations.current < confirmations.required)
  const { data: currentBlock } = useBlockNumber({ watch: true, chainId, query: { enabled: needsBlockWatch && enabled !== false } })

  // For native tokens: fetch tx value + to address asynchronously
  const [nativeTxValue, setNativeTxValue] = useState<bigint | undefined>(undefined)
  const [nativeTxTo, setNativeTxTo] = useState<string | undefined>(undefined)
  const [nativeFetchError, setNativeFetchError] = useState<string | undefined>(undefined)
  const nativeFetchAttempted = useRef(false)
  const receiptBlockStr = receipt?.blockNumber?.toString()

  useEffect(() => {
    if (!enabled) return
    if (tokenAddress) return
    if (!isReceiptSuccess || !receipt) return
    if (nativeFetchAttempted.current) return

    if (!publicClient) return

    nativeFetchAttempted.current = true

    publicClient.getTransaction({ hash: txHash }).then(
      (tx) => { setNativeTxValue(tx.value); setNativeTxTo(tx.to ?? undefined) },
      (err) => {
        // We only reach here if the receipt fetch itself failed — always infra-level.
        // Never expose raw ABI-decoded text to users.
        const friendly = formatErrorMessage('RPC_ERROR')
        console.error('[usePaymentVerification] getTransaction failed:', err)
        setNativeFetchError(friendly)
      },
    )
  }, [enabled, isReceiptSuccess, receiptBlockStr, receipt, publicClient, tokenAddress, txHash])

  // Keep store action refs stable so async callbacks always use the latest
  const setStoreErrorRef = useRef(setStoreError)
  setStoreErrorRef.current = setStoreError
  const setConfirmationsRef = useRef(setConfirmations)
  setConfirmationsRef.current = setConfirmations
  const setValidatedRef = useRef(setValidated)
  setValidatedRef.current = setValidated

  const readyToVerify =
    isReceiptSuccess &&
    !!receipt &&
    !verifyDone &&
    verifyError === undefined &&
    nativeFetchError === undefined

  const nativeReady = readyToVerify && !tokenAddress && nativeTxValue !== undefined
  const erc20Ready = readyToVerify && !!tokenAddress

  // Shared post-verify logic for both ERC-20 and native
  const completeVerification = useCallback((receiptBlockNumber: bigint) => {
    const required = getSoftConfirmations(chainId)
    const current = currentBlock !== undefined
      ? Math.max(0, Number(currentBlock - receiptBlockNumber))
      : 0
    const progress: ConfirmationProgress = { current, required }
    setTxBlockNumber(receiptBlockNumber)
    setLocalConfirmations(progress)
    setConfirmationsRef.current(contentHash, progress)
    setVerifyDone(true)
  }, [chainId, currentBlock, contentHash])

  const handleVerifyError = useCallback((result: VerificationResult) => {
    // result.error is already a user-facing message produced by verifyErc20Receipt /
    // verifyNativeReceipt — not raw viem output. Safe to write directly to the store.
    const errorMsg = result.error ?? "Transaction amount doesn't match the expected total"
    setStoreErrorRef.current(contentHash, errorMsg)
    setVerifyError(errorMsg)
  }, [contentHash])

  // Phase 1a: verify ERC-20 synchronously when receipt arrives
  useEffect(() => {
    if (!enabled) return
    if (!erc20Ready || !receipt) return

    const erc20Receipt = {
      logs: receipt.logs as Array<{
        address: `0x${string}`
        topics: [`0x${string}`, ...`0x${string}`[]]
        data: `0x${string}`
      }>,
    }

    const result: VerificationResult = verifyErc20Receipt(
      erc20Receipt,
      tokenAddress!,
      recipientAddress ?? '',
      BigInt(exactTotal),
      invoice.decimals,
      invoice.currency ?? 'TOKEN',
    )

    if (!result.verified) { handleVerifyError(result); return }
    completeVerification(receipt.blockNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20Ready])

  // Phase 1b: verify native synchronously once tx value is fetched
  useEffect(() => {
    if (!enabled) return
    if (!nativeReady || !receipt) return

    const result: VerificationResult = verifyNativeReceipt(
      { value: nativeTxValue!, to: nativeTxTo },
      recipientAddress ?? '',
      BigInt(exactTotal),
      invoice.decimals,
      invoice.currency ?? 'ETH',
    )

    if (!result.verified) { handleVerifyError(result); return }
    completeVerification(receipt.blockNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeReady, nativeTxValue])

  // Phase 1c: propagate native fetch error to store
  useEffect(() => {
    if (!enabled) return
    if (!nativeFetchError) return
    setStoreErrorRef.current(contentHash, nativeFetchError)
    setVerifyError(nativeFetchError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeFetchError])

  // Phase 2: count block confirmations after verification passes
  useEffect(() => {
    if (!enabled) return
    if (!verifyDone || txBlockNumber === undefined || currentBlock === undefined) return

    const requiredConfirmations = getSoftConfirmations(chainId)
    const current = Math.max(0, Number(currentBlock - txBlockNumber))
    const progress: ConfirmationProgress = { current, required: requiredConfirmations }

    setLocalConfirmations(progress)
    setConfirmationsRef.current(contentHash, progress)

    if (current >= requiredConfirmations) {
      setValidatedRef.current(contentHash, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBlock, verifyDone, txBlockNumber])

  const isVerifying = isReceiptLoading && !isReceiptSuccess
  const isConfirming =
    verifyDone && !!(confirmations && confirmations.current < confirmations.required)

  return {
    isVerifying,
    isConfirming,
    confirmations,
    error: verifyError,
  }
}
