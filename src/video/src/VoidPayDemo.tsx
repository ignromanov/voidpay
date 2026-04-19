import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { SCENE_DURATIONS } from "./constants/scenes";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionRevealScene } from "./scenes/SolutionRevealScene";
import { CreateScene } from "./scenes/CreateScene";
import { ShareScene } from "./scenes/ShareScene";
import { PayScene } from "./scenes/PayScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { PrivacyScene } from "./scenes/PrivacyScene";
import { CTAScene } from "./scenes/CTAScene";

import type { z } from "zod";
import type { DemoPropsSchema } from "./Root";

export type DemoProps = z.infer<typeof DemoPropsSchema>;

export const VoidPayDemo: React.FC<DemoProps> = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: The Problem — "Raw addresses. Wrong networks. Wrong decimals." */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.problem}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        {/* Transition: fade 15fr */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 2: The Solution — "Invoice in a URL." | Logo held ≥30fr at Twitter cut boundary */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.solution}>
          <SolutionRevealScene />
        </TransitionSeries.Sequence>

        {/* Transition: slide from right 20fr */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 3: Create Invoice — "Three fields. One link. Invoice ready." */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.create}>
          <CreateScene />
        </TransitionSeries.Sequence>

        {/* Transition: fade 15fr */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 4: Share the Link — "Share anywhere. Your data never touches our servers." */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.share}>
          <ShareScene />
        </TransitionSeries.Sequence>

        {/* Transition: slide from bottom 20fr */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5: Pay the Invoice — "Connect. Confirm. Paid." + Magic Dust */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.pay}>
          <PayScene />
        </TransitionSeries.Sequence>

        {/* Transition: fade 15fr */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 6: Features — Cryptographic Receipts / Perpetual Links / PDF Export */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.features}>
          <FeaturesScene />
        </TransitionSeries.Sequence>

        {/* Transition: wipe 20fr */}
        <TransitionSeries.Transition
          presentation={wipe()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 7: Privacy Architecture — "The URL IS the invoice." + "No backend. No signup. No accounts." */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.privacy}>
          <PrivacyScene />
        </TransitionSeries.Sequence>

        {/* Transition: fade 15fr. Historically this slot used
            slide({direction:"from-bottom"}) as a workaround for a CTA
            whitescreen bug (Remotion 4.0.448 + Tailwind v4). Phase 1d
            rewrote CTAScene on real @/shared/ui components, which appears
            to have resolved the underlying issue — 6-frame verify of
            fade() stills (2130-2279) all render 239-344KB full content.
            Reverted to fade() per audit-v1 §2.1 decision. */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 8: CTA — "Create your first invoice in 30 seconds." + "No KYC. No subscription. Forever." */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cta}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
