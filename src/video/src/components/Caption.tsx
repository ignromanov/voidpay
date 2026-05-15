import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_SANS } from "../fonts";
import { SPRING_CONFIGS } from "../constants/timing";
import {
  computeEntry,
  computeExit,
  computeWordPopColorOpacity,
  computeWordPopScale,
  resolveYPercent,
  type CaptionSpringConfig,
  type CaptionWeight,
} from "./Caption.helpers";

type CaptionVariant = "violet" | "emerald";
type CaptionPosition = "top" | "bottom" | "center" | number;

type CaptionProps = {
  text: string;
  /** Frame (local to parent Sequence) when caption starts fading in */
  startAt?: number;
  /** Fade-in duration in frames (legacy pill path only) */
  fadeDuration?: number;
  /** Frame when caption starts fading out (undefined = stays visible) */
  endAt?: number;
  /** Fade-out duration in frames (legacy pill path only) */
  fadeOutDuration?: number;
  fontSize?: number;
  /**
   * "bottom" | "top" — legacy pill positions (backward compat).
   * "center" — 50% of viewport height (kinetic path).
   * number — explicit 0-100% of viewport height (kinetic path).
   */
  position?: CaptionPosition;
  /**
   * "violet" (default): violet border/text/shadow.
   * "emerald": emerald border/text/shadow — success state.
   */
  variant?: CaptionVariant;
  /** Font weight: 700 = statement (spring entry), 500 = supporting (bezier entry). Default 500. */
  weight?: CaptionWeight;
  /** Single word from `text` to highlight with word-pop animation. Case-sensitive. */
  emphasizedWord?: string;
  /** Entry spring config: "smooth" (default) or "overshoot" (Magic Dust hero). */
  springConfig?: CaptionSpringConfig;
};

/** Returns true when any new-API prop is active, routing to kinetic text mode. */
function isKineticMode(props: CaptionProps): boolean {
  return (
    props.weight !== undefined ||
    props.emphasizedWord !== undefined ||
    props.springConfig !== undefined ||
    props.position === "center" ||
    typeof props.position === "number"
  );
}

/**
 * Caption — dual-mode caption component.
 *
 * Legacy mode (backward compat): pill chip with dark bg, border glow, dot.
 * Kinetic mode (new API): white text at yPercent position with word-pop support.
 * Kinetic activates when weight / emphasizedWord / springConfig is set,
 * or position is "center" or a number (0-100% of viewport height).
 */
export const Caption: React.FC<CaptionProps> = (props) => {
  const {
    text,
    startAt = 0,
    fadeDuration = 12,
    endAt,
    fadeOutDuration = 8,
    fontSize = 39,
    position = "bottom",
    variant = "violet",
    weight = 500,
    emphasizedWord,
    springConfig = "smooth",
  } = props;

  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (isKineticMode(props)) {
    return (
      <KineticCaption
        text={text}
        startAt={startAt}
        endAt={endAt ?? startAt + 60}
        fontSize={fontSize}
        position={position as "top" | "bottom" | "center" | number}
        variant={variant}
        weight={weight}
        emphasizedWord={emphasizedWord}
        springConfig={springConfig}
        frame={frame}
        fps={fps}
        width={width}
        height={height}
      />
    );
  }

  return (
    <LegacyPillCaption
      text={text}
      startAt={startAt}
      fadeDuration={fadeDuration}
      endAt={endAt}
      fadeOutDuration={fadeOutDuration}
      fontSize={fontSize}
      position={position as "top" | "bottom"}
      variant={variant}
      frame={frame}
      fps={fps}
      width={width}
    />
  );
};

// ---------------------------------------------------------------------------
// Legacy pill caption (existing callers — no changes to visual output)
// ---------------------------------------------------------------------------

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

function LegacyPillCaption({
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

// ---------------------------------------------------------------------------
// Kinetic caption (new API — white text, word-pop, position by %)
// ---------------------------------------------------------------------------

type KineticCaptionProps = {
  text: string;
  startAt: number;
  endAt: number;
  fontSize: number;
  position: "top" | "bottom" | "center" | number;
  variant: CaptionVariant;
  weight: CaptionWeight;
  emphasizedWord: string | undefined;
  springConfig: CaptionSpringConfig;
  frame: number;
  fps: number;
  width: number;
  height: number;
};

function KineticCaption({
  text, startAt, endAt, fontSize, position, variant,
  weight, emphasizedWord, springConfig,
  frame, fps, width,
}: KineticCaptionProps) {
  const entryValue = computeEntry(frame, fps, startAt, weight, springConfig);
  const exitOpacity = computeExit(frame, endAt);

  const opacity = interpolate(entryValue, [0, 1], [0, 1]) * exitOpacity;
  // translateY on outer pill wrapper so entire pill slides in/out
  const translateY = interpolate(entryValue, [0, 1], [12, 0]);

  const yPercent = resolveYPercent(position);
  const topPx = `${yPercent}%`;

  const isEmerald = variant === "emerald";
  const isCompact = fontSize <= 80;

  // Pill accent colour — violet (default) or emerald per spec
  const accentRgb = isEmerald ? "16,185,129" : "167,139,250";
  const dotHex = isEmerald ? "#10b981" : "#a78bfa";

  // Pill geometry
  const pillPadding = isCompact ? "22px 44px" : "28px 52px";
  const pillGap = isCompact ? 18 : 22;

  // Text
  const fontWeight = weight;
  const letterSpacing = weight === 700 ? "-0.02em" : "-0.01em";
  const baseColor = "#ffffff";

  const renderText = () => {
    if (!emphasizedWord || !text.includes(emphasizedWord)) {
      return <span style={{ color: baseColor }}>{text}</span>;
    }

    const idx = text.indexOf(emphasizedWord);
    const before = text.slice(0, idx);
    const after = text.slice(idx + emphasizedWord.length);

    const scale = computeWordPopScale(frame, startAt, endAt, weight);
    const colorOpacity = computeWordPopColorOpacity(frame, startAt, endAt);
    // Blend white → accent colour using colorOpacity
    const accentValues = isEmerald ? [0x10, 0xb9, 0x81] : [0xa7, 0x8b, 0xfa];
    const r = Math.round(255 + (accentValues[0] - 255) * colorOpacity);
    const g = Math.round(255 + (accentValues[1] - 255) * colorOpacity);
    const b = Math.round(255 + (accentValues[2] - 255) * colorOpacity);
    const wordColor = `rgb(${r},${g},${b})`;

    return (
      <>
        {before && <span style={{ color: baseColor }}>{before}</span>}
        <span
          style={{
            color: wordColor,
            display: "inline-block",
            transform: `scale(${scale})`,
            transformOrigin: "center bottom",
          }}
        >
          {emphasizedWord}
        </span>
        {after && <span style={{ color: baseColor }}>{after}</span>}
      </>
    );
  };

  return (
    // Outer positioning + entry/exit animation — translateY on the whole pill
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        width,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(calc(-50% + ${translateY}px))`,
        opacity,
      }}
    >
      {/* Path C pill backdrop */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: pillGap,
          maxWidth: "88vw",
          background: "rgba(20,20,27,0.85)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1.5px solid rgba(${accentRgb},0.80)`,
          borderRadius: 28,
          padding: pillPadding,
          boxShadow: [
            `0 0 36px rgba(${accentRgb},0.32)`,
            `0 0 8px rgba(${accentRgb},0.40)`,
            `0 18px 40px rgba(0,0,0,0.55)`,
          ].join(", "),
        }}
      >
        {/* Leading dot */}
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: dotHex,
            boxShadow: `0 0 12px ${dotHex}`,
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        {/* Caption text */}
        <span
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize,
            fontWeight,
            letterSpacing,
            lineHeight: 1.12,
            textAlign: "center",
            color: baseColor,
          }}
        >
          {renderText()}
        </span>
      </div>
    </div>
  );
}
