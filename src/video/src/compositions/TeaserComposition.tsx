import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

import { ThesisHookScene } from "../scenes/ThesisHookScene";
import { PayScene } from "../scenes/PayScene";
import { ThesisOutroScene } from "../scenes/ThesisOutroScene";
import { TRANSITION_DURATIONS } from "../constants/scenes";

/**
 * Self-contained 15s teaser per creative-brief-v2 §5 + §7.
 * Not a Sequence-slice of the primary — built to loop on Twitter
 * with hook stitching to outro naturally.
 *
 * Total: 450 frames @ 30fps.
 * - 0..21:   S0 thesis hook (reuse)
 * - fade 20
 * - 41..251: Pay scene offset window — Sequence from={-180} shifts the
 *            inner PayScene clock so its Magic Dust peak (local 240–360)
 *            arrives ~60 frames into the teaser segment.
 * - fade 20
 * - 271..450: ThesisOutroScene held
 */
export const TeaserComposition: React.FC = () => {
  const fadeTiming = linearTiming({
    durationInFrames: TRANSITION_DURATIONS.crossFade,
  });

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={21}>
          <ThesisHookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={210}>
          <Sequence from={-180}>
            <PayScene />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={179}>
          <ThesisOutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
