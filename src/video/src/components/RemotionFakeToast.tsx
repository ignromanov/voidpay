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
  const local = frame - startAt;
  if (local < 0 || local > hold + fadeOut) return null;

  // Slide-in from right: spring 8fr
  const slideIn = spring({ frame: Math.min(local, 8), fps, config: { damping: 20, mass: 1, stiffness: 120 } });
  const slideX = (1 - slideIn) * 400;

  // Fade-out
  const exitProgress = local > hold ? (local - hold) / fadeOut : 0;
  const opacity = 1 - exitProgress;
  const exitX = exitProgress * 400;

  const style = VARIANT_STYLE[variant];

  const panelTop = (height - PANEL_HEIGHT) / 2;
  const panelBottom = panelTop + PANEL_HEIGHT;
  // Round 9a-patch3 (D2): below-panel anchor aligns toast LEFT edge to PaymentPanel
  // LEFT edge (вровень с формой оплаты per Ignat 2026-05-07). Was: right: "18%" (right-aligned).
  // PaymentPanel: right=18%, width=480 → left edge = width*0.82 - 480.
  const PANEL_RIGHT_PCT = 0.18;
  const PANEL_WIDTH = 480;
  const positionStyle: React.CSSProperties = anchor === "below-panel"
    ? {
        left: width * (1 - PANEL_RIGHT_PCT) - PANEL_WIDTH,
        bottom: height - panelBottom - 80 - stackOffset,
        maxWidth: PANEL_WIDTH,
      }
    : {
        right: 24,
        bottom: 24 + stackOffset,
      };

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle,
        transform: `translateX(${slideX + exitX}px)`,
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
