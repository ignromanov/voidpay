// S1 Create scene captions — round-9q spec
// 9:16 portrait: 4 captions; 16:9 landscape: 4 captions
// Narrative arc: Create form → No signup → No KYC → Get a link (bridges to S2)
// "Raw addresses look unprofessional." moved to S0 ThesisHookScene (second caption, frames 50-85)
// Position values are percentage of viewport height

export type CaptionEntry = {
  text: string;
  startAt: number;       // S-local frame
  endAt: number;
  weight: 700 | 500;
  emphasizedWord?: string;
  position: number;      // % of height (0-100)
  fontSize: number;      // px
  variant?: "violet" | "emerald";
  springConfig?: "smooth" | "overshoot";
};

export const CREATE_CAPTIONS_VERTICAL: CaptionEntry[] = [
  { text: "Create an invoice.",  startAt: 0,   endAt: 70,  weight: 700, emphasizedWord: "invoice", position: 45, fontSize: 72 },
  { text: "No signup.",          startAt: 80,  endAt: 150, weight: 700, emphasizedWord: "signup",  position: 45, fontSize: 72 },
  { text: "No account. No KYC.", startAt: 160, endAt: 230, weight: 700, emphasizedWord: "KYC",     position: 45, fontSize: 72 },
  { text: "Get a link.",         startAt: 240, endAt: 360, weight: 700, emphasizedWord: "link",    position: 10, fontSize: 72 },
];

export const CREATE_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Create an invoice.",                startAt: 0,   endAt: 80,  weight: 700, emphasizedWord: "invoice",        position: 80, fontSize: 81 },
  { text: "No signup. No account.",            startAt: 90,  endAt: 165, weight: 700, emphasizedWord: "signup",         position: 80, fontSize: 81 },
  { text: "No KYC. Permissionless by design.", startAt: 175, endAt: 245, weight: 700, emphasizedWord: "Permissionless", position: 80, fontSize: 81 },
  { text: "Get a link.",                       startAt: 255, endAt: 360, weight: 700, emphasizedWord: "link",           position: 10, fontSize: 81 },
];

// v2 variant: zero-backend sovereignty angle
export const CREATE_CAPTIONS_V2_VERTICAL: CaptionEntry[] = [
  { text: "Fill the form.\nIt stays in your browser.", startAt: 0,   endAt: 70,  weight: 700, emphasizedWord: "browser", position: 45, fontSize: 72 },
  { text: "No account. No server.",                   startAt: 80,  endAt: 150, weight: 700, emphasizedWord: "server",  position: 45, fontSize: 72 },
  { text: "Just a link.",                             startAt: 160, endAt: 230, weight: 700, emphasizedWord: "link",    position: 45, fontSize: 72 },
  { text: "The link is the invoice.",                 startAt: 240, endAt: 360, weight: 700, emphasizedWord: "invoice", position: 45, fontSize: 72 },
];

export const CREATE_CAPTIONS_V2_LANDSCAPE: CaptionEntry[] = [
  { text: "Fill the form.\nEverything stays in your browser.", startAt: 0,   endAt: 80,  weight: 700, emphasizedWord: "browser", position: 80, fontSize: 81 },
  { text: "No account. No server. No KYC.",                   startAt: 90,  endAt: 165, weight: 700, emphasizedWord: "server",  position: 80, fontSize: 81 },
  { text: "Just a link.",                                     startAt: 175, endAt: 245, weight: 700, emphasizedWord: "link",    position: 80, fontSize: 81 },
  { text: "The link is the invoice.",                         startAt: 255, endAt: 360, weight: 700, emphasizedWord: "invoice", position: 80, fontSize: 81 },
];
