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
import { PaymentPanel } from "@/widgets/payment-panel";
import { Button } from "@/shared/ui";
import { NetworkBackground } from "@/widgets/network-background";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { Caption } from "../components/Caption";
import { MicroLabel } from "../components/MicroLabel";
import { RemotionFakeToast } from "../components/RemotionFakeToast";
import { DEMO_INVOICE, DEMO_CONTENT_HASH } from "../constants/demo-invoice";

// Deterministic demo tx hash for the paid-state watermark
const DEMO_TX_HASH =
  "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456" as const;

// Hoisted to module scope so prop identities are stable across every frame —
// prevents InvoicePaper re-renders from fresh object references (P1.2).
const PAPER_PROPS_PENDING = {
  data: DEMO_INVOICE,
  status: "pending",
  variant: "default",
} as const;

const PAPER_PROPS_PAID = {
  data: DEMO_INVOICE,
  status: "paid",
  txHash: DEMO_TX_HASH,
  variant: "default",
} as const;

// Phase timing (local frames since each scene starts at 0).
// v2 envelope = 510 frames (17s). Magic Dust peak holds for 120 frames
// (frames 240–360) per creative-brief-v2 §3 & plan-v4 Task 8.
const MAGIC_DUST_HIGHLIGHT = 240;
// Estimated rendered height of PaymentPanel — used to vertically center it.
const PANEL_HEIGHT = 580;
const MAGIC_DUST_PEAK_END = 360;
const CONFIRMING = 360;
const SUCCESS = 480;
const CONFIRMATIONS_REQUIRED = 12;

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Card entrance (shared by paper + panel so they rise together)
  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });

  // Drive PaymentPanel's status by frame. The panel's internal StatusBadge,
  // gradient bar, and AnimatePresence swap between pending → confirming →
  // paid states based on this prop alone — no other wiring needed.
  const panelStatus: "pending" | "confirming" | "paid" =
    frame >= SUCCESS ? "paid" : frame >= CONFIRMING ? "confirming" : "pending";

  // Confirmation progress during the confirming phase. Clamped 0→12 (standard
  // Arbitrum finality requirement, matches real PaymentPanel's default).
  const confirmationsCurrent = Math.round(
    interpolate(frame, [CONFIRMING, SUCCESS], [0, CONFIRMATIONS_REQUIRED], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const confirmations = useMemo(
    () => ({
      current: confirmationsCurrent,
      required: CONFIRMATIONS_REQUIRED,
    }),
    [confirmationsCurrent],
  );

  // Scale real A4 paper (794×1123) to fit the left pane.
  const { paperScale, paperScaledW, paperScaledH } = useMemo(() => {
    const containerW = width * 0.42;
    const containerH = height * 0.82;
    const scale = Math.min(
      containerW / INVOICE_BASE_WIDTH,
      containerH / INVOICE_BASE_HEIGHT,
    );
    return {
      paperScale: scale,
      paperScaledW: INVOICE_BASE_WIDTH * scale,
      paperScaledH: INVOICE_BASE_HEIGHT * scale,
    };
  }, [width, height]);

  // Violet pulse overlay over the totals band — v2 holds max-emphasis for
  // 120 frames (4s) per creative-brief-v2 §8 non-negotiable, then fades out
  // before the confirming phase starts.
  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT - 10, MAGIC_DUST_HIGHLIGHT + 10, MAGIC_DUST_PEAK_END - 10, MAGIC_DUST_PEAK_END + 10],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Right-pane PaymentPanel props. Pass txHash also during confirming so
  // PaidConfirmation renders with confirmation progress (0→12) instead of
  // the "Payment detected / Verifying..." fallback (plan-v5 C2).
  const panelTxHash = panelStatus !== "pending" ? DEMO_TX_HASH : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Left: real InvoicePaper (Arbitrum USDC invoice with Magic Dust) */}
      <div
        style={{
          position: "absolute",
          left: width * 0.08,
          top: height * 0.09,
          width: paperScaledW,
          height: paperScaledH,
          transform: `scale(${cardScale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            width: INVOICE_BASE_WIDTH,
            height: INVOICE_BASE_HEIGHT,
            transform: `scale(${paperScale})`,
            transformOrigin: "top left",
          }}
        >
          <InvoicePaper
            {...(panelStatus === "paid" ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING)}
          />
        </div>

        {/* Magic Dust violet pulse — halo over the totals band */}
        {magicDustPulseOpacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: paperScaledH * 0.22,
              height: 120,
              background: `radial-gradient(ellipse at center, ${COLORS.violetGlow} 0%, transparent 70%)`,
              opacity: magicDustPulseOpacity,
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          />
        )}
      </div>

      {/* Right: real PaymentPanel — frame drives status, confirmations, txHash.
          Width matches the real /pay layout (max-w-md ~= 448px) so the widget
          renders at its intended density rather than stretched. */}
      <div
        style={{
          position: "absolute",
          right: width * 0.18,
          top: (height - PANEL_HEIGHT) / 2,
          width: 480,
          transform: `scale(${cardScale})`,
          transformOrigin: "top right",
        }}
      >
        <PaymentPanel
          invoice={DEMO_INVOICE}
          contentHash={DEMO_CONTENT_HASH}
          status={panelStatus}
          txHash={panelTxHash}
          confirmations={confirmations}
          source="received"
          finalized={panelStatus === "paid"}
        >
          {/* ActionSlot: the Pay CTA lives inside the panel per real /pay UX. */}
          {panelStatus === "pending" && (
            <Button variant="void" size="lg" className="w-full">
              Smart Pay
            </Button>
          )}
        </PaymentPanel>
      </div>

      {/* v2 caption per creative-brief-v2 §4 — top-mounted, aligned with
          the 120-frame Magic Dust peak (local frames 240–360). */}
      <Caption text="Cryptographic receipt" position="top" startAt={240} endAt={360} />

      <MicroLabel text="No account — wallet is the identity" startAt={30} endAt={90} x="62%" y="20%" anchor="left" maxWidth={420} />
      <MicroLabel text="Network matches the invoice" startAt={120} endAt={180} x="62%" y="20%" anchor="left" maxWidth={420} />
      <MicroLabel text="Micro-amount added for exact matching" startAt={240} endAt={330} x="8%" y="84%" anchor="left" maxWidth={520} />
      <MicroLabel text="Verified on-chain. Payment complete." startAt={990} endAt={1050} x="62%" y="84%" anchor="left" maxWidth={520} />

      {/* Narrative toasts — anchored below panel right edge (plan-v5 C3) */}
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={60} hold={60} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={360} hold={90} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={480} hold={120} stackOffset={0} anchor="below-panel" />
    </AbsoluteFill>
  );
};
