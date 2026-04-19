import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LockIcon, ServerOffIcon, GlobeIcon } from "@/shared/ui";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS } from "../fonts";

const ICON_STYLE = { color: COLORS.violet };

const PILLARS = [
  { label: "Zero-Backend" },
  { label: "Privacy-First" },
  { label: "Permissionless" },
  { label: "Perpetual" },
] as const;

const renderPillarIcon = (label: string) => {
  switch (label) {
    case "Zero-Backend":
      return <ServerOffIcon size={40} style={ICON_STYLE} />;
    case "Privacy-First":
      return <LockIcon size={40} style={ICON_STYLE} />;
    case "Permissionless":
      return <GlobeIcon size={40} style={ICON_STYLE} />;
    default:
      return (
        <span style={{ fontSize: 40, lineHeight: 1, color: COLORS.violet }}>
          ∞
        </span>
      );
  }
};

type PillarIconsProps = {
  /** Stagger delay between each pillar (frames) */
  stagger?: number;
};

export const PillarIcons: React.FC<PillarIconsProps> = ({ stagger = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pillarWidth = 180;
  const gap = 40;

  return (
    <div style={{ position: "absolute", bottom: 160, left: 0, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", gap }}>
        {PILLARS.map((pillar, i) => {
          const scale = spring({
            frame: frame - i * stagger,
            fps,
            config: SPRING_CONFIGS.smooth,
          });

          return (
            <div
              key={pillar.label}
              style={{
                width: pillarWidth,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                transform: `scale(${scale})`,
                opacity: scale,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40 }}>{renderPillarIcon(pillar.label)}</div>
              <div
                style={{
                  fontFamily: `${FONT_SANS}, sans-serif`,
                  fontSize: 16,
                  fontWeight: 700,
                  color: COLORS.violet,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  textAlign: "center",
                }}
              >
                {pillar.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
