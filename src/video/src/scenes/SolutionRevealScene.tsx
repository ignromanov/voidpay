import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { VoidLogo } from "../components/VoidLogo";
import { AuroraText } from "../components/AuroraText";
import { Caption } from "../components/Caption";

export const SolutionRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Ambient violet glow behind logo
  const glowScale = spring({
    frame,
    fps,
    config: SPRING_CONFIGS.smooth,
  });

  const glowOpacity = interpolate(
    frame,
    [0, 30],
    [0, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Creative brief §4 point 3: hold logo visible ≥30 frames at frame 360
  // This scene runs frames 0-119 local. Twitter cut freezes at scene boundary ~frame 360 global.
  // Logo stays visible throughout — glowPulse keeps it animated, no fade-out.

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - 150,
          top: height / 2 - 200,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.violetGlow}, transparent 70%)`,
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - 80,
          top: height / 2 - 140,
        }}
      >
        <VoidLogo size={160} delay={10} glowPulse />
      </div>

      {/* Aurora text */}
      <div
        style={{
          position: "absolute",
          top: height / 2 + 50,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <AuroraText text="VoidPay" fontSize={64} delay={30} fadeDuration={20} />
      </div>

      {/* LOCKED caption from creative-brief.md §1, Scene 2 */}
      <Caption text="Invoice in a URL." startAt={40} />
    </AbsoluteFill>
  );
};
