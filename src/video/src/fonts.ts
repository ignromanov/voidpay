import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

let fontsLoaded = false;

export const FONT_SANS = "Geist Sans";
export const FONT_MONO = "Geist Mono";

export async function ensureFonts(): Promise<void> {
  if (fontsLoaded) return;

  await Promise.all([
    loadFont({
      family: FONT_SANS,
      url: staticFile("fonts/Geist-Regular.woff2"),
      weight: "400",
    }),
    loadFont({
      family: FONT_SANS,
      url: staticFile("fonts/Geist-Bold.woff2"),
      weight: "700",
    }),
    loadFont({
      family: FONT_SANS,
      url: staticFile("fonts/Geist-Black.woff2"),
      weight: "900",
    }),
    loadFont({
      family: FONT_MONO,
      url: staticFile("fonts/GeistMono-Regular.woff2"),
      weight: "400",
    }),
  ]);

  fontsLoaded = true;
}
