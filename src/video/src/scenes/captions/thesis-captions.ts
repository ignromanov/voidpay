// S0 ThesisHook + S4 ThesisOutro captions — round-10d spec
// Hook: 3 variants × 2 aspects; Outro: variant-aware

import type { CaptionEntry } from "./create-captions";

export type HookVariant = "v1" | "v2" | "v3";

const HOOK_TEXTS: Record<HookVariant, { vertical: string; landscape: string; emphasized: string }> = {
  v1: {
    vertical:   "Sending wallet addresses\nin Telegram?",
    landscape:  "Still sending wallet addresses\nin Telegram?",
    emphasized: "wallet",
  },
  v2: {
    vertical:   "Your invoice.\nNo server has ever seen it.",
    landscape:  "Your invoice lives in the URL.\nNo server has ever seen it.",
    emphasized: "server",
  },
  v3: {
    vertical:   "Works even if we shut down.",
    landscape:  "The only invoice tool\nthat works even if we shut down.",
    emphasized: "shut down",
  },
};

// v3 landscape uses "invoice" per Spark Task 2 table
const HOOK_EMPHASIZED_OVERRIDES: Partial<Record<HookVariant, { landscape?: string }>> = {
  v3: { landscape: "invoice" },
};

export const getHookCaption = (variant: HookVariant, isVertical: boolean): CaptionEntry => {
  const h = HOOK_TEXTS[variant];
  const override = HOOK_EMPHASIZED_OVERRIDES[variant];
  const emphasized = !isVertical && override?.landscape ? override.landscape : h.emphasized;
  return {
    text:           isVertical ? h.vertical : h.landscape,
    startAt:        5,
    endAt:          85,
    weight:         700,
    emphasizedWord: emphasized,
    position:       isVertical ? 45 : 80,
    fontSize:       isVertical ? 72 : 64,
    variant:        "violet",
  };
};

// S4 closing caption — variant-aware, aspect-aware timing/size.
// v1/v3: returns null — "Works even if we shut down." moved to pay scene (R23 pay-captions Works-emerald 500-575).
export const getOutroCaption = (isVertical: boolean, hookVariant: HookVariant = "v1"): CaptionEntry | null => {
  if (hookVariant === "v2") {
    return {
      text:           isVertical
        ? "The invoice lives in the URL."
        : "The invoice is the URL.\nNothing else needed.",
      startAt:        5,
      endAt:          isVertical ? 70 : 75,
      weight:         700,
      emphasizedWord: "URL",
      position:       isVertical ? 50 : 80,
      fontSize:       isVertical ? 86 : 81,
      variant:        "violet",
    };
  }
  return null;
};
