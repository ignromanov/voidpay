import { interpolate, useCurrentFrame } from "remotion";
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
};

export const MicroLabel: React.FC<MicroLabelProps> = ({
  text,
  startAt,
  endAt,
  x,
  y,
  fontSize = 20,
  maxWidth,
  anchor = "left",
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
    </div>
  );
};
