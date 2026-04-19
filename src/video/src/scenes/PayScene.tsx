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
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";
import { NetworkBackground } from "@/widgets/network-background";
import { Caption } from "../components/Caption";
import { DEMO_INVOICE } from "../constants/demo-invoice";
import { Button } from "@/shared/ui";
import { CheckIcon, Loader2Icon } from "@/shared/ui/icons";

// Deterministic demo tx hash for the paid-state watermark
const DEMO_TX_HASH =
  "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456";

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

  // Scale real A4 paper (794×1123) to fit 560×700 band above the pay button.
  // Memoized on `height` — these derive from composition size, not frame, so
  // recomputing every frame is wasted work (P1.3).
  const { paperScale, paperScaledW, paperScaledH } = useMemo(() => {
    const containerW = 560
    const containerH = height * 0.7
    const scale = Math.min(
      containerW / INVOICE_BASE_WIDTH,
      containerH / INVOICE_BASE_HEIGHT,
    )
    return {
      paperScale: scale,
      paperScaledW: INVOICE_BASE_WIDTH * scale,
      paperScaledH: INVOICE_BASE_HEIGHT * scale,
    }
  }, [height])

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
          <InvoicePaper {...(isPaid ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING)} />
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
          <Button variant="void" size="lg" className="min-w-[240px]">
            {frame < PROCESSING ? (
              "Smart Pay"
            ) : frame < SUCCESS ? (
              "Sending..."
            ) : (
              <>
                <CheckIcon size={16} className="mr-2" />
                Payment Complete
              </>
            )}
          </Button>
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

      {/* Processing indicator — frame-driven rotation on Loader2Icon
          (CSS `animate-spin` is forbidden in Remotion per hard invariants). */}
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <Loader2Icon size={16} style={{ transform: `rotate(${frame * 6}deg)` }} />
          Confirming on-chain...
        </div>
      )}

      {/* Success checkmark — CheckIcon on emerald circle */}
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
          color: "white",
        }}>
          <CheckIcon size={48} strokeWidth={3} />
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
