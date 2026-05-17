import type { CaptionEntry } from "./create-captions";

// 9:16: 7 captions. Magic Dust hero @ S-local 220-340 (global 900-1020), springConfig overshoot, position center 50%.
// Emerald boundary: starts at S-local 425. Violet for all prior.
export const PAY_CAPTIONS_VERTICAL: CaptionEntry[] = [
  // Round-9o: all S3 captions moved to lower-third (y=75%) — were 44-50% which overlapped payment panel
  // Sizes standardized: hero 86 (was 106), sub 60 (was 73)
  // Round-9p: one register down — hero 86→72, sub 60→50
  { text: "Payer opens the link.",           startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "link",          position: 75, fontSize: 50, variant: "violet" },
  { text: "No intermediary.",               startAt: 80,  endAt: 155, weight: 700, emphasizedWord: "intermediary",  position: 75, fontSize: 72, variant: "violet" },
  { text: "Wallet to wallet.",              startAt: 165, endAt: 215, weight: 700, emphasizedWord: "wallet",        position: 75, fontSize: 72, variant: "violet" },
  { text: "Unique amount.\nUnique payment.", startAt: 220, endAt: 340, weight: 700, emphasizedWord: "Unique",        position: 75, fontSize: 72, variant: "violet", springConfig: "overshoot" },
  { text: "Exact on-chain match.",          startAt: 350, endAt: 420, weight: 500, emphasizedWord: "on-chain",      position: 75, fontSize: 50, variant: "violet" },
  { text: "Not our servers.",               startAt: 425, endAt: 490, weight: 700, emphasizedWord: "servers",       position: 75, fontSize: 72, variant: "emerald" },
  { text: "Payment confirmed.",             startAt: 495, endAt: 555, weight: 700, emphasizedWord: "confirmed",     position: 75, fontSize: 72, variant: "emerald" },
];

// 16:9: 6 captions. Hero @ same S-local 220-340 (overshoot, center).
export const PAY_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Payer opens the link.\nNo wallet setup required.", startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "link",         position: 80, fontSize: 59, variant: "violet" },
  { text: "No intermediary. Wallet to wallet.",              startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "intermediary", position: 80, fontSize: 81, variant: "violet" },
  { text: "Unique amount.\nUnique payment.",                  startAt: 220, endAt: 340, weight: 700, emphasizedWord: "Unique",       position: 80, fontSize: 81, variant: "violet", springConfig: "overshoot" },
  { text: "Exact on-chain fingerprint.",                     startAt: 345, endAt: 420, weight: 500, emphasizedWord: "fingerprint",  position: 80, fontSize: 59, variant: "violet" },
  { text: "Not our servers.",                                startAt: 425, endAt: 490, weight: 700, emphasizedWord: "servers",      position: 80, fontSize: 81, variant: "emerald" },
  { text: "Payment confirmed.",                              startAt: 495, endAt: 555, weight: 700, emphasizedWord: "confirmed",    position: 80, fontSize: 81, variant: "emerald" },
];

// v2 variant: on-chain sovereignty angle
export const PAY_CAPTIONS_V2_VERTICAL: CaptionEntry[] = [
  { text: "Payer opens the link.",           startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "link",         position: 75, fontSize: 50, variant: "violet" },
  { text: "Direct. Wallet to wallet.",       startAt: 80,  endAt: 155, weight: 700, emphasizedWord: "wallet",       position: 75, fontSize: 72, variant: "violet" },
  { text: "Exact amount. Unique hash.",      startAt: 165, endAt: 215, weight: 700, emphasizedWord: "hash",         position: 75, fontSize: 72, variant: "violet" },
  { text: "Unique amount.\nUnique payment.", startAt: 220, endAt: 340, weight: 700, emphasizedWord: "Unique",        position: 75, fontSize: 72, variant: "violet", springConfig: "overshoot" },
  { text: "Settled on-chain.",               startAt: 350, endAt: 420, weight: 500, emphasizedWord: "on-chain",     position: 75, fontSize: 50, variant: "violet" },
  { text: "Not our servers.",                startAt: 425, endAt: 490, weight: 700, emphasizedWord: "servers",      position: 75, fontSize: 72, variant: "emerald" },
  { text: "Payment confirmed.",              startAt: 495, endAt: 555, weight: 700, emphasizedWord: "confirmed",    position: 75, fontSize: 72, variant: "emerald" },
];

export const PAY_CAPTIONS_V2_LANDSCAPE: CaptionEntry[] = [
  { text: "Payer opens the link.",                         startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "link",         position: 80, fontSize: 59, variant: "violet" },
  { text: "Direct. Wallet to wallet.",                     startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "wallet",       position: 80, fontSize: 81, variant: "violet" },
  { text: "Unique amount.\nUnique payment.",                startAt: 220, endAt: 340, weight: 700, emphasizedWord: "Unique",       position: 80, fontSize: 81, variant: "violet", springConfig: "overshoot" },
  { text: "Settled on-chain.\nCryptographic receipt.",     startAt: 345, endAt: 420, weight: 500, emphasizedWord: "on-chain",     position: 80, fontSize: 59, variant: "violet" },
  { text: "Not our servers.",                              startAt: 425, endAt: 490, weight: 700, emphasizedWord: "servers",      position: 80, fontSize: 81, variant: "emerald" },
  { text: "Payment confirmed.",                            startAt: 495, endAt: 555, weight: 700, emphasizedWord: "confirmed",    position: 80, fontSize: 81, variant: "emerald" },
];
