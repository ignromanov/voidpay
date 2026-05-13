import { AbsoluteFill, useVideoConfig } from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { FONT_SANS, FONT_MONO } from "../fonts";
import { RemotionAuroraText } from "../components/RemotionAuroraText";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";

/**
 * Scene 0 — Thesis Hook (3s, 90 frames @ 30fps).
 *
 * F1 post-render fix: full phrase visible from frame 0 — no internal cross-fade.
 * Scene entrance crossfade is handled by Root.tsx at scene boundaries.
 * Color split matches landing Hero (D1):
 *   - "The invoice" → bold white (#FFFFFF)
 *   - "is the URL." → aurora full opacity
 *
 * Mock viewport 360×640 → 1080×1920: multiply font sizes ×3.
 */
export const ThesisHookScene: React.FC = () => {
  const { width } = useVideoConfig();

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

      {/* Full hero visible from frame 0 — VoidPay pre + two-line H1 + sub-text */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 42px",
        }}
      >
        {/* VoidPay pre-line */}
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

        {/* H1: line 1 bold white, line 2 violet aurora — matches landing Hero */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: h1FontSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          <span style={{ color: "#FFFFFF" }}>The invoice</span>
          <br />
          <RemotionAuroraText phaseFrames={0}>is&nbsp;the&nbsp;URL.</RemotionAuroraText>
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
