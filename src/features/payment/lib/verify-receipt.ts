import { decodeEventLog, getAddress } from 'viem'
import type { Address } from 'viem'
import { formatAmount } from '@/shared/lib/amount-utils'

export interface VerificationResult {
  verified: boolean
  actualAmount: bigint
  expectedAmount: bigint
  error?: string
}

const transferEvent = {
  type: 'event',
  name: 'Transfer',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'value', type: 'uint256', indexed: false },
  ],
} as const

interface NativeTx {
  value: bigint
}

interface Erc20Receipt {
  logs: Array<{
    address: `0x${string}`
    topics: [`0x${string}`, ...`0x${string}`[]]
    data: `0x${string}`
  }>
}

export function verifyNativeReceipt(
  tx: NativeTx,
  expectedTotal: bigint,
  decimals = 18,
  tokenSymbol = 'ETH',
): VerificationResult {
  const actualAmount = tx.value
  const expectedAmount = expectedTotal

  if (actualAmount === expectedAmount) {
    return { verified: true, actualAmount, expectedAmount }
  }

  return {
    verified: false,
    actualAmount,
    expectedAmount,
    error: `Amount mismatch: expected ${formatAmount(expectedAmount.toString(), decimals)} ${tokenSymbol}, got ${formatAmount(actualAmount.toString(), decimals)} ${tokenSymbol}`,
  }
}

export function verifyErc20Receipt(
  receipt: Erc20Receipt,
  tokenAddress: string,
  recipient: string,
  expectedTotal: bigint,
  decimals = 18,
  tokenSymbol = 'TOKEN',
): VerificationResult {
  const expectedAmount = expectedTotal
  const normalizedToken = getAddress(tokenAddress)
  const normalizedRecipient = getAddress(recipient)

  // W3-005: filter logs strictly by token contract address first
  const tokenLogs = receipt.logs.filter((log) => {
    try {
      return getAddress(log.address) === normalizedToken
    } catch {
      return false
    }
  })

  for (const log of tokenLogs) {
    try {
      const decoded = decodeEventLog({
        abi: [transferEvent],
        data: log.data,
        topics: log.topics,
      })

      if (decoded.eventName !== 'Transfer') continue

      const args = decoded.args as { from: Address; to: Address; value: bigint }
      const normalizedTo = getAddress(args.to)

      if (normalizedTo !== normalizedRecipient) continue

      const actualAmount = args.value

      if (actualAmount === expectedAmount) {
        return { verified: true, actualAmount, expectedAmount }
      }

      // W3-004: mention fee-on-transfer when actual < expected
      const error =
        actualAmount < expectedAmount
          ? `Amount mismatch: expected ${formatAmount(expectedAmount.toString(), decimals)} ${tokenSymbol}, got ${formatAmount(actualAmount.toString(), decimals)} ${tokenSymbol}. This may be a fee-on-transfer token.`
          : `Amount mismatch: expected ${formatAmount(expectedAmount.toString(), decimals)} ${tokenSymbol}, got ${formatAmount(actualAmount.toString(), decimals)} ${tokenSymbol}`

      return { verified: false, actualAmount, expectedAmount, error }
    } catch {
      continue
    }
  }

  return {
    verified: false,
    actualAmount: BigInt(0),
    expectedAmount,
    error: 'No matching Transfer log found for the given token and recipient',
  }
}
