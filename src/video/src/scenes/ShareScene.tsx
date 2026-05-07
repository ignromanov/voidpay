import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { LinkTab, InvoiceSummary } from "@/widgets/share-modal";
import { QRTab } from "@/features/payment-qr";
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui";
import { CheckCircleIcon } from "@/shared/ui/icons";
import { DEMO_FROM_ADDRESS, DEMO_INVOICE } from "../constants/demo-invoice";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";

// Full URL — 4x longer hash payload (~560 chars) so the LinkTab URL visibly
// truncates with ellipsis and reads as "very long / data-dense".
// og prefix carries recipient address for the address callback (creative-brief-v2 §4).
const HASH_PAYLOAD =
  "N4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBY" +
  "AuADgE4CuAxgC4DmAhgBYAuADgE4CuN4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxg" +
  "C4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4CuN4Igbghg" +
  "Tg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4Cu" +
  "AxgC4DmAhgBYAuADgE4CuN4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYA" +
  "uADgE4CuAxgC4DmAhgBYAuADgE4CuAxgC4DmAhgBYAuADgE4Cu";
const SHARE_URL = `https://voidpay.xyz/pay?og=VP-0001_250_USDC_arb_${DEMO_FROM_ADDRESS}#${HASH_PAYLOAD}`;
const TELEGRAM_URL = `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent("Pay me in crypto — VoidPay invoice")}`;
const TWITTER_URL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent("Pay me in crypto — VoidPay invoice")}`;
const EMAIL_URL = `mailto:?subject=${encodeURIComponent("VoidPay invoice")}&body=${encodeURIComponent(SHARE_URL)}`;

// Frame at which the narrative "Copy" click fires — round 9a: pushed from 60→110
// to give Link-tab idle 80fr / 2.667s read window before copy fires (Ignat #2.3).
// round-9a: Copy fires once via boolean flip; CopyOverlay motion.div animate restarts
// each Remotion frame (Fix B: acceptable for p12 preview; production snapshot unaffected).
const COPY_CLICK_FRAME = 110;
// QR_TAB_FROM_FRAME — round 9a-patch2 (C5): extended from 150→190 (copied state held longer).
// Old (patch1): copy 110 → QR 150 (40fr feedback). New: copy 110 → QR 190 (80fr feedback).
// S2 extended +40fr (260→300) to fund this without compressing QR window.
const QR_TAB_FROM_FRAME = 190;

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
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

  // Frame drives the tab value — no user interaction in Remotion
  const tabValue = frame >= QR_TAB_FROM_FRAME ? "qr" : "link";

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

      {/* Share modal shell — 512px wide, matches real ShareModal layout.
          Centered on screen. */}
      <Card
        variant="glass"
        style={{
          position: "absolute",
          left: width / 2 - 256,
          top: height / 2 - 280,
          width: 512,
          padding: 0,
          transform: `translateY(${modalTranslateY}px)`,
          opacity: modalOpacity,
          overflow: "hidden",
        }}
      >
        {/* Violet top gradient bar — matches real ShareModal */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)",
        }} />

        {/* Header — "Invoice Ready" pattern from ShareModal.tsx (px-6 pt-6 ≈ 24px) */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}>
            <CheckCircleIcon size={20} style={{ color: COLORS.violet }} />
            Invoice Ready
          </div>
          <div style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: 14,
            color: "rgba(113, 113, 122, 1)",
            marginBottom: 16,
          }}>
            Share this link to get paid
          </div>

          {/* InvoiceSummary block — real widget component, presentational only */}
          <InvoiceSummary invoice={DEMO_INVOICE} />
        </div>

        {/* Tabs — real ShareModal px-6 pb-6 pattern */}
        <div style={{ padding: "0 24px 24px 24px" }}>
          <Tabs value={tabValue} onValueChange={() => {}} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="link" className="flex-1">Link</TabsTrigger>
              <TabsTrigger value="qr" className="flex-1">QR Code</TabsTrigger>
            </TabsList>
            <div style={{ minHeight: 200 }}>
              <TabsContent value="link">
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
              </TabsContent>
              <TabsContent value="qr">
                <QRTab url={SHARE_URL} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>

    </AbsoluteFill>
  );
};
