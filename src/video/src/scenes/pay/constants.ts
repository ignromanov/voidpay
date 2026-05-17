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

// Phase timing — round-10b (S3-local frames):
//   0– 99   idle:disconnected   ("Connect Wallet" button)  [100fr, -50fr from r9]
// 100–109   press-scale on Connect
// 100–139   connecting loader   (~40fr, +15fr breathing room)
// 140–189   switching loader    (~50fr; unchanged)
// 190–299   sending loader      (~110fr; unchanged) — Magic Dust window
// 300–419   confirming          (~120fr, +35fr; paper flips PAID here per defect-4)
// 420–464   success             (~45fr; panel visible with emerald gradient bar — defect-1)
// 465–484   panel exit          (~20fr)
// 485–574   paper-alone PAID    (~90fr finalized hold)
//
// Single-press model: Connect only — Switch and Pay absorbed into loaders.
export const PRESS_CONNECT        = 100;
export const PHASE_CONNECTING     = 100;
export const PHASE_SWITCHING      = 140;  // absorbs wrong-network; starts right after connecting
export const PHASE_SENDING        = 190;  // absorbs ready; starts right after switching
export const PHASE_CONFIRMING     = 300;
export const SUCCESS              = 420;
// WalletPill shows connected once connecting phase begins (100).
export const PHASE_CONNECTED = PHASE_CONNECTING;
// Magic Dust window — aligned with sending phase (190–300).
export const MAGIC_DUST_HIGHLIGHT = 190;
export const MAGIC_DUST_PEAK_END  = 300;
export const CONFIRMATIONS_REQUIRED = 12;

// Panel exits at 465-484, giving paper-alone window (485-574). Defect-1: SUCCESS+45fr gap for emerald bar.
export const PANEL_EXIT_START = 465;  // SUCCESS + 45fr (emerald border visible 1.5s)
export const PANEL_EXIT_END   = 485;  // +20fr exit duration

// BrowserChrome bar heights — scaled per aspect ratio (B2: ×1.2 landscape, ×1.5 portrait).
// Base: padding(18×2=36) + dot(15) = 51px
export const CHROME_HEIGHT = 51;           // legacy — kept for backward compat
export const CHROME_HEIGHT_LANDSCAPE = 61; // 51 × 1.2, rounded
export const CHROME_HEIGHT_PORTRAIT  = 76; // 51 × 1.5, rounded
// Max panel width in landscape right column (D13; D38: widened to 880)
export const PANEL_MAX_WIDTH = 880;

// Round-11 phase-6: pack-into-URL animation (F2).
// Last 30fr of PayScene (S3-local 575–605) — invoice paper scales/fades toward browser chrome.
// PACK_START_LOCAL = SCENE_DURATIONS.pay - PACK_DURATION = 605 - 30 = 575.
export const PACK_DURATION = 30;
export const PACK_START_LOCAL = 575;
// R13-D: precise aim at address bar center.
// Landscape (1920×1080): wrapper top=61, wrapper center y=570.5, chrome center y=30.5 → 540px up.
// Portrait  (1080×1920): wrapper top=76, wrapper center y=998,   chrome center y=38   → 960px up.
export const PACK_Y_OFFSET_LANDSCAPE = 540;  // px toward chrome address bar (canvas height 1080px)
export const PACK_Y_OFFSET_PORTRAIT  = 960;  // px toward chrome address bar (canvas height 1920px)
