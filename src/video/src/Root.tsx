import { Composition, Folder, continueRender, delayRender, registerRoot } from "remotion";
import { z } from "zod";
import { useCreatorStore } from "@/entities/creator";
import { useTrackedInvoiceStore } from "@/entities/invoice";
import { ensureFonts } from "./fonts";
import { VoidPayDemo } from "./VoidPayDemo";
import { PayScene } from "./scenes/PayScene";
import { TeaserComposition } from "./compositions/TeaserComposition";
import { SCENE_DURATIONS, TEASER_DURATION, TOTAL_DURATION } from "./constants/scenes";
import {
  DEMO_CONTENT_HASH,
  DEMO_PAID_AT_ISO,
  DEMO_CREATED_AT_ISO,
  DEMO_INVOICE_URL,
} from "./constants/demo-invoice";

// Wire root Tailwind + design tokens (CSS vars, @theme, animations)
import "@/app/globals.css";
import "./remotion-globals.css";

// Bracket font loading so Remotion holds the first frame until Geist is ready.
// Without delayRender, stills/renders may capture the system-font fallback on
// cold cache. Unhandled rejection is intentional — a fonts error should surface
// as a visible render timeout rather than silently ship with fallback fonts.
const fontsHandle = delayRender("Load video fonts");
ensureFonts().then(() => continueRender(fontsHandle));

// Seed the real @/entities/creator store so @/widgets/network-background
// and any other theme-aware widgets render Arbitrum colors for the demo.
// Module-level call runs before any composition renders — persist middleware
// in Remotion's headless Chromium has no prior localStorage to rehydrate from.
useCreatorStore.setState({ networkTheme: "arbitrum" });

// Seed the real @/entities/invoice store so the real `PaymentPanel` widget
// resolves a `paidAt` value for its paid-state `PaidConfirmation` subcomponent
// (PaymentPanel.tsx:56-58 reads `getInvoice(contentHash)?.paidAt`). Without
// this seed the paid state renders without a "paid at <time>" label.
useTrackedInvoiceStore.setState({
  invoices: [
    {
      contentHash: DEMO_CONTENT_HASH,
      invoiceId: "VP-0001",
      invoiceUrl: DEMO_INVOICE_URL,
      source: "received",
      createdAt: DEMO_CREATED_AT_ISO,
      paidAt: DEMO_PAID_AT_ISO,
    },
  ],
});

// v2 rescript collapsed the CTA text prop — outro copy is locked in
// ThesisOutroScene. Schema retained as an empty object so the Composition
// defaultProps contract still resolves.
export const DemoPropsSchema = z.object({});

const DEFAULT_PROPS: z.infer<typeof DemoPropsSchema> = {};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="VoidPayDemo">
        {/* Primary: 16:9 landscape, 45s @ 30fps per creative-brief-v2 §3. */}
        <Composition
          id="VoidPayDemo-16x9"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1920}
          height={1080}
          schema={DemoPropsSchema}
          defaultProps={DEFAULT_PROPS}
        />
      </Folder>

      <Folder name="VoidPayTeaser">
        {/* Self-contained 15s teaser per creative-brief-v2 §5 + §7. */}
        <Composition
          id="VoidPay-Teaser-15s"
          component={TeaserComposition}
          durationInFrames={TEASER_DURATION}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Thumbnails">
        {/* Scene 5 still — Magic Dust moment per creative-brief-v2 §3.
            Composition (not Still) so `useCurrentFrame()` inside PayScene can
            advance to the Magic Dust peak. Render poster with:
            pnpm exec remotion still Thumbnail-Scene5 public/video/poster-scene5.png --frame=240 */}
        <Composition
          id="Thumbnail-Scene5"
          component={PayScene}
          durationInFrames={SCENE_DURATIONS.pay}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};

registerRoot(RemotionRoot);
