import type { CaptionEntry } from "./create-captions";

// R23: SUCCESS@300, FINALIZE@380, Works-emerald 500-575.
// 9:16 — 7 captions (dropped "Wallet to wallet." — gap absorbed). Unique overshoot -30fr to 190.
export const PAY_CAPTIONS_VERTICAL: CaptionEntry[] = [
  { text: "Payer opens the link.",           startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "link",         position: 16, fontSize: 50, variant: "violet" },
  { text: "No intermediary.",               startAt: 80,  endAt: 155, weight: 700, emphasizedWord: "intermediary", position: 75, fontSize: 72, variant: "violet" },
  { text: "Unique amount.\nUnique payment.", startAt: 190, endAt: 270, weight: 700, emphasizedWord: "Unique",       position: 75, fontSize: 72, variant: "violet", springConfig: "overshoot" },
  { text: "Exact on-chain match.",          startAt: 300, endAt: 380, weight: 500, emphasizedWord: "on-chain",     position: 75, fontSize: 50, variant: "violet" },
  { text: "Payment confirmed.",             startAt: 380, endAt: 440, weight: 700, emphasizedWord: "confirmed",    position: 75, fontSize: 72, variant: "emerald" },
  { text: "Not our servers.",               startAt: 440, endAt: 500, weight: 700, emphasizedWord: "servers",      position: 75, fontSize: 72, variant: "emerald" },
  { text: "Works even if we shut down.",    startAt: 500, endAt: 575, weight: 700, emphasizedWord: "shut down",    position: 75, fontSize: 72, variant: "emerald" },
];

// R23: SUCCESS@300, FINALIZE@380, Works-emerald 500-575.
// 16:9 — 7 captions (was 6, +Works). Unique overshoot -30fr to 190.
export const PAY_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Payer opens the link.\nNo wallet setup required.", startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "link",         position: 16, fontSize: 59, variant: "violet" },
  { text: "No intermediary. Wallet to wallet.",              startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "intermediary", position: 80, fontSize: 81, variant: "violet" },
  { text: "Unique amount.\nUnique payment.",                  startAt: 190, endAt: 270, weight: 700, emphasizedWord: "Unique",       position: 80, fontSize: 81, variant: "violet", springConfig: "overshoot" },
  { text: "Exact on-chain fingerprint.",                     startAt: 300, endAt: 380, weight: 500, emphasizedWord: "fingerprint",  position: 80, fontSize: 59, variant: "violet" },
  { text: "Payment confirmed.",                              startAt: 380, endAt: 440, weight: 700, emphasizedWord: "confirmed",    position: 80, fontSize: 81, variant: "emerald" },
  { text: "Not our servers.",                                startAt: 440, endAt: 500, weight: 700, emphasizedWord: "servers",      position: 80, fontSize: 81, variant: "emerald" },
  { text: "Works even if we shut down.",                     startAt: 500, endAt: 575, weight: 700, emphasizedWord: "shut down",    position: 80, fontSize: 81, variant: "emerald" },
];

// v2 variant: on-chain sovereignty angle
// R23: SUCCESS@300, FINALIZE@380, Works-emerald 500-575.
// 9:16 — 7 captions (dropped "Exact amount. Unique hash." — gap absorbed). Unique overshoot -30fr to 190.
export const PAY_CAPTIONS_V2_VERTICAL: CaptionEntry[] = [
  { text: "Payer opens the link.",           startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "link",        position: 16, fontSize: 50, variant: "violet" },
  { text: "Direct. Wallet to wallet.",       startAt: 80,  endAt: 155, weight: 700, emphasizedWord: "wallet",      position: 75, fontSize: 72, variant: "violet" },
  { text: "Unique amount.\nUnique payment.", startAt: 190, endAt: 270, weight: 700, emphasizedWord: "Unique",      position: 75, fontSize: 72, variant: "violet", springConfig: "overshoot" },
  { text: "Settled on-chain.",               startAt: 300, endAt: 380, weight: 500, emphasizedWord: "on-chain",   position: 75, fontSize: 50, variant: "violet" },
  { text: "Payment confirmed.",              startAt: 380, endAt: 440, weight: 700, emphasizedWord: "confirmed",  position: 75, fontSize: 72, variant: "emerald" },
  { text: "Not our servers.",                startAt: 440, endAt: 500, weight: 700, emphasizedWord: "servers",    position: 75, fontSize: 72, variant: "emerald" },
  { text: "Works even if we shut down.",     startAt: 500, endAt: 575, weight: 700, emphasizedWord: "shut down",  position: 75, fontSize: 72, variant: "emerald" },
];

// R23: SUCCESS@300, FINALIZE@380, Works-emerald 500-575.
// 16:9 — 7 captions (was 6, +Works). Unique overshoot -30fr to 190.
export const PAY_CAPTIONS_V2_LANDSCAPE: CaptionEntry[] = [
  { text: "Payer opens the link.",                         startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "link",        position: 16, fontSize: 59, variant: "violet" },
  { text: "Direct. Wallet to wallet.",                     startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "wallet",      position: 80, fontSize: 81, variant: "violet" },
  { text: "Unique amount.\nUnique payment.",                startAt: 190, endAt: 270, weight: 700, emphasizedWord: "Unique",      position: 80, fontSize: 81, variant: "violet", springConfig: "overshoot" },
  { text: "Settled on-chain.\nCryptographic receipt.",     startAt: 300, endAt: 380, weight: 500, emphasizedWord: "on-chain",    position: 80, fontSize: 59, variant: "violet" },
  { text: "Payment confirmed.",                            startAt: 380, endAt: 440, weight: 700, emphasizedWord: "confirmed",   position: 80, fontSize: 81, variant: "emerald" },
  { text: "Not our servers.",                              startAt: 440, endAt: 500, weight: 700, emphasizedWord: "servers",     position: 80, fontSize: 81, variant: "emerald" },
  { text: "Works even if we shut down.",                   startAt: 500, endAt: 575, weight: 700, emphasizedWord: "shut down",   position: 80, fontSize: 81, variant: "emerald" },
];
