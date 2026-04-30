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

// Phase frames — round 4: Invoice No + Dates appear first so the viewer
// understands what document this is before the form fills out.
const INVOICE_NO_APPEAR = 10;
const DATES_APPEAR = 25;
const FROM_START = 35;
const WALLET_APPEAR = 50;
const CLIENT_APPEAR = 65;
const LINE_DESC_APPEAR = 80;
const LINE_PRICE_APPEAR = 95;
const NETWORK_APPEAR = 110;
const TOKEN_APPEAR = 120;
const BUTTON_VISIBLE = 130;

// Form scroll keyframes — delayed by 10fr so the form holds while
// the "is the URL" cross-fade from S0 completes before scrolling begins.
const SCROLL_FRAMES = [10, 50, 90, 130];
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

  // Violet glow overlay behind the card — pulses once Generate button appears.
  const buttonGlowOpacity =
    frame >= BUTTON_VISIBLE
      ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7])
      : 0;

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

      {/* Void glow overlay behind the form card — pulses when Generate button is visible */}
      {buttonGlowOpacity > 0 && (
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
      )}

      {/* Form panel (left) — real InvoiceFormView driven by frame snapshot.
          Uses inline GenerateButton (showGenerateButton=true) so the button
          scrolls into view naturally as the form fills out. */}
      <Card
        variant="glass"
        style={{
          position: "absolute",
          left: width * 0.06,
          top: height * 0.06,
          width: width * 0.36,
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

      {/* v2 caption per creative-brief-v2 §4 — top-mounted to clear two-pane. */}
      <Caption text="No backend" position="top" startAt={75} endAt={210} />

      <MicroLabel text="Filling out an invoice" startAt={5} endAt={55} x="8%" y="14%" anchor="left" />
      <MicroLabel text="Entire invoice encoded in the URL" startAt={140} endAt={190} x="56%" y="84%" anchor="left" />
    </AbsoluteFill>
  );
};
