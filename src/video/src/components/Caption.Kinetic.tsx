import { Easing, interpolate } from "remotion";
import { FONT_SANS } from "../fonts";
import {
  computeEntry,
  computeExit,
  computeWordPopColorOpacity,
  computeWordPopScale,
  resolveYPercent,
  type CaptionSpringConfig,
  type CaptionWeight,
} from "./Caption.helpers";
import type { CaptionVariant } from "./Caption";

type KineticCaptionProps = {
  text: string;
  startAt: number;
  endAt: number;
  fontSize: number;
  position: "top" | "bottom" | "center" | number;
  variant: CaptionVariant;
  weight: CaptionWeight;
  emphasizedWord: string | undefined;
  flickerWord: string | undefined;
  springConfig: CaptionSpringConfig;
  frame: number;
  fps: number;
  width: number;
  height: number;
};

export function KineticCaption({
  text, startAt, endAt, fontSize, position, variant,
  weight, emphasizedWord, flickerWord, springConfig,
  frame, fps, width,
}: KineticCaptionProps) {
  const entryValue = computeEntry(frame, fps, startAt, weight, springConfig);
  const exitOpacity = computeExit(frame, endAt);

  // Pulse dot: 1s sin-cycle at 30fps — calm rhythm, not rapid blink
  const PULSE_PERIOD = 30;
  const phase = frame % PULSE_PERIOD;
  const pulseOpacity = interpolate(
    phase,
    [0, PULSE_PERIOD / 2, PULSE_PERIOD],
    [0.5, 1.0, 0.5],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const pulseScale = interpolate(
    phase,
    [0, PULSE_PERIOD / 2, PULSE_PERIOD],
    [0.85, 1.15, 0.85],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Breathing glow: 36fr period — intentionally drifts vs dot pulse (30fr) for organic feel
  const breathPeriod = 36;
  const breathPhase = frame % breathPeriod;
  const breathSpread = interpolate(
    breathPhase,
    [0, breathPeriod / 2, breathPeriod],
    [0, 53, 0],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const breathOpacity = interpolate(
    breathPhase,
    [0, breathPeriod / 2, breathPeriod],
    [0, 0.37, 0],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // TikTok-style flicker: 6-frame cycle = 5Hz at 30fps
  const flickerOpacity = interpolate(frame % 6, [0, 3, 6], [0.2, 1.0, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
  const pillPadding = isCompact ? "20px 40px" : "24px 44px";
  const pillGap = isCompact ? 14 : 18;

  // Text
  const fontWeight = weight;
  const letterSpacing = weight === 700 ? "-0.02em" : "-0.01em";
  const baseColor = "#ffffff";

  const renderText = () => {
    const scale = computeWordPopScale(frame, startAt, endAt, weight);
    const colorOpacity = computeWordPopColorOpacity(frame, startAt, endAt);
    const accentValues = isEmerald ? [0x10, 0xb9, 0x81] : [0xa7, 0x8b, 0xfa];
    const r = Math.round(255 + (accentValues[0] - 255) * colorOpacity);
    const g = Math.round(255 + (accentValues[1] - 255) * colorOpacity);
    const b = Math.round(255 + (accentValues[2] - 255) * colorOpacity);
    const wordColor = `rgb(${r},${g},${b})`;

    // Renders a plain text segment, further splitting on flickerWord if present and distinct from emphasizedWord
    const renderSegment = (segment: string) => {
      if (!flickerWord || flickerWord === emphasizedWord || !segment.includes(flickerWord)) {
        return <span style={{ color: baseColor }}>{segment}</span>;
      }
      const fi = segment.indexOf(flickerWord);
      const fb = segment.slice(0, fi);
      const fa = segment.slice(fi + flickerWord.length);
      return (
        <>
          {fb && <span style={{ color: baseColor }}>{fb}</span>}
          <span style={{ color: baseColor, opacity: flickerOpacity }}>{flickerWord}</span>
          {fa && <span style={{ color: baseColor }}>{fa}</span>}
        </>
      );
    };

    if (!emphasizedWord || !text.includes(emphasizedWord)) {
      return renderSegment(text);
    }

    const idx = text.indexOf(emphasizedWord);
    const before = text.slice(0, idx);
    const after = text.slice(idx + emphasizedWord.length);

    // If flickerWord matches emphasizedWord, flicker opacity replaces base opacity on that span
    const isFlickered = flickerWord === emphasizedWord;

    return (
      <>
        {before && renderSegment(before)}
        <span
          style={{
            color: wordColor,
            display: "inline-block",
            transform: `scale(${scale})`,
            transformOrigin: "center bottom",
            ...(isFlickered ? { opacity: flickerOpacity } : {}),
          }}
        >
          {emphasizedWord}
        </span>
        {after && renderSegment(after)}
      </>
    );
  };

  return (
    // Outer positioning + entry/exit animation — translateY on the whole pill
    // Round-9o: zIndex 100 ensures caption always renders above scene UI (panels, paper, modal)
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
        zIndex: 100,
      }}
    >
      {/* Path C pill backdrop */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "flex-start",
          gap: pillGap,
          maxWidth: "88vw",
          background: "rgba(20,20,27,0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: `1.5px solid rgba(${accentRgb},0.80)`,
          borderRadius: 24,
          padding: pillPadding,
          boxShadow: [
            `0 0 ${breathSpread}px rgba(${accentRgb}, ${breathOpacity})`,
            `0 0 12px rgba(${accentRgb}, 0.60)`,
            `0 18px 40px rgba(0,0,0,0.55)`,
          ].join(", "),
        }}
      >
        {/* Leading dot — sin-pulse: calm 1s rhythm */}
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: dotHex,
            boxShadow: `0 0 10px ${dotHex}`,
            flexShrink: 0,
            display: "inline-block",
            opacity: pulseOpacity,
            transform: `scale(${pulseScale})`,
            marginTop: Math.round(fontSize * 0.08),
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
            whiteSpace: "pre-line",
          }}
        >
          {renderText()}
        </span>
      </div>
    </div>
  );
}
