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

// Phase timing — round 9a (S3-local frames):
//   0–60     idle:disconnected   ("Connect Wallet")  — no press trigger (initial state)
//  58–67     press-scale on Connect transition
//  65–95     idle:connecting     (NEW: spinner on CTA, "Connecting…")
//  95–155    idle:wrong-network  ("Switch Network")
// 153–162    press-scale on Switch transition
// 160–190    idle:switching      (NEW: spinner on CTA, "Switching…")
// 190–270    idle:ready          ("Pay 250 USDC")  ← +20fr from round 8
// 268–277    press-scale on Pay transition
// 275–365    sending             (loading button)
// 365–455    confirming          (CTA hidden, reorg progress visible)
// 455–575    success (paid)      (InvoicePaper paid watermark)
const PRESS_CONNECT        = 58;
const PHASE_CONNECTING     = 65;
const PHASE_WRONG_NETWORK  = 95;
const PRESS_SWITCH         = 153;
const PHASE_SWITCHING      = 160;
const PHASE_READY          = 190;
const PRESS_PAY            = 268;
const PHASE_SENDING        = 275;
const PHASE_CONFIRMING     = 365;
const SUCCESS              = 455;
const MAGIC_DUST_HIGHLIGHT = 170;  // ramp-in start; peak 190
const MAGIC_DUST_PEAK_END  = 310;  // 120fr peak hold
const CONFIRMATIONS_REQUIRED = 12;

const stepAt = (frame: number): { step: PaymentStep; idleSubState: IdleSubState } => {
  if (frame >= SUCCESS) return { step: 'success', idleSubState: 'ready' };
  if (frame >= PHASE_CONFIRMING) return { step: 'confirming', idleSubState: 'ready' };
  if (frame >= PHASE_SENDING) return { step: 'sending', idleSubState: 'ready' };
  if (frame >= PHASE_READY) return { step: 'idle', idleSubState: 'ready' };
  if (frame >= PHASE_SWITCHING) return { step: 'idle', idleSubState: 'switching' };
  if (frame >= PHASE_WRONG_NETWORK) return { step: 'idle', idleSubState: 'wrong-network' };
  if (frame >= PHASE_CONNECTING) return { step: 'idle', idleSubState: 'connecting' };
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

  // Pick the most recent press-scale trigger frame for the active phase.
  const ctaPressTriggerFrame =
    step === 'sending' ? PRESS_PAY :
    (step === 'idle' && idleSubState === 'ready') ? PRESS_PAY :
    (step === 'idle' && idleSubState === 'switching') ? PRESS_SWITCH :
    (step === 'idle' && idleSubState === 'wrong-network') ? PRESS_SWITCH :
    (step === 'idle' && idleSubState === 'connecting') ? PRESS_CONNECT :
    -1; // disconnected: no press trigger (initial state)

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

  // Violet pulse overlay over the totals band — round 9a: 120fr peak hold.
  // Ramp-in starts at MAGIC_DUST_HIGHLIGHT=170, peak 190 (=PHASE_READY start),
  // peak ends at MAGIC_DUST_PEAK_END=310 (overlaps sending start at 275 — visual continuity).
  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT - 20, MAGIC_DUST_HIGHLIGHT, MAGIC_DUST_PEAK_END, MAGIC_DUST_PEAK_END + 20],
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
          {(step === 'idle' || step === 'sending') && (
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
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={58} hold={45} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={153} hold={45} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Sending transaction" startAt={273} hold={85} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={365} hold={90} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={455} hold={120} stackOffset={0} anchor="below-panel" />
    </AbsoluteFill>
  );
};
