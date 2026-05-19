import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { FONT_SANS } from "../fonts";

type Variant = "success" | "error" | "info" | "loading";

const VARIANT_STYLE: Record<Variant, { borderColor: string; iconColor: string; icon: string }> = {
  success: { borderColor: "rgba(16, 185, 129, 0.4)",  iconColor: "rgb(52, 211, 153)",  icon: "✓" },
  error:   { borderColor: "rgba(239, 68, 68, 0.4)",   iconColor: "rgb(248, 113, 113)", icon: "✕" },
  info:    { borderColor: "rgba(59, 130, 246, 0.4)",  iconColor: "rgb(96, 165, 250)",  icon: "ℹ" },
  loading: { borderColor: "rgba(168, 85, 247, 0.4)",  iconColor: "rgb(167, 139, 250)", icon: "◉" },
};

type Props = {
  variant: Variant;
  title: string;
  description?: string;
  startAt: number;
  hold: number;
  fadeOut?: number;
  /**
   * Vertical stack offset level (integer). Each level adds 100px upward.
   * Use when two toasts may overlap in time.
   */
  stackOffset?: number;
};

export const RemotionFakeToast: React.FC<Props> = ({
  variant,
  title,
  description,
  startAt,
  hold,
  fadeOut = 12,
  stackOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = width < height;
  const local = frame - startAt;
  if (local < 0 || local > hold + fadeOut) return null;

  const slideIn = spring({ frame: Math.min(local, 8), fps, config: { damping: 20, mass: 1, stiffness: 120 } });
  // Portrait: slides up from below (+100px); Landscape: slides in from right (+400px)
  const slideOffset = (1 - slideIn) * (isPortrait ? 100 : 400);

  const exitProgress = local > hold ? (local - hold) / fadeOut : 0;
  const opacity = 1 - exitProgress;
  // Portrait: drifts down on exit; Landscape: slides back right
  const exitOffset = exitProgress * (isPortrait ? 60 : 400);

  const style = VARIANT_STYLE[variant];

  // Unified positioning:
  //   Landscape: bottom-right corner — fixed right:80, bottom:80 + stack
  //   Portrait:  bottom-center — left:50%, translateX(-50%), bottom:80 + stack
  const bottomBase = 80;
  const stackPx = stackOffset * 100;
  const bottom = bottomBase + stackPx;

  const positionStyle: React.CSSProperties = isPortrait
    ? { bottom, left: "50%" }
    : { bottom, right: 80 };

  const transform = isPortrait
    ? `translateX(-50%) translateY(${slideOffset + exitOffset}px)`
    : `translateX(${slideOffset + exitOffset}px)`;

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle,
        transform,
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
        maxWidth: isPortrait ? 400 : 480,
        zIndex: 90,  // Caption.tsx uses 100 — toast renders below captions
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
