import type { ComponentProps } from "react";
import { InvoicePaper } from "@/widgets/invoice-paper";
import { DEMO_INVOICE } from "../../constants/demo-invoice";

// Creative brief §2: Alex · UI Design · $250 USDC · Arbitrum
export const INVOICE_FROM = "Alex";
export const INVOICE_ITEM = "UI Design";
export const INVOICE_AMOUNT = "250.00";
export const INVOICE_TOKEN = "USDC";
export const INVOICE_NETWORK = "Arbitrum";

// Phase frames — round 9a: 2× field cascade + InvoicePaper post-fill + button-after-paper.
// Empty hold 0-60 unchanged. Field cascade widened from 65fr → 130fr (Ignat: "растянуть в 2 раза").
// All later anchors shift to accommodate post-fill InvoicePaper hold.
export const INVOICE_NO_APPEAR = 65;
export const DATES_APPEAR      = 85;
export const FROM_START        = 99;
export const WALLET_APPEAR     = 115;
export const CLIENT_APPEAR     = 129;
export const LINE_DESC_APPEAR  = 143;
export const LINE_PRICE_APPEAR = 155;
export const NETWORK_APPEAR    = 167;
export const TOKEN_APPEAR      = 179;
export const FILL_COMPLETE     = 195;  // last field landed (was BUTTON_VISIBLE in round 8)
export const PAPER_APPEAR      = 200;  // round 9a: post-fill — InvoicePaper fade-in starts here
export const PAPER_VISIBLE_AT  = 260;  // A6: doubled duration 30fr → 60fr for slower appearance
export const BUTTON_VISIBLE    = 280;  // round 9a: button reveals AFTER paper hold
export const PRESS_START       = 240;
export const PRESS_END         = 307;
// round 9a-patch2 (C4): isGenerating={frame >= PRESS_END} holds 307–350 (43fr), crossfade 340–350.
export const MAGIC_DUST_TOGGLE_FRAME = 200;  // round 9a-patch2 (C3): toggle off→on after TOKEN_APPEAR=179

// Form scroll keyframes — round 9a: stretched proportionally with cascade.
// Round 9a-patch1 (B1): end 200 → 188 (mp4 8.600s) — scroll stops earlier so empty form
// space below the last field doesn't drift into view at the bottom of the Card.
// Round 9a-patch2 (C2): final offset reduced -420 → -360 to remove empty space below form.
// D5 (round-9e): cascade ×2 made form taller — extend endpoint frame 188 → 195 and
// offset -360 → -900 so Token & Network block scrolls fully into view before FILL_COMPLETE.
// D15 (unified scroll): extend to frame 265 with offset -2000 so Generate button bottom is
// fully in view before BUTTON_VISIBLE=280. Single translateY driver — no secondary motions.
// D21 audit: confirmed single translateY source. -2000 overshoots — form scrolls too far up
// and Generate button exits top of card by f280. Calibrated endpoint by iterative stills:
// -760 still too short (button not in view); -1100 targets button bottom flush with card edge.
// A4: spring scroll replaces piecewise-linear. Single spring over [SCROLL_START_FRAME, +150fr].
// Portrait: -1100 calibrated endpoint (×1.2 for cascade growth → -1320 per A3).
// Landscape: -960 (was -800 × 1.2 per A3).
export const SCROLL_START_FRAME = 115;
export const SCROLL_DURATION_FRAMES = 150;
export const TOTAL_SCROLL_DISTANCE_PORTRAIT  = 1320;
export const TOTAL_SCROLL_DISTANCE_LANDSCAPE = 960;
// Legacy keyframe arrays kept for reference only — no longer used in scene files.
export const SCROLL_FRAMES  = [115, 150, 175, 195, 265];
export const SCROLL_OFFSETS = [0, -120, -400, -900, -1100];
export const SCROLL_FRAMES_LANDSCAPE  = [115, 150, 175, 195, 265];
export const SCROLL_OFFSETS_LANDSCAPE = [0, -60, -180, -380, -800];

/** Props forwarded to <InvoicePaper> — same in both landscape and portrait. */
export const CREATE_PAPER_PROPS: ComponentProps<typeof InvoicePaper> = {
  data: DEMO_INVOICE,
  status: "draft",
  variant: "default",
  magicDustEmphasis: true,
} as const;
