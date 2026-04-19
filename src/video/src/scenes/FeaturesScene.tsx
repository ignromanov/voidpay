import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";

// Creative brief §3 (LOCKED): Cryptographic Receipts / Perpetual Links / PDF Export
// NOT spec's "PDF Export / Payment Verification / Local History"
const FEATURES = [
  {
    icon: "🔐",
    title: "Cryptographic Receipts",
    desc: "On-chain finalization — tamper-proof payment proof",
  },
  {
    icon: "∞",
    title: "Perpetual Links",
    desc: "Old invoice links work forever — schema versioning, immutable v1",
  },
  {
    icon: "📄",
    title: "PDF Export",
    desc: "Client-side generation with QR watermark — no server involved",
  },
] as const;

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  desc: string;
}> = ({ icon, title, desc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });
  const textOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <div style={{
        fontSize: 80,
        transform: `scale(${scale})`,
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: `${FONT_SANS}, sans-serif`,
        fontSize: 40,
        fontWeight: 900,
        color: COLORS.textPrimary,
        opacity: textOpacity,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: `${FONT_SANS}, sans-serif`,
        fontSize: 22,
        color: COLORS.textSecondary,
        opacity: textOpacity,
        maxWidth: 500,
        textAlign: "center",
      }}>
        {desc}
      </div>
    </AbsoluteFill>
  );
};

export const FeaturesScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={0} durationInFrames={100} premountFor={30}>
        <FeatureCard {...FEATURES[0]} />
      </Sequence>
      <Sequence from={100} durationInFrames={100} premountFor={30}>
        <FeatureCard {...FEATURES[1]} />
      </Sequence>
      <Sequence from={200} durationInFrames={100} premountFor={30}>
        <FeatureCard {...FEATURES[2]} />
      </Sequence>
    </AbsoluteFill>
  );
};
