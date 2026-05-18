import { DEMO_INVOICE, DEMO_INVOICE_URL } from "../../constants/demo-invoice";

/**
 * Bare /pay URL (no ?og=...) — production ShareModal default (OG toggle OFF).
 * Drives QR encoding in ShareScene; sparser QR = easier to scan from a screen.
 * For social posting (Twitter/Telegram), use DEMO_INVOICE_URL_SHARE which keeps
 * the ?og= param for social preview cards.
 */
export const SHARE_URL = DEMO_INVOICE_URL;

// R22-C: 10fr crossfade — 1fr was imperceptibly fast (hard-cut flicker in Studio at f230).
export const TAB_CROSSFADE_DURATION = 10;

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
