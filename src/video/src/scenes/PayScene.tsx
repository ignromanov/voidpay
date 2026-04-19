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
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";
import { NetworkBackground } from "@/widgets/network-background";
import { Caption } from "../components/Caption";
import { DEMO_INVOICE } from "../constants/demo-invoice";

// Deterministic demo tx hash for the paid-state watermark
const DEMO_TX_HASH =
  "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456";

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase timing (local frames since each scene starts at 0)
  const WALLET_CONNECT = 30;
  const METAMASK_POPUP = 60;
  const NETWORK_BADGE = 120;
  const MAGIC_DUST_HIGHLIGHT = 220;
  const PROCESSING = 310;
  const SUCCESS = 380;

  // Card entrance
  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });

  // MetaMask popup
  const metaMaskScale = frame >= METAMASK_POPUP
    ? spring({ frame: frame - METAMASK_POPUP, fps, config: SPRING_CONFIGS.snappy })
    : 0;
  const metaMaskOpacity = frame >= METAMASK_POPUP
    ? interpolate(frame, [METAMASK_POPUP, METAMASK_POPUP + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const metaMaskDismiss = frame >= NETWORK_BADGE
    ? interpolate(frame, [NETWORK_BADGE, NETWORK_BADGE + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // Processing pulse
  const processingOpacity = frame >= PROCESSING && frame < SUCCESS
    ? interpolate(Math.sin((frame - PROCESSING) * 0.15), [-1, 1], [0.3, 1])
    : 0;

  // Success checkmark
  const successScale = frame >= SUCCESS
    ? spring({ frame: frame - SUCCESS, fps, config: SPRING_CONFIGS.bouncy })
    : 0;

  // Real InvoicePaper status transition — pending → paid at success frame.
  // Magic Dust styling comes from TotalsSection (real component) — violet
  // highlight in creative-brief is driven by overlay pulse on top of paper
  // at MAGIC_DUST_HIGHLIGHT, not by reimplementing digit colors.
  const isPaid = frame >= SUCCESS
  const paperPropsPending = {
    data: DEMO_INVOICE,
    status: "pending" as const,
    variant: "default" as const,
  }
  const paperPropsPaid = {
    data: DEMO_INVOICE,
    status: "paid" as const,
    txHash: DEMO_TX_HASH,
    variant: "default" as const,
  }

  // Scale real A4 paper (794×1123) to fit 560×700 band above the pay button
  const paperContainerW = 560
  const paperContainerH = height * 0.7
  const paperScale = Math.min(
    paperContainerW / INVOICE_BASE_WIDTH,
    paperContainerH / INVOICE_BASE_HEIGHT,
  )
  const paperScaledW = INVOICE_BASE_WIDTH * paperScale
  const paperScaledH = INVOICE_BASE_HEIGHT * paperScale

  // Violet pulse overlay on the total row when Magic Dust highlight hits
  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT - 5, MAGIC_DUST_HIGHLIGHT + 15, MAGIC_DUST_HIGHLIGHT + 60],
    [0, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  )

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Real InvoicePaper (center) — Arbitrum USDC invoice with Magic Dust.
          Spring-in on mount, status flips pending → paid at SUCCESS frame. */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - paperScaledW / 2,
          top: height * 0.05,
          width: paperScaledW,
          height: paperScaledH,
          transform: `scale(${cardScale})`,
          transformOrigin: "top center",
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
          <InvoicePaper {...(isPaid ? paperPropsPaid : paperPropsPending)} />
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

      {/* Wallet connect button */}
      <Sequence from={WALLET_CONNECT} premountFor={30}>
        <div style={{
          position: "absolute",
          left: width / 2 - 120,
          top: height * 0.72,
        }}>
          <div style={{
            background: "#09090b",
            border: `2px solid ${COLORS.violet}`,
            borderRadius: 16,
            padding: "16px 32px",
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 18,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            boxShadow: `0 0 20px ${COLORS.violetGlow}`,
          }}>
            {frame < PROCESSING ? "Smart Pay" : frame < SUCCESS ? "Sending..." : "Payment Complete ✓"}
          </div>
        </div>
      </Sequence>

      {/* MetaMask popup mockup */}
      {metaMaskOpacity * metaMaskDismiss > 0.01 && (
        <div style={{
          position: "absolute",
          right: width * 0.1,
          top: height * 0.15,
          width: 260,
          background: "#1a1a2e",
          borderRadius: 12,
          padding: 20,
          transform: `scale(${metaMaskScale})`,
          opacity: metaMaskOpacity * metaMaskDismiss,
          border: "1px solid #333",
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

      {/* Processing indicator */}
      {processingOpacity > 0.01 && (
        <div style={{
          position: "absolute",
          left: width / 2 - 100,
          top: height * 0.62,
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize: 16,
          color: COLORS.confirming,
          opacity: processingOpacity,
          textAlign: "center",
          width: 200,
        }}>
          Confirming on-chain...
        </div>
      )}

      {/* Success checkmark */}
      {successScale > 0.01 && (
        <div style={{
          position: "absolute",
          left: width / 2 - 40,
          top: height * 0.55,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: COLORS.success,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${successScale})`,
          fontSize: 40,
          color: "white",
        }}>
          ✓
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
