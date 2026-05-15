import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

import { SCENE_DURATIONS, TRANSITION_DURATIONS } from "./constants/scenes";
import { ThesisHookScene } from "./scenes/ThesisHookScene";
import { CreateScene } from "./scenes/CreateScene";
import { ShareScene } from "./scenes/ShareScene";
import { PayScene } from "./scenes/PayScene";
import { ThesisOutroScene } from "./scenes/ThesisOutroScene";

import type { z } from "zod";
import type { DemoPropsSchema } from "./Root";
import type { HookVariant } from "./scenes/captions/thesis-captions";

export type DemoProps = z.infer<typeof DemoPropsSchema> & {
  hookVariant?: HookVariant;
};

/**
 * 5-scene arc per creative-brief-v2 §3.
 * S0 ThesisHook -> S1 Create -> S2 Share -> S3 Pay -> S4 ThesisOutro.
 * Cross-fade 20fr between all scenes (TRANSITION_DURATIONS.crossFade).
 */
export const VoidPayDemo: React.FC<DemoProps> = ({ hookVariant = "v1" }) => {
  const fadeTiming = linearTiming({
    durationInFrames: TRANSITION_DURATIONS.crossFade,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.thesisHook}>
          <ThesisHookScene hookVariant={hookVariant} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.create}>
          <CreateScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.share}>
          <ShareScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.pay}>
          <PayScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.thesisOutro}>
          <ThesisOutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
