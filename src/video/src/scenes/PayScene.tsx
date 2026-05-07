import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  InvoicePaper,
  INVOICE_BASE_WIDTH,
  INVOICE_BASE_HEIGHT,
} from "@/widgets/invoice-paper";
import { PaymentPanel } from "@/widgets/payment-panel";
import { SmartPayButtonView } from "@/features/payment";
import type { PaymentStep, IdleSubState } from "@/features/payment";
import { NetworkBackground } from "@/widgets/network-background";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { RemotionFakeToast } from "../components/RemotionFakeToast";
import { RemotionPaidConfirmationProgress } from "../components/RemotionPaidConfirmationProgress";
import { DEMO_INVOICE, DEMO_CONTENT_HASH } from "../constants/demo-invoice";

// Deterministic demo tx hash for the paid-state watermark
const DEMO_TX_HASH =
  "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456" as const;

// Hoisted to module scope so prop identities are stable across every frame —
// prevents InvoicePaper re-renders from fresh object references (P1.2).
const PAPER_PROPS_PENDING = {
  data: DEMO_INVOICE,
  status: "pending",
  variant: "default",
} as const;

const PAPER_PROPS_PAID = {
  data: DEMO_INVOICE,
  status: "paid",
  txHash: DEMO_TX_HASH,
  variant: "default",
} as const;

// Phase timing — round 9a-patch2 (S3-local frames):
//   0–50    idle:disconnected   ("Connect Wallet" — only press needed)
//  48–57    press-scale on Connect (THE only press in this scene)
//  50–130   connecting  (spinner "Connecting…", progress 25%)
// 130–200   switching   (spinner "Switching…", progress 45%)
// 200–310   sending     (spinner "Sending…", progress 70%)
// 310–440   confirming  (CTA hidden, reorg progress visible, progress 90%)
// 440–575   success     (paid watermark, progress 100%)
//
// Single-press model per Ignat (round 9a-patch2 C7): user clicks Connect ONCE; then
// continuous progress. No return to idle:wrong-network or idle:ready between transitions.
// idle:disconnected = 0 (initial state, no explicit constant needed)
const PRESS_CONNECT        = 48;
const PHASE_CONNECTING     = 50;
const PHASE_SWITCHING      = 130;
const PHASE_SENDING        = 200;
const PHASE_CONFIRMING     = 310;
const SUCCESS              = 440;
// Magic Dust window — peak hold straddles sending→confirming for narrative continuity.
const MAGIC_DUST_HIGHLIGHT = 180;  // ramp-in start (20fr ramp to peak)
const MAGIC_DUST_PEAK_END  = 320;  // 120fr peak hold ends (per creative-brief §8 strict)
const CONFIRMATIONS_REQUIRED = 12;

const stepAt = (frame: number): { step: PaymentStep; idleSubState: IdleSubState } => {
  if (frame >= SUCCESS) return { step: 'success', idleSubState: 'ready' };
  if (frame >= PHASE_CONFIRMING) return { step: 'confirming', idleSubState: 'ready' };
  if (frame >= PHASE_SENDING) return { step: 'sending', idleSubState: 'ready' };
  if (frame >= PHASE_SWITCHING) return { step: 'switching', idleSubState: 'wrong-network' };
  if (frame >= PHASE_CONNECTING) return { step: 'connecting', idleSubState: 'disconnected' };
  return { step: 'idle', idleSubState: 'disconnected' };
};

/** press-scale on transition frames; 5fr ramp 0.96→1 right after the trigger frame. */
const pressScale = (frame: number, triggerFrame: number): number =>
  interpolate(
    frame,
    [triggerFrame - 2, triggerFrame, triggerFrame + 5, triggerFrame + 7],
    [1, 0.96, 0.96, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Card entrance (shared by paper + panel so they rise together)
  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });

  const { step, idleSubState } = stepAt(frame);

  // Map PaymentStep → PaymentPanel's narrower {pending, confirming, paid} contract.
  const panelStatus: "pending" | "confirming" | "paid" =
    step === 'success' ? 'paid' :
    step === 'confirming' ? 'confirming' :
    'pending';

  // Round 9a-patch2 (C7): only one press in single-press model. pressScale auto-clamps to 1
  // after triggerFrame+7, so reporting PRESS_CONNECT for all later frames is harmless.
  const ctaPressTriggerFrame = frame >= PRESS_CONNECT ? PRESS_CONNECT : -1;

  // Round 9a: restore reorg-progress visual (Ignat: "под кнопкой не хватает прогресса оплаты").
  // Drive confirmations.current frame-by-frame so RemotionPaidConfirmationProgress fills smoothly.
  // Production widget still receives current=required (hides its own framer-motion block per
  // round-7 hack) — the new overlay is rendered separately and is Remotion-safe.
  const confirmingProgress = interpolate(
    frame,
    [PHASE_CONFIRMING, SUCCESS],
    [0, CONFIRMATIONS_REQUIRED],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const confirmations = useMemo(
    () => ({
      current: CONFIRMATIONS_REQUIRED,
      required: CONFIRMATIONS_REQUIRED,
    }),
    [],
  );

  // Scale real A4 paper (794×1123) to fit the left pane.
  const { paperScale, paperScaledW, paperScaledH } = useMemo(() => {
    const containerW = width * 0.42;
    const containerH = height * 0.82;
    const scale = Math.min(
      containerW / INVOICE_BASE_WIDTH,
      containerH / INVOICE_BASE_HEIGHT,
    );
    return {
      paperScale: scale,
      paperScaledW: INVOICE_BASE_WIDTH * scale,
      paperScaledH: INVOICE_BASE_HEIGHT * scale,
    };
  }, [width, height]);

  // Violet pulse overlay over the totals band — round 9a-patch2: peak window 180-320 (140fr
  // ramp/hold/fade with 120fr peak hold inside). Straddles sending→confirming for continuity.
  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT - 10, MAGIC_DUST_HIGHLIGHT + 10, MAGIC_DUST_PEAK_END - 10, MAGIC_DUST_PEAK_END + 10],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Real flow: hash exists once tx is submitted (after sending → confirming).
  const panelTxHash = step === 'confirming' || step === 'success' ? DEMO_TX_HASH : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Left: real InvoicePaper (Arbitrum USDC invoice with Magic Dust) */}
      <div
        style={{
          position: "absolute",
          left: width * 0.08,
          top: height * 0.09,
          width: paperScaledW,
          height: paperScaledH,
          transform: `scale(${cardScale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            width: INVOICE_BASE_WIDTH,
            height: INVOICE_BASE_HEIGHT,
            transform: `scale(${paperScale})`,
            transformOrigin: "top left",
          }}
        >
          <InvoicePaper
            {...(panelStatus === "paid" ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING)}
          />
        </div>

        {/* Magic Dust violet pulse — halo over the totals band */}
        {magicDustPulseOpacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: paperScaledH * 0.22,
              height: 120,
              background: `radial-gradient(ellipse at center, ${COLORS.violetGlow} 0%, transparent 70%)`,
              opacity: magicDustPulseOpacity,
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          />
        )}
      </div>

      {/* Right: real PaymentPanel — frame drives status, confirmations, txHash.
          Width matches the real /pay layout (max-w-md ~= 448px) so the widget
          renders at its intended density rather than stretched. */}
      <div
        style={{
          position: "absolute",
          right: width * 0.18,
          top: "50%",
          width: 480,
          transform: `translate(0, -50%) scale(${cardScale})`,
          transformOrigin: "top right",
        }}
      >
        <PaymentPanel
          invoice={DEMO_INVOICE}
          contentHash={DEMO_CONTENT_HASH}
          status={panelStatus}
          txHash={panelTxHash}
          confirmations={confirmations}
          source="received"
          finalized={panelStatus === "paid"}
        >
          {/* CTA — round 9a: drives SmartPayButtonView per-frame across 6 idle sub-states
              + sending. connecting/switching sub-states show spinner (C5 extension).
              Press-scale fires at PRESS_CONNECT/PRESS_SWITCH/PRESS_PAY. */}
          {/* Round 9a-patch1 (B6): render CTA for connecting/switching/sending too, hide only in
              confirming (reorg-progress overlay takes the visual spot) and success (paid watermark). */}
          {(step !== 'confirming' && step !== 'success') && (
            <div
              style={{
                transform: ctaPressTriggerFrame >= 0
                  ? `scale(${pressScale(frame, ctaPressTriggerFrame)})`
                  : undefined,
                transformOrigin: "center",
              }}
            >
              <SmartPayButtonView
                step={step}
                idleSubState={idleSubState}
                currency={DEMO_INVOICE.currency}
                subtotal="250000000"
                decimals={6}
              />
            </div>
          )}

          {/* Round 9a: reorg progress overlay — Remotion-safe frame-driven bar.
              Rendered during PHASE_CONFIRMING window only. Production widget's own
              framer-motion block stays hidden (current=required) per round-7 hack. */}
          {step === 'confirming' && (
            <div style={{ marginTop: 12 }}>
              <RemotionPaidConfirmationProgress
                current={confirmingProgress}
                required={CONFIRMATIONS_REQUIRED}
              />
            </div>
          )}
        </PaymentPanel>
      </div>

      {/* Narrative toasts — anchored below panel right edge */}
      {/* Round 9a-patch3 (D1): T3 "Sending transaction" removed (overlapped T2). T2 stays at
          startAt=200. Confirming toast fires at 310 when tx is submitted. */}
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={130} hold={45} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={200} hold={45} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={310} hold={90} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={440} hold={120} stackOffset={0} anchor="below-panel" />
    </AbsoluteFill>
  );
};
