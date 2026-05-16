import { useVideoConfig } from "remotion";
import { PaySceneLandscape } from "./pay/PaySceneLandscape";
import { PayScenePortrait } from "./pay/PayScenePortrait";
import type { HookVariant } from "./captions/thesis-captions";

type Props = {
  hookVariant?: HookVariant;
};

export const PayScene: React.FC<Props> = ({ hookVariant = "v1" }) => {
  const { width, height } = useVideoConfig();
  const isLandscape = width > height;

  return isLandscape
    ? <PaySceneLandscape hookVariant={hookVariant} />
    : <PayScenePortrait hookVariant={hookVariant} />;
};
