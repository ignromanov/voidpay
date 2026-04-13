import { describe, it, expect } from 'vitest'
import {
  BaseError,
  UserRejectedRequestError,
  InsufficientFundsError,
  ChainMismatchError,
  ContractFunctionRevertedError,
  WaitForTransactionReceiptTimeoutError,
  TransactionReceiptNotFoundError,
} from 'viem'
import { classifyPaymentError } from '../classify-error'

// Helper: wrap a BaseError in another BaseError via .cause
function wrapInBase(cause: BaseError, message = 'wrapper'): BaseError {
  const wrapper = new BaseError(message)
  ;(wrapper as unknown as { cause: BaseError }).cause = cause
  return wrapper
}

type ChainMismatchCtorArgs = ConstructorParameters<typeof ChainMismatchError>[0]
const minimalChain = { id: 1, name: 'Ethereum' } as ChainMismatchCtorArgs['chain']

const MOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000001' as const

// ---- USER_REJECTED -----------------------------------------------------------

describe('classifyPaymentError — USER_REJECTED', () => {
  it('direct UserRejectedRequestError → USER_REJECTED', () => {
    const err = new UserRejectedRequestError(new Error('x'))
    expect(classifyPaymentError(err)).toBe('USER_REJECTED')
  })

  it('UserRejectedRequestError wrapped in BaseError → USER_REJECTED', () => {
    const inner = new UserRejectedRequestError(new Error('inner'))
    const wrapped = wrapInBase(inner)
    expect(classifyPaymentError(wrapped)).toBe('USER_REJECTED')
  })

  it('Error with name UserRejectedRequestError → USER_REJECTED', () => {
    const err = new Error('something')
    err.name = 'UserRejectedRequestError'
    expect(classifyPaymentError(err)).toBe('USER_REJECTED')
  })

  it('Error with message "user rejected the request" → USER_REJECTED', () => {
    expect(classifyPaymentError(new Error('user rejected the request'))).toBe('USER_REJECTED')
  })

  it('Error with message "User denied transaction" → USER_REJECTED', () => {
    expect(classifyPaymentError(new Error('User denied transaction'))).toBe('USER_REJECTED')
  })

  it('wrapped UserRejectedRequestError inside SwitchChainError → USER_REJECTED (not NETWORK_SWITCH_FAILED)', () => {
    const inner = new UserRejectedRequestError(new Error('inner'))
    const wrapped = wrapInBase(inner, 'SwitchChainError')
    expect(classifyPaymentError(wrapped)).toBe('USER_REJECTED')
  })
})

// ---- INSUFFICIENT_GAS --------------------------------------------------------

describe('classifyPaymentError — INSUFFICIENT_GAS', () => {
  it('"insufficient funds for gas" → INSUFFICIENT_GAS', () => {
    expect(classifyPaymentError(new Error('insufficient funds for gas'))).toBe('INSUFFICIENT_GAS')
  })

  it('shortMessage "insufficient funds for gas" → INSUFFICIENT_GAS', () => {
    const err = new BaseError('outer') as BaseError & { shortMessage: string }
    err.shortMessage = 'insufficient funds for gas'
    expect(classifyPaymentError(err)).toBe('INSUFFICIENT_GAS')
  })
})

// ---- INSUFFICIENT_FUNDS ------------------------------------------------------

describe('classifyPaymentError — INSUFFICIENT_FUNDS', () => {
  it('InsufficientFundsError → INSUFFICIENT_FUNDS', () => {
    const err = new InsufficientFundsError()
    expect(classifyPaymentError(err)).toBe('INSUFFICIENT_FUNDS')
  })

  it('InsufficientFundsError wrapped in BaseError → INSUFFICIENT_FUNDS', () => {
    const inner = new InsufficientFundsError()
    const wrapped = wrapInBase(inner)
    expect(classifyPaymentError(wrapped)).toBe('INSUFFICIENT_FUNDS')
  })

  it('"insufficient balance" string → INSUFFICIENT_FUNDS', () => {
    expect(classifyPaymentError(new Error('insufficient balance'))).toBe('INSUFFICIENT_FUNDS')
  })
})

// ---- TX_REVERTED -------------------------------------------------------------

describe('classifyPaymentError — TX_REVERTED', () => {
  it('ContractFunctionRevertedError → TX_REVERTED', () => {
    const err = new ContractFunctionRevertedError({ abi: [], functionName: 'transfer' })
    expect(classifyPaymentError(err)).toBe('TX_REVERTED')
  })

  it('"reverted" in message → TX_REVERTED', () => {
    expect(classifyPaymentError(new Error('transaction reverted'))).toBe('TX_REVERTED')
  })
})

// ---- RPC_ERROR ---------------------------------------------------------------

describe('classifyPaymentError — RPC_ERROR', () => {
  it('WaitForTransactionReceiptTimeoutError → RPC_ERROR', () => {
    const err = new WaitForTransactionReceiptTimeoutError({ hash: MOCK_HASH })
    expect(classifyPaymentError(err)).toBe('RPC_ERROR')
  })

  it('TransactionReceiptNotFoundError → RPC_ERROR', () => {
    const err = new TransactionReceiptNotFoundError({ hash: MOCK_HASH })
    expect(classifyPaymentError(err)).toBe('RPC_ERROR')
  })

  it('"rpc" in message → RPC_ERROR', () => {
    expect(classifyPaymentError(new Error('rpc error occurred'))).toBe('RPC_ERROR')
  })

  it('"network" in message → RPC_ERROR', () => {
    expect(classifyPaymentError(new Error('network unreachable'))).toBe('RPC_ERROR')
  })

  it('"timeout" in message → RPC_ERROR', () => {
    expect(classifyPaymentError(new Error('request timeout'))).toBe('RPC_ERROR')
  })
})

// ---- NETWORK_SWITCH_FAILED ---------------------------------------------------

describe('classifyPaymentError — NETWORK_SWITCH_FAILED', () => {
  it('ChainMismatchError → NETWORK_SWITCH_FAILED', () => {
    const err = new ChainMismatchError({ chain: minimalChain, currentChainId: 137 })
    expect(classifyPaymentError(err)).toBe('NETWORK_SWITCH_FAILED')
  })

  it('ChainMismatchError (different current chain) → NETWORK_SWITCH_FAILED', () => {
    const err = new ChainMismatchError({ chain: minimalChain, currentChainId: 10 })
    expect(classifyPaymentError(err)).toBe('NETWORK_SWITCH_FAILED')
  })
})

// ---- UNKNOWN (behavioral change) --------------------------------------------

describe('classifyPaymentError — UNKNOWN', () => {
  it('plain unknown error → UNKNOWN (no longer NETWORK_SWITCH_FAILED fallback)', () => {
    expect(classifyPaymentError(new Error('totally unknown'))).toBe('UNKNOWN')
  })

  it('plain unknown error with generic message → UNKNOWN', () => {
    expect(classifyPaymentError(new Error('some weird error'))).toBe('UNKNOWN')
  })

  it('empty error message → UNKNOWN', () => {
    expect(classifyPaymentError(new Error(''))).toBe('UNKNOWN')
  })
})
