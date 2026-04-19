import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { ServerOffIcon } from "@/shared/ui/icons";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_MONO, FONT_SANS } from "../fonts";
import { PillarIcons } from "../components/PillarIcons";
import { Caption } from "../components/Caption";

const DATA_FIELDS = [
  { label: "Amount", value: "250.000042", offsetX: -250, offsetY: -80 },
  { label: "Token", value: "USDC", offsetX: 250, offsetY: -80 },
  { label: "Network", value: "Arbitrum", offsetX: -250, offsetY: 80 },
  { label: "Address", value: "0x7a250d56…", offsetX: 250, offsetY: 80 },
] as const;

export const PrivacyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const EXPLODE_START = 40;
  const IMPLODE_START = 140;
  const SERVER_X_START = 180;
  const PILLARS_START = 210;

  // URL opacity
  const urlOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Explode/implode progress
  const explodeProgress = frame >= EXPLODE_START
    ? spring({ frame: frame - EXPLODE_START, fps, config: SPRING_CONFIGS.smooth })
    : 0;
  const implodeProgress = frame >= IMPLODE_START
    ? spring({ frame: frame - IMPLODE_START, fps, config: SPRING_CONFIGS.smooth })
    : 0;
  const fieldSpread = explodeProgress - implodeProgress;

  // Server X
  const serverXScale = frame >= SERVER_X_START
    ? spring({ frame: frame - SERVER_X_START, fps, config: SPRING_CONFIGS.bouncy })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />
      {/* Central URL */}
      <div style={{
        position: "absolute",
        top: height * 0.25,
        width: "100%",
        textAlign: "center",
        opacity: urlOpacity,
      }}>
        <span style={{
          fontFamily: `${FONT_MONO}, monospace`,
          fontSize: 24,
          color: COLORS.textSecondary,
        }}>
          voidpay.xyz/pay
          <span style={{ color: COLORS.violet }}>#</span>
          <span style={{ color: COLORS.textMuted }}>N4IgbghgTg9g...</span>
        </span>
      </div>

      {/* Exploded data fields */}
      {DATA_FIELDS.map((field) => (
        <div
          key={field.label}
          style={{
            position: "absolute",
            left: width / 2 + field.offsetX * fieldSpread - 60,
            top: height * 0.35 + field.offsetY * fieldSpread,
            opacity: fieldSpread,
            textAlign: "center",
          }}
        >
          <div style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 12,
            color: COLORS.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}>
            {field.label}
          </div>
          <div style={{
            fontFamily: `${FONT_MONO}, monospace`,
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.textPrimary,
            background: "rgba(124, 58, 237, 0.1)",
            padding: "6px 14px",
            borderRadius: 8,
            border: `1px solid rgba(124, 58, 237, 0.2)`,
          }}>
            {field.value}
          </div>
        </div>
      ))}

      {/* Server-off icon — ServerOffIcon embeds the diagonal slash, so we drop
          the separate red X badge (was an emoji overlay). Audit-v1 cross-ref §3.1. */}
      {serverXScale > 0.01 && (
        <div style={{
          position: "absolute",
          left: width / 2 - 40,
          top: height * 0.52,
          transform: `scale(${serverXScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 80,
          height: 80,
          color: COLORS.error,
        }}>
          <ServerOffIcon size={64} strokeWidth={2} />
        </div>
      )}

      {/* Pillar icons */}
      <Sequence from={PILLARS_START} premountFor={30}>
        <PillarIcons stagger={10} />
      </Sequence>

      {/* LOCKED captions from creative-brief.md §1, Scene 7a and 7b.
          Caption 7a fades out before 7b fades in (SERVER_X_START=180). */}
      <Caption text="The URL IS the invoice." startAt={10} endAt={160} />
      <Sequence from={SERVER_X_START} premountFor={30}>
        <Caption text="No backend. No signup. No accounts." startAt={0} />
      </Sequence>
    </AbsoluteFill>
  );
};
