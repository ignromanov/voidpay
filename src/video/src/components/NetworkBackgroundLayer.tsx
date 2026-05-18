/**
 * NetworkBackgroundLayer — Remotion-safe ambient orb background.
 *
 * Replicates Mocks v2 `.nb-orb` + `.nb-grad-top` design formula using
 * inline styles (no Tailwind, no `fixed` positioning — compatible with
 * Remotion AbsoluteFill rendering context).
 *
 * Two variants:
 *   "strong" — Hook/Outro scenes (F1, F13): large orbs at 55%, higher opacity
 *   "soft"   — Content scenes (F2-F12): smaller orbs at 50%, lower opacity
 *
 * Usage:
 *   <NetworkBackgroundLayer />                // soft (default)
 *   <NetworkBackgroundLayer variant="strong" />
 */

type NetworkBackgroundLayerProps = {
  variant?: "strong" | "soft";
  /** Overall opacity multiplier (0-1). Default 1. */
  opacity?: number;
};

export const NetworkBackgroundLayer: React.FC<NetworkBackgroundLayerProps> = ({
  variant = "soft",
  opacity = 1,
}) => {
  const isStrong = variant === "strong";

  // Mocks v2 orb sizes: F1/F13 use 55%, F2-F12 use 50%
  const orbSize = isStrong ? "55%" : "50%";

  // Position coords: F1/F13 (strong): top:18% left:18% / bottom:18% right:18%
  //                  F2-F12 (soft):   top:14% left:14% / bottom:18% right:14%
  const violetTop  = isStrong ? "18%" : "14%";
  const violetLeft = isStrong ? "18%" : "14%";
  const indigoBottom = isStrong ? "18%" : "18%";
  const indigoRight  = isStrong ? "18%" : "14%";

  // Mocks v2 blur: nb-orb uses blur(48px); stage::before/after edges use blur(56px)
  const blur = isStrong ? "56px" : "48px";

  // Opacity: strong = full (0.85 violet / 0.75 indigo); soft = low (0.10 each)
  const violetBg = isStrong
    ? "radial-gradient(circle, rgba(167,139,250,0.55), rgba(167,139,250,0) 70%)"
    : "rgba(124,58,237,0.10)";
  const indigoBg = isStrong
    ? "radial-gradient(circle, rgba(34,211,238,0.38), rgba(34,211,238,0) 70%)"
    : "rgba(79,70,229,0.10)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity,
      }}
      aria-hidden="true"
    >
      {/* Top gradient overlay — darkens upper band for text legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(24,24,27,0.5), transparent 60%)",
        }}
      />

      {/* Violet orb — top-left anchor */}
      <div
        style={{
          position: "absolute",
          top: violetTop,
          left: violetLeft,
          width: orbSize,
          aspectRatio: "1",
          borderRadius: "9999px",
          background: violetBg,
          filter: `blur(${blur})`,
        }}
      />

      {/* Indigo/cyan orb — bottom-right anchor */}
      <div
        style={{
          position: "absolute",
          bottom: indigoBottom,
          right: indigoRight,
          width: orbSize,
          aspectRatio: "1",
          borderRadius: "9999px",
          background: indigoBg,
          filter: `blur(${blur})`,
        }}
      />
    </div>
  );
};
