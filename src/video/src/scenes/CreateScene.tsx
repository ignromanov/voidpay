import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
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
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS, TYPEWRITER_CHAR_FRAMES } from "../constants/timing";
import { Caption } from "../components/Caption";
import { DEMO_INVOICE } from "../constants/demo-invoice";

// Creative brief §2: Alex · UI Design · $250 USDC · Arbitrum
const INVOICE_FROM = "Alex";
const INVOICE_ITEM = "UI Design";
const INVOICE_SUBTOTAL = "250.00";
const INVOICE_TOTAL = "250.000042";
const INVOICE_TOKEN = "USDC";
const INVOICE_NETWORK = "Arbitrum";

// Phase frames — v2 compressed to 330-frame (11s) envelope per plan-v4 Task 6.
// Narrative beats finish by frame 270, leaving 60 frames to settle before cross-fade.
const FROM_START = 15;
const TOKEN_APPEAR = 45;
const NETWORK_APPEAR = 75;
const LINE_ITEM_APPEAR = 105;
const TOTAL_APPEAR = 150;
const BUTTON_APPEAR = 210;
const BUTTON_CLICK_FRAME = 270;

// Form scroll keyframes — the real InvoiceFormView renders 7 sections
// (Metadata, From, Client, LineItems, Payment, LinkOptions, Generate), which
// overflows the scene's form pane. We animate a translateY on the inner form
// so the viewer's eye follows the narrative beat: top → middle → bottom.
// Values tuned by eye from `remotion still` captures at each keyframe.
const SCROLL_FRAMES = [0, 90, 180, 270];
const SCROLL_OFFSETS = [0, -320, -640, -880];

/** Typewriter: reveal `text` char by char starting at `startFrame` */
const typewrite = (text: string, frame: number, startFrame: number): string => {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed / TYPEWRITER_CHAR_FRAMES);
  return text.slice(0, Math.min(chars, text.length));
};

export const CreateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Frame-driven snapshot for the real InvoiceFormView. Re-compute only when
  // frame crosses a phase boundary; within a phase the typewriter string is
  // the only thing moving so useMemo keyed on `frame` is correct here.
  const viewValue = useMemo(() => {
    const fromName = typewrite(INVOICE_FROM, frame, FROM_START);
    const tokenSymbol = frame >= TOKEN_APPEAR ? INVOICE_TOKEN : undefined;
    const networkLabel = frame >= NETWORK_APPEAR ? INVOICE_NETWORK : undefined;
    const lineItems = frame >= LINE_ITEM_APPEAR
      ? [{ description: INVOICE_ITEM, quantity: 1, rate: INVOICE_SUBTOTAL }]
      : undefined;
    const subtotal = frame >= TOTAL_APPEAR ? `${INVOICE_SUBTOTAL} ${INVOICE_TOKEN}` : undefined;
    const total = frame >= TOTAL_APPEAR ? `${INVOICE_TOTAL} ${INVOICE_TOKEN}` : undefined;
    return {
      invoiceId: "VP-0001",
      from: fromName ? { name: fromName } : undefined,
      ...(lineItems && { lineItems }),
      ...(tokenSymbol && { tokenSymbol }),
      ...(networkLabel && { networkLabel }),
      ...(subtotal && { subtotal }),
      ...(total && { total }),
      magicDustEnabled: true,
    };
  }, [frame]);

  // Focused field drives the violet ring — simulates the "user typing here"
  // beat during the typewriter flow. Undefined once everything is filled in.
  const focusedField: "from" | "token" | "network" | "lineItem" | undefined =
    frame < TOKEN_APPEAR
      ? "from"
      : frame < NETWORK_APPEAR
        ? "token"
        : frame < LINE_ITEM_APPEAR
          ? "network"
          : frame < TOTAL_APPEAR
            ? "lineItem"
            : undefined;

  // "Generate Link" button — the real InvoiceFormView renders it when
  // showGenerateButton is true. The pulse / click-scale glow is an overlay
  // behind the form so we can still drive a narrative beat without wrapping
  // the real Button.
  const buttonScale = frame >= BUTTON_CLICK_FRAME
    ? spring({ frame: frame - BUTTON_CLICK_FRAME, fps, config: SPRING_CONFIGS.snappy })
    : 0;
  const buttonGlowOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.8],
  );

  // Paper preview layout — depends only on composition size (P1.3 memoized).
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

      {/* Form panel (left) — real InvoiceFormView driven by frame snapshot.
          Outer wrapper holds the button-click glow so we don't reach into
          the widget's internal Button. */}
      <div
        style={{
          position: "absolute",
          left: width * 0.06,
          top: height * 0.06,
          width: width * 0.42,
          maxHeight: height * 0.88,
          background: "rgba(24, 24, 27, 0.85)",
          border: `1px solid ${COLORS.zinc800}`,
          borderRadius: 16,
          padding: 32,
          overflow: "hidden",
          boxShadow: frame >= BUTTON_APPEAR
            ? `0 0 ${20 + buttonGlowOpacity * 15}px ${COLORS.violetGlow}`
            : undefined,
          transform: frame >= BUTTON_CLICK_FRAME
            ? `scale(${0.99 + buttonScale * 0.01})`
            : undefined,
        }}
      >
        {/* Inner scroll shell — the real InvoiceFormView is taller than the
            scene pane, so we animate translateY by frame to walk the viewer
            through top → middle → bottom as sections fill in. */}
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
            showGenerateButton={frame >= BUTTON_APPEAR}
          />
        </div>
      </div>

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

      {/* v2 caption per creative-brief-v2 §4 — top-mounted to clear two-pane.
          5s visible hold (60→210 + 15fr fade) to weight the thesis beat and
          stay readable through mid-scene form population. */}
      <Caption text="No backend" position="top" startAt={60} endAt={210} />
    </AbsoluteFill>
  );
};
