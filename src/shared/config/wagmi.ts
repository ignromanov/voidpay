import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";
import { createStorage, noopStorage } from "wagmi";

// SSR-safe storage that only uses localStorage in the browser
const storage = createStorage({
  storage:
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage
      : noopStorage,
});

export const config = getDefaultConfig({
  appName: "VoidPay",
  projectId: "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
  ],
  ssr: true,
  storage,
});
