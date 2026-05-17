import { DEMO_FROM_ADDRESS, DEMO_INVOICE } from "../../constants/demo-invoice";

// Full URL — 4x longer hash payload (~560 chars) so the LinkTab URL visibly
// truncates with ellipsis and reads as "very long / data-dense".
// og prefix carries recipient address for the address callback (creative-brief-v2 §4).
export const HASH_PAYLOAD =
  "N4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBY" +
  "AuADgE4CuAxgC4DmAhgBYAuADgE4CuN4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxg" +
  "C4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4CuN4Igbghg" +
  "Tg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4Cu" +
  "AxgC4DmAhgBYAuADgE4CuN4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYA" +
  "uADgE4CuAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4Cu";

export const SHARE_URL = `https://voidpay.xyz/pay?og=VP-0001_250_USDC_arb_${DEMO_FROM_ADDRESS}#${HASH_PAYLOAD}`;

// D27: instant tab swap — 1-frame window eliminates blink where both tabs at half opacity
export const TAB_CROSSFADE_DURATION = 1;

// Round 9o: tab swap delayed to S2-local 230 — coincides with end of "Hash never leaves" caption (225)
// and start of "Share it anywhere." caption (235), so QR appears with its companion text.
export const COPY_FRAME = 100;
export const TAB_SWAP_FRAME = 230;

// Round 9c L2: InvoicePaper backdrop props — hoisted for prop-identity stability (P1.2).
export const SHARE_PAPER_PROPS = {
  data: DEMO_INVOICE,
  status: "pending",
  variant: "default",
} as const;
