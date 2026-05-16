import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { FONT_SANS, FONT_MONO } from "../fonts";
import { RemotionAuroraText } from "../components/RemotionAuroraText";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";
import { Caption } from "../components/Caption";
import { useAspect } from "../hooks/useAspect";
import { getHookCaption, type HookVariant } from "./captions/thesis-captions";

/**
 * Scene 0 — Thesis Hook (3s, 90 frames @ 30fps).
 *
 * Round-9o: reverted to pre-9m layout — hero "The invoice / is the URL." fully visible
 * from start (no cross-fade pivot), stacked two lines, vertically centered.
 * Caption "Sending wallet..." stays at standard lower-third (y=69%).
 * Scene exit: container fades by frame 90 to prevent S0→S1 bleed.
 */
type Props = { hookVariant?: HookVariant };

export const ThesisHookScene: React.FC<Props> = ({ hookVariant = "v1" }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const { isVertical } = useAspect();
  const cap = getHookCaption(hookVariant, isVertical);

  // Portrait (1080w) uses ×3 of mock's 26px h1 = 78px; adaptive bump for readability
  const h1FontSize  = width < 1200 ? 84 : 72;
  // mock .pre = 8px → ×3 = 24px
  const preFontSize = width < 1200 ? 24 : 20;
  // mock .sub = 11px → ×3 = 33px
  const subFontSize = width < 1200 ? 33 : 28;

  // Round-9o: hero shows both lines full from start with simple fade-in (no cross-fade pivot)
  const heroOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene exit fade: prevent bleed into S1 at frame 90
  const sceneOpacity = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Caption canonical: position=69 (≈1325/1920) — lower-third safe-zone margin; size 60 (sub canonical)
  const captionPosition = isVertical ? 69 : cap.position;
  const captionFontSize = isVertical ? 50 : cap.fontSize;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: sceneOpacity }}>
      <NetworkBackgroundLayer variant="strong" />
      <NetworkBackground />

      {/* Round-9o: hero stack vertically centered, two lines stacked, both visible from start */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 42px",
          opacity: heroOpacity,
        }}
      >
        {/* VoidPay pre-line */}
        <div
          style={{
            fontFamily: `${FONT_MONO}, monospace`,
            fontWeight: 600,
            fontSize: preFontSize,
            letterSpacing: "0.18em",
            color: "#71717a",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          VoidPay
        </div>

        {/* H1: "The invoice" bold white + "is the URL." violet aurora — both stacked, both visible */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: h1FontSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: 36,
          }}
        >
          <span style={{ color: "#FFFFFF" }}>The invoice</span>
          <br />
          <RemotionAuroraText phaseFrames={0}>is&nbsp;the&nbsp;URL.</RemotionAuroraText>
        </div>

        {/* Sub-text */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontWeight: 500,
            fontSize: subFontSize,
            color: "#a1a1aa",
            maxWidth: 720,
            lineHeight: 1.45,
            opacity: 0.85,
          }}
        >
          Encoded into the link itself.
          <br />
          No database. No accounts. No servers.
        </div>
      </AbsoluteFill>

      {/* Hook variant caption overlay — A/B test text per round-9l spec §2 */}
      {/* round-9q: hook window shortened to 5-45; second caption fires 50-85 */}
      <Caption
        text={cap.text}
        startAt={cap.startAt}
        endAt={45}
        weight={cap.weight}
        emphasizedWord={cap.emphasizedWord}
        position={captionPosition}
        fontSize={captionFontSize}
        variant={cap.variant}
      />

      {/* round-9q: second S0 caption — "Raw addresses look unprofessional." */}
      <Caption
        text={isVertical ? "Raw addresses look unprofessional." : "Raw wallet addresses look unprofessional."}
        startAt={50}
        endAt={85}
        weight={500}
        emphasizedWord="unprofessional"
        position={captionPosition}
        fontSize={isVertical ? 50 : 59}
        variant="violet"
        springConfig="smooth"
      />
    </AbsoluteFill>
  );
};
