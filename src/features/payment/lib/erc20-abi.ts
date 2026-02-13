/**
 * Minimal ERC-20 transfer ABI
 *
 * Only includes the `transfer(address, uint256)` function signature.
 * Uses `as const` for viem type inference in useWriteContract.
 */
export const erc20TransferAbi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const
