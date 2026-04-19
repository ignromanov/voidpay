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
import { FONT_MONO, FONT_SANS } from "../fonts";
import { Caption } from "../components/Caption";

// Creative brief §2: same address reused in Scene 5 for narrative callback
const WALLET_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const TYPEWRITER_SPEED = 1; // frames per char (fast for urgency)

const ErrorPopup: React.FC<{
  text: string;
  x: number;
  y: number;
  delay: number;
}> = ({ text, x, y, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIGS.heavy,
  });

  const opacity = interpolate(
    frame,
    [delay, delay + 5, delay + 60, delay + 75],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        background: "rgba(239, 68, 68, 0.15)",
        border: `1px solid ${COLORS.error}`,
        borderRadius: 8,
        padding: "8px 16px",
        fontFamily: `${FONT_SANS}, sans-serif`,
        fontSize: 18,
        color: COLORS.error,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

const ChatBubble: React.FC<{
  text: string;
  isAddress?: boolean;
  delay: number;
}> = ({ text, isAddress = false, delay }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Typewriter for address
  const displayText = isAddress
    ? text.slice(0, Math.max(0, Math.floor((frame - delay) / TYPEWRITER_SPEED)))
    : text;

  return (
    <div
      style={{
        opacity,
        background: COLORS.zinc900,
        borderRadius: 12,
        padding: "12px 16px",
        maxWidth: 500,
        fontFamily: isAddress ? `${FONT_MONO}, monospace` : `${FONT_SANS}, sans-serif`,
        fontSize: isAddress ? 16 : 18,
        color: isAddress ? COLORS.textSecondary : COLORS.textPrimary,
        wordBreak: "break-all",
        marginBottom: 8,
      }}
    >
      {displayText}
      {isAddress && frame - delay < text.length * TYPEWRITER_SPEED && (
        <span style={{ opacity: Math.round(frame * 0.1) % 2 }}>▌</span>
      )}
    </div>
  );
};

const FloatingText: React.FC<{ text: string; x: number; y: number; delay: number }> = ({
  text, x, y, delay,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 10, delay + 80, delay + 100],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const floatY = interpolate(
    frame - delay,
    [0, 100],
    [0, -20],
    { extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + floatY,
        fontFamily: `${FONT_SANS}, sans-serif`,
        fontSize: 22,
        color: COLORS.textMuted,
        fontStyle: "italic",
        opacity,
      }}
    >
      {text}
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Chat mockup — appears immediately (frame 0) */}
      <div
        style={{
          position: "absolute",
          top: height * 0.15,
          left: width * 0.25,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatBubble text="Hey, send payment to this wallet:" delay={0} />
        <ChatBubble text={WALLET_ADDRESS} isAddress delay={10} />
        <ChatBubble text="Which network? Which token??" delay={80} />
      </div>

      {/* Error popups — staggered for chaos */}
      <Sequence from={30} premountFor={30}>
        <ErrorPopup text="⚠ Wrong network!" x={width * 0.6} y={height * 0.3} delay={0} />
      </Sequence>
      <Sequence from={55} premountFor={30}>
        <ErrorPopup text="⚠ Clipboard hijack detected" x={width * 0.15} y={height * 0.55} delay={0} />
      </Sequence>
      <Sequence from={90} premountFor={30}>
        <ErrorPopup text="⚠ Wrong decimals — funds lost" x={width * 0.45} y={height * 0.65} delay={0} />
      </Sequence>

      {/* Floating chaotic text */}
      <Sequence from={60} premountFor={30}>
        <FloatingText text="Which token?" x={width * 0.7} y={height * 0.5} delay={0} />
      </Sequence>
      <Sequence from={75} premountFor={30}>
        <FloatingText text="Which decimals?" x={width * 0.2} y={height * 0.4} delay={0} />
      </Sequence>

      {/* LOCKED caption from creative-brief.md §1, Scene 1 */}
      <Caption text="Raw addresses. Wrong networks. Wrong decimals." startAt={0} />
    </AbsoluteFill>
  );
};
