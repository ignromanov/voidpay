/** Scene durations in frames (at 30fps) */
export const SCENE_DURATIONS = {
  problem: 240,          // 8s
  solution: 120,         // 4s
  create: 540,           // 18s
  share: 300,            // 10s
  pay: 450,              // 15s
  features: 300,         // 10s
  privacy: 300,          // 10s
  cta: 150,              // 5s
} as const;

/** Transition durations in frames */
export const TRANSITION_DURATIONS = {
  fade15: 15,
  slideRight20: 20,
  slideBottom20: 20,
  wipe20: 20,
} as const;

/** Cut points for export (frame ranges) */
export const CUTS = {
  twitter: { start: 0, end: 360 },   // 12s — Scenes 1-2
  landing: { start: 0, end: 1200 },  // 40s — Scenes 1-4
  grants: { start: 0, end: 2400 },   // 80s — Full
} as const;

/**
 * Total duration accounting for transition overlaps.
 * Sum of scenes = 2400, sum of transitions = 120, effective = 2400 - 120 = 2280
 * We use 2400 as the composition duration (TransitionSeries handles overlap).
 */
export const TOTAL_DURATION = 2400;

/** Scene order with transition types (for TransitionSeries wiring) */
export const SCENE_TRANSITIONS = [
  { scene: "problem",  transition: "fade",         transitionDuration: 15 },
  { scene: "solution", transition: "slide-right",  transitionDuration: 20 },
  { scene: "create",   transition: "fade",         transitionDuration: 15 },
  { scene: "share",    transition: "slide-bottom", transitionDuration: 20 },
  { scene: "pay",      transition: "fade",         transitionDuration: 15 },
  { scene: "features", transition: "wipe",         transitionDuration: 20 },
  { scene: "privacy",  transition: "fade",         transitionDuration: 15 },
  { scene: "cta",      transition: null,           transitionDuration: 0 },
] as const;
