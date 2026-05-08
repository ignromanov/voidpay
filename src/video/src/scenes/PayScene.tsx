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
import { Caption } from "../components/Caption";
import { HintBadge } from "../components/HintBadge";
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

// Round 9c L3: pre-CTA panel exit — panel fades + small drift before crossfade to S4.
// S3 ends at S-local 575. Crossfade starts at S-local 515.
// γ6: paper-alone "paid invoice" window 3× longer — was 20fr (555→575), now 60fr (515→575).
// Panel exits earlier within S3, paper alone in paid state holds longer before S4 crossfade.
const PANEL_EXIT_START = 495;
const PANEL_EXIT_END   = 515;

// ε5: panel width ~48% of 1080 viewport (was 60%) — more paper context visible
const PANEL_WIDTH = 520;

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

// Round 9c L2: PaperBackdrop — full-bleed InvoicePaper centered in viewport.
// Paper is status-driven (pending → paid as payment progresses).
const PaperBackdrop: React.FC<{ paid: boolean }> = ({ paid }) => {
  const { width, height } = useVideoConfig();
  const targetWidth = width * 0.92;
  const scale = targetWidth / INVOICE_BASE_WIDTH;
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  const top = Math.max(40, (height - scaledH) / 2 - 80);

  return (
    <div
      style={{
        position: "absolute",
        left: (width - INVOICE_BASE_WIDTH * scale) / 2,
        top,
        width: INVOICE_BASE_WIDTH,
        height: INVOICE_BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      <InvoicePaper {...(paid ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING)} />
    </div>
  );
};

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance — panel rises from bottom using this as the slide-up progress
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

  // Round 9a: restore reorg-progress visual.
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

  // Round 9c L2: paper shows paid state from confirming onwards (D3 carryover).
  const paperPaid = step === 'confirming' || step === 'success';

  // Round 9c L3 + β2: pre-CTA panel exit — fade + small downward drift (was 320px slide).
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

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Round 9c L2: InvoicePaper as full-bleed scene backdrop */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PaperBackdrop paid={paperPaid} />
      </AbsoluteFill>

      {/* Magic Dust violet pulse — halo over the paper totals area */}
      {magicDustPulseOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center 75%, ${COLORS.violetGlow} 0%, transparent 50%)`,
            opacity: magicDustPulseOpacity,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* β1+β2: Payment panel as floating center modal — replaces bottom-sheet (round 9c L6). */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: PANEL_WIDTH,
          // γ4: true-center positioning + scale + exit
          transform: `translate(-50%, -50%) scale(${cardScale * 0.92}) translateY(${panelExit}px)`,
          transformOrigin: "center center",
          opacity: cardScale * (1 - panelExitOpacity),
          borderRadius: 16,
          backgroundColor: "rgba(24, 24, 27, 0.96)",
          border: "1px solid rgba(63, 63, 70, 0.8)",
          boxShadow: "0 25px 80px -20px rgba(0,0,0,0.8), 0 8px 32px -8px rgba(0,0,0,0.5)",
          overflow: "hidden",
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
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={130} hold={60} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={200} hold={60} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={310} hold={90} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={440} hold={120} stackOffset={0} anchor="below-panel" />

      {/* η3: "Open link. Pay." caption — local 15–80, scene opener before panel is interactive.
           startAt=15 (R3: give cardScale spring 15fr to animate before caption enters per Spark note). */}
      <Caption
        text="Open link. Pay."
        position="top"
        startAt={15}
        endAt={80}
        fontSize={38}
      />

      {/* η4: magic dust hint below panel during violet glow — local 210–300 (MAGIC_DUST_HIGHLIGHT window) */}
      <HintBadge
        text="unique micro-amount ← payment ID"
        startAt={210}
        endAt={300}
        variant="arrow"
        fontSize={14}
        style={{
          left: "50%",
          bottom: "28%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      />

      {/* ζ5: Spark caption — Content Anchor #1 "Not our servers" reframe.
           startAt=460 local: T4 "Payment received" fires at f440; caption enters 20fr into T4 hold.
           Viewer reads chain confirmation first, then looks up to see the privacy claim. No endAt — persists to scene end. */}
      <Caption
        text="Not our servers."
        position="top"
        startAt={460}
        fontSize={38}
      />
    </AbsoluteFill>
  );
};
