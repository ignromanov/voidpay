import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { Card } from "@/shared/ui";
import { PaymentQR } from "@/features/payment-qr";
import {
  DEMO_FROM_ADDRESS,
  DEMO_NETWORK_ID,
  DEMO_TOTAL_ATOMIC,
  DEMO_TOKEN_ADDRESS,
} from "../constants/demo-invoice";
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
      <NetworkBackground />

      {/* Dimmed backdrop */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        opacity: modalOpacity,
      }} />

      {/* Share modal */}
      <Card
        variant="glass"
        style={{
          position: "absolute",
          left: width / 2 - 320,
          top: height / 2 - 220,
          width: 640,
          padding: 32,
          transform: `translateY(${modalTranslateY}px)`,
          opacity: modalOpacity,
        }}
      >
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

        {/* QR code — gated behind a Sequence so the PaymentQR SVG isn't built
            for the 180 frames the modal is visible without it (P1.4). qrScale
            is computed at parent scope using the outer frame, so it still
            ramps from 0 when the Sequence activates. */}
        <Sequence from={180} premountFor={30}>
          <div style={{
            display: "flex",
            justifyContent: "center",
          }}>
            <div style={{ transform: `scale(${qrScale})` }}>
              <PaymentQR
                recipientAddress={DEMO_FROM_ADDRESS}
                chainId={DEMO_NETWORK_ID}
                amount={DEMO_TOTAL_ATOMIC}
                tokenAddress={DEMO_TOKEN_ADDRESS}
                size={160}
                variant="light"
                showLogo
              />
            </div>
          </div>
        </Sequence>
      </Card>

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
