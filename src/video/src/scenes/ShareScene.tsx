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
  const showQR = frame >= TAB_SWAP_FRAME;
  const copied = frame >= COPY_FRAME;

  // F4.4: 1fr cross-fade opacity drivers for tab body transition at TAB_SWAP_FRAME.
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
      dimOpacity={dimOpacity}
      blurPx={blurPx}
      captions={captions}
    />
  );
};
