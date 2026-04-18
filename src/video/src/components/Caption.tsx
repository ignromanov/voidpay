import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants/colors";
import { FONT_SANS } from "../fonts";

type CaptionProps = {
  text: string;
  /** Frame (local to parent Sequence) when caption starts fading in */
  startAt?: number;
  /** Fade-in duration in frames */
  fadeDuration?: number;
  /** Frame when caption starts fading out (undefined = stays visible) */
  endAt?: number;
  /** Fade-out duration in frames */
  fadeOutDuration?: number;
  fontSize?: number;
};

export const Caption: React.FC<CaptionProps> = ({
  text,
  startAt = 0,
  fadeDuration = 15,
  endAt,
  fadeOutDuration = 15,
  fontSize = 30,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const fadeInOpacity = interpolate(
    frame,
    [startAt, startAt + fadeDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const fadeOutOpacity = endAt !== undefined
    ? interpolate(
        frame,
        [endAt, endAt + fadeOutDuration],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  const opacity = fadeInOpacity * fadeOutOpacity;

  const translateY = interpolate(
    frame,
    [startAt, startAt + fadeDuration],
    [10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        // Middle 80% vertically: bottom at 85% of frame height (avoids bottom 10% safe-zone)
        bottom: "13%",
        left: 0,
        width,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize,
          fontWeight: 700,
          color: COLORS.textCaption,
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        {text}
      </span>
    </div>
  );
};
