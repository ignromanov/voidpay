import { DEMO_INVOICE } from "../../constants/demo-invoice";

// Deterministic demo tx hash for the paid-state watermark
export const DEMO_TX_HASH =
  "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456" as const;

// Hoisted to module scope so prop identities are stable across every frame —
// prevents InvoicePaper re-renders from fresh object references (P1.2).
export const PAPER_PROPS_PENDING = {
  data: DEMO_INVOICE,
  status: "pending",
  variant: "default",
  magicDustEmphasis: true,
} as const;

export const PAPER_PROPS_PAID = {
  data: DEMO_INVOICE,
  status: "paid",
  txHash: DEMO_TX_HASH,
  variant: "default",
  magicDustEmphasis: true,
} as const;

// Phase timing — round-9r (S3-local frames):
//   0–194   idle:disconnected   ("Connect Wallet" button)
// 195–204   press-scale on Connect
// 195–220   idle:connecting     (spinner / "Connecting..." state)
// 220–245   idle:wrong-network  ("Switch to Arbitrum" button, ~25fr ≈ 0.83s)
// 246–250   press-scale on Switch
// 246–270   idle:switching      (spinner / "Switching..." state, ~25fr)
// 270–290   idle:ready          ("Pay" button visible, ~20fr legibility window)
// 291–295   press-scale on Pay
// 291–380   sending             (Magic Dust window aligned)
// 380–465   confirming          (progress bar visible, paper still PENDING; −60fr from R9m)
// 465–575   success             (paper flips PAID; +60fr paid-alone window vs R9m)
//
// Single-press model: Connect → Switch → Pay each get one press trigger.
export const PRESS_CONNECT        = 195;  // R9r
export const PRESS_SWITCH         = 246;  // R9r: new Switch Network press
export const PRESS_PAY            = 291;  // R9r: new Pay press
export const PHASE_CONNECTING     = 195;  // R9r
export const PHASE_WRONG_NETWORK  = 220;  // R9r
export const PHASE_SWITCHING      = 246;  // R9r
export const PHASE_READY          = 270;  // R9r: "Pay" button visible
export const PHASE_SENDING        = 291;  // R9r (was 220)
export const PHASE_CONFIRMING     = 380;  // R9r (was 310; −60fr from R9m = confirming shortened)
export const SUCCESS              = 465;  // R9r (was 440; −60fr → paid-alone +2s)
// WalletPill shows connected once connecting phase begins (195).
export const PHASE_CONNECTED = PHASE_CONNECTING;
// Magic Dust window — aligned with sending phase (291-380).
export const MAGIC_DUST_HIGHLIGHT = 291;  // R9r
export const MAGIC_DUST_PEAK_END  = 380;  // R9r
export const CONFIRMATIONS_REQUIRED = 12;

// Panel exits at 445-465, giving paper-alone window (465-575). R9r: −60fr from R9m.
export const PANEL_EXIT_START = 445;  // R9r (was 505)
export const PANEL_EXIT_END   = 465;  // R9r (was 525)

// Height of BrowserChrome bar: padding(18×2=36) + dot(15) = 51px
export const CHROME_HEIGHT = 51;
// Max panel width in landscape right column (D13; D38: widened to 880)
export const PANEL_MAX_WIDTH = 880;
