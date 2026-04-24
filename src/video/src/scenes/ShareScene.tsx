import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { LinkTab } from "@/widgets/share-modal";
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
import { FONT_SANS } from "../fonts";
import { Caption } from "../components/Caption";

// Full URL so LinkTab's `new URL(...)` parser produces proper color-coded
// protocol / domain / path / hash segments instead of falling back to raw.
// v2: og prefix carries recipient address so the callback is visible in the
// LinkTab URL rendering (creative-brief-v2 §4 non-negotiable "address callback").
const SHARE_URL = `https://voidpay.xyz/pay?og=VP-0001_250_USDC_arb_${DEMO_FROM_ADDRESS}#N4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4Cu`;
const TELEGRAM_URL = `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent("Pay me in crypto — VoidPay invoice")}`;
const TWITTER_URL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent("Pay me in crypto — VoidPay invoice")}`;
const EMAIL_URL = `mailto:?subject=${encodeURIComponent("VoidPay invoice")}&body=${encodeURIComponent(SHARE_URL)}`;

// Frame at which the narrative "Copy" click fires
const COPY_CLICK_FRAME = 100;
// Frame at which QR preview enters
const QR_ENTER_FRAME = 180;

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
};

/** URL anatomy annotation arrow + label (narrative-only, kept inline) */
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

  // Narrative "copied" state: flips at COPY_CLICK_FRAME so the real LinkTab
  // shows its own "Copied!" affordance (CopyOverlay flash + icon swap).
  const copied = frame >= COPY_CLICK_FRAME + 10;

  // QR code entrance
  const qrScale = frame >= QR_ENTER_FRAME
    ? spring({ frame: frame - QR_ENTER_FRAME, fps, config: SPRING_CONFIGS.smooth })
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

      {/* Share modal — real LinkTab inside a glass Card that mimics the
          Dialog shell (Dialog itself uses Radix Portal, which breaks static
          SSR rendering; we bypass by using LinkTab directly per decision
          in the Phase 3 plan). */}
      <Card
        variant="glass"
        style={{
          position: "absolute",
          left: width / 2 - 320,
          top: height / 2 - 280,
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

        <LinkTab
          url={SHARE_URL}
          copied={copied}
          onCopy={noop}
          telegramUrl={TELEGRAM_URL}
          twitterUrl={TWITTER_URL}
          emailUrl={EMAIL_URL}
          includeOg={false}
          onOgToggle={noop}
        />
      </Card>

      {/* QR preview — gated behind a Sequence so PaymentQR SVG isn't built
          for the 180 frames before it's visible (P1.4). qrScale is computed
          at parent scope using the outer frame, so it still ramps from 0
          when the Sequence activates. */}
      <Sequence from={QR_ENTER_FRAME} premountFor={30}>
        <div style={{
          position: "absolute",
          right: width * 0.08,
          top: height / 2 - 80,
          transform: `scale(${qrScale})`,
          transformOrigin: "top right",
          background: "white",
          padding: 16,
          borderRadius: 16,
        }}>
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
      </Sequence>

      {/* URL anatomy annotation — narrative teaching graphic, kept inline
          because it's specific to the video (not part of the real modal) */}
      <Sequence from={130} premountFor={30}>
        {/* LOCKED caption from creative-brief.md §1, Scene 4 arrow */}
        <Annotation label="# fragment — browser only. Server can't see it." x={width / 2 + 50} y={height / 2 - 245} delay={0} />
      </Sequence>

      {/* v2 caption per creative-brief-v2 §4 — top-mounted to clear modal. */}
      <Caption text="No signup" position="top" startAt={0} endAt={90} />
    </AbsoluteFill>
  );
};
