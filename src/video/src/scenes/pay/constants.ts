import { DEMO_INVOICE } from '../../constants/demo-invoice'

// Deterministic demo tx hash for the paid-state watermark
export const DEMO_TX_HASH =
  '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456' as const

// Hoisted to module scope so prop identities are stable across every frame —
// prevents InvoicePaper re-renders from fresh object references (P1.2).
export const PAPER_PROPS_PENDING = {
  data: DEMO_INVOICE,
  status: 'pending',
  variant: 'default',
} as const

export const PAPER_PROPS_PAID = {
  data: DEMO_INVOICE,
  status: 'paid',
  txHash: DEMO_TX_HASH,
  variant: 'default',
} as const

// Phase timing — R23 (S3-local frames):
//   0– 99   idle:disconnected   ("Connect Wallet" button)
// 100       press-scale on Connect + PHASE_CONNECTING (connecting loader)
// 140–189   PHASE_SWITCHING     (switching loader, 50fr)
// 190–299   PHASE_SENDING       (sending loader + Magic Dust window, 110fr)
// 300       SUCCESS             (paper flips PAID, single tick, emerald gradient bar)
// 300–379   PHASE_FINALIZING    (finalizing window, 80fr, single tick visible)
// 380       FINALIZE            (double-tick checkmarks appear + animate, 25fr animation)
// 380–439   double-tick hold + "Payment confirmed" caption window
// 440–459   PANEL_EXIT          (panel slides/fades out, 20fr)
// 460–574   paper-alone PAID    (115fr finalized hold with "Not our servers" + "Works…")
// 575–604   PACK_START          (pack-into-URL, 30fr, unchanged)
//
// Single-press model: Connect only — Switch and Pay absorbed into loaders.
export const PRESS_CONNECT = 100
export const PHASE_CONNECTING = 100
export const PHASE_SWITCHING = 140 // absorbs wrong-network; starts right after connecting
export const PHASE_SENDING = 190 // absorbs ready; starts right after switching
export const PHASE_FINALIZING = 300
export const SUCCESS = 300 // paper flips PAID, single tick appears
// WalletPill shows connected once connecting phase begins (100).
export const PHASE_CONNECTED = PHASE_CONNECTING
// Magic Dust window — aligned with sending phase (190–300).
export const MAGIC_DUST_HIGHLIGHT = 190
export const MAGIC_DUST_PEAK_END = 300
export const CONFIRMATIONS_REQUIRED = 12

// FINALIZE — double-tick checkmarks animate here, 25fr after SUCCESS+80fr finalizing window.
// Used by: caption choreography (Payment confirmed chip starts here),
// double-tick blink animation (checkmarks pulse for emphasis).
export const FINALIZE = 380

// Panel exits at 440-459, giving paper-alone window (460-574).
export const PANEL_EXIT_START = 440
export const PANEL_EXIT_END = 460 // +20fr exit duration

// BrowserChrome bar heights — scaled per aspect ratio (B2: ×1.2 landscape, ×1.5 portrait).
// Base: padding(18×2=36) + dot(15) = 51px
export const CHROME_HEIGHT = 51 // legacy — kept for backward compat
export const CHROME_HEIGHT_LANDSCAPE = 48 // R14-B: aspect-aware -20% (was 61)
export const CHROME_HEIGHT_PORTRAIT = 76 // 51 × 1.5, rounded
// Max panel width in landscape right column (D13; D38: widened to 880)
export const PANEL_MAX_WIDTH = 880

// Round-11 phase-6: pack-into-URL animation (F2).
// Last 30fr of PayScene (S3-local 575–605) — invoice paper shrinks in place
// toward its own center, fades out as S4 outro overlay takes over.
// R23-T5: removed Y-translation toward chrome (was misleading — paper now
// "implodes" cleanly without competing motion).
export const PACK_DURATION = 30
export const PACK_START_LOCAL = 575
