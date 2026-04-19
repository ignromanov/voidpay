import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VoidLogo, AuroraText } from "@/shared/ui";
import { NetworkBackground } from "@/widgets/network-background";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
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
      <NetworkBackground />

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

      {/* Logo — real @/shared/ui/VoidLogo (black hole SVG + violet glow).
          Frame-driven bouncy spring entrance; Tailwind CSS pulse handles ambient. */}
      {(() => {
        const logoDelay = 10
        const logoScale = spring({
          frame: frame - logoDelay,
          fps,
          config: SPRING_CONFIGS.bouncy,
        })
        return (
          <div
            style={{
              position: "absolute",
              left: width / 2 - 80,
              top: height / 2 - 140,
              transform: `scale(${logoScale})`,
              transformOrigin: "center",
            }}
          >
            <VoidLogo size={160} static />
          </div>
        )
      })()}

      {/* Aurora text — real @/shared/ui/AuroraText with animate-none.
          CSS animations (animate-aurora / blackhole-pulse) cause intermittent
          full-frame whiteout in Remotion's headless Chromium when combined
          with filter/drop-shadow at certain frames. Static gradient only.
          Per audit-v1 §2.1 Option X — frame-prop upgrade is deferred to
          AI#58.1; static is the intentional ship-for-now decision. */}
      {(() => {
        const textDelay = 30
        const fadeDuration = 20
        const auroraOpacity = interpolate(
          frame,
          [textDelay, textDelay + fadeDuration],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
        return (
          <div
            style={{
              position: "absolute",
              top: height / 2 + 50,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              opacity: auroraOpacity,
            }}
          >
            <AuroraText as="h1" className="text-[64px] font-black tracking-tight [animation:none]">
              VoidPay
            </AuroraText>
          </div>
        )
      })()}

      {/* LOCKED caption from creative-brief.md §1, Scene 2 */}
      <Caption text="Invoice in a URL." startAt={40} />
    </AbsoluteFill>
  );
};
