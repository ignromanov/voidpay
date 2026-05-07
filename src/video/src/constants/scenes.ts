/** Scene durations in frames (at 30fps) — round-9a §Composition */
export const SCENE_DURATIONS = {
  thesisHook:  90,    // 3.000s — unchanged
  create:      320,   // 10.667s — round 9a: +60 from round 8 (260)
                       //                   2× field cascade + InvoicePaper post-fill + button-after-paper
  share:       260,   // 8.667s — round 9a: +20 from round 8 (240)
                       //                  longer Link-tab read + 110fr QR window
  pay:         575,   // 19.167s — round 9a: +65 from round 8 (510)
                       //                   connecting/switching sub-states + 80fr ready phase
  thesisOutro: 175,   // 5.833s — round 9a: -21 from round 8 (196) to fund S3 within TOTAL_DURATION=1350
} as const;

/** Transition durations in frames (cross-fade only for v2) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1350 frames (45s @ 30fps).
 * Sum of scenes = 90 + 320 + 260 + 575 + 175 = 1420 (round 9a).
 * Transition overlaps = 20 * 4 = 80.
 * Effective composition length = 1420 - 80 = 1340.
 * Black tail = 1350 - 1340 = 10 frames.
 */
export const TOTAL_DURATION = 1350;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. Round-9a timeline:
 *   S0 ends at 90, S1 starts at 70 (overlap), S1 ends at 390 (70+320).
 *   S2 starts at 370, ends at 630 (370+260).
 *   S3 starts at 610, ends at 1185 (610+575).
 *   S4 starts at 1165, ends at 1340 (1165+175).
 *   Peak begins 190fr into S3 = global 800; midpoint ~250 = global 860; ends 310 = global 920.
 */
export const MAGIC_DUST_PEAK_FRAME = 860;  // round 9a — was 770
export const MAGIC_DUST_PEAK_HOLD = 120;   // 4s peak hold per creative-brief §8 strict

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
