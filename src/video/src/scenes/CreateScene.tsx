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
const PAPER_PULSE_PEAK  = 255;  // midpoint of 50fr accent pulse
const PAPER_HOLD_END    = 280;  // paper acknowledged
const BUTTON_VISIBLE    = 280;  // round 9a: button reveals AFTER paper hold
const PRESS_START       = 290;
const PRESS_END         = 307;
// 307–320 post-press tail (last 20fr crossfade to S2)

// Form scroll keyframes — round 9a: stretched proportionally with cascade.
const SCROLL_FRAMES  = [115, 150, 175, 200];
const SCROLL_OFFSETS = [0, -130, -280, -420];

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
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
      magicDustEnabled: true,
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

  // Round 9a: violet pulse glow active throughout fill (Ignat: "пульсирование всё время с начала
  // заполнения до конца"). Pulse intensity peaks during cascade, then settles to a calm halo
  // after BUTTON_VISIBLE so the button hand-off doesn't compete with the glow rhythm.
  const baseGlow = 0.25;
  const fillPulseDelta =
    frame >= INVOICE_NO_APPEAR && frame < BUTTON_VISIBLE
      ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.05, 0.4])
      : 0;
  const settledHalo = frame >= BUTTON_VISIBLE
    ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.0, 0.15])  // calmer post-fill
    : 0;
  const buttonGlowOpacity = baseGlow + fillPulseDelta + settledHalo;

  // Paper preview layout — depends only on composition size.
  const paperLayout = useMemo(() => {
    const containerW = width * 0.38;
    const containerH = height * 0.8;
    const scale = Math.min(
      containerW / INVOICE_BASE_WIDTH,
      containerH / INVOICE_BASE_HEIGHT,
    );
    return {
      containerW,
      containerH,
      scale,
      scaledW: INVOICE_BASE_WIDTH * scale,
      scaledH: INVOICE_BASE_HEIGHT * scale,
    };
  }, [width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Void glow overlay behind the form card — always visible, pulses when Generate button appears */}
      <div
        style={{
          position: "absolute",
          left: width * 0.06 - 24,
          top: height * 0.06 - 24,
          width: width * 0.36 + 48,
          height: height * 0.88 + 48,
          borderRadius: 32,
          boxShadow: `0 0 60px rgba(124,58,237,${buttonGlowOpacity * 0.6}), 0 0 120px rgba(124,58,237,${buttonGlowOpacity * 0.3})`,
          pointerEvents: "none",
        }}
      />

      {/* Round 7 — Card holds form panel + button INSIDE the scroll-translated div.
          Button uses real GenerateButton from @/widgets/invoice-form (same component
          as production form). canGenerate forced to true once frame >= BUTTON_VISIBLE.
          Press-scale wrapper localized to the button only. */}
      <Card
        variant="glass"
        style={{
          position: "absolute",
          left: width * 0.06,
          top: height * 0.06,
          width: width * 0.36,
          height: height * 0.88,
          padding: 24,
          overflow: "hidden",
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
          <InvoiceFormView
            value={viewValue}
            {...(focusedField && { focusedField })}
            showGenerateButton={false}
          />

          {/* Round 9a: GenerateButtonView appears AFTER paper hold (BUTTON_VISIBLE=280).
              hoverState/pressState drive scale transforms without framer-motion.
              Outer div press-scale removed — GenerateButtonView handles it via pressState prop. */}
          {frame >= BUTTON_VISIBLE && (
            <GenerateButtonView
              onGenerate={noop}
              canGenerate={true}
              isGenerating={false}
              onSubmitAttempt={noop}
              hoverState={frame >= BUTTON_VISIBLE && frame < PRESS_START}
              pressState={frame >= PRESS_START && frame < PRESS_END}
            />
          )}
        </div>
      </Card>

      {/* Round 9a: InvoicePaper appears AFTER form fill complete (Ignat #1.3).
          Fade-in PAPER_APPEAR→PAPER_VISIBLE_AT. Violet accent pulse during 50fr hold
          (Ignat #1.15 follow-up: "можно тоже добавить пульсирование, чтобы акцентировать"). */}
      {frame >= PAPER_APPEAR && (
        <div
          style={{
            position: "absolute",
            right: width * 0.06 + (paperLayout.containerW - paperLayout.scaledW) / 2,
            top: height * 0.1 + (paperLayout.containerH - paperLayout.scaledH) / 2,
            width: paperLayout.scaledW,
            height: paperLayout.scaledH,
            opacity: interpolate(
              frame,
              [PAPER_APPEAR, PAPER_VISIBLE_AT],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
            transform: `translateY(${interpolate(
              frame,
              [PAPER_APPEAR, PAPER_VISIBLE_AT],
              [20, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )}px)`,
          }}
        >
          {/* Violet accent pulse around paper — peaks at PAPER_PULSE_PEAK, fades by PAPER_HOLD_END */}
          <div
            style={{
              position: "absolute",
              inset: -24,
              borderRadius: 16,
              boxShadow: `0 0 80px rgba(124,58,237,${interpolate(
                frame,
                [PAPER_VISIBLE_AT, PAPER_PULSE_PEAK, PAPER_HOLD_END],
                [0, 0.55, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )}), 0 0 160px rgba(124,58,237,${interpolate(
                frame,
                [PAPER_VISIBLE_AT, PAPER_PULSE_PEAK, PAPER_HOLD_END],
                [0, 0.3, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )})`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              width: INVOICE_BASE_WIDTH,
              height: INVOICE_BASE_HEIGHT,
              transform: `scale(${paperLayout.scale})`,
              transformOrigin: "top left",
            }}
          >
            <InvoicePaper data={DEMO_INVOICE} status="pending" variant="default" />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
