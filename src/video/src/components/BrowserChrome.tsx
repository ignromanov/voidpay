import { useVideoConfig } from "remotion";
import { FONT_MONO } from "../fonts";

/**
 * BrowserChrome — Mocks v2 .chrome spec (import point #6).
 *
 * Renders a mock browser top bar with traffic-light dots and a URL pill
 * showing the voidpay.xyz/pay#... address. Mounts at top:0 across full
 * width; PayScene mounts it for the full S3 duration (F9-F12).
 *
 * R14-B sizing (aspect-aware):
 *   Portrait  (9:16): base × 1.5 — height ~76px  (smartphone-like reference)
 *   Landscape (16:9): ~75-80% of portrait — height 48px (compact, desktop-like)
 *
 * Base: padding(18×2=36) + dot(15) = 51px
 */

type BrowserChromeProps = {
  /** Opacity for entrance animation. Default 1. */
  opacity?: number;
};

export const BrowserChrome: React.FC<BrowserChromeProps> = ({ opacity = 1 }) => {
  const { width, height } = useVideoConfig();
  const isPortrait = width < height;

  // Portrait: full scale × 1.5; landscape: compact ~75-80% of portrait values
  const dotSize  = isPortrait ? Math.round(15 * 1.5) : 12;   // portrait 23px / landscape 12px
  const dotGap   = isPortrait ? Math.round(8  * 1.5) : 8;    // portrait 12px / landscape 8px
  const barGap   = isPortrait ? Math.round(18 * 1.5) : 14;   // portrait 27px / landscape 14px
  const padV     = isPortrait ? Math.round(18 * 1.5) : 14;   // portrait 27px / landscape 14px
  const padH     = isPortrait ? Math.round(36 * 1.5) : 28;   // portrait 54px / landscape 28px
  const fontSize = isPortrait ? Math.round(24 * 1.5) : 18;   // portrait 36px / landscape 18px
  const urlFont  = isPortrait ? Math.round(22 * 1.5) : 18;   // portrait 33px / landscape 18px
  const urlPadV  = isPortrait ? Math.round(9  * 1.5) : 7;    // portrait 14px / landscape 7px
  const urlPadH  = isPortrait ? Math.round(24 * 1.5) : 18;   // portrait 36px / landscape 18px
  const urlGap   = isPortrait ? Math.round(8  * 1.5) : 6;    // portrait 12px / landscape 6px

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
          gap: urlGap,
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

    </div>
  );
};
