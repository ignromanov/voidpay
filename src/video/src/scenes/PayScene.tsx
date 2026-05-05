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
import { Caption } from "../components/Caption";
import { MicroLabel } from "../components/MicroLabel";
import { RemotionFakeToast } from "../components/RemotionFakeToast";
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

// Phase timing — round 6 (S3-local frames):
//   0-90    idle:disconnected → Connect Wallet
//  90-150   idle:wrong-network → Switch Network (press-scale at 90)
// 150-210   idle:ready → Pay 250 USDC (press-scale at 150, Magic Dust 180-300 overlaps)
// 210-300   sending → loading state (press-scale at 210)
// 300-390   confirming
// 390-510   success (paid)
const PHASE_SWITCH_NETWORK = 90;
const PHASE_READY = 150;
const PHASE_SENDING = 210;
const MAGIC_DUST_HIGHLIGHT = 180;
const MAGIC_DUST_PEAK_END = 300;
const CONFIRMING = 300;
const SUCCESS = 390;
const CONFIRMATIONS_REQUIRED = 12;

const stepAt = (frame: number): { step: PaymentStep; idleSubState: IdleSubState } => {
  if (frame >= SUCCESS) return { step: 'success', idleSubState: 'ready' };
  if (frame >= CONFIRMING) return { step: 'confirming', idleSubState: 'ready' };
  if (frame >= PHASE_SENDING) return { step: 'sending', idleSubState: 'ready' };
  if (frame >= PHASE_READY) return { step: 'idle', idleSubState: 'ready' };
  if (frame >= PHASE_SWITCH_NETWORK) return { step: 'idle', idleSubState: 'wrong-network' };
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
    step === 'sending' ? PHASE_SENDING :
    (step === 'idle' && idleSubState === 'ready') ? PHASE_READY :
    (step === 'idle' && idleSubState === 'wrong-network') ? PHASE_SWITCH_NETWORK :
    -1; // 'connect' phase has no press trigger (initial state)

  // Confirmation progress during the confirming phase. Clamped 0→12 (standard
  // Arbitrum finality requirement, matches real PaymentPanel's default).
  const confirmationsCurrent = Math.round(
    interpolate(frame, [CONFIRMING, SUCCESS], [0, CONFIRMATIONS_REQUIRED], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const confirmations = useMemo(
    () => ({
      current: confirmationsCurrent,
      required: CONFIRMATIONS_REQUIRED,
    }),
    [confirmationsCurrent],
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

  // Violet pulse overlay over the totals band — v2 holds max-emphasis for
  // 120 frames (4s) per creative-brief-v2 §8 non-negotiable, then fades out
  // before the confirming phase starts.
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
          {/* CTA — round 6: drives real SmartPayButtonView per-frame across 4 visible
              payment steps. press-scale wrapper pulses on entry to switch/ready/sending
              transitions (frames 90/150/210). View renders Connect/Switch/Pay/Sending
              labels + spinner + progress bar from `step` + `idleSubState` alone. */}
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
        </PaymentPanel>
      </div>

      {/* v2 caption per creative-brief-v2 §4 — top-mounted, aligned with
          the 120-frame Magic Dust peak (local frames 240–360). */}
      <Caption text="Cryptographic receipt" position="top" startAt={180} endAt={300} />

      <MicroLabel text="No account — wallet is the identity" startAt={5} endAt={85} x="62%" y="20%" anchor="left" maxWidth={420} />
      <MicroLabel text="Network matches the invoice" startAt={95} endAt={145} x="62%" y="20%" anchor="left" maxWidth={420} />
      <MicroLabel text="Micro-amount added for exact matching" startAt={155} endAt={290} x="8%" y="84%" anchor="left" maxWidth={520} />
      <MicroLabel text="Verified on-chain. Payment complete." startAt={395} endAt={500} x="50%" y="14%" anchor="center" maxWidth={520} />

      {/* Narrative toasts — anchored below panel right edge */}
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={88} hold={45} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={148} hold={45} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Sending transaction" startAt={208} hold={85} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={300} hold={90} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={390} hold={120} stackOffset={0} anchor="below-panel" />
    </AbsoluteFill>
  );
};
