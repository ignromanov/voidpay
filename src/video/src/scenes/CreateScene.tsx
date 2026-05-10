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
import { Caption } from "../components/Caption";
import { HintBadge } from "../components/HintBadge";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";

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
  // θ4: balanced vertical centering — center paper in [80, height-100] band
  // so top margin equals bottom margin, excluding caption zone (top) and toast zone (bottom).
  const availableTop = 80;
  const availableBottom = height - 100;
  const availableHeight = availableBottom - availableTop;
  const top = availableTop + Math.max(0, (availableHeight - scaledH) / 2);

  const enter = interpolate(
    f,
    [PAPER_APPEAR, PAPER_VISIBLE_AT],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const paperScale = scale * (0.92 + enter * 0.08);  // 92% → 100% scale ramp
  // ε6: dim paper backdrop in S1 to push it visually behind the form
  // (S2 + S3 use full-opacity PaperBackdrop — this dimming is S1-only)
  const paperOpacity = enter * 0.65;

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
        opacity: paperOpacity,
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

  // θ2: Form width reduced to ~67% of prior 800px = ~540px, creating focused central column.
  // Font-size is bumped proportionally from 20px → 26px so visual mass per field is preserved.
  // At 1080 viewport: formWidth=540 → 270px margin each side (breathing room for paper backdrop).
  const formWidth  = isPortrait ? Math.min(560, width * 0.52)  : 768;     // θ2: 560 on 1080 (260px each side)
  const formHeight = isPortrait ? Math.round(height * 0.62)    : 720;     // slightly taller to fit content
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
      <NetworkBackgroundLayer variant="soft" />
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
          padding: "24px 32px 24px 24px",  // ε1: right-pad 32px so right-column TOTAL values don't clip
          overflow: "hidden",
          opacity: formOpacity,
          zIndex: 2,
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
          {/* ε1: font-size CSS replaces transform-scale (γ2 conceptual error: pre-divide + scale = layout-neutral).
               ζ1: overflowX:visible preserves right-column; overflowY:hidden clips button at Card bottom.
               ζ2: sub-label overrides — <style> block forces min 16px on absolute-px Tailwind classes
                    (text-xs 12px / text-[11px]) used by INVOICE NO., DATES, YOUR NAME sub-labels. */}
          {isPortrait ? (
            <div
              className="remotion-create-portrait"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                // ι1: bumped from 26px → 34px (×1.3 of θ2's 26px — form internals scale proportionally)
                // Card outer width stays at θ2 560px — only internals grow.
                fontSize: "34px",
                overflowX: "visible",              // ε1: prevents right-column clipping at Card edge
                overflowY: "hidden",               // ζ1: clip bottom so button doesn't bleed past Card
                paddingRight: 8,                   // ε1: small extra right pad so values don't touch border
              }}
            >
              {/* ζ2 + θ2 + ι1: override absolute-px Tailwind sub-labels; floor raised 18px → 23px (×1.3) */}
              <style>{`
                .remotion-create-portrait .text-xs,
                .remotion-create-portrait [class*="text-[11px]"],
                .remotion-create-portrait [class*="text-[10px]"] {
                  font-size: 23px !important;
                }
              `}</style>

              {/* θ1 + ι1: Invoice Details header — 22px → 29px (×1.3) */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(63, 63, 70, 0.5)",
              }}>
                <div style={{
                  fontSize: "29px",
                  fontWeight: 700,
                  color: "rgba(244, 244, 245, 1)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}>
                  <span style={{ color: "rgba(139, 92, 246, 1)" }}>Invoice</span>
                  {" "}Details
                </div>
              </div>

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

      {/* η7: "auto-generated" hint near Invoice No field — local 65–95, early in cascade */}
      {/* ι1: fontSize 14→28 (×2 per ι4 rule) */}
      <HintBadge
        text="auto-generated"
        startAt={65}
        endAt={95}
        variant="ghost"
        fontSize={28}
        style={{ left: formLeft + formWidth * 0.55, top: formTop + 28, zIndex: 10 }}
      />

      {/* η6: "any address, no KYC" hint near wallet field — local 115–175, during wallet typewriter */}
      {/* ι1: fontSize 14→28 (×2 per ι4 rule) */}
      {/* κ-4: repositioned ABOVE wallet field label (was 0.28 — on top of the field text).
           0.16 targets the zone above the wallet row label, avoiding overlap with address text. */}
      <HintBadge
        text="any address, no KYC"
        startAt={115}
        endAt={175}
        variant="arrow"
        fontSize={28}
        style={{ left: formLeft + formWidth * 0.20, top: formTop + formHeight * 0.16, zIndex: 10 }}
      />

      {/* η2: magic dust hint — local 220–280 (R1: startAt=220 avoids paper reveal collision) */}
      {/* ι1: fontSize 14→28 (×2 per ι4 rule) */}
      {/* κ-4: repositioned to RIGHT of form card so the ← arrow points toward the paper TOTAL column.
           Was inside form at 0.30×width, 0.72×height — arrow pointed at form fields, not paper totals.
           New position: anchored so right edge stays within viewport (1080px wide).
           formLeft+formWidth = 820; hint text ~280px wide at fontSize 28; right edge cap at width-16.
           Using right-anchor: position from right side of viewport so text never clips. */}
      <HintBadge
        text="+ 0.000042 ← magic dust"
        startAt={220}
        endAt={280}
        variant="arrow"
        fontSize={28}
        style={{ right: 16, top: formTop + formHeight * 0.72, zIndex: 10 }}
      />

      {/* η1: "No signup." caption — local 280–340, button reveal moment (Spark Beat 11).
           θ7 cross-impact: moved bottom→top. Bottom zone now reserved for toasts.
           Top zone is clear at f280 (η7 exited at 95, η6 exited at 175, η2 is a hint not caption). */}
      <Caption
        text="No signup."
        position="top"
        startAt={280}
        endAt={340}
        fontSize={38}
      />

    </AbsoluteFill>
  );
};
