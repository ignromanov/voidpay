import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_SANS } from "../fonts";
import { COLORS } from "../constants/colors";

/**
 * Scene 0 — Thesis Hook (3s, 90 frames @ 30fps).
 *
 * creative-brief-v2 §3 + plan-v5 D1=B: black-text-black two-beat.
 * Doubled beat durations (round 3) so each beat reads clearly:
 *  0–12:  pure black (NO text) — establishes pattern interrupt
 * 12–30:  fade-in "The invoice…"
 * 30–42:  hold "The invoice…"
 * 42–48:  fade-out "The invoice…"
 * 42–60:  fade-in "is the URL." (overlaps tail of fade-out for natural cross)
 * 60–90:  hold "is the URL." → scene end (cross-fade transition closes visual)
 *
 * NOT <Caption> — the text IS the scene.
 */
export const ThesisHookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Beat 1: "The invoice…"  fades in 12-30, holds 30-42, fades out 42-48
  const beat1 =
    interpolate(frame, [12, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [42, 48], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 2: "is the URL."  fades in 42-60, holds 60→scene end (no fade-out —
  // cross-fade transition closes the visual).
  const beat2 =
    interpolate(frame, [42, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
