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
import { useAspect } from "../hooks/useAspect";
import { CREATE_CAPTIONS_VERTICAL, CREATE_CAPTIONS_LANDSCAPE } from "./captions/create-captions";

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
// D5 (round-9e): cascade ×2 made form taller — extend endpoint frame 188 → 195 and
// offset -360 → -900 so Token & Network block scrolls fully into view before FILL_COMPLETE.
// D15 (unified scroll): extend to frame 265 with offset -2000 so Generate button bottom is
// fully in view before BUTTON_VISIBLE=280. Single translateY driver — no secondary motions.
// D21 audit: confirmed single translateY source. -2000 overshoots — form scrolls too far up
// and Generate button exits top of card by f280. Calibrated endpoint by iterative stills:
// -760 still too short (button not in view); -1100 targets button bottom flush with card edge.
const SCROLL_FRAMES  = [115, 150, 175, 195, 265];
const SCROLL_OFFSETS = [0, -120, -400, -900, -1100];
// D41: landscape scroll endpoint recalibrated — form has no ×2 CSS cascade so content
// is much shorter than portrait. -1160 (atlas-V) massively overshoots; Generate button
// exits the top of the card before f280. Reduced to -800 to keep button visible at f265.
const SCROLL_FRAMES_LANDSCAPE  = [115, 150, 175, 195, 265];
const SCROLL_OFFSETS_LANDSCAPE = [0, -60, -180, -380, -800];

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
};

// β2: PaperBackdrop — full-bleed InvoicePaper centered in viewport, frame-driven entrance.
// Renders BEHIND the form Card (z=1 vs form z=default). Grows from PAPER_APPEAR.
// C5: accepts blur/dim overrides for when CTA/modal is foregrounded.
// landscape: columnWidth overrides the width used for scaling (left-column half-viewport).
// D36: landscape paper sizing is height-driven to prevent top/bottom overflow on 16:9.
const PaperBackdrop: React.FC<{ frame: number; dimOpacity?: number; blurPx?: number; columnWidth?: number }> = ({
  frame: f,
  dimOpacity,
  blurPx,
  columnWidth,
}) => {
  const { width, height } = useVideoConfig();
  const containerWidth = columnWidth ?? width;
    // D39: canonical landscape paper sizing (Kai-locked formula).
  // Guarantees top ≥ 48px, bottom ≥ 48px, centered within available area.
  let scale: number;
  let top: number;
  if (columnWidth) {
    const PAPER_VPAD = 48;
    const availH = height - PAPER_VPAD * 2;
    const scaleByH = availH / INVOICE_BASE_HEIGHT;
    const scaleByW = (columnWidth * 0.85) / INVOICE_BASE_WIDTH;
    scale = Math.min(scaleByW, scaleByH);
    top = PAPER_VPAD + (availH - INVOICE_BASE_HEIGHT * scale) / 2;
  } else {
    const targetWidth = containerWidth * 0.92;
    scale = targetWidth / INVOICE_BASE_WIDTH;
    const scaledH = INVOICE_BASE_HEIGHT * scale;
    top = (height - scaledH) / 2;
  }

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
        left: (containerWidth - INVOICE_BASE_WIDTH * paperScale) / 2,
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
  // D12-D14: landscape two-column layout (16:9 = 1920×1080, width > height).
  const isLandscape = width > height;

  const { isVertical } = useAspect();
  const captions = isVertical ? CREATE_CAPTIONS_VERTICAL : CREATE_CAPTIONS_LANDSCAPE;

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

  // Mocks v2 surgical: portrait width = 84% of stage (907px on 1080), landscape keeps 768.
  const formWidth  = isPortrait ? Math.round(width * 0.84) : 768;
  const formHeight = isPortrait ? Math.round(height * 0.62)    : 720;     // slightly taller to fit content
  const formLeft   = (width - formWidth) / 2;
  const formTop    = isPortrait ? (height - formHeight) / 2     : (height - formHeight) / 2;

  // γ3: single mercating neon glow — sin-driven pulse, no border (avoids double-rim)
  const neonPulse = 0.5 + 0.5 * Math.sin((frame / 60) * Math.PI * 2);   // 1 cycle / 2s
  const glowIntensity = 0.35 + neonPulse * 0.3;                         // 0.35 → 0.65
  const glowSpread = 30 + neonPulse * 30;                               // 30 → 60

  // β3.3: form stays at opacity 1 throughout S1 — paper is backdrop, not replacement.
  const formOpacity = 1;

  // D12-D14: landscape two-column layout — paper LEFT, form RIGHT, max 640px.
  const PANEL_MAX_WIDTH = 640;

  if (isLandscape) {
    const halfW = width / 2;
    const dimOpacity = frame >= PRESS_START
      ? interpolate(frame, [PRESS_START, PRESS_START + 8], [0.65, 0.4], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : undefined;
    const blurPx = frame >= PRESS_START
      ? interpolate(frame, [PRESS_START, PRESS_START + 8], [0, 0.5], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : undefined;

    return (
      <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
        <NetworkBackgroundLayer variant="soft" />
        <NetworkBackground />

        {/* LEFT column — InvoicePaper vertically centered */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: halfW,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            boxSizing: "border-box",
          }}
        >
          <PaperBackdrop
            frame={frame}
            columnWidth={halfW}
            dimOpacity={dimOpacity}
            blurPx={blurPx}
          />
        </div>

        {/* RIGHT column — form + hints, maxWidth clamped */}
        <div
          style={{
            position: "absolute",
            left: halfW,
            top: 0,
            width: halfW,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", maxWidth: PANEL_MAX_WIDTH, position: "relative" }}>
            {/* Form Card — glow lives here, centered on the card (D40: no column-level glow) */}
            <Card
              style={{
                width: "100%",
                height: formHeight,
                padding: "24px",
                overflow: "hidden",
                opacity: formOpacity,
                zIndex: 2,
                backgroundColor: "rgba(14,14,19,0.95)",
                border: "1px solid rgba(63,63,70,0.5)",
                boxShadow: `0 16px 50px rgba(0,0,0,0.5), 0 0 ${glowSpread}px rgba(124,58,237,${glowIntensity * 0.5}), 0 0 60px rgba(124,58,237,${buttonGlowOpacity * 0.4}), 0 0 120px rgba(124,58,237,${buttonGlowOpacity * 0.2})`,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  transform: `translateY(${interpolate(
                    frame,
                    SCROLL_FRAMES_LANDSCAPE,
                    SCROLL_OFFSETS_LANDSCAPE,
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  )}px)`,
                }}
              >
                <div
                  className="remotion-create-scene"
                  style={{ position: "relative", width: "100%", fontSize: "inherit", overflowX: "visible", paddingRight: 8 }}
                >
                  {/* Header */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                    paddingBottom: 10,
                    borderBottom: "1px solid rgba(63, 63, 70, 0.5)",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "rgba(244, 244, 245, 1)",
                      letterSpacing: "-0.005em",
                      lineHeight: 1.2,
                    }}>
                      <span style={{ color: "#8b5cf6" }}>Invoice</span>
                      {" Details"}
                    </div>
                  </div>

                  <InvoiceFormView
                    value={viewValue}
                    {...(focusedField && { focusedField })}
                    showGenerateButton={false}
                  />

                  <div
                    style={{
                      marginTop: 12,
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
              </div>
            </Card>

            {/* HintBadges anchored to right column — same % coords, now relative to column */}
            <HintBadge
              text="No DB → link is the data"
              startAt={65}
              endAt={95}
              variant="arrow"
              fontSize={22}
              style={{ top: "21.6%", right: "6.7%", zIndex: 10 }}
            />
            <HintBadge
              text="Your wallet. No KYC. No bank."
              startAt={115}
              endAt={175}
              variant="arrow"
              fontSize={22}
              style={{ top: "27.3%", left: "3.9%", zIndex: 10 }}
            />
            <HintBadge
              text="Magic dust → unique payment ID"
              startAt={220}
              endAt={280}
              variant="arrow"
              fontSize={22}
              style={{ top: "51.6%", right: "6.7%", zIndex: 10 }}
            />
          </div>
        </div>

        {/* S1 captions — round-9l spec §4 (16:9 landscape) */}
        {captions.map((c, i) => (
          <Caption
            key={i}
            text={c.text}
            startAt={c.startAt}
            endAt={c.endAt}
            weight={c.weight}
            emphasizedWord={c.emphasizedWord}
            position={c.position}
            fontSize={c.fontSize}
            variant={c.variant ?? "violet"}
            springConfig={c.springConfig ?? "smooth"}
          />
        ))}
      </AbsoluteFill>
    );
  }

  // Portrait — existing implementation untouched
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
          padding: "36px",  // Mocks v2 surgical: 12px → 36px in 1080 viewport (×3)
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
              className="remotion-create-portrait"
              style={{
                position: "relative",
                width: "100%",
                // D5: removed height:"100%" — it capped the scrollable content at card-height,
                // preventing translateY from revealing below-the-fold sections. The Card's own
                // overflow:hidden clips at the card boundary; button is naturally clipped there.
                fontSize: "inherit",
                overflowX: "visible",              // ε1: prevents right-column clipping at Card edge
                paddingRight: 8,                   // ε1: small extra right pad so values don't touch border
              }}
            >
              {/* ×2 Tailwind cascade for 9:16 portrait — Mocks v2 density */}
              <style>{`
                .remotion-create-portrait .text-xs,
                .remotion-create-portrait [class*="text-[10px]"],
                .remotion-create-portrait [class*="text-[11px]"]  { font-size: 24px !important; line-height: 1.4 !important; }
                .remotion-create-portrait .text-sm                { font-size: 28px !important; line-height: 1.45 !important; }
                .remotion-create-portrait .text-base              { font-size: 32px !important; line-height: 1.5 !important; }
                .remotion-create-portrait .text-lg                { font-size: 36px !important; line-height: 1.5 !important; }
                .remotion-create-portrait .text-xl                { font-size: 40px !important; line-height: 1.4 !important; }
                .remotion-create-portrait .text-2xl               { font-size: 48px !important; line-height: 1.3 !important; }
                .remotion-create-portrait .text-3xl               { font-size: 60px !important; line-height: 1.2 !important; }
                .remotion-create-portrait .text-4xl               { font-size: 72px !important; line-height: 1.1 !important; }

                /* Form control heights */
                .remotion-create-portrait .h-7  { height: 56px !important; }
                .remotion-create-portrait .h-8  { height: 64px !important; }
                .remotion-create-portrait .h-9  { height: 72px !important; }
                .remotion-create-portrait .h-10 { height: 80px !important; }
                .remotion-create-portrait .h-11 { height: 88px !important; }
                /* D22: Generate button uses h-14 (56px) — scale to 112px for 2× portrait density */
                .remotion-create-portrait .h-14 { height: 112px !important; }

                /* Icon dimensions (lucide-react svg via w-N/h-N) */
                .remotion-create-portrait .w-3 { width: 24px !important; }
                .remotion-create-portrait .h-3 { height: 24px !important; }
                .remotion-create-portrait .w-4 { width: 32px !important; }
                .remotion-create-portrait .h-4 { height: 32px !important; }
                .remotion-create-portrait .w-5 { width: 40px !important; }
                .remotion-create-portrait .h-5 { height: 40px !important; }
                .remotion-create-portrait .w-6 { width: 48px !important; }
                .remotion-create-portrait .h-6 { height: 48px !important; }

                /* Padding scale-up (common form classes) */
                .remotion-create-portrait .p-0\\.5 { padding: 4px !important; }
                .remotion-create-portrait .p-1    { padding: 8px !important; }
                .remotion-create-portrait .p-1\\.5 { padding: 12px !important; }
                .remotion-create-portrait .p-2    { padding: 16px !important; }
                .remotion-create-portrait .p-3    { padding: 24px !important; }
                .remotion-create-portrait .p-4    { padding: 32px !important; }
                .remotion-create-portrait .px-2   { padding-left: 16px !important; padding-right: 16px !important; }
                .remotion-create-portrait .px-3   { padding-left: 24px !important; padding-right: 24px !important; }
                .remotion-create-portrait .py-1   { padding-top: 8px !important; padding-bottom: 8px !important; }
                .remotion-create-portrait .py-2   { padding-top: 16px !important; padding-bottom: 16px !important; }
                .remotion-create-portrait .py-2\\.5 { padding-top: 20px !important; padding-bottom: 20px !important; }
                .remotion-create-portrait .py-3   { padding-top: 24px !important; padding-bottom: 24px !important; }
                .remotion-create-portrait .pt-2   { padding-top: 16px !important; }
                .remotion-create-portrait .pt-4   { padding-top: 32px !important; }

                /* Gap scale-up */
                .remotion-create-portrait .gap-1   { gap: 8px !important; }
                .remotion-create-portrait .gap-1\\.5 { gap: 12px !important; }
                .remotion-create-portrait .gap-2   { gap: 16px !important; }
                .remotion-create-portrait .gap-3   { gap: 24px !important; }
                .remotion-create-portrait .gap-4   { gap: 32px !important; }

                /* Border radius — keep visually proportional */
                .remotion-create-portrait .rounded-lg { border-radius: 16px !important; }
                .remotion-create-portrait .rounded-xl { border-radius: 24px !important; }

                /* D3: CalendarIcon in date label uses inline size={12} (not Tailwind class) —
                   scale SVGs inside text-[10px] label spans to match cascade ×2 density */
                .remotion-create-portrait [class*="text-[10px]"] svg { width: 24px !important; height: 24px !important; }

                /* D15: Icons using size={N} prop render SVG width/height attributes directly —
                   not caught by Tailwind class cascade above. Scale ×2 for portrait density.
                   Covers: CoinsIcon(16), FingerprintIcon(16), AlertCircleIcon(12),
                           NetworkIcon(24), TokenIcon(24), Share2Icon(20), ArrowRightIcon(16),
                           Loader2Icon via h-5/w-5 (already covered above). */
                .remotion-create-portrait svg[width="12"]  { width: 24px !important; height: 24px !important; }
                .remotion-create-portrait svg[height="12"] { width: 24px !important; height: 24px !important; }
                .remotion-create-portrait svg[width="16"]  { width: 32px !important; height: 32px !important; }
                .remotion-create-portrait svg[height="16"] { width: 32px !important; height: 32px !important; }
                .remotion-create-portrait svg[width="20"]  { width: 40px !important; height: 40px !important; }
                .remotion-create-portrait svg[height="20"] { width: 40px !important; height: 40px !important; }
                .remotion-create-portrait svg[width="24"]  { width: 48px !important; height: 48px !important; }
                .remotion-create-portrait svg[height="24"] { width: 48px !important; height: 48px !important; }

                /* D23: animate-spin is a CSS keyframe — uncontrolled in Remotion (appears very fast).
                   Nullify it and replace with frame-driven rotation via CSS custom property
                   --remotion-spin injected on the wrapper div when isGenerating.
                   Rate: frame*8 = 240deg/s @ 30fps ≈ 1.5s/rev, matching production animate-spin. */
                .remotion-create-portrait .animate-spin {
                  animation: none !important;
                  transform: rotate(var(--remotion-spin, 0deg)) !important;
                }

                /* D30/D43: Switch toggle — track pill + thumb position.
                   Track: w-10→80px wide, h-5→40px tall (proper 2:1 pill)
                   Thumb: w-4→32px, h-4→32px (covered by icon cascade above)
                   ON: translateX(44px) = 80 - 32 - 2(right) - 2(left-0.5) = 44
                   OFF: translateX(0px) — left-0.5 (2px) handles left inset naturally
                   D43: explicit bg-color on track — Tailwind bg-violet-600/bg-zinc-700
                   classes may lose to cascade; force directly on aria-checked attribute. */
                .remotion-create-portrait .w-10 { width: 80px !important; }
                .remotion-create-portrait [role="switch"] {
                  transition: none !important;
                  border-radius: 9999px !important;
                }
                .remotion-create-portrait [role="switch"][aria-checked="true"] {
                  background: rgb(124, 58, 237) !important;
                }
                .remotion-create-portrait [role="switch"][aria-checked="false"] {
                  background: rgb(63, 63, 70) !important;
                }
                .remotion-create-portrait [role="switch"] span {
                  transition: none !important;
                }
                .remotion-create-portrait [role="switch"][aria-checked="true"] span {
                  transform: translateX(44px) !important;
                }
                .remotion-create-portrait [role="switch"][aria-checked="false"] span {
                  transform: translateX(0px) !important;
                }
              `}</style>

              {/* D2: Header matches production CreateWorkspace — violet "Invoice" + white " Details" */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(63, 63, 70, 0.5)",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "29px",
                  fontWeight: 700,
                  color: "rgba(244, 244, 245, 1)",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.2,
                }}>
                  <span style={{ color: "#8b5cf6" }}>Invoice</span>
                  {" Details"}
                </div>
              </div>

              <InvoiceFormView
                value={viewValue}
                {...(focusedField && { focusedField })}
                showGenerateButton={false}
              />

              {/* Round 9a-patch2 (C1): button always mounted at bottom of scroll content. */}
              {/* D23: --remotion-spin injects frame-driven rotation for the Loader2 spinner
                  (animate-spin CSS keyframe is disabled in the portrait cascade above). */}
              <div
                style={{
                  marginTop: 16,
                  transform: `scale(${interpolate(frame, [PRESS_START, PRESS_START + 2, PRESS_END - 2, PRESS_END], [1, 0.96, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  transformOrigin: "center",
                  ...(frame >= PRESS_END && { "--remotion-spin": `${frame * 8}deg` } as React.CSSProperties),
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

      {/* η7 (F2): Mocks v2 anchor top:21.6% right:6.7% — "No DB → link is the data" */}
      <HintBadge
        text="No DB → link is the data"
        startAt={65}
        endAt={95}
        variant="arrow"
        fontSize={34}
        style={{ top: "21.6%", right: "6.7%", zIndex: 10 }}
      />

      {/* η6 (F3): Mocks v2 anchor top:27.3% left:3.9% — "Your wallet. No KYC. No bank." */}
      <HintBadge
        text="Your wallet. No KYC. No bank."
        startAt={115}
        endAt={175}
        variant="arrow"
        fontSize={34}
        style={{ top: "27.3%", left: "3.9%", zIndex: 10 }}
      />

      {/* η2 (F4): Mocks v2 anchor top:51.6% right:6.7% — "Magic dust → unique payment ID" */}
      <HintBadge
        text="Magic dust → unique payment ID"
        startAt={220}
        endAt={280}
        variant="arrow"
        fontSize={34}
        style={{ top: "51.6%", right: "6.7%", zIndex: 10 }}
      />

      {/* S1 captions — round-9l spec §3 (9:16 portrait) */}
      {captions.map((c, i) => (
        <Caption
          key={i}
          text={c.text}
          startAt={c.startAt}
          endAt={c.endAt}
          weight={c.weight}
          emphasizedWord={c.emphasizedWord}
          position={c.position}
          fontSize={c.fontSize}
          variant={c.variant ?? "violet"}
          springConfig={c.springConfig ?? "smooth"}
        />
      ))}

    </AbsoluteFill>
  );
};
