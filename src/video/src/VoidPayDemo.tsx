import { AbsoluteFill, interpolate, Sequence, Series, useCurrentFrame } from "remotion";

import { SCENE_DURATIONS, OUTRO_OVERLAP_FRAMES } from "./constants/scenes";
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

/**
 * Round-13 R13-E: S4 outro overlay start.
 * S3 ends at global 1335 (90+360+280+605). Outro overlay starts 30fr earlier
 * so its fade-in plays during the pack-into-URL window (S3-local 575–605).
 * S3_GLOBAL_END = 90+360+280+605 = 1335. Overlay from = 1335 - 30 = 1305.
 */
const S3_GLOBAL_END =
  SCENE_DURATIONS.thesisHook +
  SCENE_DURATIONS.create +
  SCENE_DURATIONS.share +
  SCENE_DURATIONS.pay; // 1335
const S4_OUTRO_OVERLAY_START = S3_GLOBAL_END - OUTRO_OVERLAP_FRAMES; // 1305
const S4_OUTRO_OVERLAY_DURATION = SCENE_DURATIONS.thesisOutro + OUTRO_OVERLAP_FRAMES; // 105

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
 * Round 13 R13-E: S4 ThesisOutro extracted from Series into overlay Sequence
 * starting at global 1305 (S3 end - 30fr). Its opacity fade-in plays during the
 * pack-into-URL window, creating a continuous cross-fade instead of a hard cut.
 * Z-order: outro AbsoluteFill renders above dying paper (Series is earlier in JSX).
 */
export const VoidPayDemo: React.FC<DemoProps> = ({ hookVariant = "v1" }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* S0–S3 in Series (clean cuts). S4 extracted — see overlay Sequence below. */}
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
      </Series>

      {/* S4 outro overlay — starts 30fr before S3 ends (global 1305) so its
          fade-in and hero entrance animate during the pack-into-URL window.
          Duration = thesisOutro (75) + overlap (30) = 105fr → ends at 1410. */}
      <Sequence from={S4_OUTRO_OVERLAY_START} durationInFrames={S4_OUTRO_OVERLAY_DURATION}>
        <ThesisOutroScene hookVariant={hookVariant} />
      </Sequence>

      {/* Root-level BrowserChrome — persistent address bar from generate-press through end */}
      <Sequence from={CHROME_VISIBLE_FROM}>
        <AbsoluteFill style={{ zIndex: 50, pointerEvents: "none" }}>
          <ChromeRoot />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
