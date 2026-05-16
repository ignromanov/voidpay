/** Scene durations in frames (at 30fps) — round-9s §Composition */
export const SCENE_DURATIONS = {
  thesisHook:  90,    // 3.000s — unchanged
  create:      360,   // 12.000s — round-11 phase-4: +30fr (was 330) for invoice-only hold after press
  share:       280,   // 9.333s  — round 9s: -20fr (was 300) defect-5 cut
  pay:         605,   // 20.167s — round-11 phase-6: +30fr (was 575) for pack-into-URL animation tail
  thesisOutro:  75,   // 2.500s  — round 9s: -30fr (was 105) defect-5 cut
} as const;

// Round-11 phase-6 math (no transition overlaps — Series clean cuts):
//   S0 ends 90.
//   S1 starts 90, ends 450 (90+360).
//   S2 starts 450, ends 730 (450+280).
//   S3 starts 730, ends 1335 (730+605).
//   S4 starts 1335, ends 1410 (1335+75).
//   Total = 90+360+280+605+75 = 1410. No black tail needed.
// Magic Dust peak in S3: S3 start 730 + S3-local MAGIC_DUST_HIGHLIGHT 225 = global 955.
// Pack-into-URL tail: S3-local 575–605 (last 30fr of S3), does NOT shift magic dust window.

/** Transition durations in frames (retained for reference; not used with Series) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1410 frames (47s @ 30fps).
 * Round-11 phase-4: S1 (create) extended 330 → 360fr for invoice-only hold (C3).
 * Round-11 phase-6: S3 (pay) extended 575 → 605fr for pack-into-URL animation tail (F2).
 * Sum of scenes = 90 + 360 + 280 + 605 + 75 = 1410. Exact fit, no tail.
 */
export const TOTAL_DURATION = 1410;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. Round-11 phase-6 timeline (Series, no overlap):
 *   S0 ends at 90.
 *   S1 starts at 90, ends at 450 (90+360).
 *   S2 starts at 450, ends at 730 (450+280).
 *   S3 starts at 730, ends at 1335 (730+605).
 *   S4 starts at 1335, ends at 1410 (1335+75).
 *   S3 global start 730 + S3-local MAGIC_DUST_HIGHLIGHT 225 = global 955.
 *   Pack tail (+30fr) lands at scene end — MAGIC_DUST_PEAK_FRAME is unchanged.
 */
export const MAGIC_DUST_PEAK_FRAME = 955;  // round-11 phase-4: 730+225=955 (unchanged in phase-6)
export const MAGIC_DUST_PEAK_HOLD = 120;   // 4s peak hold per creative-brief §8 strict

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
