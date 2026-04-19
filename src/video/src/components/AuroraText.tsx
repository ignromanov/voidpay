import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../constants/colors";
import { FONT_SANS } from "../fonts";

type AuroraTextProps = {
  text: string;
  fontSize?: number;
  delay?: number;
  fadeDuration?: number;
};

export const AuroraText: React.FC<AuroraTextProps> = ({
  text,
  fontSize = 72,
  delay = 0,
  fadeDuration = 20,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + fadeDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Animate gradient position: shifts from 0% to 200% over 8 seconds (240 frames)
  const gradientPosition = interpolate(
    (frame - delay) % 240,
    [0, 240],
    [0, 200],
  );

  return (
    <div
      style={{
        opacity,
        fontSize,
        fontWeight: 900,
        fontFamily: `${FONT_SANS}, sans-serif`,
        background: `linear-gradient(90deg, ${COLORS.aurora1}, ${COLORS.aurora2}, ${COLORS.aurora3}, ${COLORS.aurora1})`,
        backgroundSize: "200% 100%",
        backgroundPosition: `${gradientPosition}% 0`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};
