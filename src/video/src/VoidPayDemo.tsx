import { AbsoluteFill, interpolate, Sequence, Series, useCurrentFrame } from "remotion";

import { SCENE_DURATIONS } from "./constants/scenes";
import { PRESS_END } from "./scenes/create/constants";
import { ThesisHookScene } from "./scenes/ThesisHookScene";
import { CreateScene } from "./scenes/CreateScene";
import { ShareScene } from "./scenes/ShareScene";
import { PayScene } from "./scenes/PayScene";
import { ThesisOutroScene } from "./scenes/ThesisOutroScene";
import { BrowserChrome } from "./components/BrowserChrome";

import type { z } from "zod";
import type { DemoPropsSchema } from "./Root";
import type { HookVariant } from "./scenes/captions/thesis-captions";

export type DemoProps = z.infer<typeof DemoPropsSchema> & {
  hookVariant?: HookVariant;
};

/**
 * Global frame at which BrowserChrome becomes visible.
 * S1 (CreateScene) starts at thesisHook duration (90).
 * PRESS_END is the local frame within S1 when the Generate button is released.
 * Chrome appears at that moment and persists through S2, S3, and S4.
 */
const S1_GLOBAL_START = SCENE_DURATIONS.thesisHook; // 90
const CHROME_VISIBLE_FROM = S1_GLOBAL_START + PRESS_END; // 90 + 340 = 430 (R12-1)

/** Fade-in + slide-down entry over 10 frames (~333ms at 30fps). */
const ChromeRoot: React.FC = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - CHROME_VISIBLE_FROM;
  const entryProgress = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = (1 - entryProgress) * -40;
  const opacity = entryProgress;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <BrowserChrome />
    </div>
  );
};

/**
 * 5-scene arc per creative-brief-v2 §3.
 * S0 ThesisHook -> S1 Create -> S2 Share -> S3 Pay -> S4 ThesisOutro.
 * Round 9s: clean cuts via Series (no cross-fade — defect-5).
 * Round 11 D1: BrowserChrome lifted to composition root — single persistent
 * instance visible from CHROME_VISIBLE_FROM (CreateScene generate-press release)
 * through end of composition. Z-index 50: above scene content, below captions (100).
 */
export const VoidPayDemo: React.FC<DemoProps> = ({ hookVariant = "v1" }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.thesisHook}>
          <ThesisHookScene hookVariant={hookVariant} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.create}>
          <CreateScene hookVariant={hookVariant} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.share}>
          <ShareScene hookVariant={hookVariant} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.pay}>
          <PayScene hookVariant={hookVariant} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.thesisOutro}>
          <ThesisOutroScene hookVariant={hookVariant} />
        </Series.Sequence>
      </Series>

      {/* Root-level BrowserChrome — persistent address bar from generate-press through end */}
      <Sequence from={CHROME_VISIBLE_FROM}>
        <AbsoluteFill style={{ zIndex: 50, pointerEvents: "none" }}>
          <ChromeRoot />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
