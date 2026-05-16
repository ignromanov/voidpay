/** Scene durations in frames (at 30fps) — round-9s §Composition */
export const SCENE_DURATIONS = {
  thesisHook:  90,    // 3.000s — unchanged
  create:      330,   // 11.000s — round 9s: -20fr (was 350) defect-5 cut to remove cross-fade budget
  share:       280,   // 9.333s  — round 9s: -20fr (was 300) defect-5 cut
  pay:         575,   // 19.167s — unchanged
  thesisOutro:  75,   // 2.500s  — round 9s: -30fr (was 105) defect-5 cut
} as const;

// Round 9s math (no transition overlaps — Series clean cuts):
//   S0 ends 90.
//   S1 starts 90, ends 420 (90+330).
//   S2 starts 420, ends 700 (420+280).
//   S3 starts 700, ends 1275 (700+575).
//   S4 starts 1275, ends 1350 (1275+75).
//   Total = 90+330+280+575+75 = 1350. No black tail needed.
// Magic Dust peak in S3: S3 start 700 + S3-local MAGIC_DUST_HIGHLIGHT 225 = global 925.

/** Transition durations in frames (retained for reference; not used with Series) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1350 frames (45s @ 30fps).
 * Round 9s: TransitionSeries replaced with Series (defect-5 — clean cuts, no cross-fade).
 * Sum of scenes = 90 + 330 + 280 + 575 + 75 = 1350. Exact fit, no tail.
 */
export const TOTAL_DURATION = 1350;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. Round-9s timeline (Series, no overlap):
 *   S0 ends at 90.
 *   S1 starts at 90, ends at 420 (90+330).
 *   S2 starts at 420, ends at 700 (420+280).
 *   S3 starts at 700, ends at 1275 (700+575).
 *   S4 starts at 1275, ends at 1350 (1275+75).
 *   S3 global start 700 + S3-local MAGIC_DUST_HIGHLIGHT 225 = global 925.
 */
export const MAGIC_DUST_PEAK_FRAME = 925;  // round 9s: 700+225=925
export const MAGIC_DUST_PEAK_HOLD = 120;   // 4s peak hold per creative-brief §8 strict

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
