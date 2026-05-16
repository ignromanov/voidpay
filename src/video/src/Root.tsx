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

// Round 9l: schema carries hookVariant for A/B-testable S0 hook copy.
// Outro copy stays locked in ThesisOutroScene.
export const DemoPropsSchema = z.object({
  hookVariant: z.enum(["v1", "v2", "v3"]).optional(),
});

const DEFAULT_PROPS: z.infer<typeof DemoPropsSchema> = { hookVariant: "v1" };

// AC2: silent video — no <Audio> components in this composition tree.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="VoidPayDemo">
        {/* Round 9l: 3 hook variants × 2 aspect ratios = 6 named compositions.
            Old IDs (VoidPayDemo-9x16, VoidPayDemo-16x9) kept as v1 aliases for
            backward-compat with existing build scripts and render commands. */}

        {/* 9:16 portrait variants */}
        <Composition
          id="VoidPayDemo-9x16-v1"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1080}
          height={1920}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v1" as const }}
        />
        <Composition
          id="VoidPayDemo-9x16-v2"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1080}
          height={1920}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v2" as const }}
        />
        <Composition
          id="VoidPayDemo-9x16-v3"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1080}
          height={1920}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v3" as const }}
        />

        {/* 16:9 landscape variants */}
        <Composition
          id="VoidPayDemo-16x9-v1"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1920}
          height={1080}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v1" as const }}
        />
        <Composition
          id="VoidPayDemo-16x9-v2"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1920}
          height={1080}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v2" as const }}
        />
        <Composition
          id="VoidPayDemo-16x9-v3"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1920}
          height={1080}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v3" as const }}
        />

        {/* Backward-compat aliases — point to v1 default hook variant */}
        <Composition
          id="VoidPayDemo-9x16"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1080}
          height={1920}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v1" as const }}
        />
        <Composition
          id="VoidPayDemo-16x9"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1920}
          height={1080}
          schema={DemoPropsSchema}
          defaultProps={{ ...DEFAULT_PROPS, hookVariant: "v1" as const }}
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
