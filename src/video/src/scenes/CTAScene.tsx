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
import { FONT_MONO, FONT_SANS } from "../fonts";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: SPRING_CONFIGS.bouncy });
  const auroraOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaTextOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ambient glow pulse via frame
  const glowOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.15, 0.35],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        left: width / 2 - 200,
        top: height / 2 - 250,
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.violetGlow}, transparent 70%)`,
        opacity: glowOpacity,
      }} />

      {/* Logo — real @/shared/ui/VoidLogo, Remotion spring entrance */}
      <div style={{
        position: "absolute",
        left: width / 2 - 100,
        top: height * 0.2,
        transform: `scale(${logoScale})`,
        transformOrigin: "center",
      }}>
        <VoidLogo size={200} />
      </div>

      {/* VoidPay aurora text — real @/shared/ui/AuroraText (gradient + drop-shadow) */}
      <div style={{
        position: "absolute",
        top: height * 0.48,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: auroraOpacity,
      }}>
        <AuroraText as="h1" className="text-[56px] font-black tracking-tight">
          VoidPay
        </AuroraText>
      </div>

      {/* LOCKED caption from creative-brief.md §1, Scene 8a */}
      <div style={{
        position: "absolute",
        top: height * 0.6,
        width: "100%",
        textAlign: "center",
        opacity: ctaTextOpacity,
      }}>
        <div style={{
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.textPrimary,
        }}>
          Create your first invoice in 30 seconds.
        </div>
      </div>

      {/* URL */}
      <div style={{
        position: "absolute",
        top: height * 0.68,
        width: "100%",
        textAlign: "center",
        opacity: urlOpacity,
      }}>
        <span style={{
          fontFamily: `${FONT_MONO}, monospace`,
          fontSize: 24,
          color: COLORS.violet,
          fontWeight: 600,
        }}>
          voidpay.xyz
        </span>
      </div>

      {/* LOCKED caption from creative-brief.md §1, Scene 8b */}
      <div style={{
        position: "absolute",
        top: height * 0.76,
        width: "100%",
        textAlign: "center",
        opacity: subtitleOpacity,
      }}>
        <div style={{
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize: 20,
          color: COLORS.textSecondary,
        }}>
          No KYC. No subscription. Forever.
        </div>
      </div>

      {/* MIT badge (subtle, bottom-right) */}
      <div style={{
        position: "absolute",
        bottom: 30,
        right: 40,
        fontFamily: `${FONT_SANS}, sans-serif`,
        fontSize: 13,
        color: COLORS.textMuted,
        opacity: subtitleOpacity * 0.7,
      }}>
        MIT Licensed
      </div>
    </AbsoluteFill>
  );
};
