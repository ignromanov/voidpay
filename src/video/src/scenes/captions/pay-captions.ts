import type { CaptionEntry } from "./create-captions";

// 9:16: 8 captions. Magic Dust hero @ S-local 220-300 (overshoot), position center 50%.
// R20-E/P6: Emerald boundary shifted to FINALIZE=460. "Works even if we shutdown" added 530-574.
export const PAY_CAPTIONS_VERTICAL: CaptionEntry[] = [
  // Round-9o: all S3 captions moved to lower-third (y=75%) — were 44-50% which overlapped payment panel
  // Sizes standardized: hero 86 (was 106), sub 60 (was 73)
  // Round-9p: one register down — hero 86→72, sub 60→50
  { text: "Payer opens the link.",           startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "link",          position: 16, fontSize: 50, variant: "violet" },
  { text: "No intermediary.",               startAt: 80,  endAt: 155, weight: 700, emphasizedWord: "intermediary",  position: 75, fontSize: 72, variant: "violet" },
  { text: "Wallet to wallet.",              startAt: 165, endAt: 215, weight: 700, emphasizedWord: "wallet",        position: 75, fontSize: 72, variant: "violet" },
  { text: "Unique amount.\nUnique payment.", startAt: 220, endAt: 300, weight: 700, emphasizedWord: "Unique",        position: 75, fontSize: 72, variant: "violet", springConfig: "overshoot" },
  { text: "Exact on-chain match.",          startAt: 300, endAt: 460, weight: 500, emphasizedWord: "on-chain",      position: 75, fontSize: 50, variant: "violet" },
  { text: "Payment confirmed.",             startAt: 460, endAt: 485, weight: 700, emphasizedWord: "confirmed",     position: 75, fontSize: 72, variant: "emerald" },
  { text: "Not our servers.",               startAt: 485, endAt: 570, weight: 700, emphasizedWord: "servers",       position: 75, fontSize: 72, variant: "emerald" },
];

// 16:9: 8 captions. Hero @ same S-local 220-300 (overshoot, center).
// R20-E/P6: Emerald boundary shifted to FINALIZE=460. "Works even if we shutdown" added 530-574.
export const PAY_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Payer opens the link.\nNo wallet setup required.", startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "link",         position: 16, fontSize: 59, variant: "violet" },
  { text: "No intermediary. Wallet to wallet.",              startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "intermediary", position: 80, fontSize: 81, variant: "violet" },
  { text: "Unique amount.\nUnique payment.",                  startAt: 220, endAt: 300, weight: 700, emphasizedWord: "Unique",       position: 80, fontSize: 81, variant: "violet", springConfig: "overshoot" },
  { text: "Exact on-chain fingerprint.",                     startAt: 300, endAt: 460, weight: 500, emphasizedWord: "fingerprint",  position: 80, fontSize: 59, variant: "violet" },
  { text: "Payment confirmed.",                              startAt: 460, endAt: 485, weight: 700, emphasizedWord: "confirmed",    position: 80, fontSize: 81, variant: "emerald" },
  { text: "Not our servers.",                                startAt: 485, endAt: 570, weight: 700, emphasizedWord: "servers",      position: 80, fontSize: 81, variant: "emerald" },
];

// v2 variant: on-chain sovereignty angle
// R20-E/P6: Same timeline as V1 — emerald boundary FINALIZE=460, "Works even if we shutdown" added 530-574.
export const PAY_CAPTIONS_V2_VERTICAL: CaptionEntry[] = [
  { text: "Payer opens the link.",           startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "link",         position: 16, fontSize: 50, variant: "violet" },
  { text: "Direct. Wallet to wallet.",       startAt: 80,  endAt: 155, weight: 700, emphasizedWord: "wallet",       position: 75, fontSize: 72, variant: "violet" },
  { text: "Exact amount. Unique hash.",      startAt: 165, endAt: 215, weight: 700, emphasizedWord: "hash",         position: 75, fontSize: 72, variant: "violet" },
  { text: "Unique amount.\nUnique payment.", startAt: 220, endAt: 300, weight: 700, emphasizedWord: "Unique",        position: 75, fontSize: 72, variant: "violet", springConfig: "overshoot" },
  { text: "Settled on-chain.",               startAt: 300, endAt: 460, weight: 500, emphasizedWord: "on-chain",     position: 75, fontSize: 50, variant: "violet" },
  { text: "Payment confirmed.",              startAt: 460, endAt: 485, weight: 700, emphasizedWord: "confirmed",    position: 75, fontSize: 72, variant: "emerald" },
  { text: "Not our servers.",                startAt: 485, endAt: 570, weight: 700, emphasizedWord: "servers",      position: 75, fontSize: 72, variant: "emerald" },
];

export const PAY_CAPTIONS_V2_LANDSCAPE: CaptionEntry[] = [
  { text: "Payer opens the link.",                         startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "link",         position: 16, fontSize: 59, variant: "violet" },
  { text: "Direct. Wallet to wallet.",                     startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "wallet",       position: 80, fontSize: 81, variant: "violet" },
  { text: "Unique amount.\nUnique payment.",                startAt: 220, endAt: 300, weight: 700, emphasizedWord: "Unique",       position: 80, fontSize: 81, variant: "violet", springConfig: "overshoot" },
  { text: "Settled on-chain.\nCryptographic receipt.",     startAt: 300, endAt: 460, weight: 500, emphasizedWord: "on-chain",     position: 80, fontSize: 59, variant: "violet" },
  { text: "Payment confirmed.",                            startAt: 460, endAt: 485, weight: 700, emphasizedWord: "confirmed",    position: 80, fontSize: 81, variant: "emerald" },
  { text: "Not our servers.",                              startAt: 485, endAt: 570, weight: 700, emphasizedWord: "servers",      position: 80, fontSize: 81, variant: "emerald" },
];
