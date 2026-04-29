import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { LinkTab } from "@/widgets/share-modal";
import { QRTab } from "@/features/payment-qr";
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui";
import { DEMO_FROM_ADDRESS } from "../constants/demo-invoice";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";
import { Caption } from "../components/Caption";
import { MicroLabel } from "../components/MicroLabel";

// Full URL so LinkTab's `new URL(...)` parser produces proper color-coded
// protocol / domain / path / hash segments instead of falling back to raw.
// v2: og prefix carries recipient address so the callback is visible in the
// LinkTab URL rendering (creative-brief-v2 §4 non-negotiable "address callback").
const SHARE_URL = `https://voidpay.xyz/pay?og=VP-0001_250_USDC_arb_${DEMO_FROM_ADDRESS}#N4IgbghgTg9gRgFwAYEsA2UBOB7AjgKYCOAxgC4DmAhgBYAuADgE4Cu`;
const TELEGRAM_URL = `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent("Pay me in crypto — VoidPay invoice")}`;
const TWITTER_URL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent("Pay me in crypto — VoidPay invoice")}`;
const EMAIL_URL = `mailto:?subject=${encodeURIComponent("VoidPay invoice")}&body=${encodeURIComponent(SHARE_URL)}`;

// Frame at which the narrative "Copy" click fires (moved earlier — user sees copy before tab switch)
const COPY_CLICK_FRAME = 60;
// Frame at which narrative switches to QR tab
const QR_TAB_FROM_FRAME = 100;

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

      {/* Share modal shell — Card + shared Tabs (Link → QR driven by frame) */}
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

        <Tabs value={tabValue} onValueChange={() => {}} className="w-full">
          <TabsList className="bg-zinc-800 p-1 rounded-lg w-fit mb-4">
            <TabsTrigger
              value="link"
              className="px-4 py-1.5 rounded-md text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950 transition-colors"
            >
              Link
            </TabsTrigger>
            <TabsTrigger
              value="qr"
              className="px-4 py-1.5 rounded-md text-zinc-400 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-950 transition-colors"
            >
              QR Code
            </TabsTrigger>
          </TabsList>
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
        </Tabs>
      </Card>

      {/* v2 caption per creative-brief-v2 §4 — top-mounted to clear modal. */}
      <Caption text="No signup" position="top" startAt={0} endAt={90} />

      <MicroLabel text="The # fragment never leaves your browser" startAt={0} endAt={60} x="50%" y="84%" anchor="center" maxWidth={720} />
      <MicroLabel text="Same invoice — scannable format" startAt={150} endAt={210} x="50%" y="84%" anchor="center" />
    </AbsoluteFill>
  );
};
