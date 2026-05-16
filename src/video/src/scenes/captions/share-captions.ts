// S2 Share scene captions — round-10d spec
// 9:16 portrait: 4 captions; 16:9 landscape: 4 captions
// Position values are percentage of viewport height

import type { CaptionEntry } from "./create-captions";

export const SHARE_CAPTIONS_VERTICAL: CaptionEntry[] = [
  // Path C: positions in lower-third (y=73%) — modal occupies y=320-1300px (~17-68%); caption clears modal
  // Round-9o: sizes standardized — hero 86 (was 106), sub 60 (was 73)
  // Round-9p: one register down — hero 86→72, sub 60→50
  { text: "Invoice ready.",                 startAt: 0,   endAt: 70,  weight: 700, emphasizedWord: "Invoice",  position: 73, fontSize: 72 },
  { text: "The link is the invoice.",       startAt: 80,  endAt: 145, weight: 700, emphasizedWord: "link",     position: 73, fontSize: 72 },
  { text: "Hash never leaves the browser.", startAt: 155, endAt: 225, weight: 500, emphasizedWord: "Hash",     position: 73, fontSize: 50 },
  { text: "Share it anywhere.",             startAt: 235, endAt: 295, weight: 500, emphasizedWord: "anywhere", position: 73, fontSize: 50 },
];

export const SHARE_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Invoice ready. One link.",       startAt: 0,   endAt: 75,  weight: 700, emphasizedWord: "link",     position: 80, fontSize: 81 },
  { text: "The link is the invoice.",       startAt: 80,  endAt: 150, weight: 700, emphasizedWord: "link",     position: 80, fontSize: 81 },
  { text: "Hash never leaves the browser.", startAt: 155, endAt: 225, weight: 500, emphasizedWord: "Hash",     position: 80, fontSize: 59 },
  { text: "Share it anywhere.",             startAt: 230, endAt: 290, weight: 500, emphasizedWord: "anywhere", position: 80, fontSize: 59 },
];

// v2 variant: URL-as-container, perpetual/permissionless angle
export const SHARE_CAPTIONS_V2_VERTICAL: CaptionEntry[] = [
  { text: "One link. Self-contained.",              startAt: 0,   endAt: 70,  weight: 700, emphasizedWord: "link",    position: 73, fontSize: 72 },
  { text: "The hash never leaves the browser.",     startAt: 80,  endAt: 145, weight: 700, emphasizedWord: "hash",    position: 73, fontSize: 72 },
  { text: "No expiry. No permission.",              startAt: 155, endAt: 225, weight: 500, emphasizedWord: "expiry",  position: 73, fontSize: 50 },
  { text: "Send it anywhere.",                      startAt: 235, endAt: 295, weight: 500, emphasizedWord: "anywhere",position: 73, fontSize: 50 },
];

export const SHARE_CAPTIONS_V2_LANDSCAPE: CaptionEntry[] = [
  { text: "One link. Self-contained.",              startAt: 0,   endAt: 75,  weight: 700, emphasizedWord: "link",    position: 80, fontSize: 81 },
  { text: "The hash never leaves the browser.",     startAt: 80,  endAt: 150, weight: 700, emphasizedWord: "hash",    position: 80, fontSize: 81 },
  { text: "No expiry. No permission required.",     startAt: 155, endAt: 225, weight: 500, emphasizedWord: "expiry",  position: 80, fontSize: 59 },
  { text: "Send it anywhere.",                      startAt: 230, endAt: 290, weight: 500, emphasizedWord: "anywhere",position: 80, fontSize: 59 },
];
