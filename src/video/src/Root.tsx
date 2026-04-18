import { Composition, Folder, registerRoot } from "remotion";
import { z } from "zod";
import { ensureFonts } from "./fonts";
import { VoidPayDemo } from "./VoidPayDemo";
import { PayScene } from "./scenes/PayScene";
import { TOTAL_DURATION } from "./constants/scenes";

ensureFonts();

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
        {/* Primary: 16:9 landscape — first-render scope per creative-brief §3 */}
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

        {/* Square: 1:1 for Instagram/LinkedIn — batch 2 */}
        <Composition
          id="VoidPayDemo-1x1"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1080}
          height={1080}
          schema={DemoPropsSchema}
          defaultProps={DEFAULT_PROPS}
        />

        {/* Vertical: 9:16 for TikTok/Reels — batch 2 */}
        <Composition
          id="VoidPayDemo-9x16"
          component={VoidPayDemo}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1080}
          height={1920}
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
      </Folder>
    </>
  );
};

registerRoot(RemotionRoot);
