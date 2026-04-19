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

const SHARE_URL = "voidpay.xyz/pay#N4IgbghgTg9g...";

/** URL anatomy annotation arrow + label */
const Annotation: React.FC<{
  label: string;
  x: number;
  y: number;
  delay: number;
}> = ({ label, x, y, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <div style={{
        width: 2,
        height: 30,
        background: COLORS.violet,
        marginBottom: 6,
      }} />
      <div style={{
        fontFamily: `${FONT_SANS}, sans-serif`,
        fontSize: 14,
        color: COLORS.violet,
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: "rgba(124, 58, 237, 0.1)",
        padding: "4px 10px",
        borderRadius: 6,
      }}>
        {label}
      </div>
    </div>
  );
};

export const ShareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Modal slide-up
  const modalTranslateY = interpolate(
    spring({ frame, fps, config: SPRING_CONFIGS.smooth }),
    [0, 1],
    [200, 0],
  );
  const modalOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Copy button ripple at frame 100
  const copyClickFrame = 100;
  const copyScale = frame >= copyClickFrame
    ? spring({ frame: frame - copyClickFrame, fps, config: SPRING_CONFIGS.snappy })
    : 1;

  // QR code at frame 180
  const qrScale = frame >= 180
    ? spring({ frame: frame - 180, fps, config: SPRING_CONFIGS.smooth })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Dimmed backdrop */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        opacity: modalOpacity,
      }} />

      {/* Share modal */}
      <div style={{
        position: "absolute",
        left: width / 2 - 320,
        top: height / 2 - 220,
        width: 640,
        background: COLORS.zinc900,
        border: `1px solid ${COLORS.zinc800}`,
        borderRadius: 16,
        padding: 32,
        transform: `translateY(${modalTranslateY}px)`,
        opacity: modalOpacity,
      }}>
        <div style={{
          fontFamily: `${FONT_SANS}, sans-serif`,
          fontSize: 22,
          fontWeight: 700,
          color: COLORS.textPrimary,
          marginBottom: 20,
        }}>
          Share Invoice
        </div>

        {/* URL display */}
        <div style={{
          background: COLORS.bg,
          border: `1px solid ${COLORS.zinc800}`,
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}>
          <div style={{
            flex: 1,
            fontFamily: `${FONT_MONO}, monospace`,
            fontSize: 15,
            color: COLORS.textSecondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {SHARE_URL}
          </div>
          <div style={{
            background: COLORS.violet,
            borderRadius: 6,
            padding: "6px 14px",
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 14,
            fontWeight: 600,
            color: "white",
            transform: `scale(${frame >= copyClickFrame && frame < copyClickFrame + 20 ? 0.9 + copyScale * 0.1 : 1})`,
          }}>
            {frame >= copyClickFrame + 10 ? "Copied ✓" : "Copy"}
          </div>
        </div>

        {/* QR code placeholder */}
        <div style={{
          display: "flex",
          justifyContent: "center",
        }}>
          <div style={{
            width: 160,
            height: 160,
            background: "white",
            borderRadius: 8,
            transform: `scale(${qrScale})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Simplified QR grid pattern */}
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* QR corner markers */}
              <rect x="5" y="5" width="30" height="30" rx="4" fill="#09090b" />
              <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
              <rect x="14" y="14" width="12" height="12" rx="1" fill="#09090b" />
              <rect x="85" y="5" width="30" height="30" rx="4" fill="#09090b" />
              <rect x="90" y="10" width="20" height="20" rx="2" fill="white" />
              <rect x="94" y="14" width="12" height="12" rx="1" fill="#09090b" />
              <rect x="5" y="85" width="30" height="30" rx="4" fill="#09090b" />
              <rect x="10" y="90" width="20" height="20" rx="2" fill="white" />
              <rect x="14" y="94" width="12" height="12" rx="1" fill="#09090b" />
              {/* Random data dots */}
              {[45, 55, 65, 75, 50, 60, 70, 80].map((cx, i) =>
                [45, 55, 65, 75, 50, 60, 70].map((cy, j) => (
                  <rect key={`${i}-${j}`} x={cx} y={cy} width="6" height="6" fill={(i + j) % 3 === 0 ? "#09090b" : "transparent"} />
                ))
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* URL anatomy annotations (appear after modal settles) */}
      <Sequence from={130} premountFor={30}>
        {/* LOCKED caption from creative-brief.md §1, Scene 4 arrow */}
        <Annotation label="# fragment — browser only. Server can't see it." x={width / 2 + 50} y={height / 2 - 245} delay={0} />
      </Sequence>

      {/* LOCKED caption from creative-brief.md §1, Scene 4 */}
      <Caption text="Share anywhere. Your data never touches our servers." startAt={200} />
    </AbsoluteFill>
  );
};
