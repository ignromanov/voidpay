import type { SpringConfig } from "remotion";

export const FPS = 30;

/** Named spring configs from spec easing table */
export const SPRING_CONFIGS = {
  /** Reveals, modals, cards — smooth, no bounce */
  smooth: { damping: 200 } satisfies Partial<SpringConfig>,
  /** MetaMask popup, dropdowns — snappy, minimal bounce */
  snappy: { damping: 20, stiffness: 200 } satisfies Partial<SpringConfig>,
  /** Success checkmark, logo reveal — playful bounce */
  bouncy: { damping: 8 } satisfies Partial<SpringConfig>,
  /** Problem scene errors — slow, heavy impact */
  heavy: { damping: 15, stiffness: 80, mass: 2 } satisfies Partial<SpringConfig>,
} as const;

/** Typewriter speed: frames per character */
export const TYPEWRITER_CHAR_FRAMES = 2;

/** Standard enter/exit duration in frames */
export const ENTER_DURATION = 15;
export const EXIT_DURATION = 10;
