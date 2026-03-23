import { describe, it, expect } from 'vitest'
import { verifyNativeReceipt, verifyErc20Receipt } from '../verify-receipt'

const TRANSFER_EVENT_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const TOKEN_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
const SENDER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const RECIPIENT = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const OTHER_CONTRACT = '0x1234567890123456789012345678901234567890'

function padAddress(address: string): `0x${string}` {
  return `0x000000000000000000000000${address.slice(2).toLowerCase()}` as `0x${string}`
}

function encodeUint256(value: bigint): `0x${string}` {
  return `0x${value.toString(16).padStart(64, '0')}` as `0x${string}`
}

function makeTransferLog(params: {
  address: string
  from: string
  to: string
  amount: bigint
}) {
  return {
    address: params.address as `0x${string}`,
    topics: [
      TRANSFER_EVENT_TOPIC as `0x${string}`,
      padAddress(params.from),
      padAddress(params.to),
    ] as [`0x${string}`, ...`0x${string}`[]],
    data: encodeUint256(params.amount),
  }
}

// ---------------------------------------------------------------------------
// verifyNativeReceipt
// ---------------------------------------------------------------------------

describe('verifyNativeReceipt', () => {
  it('returns verified:true when tx.value matches expectedTotal', () => {
    const amount = 1_000_000_000_000_000_000n // 1 ETH in wei
    const result = verifyNativeReceipt({ value: amount, to: RECIPIENT }, RECIPIENT, amount)
    expect(result.verified).toBe(true)
    expect(result.actualAmount).toBe(amount)
    expect(result.expectedAmount).toBe(amount)
    expect(result.error).toBeUndefined()
  })

  it('returns verified:false with error when amounts do not match', () => {
    const sent = 900_000_000_000_000_000n
    const expected = 1_000_000_000_000_000_000n
    const result = verifyNativeReceipt({ value: sent, to: RECIPIENT }, RECIPIENT, expected)
    expect(result.verified).toBe(false)
    expect(result.actualAmount).toBe(sent)
    expect(result.expectedAmount).toBe(expected)
    expect(result.error).toBeDefined()
    expect(typeof result.error).toBe('string')
  })

  it('returns verified:false when tx.value is zero', () => {
    const expected = 1_000_000_000_000_000_000n
    const result = verifyNativeReceipt({ value: 0n, to: RECIPIENT }, RECIPIENT, expected)
    expect(result.verified).toBe(false)
    expect(result.actualAmount).toBe(0n)
  })

  it('returns verified:false when recipient does not match', () => {
    const amount = 1_000_000_000_000_000_000n
    const result = verifyNativeReceipt({ value: amount, to: OTHER_CONTRACT }, RECIPIENT, amount)
    expect(result.verified).toBe(false)
    expect(result.error).toContain('Recipient mismatch')
  })

  it('returns verified:false when tx has no recipient', () => {
    const amount = 1_000_000_000_000_000_000n
    const result = verifyNativeReceipt({ value: amount }, RECIPIENT, amount)
    expect(result.verified).toBe(false)
    expect(result.error).toBe('Transaction has no recipient')
  })
})

// ---------------------------------------------------------------------------
// verifyErc20Receipt
// ---------------------------------------------------------------------------

describe('verifyErc20Receipt', () => {
  it('returns verified:true when Transfer log matches token, recipient, and amount', () => {
    const amount = 1_000_000n // 1 USDC (6 decimals)
    const log = makeTransferLog({
      address: TOKEN_ADDRESS,
      from: SENDER,
      to: RECIPIENT,
      amount,
    })
    const result = verifyErc20Receipt(
      { logs: [log] },
      TOKEN_ADDRESS,
      RECIPIENT,
      amount,
    )
    expect(result.verified).toBe(true)
    expect(result.actualAmount).toBe(amount)
    expect(result.expectedAmount).toBe(amount)
    expect(result.error).toBeUndefined()
  })

  it('ignores Transfer logs from other contracts (W3-005: strict tokenAddress filter)', () => {
    const amount = 1_000_000n
    const logFromOtherContract = makeTransferLog({
      address: OTHER_CONTRACT, // wrong contract
      from: SENDER,
      to: RECIPIENT,
      amount,
    })
    const result = verifyErc20Receipt(
      { logs: [logFromOtherContract] },
      TOKEN_ADDRESS,
      RECIPIENT,
      amount,
    )
    expect(result.verified).toBe(false)
  })

  it('returns verified:false when recipient does not match', () => {
    const amount = 1_000_000n
    const wrongRecipient = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    const log = makeTransferLog({
      address: TOKEN_ADDRESS,
      from: SENDER,
      to: wrongRecipient, // log goes to wrong address
      amount,
    })
    const result = verifyErc20Receipt(
      { logs: [log] },
      TOKEN_ADDRESS,
      RECIPIENT, // expected recipient differs
      amount,
    )
    expect(result.verified).toBe(false)
  })

  it('returns verified:false when transferred amount does not match (exact BigInt comparison)', () => {
    const sent = 999_999n
    const expected = 1_000_000n
    const log = makeTransferLog({
      address: TOKEN_ADDRESS,
      from: SENDER,
      to: RECIPIENT,
      amount: sent,
    })
    const result = verifyErc20Receipt(
      { logs: [log] },
      TOKEN_ADDRESS,
      RECIPIENT,
      expected,
    )
    expect(result.verified).toBe(false)
    expect(result.actualAmount).toBe(sent)
    expect(result.expectedAmount).toBe(expected)
  })

  it('returns verified:true on exact BigInt match', () => {
    const amount = 123_456_789n
    const log = makeTransferLog({
      address: TOKEN_ADDRESS,
      from: SENDER,
      to: RECIPIENT,
      amount,
    })
    const result = verifyErc20Receipt(
      { logs: [log] },
      TOKEN_ADDRESS,
      RECIPIENT,
      amount,
    )
    expect(result.verified).toBe(true)
    expect(result.actualAmount).toBe(amount)
  })

  it('mentions fee-on-transfer in error when actual < expected (W3-004)', () => {
    const sent = 950_000n // token fee reduced the transferred amount
    const expected = 1_000_000n
    const log = makeTransferLog({
      address: TOKEN_ADDRESS,
      from: SENDER,
      to: RECIPIENT,
      amount: sent,
    })
    const result = verifyErc20Receipt(
      { logs: [log] },
      TOKEN_ADDRESS,
      RECIPIENT,
      expected,
    )
    expect(result.verified).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error?.toLowerCase()).toMatch(/fee|fee.on.transfer/i)
  })

  it('returns verified:false with no matching log when receipt has no logs', () => {
    const result = verifyErc20Receipt(
      { logs: [] },
      TOKEN_ADDRESS,
      RECIPIENT,
      1_000_000n,
    )
    expect(result.verified).toBe(false)
    expect(result.error).toBeDefined()
  })
})
