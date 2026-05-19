import { interpolate, spring } from "remotion";
import { FONT_SANS } from "../fonts";
import { SPRING_CONFIGS } from "../constants/timing";
import type { CaptionVariant } from "./Caption";

type LegacyPillProps = {
  text: string;
  startAt: number;
  fadeDuration: number;
  endAt: number | undefined;
  fadeOutDuration: number;
  fontSize: number;
  position: "top" | "bottom";
  variant: CaptionVariant;
  frame: number;
  fps: number;
  width: number;
};

export function LegacyPillCaption({
  text, startAt, fadeDuration, endAt, fadeOutDuration,
  fontSize, position, variant, frame, fps, width,
}: LegacyPillProps) {
  const enterSpring = spring({
    frame: frame - startAt,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: fadeDuration,
  });

  const fadeInOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const fadeOutOpacity = endAt !== undefined
    ? interpolate(frame, [endAt, endAt + fadeOutDuration], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const opacity = fadeInOpacity * fadeOutOpacity;
  const slideFrom = position === "top" ? -10 : 10;
  const translateY = interpolate(enterSpring, [0, 1], [slideFrom, 0]);

  const containerStyle: React.CSSProperties = position === "top"
    ? { position: "absolute", top: 114, left: 0, width, display: "flex", justifyContent: "center" }
    : { position: "absolute", bottom: "13%", left: 0, width, display: "flex", justifyContent: "center" };

  const maxWidth = position === "top" ? "50%" : "80%";
  const isEmerald = variant === "emerald";
  const borderColor = isEmerald ? "rgba(52,211,153,0.80)" : "rgba(167,139,250,0.75)";
  const textColor = isEmerald ? "#34d399" : "#a78bfa";
  const dotColor = isEmerald ? "#34d399" : "#a78bfa";
  const glowColor = isEmerald ? "rgba(52,211,153,0.45)" : "rgba(167,139,250,0.45)";

  return (
    <div style={{ ...containerStyle, opacity, transform: `translateY(${translateY}px)` }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          maxWidth,
          background: "rgba(20,20,27,0.88)",
          backdropFilter: "blur(8px)",
          border: `1.5px solid ${borderColor}`,
          borderRadius: 999,
          padding: "27px 54px",
          boxShadow: `0 0 32px ${glowColor}, 0 0 8px ${glowColor}`,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: dotColor, flexShrink: 0, boxShadow: `0 0 6px ${dotColor}` }} />
        <span style={{ fontFamily: `${FONT_SANS}, sans-serif`, fontSize, fontWeight: 700, color: textColor, letterSpacing: "-0.01em", textAlign: "center", whiteSpace: "nowrap" }}>
          {text}
        </span>
      </div>
    </div>
  );
}
