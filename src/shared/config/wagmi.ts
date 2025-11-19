import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";

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
});
