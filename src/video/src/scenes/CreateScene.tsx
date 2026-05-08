import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  InvoicePaper,
  INVOICE_BASE_WIDTH,
  INVOICE_BASE_HEIGHT,
} from "@/widgets/invoice-paper";
import { InvoiceFormView, GenerateButtonView } from "@/widgets/invoice-form";
import { NetworkBackground } from "@/widgets/network-background";
import { Card } from "@/shared/ui";
import { COLORS } from "../constants/colors";
import { TYPEWRITER_CHAR_FRAMES } from "../constants/timing";
import { DEMO_INVOICE, DEMO_FROM_ADDRESS } from "../constants/demo-invoice";

// Creative brief §2: Alex · UI Design · $250 USDC · Arbitrum
const INVOICE_FROM = "Alex";
const INVOICE_ITEM = "UI Design";
const INVOICE_AMOUNT = "250.00";
const INVOICE_TOKEN = "USDC";
const INVOICE_NETWORK = "Arbitrum";

// Phase frames — round 9a: 2× field cascade + InvoicePaper post-fill + button-after-paper.
// Empty hold 0-60 unchanged. Field cascade widened from 65fr → 130fr (Ignat: "растянуть в 2 раза").
// All later anchors shift to accommodate post-fill InvoicePaper hold.
const INVOICE_NO_APPEAR = 65;
const DATES_APPEAR      = 85;
const FROM_START        = 99;
const WALLET_APPEAR     = 115;
const CLIENT_APPEAR     = 129;
const LINE_DESC_APPEAR  = 143;
const LINE_PRICE_APPEAR = 155;
const NETWORK_APPEAR    = 167;
const TOKEN_APPEAR      = 179;
const FILL_COMPLETE     = 195;  // last field landed (was BUTTON_VISIBLE in round 8)
const PAPER_APPEAR      = 200;  // round 9a: post-fill — InvoicePaper fade-in starts here
const PAPER_VISIBLE_AT  = 230;  // fade-in done (30fr ramp)
const BUTTON_VISIBLE    = 280;  // round 9a: button reveals AFTER paper hold
const PRESS_START       = 290;
const PRESS_END         = 307;
// round 9a-patch2 (C4): isGenerating={frame >= PRESS_END} holds 307–350 (43fr), crossfade 340–350.
const MAGIC_DUST_TOGGLE_FRAME = 200;  // round 9a-patch2 (C3): toggle off→on after TOKEN_APPEAR=179

// Form scroll keyframes — round 9a: stretched proportionally with cascade.
// Round 9a-patch1 (B1): end 200 → 188 (mp4 8.600s) — scroll stops earlier so empty form
// space below the last field doesn't drift into view at the bottom of the Card.
// Round 9a-patch2 (C2): final offset reduced -420 → -360 to remove empty space below form.
// Dev: verify via still at frame 258; adjust this single constant if needed.
const SCROLL_FRAMES  = [115, 150, 175, 188];
const SCROLL_OFFSETS = [0, -120, -240, -360];

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
};

// β2: PaperBackdrop — full-bleed InvoicePaper centered in viewport, frame-driven entrance.
// Renders BEHIND the form Card (z=1 vs form z=default). Grows from PAPER_APPEAR.
const PaperBackdrop: React.FC<{ frame: number }> = ({ frame: f }) => {
  const { width, height } = useVideoConfig();
  const targetWidth = width * 0.92;
  const scale = targetWidth / INVOICE_BASE_WIDTH;
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  const top = Math.max(40, (height - scaledH) / 2 - 80);

  const enter = interpolate(
    f,
    [PAPER_APPEAR, PAPER_VISIBLE_AT],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const paperScale = scale * (0.92 + enter * 0.08);  // 92% → 100% scale ramp

  if (enter <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: (width - INVOICE_BASE_WIDTH * paperScale) / 2,
        top,
        width: INVOICE_BASE_WIDTH,
        height: INVOICE_BASE_HEIGHT,
        transform: `scale(${paperScale})`,
        transformOrigin: "top left",
        opacity: enter,
        zIndex: 1,
      }}
    >
      <InvoicePaper data={DEMO_INVOICE} status="draft" variant="default" />
    </div>
  );
};

/** Typewriter: reveal `text` char by char starting at `startFrame` */
const typewrite = (text: string, frame: number, startFrame: number): string => {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed / TYPEWRITER_CHAR_FRAMES);
  return text.slice(0, Math.min(chars, text.length));
};

export const CreateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Round 9c L7: portrait re-layout — form centered, paper in lower half.
  const isPortrait = width < 1200;

  // Frame-driven snapshot for the real InvoiceFormView.
  const viewValue = useMemo(() => {
    const fromName = typewrite(INVOICE_FROM, frame, FROM_START);
    const walletAddress = frame >= WALLET_APPEAR ? DEMO_FROM_ADDRESS : undefined;
    const client = frame >= CLIENT_APPEAR ? { name: "Acme Corp" } : undefined;

    // Line item appears progressively: description first, then rate (price)
    const lineItems = frame >= LINE_DESC_APPEAR
      ? [{
          description: INVOICE_ITEM,
          quantity: 1,
          rate: frame >= LINE_PRICE_APPEAR ? INVOICE_AMOUNT : undefined,
        }]
      : undefined;

    const networkLabel = frame >= NETWORK_APPEAR ? INVOICE_NETWORK : undefined;
    const tokenSymbol = frame >= TOKEN_APPEAR ? INVOICE_TOKEN : undefined;

    return {
      ...(frame >= INVOICE_NO_APPEAR && { invoiceId: DEMO_INVOICE.invoiceId }),
      ...(frame >= DATES_APPEAR && {
        issuedAt: "2026-04-18",
        dueAt: "2026-04-25",
      }),
      from: fromName
        ? { name: fromName, ...(walletAddress && { walletAddress }) }
        : undefined,
      ...(client && { client }),
      ...(lineItems && { lineItems }),
      ...(networkLabel && { networkLabel }),
      ...(tokenSymbol && { tokenSymbol }),
      ...(frame >= NETWORK_APPEAR && { chainId: 42161 }),
      // C3: toggle off → on at MAGIC_DUST_TOGGLE_FRAME (good anchor for Spark hint copy)
      magicDustEnabled: frame >= MAGIC_DUST_TOGGLE_FRAME,
    };
  }, [frame]);

  // Focused field drives the violet ring — simulates the "user typing here" beat.
  // Invoice No / Dates aren't part of focusedField enum, so no ring until FROM_START.
  const focusedField: "from" | "client" | "lineItem" | "token" | "network" | undefined =
    frame < FROM_START ? undefined :
    frame < CLIENT_APPEAR ? "from" :
    frame < LINE_DESC_APPEAR ? "client" :
    frame < NETWORK_APPEAR ? "lineItem" :
    frame < TOKEN_APPEAR ? "network" :
    frame < FILL_COMPLETE ? "token" :
    undefined;

  // Round 9a: violet pulse glow active throughout fill.
  const baseGlow = 0.25;
  const fillPulseDelta =
    frame >= INVOICE_NO_APPEAR && frame < BUTTON_VISIBLE
      ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.05, 0.4])
      : 0;
  const settledHalo = frame >= BUTTON_VISIBLE
    ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.0, 0.15])
    : 0;
  const buttonGlowOpacity = baseGlow + fillPulseDelta + settledHalo;

  // γ1: Form true-centered with generous margins so paper backdrop reads through.
  const formWidth  = isPortrait ? Math.min(800, width * 0.74)  : 768;     // 800 on 1080 (140px each side)
  const formHeight = isPortrait ? Math.round(height * 0.58)    : 720;     // 1114 on 1920 (~400px top+bot)
  const formLeft   = (width - formWidth) / 2;
  const formTop    = isPortrait ? (height - formHeight) / 2     : (height - formHeight) / 2;

  // γ3: single mercating neon glow — sin-driven pulse, no border (avoids double-rim)
  const neonPulse = 0.5 + 0.5 * Math.sin((frame / 60) * Math.PI * 2);   // 1 cycle / 2s
  const glowIntensity = 0.35 + neonPulse * 0.3;                         // 0.35 → 0.65
  const glowSpread = 30 + neonPulse * 30;                               // 30 → 60

  // β3.3: form stays at opacity 1 throughout S1 — paper is backdrop, not replacement.
  const formOpacity = 1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Void glow overlay behind the form card */}
      <div
        style={{
          position: "absolute",
          left: formLeft - 24,
          top: formTop - 24,
          width: formWidth + 48,
          height: formHeight + 48,
          borderRadius: 32,
          boxShadow: `0 0 60px rgba(124,58,237,${buttonGlowOpacity * 0.6}), 0 0 120px rgba(124,58,237,${buttonGlowOpacity * 0.3})`,
          pointerEvents: "none",
        }}
      />

      {/* β2: InvoicePaper as persistent backdrop, grows from PAPER_APPEAR BEHIND form (z=1) */}
      <PaperBackdrop frame={frame} />

      {/* β1+β3+β4: Form Card — vertically dominant, solid background, stays at opacity 1. */}
      <Card
        style={{
          position: "absolute",
          left: formLeft,
          top: formTop,
          width: formWidth,
          height: formHeight,
          padding: 24,
          overflow: "hidden",
          opacity: formOpacity,
          backgroundColor: "rgba(24, 24, 27, 0.96)",
          boxShadow: `
            0 0 ${glowSpread}px rgba(124, 58, 237, ${glowIntensity}),
            0 0 ${glowSpread / 2}px rgba(124, 58, 237, ${glowIntensity * 0.7}),
            0 25px 80px -20px rgba(0,0,0,0.8)
          `,
          borderRadius: 16,
        }}
      >
        <div
          style={{
            transform: `translateY(${interpolate(
              frame,
              SCROLL_FRAMES,
              SCROLL_OFFSETS,
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )}px)`,
          }}
        >
          {/* γ2: scale wrapper for portrait readability */}
          {isPortrait ? (
            <div style={{
              position: "relative",
              width: formWidth / 1.25,           // pre-divide so post-scale fits Card width
              height: formHeight / 1.25,
              transform: "scale(1.25)",
              transformOrigin: "top left",
              overflow: "hidden",
            }}>
              <InvoiceFormView
                value={viewValue}
                {...(focusedField && { focusedField })}
                showGenerateButton={false}
              />

              {/* Round 9a-patch2 (C1): button always mounted at bottom of scroll content. */}
              <div
                style={{
                  marginTop: 16,
                  transform: `scale(${interpolate(frame, [PRESS_START, PRESS_START + 2, PRESS_END - 2, PRESS_END], [1, 0.96, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  transformOrigin: "center",
                }}
              >
                <GenerateButtonView
                  onGenerate={noop}
                  canGenerate={frame >= FILL_COMPLETE}
                  isGenerating={frame >= PRESS_END}
                  onSubmitAttempt={noop}
                  hoverState={frame >= BUTTON_VISIBLE && frame < PRESS_START}
                  pressState={frame >= PRESS_START && frame < PRESS_END}
                />
              </div>
            </div>
          ) : (
            <>
              <InvoiceFormView
                value={viewValue}
                {...(focusedField && { focusedField })}
                showGenerateButton={false}
              />

              {/* Round 9a-patch2 (C1): button always mounted at bottom of scroll content. */}
              <div
                style={{
                  marginTop: 16,
                  transform: `scale(${interpolate(frame, [PRESS_START, PRESS_START + 2, PRESS_END - 2, PRESS_END], [1, 0.96, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  transformOrigin: "center",
                }}
              >
                <GenerateButtonView
                  onGenerate={noop}
                  canGenerate={frame >= FILL_COMPLETE}
                  isGenerating={frame >= PRESS_END}
                  onSubmitAttempt={noop}
                  hoverState={frame >= BUTTON_VISIBLE && frame < PRESS_START}
                  pressState={frame >= PRESS_START && frame < PRESS_END}
                />
              </div>
            </>
          )}
        </div>
      </Card>

    </AbsoluteFill>
  );
};
