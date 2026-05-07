import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_SANS } from "../fonts";
import { COLORS } from "../constants/colors";

/**
 * Scene 0 — Thesis Hook (3s, 90 frames @ 30fps).
 *
 * creative-brief-v2 §3 + plan-v5 D1=B: black-text-black two-beat.
 * Round-9a: beat keyframes shifted -12fr so text starts at frame 0.
 *  0–18:  fade-in "The invoice…"
 * 18–30:  hold "The invoice…"
 * 30–36:  fade-out "The invoice…"
 * 30–48:  fade-in "is the URL." (overlaps tail of fade-out for natural cross)
 * 48–90:  hold "is the URL." → scene end (cross-fade transition closes visual)
 *
 * NOT <Caption> — the text IS the scene.
 */
export const ThesisHookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Beat 1: "The invoice…"  fades in 0-18, holds 18-30, fades out 30-36
  const beat1 =
    interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [30, 36], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 2: "is the URL."  fades in 30-48, holds 48→scene end (no fade-out —
  // cross-fade transition closes the visual).
  const beat2 =
    interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sharedTextStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily: `${FONT_SANS}, sans-serif`,
    fontSize: 72,
    fontWeight: 600,
    color: COLORS.textCaption,
    textAlign: "center",
    letterSpacing: "-0.02em",
    width: "100%",
    top: "50%",
    transform: "translateY(-50%)",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <span style={{ ...sharedTextStyle, opacity: beat1 }}>The invoice…</span>
      <span style={{ ...sharedTextStyle, opacity: beat2 }}>is the URL.</span>
    </AbsoluteFill>
  );
};
