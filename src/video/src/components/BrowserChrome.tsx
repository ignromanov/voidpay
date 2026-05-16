import { useVideoConfig } from "remotion";
import { FONT_MONO } from "../fonts";

/**
 * BrowserChrome — Mocks v2 .chrome spec (import point #6).
 *
 * Renders a mock browser top bar with traffic-light dots and a URL pill
 * showing the voidpay.xyz/pay#... address. Mounts at top:0 across full
 * width; PayScene mounts it for the full S3 duration (F9-F12).
 *
 * B2 sizing (round-10b):
 *   Landscape (16:9): base × 1.2 — height ~61px
 *   Portrait  (9:16): base × 1.5 — height ~76px
 *
 * Base: padding(18×2=36) + dot(15) = 51px
 */

type BrowserChromeProps = {
  /** Opacity for entrance animation. Default 1. */
  opacity?: number;
  /**
   * D2 (Phase 5) — account chip in the top-right of the chrome bar.
   * Shown only during PayScene (S3). Default false.
   */
  showAccountChip?: boolean;
};

/** Connected-wallet indicator shown inside chrome bar during PayScene. */
const AccountChip: React.FC<{ isPortrait: boolean }> = ({ isPortrait }) => {
  const scale = isPortrait ? 1.5 : 1.2;
  const fontSize   = Math.round(14 * scale);
  const dotSize    = Math.round(8  * scale);
  const padV       = Math.round(5  * scale);
  const padH       = Math.round(11 * scale);
  const gap        = Math.round(7  * scale);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        padding: `${padV}px ${padH}px`,
        borderRadius: 999,
        background: "rgba(124, 58, 237, 0.15)",
        border: "1px solid rgba(167, 139, 250, 0.3)",
        fontFamily: `${FONT_MONO}, monospace`,
        fontSize,
        color: "#ddd6fe",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 9999,
          background: "#10b981",
          flexShrink: 0,
        }}
      />
      <span>0x42a3…7e91</span>
    </div>
  );
};

export const BrowserChrome: React.FC<BrowserChromeProps> = ({ opacity = 1, showAccountChip = false }) => {
  const { width, height } = useVideoConfig();
  const isPortrait = width < height;

  const scale = isPortrait ? 1.5 : 1.2;

  const dotSize  = Math.round(15 * scale);   // base 15px
  const dotGap   = Math.round(8  * scale);   // base 8px
  const barGap   = Math.round(18 * scale);   // gap between dots group and URL pill
  const padV     = Math.round(18 * scale);   // vertical padding
  const padH     = Math.round(36 * scale);   // horizontal padding
  const fontSize = Math.round(24 * scale);   // base 24px
  const urlFont  = Math.round(22 * scale);   // base 22px
  const urlPadV  = Math.round(9  * scale);   // url pill vertical padding
  const urlPadH  = Math.round(24 * scale);   // url pill horizontal padding

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        background: "rgba(9,9,11,0.7)",
        borderBottom: "1px solid rgba(63,63,70,0.5)",
        padding: `${padV}px ${padH}px`,
        display: "flex",
        alignItems: "center",
        gap: barGap,
        fontFamily: `${FONT_MONO}, monospace`,
        fontSize,
        color: "#a1a1aa",
        zIndex: 5,
        opacity,
      }}
    >
      {/* Traffic-light dots: red / amber / green */}
      <div style={{ display: "flex", alignItems: "center", gap: dotGap }}>
        <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", background: "#22c55e" }} />
      </div>

      {/* URL pill — B4: shows demo invoice URL, truncated via ellipsis */}
      <div
        style={{
          flex: 1,
          padding: `${urlPadV}px ${urlPadH}px`,
          background: "rgba(24,24,27,0.7)",
          borderRadius: "999px",
          fontSize: urlFont,
          display: "flex",
          alignItems: "center",
          gap: Math.round(8 * scale),
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {/* Lock icon */}
        <span style={{ color: "#34d399", flexShrink: 0 }}>🔒</span>
        {/* Host */}
        <span style={{ color: "#8b5cf6", fontWeight: 600, flexShrink: 0 }}>voidpay.xyz</span>
        {/* Path — truncated with ellipsis */}
        <span style={{ color: "#71717a", overflow: "hidden", textOverflow: "ellipsis" }}>
          /pay#N4IgbghgTg9g…
        </span>
      </div>

      {/* Account chip — PayScene only, right of URL pill */}
      {showAccountChip && <AccountChip isPortrait={isPortrait} />}
    </div>
  );
};
