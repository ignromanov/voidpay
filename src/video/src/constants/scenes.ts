/** Scene durations in frames (at 30fps) — round-9s §Composition */
export const SCENE_DURATIONS = {
  thesisHook:  90,    // 3.000s — unchanged
  create:      360,   // 12.000s — round-11 phase-4: +30fr (was 330) for invoice-only hold after press
  share:       280,   // 9.333s  — round 9s: -20fr (was 300) defect-5 cut
  pay:         605,   // 20.167s — round-11 phase-6: +30fr (was 575) for pack-into-URL animation tail
  thesisOutro:  75,   // 2.500s  — round 9s: -30fr (was 105) defect-5 cut
} as const;

/**
 * Round-13 R13-E: S3 pack ↔ S4 outro cross-fade overlap.
 * ThesisOutroScene is rendered as an overlay Sequence starting OUTRO_OVERLAP_FRAMES
 * before S3 ends, so its intro animations play during the pack-into-URL window.
 * The overlay Sequence durationInFrames = thesisOutro + OUTRO_OVERLAP_FRAMES = 105fr.
 *
 * Global frame math (no change to TOTAL_DURATION):
 *   S3 ends: 730 + 605 = 1335.
 *   Overlay start: 1335 - 30 = 1305  (= S3 local frame 575, pack begins).
 *   Overlay end:   1305 + 105 = 1410 (= composition end).
 *   Overlap window: global 1305–1335 (30fr) — outro fades in over dying paper.
 *   Outro-only:     global 1335–1380 (45fr).
 *   Outro tail:     global 1380–1410 (30fr).
 */
export const OUTRO_OVERLAP_FRAMES = 30;

/** Transition durations in frames (retained for reference; not used with Series) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1410 frames (47s @ 30fps).
 * Round-11 phase-4: S1 (create) extended 330 → 360fr for invoice-only hold (C3).
 * Round-11 phase-6: S3 (pay) extended 575 → 605fr for pack-into-URL animation tail (F2).
 * Round-13 R13-E: S4 (outro) extracted from Series into overlay Sequence (from=1305,
 *   durationInFrames=105). Series sum = 90+360+280+605 = 1335; overlay fills 1305–1410.
 *   TOTAL_DURATION unchanged at 1410.
 */
export const TOTAL_DURATION = 1410;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. Round-13 R13-E timeline (S4 overlay; S3 still in Series):
 *   S0 ends at 90.
 *   S1 starts at 90, ends at 450 (90+360).
 *   S2 starts at 450, ends at 730 (450+280).
 *   S3 starts at 730, ends at 1335 (730+605) — in Series.
 *   S4 overlay: from=1305, ends at 1410 (1305+105) — AbsoluteFill Sequence.
 *   S3 global start 730 + S3-local MAGIC_DUST_HIGHLIGHT 225 = global 955.
 *   Pack tail S3-local 575–605 unchanged — MAGIC_DUST_PEAK_FRAME is unchanged.
 */
export const MAGIC_DUST_PEAK_FRAME = 955;  // round-11 phase-4: 730+225=955 (unchanged in phase-6)
export const MAGIC_DUST_PEAK_HOLD = 120;   // 4s peak hold per creative-brief §8 strict

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
