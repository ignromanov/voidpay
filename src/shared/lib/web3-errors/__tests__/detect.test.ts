import { describe, it, expect } from 'vitest'
import {
  BaseError,
  UserRejectedRequestError,
  InsufficientFundsError,
  ChainMismatchError,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
  ContractFunctionRevertedError,
} from 'viem'
import {
  isUserRejected,
  isInsufficientFunds,
  isChainMismatch,
  isReceiptNotFound,
  isReceiptTimeout,
  isTxReverted,
  walkCause,
} from '../detect'

// Helper: wrap an error in a BaseError cause chain
function wrapInBase(cause: BaseError, message = 'wrapper'): BaseError {
  const wrapper = new BaseError(message)
  // BaseError.walk() traverses the .cause chain
  ;(wrapper as unknown as { cause: BaseError }).cause = cause
  return wrapper
}

// ---- isUserRejected --------------------------------------------------------

describe('isUserRejected', () => {
  it('returns true for direct UserRejectedRequestError', () => {
    const err = new UserRejectedRequestError(new Error('x'))
    expect(isUserRejected(err)).toBe(true)
  })

  it('returns true when UserRejectedRequestError is wrapped in BaseError', () => {
    const inner = new UserRejectedRequestError(new Error('inner'))
    const wrapped = wrapInBase(inner)
    expect(isUserRejected(wrapped)).toBe(true)
  })

  it('returns true for double-wrapped UserRejectedRequestError', () => {
    const inner = new UserRejectedRequestError(new Error('inner'))
    const mid = wrapInBase(inner, 'mid')
    const outer = wrapInBase(mid, 'outer')
    expect(isUserRejected(outer)).toBe(true)
  })

  it('returns true for plain Error with "user rejected the request" message (fallback)', () => {
    expect(isUserRejected(new Error('user rejected the request'))).toBe(true)
  })

  it('returns true for plain Error with "User denied transaction" message (fallback)', () => {
    expect(isUserRejected(new Error('User denied transaction'))).toBe(true)
  })

  it('returns true for Error with name === "UserRejectedRequestError" (fallback)', () => {
    const err = new Error('something else')
    err.name = 'UserRejectedRequestError'
    expect(isUserRejected(err)).toBe(true)
  })

  it('returns true for plain Error with "request rejected" message (fallback)', () => {
    expect(isUserRejected(new Error('request rejected'))).toBe(true)
  })

  it('returns false for plain Error about insufficient funds', () => {
    expect(isUserRejected(new Error('insufficient funds'))).toBe(false)
  })

  it('returns false for null', () => {
    expect(isUserRejected(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isUserRejected(undefined)).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isUserRejected('user rejected')).toBe(false)
  })

  it('returns false for empty object', () => {
    expect(isUserRejected({})).toBe(false)
  })
})

// ---- isInsufficientFunds ---------------------------------------------------

describe('isInsufficientFunds', () => {
  it('returns true for direct InsufficientFundsError', () => {
    const err = new InsufficientFundsError()
    expect(isInsufficientFunds(err)).toBe(true)
  })

  it('returns true when InsufficientFundsError is wrapped in BaseError', () => {
    const inner = new InsufficientFundsError()
    const wrapped = wrapInBase(inner)
    expect(isInsufficientFunds(wrapped)).toBe(true)
  })

  it('returns true for plain Error "insufficient funds" (fallback)', () => {
    expect(isInsufficientFunds(new Error('insufficient funds'))).toBe(true)
  })

  it('returns true for plain Error "insufficient balance" (fallback)', () => {
    expect(isInsufficientFunds(new Error('insufficient balance'))).toBe(true)
  })

  it('returns false for "insufficient funds for gas" (excluded)', () => {
    expect(isInsufficientFunds(new Error('insufficient funds for gas'))).toBe(false)
  })

  it('returns false for null', () => {
    expect(isInsufficientFunds(null)).toBe(false)
  })

  it('returns false for unrelated error', () => {
    expect(isInsufficientFunds(new Error('network error'))).toBe(false)
  })
})

// ---- isChainMismatch -------------------------------------------------------

describe('isChainMismatch', () => {
  type ChainMismatchCtorArgs = ConstructorParameters<typeof ChainMismatchError>[0]
  const minimalChain = { id: 1, name: 'Ethereum' } as ChainMismatchCtorArgs['chain']

  it('returns true for direct ChainMismatchError', () => {
    const err = new ChainMismatchError({ chain: minimalChain, currentChainId: 137 })
    expect(isChainMismatch(err)).toBe(true)
  })

  it('returns true when ChainMismatchError is wrapped', () => {
    const inner = new ChainMismatchError({ chain: minimalChain, currentChainId: 10 })
    const wrapped = wrapInBase(inner)
    expect(isChainMismatch(wrapped)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isChainMismatch(null)).toBe(false)
  })

  it('returns false for unrelated BaseError', () => {
    expect(isChainMismatch(new BaseError('something'))).toBe(false)
  })
})

// ---- isReceiptNotFound -----------------------------------------------------

describe('isReceiptNotFound', () => {
  it('returns true for direct TransactionReceiptNotFoundError', () => {
    const err = new TransactionReceiptNotFoundError({ hash: '0x0000000000000000000000000000000000000000000000000000000000000001' })
    expect(isReceiptNotFound(err)).toBe(true)
  })

  it('returns true when TransactionReceiptNotFoundError is wrapped', () => {
    const inner = new TransactionReceiptNotFoundError({ hash: '0x0000000000000000000000000000000000000000000000000000000000000002' })
    const wrapped = wrapInBase(inner)
    expect(isReceiptNotFound(wrapped)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isReceiptNotFound(null)).toBe(false)
  })
})

// ---- isReceiptTimeout ------------------------------------------------------

describe('isReceiptTimeout', () => {
  it('returns true for direct WaitForTransactionReceiptTimeoutError', () => {
    const err = new WaitForTransactionReceiptTimeoutError({ hash: '0x0000000000000000000000000000000000000000000000000000000000000003' })
    expect(isReceiptTimeout(err)).toBe(true)
  })

  it('returns true when WaitForTransactionReceiptTimeoutError is wrapped', () => {
    const inner = new WaitForTransactionReceiptTimeoutError({ hash: '0x0000000000000000000000000000000000000000000000000000000000000004' })
    const wrapped = wrapInBase(inner)
    expect(isReceiptTimeout(wrapped)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isReceiptTimeout(null)).toBe(false)
  })
})

// ---- isTxReverted ----------------------------------------------------------

describe('isTxReverted', () => {
  it('returns true for direct ContractFunctionRevertedError', () => {
    const err = new ContractFunctionRevertedError({ abi: [], functionName: 'transfer' })
    expect(isTxReverted(err)).toBe(true)
  })

  it('returns true when ContractFunctionRevertedError is wrapped', () => {
    const inner = new ContractFunctionRevertedError({ abi: [], functionName: 'approve' })
    const wrapped = wrapInBase(inner)
    expect(isTxReverted(wrapped)).toBe(true)
  })

  it('returns true for plain Error with "reverted" (fallback)', () => {
    expect(isTxReverted(new Error('transaction reverted'))).toBe(true)
  })

  it('returns false for null', () => {
    expect(isTxReverted(null)).toBe(false)
  })

  it('returns false for unrelated error', () => {
    expect(isTxReverted(new Error('network timeout'))).toBe(false)
  })
})

// ---- walkCause -------------------------------------------------------------

describe('walkCause', () => {
  it('finds matching error in cause chain', () => {
    const inner = new UserRejectedRequestError(new Error('x'))
    const wrapped = wrapInBase(inner)
    const found = walkCause(wrapped, (e): e is UserRejectedRequestError => e instanceof UserRejectedRequestError)
    expect(found).toBe(inner)
  })

  it('returns null when predicate never matches', () => {
    const err = new BaseError('no match')
    const found = walkCause(err, (e): e is UserRejectedRequestError => e instanceof UserRejectedRequestError)
    expect(found).toBeNull()
  })

  it('returns the value directly when non-BaseError matches predicate', () => {
    const err = new UserRejectedRequestError(new Error('y'))
    const found = walkCause(err, (e): e is UserRejectedRequestError => e instanceof UserRejectedRequestError)
    expect(found).toBe(err)
  })

  it('returns null for null input', () => {
    const found = walkCause(null, (e): e is UserRejectedRequestError => e instanceof UserRejectedRequestError)
    expect(found).toBeNull()
  })
})
