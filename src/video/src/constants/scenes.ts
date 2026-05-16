/** Scene durations in frames (at 30fps) — round-9s §Composition */
export const SCENE_DURATIONS = {
  thesisHook:  90,    // 3.000s — unchanged
  create:      360,   // 12.000s — round-11 phase-4: +30fr (was 330) for invoice-only hold after press
  share:       280,   // 9.333s  — round 9s: -20fr (was 300) defect-5 cut
  pay:         575,   // 19.167s — unchanged
  thesisOutro:  75,   // 2.500s  — round 9s: -30fr (was 105) defect-5 cut
} as const;

// Round-11 phase-4 math (no transition overlaps — Series clean cuts):
//   S0 ends 90.
//   S1 starts 90, ends 450 (90+360).
//   S2 starts 450, ends 730 (450+280).
//   S3 starts 730, ends 1305 (730+575).
//   S4 starts 1305, ends 1380 (1305+75).
//   Total = 90+360+280+575+75 = 1380. No black tail needed.
// Magic Dust peak in S3: S3 start 730 + S3-local MAGIC_DUST_HIGHLIGHT 225 = global 955.

/** Transition durations in frames (retained for reference; not used with Series) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1380 frames (46s @ 30fps).
 * Round-11 phase-4: S1 (create) extended 330 → 360fr for invoice-only hold (C3).
 * Sum of scenes = 90 + 360 + 280 + 575 + 75 = 1380. Exact fit, no tail.
 */
export const TOTAL_DURATION = 1380;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. Round-11 phase-4 timeline (Series, no overlap):
 *   S0 ends at 90.
 *   S1 starts at 90, ends at 450 (90+360).
 *   S2 starts at 450, ends at 730 (450+280).
 *   S3 starts at 730, ends at 1305 (730+575).
 *   S4 starts at 1305, ends at 1380 (1305+75).
 *   S3 global start 730 + S3-local MAGIC_DUST_HIGHLIGHT 225 = global 955.
 */
export const MAGIC_DUST_PEAK_FRAME = 955;  // round-11 phase-4: 730+225=955
export const MAGIC_DUST_PEAK_HOLD = 120;   // 4s peak hold per creative-brief §8 strict

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
