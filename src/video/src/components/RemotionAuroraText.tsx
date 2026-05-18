import { useCurrentFrame } from "remotion";
import type { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Override style (font-size, weight, etc.) */
  style?: CSSProperties;
  /** Animation period in frames (default: 90 — 3s loop @ 30fps, matches landing's ~3s aurora-shift) */
  periodFrames?: number;
  /** Phase offset in frames (e.g. for staggered words) */
  phaseFrames?: number;
}

/**
 * Frame-driven aurora gradient text — render-safe Remotion equivalent of
 * production AuroraText which uses CSS `animate-aurora` (forbidden in Remotion).
 *
 * Colours match landing's from-violet-500 via-indigo-500 to-purple-500.
 * 5-stop gradient so bgPos 0→200% completes a clean loop without visible seam.
 * No CSS animations — pure frame-driven, deterministic across renders.
 */
export const RemotionAuroraText: React.FC<Props> = ({
  children,
  style,
  periodFrames = 90,
  phaseFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const t = ((frame + phaseFrames) % periodFrames) / periodFrames; // 0..1
  // Background-position swings 0% → 200% → 0% — matches landing's `bg-[length:200%_auto]` pattern
  const bgPos = `${t * 200}% 50%`;

  return (
    <span
      style={{
        backgroundImage:
          "linear-gradient(90deg, #8b5cf6, #6366f1, #a855f7, #6366f1, #8b5cf6)",
        backgroundSize: "200% auto",
        backgroundPosition: bgPos,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        filter: "drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
