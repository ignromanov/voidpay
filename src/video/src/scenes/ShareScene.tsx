import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// D27: instant tab swap — 1-frame window eliminates blink where both tabs at half opacity
const TAB_CROSSFADE_DURATION = 1;
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
import { RemotionQRTab } from "../components/RemotionQRTab";
import { Caption } from "../components/Caption";
import { HintBadge } from "../components/HintBadge";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";

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
// Frame at which the narrative "Copy" click fires — Link tab dominant 0-208 (~6.9s share dominance),
// QR tab demonstrative 200-300 (~3.3s). Ignat 2026-05-11: share is the primary action, QR is the alternative.
const COPY_CLICK_FRAME = 200;

// Round 9c L2: InvoicePaper backdrop props — hoisted for prop-identity stability (P1.2).
const PAPER_PROPS = {
  data: DEMO_INVOICE,
  status: "pending",
  variant: "default",
} as const;


// Round 9c L2: PaperBackdrop — full-bleed InvoicePaper centered in viewport.
// C5: accepts dim opacity + blur for modal-foregrounded frames (F6-F8).
// C10: true vertical center per Mocks v2 .paper anchor (top:50% translate -50%).
// containerWidth/containerHeight: override for landscape column mode (default = full viewport).
const PaperBackdrop: React.FC<{
  dimOpacity: number;
  blurPx: number;
  containerWidth?: number;
  containerHeight?: number;
}> = ({ dimOpacity, blurPx, containerWidth, containerHeight }) => {
  const { width, height } = useVideoConfig();
  const cw = containerWidth ?? width;
  const ch = containerHeight ?? height;
  const targetWidth = cw * 0.92;
  const scale = targetWidth / INVOICE_BASE_WIDTH;
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  // D36: clamp top to 16px min — scaledH may exceed ch in landscape (1123*scale > viewport height),
  // which would produce negative top and cause paper to overflow above screen edge.
  const topCentered = (ch - scaledH) / 2;
  const top = Math.max(16, topCentered);

  return (
    <div
      style={{
        position: "absolute",
        left: (cw - INVOICE_BASE_WIDTH * scale) / 2,
        top,
        width: INVOICE_BASE_WIDTH,
        height: INVOICE_BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        opacity: dimOpacity,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      }}
    >
      <InvoicePaper {...PAPER_PROPS} />
    </div>
  );
};


export const ShareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isLandscape = width > height;
  // Mocks v2 surgical: modal width = 84% of stage width (portrait only)
  const modalWidth = Math.round(width * 0.84);

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

  // κ-5 RC-6: tab body and indicator must swap at the same frame (COPY_CLICK_FRAME).
  // "copied" fires 10fr BEFORE the tab swap so viewer sees "Copied!" on the Link
  // tab briefly, then the whole tab (indicator + body) flips to QR Code together.
  const showQR = frame >= COPY_CLICK_FRAME;
  const copied = frame >= COPY_CLICK_FRAME - 10;

  // F4.4: 8fr cross-fade opacity drivers for tab body transition.
  // Link tab fades out [COPY_CLICK_FRAME, COPY_CLICK_FRAME+8].
  // QR tab fades in [COPY_CLICK_FRAME, COPY_CLICK_FRAME+8].
  const linkTabOpacity = interpolate(
    frame,
    [COPY_CLICK_FRAME, COPY_CLICK_FRAME + TAB_CROSSFADE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const qrTabOpacity = interpolate(
    frame,
    [COPY_CLICK_FRAME, COPY_CLICK_FRAME + TAB_CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Shared animation values used in both portrait and landscape
  const dimOpacity = interpolate(frame, [0, 15, COPY_CLICK_FRAME], [0.35, 0.35, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blurPx = interpolate(frame, [0, 15, COPY_CLICK_FRAME], [1.5, 1.5, 2.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Landscape (16:9) — two-column layout ───────────────────────────────────
  if (isLandscape) {
    const PANEL_MAX_WIDTH = 640;
    const colW = width / 2;

    return (
      <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
        <NetworkBackgroundLayer variant="soft" />
        <NetworkBackground />

        {/* LEFT — paper, vertically centered in left half */}
        {/* D37: landscape paper must never blur/dim — invoice stays fully readable as persistent context */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: colW,
            height: "100%",
          }}
        >
          <PaperBackdrop
            dimOpacity={1}
            blurPx={0}
            containerWidth={colW}
            containerHeight={height}
          />
        </div>

        {/* RIGHT — modal + hint badge, maxWidth capped */}
        <div
          style={{
            position: "absolute",
            left: colW,
            top: 0,
            width: colW,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", maxWidth: PANEL_MAX_WIDTH, position: "relative" }}>
            {/* η5 HintBadge — anchored relative to right column */}
            <HintBadge
              text="invoice data → in the hash"
              startAt={80}
              endAt={160}
              variant="arrow"
              fontSize={20}
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                zIndex: 20,
              }}
            />

            {/* Share modal shell */}
            <Card
              className="border border-zinc-800/80"
              style={{
                position: "relative",
                width: "100%",
                padding: 0,
                transform: `translateY(${modalTranslateY}px)`,
                opacity: modalOpacity,
                overflow: "hidden",
                backgroundColor: "rgba(24, 24, 27, 0.96)",
                border: "1px solid rgba(139,92,246,0.25)",
                boxShadow: "0 25px 80px -20px rgba(0,0,0,0.8), 0 8px 32px -8px rgba(0,0,0,0.5)",
                borderRadius: 20,
              }}
            >
              {/* Violet top gradient bar */}
              <div style={{
                height: 4,
                background: "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)",
              }} />

              {/* Header */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: `${FONT_SANS}, sans-serif`,
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}>
                  <CheckCircleIcon size={26} style={{ color: COLORS.violet }} />
                  Invoice Ready
                </div>
                <div style={{
                  fontFamily: `${FONT_SANS}, sans-serif`,
                  fontSize: 18,
                  color: "rgba(113, 113, 122, 1)",
                  marginBottom: 16,
                }}>
                  Share this link to get paid
                </div>

                {/* InvoiceSummary */}
                <div className="remotion-summary-override remotion-summary-landscape">
                  <style>{`
                    .remotion-summary-landscape .text-base,
                    .remotion-summary-landscape .text-lg { font-size: 22px !important; line-height: 1.2 !important; }
                    .remotion-summary-landscape .font-mono { font-family: monospace !important; }
                    .remotion-summary-landscape .font-extrabold { font-weight: 800 !important; }
                    .remotion-summary-landscape .tabular-nums { font-variant-numeric: tabular-nums !important; }
                    .remotion-summary-landscape .text-zinc-100 { color: #f4f4f5 !important; }
                    .remotion-summary-landscape .text-xs { font-size: 14px !important; line-height: 1.4 !important; }
                    .remotion-summary-landscape .text-zinc-500 { color: #a1a1aa !important; }
                    .remotion-summary-landscape .text-violet-400 { color: #a78bfa !important; }
                    .remotion-summary-landscape .bg-violet-500\\/10 { background-color: rgba(139,92,246,0.15) !important; }
                    .remotion-summary-landscape .px-1\\.5 { padding-left: 6px !important; padding-right: 6px !important; }
                    .remotion-summary-landscape .py-0\\.5 { padding-top: 3px !important; padding-bottom: 3px !important; }
                    .remotion-summary-landscape .rounded { border-radius: 6px !important; }
                    .remotion-summary-landscape .font-semibold { font-weight: 600 !important; }
                    .remotion-summary-landscape .gap-2 { gap: 10px !important; }
                    .remotion-summary-landscape .px-3 { padding-left: 14px !important; padding-right: 14px !important; }
                    .remotion-summary-landscape .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
                    .remotion-summary-landscape .sm\\:px-4 { padding-left: 16px !important; padding-right: 16px !important; }
                    .remotion-summary-landscape .sm\\:py-3 { padding-top: 12px !important; padding-bottom: 12px !important; }
                    .remotion-summary-landscape .gap-3 { gap: 12px !important; }
                    .remotion-summary-landscape .rounded-lg { border-radius: 8px !important; }
                  `}</style>
                  <InvoiceSummary invoice={DEMO_INVOICE} />
                </div>
              </div>

              {/* Tab switcher */}
              <div style={{ padding: "0 24px 12px 24px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  background: "rgba(39, 39, 42, 1)",
                  borderRadius: 8,
                  padding: 4,
                  marginBottom: 12,
                }}>
                  {(["Link", "QR Code"] as const).map((label) => {
                    const isActive = showQR ? label === "QR Code" : label === "Link";
                    return (
                      <div
                        key={label}
                        style={{
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 6,
                          fontSize: 18,
                          fontWeight: isActive ? 500 : 400,
                          color: isActive ? "rgba(244, 244, 245, 1)" : "rgba(113, 113, 122, 1)",
                          background: isActive ? "rgba(24, 24, 27, 1)" : "transparent",
                          boxShadow: isActive ? "0 1px 3px 0 rgba(0,0,0,0.4)" : "none",
                          fontFamily: `${FONT_SANS}, sans-serif`,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tab body — D33: same pre-mount + absolute-when-swapping fix as portrait */}
              <div style={{ padding: "0 24px 24px 24px", position: "relative" }}>
                <div style={{
                  opacity: linkTabOpacity,
                  position: showQR ? "absolute" : "relative",
                  top: showQR ? 0 : undefined,
                  left: showQR ? 0 : undefined,
                  right: showQR ? 0 : undefined,
                  pointerEvents: linkTabOpacity > 0 ? "auto" : "none",
                }}>
                  <RemotionLinkTab url={SHARE_URL} copied={copied} />
                </div>
                {frame >= COPY_CLICK_FRAME - 1 && (
                  <div style={{ opacity: qrTabOpacity }}>
                    <RemotionQRTab url={SHARE_URL} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* ζ4 Caption — AbsoluteFill level, spans full viewport */}
        <Caption
          text="URL = invoice."
          position="top"
          startAt={60}
          endAt={290}
          fontSize={32}
        />
      </AbsoluteFill>
    );
  }

  // ─── Portrait (9:16) — unchanged ────────────────────────────────────────────
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* Round 9c L2: InvoicePaper as scene backdrop.
           C5: F6 entrance 0.35/1.5px → F7/F8 0.3/2px — modal is always foregrounded in S2. */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PaperBackdrop dimOpacity={dimOpacity} blurPx={blurPx} />
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
      {/* Mocks v2 surgical: width = 84% of stage, side padding = 36px (12px × 3) */}
      <Card
        // β3: solid background for readability over invoice paper backdrop
        className="border border-zinc-800/80"
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          width: modalWidth,
          padding: 0,
          transform: `translate(-50%, -50%) translateY(${modalTranslateY}px)`,
          opacity: modalOpacity,
          overflow: "hidden",
          backgroundColor: "rgba(24, 24, 27, 0.96)",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 25px 80px -20px rgba(0,0,0,0.8), 0 8px 32px -8px rgba(0,0,0,0.5)",
          borderRadius: 30,
        }}
      >
        {/* Violet top gradient bar — matches real ShareModal */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)",
        }} />

        {/* Header — "Invoice Ready" pattern from ShareModal.tsx; ι2: padding + sizes ×1.5 */}
        {/* F8 surgical: header fontSize 30→39, subtitle 21→27, padding 24px→30px/36px */}
        <div style={{ padding: "30px 36px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 39,
            fontWeight: 700,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}>
            <CheckCircleIcon size={39} style={{ color: COLORS.violet }} />
            Invoice Ready
          </div>
          <div style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 27,
            color: "rgba(113, 113, 122, 1)",
            marginBottom: 24,
          }}>
            Share this link to get paid
          </div>

          {/* InvoiceSummary block — real widget component, presentational only.
               D6: cascade overrides for amount sum (text-base/lg→36px) + network chip (text-xs→22px).
               F4.2: sub-line text min 24px for 9:16 legibility. */}
          <div className="remotion-summary-override">
            <style>{`
              .remotion-summary-override .text-base,
              .remotion-summary-override .text-lg { font-size: 36px !important; line-height: 1.2 !important; }
              .remotion-summary-override .font-mono { font-family: monospace !important; }
              .remotion-summary-override .font-extrabold { font-weight: 800 !important; }
              .remotion-summary-override .tabular-nums { font-variant-numeric: tabular-nums !important; }
              .remotion-summary-override .text-zinc-100 { color: #f4f4f5 !important; }
              .remotion-summary-override .text-xs { font-size: 22px !important; line-height: 1.4 !important; }
              .remotion-summary-override .text-zinc-500 { color: #a1a1aa !important; }
              .remotion-summary-override .text-violet-400 { color: #a78bfa !important; }
              .remotion-summary-override .bg-violet-500\\/10 { background-color: rgba(139,92,246,0.15) !important; }
              .remotion-summary-override .px-1\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
              .remotion-summary-override .py-0\\.5 { padding-top: 4px !important; padding-bottom: 4px !important; }
              .remotion-summary-override .rounded { border-radius: 6px !important; }
              .remotion-summary-override .font-semibold { font-weight: 600 !important; }
              .remotion-summary-override .gap-2 { gap: 16px !important; }
              .remotion-summary-override .px-3 { padding-left: 24px !important; padding-right: 24px !important; }
              .remotion-summary-override .py-2\\.5 { padding-top: 18px !important; padding-bottom: 18px !important; }
              .remotion-summary-override .sm\\:px-4 { padding-left: 28px !important; padding-right: 28px !important; }
              .remotion-summary-override .sm\\:py-3 { padding-top: 20px !important; padding-bottom: 20px !important; }
              .remotion-summary-override .gap-3 { gap: 18px !important; }
              .remotion-summary-override .rounded-lg { border-radius: 12px !important; }
            `}</style>
            <InvoiceSummary invoice={DEMO_INVOICE} />
          </div>
        </div>

        {/* θ5: Tab switcher — Link/QR tabs, matching production ShareModal density.
             Reverts ε2 simplification. Shows Link tab first, then demonstrates QR tab switch.
             Tab switch fires at COPY_CLICK_FRAME (f110) so viewer sees both tabs. */}
        {/* F8 surgical: tab section side padding = 36px; tab height 44→54px; fontSize 20→28.5px */}
        <div style={{ padding: "0 36px 18px 36px" }}>
          {/* Tab bar — production-parity: full-width, Link + QR Code.
               Production: TabsList = bg-muted (zinc-800 pill) p-1 rounded-lg h-9 w-full.
               TabsTrigger active = bg-background (zinc-900 card) shadow rounded-md.
               TabsTrigger inactive = text-muted-foreground (zinc-400), no background. */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "rgba(39, 39, 42, 1)",
            borderRadius: 8,
            padding: 4,
            marginBottom: 18,
          }}>
            {(["Link", "QR Code"] as const).map((label) => {
              // κ-5: tab indicator and body both switch at COPY_CLICK_FRAME via showQR
              const isActive = showQR
                ? label === "QR Code"
                : label === "Link";
              return (
                <div
                  key={label}
                  style={{
                    height: 54,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 6,
                    fontSize: 28.5,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "rgba(244, 244, 245, 1)" : "rgba(113, 113, 122, 1)",
                    // Active: bg-background card + shadow (production data-[state=active]:bg-background data-[state=active]:shadow)
                    background: isActive ? "rgba(24, 24, 27, 1)" : "transparent",
                    boxShadow: isActive ? "0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)" : "none",
                    fontFamily: `${FONT_SANS}, sans-serif`,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* κ-5 RC-6 + F4.4: body cross-fades between Link and QR over 1fr (TAB_CROSSFADE_DURATION).
             D33: both tabs always rendered; wrapper uses position:relative for the visible tab and
             position:absolute for the fading tab — container height never collapses because QR is
             pre-mounted one frame before swap (COPY_CLICK_FRAME-1) so no empty-box frame exists. */}
        {/* F8 surgical: body side padding = 36px */}
        <div style={{ padding: "0 36px 36px 36px", position: "relative" }}>
          {/* Link tab — fades out at COPY_CLICK_FRAME; absolute while fading so QR holds height */}
          <div style={{
            opacity: linkTabOpacity,
            position: showQR ? "absolute" : "relative",
            top: showQR ? 0 : undefined,
            left: showQR ? 0 : undefined,
            right: showQR ? 0 : undefined,
            pointerEvents: linkTabOpacity > 0 ? "auto" : "none",
          }}>
            <RemotionLinkTab url={SHARE_URL} copied={copied} />
          </div>
          {/* QR tab — pre-mounted 1 frame before swap so no empty-box frame at COPY_CLICK_FRAME */}
          {frame >= COPY_CLICK_FRAME - 1 && (
            <div style={{ opacity: qrTabOpacity }}>
              <RemotionQRTab url={SHARE_URL} />
            </div>
          )}
        </div>
      </Card>

      {/* η5 (F7): Mocks v2 anchor top:31.3% right:3.9% — "invoice data → in the hash" */}
      <HintBadge
        text="invoice data → in the hash"
        startAt={80}
        endAt={160}
        variant="arrow"
        fontSize={24}
        style={{
          top: "31.3%",
          right: "3.9%",
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
        endAt={290}
        fontSize={38}
      />

    </AbsoluteFill>
  );
};
