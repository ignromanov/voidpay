import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { SPRING_CONFIGS } from "../constants/timing";
import { FONT_SANS, FONT_MONO } from "../fonts";
import { RemotionAuroraText } from "../components/RemotionAuroraText";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";
import { Caption } from "../components/Caption";
import { PulseGlow } from "../components/PulseGlow";
import { useAspect } from "../hooks/useAspect";
import { getOutroCaption, type HookVariant } from "./captions/thesis-captions";

/**
 * Scene 4 — Thesis Outro (3.5s, 105 frames @ 30fps).
 *
 * Round-9m fixes:
 * - Hero stack pushed +120px via paddingTop: 360px (mirror S0).
 * - Sub-text trimmed to 1 line.
 * - URL pill "voidpay" uses RemotionAuroraText with phaseFrames=45 offset
 *   so it doesn't animate in lockstep with the hero aurora — creates depth.
 * - Caption position overridden to 71% (≈1360/1920), compact fontSize=74.
 */
type ThesisOutroSceneProps = {
  hookVariant?: HookVariant;
};

export const ThesisOutroScene: React.FC<ThesisOutroSceneProps> = ({ hookVariant = "v1" }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { isVertical } = useAspect();
  const outroCap = getOutroCaption(isVertical, hookVariant);

  // ε3: delay thesis entrance by 12fr to let S3→S4 crossfade complete first
  const TEXT_DELAY = 12;
  const enter = spring({
    frame: frame - TEXT_DELAY,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 30,
  });
  const urlEnter = spring({
    frame: frame - TEXT_DELAY - 30,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 30,
  });
  const opacity = interpolate(frame, [TEXT_DELAY, TEXT_DELAY + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mock 360px base → 1080px × 3 scaling
  const isPortrait = width < 1200;
  const preFontSize  = isPortrait ? 24 : 20;
  const heroFontSize = isPortrait ? 78 : 66;
  const subFontSize  = isPortrait ? 33 : 28;
  const urlFontSize  = isPortrait ? 56 : 48;

  // Round-9o: caption canonical sub size 60 (was 74); position 69 lower-third (mirror S0)
  const captionPosition = isVertical ? 69 : outroCap.position;
  const captionFontSize = isVertical ? 50 : outroCap.fontSize;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity,
      }}
    >
      <NetworkBackgroundLayer variant="strong" />
      <NetworkBackground />

      {/* Round-9o: hero stack vertically centered (was paddingTop 360 push) — mirrors S0 revert */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 60px",
          gap: 0,
          transform: `translateY(${(1 - enter) * 20}px)`,
        }}
      >
        {/* Pre-line: "No accounts · no DB · no servers" */}
        <div
          style={{
            fontFamily: `${FONT_MONO}, monospace`,
            fontWeight: 600,
            fontSize: preFontSize,
            letterSpacing: "0.18em",
            color: "#71717a",
            textTransform: "uppercase",
            marginBottom: 24,
            whiteSpace: "nowrap",
          }}
        >
          No accounts · no DB · no servers
        </div>

        {/* H1: line 1 bold white, line 2 violet aurora — matches landing Hero (D11) */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: heroFontSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: 36,
          }}
        >
          <span style={{ color: "#FFFFFF" }}>The invoice</span>
          <br />
          <RemotionAuroraText>is&nbsp;the&nbsp;URL.</RemotionAuroraText>
        </div>

        {/* Sub-text trimmed to 1 line per round-9m F13 fix */}
        <div
          style={{
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontWeight: 500,
            fontSize: subFontSize,
            color: "#a1a1aa",
            lineHeight: 1.45,
            maxWidth: 720,
            marginBottom: 56,
          }}
        >
          Encoded into the link itself.
        </div>

        {/* voidpay.xyz wordmark — "voidpay" uses aurora with phase offset for depth */}
        <PulseGlow rgb="124, 58, 237" spread={24} period={30}>
        <div
          style={{
            transform: `translateY(${(1 - urlEnter) * 20}px) scale(${0.95 + 0.05 * urlEnter})`,
            opacity: urlEnter,
            border: `1.5px solid rgba(139, 92, 246, 0.8)`,
            borderRadius: 999,
            padding: "14px 28px",
            fontFamily: `${FONT_SANS}, sans-serif`,
            fontSize: urlFontSize,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 12px 40px rgba(124, 58, 237, 0.35), 0 0 0 1px rgba(139, 92, 246, 0.15)",
          }}
        >
          <span>
            <RemotionAuroraText
              phaseFrames={45}
              style={{ fontSize: urlFontSize, fontWeight: 700 }}
            >
              voidpay
            </RemotionAuroraText>
            <span style={{ color: "#c4b5fd", fontWeight: 700 }}>.xyz</span>
          </span>
          <span style={{ opacity: 0.9, color: "#a78bfa" }}>→</span>
        </div>
        </PulseGlow>
      </AbsoluteFill>

      {/* Closing caption — "Works even if we shut down." per round-9l spec §3/§4 S4 */}
      {/* position/fontSize overridden to round-9m spec: 71% / compact 74px */}
      <Caption
        text={outroCap.text}
        startAt={outroCap.startAt}
        endAt={outroCap.endAt}
        weight={outroCap.weight}
        emphasizedWord={outroCap.emphasizedWord}
        position={captionPosition}
        fontSize={captionFontSize}
        variant={outroCap.variant}
      />
    </AbsoluteFill>
  );
};
