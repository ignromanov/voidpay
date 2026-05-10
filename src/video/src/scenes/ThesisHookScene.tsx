import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { FONT_SANS, FONT_MONO } from "../fonts";
import { RemotionAuroraText } from "../components/RemotionAuroraText";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";

/**
 * Scene 0 — Thesis Hook (3s, 90 frames @ 30fps).
 *
 * v2 hero layout (import point #2): VoidPay pre-line + two-beat H1 + sub-text.
 * creative-brief-v2 §3 + plan-v5 D1=B: black-text-black two-beat.
 * Round-9a beat keyframes preserved:
 *  0–18:  fade-in beat-1 block ("The invoice")
 * 18–30:  hold
 * 30–36:  fade-out beat-1
 * 30–48:  fade-in beat-2 block ("is the URL." + sub-text)
 * 48–90:  hold → scene end (cross-fade transition closes visual)
 *
 * Mock viewport 360×640 → 1080×1920: multiply font sizes ×3.
 */
export const ThesisHookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  // Beat 1: "The invoice…" fades in 0-18, holds 18-30, fades out 30-36
  const beat1 =
    interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [30, 36], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 2: full hero fades in 30-48, holds 48→scene end
  const beat2 =
    interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Portrait (1080w) uses ×3 of mock's 26px h1 = 78px; adaptive bump for readability
  const h1FontSize  = width < 1200 ? 84 : 72;
  // mock .pre = 8px → ×3 = 24px
  const preFontSize = width < 1200 ? 24 : 20;
  // mock .sub = 11px → ×3 = 33px
  const subFontSize = width < 1200 ? 33 : 28;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <NetworkBackgroundLayer variant="strong" />
      <NetworkBackground />

      {/* Beat 1: "The invoice" at opacity 0.35 (dimmed, as in mock) */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 42px",
          opacity: beat1,
        }}
      >
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: h1FontSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#71717a",
            opacity: 0.35,
          }}
        >
          The invoice
        </div>
      </AbsoluteFill>

      {/* Beat 2: full hero — VoidPay pre + "is the URL." aurora + sub */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 42px",
          opacity: beat2,
        }}
      >
        {/* VoidPay pre-line (new in v2) */}
        <div
          style={{
            fontFamily: `${FONT_MONO}, monospace`,
            fontWeight: 600,
            fontSize: preFontSize,
            letterSpacing: "0.18em",
            color: "#71717a",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          VoidPay
        </div>

        {/* H1: two-line — dimmed beat-1 line + aurora beat-2 line */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: h1FontSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          <span style={{ color: "#71717a", opacity: 0.35 }}>The invoice</span>
          <br />
          <RemotionAuroraText phaseFrames={30}>is&nbsp;the&nbsp;URL.</RemotionAuroraText>
        </div>

        {/* Sub-text */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontWeight: 500,
            fontSize: subFontSize,
            color: "#a1a1aa",
            marginTop: 36,
            maxWidth: 720,
            lineHeight: 1.45,
            opacity: 0.85,
          }}
        >
          Encoded into the link itself.
          <br />
          No database. No accounts. No servers.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
