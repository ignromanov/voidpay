/** Scene durations in frames (at 30fps) — creative-brief-v2 §3 */
export const SCENE_DURATIONS = {
  thesisHook: 90,       // 3s    — S0 two-beat hook doubled (round 3)
  create: 170,          // 5.67s — S1 round 5: was 306; freed 136fr to thesisOutro buffer
  share: 240,           // 8s    — S2 LinkTab
  pay: 510,             // 17s   — S3 PaymentPanel + InvoicePaper (includes 4s Magic Dust peak)
  thesisOutro: 286,     // 9.53s — S4 round 5: was 150; +136 buffer pending S2/S3/S4 redistribution after p8
} as const;

/** Transition durations in frames (cross-fade only for v2) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1350 frames (45s @ 30fps).
 * Sum of scenes = 90 + 170 + 240 + 510 + 286 = 1296 (round 5).
 * Transition overlaps = 20 * 4 = 80.
 * Effective composition length = 1296 - 80 = 1216.
 * Trailing breathing buffer carried in S4 = 1350 - 1216 = 134 frames black hold.
 */
export const TOTAL_DURATION = 1350;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. S0 ends at 90, S1 starts at 70 (overlap), S1 ends at 240 (70+170).
 * S2 starts at 220, ends at 460 (220+240). S3 starts at 440.
 * Peak begins 240 frames into S3 = global frame 440 + 240 = 680. Holds 120 frames.
 * Verify visually in Task 14 before locking.
 */
export const MAGIC_DUST_PEAK_FRAME = 680;  // round 5 — was 876; recomputed for new S1=170
export const MAGIC_DUST_PEAK_HOLD = 120; // 4s

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
