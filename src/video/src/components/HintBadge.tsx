import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_SANS } from "../fonts";
import { SPRING_CONFIGS } from "../constants/timing";

type HintBadgeProps = {
  text: string;
  /** Frame (local to parent Sequence) when hint starts fading in */
  startAt: number;
  /** Frame when hint starts fading out */
  endAt: number;
  /** Absolute positioning — caller controls layout */
  style: React.CSSProperties;
  /**
   * "ghost" (default): violet text, no background — minimal annotation.
   * "arrow": violet text + subtle dark pill background.
   */
  variant?: "ghost" | "arrow";
  /**
   * Font size in px. Default 20 — legible at 9:16 portrait phone playback.
   * ui-ux-pro-max rule: minimum 16px body text on mobile; hints are secondary
   * annotations so 20px is the floor, not 14-15px from prior rounds.
   */
  fontSize?: number;
};

export const HintBadge: React.FC<HintBadgeProps> = ({
  text,
  startAt,
  endAt,
  style,
  variant = "ghost",
  fontSize = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring fade-in (smooth config, same pattern as Caption.tsx)
  const enterSpring = spring({
    frame: frame - startAt,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 10,
  });

  const fadeInOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Linear fade-out
  const fadeOutOpacity = interpolate(
    frame,
    [endAt, endAt + 8],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = fadeInOpacity * fadeOutOpacity;

  const isArrow = variant === "arrow";

  return (
    <div
      style={{
        position: "absolute",
        opacity,
        pointerEvents: "none",
        ...style,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          // θ3: darker background + stronger border for portrait legibility (WCAG 4.5:1 goal)
          background: isArrow ? "rgba(9, 9, 11, 0.88)" : "transparent",
          border: isArrow ? "1px solid rgba(124, 58, 237, 0.55)" : "none",
          borderRadius: isArrow ? 8 : 0,
          // θ3: proportional padding for 20px base font
          padding: isArrow ? "6px 14px" : "2px 0",
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize,
          fontWeight: 600,
          // θ3: full violet saturation — ghost variant was 90%, now 100% for contrast floor
          color: "rgba(167, 139, 250, 1)",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};
