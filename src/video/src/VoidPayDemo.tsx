import { AbsoluteFill, interpolate, Sequence, Series, useCurrentFrame } from "remotion";

import { SCENE_DURATIONS, OUTRO_OVERLAP_FRAMES } from "./constants/scenes";
import { PRESS_START } from "./scenes/create/constants";
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
 * PRESS_START is the local frame within S1 when the Generate button is pressed.
 * Chrome fades in synchronously with invoice fade-in (PRESS_START), not press-end.
 * Chrome appears at that moment and hides when the outro overlay begins (frame 1305).
 */
const S1_GLOBAL_START = SCENE_DURATIONS.thesisHook; // 90
const CHROME_VISIBLE_FROM = S1_GLOBAL_START + PRESS_START; // 90 + 300 = 390 (R15)

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
/** Chrome is visible from generate-press through outro start — hides as outro fades in. */
const CHROME_VISIBLE_DURATION = S4_OUTRO_OVERLAY_START - CHROME_VISIBLE_FROM; // 1305 - 390 = 915

/** Fade-in + slide-down entry over 10 frames (~333ms at 30fps). */
const ChromeRoot: React.FC = () => {
  // useCurrentFrame() is already local to the wrapping Sequence (from=CHROME_VISIBLE_FROM).
  // Subtracting CHROME_VISIBLE_FROM again would produce -390 at Sequence start → chrome invisible.
  const frame = useCurrentFrame();
  const entryProgress = interpolate(frame, [0, 10], [0, 1], {
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
        pointerEvents: "none",
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
 * Round 13 R13-E: S4 ThesisOutro extracted from Series into overlay Sequence
 * starting at global 1305 (S3 end - 30fr). Its opacity fade-in plays during the
 * pack-into-URL window, creating a continuous cross-fade instead of a hard cut.
 * Z-order: outro AbsoluteFill renders above dying paper (Series is earlier in JSX).
 * R16: BrowserChrome relocated INTO scenes group as first child (single scenes-layer
 * in outline). Visibility window bounded to outro start — chrome disappears as outro
 * fades in (frame 1305). Two top-level groups under root: scenes AbsoluteFill + outro.
 */
export const VoidPayDemo: React.FC<DemoProps> = ({ hookVariant = "v1" }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Scenes group — chrome + Series unified in one layer (R16). */}
      <AbsoluteFill>
        {/* Persistent address bar: frame 390 → 1305. zIndex 50 on ChromeRoot's outer
            div ensures chrome renders above scenes despite being first in JSX order. */}
        <Sequence from={CHROME_VISIBLE_FROM} durationInFrames={CHROME_VISIBLE_DURATION}>
          <ChromeRoot />
        </Sequence>

        {/* S0–S3 in Series (clean cuts). S4 extracted — see outro Sequence below. */}
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
      </AbsoluteFill>

      {/* S4 outro overlay — starts 30fr before S3 ends (global 1305) so its
          fade-in and hero entrance animate during the pack-into-URL window.
          Duration = thesisOutro (75) + overlap (30) = 105fr → ends at 1410. */}
      <Sequence from={S4_OUTRO_OVERLAY_START} durationInFrames={S4_OUTRO_OVERLAY_DURATION}>
        <ThesisOutroScene hookVariant={hookVariant} />
      </Sequence>
    </AbsoluteFill>
  );
};
