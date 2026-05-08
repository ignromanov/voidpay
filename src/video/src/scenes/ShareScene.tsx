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
import { NetworkBackground } from "@/widgets/network-background";
import { InvoiceSummary } from "@/widgets/share-modal";
import { Card } from "@/shared/ui";
import { CheckCircleIcon } from "@/shared/ui/icons";
import { DEMO_FROM_ADDRESS, DEMO_INVOICE } from "../constants/demo-invoice";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";
import { RemotionLinkTab } from "../components/RemotionLinkTab";

// Full URL — 4x longer hash payload (~560 chars) so the LinkTab URL visibly
// truncates with ellipsis and reads as "very long / data-dense".
// og prefix carries recipient address for the address callback (creative-brief-v2 §4).
const HASH_PAYLOAD =
  "N4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBY" +
  "AuADgE4CuAxgC4DmAhgBYAuADgE4CuN4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxg" +
  "C4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4CuN4Igbghg" +
  "Tg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4Cu" +
  "AxgC4DmAhgBYAuADgE4CuN4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYA" +
  "uADgE4CuAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4Cu";
const SHARE_URL = `https://voidpay.xyz/pay?og=VP-0001_250_USDC_arb_${DEMO_FROM_ADDRESS}#${HASH_PAYLOAD}`;
// Frame at which the narrative "Copy" click fires (ε2: QR tab and social share removed).
const COPY_CLICK_FRAME = 110;

// Round 9c L2: InvoicePaper backdrop props — hoisted for prop-identity stability (P1.2).
const PAPER_PROPS = {
  data: DEMO_INVOICE,
  status: "pending",
  variant: "default",
} as const;


// Round 9c L2: PaperBackdrop — full-bleed InvoicePaper centered in viewport.
// Paper biased upward so modal at bottom doesn't overlap signature area.
const PaperBackdrop: React.FC = () => {
  const { width, height } = useVideoConfig();
  const targetWidth = width * 0.92;
  const scale = targetWidth / INVOICE_BASE_WIDTH;
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  const top = Math.max(40, (height - scaledH) / 2 - 80);

  return (
    <div
      style={{
        position: "absolute",
        left: (width - INVOICE_BASE_WIDTH * scale) / 2,
        top,
        width: INVOICE_BASE_WIDTH,
        height: INVOICE_BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      <InvoicePaper {...PAPER_PROPS} />
    </div>
  );
};


export const ShareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Modal slide-up
  const modalTranslateY = interpolate(
    spring({ frame, fps, config: SPRING_CONFIGS.smooth }),
    [0, 1],
    [200, 0],
  );
  const modalOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Narrative "copied" state: flips at COPY_CLICK_FRAME so the real LinkTab
  // shows its own "Copied!" affordance (CopyOverlay flash + icon swap).
  const copied = frame >= COPY_CLICK_FRAME + 10;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Round 9c L2: InvoicePaper as scene backdrop */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PaperBackdrop />
      </AbsoluteFill>

      {/* Dimmed backdrop — β3: reduced to 0.30 so paper reads clearly through */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.30)",
        opacity: modalOpacity,
      }} />

      {/* Share modal shell — γ4: true-center positioning, β3: solid background */}
      <Card
        // β3: solid background for readability over invoice paper backdrop
        className="border border-zinc-800/80"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 512,
          padding: 0,
          transform: `translate(-50%, -50%) translateY(${modalTranslateY}px)`,
          opacity: modalOpacity,
          overflow: "hidden",
          backgroundColor: "rgba(24, 24, 27, 0.96)",
          boxShadow: "0 25px 80px -20px rgba(0,0,0,0.8), 0 8px 32px -8px rgba(0,0,0,0.5)",
        }}
      >
        {/* Violet top gradient bar — matches real ShareModal */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)",
        }} />

        {/* Header — "Invoice Ready" pattern from ShareModal.tsx (px-6 pt-6 ≈ 24px) */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}>
            <CheckCircleIcon size={20} style={{ color: COLORS.violet }} />
            Invoice Ready
          </div>
          <div style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 14,
            color: "rgba(113, 113, 122, 1)",
            marginBottom: 16,
          }}>
            Share this link to get paid
          </div>

          {/* InvoiceSummary block — real widget component, presentational only */}
          <InvoiceSummary invoice={DEMO_INVOICE} />
        </div>

        {/* ε2: RemotionLinkTab — video-only fork, no social share, no QR tab */}
        <div style={{ padding: "0 24px 24px 24px" }}>
          <RemotionLinkTab url={SHARE_URL} copied={copied} />
        </div>
      </Card>

    </AbsoluteFill>
  );
};
