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
import { RemotionInvoiceFormSkin } from "../components/RemotionInvoiceFormSkin";

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
// C5: accepts blur/dim overrides for when CTA/modal is foregrounded.
const PaperBackdrop: React.FC<{ frame: number; dimOpacity?: number; blurPx?: number }> = ({
  frame: f,
  dimOpacity,
  blurPx,
}) => {
  const { width, height } = useVideoConfig();
  const targetWidth = width * 0.92;
  const scale = targetWidth / INVOICE_BASE_WIDTH;
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  // θ4: balanced vertical centering — center paper in [80, height-100] band
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
  // ε6: dim paper backdrop in S1 to push it visually behind the form.
  // C5: when modal/CTA is foregrounded, apply additional dimOpacity override.
  const baseOpacity = enter * 0.65;
  const paperOpacity = dimOpacity !== undefined ? dimOpacity : baseOpacity;

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
        filter: blurPx ? `blur(${blurPx}px)` : undefined,
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

      {/* β2: InvoicePaper as persistent backdrop, grows from PAPER_APPEAR BEHIND form (z=1).
           C5: F5 (Generate pressed) — paper dims to 0.4 opacity + 0.5px blur. */}
      <PaperBackdrop
        frame={frame}
        {...(frame >= PRESS_START && {
          dimOpacity: interpolate(frame, [PRESS_START, PRESS_START + 8], [0.65, 0.4], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          blurPx: interpolate(frame, [PRESS_START, PRESS_START + 8], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        })}
      />

      {/* β1+β3+β4: Form Card — Mocks v2 form spec: rgba(14,14,19,0.95) bg, zinc border */}
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
          backgroundColor: "rgba(14,14,19,0.95)",
          border: "1px solid rgba(63,63,70,0.5)",
          boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 ${glowSpread}px rgba(124,58,237,${glowIntensity * 0.5})`,
          borderRadius: 12,
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
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflowX: "visible",
                overflowY: "hidden",
              }}
            >
              {/* F2 post-render fix: RemotionInvoiceFormSkin replaces production InvoiceFormView
                   in portrait branch. All internal sizes from Mocks v2 ×3 scaling. */}
              <RemotionInvoiceFormSkin
                focusedField={
                  focusedField === "from" || focusedField === "client" ? undefined :
                  focusedField === "lineItem" ? "description" :
                  focusedField === "network" || focusedField === "token" ? "wallet" :
                  undefined
                }
                showWallet={frame >= WALLET_APPEAR}
                showClient={frame >= CLIENT_APPEAR}
                showDescription={frame >= LINE_DESC_APPEAR}
                showPrice={frame >= LINE_PRICE_APPEAR}
                magicDustOn={frame >= MAGIC_DUST_TOGGLE_FRAME}
                ctaEnabled={frame >= FILL_COMPLETE}
                ctaPressed={frame >= PRESS_START && frame < PRESS_END}
                ctaGenerating={frame >= PRESS_END}
              />
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

      {/* η7 (F2): Mocks v2 anchor top:21.6% right:6.7% — "No DB → link is the data" */}
      <HintBadge
        text="No DB → link is the data"
        startAt={65}
        endAt={95}
        variant="arrow"
        fontSize={28}
        style={{ top: "21.6%", right: "6.7%", zIndex: 10 }}
      />

      {/* η6 (F3): Mocks v2 anchor top:27.3% left:3.9% — "Your wallet. No KYC. No bank." */}
      <HintBadge
        text="Your wallet. No KYC. No bank."
        startAt={115}
        endAt={175}
        variant="arrow"
        fontSize={28}
        style={{ top: "27.3%", left: "3.9%", zIndex: 10 }}
      />

      {/* η2 (F4): Mocks v2 anchor top:51.6% right:6.7% — "Magic dust → unique payment ID" */}
      <HintBadge
        text="Magic dust → unique payment ID"
        startAt={220}
        endAt={280}
        variant="arrow"
        fontSize={28}
        style={{ top: "51.6%", right: "6.7%", zIndex: 10 }}
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
