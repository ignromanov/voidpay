import { Composition, Folder, continueRender, delayRender, registerRoot } from "remotion";
import { z } from "zod";
import { useCreatorStore } from "@/entities/creator";
import { ensureFonts } from "./fonts";
import { VoidPayDemo } from "./VoidPayDemo";
import { PayScene } from "./scenes/PayScene";
import { CTAScene } from "./scenes/CTAScene";
import { TOTAL_DURATION } from "./constants/scenes";

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

export const DemoPropsSchema = z.object({
  ctaText: z.string().default("Create your first invoice in 30 seconds."),
});

const DEFAULT_PROPS: z.infer<typeof DemoPropsSchema> = {
  ctaText: "Create your first invoice in 30 seconds.",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="VoidPayDemo">
        {/* Primary: 16:9 landscape — first-render scope per creative-brief §3.
            1:1 and 9:16 variants require adaptive scene layouts (Heading/Text
            scales, InvoicePaper sizing, PillarIcons positioning) — deferred to
            AI#58.6 per audit-v1 §2.3 Option D. Re-introduce with adaptive
            scenes, not just a differently-sized Composition wrapper. */}
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

      {/* Thumbnail: Scene 5 still — Magic Dust moment per creative-brief §3.
          Composition (not Still) so `useCurrentFrame()` inside PayScene can advance
          to the Magic Dust highlight frame (≥220). Render with:
          npx remotion still Thumbnail-Scene5 out/poster-scene5.png --frame=260 */}
      <Folder name="Thumbnails">
        <Composition
          id="Thumbnail-Scene5"
          component={PayScene}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Debug-CTA"
          component={CTAScene}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};

registerRoot(RemotionRoot);
