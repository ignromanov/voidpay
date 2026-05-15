import { Easing, interpolate, spring } from "remotion";

export type CaptionWeight = 700 | 500;
export type CaptionSpringConfig = "smooth" | "overshoot";

/** Resolves position string/number to a top% value (0-100). */
export function resolveYPercent(
  position: "top" | "bottom" | "center" | number,
): number {
  if (position === "top") return 10;
  if (position === "bottom") return 87;
  if (position === "center") return 50;
  return position; // numeric passthrough
}

/** Entry animation value (0→1). Statement weight uses spring; supporting uses bezier. */
export function computeEntry(
  frame: number,
  fps: number,
  startAt: number,
  weight: CaptionWeight,
  springConfig: CaptionSpringConfig,
): number {
  if (springConfig === "overshoot") {
    return spring({
      frame: frame - startAt,
      fps,
      config: { damping: 12, stiffness: 180 },
      durationInFrames: 10,
    });
  }
  if (weight === 700) {
    return spring({
      frame: frame - startAt,
      fps,
      config: { damping: 200, stiffness: 100, mass: 0.5 },
      durationInFrames: 8,
    });
  }
  // weight === 500: bezier interpolate
  return interpolate(
    frame,
    [startAt, startAt + 8],
    [0, 1],
    { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: "clamp" },
  );
}

/** Universal 5-frame exit fade (0 = invisible, 1 = visible). */
export function computeExit(frame: number, endAt: number): number {
  return interpolate(frame, [endAt - 5, endAt], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Word-pop scale value for the emphasized word.
 * Centered on the midpoint of the caption's visible window.
 */
export function computeWordPopScale(
  frame: number,
  startAt: number,
  endAt: number,
  weight: CaptionWeight,
): number {
  const midpoint = Math.round((startAt + endAt) / 2);
  const halfDuration = weight === 700 ? 5 : 4; // 10fr / 8fr total
  const peak = weight === 700 ? 1.06 : 1.04;
  return interpolate(
    frame,
    [midpoint - halfDuration, midpoint, midpoint + halfDuration],
    [1, peak, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

/**
 * Word-pop violet color opacity (0 = white, 1 = violet).
 * 4fr fade-in, holds ~90% of visible window, 6fr fade-out.
 */
export function computeWordPopColorOpacity(
  frame: number,
  startAt: number,
  endAt: number,
): number {
  // 4fr fade-in, hold, 6fr fade-out — covers the full visible window.
  // For captions shorter than 10fr (off-spec), clamp to a single-frame in/out
  // to keep inputRange strictly monotonic.
  const inEnd = Math.min(startAt + 4, endAt - 1);
  const outStart = Math.max(inEnd + 1, endAt - 6);
  return interpolate(
    frame,
    [startAt, inEnd, outStart, endAt],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}
