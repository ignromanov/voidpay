import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useAspect } from "../hooks/useAspect";
import { SPRING_CONFIGS } from "../constants/timing";
import {
  SHARE_CAPTIONS_VERTICAL,
  SHARE_CAPTIONS_LANDSCAPE,
  SHARE_CAPTIONS_V2_VERTICAL,
  SHARE_CAPTIONS_V2_LANDSCAPE,
} from "./captions/share-captions";
import {
  TAB_CROSSFADE_DURATION,
  TAB_SWAP_FRAME,
  COPY_FRAME,
} from "./share/constants";
import { ShareSceneLandscape } from "./share/ShareSceneLandscape";
import { ShareScenePortrait } from "./share/ShareScenePortrait";
import type { HookVariant } from "./captions/thesis-captions";

type Props = {
  hookVariant?: HookVariant;
};

export const ShareScene: React.FC<Props> = ({ hookVariant = "v1" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isLandscape = width > height;
  const { isVertical } = useAspect();
  const captions = hookVariant === "v2"
    ? (isVertical ? SHARE_CAPTIONS_V2_VERTICAL : SHARE_CAPTIONS_V2_LANDSCAPE)
    : (isVertical ? SHARE_CAPTIONS_VERTICAL : SHARE_CAPTIONS_LANDSCAPE);

  // Modal slide-up
  const modalTranslateY = interpolate(
    spring({ frame, fps, config: SPRING_CONFIGS.smooth }),
    [0, 1],
    [200, 0],
  );
  const modalOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Round 9m stagger: copy fires at COPY_FRAME (100), tab swap at TAB_SWAP_FRAME (230).
  // R22-C: showQR switches at midpoint of crossfade (TAB_SWAP_FRAME + TAB_CROSSFADE_DURATION/2)
  // so the position:relative→absolute layout change happens when both tabs are at 50% opacity,
  // avoiding a hard jump on the first frame of the swap.
  const showQR = frame >= TAB_SWAP_FRAME + Math.floor(TAB_CROSSFADE_DURATION / 2);
  const copied = frame >= COPY_FRAME;

  // R22-C: tab body + tab indicator both use same crossfade window (TAB_CROSSFADE_DURATION=10fr).
  const linkTabOpacity = interpolate(
    frame,
    [TAB_SWAP_FRAME, TAB_SWAP_FRAME + TAB_CROSSFADE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const qrTabOpacity = interpolate(
    frame,
    [TAB_SWAP_FRAME, TAB_SWAP_FRAME + TAB_CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // tabProgress: 0 = Link active, 1 = QR active — drives indicator crossfade independently.
  const tabProgress = interpolate(
    frame,
    [TAB_SWAP_FRAME, TAB_SWAP_FRAME + TAB_CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Portrait-only: backdrop dim + blur (landscape keeps paper always sharp, D37)
  const dimOpacity = interpolate(frame, [0, 15, TAB_SWAP_FRAME], [0.35, 0.35, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blurPx = interpolate(frame, [0, 15, TAB_SWAP_FRAME], [1.5, 1.5, 2.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (isLandscape) {
    return (
      <ShareSceneLandscape
        frame={frame}
        modalTranslateY={modalTranslateY}
        modalOpacity={modalOpacity}
        showQR={showQR}
        copied={copied}
        linkTabOpacity={linkTabOpacity}
        qrTabOpacity={qrTabOpacity}
        tabProgress={tabProgress}
        captions={captions}
      />
    );
  }

  return (
    <ShareScenePortrait
      frame={frame}
      width={width}
      modalTranslateY={modalTranslateY}
      modalOpacity={modalOpacity}
      showQR={showQR}
      copied={copied}
      linkTabOpacity={linkTabOpacity}
      qrTabOpacity={qrTabOpacity}
      tabProgress={tabProgress}
      dimOpacity={dimOpacity}
      blurPx={blurPx}
      captions={captions}
    />
  );
};
