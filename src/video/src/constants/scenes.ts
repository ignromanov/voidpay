/** Scene durations in frames (at 30fps) — round-9a §Composition */
export const SCENE_DURATIONS = {
  thesisHook:  90,    // 3.000s — unchanged
  create:      350,   // 11.667s — round 9a-patch2: +30 from patch1 (320) for C4 generating hold
  share:       300,   // 10.000s — round 9a-patch2: +40 from patch1 (260) for C5 extended copy hold
  pay:         575,   // 19.167s — unchanged (round 9a-patch2 single-press model is internal reshuffle)
  thesisOutro: 105,   // 3.500s  — round 9a-patch2: -70 from patch1 (175) per Ignat directive (vychit from final state)
} as const;

// Round 9a-patch2 math:
//   S0 ends 90, S1 starts 70 (overlap), ends 420 (70+350).
//   S2 starts 400, ends 700 (400+300).
//   S3 starts 680, ends 1255 (680+575).
//   S4 starts 1235, ends 1340 (1235+105).
//   Black tail 1340-1350 (10fr).
// Magic Dust peak in S3 single-press model: S3 start 680 + S3-local MAGIC_DUST_HIGHLIGHT 291 = global 971.

/** Transition durations in frames (cross-fade only for v2) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1350 frames (45s @ 30fps).
 * Sum of scenes = 90 + 350 + 300 + 575 + 105 = 1420 (round 9a-patch2).
 * Transition overlaps = 20 * 4 = 80.
 * Effective composition length = 1420 - 80 = 1340.
 * Black tail = 1350 - 1340 = 10 frames.
 */
export const TOTAL_DURATION = 1350;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. Round-9a-patch2 timeline:
 *   S0 ends at 90, S1 starts at 70 (overlap), S1 ends at 420 (70+350).
 *   S2 starts at 400, ends at 700 (400+300).
 *   S3 starts at 680, ends at 1255 (680+575).
 *   S4 starts at 1235, ends at 1340 (1235+105).
 *   S3 global start 680 + S3-local MAGIC_DUST_HIGHLIGHT 291 = global 971.
 */
export const MAGIC_DUST_PEAK_FRAME = 971;  // Iris 058 fix — was 940 (stale R9 drift); 680+291=971
export const MAGIC_DUST_PEAK_HOLD = 120;   // 4s peak hold per creative-brief §8 strict

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
