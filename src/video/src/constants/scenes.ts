/** Scene durations in frames (at 30fps) — creative-brief-v2 §3 */
export const SCENE_DURATIONS = {
  thesisHook: 45,     // 1.5s — S0 two-beat hook (was 21)
  create: 306,        // 10.2s — S1 InvoiceFormView + InvoicePaper (was 330; compensates S0 +24)
  share: 240,         // 8s   — S2 LinkTab
  pay: 510,           // 17s  — S3 PaymentPanel + InvoicePaper (includes 4s Magic Dust peak)
  thesisOutro: 150,   // 5s   — S4 outro card
} as const;

/** Transition durations in frames (cross-fade only for v2) */
export const TRANSITION_DURATIONS = {
  crossFade: 20,
} as const;

/**
 * Primary composition duration = 1350 frames (45s @ 30fps).
 * Sum of scenes = 45 + 306 + 240 + 510 + 150 = 1251.
 * Transition overlaps = 20 * 4 = 80.
 * TransitionSeries overlaps scenes by transition duration, so effective
 * composition length = scene sum - transition sum = 1251 - 80 = 1171.
 * Trailing breathing buffer = 179 frames carried on the last scene.
 *
 * creative-brief-v2 §3 locks 1350; we add trailing buffer inside S4
 * (thesis outro holds black + card for full 150 frames, then fade
 * to absolute black for remaining 179 frames).
 */
export const TOTAL_DURATION = 1350;

/** Teaser (15s self-contained) per creative-brief-v2 §7. */
export const TEASER_DURATION = 450;

/**
 * Magic Dust peak — global frame where S3 Pay scene shows the highlighted
 * micro-amount. S0 (45) + S1 (306) + S2 (240) = 591 start of S3. Peak
 * begins 240 frames into S3 = global frame 831. Holds 120 frames.
 * Verify visually in Task 14 before locking.
 */
export const MAGIC_DUST_PEAK_FRAME = 831;
export const MAGIC_DUST_PEAK_HOLD = 120; // 4s

/** FPS — canonical source (also re-exported from timing.ts) */
export const FPS = 30;
