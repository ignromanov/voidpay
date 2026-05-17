import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT_MONO } from "../fonts";
import { CHROME_HEIGHT_LANDSCAPE, CHROME_HEIGHT_PORTRAIT } from "../scenes/pay/constants";

/**
 * WalletPill — Mocks v2 .wallet-pill spec (import point #7).
 *
 * Renders a wallet address pill anchored top-right below the browser chrome.
 * Two visual states driven by `connected` prop:
 *   disconnected: dark zinc bg, neutral text, grey dot, "0x0…0000"
 *   connected:    violet-tinted bg, ddd6fe text, emerald pulsing dot, "0x42a3…7e91"
 *
 * B2 sizing (round-10b):
 *   Portrait  (9:16): base × 1.5
 *   Landscape (16:9): base × 1.2
 *
 * B3: connected dot pulses via sin-wave (period 30fr = 1s) — scale + opacity.
 *     Static grey dot when disconnected.
 *
 * Base mock sizing (360px base → 1080px × 3):
 *   top: 38px → 114px (below chrome); right: 12px → 36px
 *   padding: 4px 8px → 12px 24px; font-size: 9px → 27px; dot: 5px → 15px
 */

type WalletPillProps = {
  connected: boolean;
  /** Opacity for frame-driven fade. Default 1. */
  opacity?: number;
};

export const WalletPill: React.FC<WalletPillProps> = ({ connected, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPortrait = width < height;

  const scale = isPortrait ? 1.5 : 1.2;

  // Base values (×3 from 360px mock)
  const dotSizeBase  = 15;
  const padVBase     = 12;
  const padHBase     = 24;
  const fontSizeBase = 27;
  const gapBase      = 12;
  const rightBase    = 36;

  const dotSize  = Math.round(dotSizeBase  * scale);
  const padV     = Math.round(padVBase     * scale);
  const padH     = Math.round(padHBase     * scale);
  const fontSize = Math.round(fontSizeBase * scale);
  const gap      = Math.round(gapBase      * scale);
  const right    = Math.round(rightBase    * scale);

  const chromeHeight = isPortrait ? CHROME_HEIGHT_PORTRAIT : CHROME_HEIGHT_LANDSCAPE;
  // Position pill 50px below chrome bottom to avoid visual merge with address bar
  const top = chromeHeight + Math.round(50 * scale);

  // B3: sin-pulse on connected dot (period 30fr = 1s at 30fps)
  const period = 30;
  const phase = frame % period;
  const pulseScale = connected
    ? interpolate(phase, [0, period / 2, period], [0.8, 1.2, 0.8], {
        easing: Easing.inOut(Easing.sin),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const pulseOpacity = connected
    ? interpolate(phase, [0, period / 2, period], [0.5, 1.0, 0.5], {
        easing: Easing.inOut(Easing.sin),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const bg = connected
    ? "rgba(76,29,149,0.3)"          // violet-900/30 — connected
    : "rgba(20,20,27,0.85)";         // zinc-950/85 — disconnected

  const border = connected
    ? "1px solid rgba(167,139,250,0.5)"  // violet-400/50
    : "1px solid rgba(63,63,70,0.5)";    // zinc-700/50

  const textColor = connected ? "#ddd6fe" : "#a1a1aa";
  const dotColor  = connected ? "#34d399" : "#52525b";  // emerald vs zinc
  const label     = connected ? "0x42a3…7e91" : "0x0…0000";

  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        display: "flex",
        alignItems: "center",
        gap,
        padding: `${padV}px ${padH}px`,
        background: bg,
        border,
        borderRadius: "999px",
        fontFamily: `${FONT_MONO}, monospace`,
        fontWeight: 600,
        fontSize,
        color: textColor,
        zIndex: 20,
        opacity,
      }}
    >
      {/* Status dot — pulses when connected */}
      <div
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          transform: `scale(${pulseScale})`,
          opacity: pulseOpacity,
        }}
      />
      {label}
    </div>
  );
};
