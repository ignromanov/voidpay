/**
 * Payment Flow — State Machine + Hook
 *
 * Pure reducer for the payment state machine, plus the
 * usePaymentFlow hook that orchestrates wagmi interactions.
 */

import { useReducer, useCallback, useEffect, useRef } from 'react'
import {
  useAccount,
  useSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useNetworkSwitch, useNetworkMismatch, getNetworkName } from '@/entities/network'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { track, AnalyticsEvent } from '@/features/analytics'
import { classifyPaymentError } from '../lib/classify-error'
import { formatErrorMessage } from '../lib/error-messages'
import { buildNativeTransferParams } from '../lib/send-native'
import { buildErc20TransferParams } from '../lib/send-erc20'
import { deriveIdleSubState, INITIAL_PAYMENT_STATE } from './types'
import type { PaymentState, PaymentAction, PaymentError, PaymentErrorType, PaymentStep, IdleSubState } from './types'
import type { Invoice } from '@/entities/invoice'

// Re-export for convenient imports
export { INITIAL_PAYMENT_STATE }

/**
 * Pure reducer for the payment state machine.
 *
 * Handles all state transitions:
 * - START: Begin payment flow from appropriate step
 * - CONNECTED: Wallet connected, auto-progress to switching
 * - SWITCHED: Network switched, auto-progress to sending
 * - TX_SUBMITTED: Transaction sent, wait for confirmation
 * - CONFIRMED: Transaction confirmed, mark success
 * - ERROR: Reset to idle with error details
 * - RESET: Return to initial state
 */
export function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case 'START':
      if (state.step !== 'idle') return state
      return { ...state, step: action.fromStep, intent: true, error: null }

    case 'CONNECTED':
      if (!state.intent || state.step !== 'connecting') return state
      return { ...state, step: 'switching' }

    case 'SWITCHED':
      if (!state.intent || state.step !== 'switching') return state
      return { ...state, step: 'sending' }

    case 'TX_SUBMITTED':
      if (state.step !== 'sending') return state
      return { ...state, step: 'confirming', txHash: action.hash }

    case 'CONFIRMED':
      if (state.step !== 'confirming') return state
      return { ...state, step: 'success', intent: false }

    case 'ERROR':
      return { ...state, step: 'idle', error: action.error, intent: false, txHash: null }

    case 'RESET':
      return INITIAL_PAYMENT_STATE

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UsePaymentFlowParams {
  invoice: Invoice
  contentHash: string
  exactTotal: string
}

interface UsePaymentFlowReturn {
  step: PaymentStep
  error: PaymentError | null
  txHash: `0x${string}` | null
  handlePay: () => void
  handleCancel: () => void
  idleSubState: IdleSubState
}

/** Build a PaymentError with auto-derived message */
function createPaymentError(
  type: PaymentErrorType,
  step: PaymentStep,
  message?: string,
): PaymentError {
  return { type, message: message ?? formatErrorMessage(type), step }
}

/**
 * Orchestrates the Smart Pay flow using wagmi hooks and the payment reducer.
 *
 * US1: idle:ready -> sending -> confirming -> success
 * US2: idle:disconnected -> connecting -> switching -> sending -> confirming -> success
 * US3: idle:wrong-network -> switching -> sending -> confirming -> success
 */
export function usePaymentFlow({
  invoice,
  contentHash,
  exactTotal,
}: UsePaymentFlowParams): UsePaymentFlowReturn {
  const [state, dispatch] = useReducer(paymentReducer, INITIAL_PAYMENT_STATE)

  const { isConnected } = useAccount()
  const { openConnectModal, connectModalOpen } = useConnectModal()
  const { hasMismatch, expectedChainId } = useNetworkMismatch(invoice.networkId)
  const { switchToChain, isSwitching, error: switchError } = useNetworkSwitch()
  const setTxHash = useTrackedInvoiceStore((s) => s.setTxHash)
  const setError = useTrackedInvoiceStore((s) => s.setError)

  const isNativeToken = !invoice.tokenAddress
  // Stable refs for effect deps (avoid re-triggering when invoice object changes)
  const invoiceTokenAddress = invoice.tokenAddress
  const invoiceWalletAddress = invoice.from.walletAddress

  // Wagmi transaction hooks
  const {
    data: sendHash,
    error: sendError,
    sendTransaction,
    reset: resetSend,
  } = useSendTransaction()

  const {
    data: writeHash,
    error: writeError,
    writeContract,
    reset: resetWrite,
  } = useWriteContract()

  const txHash = sendHash ?? writeHash

  const {
    isSuccess: isReceiptSuccess,
    error: receiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    chainId: invoice.networkId,
  })

  const idleSubState = deriveIdleSubState(isConnected, hasMismatch)

  // Tracks which step's side-effect has been fired (prevents re-triggering)
  const stepFired = useRef<PaymentStep | null>(null)
  // Tracks RainbowKit modal lifecycle (detect close without connecting)
  const modalWasOpen = useRef(false)

  // handleCancel — resets payment flow (e.g. wallet not responding on mobile)
  const handleCancel = useCallback(() => {
    resetSend()
    resetWrite()
    stepFired.current = null
    modalWasOpen.current = false
    dispatch({ type: 'RESET' })
    toast.info('Payment canceled', { duration: 3000 })
  }, [resetSend, resetWrite])

  // handlePay — dispatches START based on wallet state
  const handlePay = useCallback(() => {
    if (state.step !== 'idle') return

    resetSend()
    resetWrite()
    stepFired.current = null
    modalWasOpen.current = false

    if (!isConnected) {
      dispatch({ type: 'START', fromStep: 'connecting' })
      return
    }

    if (hasMismatch) {
      dispatch({ type: 'START', fromStep: 'switching' })
      return
    }

    dispatch({ type: 'START', fromStep: 'sending' })
  }, [state.step, isConnected, hasMismatch, resetSend, resetWrite])

  // Effect: Open RainbowKit connect modal when entering 'connecting' step
  useEffect(() => {
    if (state.step !== 'connecting' || !state.intent || stepFired.current === 'connecting') return
    stepFired.current = 'connecting'

    if (openConnectModal) {
      openConnectModal()
    } else {
      dispatch({ type: 'ERROR', error: createPaymentError('UNKNOWN', 'connecting', 'No wallet provider available') })
    }
  }, [state.step, state.intent, openConnectModal])

  // Effect: Connecting lifecycle — user connected or dismissed modal
  useEffect(() => {
    if (state.step !== 'connecting' || !state.intent) return

    if (connectModalOpen) {
      modalWasOpen.current = true
      return
    }

    // User connected → progress to switching
    if (isConnected) {
      dispatch({ type: 'CONNECTED' })
      return
    }

    // Modal was opened then closed without connecting → reset
    if (modalWasOpen.current) {
      modalWasOpen.current = false
      dispatch({ type: 'RESET' })
    }
  }, [state.step, state.intent, isConnected, connectModalOpen])

  // Effect: Switching — initiate network switch or detect completion
  useEffect(() => {
    if (state.step !== 'switching' || !state.intent) return

    if (stepFired.current !== 'switching') {
      stepFired.current = 'switching'
      switchToChain(expectedChainId)
      return
    }

    if (!isSwitching && !hasMismatch) {
      dispatch({ type: 'SWITCHED' })
    }
  }, [state.step, state.intent, switchToChain, expectedChainId, isSwitching, hasMismatch])

  // Effect: Execute transaction when entering 'sending' step
  useEffect(() => {
    if (state.step !== 'sending' || stepFired.current === 'sending') return
    stepFired.current = 'sending'

    try {
      if (isNativeToken) {
        sendTransaction(buildNativeTransferParams(invoiceWalletAddress, exactTotal))
      } else {
        if (!invoiceTokenAddress) return
        writeContract(buildErc20TransferParams(invoiceTokenAddress, invoiceWalletAddress, exactTotal))
      }
    } catch (err) {
      console.error('[usePaymentFlow] Build params failed:', err)
      dispatch({ type: 'ERROR', error: createPaymentError('INVALID_INVOICE', 'sending') })
    }
  }, [state.step, isNativeToken, invoiceTokenAddress, invoiceWalletAddress, exactTotal, sendTransaction, writeContract])

  // Effect: TX_SUBMITTED when hash arrives
  useEffect(() => {
    if (state.step === 'sending' && txHash) {
      track(AnalyticsEvent.PAY_TX_SENT, {
        network: getNetworkName(invoice.networkId).toLowerCase(),
        token_symbol: invoice.currency ?? 'ETH',
      })
      dispatch({ type: 'TX_SUBMITTED', hash: txHash })
    }
  }, [state.step, txHash, invoice.networkId, invoice.currency])

  // Effect: CONFIRMED when receipt succeeds
  useEffect(() => {
    if (state.step !== 'confirming' || !isReceiptSuccess || !txHash) return

    if (receipt && receipt.status === 'reverted') {
      dispatch({ type: 'ERROR', error: createPaymentError('TX_REVERTED', 'confirming') })
      return
    }

    setTxHash(contentHash, txHash, false)
    dispatch({ type: 'CONFIRMED' })
  }, [state.step, isReceiptSuccess, txHash, receipt, contentHash, setTxHash])

  // Effect: Handle wagmi errors (sticky — cleared by resetSend/resetWrite in handlePay)
  useEffect(() => {
    const wagmiError = sendError ?? writeError ?? receiptError ?? switchError
    if (!wagmiError) return
    if (state.step === 'idle' || state.step === 'success') return

    const errorType = classifyPaymentError(wagmiError, state.step)

    // Always log the original error for debugging
    console.error(`[usePaymentFlow] ${state.step} error (${errorType}):`, wagmiError)

    // User rejected — reset with visible toast, not an error banner
    if (errorType === 'USER_REJECTED') {
      toast.info('Payment canceled', { duration: 4000 })
      dispatch({ type: 'RESET' })
      return
    }

    track(AnalyticsEvent.ERROR_PAYMENT, { error_type: errorType })

    const error = createPaymentError(errorType, state.step)
    setError(contentHash, error.message)
    dispatch({ type: 'ERROR', error })
  }, [sendError, writeError, receiptError, switchError, state.step, contentHash, setError])

  return { step: state.step, error: state.error, txHash: state.txHash, handlePay, handleCancel, idleSubState }
}
