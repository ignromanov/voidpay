import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_SANS } from "../fonts";
import { SPRING_CONFIGS } from "../constants/timing";

type CaptionVariant = "violet" | "emerald";
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
   * "bottom" (legacy): bottom: 13%, maxWidth: 80%.
   * "top" (v2): top: 38px×3=114px anchored, maxWidth: 50%.
   */
  position?: CaptionPosition;
  /**
   * "violet" (default): violet border/text/shadow — matches mock .caption.
   * "emerald": emerald border/text/shadow — success state (F12 "Not our servers.").
   */
  variant?: CaptionVariant;
};

/**
 * Caption — Mocks v2 import (import point #8).
 *
 * Renders a pill chip anchored top:114px (38px mock × 3) centered horizontally.
 * Matches mock .caption spec: rgba(20,20,27,0.85) bg, backdrop-filter blur(8px),
 * violet-400 border + text + glow. Emerald variant for success state.
 */
export const Caption: React.FC<CaptionProps> = ({
  text,
  startAt = 0,
  fadeDuration = 12,
  endAt,
  fadeOutDuration = 8,
  fontSize = 39,
  position = "bottom",
  variant = "violet",
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

  // Linear fade-out
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

  // Mocks v2 .caption: top:38px (mock) × 3 = 114px at 1920 height.
  // bottom: legacy 13% preserved.
  const containerStyle: React.CSSProperties = position === "top"
    ? {
        position: "absolute",
        top: 114,           // 38px × 3 — anchored top per mock
        left: 0,
        width,
        display: "flex",
        justifyContent: "center",
      }
    : {
        position: "absolute",
        bottom: "13%",
        left: 0,
        width,
        display: "flex",
        justifyContent: "center",
      };

  const maxWidth = position === "top" ? "50%" : "80%";

  // Mocks v2 variant colors
  const isEmerald = variant === "emerald";
  const borderColor = isEmerald
    ? "rgba(52,211,153,0.55)"      // emerald
    : "rgba(167,139,250,0.45)";   // violet-400/45
  const textColor = isEmerald ? "#34d399" : "#a78bfa";
  const glowColor = isEmerald
    ? "rgba(52,211,153,0.3)"
    : "rgba(167,139,250,0.25)";

  return (
    <div style={{ ...containerStyle, opacity, transform: `translateY(${translateY}px)` }}>
      <div
        style={{
          display: "inline-flex",
          maxWidth,
          // Mocks v2 .caption: rgba(20,20,27,0.85) bg + backdrop-filter blur(8px)
          background: "rgba(20,20,27,0.85)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${borderColor}`,
          borderRadius: 999,
          // 9px 18px × 3 = 27px 54px
          padding: "27px 54px",
          boxShadow: `0 0 24px ${glowColor}`,
        }}
      >
        <span
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize,
            fontWeight: 600,
            color: textColor,
            letterSpacing: "-0.01em",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
