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
import { InvoiceFormView } from "@/widgets/invoice-form";
import { NetworkBackground } from "@/widgets/network-background";
import { Card } from "@/shared/ui";
import { COLORS } from "../constants/colors";
import { TYPEWRITER_CHAR_FRAMES } from "../constants/timing";
import { Caption } from "../components/Caption";
import { MicroLabel } from "../components/MicroLabel";
import { DEMO_INVOICE, DEMO_FROM_ADDRESS } from "../constants/demo-invoice";

// Creative brief §2: Alex · UI Design · $250 USDC · Arbitrum
const INVOICE_FROM = "Alex";
const INVOICE_ITEM = "UI Design";
const INVOICE_AMOUNT = "250.00";
const INVOICE_TOKEN = "USDC";
const INVOICE_NETWORK = "Arbitrum";

// Phase frames — round 6: compressed so all fields populate by frame 70
// (= scroll-end). Filling MicroLabel covers full window 5-70.
const INVOICE_NO_APPEAR = 5;
const DATES_APPEAR = 15;
const FROM_START = 22;
const WALLET_APPEAR = 30;
const CLIENT_APPEAR = 37;
const LINE_DESC_APPEAR = 44;
const LINE_PRICE_APPEAR = 50;
const NETWORK_APPEAR = 56;
const TOKEN_APPEAR = 62;
const BUTTON_VISIBLE = 70;

// Form scroll keyframes — finish all scroll motion at frame 54 (= mp4 04.133s).
const SCROLL_FRAMES = [10, 25, 40, 54];
const SCROLL_OFFSETS = [0, -200, -400, -560];

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
    frame < BUTTON_VISIBLE ? "token" :
    undefined;

  // Violet glow overlay behind the card — base glow always visible; pulse
  // intensifies after Generate button appears.
  const baseGlow = 0.25;
  const pulseDelta = frame >= BUTTON_VISIBLE
    ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.05, 0.4])
    : 0;
  const buttonGlowOpacity = baseGlow + pulseDelta;

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

      {/* Form panel (left) — real InvoiceFormView driven by frame snapshot.
          Uses inline GenerateButton (showGenerateButton=true) so the button
          scrolls into view naturally as the form fills out. */}
      {/* Round 5 — button press feedback at frame 140 (mp4 7.000s); S1 ends at frame 170 (mp4 8.000s). */}
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
          transform: `scale(${interpolate(frame, [138, 140, 155, 157], [1, 0.96, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
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
            showGenerateButton={true}
          />
        </div>
      </Card>

      {/* Preview paper (right) — real InvoicePaper, scaled to fit. */}
      <div
        style={{
          position: "absolute",
          right: width * 0.06 + (paperLayout.containerW - paperLayout.scaledW) / 2,
          top: height * 0.1 + (paperLayout.containerH - paperLayout.scaledH) / 2,
          width: paperLayout.scaledW,
          height: paperLayout.scaledH,
          opacity: interpolate(
            frame,
            [30, 90],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          transform: `translateY(${interpolate(
            frame,
            [30, 90],
            [20, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )}px)`,
        }}
      >
        <div
          style={{
            width: INVOICE_BASE_WIDTH,
            height: INVOICE_BASE_HEIGHT,
            transform: `scale(${paperLayout.scale})`,
            transformOrigin: "top left",
          }}
        >
          <InvoicePaper
            data={DEMO_INVOICE}
            status="pending"
            variant="default"
          />
        </div>
      </div>

      {/* Captions sequential per round-6 D2: No backend (75-125) → No signup (145-210). 20fr gap around No login anchor frame 126. */}
      <Caption text="No backend" position="top" startAt={75} endAt={125} />
      <Caption text="No signup" position="top" startAt={145} endAt={210} />

      {/* Filling MicroLabel — round 6: covers full scroll+fill window 5-70. */}
      <MicroLabel text="Filling out an invoice" startAt={5} endAt={70} x="8%" y="14%" anchor="left" />
      {/* No login persistent label — round 6 D4: starts S1-local 126 (= mp4 06.533s), persists into S2 (see ShareScene). y=14% top-center; Captions sit higher at position="top" so vertical stack is non-conflicting. */}
      <MicroLabel text="No login. No data stored." startAt={126} endAt={170} x="50%" y="14%" anchor="center" maxWidth={520} />
    </AbsoluteFill>
  );
};
