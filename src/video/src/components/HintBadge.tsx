import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_SANS, FONT_MONO } from "../fonts";
import { SPRING_CONFIGS } from "../constants/timing";

type HintBadgeProps = {
  text: string;
  /** Frame (local to parent Sequence) when hint starts fading in */
  startAt: number;
  /** Frame when hint starts fading out */
  endAt: number;
  /** Absolute positioning — caller controls layout */
  style: React.CSSProperties;
  /**
   * "ghost" (default): minimal — for legacy callers; renders same as "arrow" in v2
   * "arrow": Mocks v2 .hint spec — dark pill, violet border + glow, dot + arrow slots
   */
  variant?: "ghost" | "arrow";
  /**
   * Font size in px. Default 40 — legible at 9:16 portrait phone playback.
   * Callers may pass a smaller override when layout space is constrained.
   */
  fontSize?: number;
};

/**
 * HintBadge — Mocks v2 import.
 *
 * Renders as a dark zinc-900 capsule with violet-700 border and glow halo.
 * Leading violet dot (::before equivalent) + text with inline <span> arrows.
 * Mock .hint spec: background #18181b, border #7c3aed, box-shadow triple layer,
 * border-radius 14px, padding 5px 12px 5px 10px.
 *
 * Font sizes are from mock ×3 (360→1080 viewport scale).
 */
export const HintBadge: React.FC<HintBadgeProps> = ({
  text,
  startAt,
  endAt,
  style,
  fontSize = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring fade-in
  const enterSpring = spring({
    frame: frame - startAt,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 10,
  });

  const fadeInOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Linear fade-out
  const fadeOutOpacity = interpolate(
    frame,
    [endAt, endAt + 8],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = fadeInOpacity * fadeOutOpacity;

  // Dot size: 5px in mock (360 base) × 3 = 15px at 1080
  const dotSize = Math.round(fontSize * 0.375);
  // Gap: 7px mock × 3 = 21px
  const gap = Math.round(fontSize * 0.525);
  // Padding: 5px 12px 5px 10px mock × 3 = 15px 36px 15px 30px
  const padV = Math.round(fontSize * 0.375);
  const padR = Math.round(fontSize * 0.9);
  const padL = Math.round(fontSize * 0.75);
  // Border-radius: 14px mock × 3 = 42px
  const borderRadius = Math.round(fontSize * 1.05);

  // Parse text: replace → and ← arrows with styled spans
  const parts = text.split(/(→|←)/g);
  const renderedText = parts.map((part, i) => {
    if (part === "→" || part === "←") {
      return (
        <span
          key={i}
          style={{
            color: "#c4b5fd",
            margin: "0 6px",
            fontWeight: 800,
            fontFamily: `${FONT_SANS}, sans-serif`,
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });

  return (
    <div
      style={{
        position: "absolute",
        opacity,
        pointerEvents: "none",
        // Intrinsic width: prevents block-level stretch when positioned with `right:`.
        // display:inline-block makes the absolute wrapper shrink to its inline-flex child.
        display: "inline-block",
        ...style,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap,
          // Mocks v2 .hint: dark zinc-900 bg, violet-700 border, triple box-shadow
          background: "#18181b",
          border: "1px solid #7c3aed",
          borderRadius,
          padding: `${padV}px ${padR}px ${padV}px ${padL}px`,
          boxShadow: [
            "0 0 0 2px rgba(255,255,255,0.06)",
            "0 6px 18px rgba(0,0,0,0.55)",
            "0 0 14px rgba(124,58,237,0.35)",
          ].join(", "),
          textAlign: "center",
        }}
      >
        {/* Leading violet dot — ::before equivalent */}
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: "#a78bfa",
            boxShadow: "0 0 6px #a78bfa",
            flexShrink: 0,
            alignSelf: "center",
          }}
        />

        {/* Text content — arrows styled inline */}
        <span
          style={{
            fontFamily: `${FONT_MONO}, monospace`,
            fontSize,
            fontWeight: 600,
            color: "#f4f4f5",
            lineHeight: 1.35,
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {renderedText}
        </span>
      </div>
    </div>
  );
};
