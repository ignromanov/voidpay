// S0 ThesisHook + S4 ThesisOutro captions — round-9l spec
// Hook: 3 variants × 2 aspects; Outro: single fixed caption

import type { CaptionEntry } from "./create-captions";

export type HookVariant = "v1" | "v2" | "v3";

const HOOK_TEXTS: Record<HookVariant, { vertical: string; landscape: string; emphasized: string }> = {
  v1: {
    vertical:   "Sending wallet addresses in Telegram?",
    landscape:  "Still sending wallet addresses in Telegram?",
    emphasized: "Telegram?",
  },
  v2: {
    vertical:   "Crypto invoices. No backend. No signup.",
    landscape:  "Crypto invoices with no backend, no signup, no KYC.",
    emphasized: "signup",
  },
  v3: {
    vertical:   "Works even if we shut down.",
    landscape:  "The only invoice tool that works even if we shut down.",
    emphasized: "shut down",
  },
};

export const getHookCaption = (variant: HookVariant, isVertical: boolean): CaptionEntry => {
  const h = HOOK_TEXTS[variant];
  return {
    text:          isVertical ? h.vertical : h.landscape,
    startAt:       5,
    endAt:         85,
    weight:        700,
    emphasizedWord: h.emphasized,
    position:      isVertical ? 45 : 50,
    fontSize:      isVertical ? 72 : 81,
    variant:       "violet",
  };
};

// S4 closing caption — single fixed text, aspect-aware timing/size
export const getOutroCaption = (isVertical: boolean): CaptionEntry => ({
  text:          "Works even if we shut down.",
  startAt:       5,
  endAt:         isVertical ? 70 : 75,
  weight:        700,
  emphasizedWord: "shut down",
  position:      50,
  fontSize:      isVertical ? 86 : 81,
  variant:       "violet",
});
