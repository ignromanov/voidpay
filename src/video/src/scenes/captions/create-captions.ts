// S1 Create scene captions — round-9l spec
// 9:16 portrait: 4 captions; 16:9 landscape: 4 captions
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
  // Round-9o: sizes standardized — hero 86 (was 106), sub 60 (was 73). Positions kept (S1 captions overlay form during fill — pill backdrop + zIndex handle contrast)
  // Round-9p: one register down — hero 86→72, sub 60→50
  { text: "Raw addresses look unprofessional.", startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "unprofessional", position: 45, fontSize: 50 },
  { text: "Fill a form.",                       startAt: 80,  endAt: 150, weight: 700, emphasizedWord: "form",           position: 45, fontSize: 72 },
  { text: "Get a link.",                        startAt: 160, endAt: 230, weight: 700, emphasizedWord: "link",           position: 45, fontSize: 72 },
  { text: "No account. No KYC.",                startAt: 310, endAt: 370, weight: 700, emphasizedWord: "KYC",            position: 45, fontSize: 72 },
];

export const CREATE_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Raw wallet addresses look unprofessional.", startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "unprofessional", position: 80, fontSize: 59 },
  { text: "Fill a form. Get a link.",                  startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "link",           position: 80, fontSize: 81 },
  { text: "No account. No KYC. No signup.",            startAt: 170, endAt: 240, weight: 700, emphasizedWord: "KYC",            position: 80, fontSize: 81 },
  { text: "Permissionless by design.",                 startAt: 250, endAt: 325, weight: 500, emphasizedWord: "Permissionless", position: 80, fontSize: 59 },
];
