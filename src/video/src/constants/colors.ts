/** Brand palette — matches design-system.md exactly */
export const COLORS = {
  /** Backgrounds */
  bg: "#09090b",               // zinc-950 — desk
  paper: "#ffffff",            // invoice paper

  /** Brand */
  violet: "#7C3AED",          // Electric Violet — primary
  violetGlow: "rgba(124, 58, 237, 0.6)",
  aurora1: "#8b5cf6",          // violet-500
  aurora2: "#6366f1",          // indigo-500
  aurora3: "#a855f7",          // purple-500

  /** Network — Arbitrum (primary demo network) */
  arbitrum: "#12AAFF",
  arbitrumSecondary: "#28A0F0",

  /** Status */
  success: "#10b981",          // emerald-500
  error: "#ef4444",            // red-500
  confirming: "#3b82f6",       // blue-500

  /** Text */
  textPrimary: "#f4f4f5",     // zinc-100
  textSecondary: "#a1a1aa",   // zinc-400
  textMuted: "#71717a",       // zinc-500
  textCaption: "#d4d4d8",     // zinc-300

  /** Surface */
  zinc800: "#27272a",
  zinc900: "#18181b",
} as const;
