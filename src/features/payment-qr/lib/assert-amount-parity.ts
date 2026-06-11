/**
 * Shade S1 (spec 095): the atomic amount encoded into the EIP-681 URI MUST
 * equal the exact Magic-Dust total displayed on screen — both single-sourced
 * from computeAmounts(invoice).exactTotal. A divergence means a refactor broke
 * the invariant; fail loud in dev rather than ship a URI Magic-Dust can't match.
 */
export function assertAmountParity(uriAmount: string, displayedExactTotal: string): void {
  if (uriAmount !== displayedExactTotal) {
    throw new Error(
      `[payment-qr] amount parity violated: URI=${uriAmount} displayed=${displayedExactTotal}`
    )
  }
}
