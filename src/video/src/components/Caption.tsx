import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants/colors";
import { FONT_SANS } from "../fonts";
import { SPRING_CONFIGS } from "../constants/timing";

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
  fadeDuration = 12,
  endAt,
  fadeOutDuration = 8,
  fontSize = 38,
  position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Spring-based fade-in: smooth entry with translateY
  const enterSpring = spring({
    frame: frame - startAt,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: fadeDuration,
  });

  const fadeInOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Linear fade-out (faster than enter, no translate during exit)
  const fadeOutOpacity = endAt !== undefined
    ? interpolate(
        frame,
        [endAt, endAt + fadeOutDuration],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  const opacity = fadeInOpacity * fadeOutOpacity;

  // Entry translate: top slides down from -10, bottom slides up from +10
  const slideFrom = position === "top" ? -10 : 10;
  const translateY = interpolate(enterSpring, [0, 1], [slideFrom, 0]);

  const containerStyle: React.CSSProperties = position === "top"
    ? { position: "absolute", top: "8%", left: 0, width, display: "flex", justifyContent: "center" }
    : { position: "absolute", bottom: "13%", left: 0, width, display: "flex", justifyContent: "center" };

  const maxWidth = position === "top" ? "50%" : "80%";

  return (
    <div style={{ ...containerStyle, opacity, transform: `translateY(${translateY}px)` }}>
      <div
        style={{
          display: "inline-flex",
          maxWidth,
          background: "rgba(13, 13, 17, 0.85)",
          backdropFilter: "blur(12px)",
          border: `1px solid rgba(124, 58, 237, 0.4)`,
          borderRadius: 999,
          padding: "14px 28px",
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)",
        }}
      >
        <span
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.01em",
            textAlign: "center",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
