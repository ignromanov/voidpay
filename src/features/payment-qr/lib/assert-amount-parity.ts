/**
 * Shade S1 (spec 095): the atomic amount actually encoded in the built deep-link
 * href (`value=` for native, `uint256=` for ERC-20) MUST equal the exact
 * Magic-Dust total displayed on screen (computeAmounts(invoice).exactTotal,
 * base units). Checks the built href, not the inputs, so a regression in the
 * link builder is caught.
 */
const AMOUNT_PARAM = /[?&](?:value|uint256)=([^&#]*)/

export function extractLinkAmount(href: string): bigint | null {
  const raw = AMOUNT_PARAM.exec(href)?.[1]
  if (!raw || !/^\d+$/.test(raw)) return null
  return BigInt(raw)
}

export function isAmountParityOk(href: string, displayedExactTotal: bigint | string): boolean {
  let expected: bigint
  try {
    expected = BigInt(displayedExactTotal)
  } catch {
    return false
  }
  return extractLinkAmount(href) === expected
}

/** Message deliberately carries no amounts/addresses (privacy invariant). */
export function assertAmountParity(href: string, displayedExactTotal: bigint | string): void {
  if (!isAmountParityOk(href, displayedExactTotal)) {
    throw new Error('[payment-qr] amount parity violated: deep-link amount != displayed exactTotal')
  }
}
