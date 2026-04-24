import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants/colors";
import { FONT_SANS } from "../fonts";

type CaptionPosition = "top" | "bottom";

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
  /**
   * "bottom" (default, legacy): bottom: 13%, maxWidth: 80%.
   * "top" (v2, two-pane safe): top: 8%, maxWidth: 50%.
   */
  position?: CaptionPosition;
};

export const Caption: React.FC<CaptionProps> = ({
  text,
  startAt = 0,
  fadeDuration = 15,
  endAt,
  fadeOutDuration = 15,
  fontSize = 30,
  position = "bottom",
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

  const slideFrom = position === "top" ? -10 : 10;
  const translateY = interpolate(
    frame,
    [startAt, startAt + fadeDuration],
    [slideFrom, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const containerStyle: React.CSSProperties = position === "top"
    ? { position: "absolute", top: "8%", left: 0, width, display: "flex", justifyContent: "center" }
    : { position: "absolute", bottom: "13%", left: 0, width, display: "flex", justifyContent: "center" };

  const textMaxWidth = position === "top" ? "50%" : "80%";

  return (
    <div style={{ ...containerStyle, opacity, transform: `translateY(${translateY}px)` }}>
      <span
        style={{
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize,
          fontWeight: 700,
          color: COLORS.textCaption,
          textAlign: "center",
          maxWidth: textMaxWidth,
        }}
      >
        {text}
      </span>
    </div>
  );
};
