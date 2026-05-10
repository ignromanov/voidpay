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
import { Caption } from "../components/Caption";
import { HintBadge } from "../components/HintBadge";

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
      {/* ζ3: top shifted 50%→48% — paper mass occupies upper frame, modal visual center is slightly
           below mathematical center; 48% places it in the visual center of the dark space below paper */}
      {/* θ5: width 512→600 for density; ι2: 600→660 (+10%) to absorb ×1.5 internal text scaling */}
      <Card
        // β3: solid background for readability over invoice paper backdrop
        className="border border-zinc-800/80"
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          width: 660,
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

        {/* Header — "Invoice Ready" pattern from ShareModal.tsx; ι2: padding + sizes ×1.5 */}
        <div style={{ padding: "24px 32px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}>
            <CheckCircleIcon size={30} style={{ color: COLORS.violet }} />
            Invoice Ready
          </div>
          <div style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 21,
            color: "rgba(113, 113, 122, 1)",
            marginBottom: 24,
          }}>
            Share this link to get paid
          </div>

          {/* InvoiceSummary block — real widget component, presentational only */}
          <InvoiceSummary invoice={DEMO_INVOICE} />
        </div>

        {/* θ5: Tab switcher — Link/QR tabs, matching production ShareModal density.
             Reverts ε2 simplification. Shows Link tab first, then demonstrates QR tab switch.
             Tab switch fires at COPY_CLICK_FRAME (f110) so viewer sees both tabs. */}
        {/* ι2: tab section padding scaled; tab height 34→44px; fontSize 13→20px */}
        <div style={{ padding: "0 32px 12px 32px" }}>
          {/* Tab bar — production-parity: full-width, Link + QR Code */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "rgba(39, 39, 42, 0.6)",
            borderRadius: 8,
            padding: 4,
            marginBottom: 18,
          }}>
            {(["Link", "QR Code"] as const).map((label) => {
              // θ5: Link tab active before COPY_CLICK_FRAME, QR Code tab active after
              const isActive = frame < COPY_CLICK_FRAME
                ? label === "Link"
                : label === "QR Code";
              return (
                <div
                  key={label}
                  style={{
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    fontSize: 20,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "rgba(244, 244, 245, 1)" : "rgba(113, 113, 122, 1)",
                    background: isActive ? "rgba(63, 63, 70, 0.8)" : "transparent",
                    fontFamily: `${FONT_SANS}, sans-serif`,
                    letterSpacing: "-0.01em",
                    transition: "none",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* θ5: Full production density RemotionLinkTab */}
        <div style={{ padding: "0 32px 32px 32px" }}>
          <RemotionLinkTab url={SHARE_URL} copied={copied} />
        </div>
      </Card>

      {/* η5: "invoice data →" ghost hint — κ-4 fix: moved outside Card to avoid overflow:hidden clip.
           Was: inside relative div at right:12, top:8 — clipped by Card overflow:hidden, never visible.
           Now: AbsoluteFill-level overlay, anchored to the right side of the URL permalink box.
           Card center-x ≈ 50vw; card width=660; permalink box right edge ≈ 50%+330-32 = 50%+298.
           Top: modal top ≈ 48%−(cardHeight/2); permalink box starts ~330px from card top.
           Using percentage-free px: right side of URL box is at roughly 68% from left (50%+18%).
           Position: right of URL box, at the hash fragment zone — ghost annotation, no background.
           startAt=80 endAt=160 per R2 spec; fontSize=24 per ι2 judgment. */}
      <HintBadge
        text="invoice data →"
        startAt={80}
        endAt={160}
        variant="ghost"
        fontSize={24}
        style={{
          left: "calc(50% + 140px)",
          top: "calc(48% - 90px)",
          zIndex: 20,
        }}
      />

      {/* ζ4: Spark caption — Content Anchor #3 "Payments can be reduced to pure data"
           startAt=60 local: modal fully entered by ~f20, 60fr stagger lets viewer read header first.
           endAt=250: persists through Copy click at ~f120, fades before quiet hold at f250. */}
      <Caption
        text="URL = invoice."
        position="top"
        startAt={60}
        endAt={250}
        fontSize={38}
      />

    </AbsoluteFill>
  );
};
