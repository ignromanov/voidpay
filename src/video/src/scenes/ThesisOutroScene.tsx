import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";
import { COLORS } from "../constants/colors";

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
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: SPRING_CONFIGS.smooth, durationInFrames: 30 });
  const urlEnter = spring({
    frame: frame - 20,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 30,
  });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 48,
        opacity,
      }}
    >
      <div style={{ transform: `translateY(${(1 - enter) * 20}px)`, textAlign: "center" }}>
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 96,
            fontWeight: 600,
            color: COLORS.textCaption,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Cryptographic receipts.
        </div>
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 96,
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
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 999,
          padding: "14px 28px",
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize: 36,
          fontWeight: 500,
          color: COLORS.textCaption,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        voidpay.xyz <span style={{ opacity: 0.6 }}>→</span>
      </div>
    </AbsoluteFill>
  );
};
