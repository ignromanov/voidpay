import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_SANS } from "../fonts";
import { COLORS } from "../constants/colors";

/**
 * Scene 0 — Thesis Hook (1.5s, 45 frames @ 30fps).
 *
 * creative-brief-v2 §3 + plan-v5 D1=B: black-text-black two-beat.
 *  0–12:  pure black (NO text) — establishes pattern interrupt
 * 12–21:  fade-in "The invoice…"
 * 21–27:  hold "The invoice…"
 * 27–30:  fade-out "The invoice…"
 * 27–36:  fade-in "is the URL." (overlaps tail of fade-out for natural cross)
 * 36–42:  hold "is the URL."
 * 42–45:  fade-out
 *
 * NOT <Caption> — the text IS the scene.
 */
export const ThesisHookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Beat 1: "The invoice…"  fades in 12-21, holds 21-27, fades out 27-30
  const beat1 =
    interpolate(frame, [12, 21], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [27, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 2: "is the URL."  fades in 27-36, holds 36→scene end (no fade-out —
  // cross-fade transition closes the visual).
  const beat2 =
    interpolate(frame, [27, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
