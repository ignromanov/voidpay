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
import { SPRING_CONFIGS, TYPEWRITER_CHAR_FRAMES } from "../constants/timing";
import { FONT_MONO, FONT_SANS } from "../fonts";
import { NetworkBackground } from "@/widgets/network-background";
import { Caption } from "../components/Caption";
import { DEMO_INVOICE } from "../constants/demo-invoice";
import { Button } from "@/shared/ui";

// Creative brief §2: Alex · UI Design · $250 USDC · Arbitrum
const INVOICE_FROM = "Alex";
const INVOICE_ITEM = "UI Design";
const INVOICE_AMOUNT = "250.000042";
const INVOICE_TOKEN = "USDC";
const INVOICE_NETWORK = "Arbitrum";

/** Typewriter helper: returns slice of text based on frame */
const typewrite = (text: string, frame: number, startFrame: number): string => {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed / TYPEWRITER_CHAR_FRAMES);
  return text.slice(0, Math.min(chars, text.length));
};

/** Mock form field */
const FormField: React.FC<{
  label: string;
  value: string;
  typewriterStart: number;
  isDropdown?: boolean;
  mono?: boolean;
}> = ({ label, value, typewriterStart, isDropdown = false, mono = false }) => {
  const frame = useCurrentFrame();
  const displayValue = isDropdown
    ? (frame >= typewriterStart ? value : "")
    : typewrite(value, frame, typewriterStart);

  const fieldOpacity = interpolate(
    frame,
    [typewriterStart - 10, typewriterStart],
    [0.5, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ marginBottom: 16, opacity: fieldOpacity }}>
      <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 13, color: COLORS.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{
        background: COLORS.zinc900,
        border: `1px solid ${COLORS.zinc800}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: mono ? `${FONT_MONO}, monospace` : `${FONT_SANS}, sans-serif`,
        fontSize: 18,
        color: displayValue ? COLORS.textPrimary : COLORS.textMuted,
        minHeight: 24,
      }}>
        {displayValue || label}
        {!isDropdown && frame >= typewriterStart && frame < typewriterStart + value.length * TYPEWRITER_CHAR_FRAMES && (
          <span style={{ opacity: Math.round(frame * 0.1) % 2 }}>▌</span>
        )}
      </div>
    </div>
  );
};

/** Mock line item row */
const LineItem: React.FC<{ desc: string; qty: string; price: string; delay: number }> = ({
  desc, qty, price, delay,
}) => {
  const frame = useCurrentFrame();
  const translateY = interpolate(
    frame,
    [delay, delay + 15],
    [30, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ display: "flex", gap: 12, opacity, transform: `translateY(${translateY}px)`, fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 14, color: COLORS.textPrimary, padding: "6px 0", borderBottom: `1px solid ${COLORS.zinc800}` }}>
      <span style={{ flex: 2 }}>{desc}</span>
      <span style={{ flex: 0.5, textAlign: "center" }}>{qty}</span>
      <span style={{ flex: 1, textAlign: "right", fontFamily: `${FONT_MONO}, monospace` }}>{price}</span>
    </div>
  );
};

export const CreateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // "Generate Link" button animation
  const buttonClickFrame = 420;
  const buttonScale = frame >= buttonClickFrame
    ? spring({ frame: frame - buttonClickFrame, fps, config: SPRING_CONFIGS.snappy })
    : 0;
  const buttonGlowOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.8],
  );

  // Paper preview layout — depends only on composition width/height, so
  // memoize instead of recomputing every frame (P1.3). Frame-driven fade /
  // lift stay inline in the JSX below.
  const paperLayout = useMemo(() => {
    const containerW = width * 0.38
    const containerH = height * 0.8
    const scale = Math.min(
      containerW / INVOICE_BASE_WIDTH,
      containerH / INVOICE_BASE_HEIGHT,
    )
    return {
      containerW,
      containerH,
      scale,
      scaledW: INVOICE_BASE_WIDTH * scale,
      scaledH: INVOICE_BASE_HEIGHT * scale,
    }
  }, [width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Form panel (left side) */}
      <div style={{
        position: "absolute",
        left: width * 0.08,
        top: height * 0.08,
        width: width * 0.38,
        background: "rgba(24, 24, 27, 0.8)",
        border: `1px solid ${COLORS.zinc800}`,
        borderRadius: 16,
        padding: 32,
      }}>
        <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 24, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 24 }}>
          Create Invoice
        </div>

        {/* Creative brief §2: From = Alex */}
        <FormField label="From" value={INVOICE_FROM} typewriterStart={15} />
        <FormField label="Token" value={INVOICE_TOKEN} typewriterStart={60} isDropdown />
        <FormField label="Network" value={INVOICE_NETWORK} typewriterStart={90} isDropdown />

        {/* Line items */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize: 13, color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Line Items
          </div>
          {/* Creative brief §2: UI Design · $250 */}
          <LineItem desc={INVOICE_ITEM} qty="1" price={`$${INVOICE_AMOUNT} ${INVOICE_TOKEN}`} delay={120} />
        </div>

        {/* Total */}
        <Sequence from={180} layout="none">
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: `${FONT_MONO}, monospace`, fontSize: 20, fontWeight: 700, color: COLORS.textPrimary, padding: "12px 0", borderTop: `1px solid ${COLORS.zinc800}` }}>
            <span>Total</span>
            <span>{INVOICE_AMOUNT} {INVOICE_TOKEN}</span>
          </div>
        </Sequence>

        {/* Generate Link button */}
        <Sequence from={300} layout="none">
          <div style={{ marginTop: 20 }}>
            <div style={{
              boxShadow: `0 0 ${20 + buttonGlowOpacity * 15}px ${COLORS.violetGlow}`,
              transform: frame >= buttonClickFrame ? `scale(${0.95 + buttonScale * 0.05})` : "scale(1)",
              display: "inline-flex",
              width: "100%",
            }}>
              <Button variant="default" size="lg" className="w-full">
                Generate Link
              </Button>
            </div>
          </div>
        </Sequence>
      </div>

      {/* Preview paper (right side) — real @/widgets/invoice-paper.
          Scale from paperLayout (memoized on width/height). Base paper:
          794×1123 (A4 @ 96dpi). Fade / lift stay frame-driven. */}
      <div
        style={{
          position: "absolute",
          right: width * 0.08 + (paperLayout.containerW - paperLayout.scaledW) / 2,
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

      {/* LOCKED caption from creative-brief.md §1, Scene 3 */}
      <Caption text="Three fields. One link. Invoice ready." startAt={440} />
    </AbsoluteFill>
  );
};
