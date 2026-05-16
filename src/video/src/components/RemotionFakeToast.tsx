import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { FONT_SANS } from "../fonts";

type Variant = "success" | "error" | "info" | "loading";

const VARIANT_STYLE: Record<Variant, { borderColor: string; iconColor: string; icon: string }> = {
  success: { borderColor: "rgba(16, 185, 129, 0.4)",  iconColor: "rgb(52, 211, 153)",  icon: "✓" },
  error:   { borderColor: "rgba(239, 68, 68, 0.4)",   iconColor: "rgb(248, 113, 113)", icon: "✕" },
  info:    { borderColor: "rgba(59, 130, 246, 0.4)",  iconColor: "rgb(96, 165, 250)",  icon: "ℹ" },
  loading: { borderColor: "rgba(168, 85, 247, 0.4)",  iconColor: "rgb(167, 139, 250)", icon: "◉" },
};

// Estimated panel height (matches PayScene PANEL_HEIGHT constant)
const PANEL_HEIGHT = 580;

type Props = {
  variant: Variant;
  title: string;
  description?: string;
  startAt: number;
  hold: number;
  fadeOut?: number;
  /** Vertical stack offset — use 0/72/144 for stacked toasts */
  stackOffset?: number;
  /**
   * Positioning anchor:
   * - 'bottom-right' (default) — fixed bottom-right corner
   * - 'below-panel' — just below the PaymentPanel's lower edge, right-aligned to panel
   */
  anchor?: "bottom-right" | "below-panel";
  /**
   * R9r Concern 4: when true, pins toast to right:0 instead of right:"18%".
   * Used in landscape to avoid collision with captions in the bottom-third area.
   * Has no effect in portrait (portrait uses center alignment regardless).
   */
  rightAlign?: boolean;
};

export const RemotionFakeToast: React.FC<Props> = ({
  variant,
  title,
  description,
  startAt,
  hold,
  fadeOut = 12,
  stackOffset = 0,
  anchor = "bottom-right",
  rightAlign = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // Round 9c L6: in portrait the panel is a full-width bottom sheet —
  // align toast right edge to panel's internal right padding (24px).
  const isPortrait = width < 1200;
  const local = frame - startAt;
  if (local < 0 || local > hold + fadeOut) return null;

  const slideIn = spring({ frame: Math.min(local, 8), fps, config: { damping: 20, mass: 1, stiffness: 120 } });
  // θ7: portrait toasts slide up from bottom (positive offset = below, 0 = final position)
  const slideOffset = (1 - slideIn) * (isPortrait ? 100 : 400);   // portrait: from below (+100), landscape: from right (+400)

  // Fade-out
  const exitProgress = local > hold ? (local - hold) / fadeOut : 0;
  const opacity = 1 - exitProgress;
  // θ7: portrait toasts drift down on exit (matching enter direction reversal)
  const exitOffset = exitProgress * (isPortrait ? 60 : 400);      // portrait: drift down, landscape: slide right

  const style = VARIANT_STYLE[variant];

  const panelTop = (height - PANEL_HEIGHT) / 2;
  const panelBottom = panelTop + PANEL_HEIGHT;

  const positionStyle: React.CSSProperties = isPortrait
    ? {
        // θ7: bottom-center in portrait — top zone is reserved for Caption.tsx pills
        bottom: 80 + stackOffset,
        left: "50%",
      }
    : (anchor === "below-panel"
        ? {
            // R9r Concern 4: rightAlign pins to right edge (avoids caption collision in landscape)
            right: rightAlign ? 0 : "18%",
            bottom: height - panelBottom - 80 - stackOffset,
          }
        : {
            right: 24,
            bottom: 24 + stackOffset,
          });

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle,
        transform: isPortrait
          ? `translateX(-50%) translateY(${slideOffset + exitOffset}px)`
          : `translateX(${slideOffset + exitOffset}px)`,
        opacity,
        background: "rgba(39, 39, 42, 0.85)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${style.borderColor}`,
        borderRadius: 14,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
        maxWidth: 540,
        zIndex: 90,  // R9r: Caption.tsx uses 100 — toast renders below captions
      }}
    >
      <span style={{ fontSize: 32, color: style.iconColor }}>{style.icon}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: `${FONT_SANS}, sans-serif`, letterSpacing: -0.2 }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 16, color: "rgb(161, 161, 170)", marginTop: 4, fontFamily: `${FONT_SANS}, sans-serif` }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};
