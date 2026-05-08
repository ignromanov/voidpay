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
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // Round 9c L6: in portrait the panel is a full-width bottom sheet —
  // align toast right edge to panel's internal right padding (24px).
  const isPortrait = width < 1200;
  const local = frame - startAt;
  if (local < 0 || local > hold + fadeOut) return null;

  const slideIn = spring({ frame: Math.min(local, 8), fps, config: { damping: 20, mass: 1, stiffness: 120 } });
  const slideOffset = (1 - slideIn) * (isPortrait ? -100 : 400);  // portrait: from above (-100), landscape: from right (+400)

  // Fade-out
  const exitProgress = local > hold ? (local - hold) / fadeOut : 0;
  const opacity = 1 - exitProgress;
  const exitOffset = exitProgress * (isPortrait ? -60 : 400);     // portrait: drift up small, landscape: slide right

  const style = VARIANT_STYLE[variant];

  const panelTop = (height - PANEL_HEIGHT) / 2;
  const panelBottom = panelTop + PANEL_HEIGHT;

  const positionStyle: React.CSSProperties = isPortrait
    ? {
        // γ5: top-center in portrait — avoids right-edge clipping during slide
        top: 80 + stackOffset,
        left: "50%",
      }
    : (anchor === "below-panel"
        ? {
            right: "18%",
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
        borderRadius: 12,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
        maxWidth: 420,
        zIndex: 9999,
      }}
    >
      <span style={{ fontSize: 20, color: style.iconColor }}>{style.icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", fontFamily: `${FONT_SANS}, sans-serif` }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: "rgb(161, 161, 170)", marginTop: 2, fontFamily: `${FONT_SANS}, sans-serif` }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};
