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
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";
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

// Phase timing — κ-3 reshuffle (S3-local frames):
//   0–90    idle:disconnected   ("Connect Wallet" — only press needed)
//           Extended from 50→90 so B1 beat is visible even through the 20fr crossfade entry
//  85–94    press-scale on Connect (THE only press in this scene)
//  90–170   connecting  (spinner "Connecting…", progress 25%)
// 170–240   switching   (spinner "Switching…", progress 45%)
// 240–340   sending     (spinner "Sending…", progress 70%)
// 340–470   confirming  (CTA hidden, reorg progress visible, progress 90%; paper still PENDING)
// 470–575   success     (paid watermark, progress 100%)
//
// Single-press model per Ignat (round 9a-patch2 C7): user clicks Connect ONCE; then
// continuous progress. No return to idle:wrong-network or idle:ready between transitions.
// idle:disconnected = 0 (initial state, no explicit constant needed)
//
// κ-3 key fix: paperPaid now only triggers at SUCCESS (not confirming), making B4 visually
// distinct from B5 — pending paper + progress bar vs paid paper + "Payment Successful" panel.
const PRESS_CONNECT        = 85;
const PHASE_CONNECTING     = 90;
const PHASE_SWITCHING      = 170;
const PHASE_SENDING        = 240;
const PHASE_CONFIRMING     = 340;
const SUCCESS              = 470;
// Magic Dust window — shifted to align with new sending phase (240-340).
// Ramp starts at PHASE_SENDING, peak holds through sending into confirming start.
const MAGIC_DUST_HIGHLIGHT = 240;  // ramp-in start (20fr ramp to peak)
const MAGIC_DUST_PEAK_END  = 390;  // peak hold ends at confirming+50fr for narrative continuity
const CONFIRMATIONS_REQUIRED = 12;

// κ-3: pre-CTA panel exit shifted to match new SUCCESS=470.
// Panel exits at local 525-545, giving 30fr paper-alone window (545-575) before S4 crossfade.
// SUCCESS=470, panel exits at 525 (55fr into success = 1.83s of success with panel visible).
const PANEL_EXIT_START = 525;
const PANEL_EXIT_END   = 545;

// θ6: panel width +1.5× — reverting ε5 reduction (520) back toward production size.
// 520 × 1.5 = 780. Matches production PaymentPanel proportions at ~72% of 1080 viewport.
const PANEL_WIDTH = 780;

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

  // κ-3: paper shows paid state only at success — keeps B4 (confirming) visually distinct
  // from B5 (success): pending paper + progress bar vs paid paper + "Payment Successful" panel.
  const paperPaid = step === 'success';

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
      <NetworkBackgroundLayer variant="soft" />
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
      {/* ι3: fontSize:24px on wrapper drives em-cascade into PaymentPanel internals.
           Panel outer width stays at θ6's 780px — only text grows proportionally.
           24px = 1.5× browser default 16px, matching the ×1.5 intent for this panel. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: PANEL_WIDTH,
          fontSize: "24px",
          // θ6: ε5 ×0.92 scale removed — panel at full scale matching production size
          transform: `translate(-50%, -50%) scale(${cardScale}) translateY(${panelExit}px)`,
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
      {/* κ-3 toast timings — shifted to match new phase windows:
          T1 fires at PHASE_SWITCHING (170), T2 fires at PHASE_SENDING (240),
          T3 fires at PHASE_CONFIRMING (340) hold=140 (spans into success for continuity),
          T4 fires at SUCCESS (470) hold=120. */}
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={170} hold={60} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={240} hold={60} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={340} hold={140} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={470} hold={120} stackOffset={0} anchor="below-panel" />

      {/* ε3: "Open link. Pay." caption — local 15–88, scene opener during idle:disconnected beat.
           κ-3: extended endAt 80→88 to cover the full idle window (0-90) minus a 2fr gap before
           PRESS_CONNECT (85). Gives B1 a clear caption across the full visible idle window. */}
      <Caption
        text="Open link. Pay."
        position="top"
        startAt={15}
        endAt={88}
        fontSize={38}
      />

      {/* η4: magic dust hint — κ-3: shifted to align with new sending phase (240-340).
           Enters at 255 (15fr into sending, giving Magic Dust ramp time to build),
           exits at 345 (5fr into confirming). Top zone clear: ε3 exits at 88, ζ5 starts at 490.
           ι4: fontSize 40, top:90 (prevent clipping at top edge). */}
      <HintBadge
        text="unique micro-amount ← payment ID"
        startAt={255}
        endAt={345}
        variant="arrow"
        fontSize={40}
        style={{
          left: "50%",
          top: 90,
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      />

      {/* ζ5: Spark caption — Content Anchor #1 "Not our servers" reframe.
           κ-3: startAt=490 local (20fr into new SUCCESS=470); T4 fires at 470.
           Viewer reads chain confirmation first (T4 toast), then looks up to see privacy claim.
           No endAt — persists to scene end. */}
      <Caption
        text="Not our servers."
        position="top"
        startAt={490}
        fontSize={38}
      />
    </AbsoluteFill>
  );
};
