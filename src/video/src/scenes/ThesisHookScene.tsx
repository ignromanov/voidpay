import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_SANS } from "../fonts";
import { COLORS } from "../constants/colors";

/**
 * Scene 0 — Thesis Hook (0.7s, 21 frames @ 30fps).
 *
 * creative-brief-v2 §3: black AbsoluteFill + centered text.
 * Pattern-interrupt for Twitter autoplay (mute). Sets Complication
 * in the SCAR arc — "The invoice is the URL." states the reframe
 * before product flow begins.
 *
 * NOT <Caption> — this text IS the scene, not an overlay on UI.
 */
export const ThesisHookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [18, 21], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      <span
        style={{
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize: 72,
          fontWeight: 600,
          color: COLORS.textCaption,
          textAlign: "center",
          opacity,
          letterSpacing: "-0.02em",
        }}
      >
        The invoice is the URL.
      </span>
    </AbsoluteFill>
  );
};
