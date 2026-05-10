import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";
import { COLORS } from "../constants/colors";
import { RemotionAuroraText } from "../components/RemotionAuroraText";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";

/**
 * Scene 4 — Thesis Outro (5s, 150 frames @ 30fps).
 *
 * creative-brief-v2 §4: "Cryptographic receipts. / Not audit logs. / voidpay.xyz"
 * Uses only @/shared/ui-compatible primitives (rendered inline here to avoid
 * React SSR coupling with production widgets; typography matches design-system).
 *
 * NOT <Caption> — outro text IS the scene.
 */
export const ThesisOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // ε3: delay thesis entrance by 12fr to let S3→S4 crossfade complete first
  const TEXT_DELAY = 12;
  const enter = spring({ frame: frame - TEXT_DELAY, fps, config: SPRING_CONFIGS.smooth, durationInFrames: 30 });
  const urlEnter = spring({
    frame: frame - TEXT_DELAY - 20,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 30,
  });
  const opacity = interpolate(frame, [TEXT_DELAY, TEXT_DELAY + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Round 9c: adaptive font sizes — portrait (1080w) has more vertical real estate.
  const heroFontSize = width < 1200 ? 110 : 96;
  const urlFontSize = width < 1200 ? 42 : 36;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity,
      }}
    >
      <NetworkBackgroundLayer variant="strong" />
      <NetworkBackground />
      <AbsoluteFill style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 48,
      }}>
      <div style={{ transform: `translateY(${(1 - enter) * 20}px)`, textAlign: "center" }}>
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: heroFontSize,
            fontWeight: 600,
            color: COLORS.textCaption,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          <RemotionAuroraText>Cryptographic receipts.</RemotionAuroraText>
        </div>
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: heroFontSize,
            fontWeight: 400,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Not audit logs.
        </div>
      </div>

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
        {/* voidpay + .xyz joined — no whitespace/gap between them */}
        <span>
          <RemotionAuroraText style={{ fontSize: urlFontSize, fontWeight: 500 }} phaseFrames={45}>
            voidpay
          </RemotionAuroraText>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>.xyz</span>
        </span>
        <span style={{ opacity: 0.6 }}>→</span>
      </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
