import {
  BaseError,
  UserRejectedRequestError,
  InsufficientFundsError,
  ChainMismatchError,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
  ContractFunctionRevertedError,
  TransactionExecutionError,
} from 'viem'
import type { WithShortMessage } from './types'

// Walks the BaseError cause chain looking for an error matching predicate.
// Falls back to direct predicate check for non-BaseError values.
export function walkCause<T>(err: unknown, predicate: (e: unknown) => e is T): T | null {
  if (err instanceof BaseError) {
    const found = err.walk((e) => predicate(e))
    return (found as T | null) ?? null
  }
  return predicate(err) ? err : null
}

function isUserRejectedType(e: unknown): e is UserRejectedRequestError {
  return e instanceof UserRejectedRequestError
}

function isInsufficientFundsType(e: unknown): e is InsufficientFundsError {
  return e instanceof InsufficientFundsError
}

function isChainMismatchType(e: unknown): e is ChainMismatchError {
  return e instanceof ChainMismatchError
}

function isReceiptNotFoundType(e: unknown): e is TransactionReceiptNotFoundError {
  return e instanceof TransactionReceiptNotFoundError
}

function isReceiptTimeoutType(e: unknown): e is WaitForTransactionReceiptTimeoutError {
  return e instanceof WaitForTransactionReceiptTimeoutError
}

function isContractRevertedType(e: unknown): e is ContractFunctionRevertedError {
  return e instanceof ContractFunctionRevertedError
}

function isTxExecutionRevertedType(e: unknown): e is TransactionExecutionError {
  return (
    e instanceof TransactionExecutionError &&
    e.shortMessage.toLowerCase().includes('reverted')
  )
}

export function isUserRejected(err: unknown): boolean {
  if (walkCause(err, isUserRejectedType) !== null) return true
  // Fallback for stringified/mobile WalletConnect errors that aren't BaseError
  if (err instanceof Error) {
    const lower = (err.message + ((err as unknown as WithShortMessage).shortMessage ?? '')).toLowerCase()
    return (
      err.name.includes('UserRejected') ||
      lower.includes('user rejected') ||
      lower.includes('user denied') ||
      lower.includes('request rejected')
    )
  }
  return false
}

export function isInsufficientFunds(err: unknown): boolean {
  if (walkCause(err, isInsufficientFundsType) !== null) return true
  if (err instanceof Error) {
    const lower = (err.message + ((err as unknown as WithShortMessage).shortMessage ?? '')).toLowerCase()
    // Exclude "insufficient funds for gas" — that's a separate concept
    if (lower.includes('insufficient funds for gas')) return false
    return lower.includes('insufficient funds') || lower.includes('insufficient balance')
  }
  return false
}

export function isChainMismatch(err: unknown): boolean {
  return walkCause(err, isChainMismatchType) !== null
}

export function isReceiptNotFound(err: unknown): boolean {
  return walkCause(err, isReceiptNotFoundType) !== null
}

export function isReceiptTimeout(err: unknown): boolean {
  return walkCause(err, isReceiptTimeoutType) !== null
}

export function isTxReverted(err: unknown): boolean {
  if (walkCause(err, isContractRevertedType) !== null) return true
  if (walkCause(err, isTxExecutionRevertedType) !== null) return true
  if (err instanceof Error) {
    const lower = (err.message + ((err as unknown as WithShortMessage).shortMessage ?? '')).toLowerCase()
    return lower.includes('reverted')
  }
  return false
}
