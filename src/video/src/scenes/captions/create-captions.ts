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
  { text: "Raw addresses look unprofessional.", startAt: 0,   endAt: 70,  weight: 500, emphasizedWord: "unprofessional", position: 44, fontSize: 73 },
  { text: "Fill a form.",                       startAt: 80,  endAt: 150, weight: 700, emphasizedWord: "form",           position: 45, fontSize: 106 },
  { text: "Get a link.",                        startAt: 160, endAt: 230, weight: 700, emphasizedWord: "link",           position: 45, fontSize: 106 },
  { text: "No account. No KYC.",                startAt: 310, endAt: 370, weight: 700, emphasizedWord: "KYC",            position: 45, fontSize: 106 },
];

export const CREATE_CAPTIONS_LANDSCAPE: CaptionEntry[] = [
  { text: "Raw wallet addresses look unprofessional.", startAt: 0,   endAt: 80,  weight: 500, emphasizedWord: "unprofessional", position: 80, fontSize: 59 },
  { text: "Fill a form. Get a link.",                  startAt: 85,  endAt: 165, weight: 700, emphasizedWord: "link",           position: 80, fontSize: 81 },
  { text: "No account. No KYC. No signup.",            startAt: 170, endAt: 240, weight: 700, emphasizedWord: "KYC",            position: 80, fontSize: 81 },
  { text: "Permissionless by design.",                 startAt: 250, endAt: 325, weight: 500, emphasizedWord: "Permissionless", position: 80, fontSize: 59 },
];
