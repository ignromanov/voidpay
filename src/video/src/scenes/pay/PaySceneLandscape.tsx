import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  InvoicePaper,
  INVOICE_BASE_WIDTH,
  INVOICE_BASE_HEIGHT,
} from "@/widgets/invoice-paper";
import { NetworkBackground } from "@/widgets/network-background";
import { COLORS } from "../../constants/colors";
import { SPRING_CONFIGS } from "../../constants/timing";
import { RemotionFakeToast } from "../../components/RemotionFakeToast";
import { Caption } from "../../components/Caption";
import { PAY_CAPTIONS_LANDSCAPE } from "../captions/pay-captions";
import { NetworkBackgroundLayer } from "../../components/NetworkBackgroundLayer";
import { BrowserChrome } from "../../components/BrowserChrome";
import { WalletPill } from "../../components/WalletPill";
import {
  CHROME_HEIGHT,
  PANEL_MAX_WIDTH,
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

export const PaySceneLandscape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

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

  // R9r: no dim and no blur in landscape
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

  const chromeOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const walletOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const colWidth = width / 2;
  const colH = height - CHROME_HEIGHT;

  // D39: canonical paper sizing (Kai-locked formula — matches CreateScene + ShareScene)
  const PAPER_VPAD = 48;
  const availH = height - PAPER_VPAD * 2 - CHROME_HEIGHT;
  const scaleByH = availH / INVOICE_BASE_HEIGHT;
  const scaleByW = (colWidth * 0.85) / INVOICE_BASE_WIDTH;
  const paperScale = Math.min(scaleByW, scaleByH);
  const paperScaledH = INVOICE_BASE_HEIGHT * paperScale;
  const paperTop = CHROME_HEIGHT + PAPER_VPAD + (availH - paperScaledH) / 2;

  // Magic dust halo: anchored to paper totals area in left column
  const paperLeft = (colWidth - INVOICE_BASE_WIDTH * paperScale) / 2;
  const haloLeft = paperLeft + INVOICE_BASE_WIDTH * paperScale - 80;
  const haloTop = paperTop + paperScaledH * 0.72;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* LEFT column — InvoicePaper centered below chrome */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: CHROME_HEIGHT,
          width: colWidth,
          height: colH,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: paperLeft,
            top: paperTop - CHROME_HEIGHT, // relative to column top (which is at CHROME_HEIGHT)
            width: INVOICE_BASE_WIDTH,
            height: INVOICE_BASE_HEIGHT,
            transform: `scale(${paperScale})`,
            transformOrigin: "top left",
          }}
        >
          <InvoicePaper {...(paperPaid ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING)} />
        </div>
      </div>

      {/* F1.C1: Magic Dust visual peak — anchored to paper totals in left column */}
      <MagicDustHalo
        opacity={magicDustPulseOpacity}
        position={{ kind: "absolute", left: haloLeft, top: haloTop }}
      />

      {/* UI dim wrap during Magic Dust peak — right column panel + chrome dim together */}
      <div style={{ position: "absolute", inset: 0, opacity: uiDimOpacity, pointerEvents: "none" }}>
        {/* RIGHT column — PaymentPanel, maxWidth 640, centered */}
        <PanelCascadeStyle frame={frame} />
        <div
          style={{
            position: "absolute",
            left: colWidth,
            top: CHROME_HEIGHT,
            width: colWidth,
            height: colH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="remotion-pay-panel"
            style={{
              width: "100%",
              maxWidth: PANEL_MAX_WIDTH,
              fontSize: "inherit",
              transform: `scale(${cardScale}) translateY(${panelExit}px)`,
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
        </div>
        <PanelBorderStrip />

        {/* BrowserChrome — full-width top overlay over BOTH columns */}
        <BrowserChrome opacity={chromeOpacity} />

        {/* WalletPill — top-right of FULL viewport (not confined to right column) */}
        {frame < SUCCESS && (
          <WalletPill
            connected={frame >= PHASE_CONNECTED}
            opacity={walletOpacity}
          />
        )}
      </div>

      {/* Narrative toasts — R9r: frames aligned to new phase constants; confirming toast right-aligned (Concern 4) */}
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={220} hold={40} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={270} hold={40} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={380} hold={80} stackOffset={0} anchor="below-panel" rightAlign />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={465} hold={100} stackOffset={0} anchor="below-panel" />

      {/* Captions from caption-data (landscape) */}
      {PAY_CAPTIONS_LANDSCAPE.map((c) => (
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
