import { FONT_MONO } from "../fonts";

/**
 * WalletPill — Mocks v2 .wallet-pill spec (import point #7).
 *
 * Renders a wallet address pill anchored top-right below the browser chrome.
 * Two visual states driven by `connected` prop:
 *   disconnected: dark zinc bg, neutral text, grey dot, "0x0…0000"
 *   connected:    violet-tinted bg, ddd6fe text, emerald dot, "0x42a3…7e91"
 *
 * Mock sizing (360px base → 1080px × 3):
 *   top: 38px → 114px (below chrome); right: 12px → 36px
 *   padding: 4px 8px → 12px 24px; font-size: 9px → 27px; dot: 5px → 15px
 */

type WalletPillProps = {
  connected: boolean;
  /** Opacity for frame-driven fade. Default 1. */
  opacity?: number;
};

export const WalletPill: React.FC<WalletPillProps> = ({ connected, opacity = 1 }) => {
  const dotSize = 15;   // 5px × 3

  const bg = connected
    ? "rgba(76,29,149,0.3)"          // violet-900/30 — connected
    : "rgba(20,20,27,0.85)";         // zinc-950/85 — disconnected

  const border = connected
    ? "1px solid rgba(167,139,250,0.5)"  // violet-400/50
    : "1px solid rgba(63,63,70,0.5)";    // zinc-700/50

  const textColor = connected ? "#ddd6fe" : "#a1a1aa";
  const dotColor = connected ? "#34d399" : "#52525b";  // emerald vs zinc
  const label = connected ? "0x42a3…7e91" : "0x0…0000";

  return (
    <div
      style={{
        position: "absolute",
        top: 114,       // 38px × 3 — below browser chrome
        right: 36,      // 12px × 3
        display: "flex",
        alignItems: "center",
        gap: 12,        // 4px × 3
        padding: "12px 24px",  // 4px 8px × 3
        background: bg,
        border,
        borderRadius: "999px",
        fontFamily: `${FONT_MONO}, monospace`,
        fontWeight: 600,
        fontSize: 27,   // 9px × 3
        color: textColor,
        zIndex: 20,
        opacity,
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
};
