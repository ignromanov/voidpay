import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NetworkBackground } from "@/widgets/network-background";
import { COLORS } from "../../constants/colors";
import { SPRING_CONFIGS } from "../../constants/timing";
import { RemotionFakeToast } from "../../components/RemotionFakeToast";
import { Caption } from "../../components/Caption";
import { PAY_CAPTIONS_VERTICAL } from "../captions/pay-captions";
import { NetworkBackgroundLayer } from "../../components/NetworkBackgroundLayer";
import { BrowserChrome } from "../../components/BrowserChrome";
import { WalletPill } from "../../components/WalletPill";
import { PaperBackdrop } from "../../components/PaperBackdrop";
import {
  CHROME_HEIGHT,
  PANEL_EXIT_START,
  PANEL_EXIT_END,
  MAGIC_DUST_HIGHLIGHT,
  MAGIC_DUST_PEAK_END,
  PHASE_CONNECTED,
  SUCCESS,
  PAPER_PROPS_PENDING,
  PAPER_PROPS_PAID,
} from "./constants";
import { stepAt, ctaPressTrigger } from "./phases";
import { PanelCascadeStyle } from "./PanelCascadeStyle";
import { PanelBorderStrip } from "./PanelBorderStrip";
import { MagicDustHalo } from "./MagicDustHalo";
import { PaymentPanelContent } from "./PaymentPanelContent";
import { useMemo } from "react";

export const PayScenePortrait: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Mocks v2 surgical: panel width = 84% of stage width (portrait only)
  const panelWidth = Math.round(width * 0.84);

  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });

  const { step, idleSubState } = stepAt(frame);

  const panelStatus: "pending" | "confirming" | "paid" =
    step === 'success' ? 'paid' :
    step === 'confirming' ? 'confirming' :
    'pending';

  const ctaPressTriggerFrame = ctaPressTrigger(frame);

  const confirmations = useMemo(
    () => ({ current: 12, required: 12 }),
    [],
  );

  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT, MAGIC_DUST_HIGHLIGHT + 20, MAGIC_DUST_PEAK_END, MAGIC_DUST_PEAK_END + 20],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // R9r: No dim in portrait per user requirement.
  const uiDimOpacity = 1.0;

  const panelTxHash = step === 'confirming' || step === 'success' ? "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456" as const : undefined;

  const paperPaid = step === 'success';

  const panelExit = interpolate(
    frame,
    [PANEL_EXIT_START, PANEL_EXIT_END],
    [0, 24],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const panelExitOpacity = interpolate(
    frame,
    [PANEL_EXIT_START, PANEL_EXIT_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Portrait: blur paper while panel is foreground, sharp at PANEL_EXIT_END.
  const paperBlur = interpolate(
    frame,
    [PANEL_EXIT_START, PANEL_EXIT_END],
    [2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const chromeOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const walletOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* Round 9c L2: InvoicePaper as full-bleed scene backdrop.
           Portrait paper: shared PaperBackdrop with D39 canonical sizing.
           CHROME_HEIGHT passed via containerHeight + parent top offset (offsetTop removed). */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: CHROME_HEIGHT,
          width,
          height: height - CHROME_HEIGHT,
        }}
      >
        <PaperBackdrop
          paperProps={paperPaid ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING}
          containerWidth={width}
          containerHeight={height - CHROME_HEIGHT}
          opacity={1.0}
          blurPx={paperBlur}
        />
      </div>

      {/* F1.C1: Magic Dust visual peak — violet halo anchored to paper totals area.
           Spec: bottom-right of totals, radial-gradient ellipse, blur(14px). */}
      <MagicDustHalo
        opacity={magicDustPulseOpacity}
        position={{ kind: "percentage", bottom: "18%", right: "4%" }}
      />

      {/* UI dim wrap during Magic Dust peak — panel + chrome dim together */}
      <div style={{ position: "absolute", inset: 0, opacity: uiDimOpacity, pointerEvents: "none" }}>
        {/* β1+β2: Payment panel as floating center modal.
             Mocks v2 surgical: width = 84% of stage, side padding = 36px (12px × 3).
             F2.D1: CreateYourOwnCta suppressed — voice-gate violation (self-referential in video). */}
        <PanelCascadeStyle frame={frame} />
        <div
          className="remotion-pay-panel"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: panelWidth,
            fontSize: "inherit",
            // θ6: panel at full scale matching production size
            transform: `translate(-50%, -50%) scale(${cardScale}) translateY(${panelExit}px)`,
            transformOrigin: "center center",
            opacity: cardScale * (1 - panelExitOpacity),
            borderRadius: 30,
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
            overflow: "hidden",
            padding: 0,
            pointerEvents: "auto",
          }}
        >
          {/* Inner padding wrapper */}
          <div style={{ padding: "36px 36px 30px" }}>
            <PaymentPanelContent
              frame={frame}
              step={step}
              idleSubState={idleSubState}
              panelStatus={panelStatus}
              panelTxHash={panelTxHash}
              confirmations={confirmations}
              ctaPressTriggerFrame={ctaPressTriggerFrame}
            />
          </div>
        </div>
        {/* Border/shadow strip placed AFTER panel in DOM so this <style> wins the cascade over Tailwind */}
        <PanelBorderStrip />

        {/* C6: BrowserChrome — mock .chrome spec, full S3 duration (F9-F12) */}
        <BrowserChrome opacity={chromeOpacity} />

        {/* C7: WalletPill — disconnected (F9) → connected (F10-F11), exits at success (F12) */}
        {frame < SUCCESS && (
          <WalletPill
            connected={frame >= PHASE_CONNECTED}
            opacity={walletOpacity}
          />
        )}
      </div>

      {/* Narrative toasts — R9r: frames aligned to new phase constants; portrait anchor unchanged */}
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={220} hold={40} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={270} hold={40} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={380} hold={80} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={465} hold={100} stackOffset={0} anchor="below-panel" />

      {/* Captions from caption-data (portrait) */}
      {PAY_CAPTIONS_VERTICAL.map((c) => (
        <Caption
          key={c.startAt}
          text={c.text}
          startAt={c.startAt}
          endAt={c.endAt}
          fontSize={c.fontSize}
          position={c.position}
          variant={c.variant}
          weight={c.weight}
          emphasizedWord={c.emphasizedWord}
          springConfig={c.springConfig}
        />
      ))}
    </AbsoluteFill>
  );
};
