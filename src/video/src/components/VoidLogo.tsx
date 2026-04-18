import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";

type VoidLogoProps = {
  size?: number;
  /** Delay entrance by N frames */
  delay?: number;
  /** Show glow pulse (animated via frame) */
  glowPulse?: boolean;
};

export const VoidLogo: React.FC<VoidLogoProps> = ({
  size = 120,
  delay = 0,
  glowPulse = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIGS.bouncy,
  });

  const glowOpacity = glowPulse
    ? interpolate(
        Math.sin((frame - delay) * 0.05),
        [-1, 1],
        [0.3, 0.7],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0.4;

  return (
    <div style={{ transform: `scale(${scale})`, display: "inline-block" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow ring */}
        <circle
          cx="50" cy="50" r="34"
          fill="none"
          stroke={COLORS.violet}
          strokeWidth="1.5"
          opacity={glowOpacity}
          filter="url(#logo-glow)"
        />

        {/* Main ring */}
        <circle
          cx="50" cy="50" r="32"
          fill="none"
          stroke={COLORS.violet}
          strokeWidth="1.5"
          opacity={0.7}
        />

        {/* Void core */}
        <circle cx="50" cy="50" r="31" fill={COLORS.bg} />

        {/* Deep center */}
        <circle cx="50" cy="50" r="22" fill="#000000" />
      </svg>
    </div>
  );
};
