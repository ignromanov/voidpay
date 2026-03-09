import { useEffect, useRef, useState } from 'react'
import { useWaitForTransactionReceipt, useBlockNumber, usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { verifyNativeReceipt, verifyErc20Receipt } from '../lib/verify-receipt'
import type { VerificationResult } from '../lib/verify-receipt'
import { getSoftConfirmations } from '../lib/confirmation-config'
import type { Invoice } from '@/entities/invoice'
import type { ConfirmationProgress } from '@/shared/lib/invoice-types'

export interface UsePaymentVerificationParams {
  invoice: Invoice
  invoiceId: string
  txHash: `0x${string}`
  exactTotal: string
}

export interface UsePaymentVerificationResult {
  isVerifying: boolean
  isConfirming: boolean
  confirmations: ConfirmationProgress | undefined
  error: string | undefined
}

export function usePaymentVerification({
  invoice,
  invoiceId,
  txHash,
  exactTotal,
}: UsePaymentVerificationParams): UsePaymentVerificationResult {
  const chainId = invoice.networkId
  const tokenAddress = invoice.tokenAddress
  const recipientAddress = invoice.from?.walletAddress

  const setValidated = useTrackedInvoiceStore((s) => s.setValidated)
  const setStoreError = useTrackedInvoiceStore((s) => s.setError)
  const setConfirmations = useTrackedInvoiceStore((s) => s.setConfirmations)

  const publicClient = usePublicClient({ chainId })

  const {
    data: receipt,
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
  } = useWaitForTransactionReceipt({ hash: txHash, chainId })

  const { data: currentBlock } = useBlockNumber({ watch: true, chainId })

  // For native tokens: fetch tx value asynchronously, store in state to trigger sync verify effect
  const [nativeTxValue, setNativeTxValue] = useState<bigint | undefined>(undefined)
  const [nativeFetchError, setNativeFetchError] = useState<string | undefined>(undefined)
  const nativeFetchAttempted = useRef(false)

  useEffect(() => {
    if (tokenAddress) return
    if (!isReceiptSuccess || !receipt) return
    if (nativeFetchAttempted.current) return

    if (!publicClient) return

    nativeFetchAttempted.current = true

    publicClient.getTransaction({ hash: txHash }).then(
      (tx) => setNativeTxValue(tx.value),
      (err) => setNativeFetchError(err instanceof Error ? err.message : 'Failed to fetch tx'),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReceiptSuccess, receipt?.blockNumber?.toString()])

  const [verifyDone, setVerifyDone] = useState(false)
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined)
  const [txBlockNumber, setTxBlockNumber] = useState<bigint | undefined>(undefined)
  const [confirmations, setLocalConfirmations] = useState<ConfirmationProgress | undefined>(
    undefined,
  )

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

  // Phase 1a: verify ERC-20 synchronously when receipt arrives
  useEffect(() => {
    if (!erc20Ready || !receipt) return

    const requiredConfirmations = getSoftConfirmations(chainId)
    const receiptBlockNumber = receipt.blockNumber

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
    )

    if (!result.verified) {
      const errorMsg = result.error ?? "Transaction amount doesn't match the expected total"
      setStoreErrorRef.current(invoiceId, errorMsg)
      setVerifyError(errorMsg)
      return
    }

    const current =
      currentBlock !== undefined
        ? Math.max(0, Number(currentBlock - receiptBlockNumber))
        : 0
    const progress: ConfirmationProgress = { current, required: requiredConfirmations }
    setTxBlockNumber(receiptBlockNumber)
    setLocalConfirmations(progress)
    setConfirmationsRef.current(invoiceId, progress)
    setVerifyDone(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20Ready])

  // Phase 1b: verify native synchronously once tx value is fetched
  useEffect(() => {
    if (!nativeReady || !receipt) return

    const requiredConfirmations = getSoftConfirmations(chainId)
    const receiptBlockNumber = receipt.blockNumber

    const result: VerificationResult = verifyNativeReceipt(
      { value: nativeTxValue! },
      BigInt(exactTotal),
    )

    if (!result.verified) {
      const errorMsg = result.error ?? "Transaction amount doesn't match the expected total"
      setStoreErrorRef.current(invoiceId, errorMsg)
      setVerifyError(errorMsg)
      return
    }

    const current =
      currentBlock !== undefined
        ? Math.max(0, Number(currentBlock - receiptBlockNumber))
        : 0
    const progress: ConfirmationProgress = { current, required: requiredConfirmations }
    setTxBlockNumber(receiptBlockNumber)
    setLocalConfirmations(progress)
    setConfirmationsRef.current(invoiceId, progress)
    setVerifyDone(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeReady, nativeTxValue])

  // Phase 1c: propagate native fetch error to store
  useEffect(() => {
    if (!nativeFetchError) return
    setStoreErrorRef.current(invoiceId, nativeFetchError)
    setVerifyError(nativeFetchError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeFetchError])

  // Phase 2: count block confirmations after verification passes
  useEffect(() => {
    if (!verifyDone || txBlockNumber === undefined || currentBlock === undefined) return

    const requiredConfirmations = getSoftConfirmations(chainId)
    const current = Math.max(0, Number(currentBlock - txBlockNumber))
    const progress: ConfirmationProgress = { current, required: requiredConfirmations }

    setLocalConfirmations(progress)
    setConfirmationsRef.current(invoiceId, progress)

    if (current >= requiredConfirmations) {
      setValidatedRef.current(invoiceId, true)
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
