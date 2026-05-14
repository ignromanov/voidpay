import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS, FONT_MONO } from "../fonts";
import { COLORS } from "../constants/colors";
import { RemotionAuroraText } from "../components/RemotionAuroraText";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";

/**
 * Scene 4 — Thesis Outro (3.5s, 105 frames @ 30fps).
 *
 * Mocks v2 F13 hero import (import point #9):
 *   pre-line: "No accounts · no DB · no servers" (mono)
 *   h1: white "The invoice" + aurora "is the URL." — matches landing Hero
 *   sub: "Encoded into the link itself.\nOpen. Pay. Done."
 *   voidpay.xyz wordmark — centered in flex-column block (no margin-top:auto)
 *
 * Per Ignat: "поместить надписи по центру" — drop the bottom-pinned voidpay.xyz.
 * All four elements form one centered flex-column block.
 */
export const ThesisOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // ε3: delay thesis entrance by 12fr to let S3→S4 crossfade complete first
  const TEXT_DELAY = 12;
  const enter = spring({
    frame: frame - TEXT_DELAY,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 30,
  });
  const urlEnter = spring({
    frame: frame - TEXT_DELAY - 30,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 30,
  });
  const opacity = interpolate(frame, [TEXT_DELAY, TEXT_DELAY + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mock 360px base → 1080px × 3 scaling
  const isPortrait = width < 1200;
  // .pre: 8px → 24px; .h1: 26px → 78px; .sub: 11px → 33px; .voidpay: ~16px → 48px
  const preFontSize  = isPortrait ? 24 : 20;
  const heroFontSize = isPortrait ? 78 : 66;
  const subFontSize  = isPortrait ? 33 : 28;
  const urlFontSize  = isPortrait ? 42 : 36;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity,
      }}
    >
      <NetworkBackgroundLayer variant="strong" />
      <NetworkBackground />

      {/* Centered flex-column block — all 4 elements as one unit */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 60px",
          gap: 0,
          transform: `translateY(${(1 - enter) * 20}px)`,
        }}
      >
        {/* Pre-line: "No accounts · no DB · no servers" */}
        <div
          style={{
            fontFamily: `${FONT_MONO}, monospace`,
            fontWeight: 600,
            fontSize: preFontSize,
            letterSpacing: "0.18em",
            color: "#71717a",
            textTransform: "uppercase",
            marginBottom: 24,
            whiteSpace: "nowrap",
          }}
        >
          No accounts · no DB · no servers
        </div>

        {/* H1: line 1 bold white, line 2 violet aurora — matches landing Hero (D11) */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: heroFontSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: 36,
          }}
        >
          <span style={{ color: "#FFFFFF" }}>The invoice</span>
          <br />
          <RemotionAuroraText>is&nbsp;the&nbsp;URL.</RemotionAuroraText>
        </div>

        {/* Sub: "Encoded into the link itself.\nOpen. Pay. Done." */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontWeight: 500,
            fontSize: subFontSize,
            color: "#a1a1aa",
            lineHeight: 1.45,
            maxWidth: 720,
            marginBottom: 56,
          }}
        >
          Encoded into the link itself.
          <br />
          Open. Pay. Done.
        </div>

        {/* voidpay.xyz wordmark — centered in block (no margin-top:auto) */}
        <div
          style={{
            transform: `translateY(${(1 - urlEnter) * 20}px)`,
            opacity: urlEnter,
            border: `1px solid rgba(124, 58, 237, 0.5)`,
            borderRadius: 999,
            padding: "14px 28px",
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: urlFontSize,
            fontWeight: 500,
            color: COLORS.textCaption,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 8px 32px rgba(124, 58, 237, 0.25)",
          }}
        >
          <span>
            <span style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
              voidpay
            </span>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>.xyz</span>
          </span>
          <span style={{ opacity: 0.6 }}>→</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
