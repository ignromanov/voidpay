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
  fontSize?: number;
};

export const HintBadge: React.FC<HintBadgeProps> = ({
  text,
  startAt,
  endAt,
  style,
  variant = "ghost",
  fontSize = 15,
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
          background: isArrow ? "rgba(13, 13, 17, 0.75)" : "transparent",
          border: isArrow ? "1px solid rgba(124, 58, 237, 0.35)" : "none",
          borderRadius: isArrow ? 6 : 0,
          padding: isArrow ? "4px 10px" : "2px 0",
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize,
          fontWeight: 500,
          color: "rgba(139, 92, 246, 0.9)",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};
