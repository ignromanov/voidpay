import { useVideoConfig } from "remotion";
import { PaySceneLandscape } from "./pay/PaySceneLandscape";
import { PayScenePortrait } from "./pay/PayScenePortrait";

export const PayScene: React.FC = () => {
  const { width, height } = useVideoConfig();
  const isLandscape = width > height;

  return isLandscape ? <PaySceneLandscape /> : <PayScenePortrait />;
};
