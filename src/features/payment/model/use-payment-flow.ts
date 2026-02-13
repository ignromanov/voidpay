/**
 * Payment Flow — State Machine + Hook
 *
 * Pure reducer for the payment state machine, plus the
 * usePaymentFlow hook that orchestrates wagmi interactions.
 */

import { useReducer, useCallback, useEffect, useRef } from 'react'
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useNetworkSwitch, useNetworkMismatch } from '@/entities/network'
import { useRichInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { classifyPaymentError } from '../lib/classify-error'
import { formatErrorMessage } from '../lib/error-messages'
import { buildNativeTransferParams } from '../lib/send-native'
import { buildErc20TransferParams } from '../lib/send-erc20'
import { deriveIdleSubState, INITIAL_PAYMENT_STATE } from './types'
import type { PaymentState, PaymentAction, PaymentError, IdleSubState } from './types'
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
  invoiceId: string
  exactTotal: string
}

interface UsePaymentFlowReturn {
  state: PaymentState
  handlePay: () => void
  idleSubState: IdleSubState
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
  invoiceId,
  exactTotal,
}: UsePaymentFlowParams): UsePaymentFlowReturn {
  const [state, dispatch] = useReducer(paymentReducer, INITIAL_PAYMENT_STATE)

  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { hasMismatch, expectedChainId } = useNetworkMismatch(invoice.networkId)
  const { switchToChain, isSwitching, error: switchError } = useNetworkSwitch()
  const { setTxHash, setError } = useRichInvoiceStore()

  const isNativeToken = !invoice.tokenAddress

  // Wagmi transaction hooks
  const {
    data: sendHash,
    error: sendError,
    sendTransaction,
  } = useSendTransaction()

  const {
    data: writeHash,
    error: writeError,
    writeContract,
  } = useWriteContract()

  const txHash = sendHash ?? writeHash

  const {
    isSuccess: isReceiptSuccess,
    error: receiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  })

  const idleSubState = deriveIdleSubState(isConnected, hasMismatch)

  // Track whether we initiated operations to avoid re-firing
  const sendInitiated = useRef(false)
  const connectInitiated = useRef(false)
  const switchInitiated = useRef(false)

  // handlePay — dispatches START based on wallet state
  const handlePay = useCallback(() => {
    if (state.step !== 'idle') return

    sendInitiated.current = false
    connectInitiated.current = false
    switchInitiated.current = false

    if (!isConnected) {
      dispatch({ type: 'START', fromStep: 'connecting' })
      return
    }

    if (hasMismatch) {
      dispatch({ type: 'START', fromStep: 'switching' })
      return
    }

    dispatch({ type: 'START', fromStep: 'sending' })
  }, [state.step, isConnected, hasMismatch])

  // Effect: Trigger wallet connection when entering 'connecting' step
  useEffect(() => {
    if (state.step !== 'connecting' || !state.intent || connectInitiated.current) return
    connectInitiated.current = true

    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }, [state.step, state.intent, connect, connectors])

  // Effect: Auto-progress from connecting → switching when wallet connects
  useEffect(() => {
    if (state.step !== 'connecting' || !state.intent || !isConnected) return
    connectInitiated.current = false
    dispatch({ type: 'CONNECTED' })
  }, [state.step, state.intent, isConnected])

  // Effect: Trigger network switch when entering 'switching' step
  useEffect(() => {
    if (state.step !== 'switching' || !state.intent || switchInitiated.current) return
    switchInitiated.current = true

    switchToChain(expectedChainId)
  }, [state.step, state.intent, switchToChain, expectedChainId])

  // Effect: Auto-progress from switching → sending when network switches
  useEffect(() => {
    if (state.step !== 'switching' || !state.intent) return
    if (isSwitching || hasMismatch) return
    switchInitiated.current = false
    dispatch({ type: 'SWITCHED' })
  }, [state.step, state.intent, isSwitching, hasMismatch])

  // Effect: Execute transaction when entering 'sending' step
  useEffect(() => {
    if (state.step !== 'sending' || sendInitiated.current) return
    sendInitiated.current = true

    try {
      if (isNativeToken) {
        const params = buildNativeTransferParams(
          invoice.from.walletAddress,
          exactTotal,
        )
        sendTransaction(params)
      } else {
        const params = buildErc20TransferParams(
          invoice.tokenAddress!,
          invoice.from.walletAddress,
          exactTotal,
        )
        writeContract(params)
      }
    } catch {
      const error: PaymentError = {
        type: 'INVALID_INVOICE',
        message: formatErrorMessage('INVALID_INVOICE'),
        step: 'sending',
      }
      dispatch({ type: 'ERROR', error })
    }
  }, [state.step, isNativeToken, invoice, exactTotal, sendTransaction, writeContract])

  // Effect: TX_SUBMITTED when hash arrives
  useEffect(() => {
    if (state.step === 'sending' && txHash) {
      dispatch({ type: 'TX_SUBMITTED', hash: txHash })
    }
  }, [state.step, txHash])

  // Effect: CONFIRMED when receipt succeeds
  useEffect(() => {
    if (state.step !== 'confirming' || !isReceiptSuccess || !txHash) return

    // Check for reverted receipt
    if (receipt && receipt.status === 'reverted') {
      const error: PaymentError = {
        type: 'TX_REVERTED',
        message: formatErrorMessage('TX_REVERTED'),
        step: 'confirming',
      }
      dispatch({ type: 'ERROR', error })
      return
    }

    // Store txHash and update status
    setTxHash(invoiceId, txHash, false)
    dispatch({ type: 'CONFIRMED' })
  }, [state.step, isReceiptSuccess, txHash, receipt, invoiceId, setTxHash])

  // Effect: Handle transaction errors
  useEffect(() => {
    const wagmiError = sendError ?? writeError ?? receiptError ?? switchError
    if (!wagmiError) return
    if (state.step === 'idle' || state.step === 'success') return

    const errorType = classifyPaymentError(wagmiError, state.step)

    // User rejected — silent reset with toast, not an error state
    if (errorType === 'USER_REJECTED') {
      toast.info('Payment canceled')
      dispatch({ type: 'RESET' })
      return
    }

    const friendlyMessage = formatErrorMessage(errorType)
    const error: PaymentError = {
      type: errorType,
      message: friendlyMessage,
      step: state.step,
    }

    setError(invoiceId, friendlyMessage)
    dispatch({ type: 'ERROR', error })
  }, [sendError, writeError, receiptError, switchError, state.step, invoiceId, setError])

  return { state, handlePay, idleSubState }
}
