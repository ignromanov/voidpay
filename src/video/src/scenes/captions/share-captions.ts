// S2 Share scene captions — round-9l spec
// 9:16 portrait: 4 captions; 16:9 landscape: 4 captions
// Position values are percentage of viewport height

import type { CaptionEntry } from "./create-captions";

export const SHARE_CAPTIONS_VERTICAL: CaptionEntry[] = [
  { text: "Invoice ready.",                 startAt: 0,   endAt: 70,  weight: 700, emphasizedWord: "ready",    position: 45, fontSize: 106 },
  { text: "The link is the invoice.",       startAt: 80,  endAt: 145, weight: 700, emphasizedWord: "link",     position: 45, fontSize: 106 },
  { text: "Hash never leaves the browser.", startAt: 155, endAt: 225, weight: 500, emphasizedWord: "browser",  position: 44, fontSize: 73 },
  { text: "Share it anywhere.",             startAt: 235, endAt: 295, weight: 500, emphasizedWord: "anywhere", position: 44, fontSize: 73 },
];

export const SHARE_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Invoice ready. One link.",       startAt: 0,   endAt: 75,  weight: 700, emphasizedWord: "link",     position: 80, fontSize: 81 },
  { text: "The link is the invoice.",       startAt: 80,  endAt: 150, weight: 700, emphasizedWord: "link",     position: 80, fontSize: 81 },
  { text: "Hash never leaves the browser.", startAt: 155, endAt: 225, weight: 500, emphasizedWord: "browser",  position: 80, fontSize: 59 },
  { text: "Share it anywhere.",             startAt: 230, endAt: 290, weight: 500, emphasizedWord: "anywhere", position: 80, fontSize: 59 },
];
