/** Scene durations in frames (at 30fps) — creative-brief-v2 §3 */
export const SCENE_DURATIONS = {
  thesisHook: 90,       // 3s    — S0 two-beat hook doubled (round 3)
  create: 260,          // 8.67s — S1 round 8: was 170; +90 from thesisOutro buffer
                        //         to fund 2s pause-before-fill + slower scroll motion
  share: 240,           // 8s    — S2 LinkTab + QR
  pay: 510,             // 17s   — S3 PaymentPanel + InvoicePaper (4s Magic Dust peak)
  thesisOutro: 196,     // 6.53s — S4 round 8: was 286; -90 to S1
} as const;

/** Transition durations in frames (cross-fade only for v2) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1350 frames (45s @ 30fps).
 * Sum of scenes = 90 + 260 + 240 + 510 + 196 = 1296 (round 8).
 * Transition overlaps = 20 * 4 = 80.
 * Effective composition length = 1296 - 80 = 1216.
 * Trailing breathing buffer carried in S4 = 1350 - 1216 = 134 frames black hold.
 */
export const TOTAL_DURATION = 1350;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. Round-8 timeline:
 *   S0 ends at 90, S1 starts at 70 (overlap), S1 ends at 330 (70+260).
 *   S2 starts at 310, ends at 550 (310+240).
 *   S3 starts at 530, ends at 1040 (530+510).
 *   Peak begins 240 frames into S3 = global frame 530 + 240 = 770. Holds 120 frames.
 */
export const MAGIC_DUST_PEAK_FRAME = 770;  // round 8 — was 680; recomputed for new S1=260
export const MAGIC_DUST_PEAK_HOLD = 120; // 4s

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
