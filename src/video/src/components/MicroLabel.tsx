import { interpolate, useCurrentFrame, Easing } from "remotion";
import { FONT_SANS } from "../fonts";

type MicroLabelProps = {
  text: string;
  /** Local frame to start fade-in */
  startAt: number;
  /** Local frame to start fade-out */
  endAt: number;
  /** Absolute position within the parent scene */
  x: number | string;
  y: number | string;
  fontSize?: number;
  maxWidth?: number | string;
  /** Controls text alignment and transform-origin */
  anchor?: "left" | "center" | "right";
  /**
   * Pill background behind text — improves readability on any background.
   * Defaults to true. Set false for legacy plain-text rendering.
   */
  pill?: boolean;
};

export const MicroLabel: React.FC<MicroLabelProps> = ({
  text,
  startAt,
  endAt,
  x,
  y,
  fontSize = 24,
  maxWidth,
  anchor = "left",
  pill = true,
}) => {
  const frame = useCurrentFrame();

  const FADE_IN = 8;
  const FADE_OUT = 6;

  const fadeIn = interpolate(frame, [startAt, startAt + FADE_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [endAt, endAt + FADE_OUT], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = fadeIn * fadeOut;

  const PULSE_PERIOD = 30;
  const glowPhase = frame % PULSE_PERIOD;
  const glowOpacity = interpolate(
    glowPhase,
    [0, PULSE_PERIOD / 2, PULSE_PERIOD],
    [0.3, 0.6, 0.3],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const glowSpread = interpolate(
    glowPhase,
    [0, PULSE_PERIOD / 2, PULSE_PERIOD],
    [16, 28, 16],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const alignItems =
    anchor === "center" ? "center" : anchor === "right" ? "flex-end" : "flex-start";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems,
        maxWidth,
      }}
    >
      {pill ? (
        <span
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize,
            fontWeight: 500,
            color: "rgba(228, 228, 231, 1)",
            letterSpacing: 0,
            padding: "16px 28px",
            borderRadius: 999,
            background: "rgba(15, 15, 18, 0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(124, 58, 237, 0.6)",
            boxShadow: `0 0 ${glowSpread}px rgba(124, 58, 237, ${glowOpacity}), 0 0 ${glowSpread * 2}px rgba(124, 58, 237, ${glowOpacity * 0.6}), 0 4px 16px rgba(0,0,0,0.5)`,
            display: "inline-block",
          }}
        >
          {text}
        </span>
      ) : (
        <span
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize,
            fontWeight: 500,
            color: "rgba(161, 161, 170, 1)",
            letterSpacing: 0,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};
