import { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
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
import { FONT_SANS } from "../fonts";
import { Caption } from "../components/Caption";
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
// Moved to module scope per remotion-best-practices/animations — keeps the
// render path branch-free and makes constants auditable at a glance.
const METAMASK_POPUP = 60;
const NETWORK_BADGE = 120;
const MAGIC_DUST_HIGHLIGHT = 220;
const CONFIRMING = 310;
const SUCCESS = 380;
const CONFIRMATIONS_REQUIRED = 12;

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Card entrance (shared by paper + panel so they rise together)
  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });

  // MetaMask popup — narrative beat (kept as overlay since real
  // PaymentPanel never shows the wallet approval dialog; that lives in the
  // wallet extension, not on the /pay page).
  const metaMaskScale = frame >= METAMASK_POPUP
    ? spring({ frame: frame - METAMASK_POPUP, fps, config: SPRING_CONFIGS.snappy })
    : 0;
  const metaMaskOpacity = frame >= METAMASK_POPUP
    ? interpolate(frame, [METAMASK_POPUP, METAMASK_POPUP + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const metaMaskDismiss = frame >= NETWORK_BADGE
    ? interpolate(frame, [NETWORK_BADGE, NETWORK_BADGE + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

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

  // Violet pulse overlay over the totals band — keeps the creative-brief
  // Magic Dust moment intact on top of the real InvoicePaper.
  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT - 5, MAGIC_DUST_HIGHLIGHT + 15, MAGIC_DUST_HIGHLIGHT + 60],
    [0, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Right-pane PaymentPanel props. Hoisting the paid-state props would
  // require conditional objects per-frame anyway, so keep them inline but
  // only pass `txHash` when paid (undefined in pending phases).
  const panelTxHash = panelStatus === "paid" ? DEMO_TX_HASH : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Left: real InvoicePaper (Arbitrum USDC invoice with Magic Dust) */}
      <div
        style={{
          position: "absolute",
          left: width * 0.06,
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
          right: width * 0.08,
          top: height * 0.18,
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
          {/* ActionSlot: the Pay CTA lives inside the panel per real /pay UX.
              Button label follows the narrative: Smart Pay → Sending → (done). */}
          {panelStatus === "pending" && (
            <Button variant="void" size="lg" className="w-full">
              {frame < METAMASK_POPUP
                ? "Smart Pay"
                : frame < NETWORK_BADGE
                  ? "Confirm in wallet…"
                  : "Smart Pay"}
            </Button>
          )}
        </PaymentPanel>
      </div>

      {/* MetaMask popup — narrative overlay, kept per creative-brief §5 */}
      {metaMaskOpacity * metaMaskDismiss > 0.01 && (
        <div style={{
          position: "absolute",
          right: width * 0.1,
          top: height * 0.08,
          width: 260,
          background: "#1a1a2e",
          borderRadius: 12,
          padding: 20,
          transform: `scale(${metaMaskScale})`,
          opacity: metaMaskOpacity * metaMaskDismiss,
          border: "1px solid #333",
          zIndex: 10,
        }}>
          <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 14, color: "#ffa500", fontWeight: 700, marginBottom: 8 }}>
            MetaMask
          </div>
          <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 13, color: "#ccc" }}>
            Connect to voidpay.xyz?
          </div>
          <div style={{
            marginTop: 12,
            background: "#3b82f6",
            borderRadius: 8,
            padding: "8px 16px",
            textAlign: "center",
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 14,
            fontWeight: 600,
            color: "white",
          }}>
            Connect
          </div>
        </div>
      )}

      {/* LOCKED captions from creative-brief.md §1, Scene 5a and 5b.
          Caption 5a fades out before 5b fades in (MAGIC_DUST_HIGHLIGHT=220). */}
      <Caption text="Connect. Confirm. Paid." startAt={30} endAt={200} />
      <Sequence from={MAGIC_DUST_HIGHLIGHT} premountFor={30}>
        <Caption text="Random micro-amount. Unique fingerprint. No database." startAt={0} fontSize={26} />
      </Sequence>
    </AbsoluteFill>
  );
};
