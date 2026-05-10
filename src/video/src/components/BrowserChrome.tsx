import { FONT_MONO } from "../fonts";

/**
 * BrowserChrome — Mocks v2 .chrome spec (import point #6).
 *
 * Renders a mock browser top bar with traffic-light dots and a URL pill
 * showing the voidpay.xyz/pay#... address. Mounts at top:0 across full
 * width; PayScene mounts it for the full S3 duration (F9-F12).
 *
 * Mock .chrome sizing (360px base → 1080px × 3):
 *   height: 6px + padding 6px 12px → scaled: 18px + padding 18px 36px
 *   font-size: 8px → 24px; url pill font-size: 7.5px → 22px
 *   dots: 5px → 15px diameter
 */

type BrowserChromeProps = {
  /** Opacity for entrance animation. Default 1. */
  opacity?: number;
};

export const BrowserChrome: React.FC<BrowserChromeProps> = ({ opacity = 1 }) => {
  const dotSize = 15;    // 5px × 3
  const dotGap = 8;     // 3px × ~2.5

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        background: "rgba(9,9,11,0.7)",
        borderBottom: "1px solid rgba(63,63,70,0.5)",
        padding: "18px 36px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: `${FONT_MONO}, monospace`,
        fontSize: 24,
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

      {/* URL pill */}
      <div
        style={{
          flex: 1,
          padding: "9px 24px",
          background: "rgba(24,24,27,0.7)",
          borderRadius: "999px",
          fontSize: 22,
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {/* Lock icon */}
        <span style={{ color: "#34d399", flexShrink: 0 }}>🔒</span>
        {/* Host */}
        <span style={{ color: "#8b5cf6", fontWeight: 600, flexShrink: 0 }}>voidpay.xyz</span>
        {/* Path */}
        <span style={{ color: "#71717a", overflow: "hidden", textOverflow: "ellipsis" }}>
          /pay#N4Ig…
        </span>
      </div>
    </div>
  );
};
