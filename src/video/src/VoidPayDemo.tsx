import { AbsoluteFill, Series } from "remotion";

import { SCENE_DURATIONS } from "./constants/scenes";
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
 * Round 9s: clean cuts via Series (no cross-fade — defect-5).
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
    </AbsoluteFill>
  );
};
