import { interpolate, useCurrentFrame, Easing } from "remotion";

type PulseGlowProps = {
  /** Brand color RGB components without alpha, e.g. "124, 58, 237" for violet-700 */
  rgb: string;
  /** Base blur spread in px — oscillates ±30% around this value. Default 20 */
  spread?: number;
  /** Animation period in frames. Default 30 (= 1s at 30fps) */
  period?: number;
  /** Border radius in px — should match the wrapped chip. Default 9999 */
  borderRadius?: number;
  children: React.ReactNode;
};

/**
 * PulseGlow — wraps a chip-style element and adds a sin-pulse glow halo.
 *
 * Only the boxShadow (halo) pulsates — the chip body is untouched.
 * Matches the sin-pulse rhythm already used in Caption.tsx and WalletPill.tsx.
 */
export const PulseGlow: React.FC<PulseGlowProps> = ({
  rgb,
  spread = 20,
  period = 30,
  borderRadius = 9999,
  children,
}) => {
  const frame = useCurrentFrame();
  const phase = frame % period;

  const glowOpacity = interpolate(
    phase,
    [0, period / 2, period],
    [0.3, 0.7, 0.3],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const glowSpread = interpolate(
    phase,
    [0, period / 2, period],
    [spread * 0.7, spread, spread * 0.7],
    { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        display: "inline-block",
        borderRadius,
        boxShadow: `0 0 ${glowSpread}px rgba(${rgb}, ${glowOpacity})`,
      }}
    >
      {children}
    </div>
  );
};
