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
import { Caption } from "../components/Caption";
import { PAY_CAPTIONS_VERTICAL, PAY_CAPTIONS_LANDSCAPE } from "./captions/pay-captions";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";
import { BrowserChrome } from "../components/BrowserChrome";
import { WalletPill } from "../components/WalletPill";
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
const PRESS_CONNECT        = 85;
const PHASE_CONNECTING     = 90;
const PHASE_SWITCHING      = 170;
const PHASE_SENDING        = 240;
const PHASE_CONFIRMING     = 340;
const SUCCESS              = 470;
// D42: WalletPill shows connected only after connecting+switching animations complete.
// PHASE_SENDING (240) = when "Wallet connected" toast finishes and tx send begins —
// this is the earliest point the user has seen the full connection confirmed.
const PHASE_CONNECTED = PHASE_SENDING;
// Magic Dust window — shifted to align with new sending phase (240-340).
const MAGIC_DUST_HIGHLIGHT = 240;
const MAGIC_DUST_PEAK_END  = 390;
const CONFIRMATIONS_REQUIRED = 12;

// F2.A4: panel exits at 505-525 (shifted 20fr earlier), giving 50fr paper-alone window (1.67s).
// κ-3 original: 525-545 → 30fr. New: 505-525 → paper-alone 525-575 = 50fr.
const PANEL_EXIT_START = 505;
const PANEL_EXIT_END   = 525;

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
// T4c: true-center alignment (canonical, matches CreateScene + ShareScene).
// D12: accepts explicit containerWidth/containerHeight for landscape column layout.
const PaperBackdrop: React.FC<{
  paid: boolean;
  blurPx: number;
  dimOpacity: number;
  containerWidth?: number;
  containerHeight?: number;
  offsetTop?: number;
}> = ({
  paid,
  blurPx,
  dimOpacity,
  containerWidth,
  containerHeight,
  offsetTop = 0,
}) => {
  const { width, height } = useVideoConfig();
  const cw = containerWidth ?? width;
  const ch = containerHeight ?? height;
  const targetWidth = cw * 0.92;
  const scale = targetWidth / INVOICE_BASE_WIDTH;
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  const top = (ch - scaledH) / 2 + offsetTop;

  return (
    <div
      style={{
        position: "absolute",
        left: (cw - INVOICE_BASE_WIDTH * scale) / 2,
        top,
        width: INVOICE_BASE_WIDTH,
        height: INVOICE_BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        opacity: dimOpacity,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      }}
    >
      <InvoicePaper {...(paid ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING)} />
    </div>
  );
};

// Height of BrowserChrome bar: padding(18×2=36) + dot(15) = 51px
const CHROME_HEIGHT = 51;
// Max panel width in landscape right column (D13; D38: widened to 880)
const PANEL_MAX_WIDTH = 880;

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isLandscape = width > height;

  // Mocks v2 surgical: panel width = 84% of stage width (portrait only)
  const panelWidth = Math.round(width * 0.84);

  // Card entrance — panel rises from bottom using this as the slide-up progress
  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });

  const { step, idleSubState } = stepAt(frame);

  // Map PaymentStep → PaymentPanel's narrower {pending, confirming, paid} contract.
  const panelStatus: "pending" | "confirming" | "paid" =
    step === 'success' ? 'paid' :
    step === 'confirming' ? 'confirming' :
    'pending';

  // Round 9a-patch2 (C7): only one press in single-press model.
  const ctaPressTriggerFrame = frame >= PRESS_CONNECT ? PRESS_CONNECT : -1;

  const confirmations = useMemo(
    () => ({
      current: CONFIRMATIONS_REQUIRED,
      required: CONFIRMATIONS_REQUIRED,
    }),
    [],
  );

  // Violet pulse overlay over the totals band
  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT - 10, MAGIC_DUST_HIGHLIGHT + 10, MAGIC_DUST_PEAK_END - 10, MAGIC_DUST_PEAK_END + 10],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const panelTxHash = step === 'confirming' || step === 'success' ? DEMO_TX_HASH : undefined;

  // κ-3: paper shows paid state only at success
  const paperPaid = step === 'success';

  // Round 9c L3 + β2: pre-CTA panel exit — fade + small downward drift
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

  // 206edeb fix: paper blurred+dimmed while panel is foreground (F9-F11).
  // Transitions to sharp+full at PANEL_EXIT_END (545) — paper-alone window (F12).
  const paperBlur = interpolate(
    frame,
    [PANEL_EXIT_START, PANEL_EXIT_END],
    [2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const paperDim = interpolate(
    frame,
    [PANEL_EXIT_START, PANEL_EXIT_END],
    [0.4, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Shared panel JSX — used in both portrait and landscape branches
  const panelCascadeStyle = (
    <style>{`
      .remotion-pay-panel a[href="/create"] { display: none !important; }
      .remotion-pay-panel [class*="text-[9px]"]   { font-size: 22px !important; line-height: 1.4 !important; }
      .remotion-pay-panel .text-xs,
      .remotion-pay-panel [class*="text-[10px]"],
      .remotion-pay-panel [class*="text-[11px]"]  { font-size: 24px !important; line-height: 1.4 !important; }
      .remotion-pay-panel .text-sm                { font-size: 28px !important; line-height: 1.45 !important; }
      .remotion-pay-panel .text-base              { font-size: 32px !important; line-height: 1.5 !important; }
      .remotion-pay-panel .text-lg                { font-size: 36px !important; line-height: 1.5 !important; }
      .remotion-pay-panel .text-xl                { font-size: 40px !important; line-height: 1.4 !important; }
      .remotion-pay-panel .text-2xl               { font-size: 48px !important; line-height: 1.3 !important; }
      .remotion-pay-panel .text-3xl               { font-size: 60px !important; line-height: 1.2 !important; }
      .remotion-pay-panel .text-4xl               { font-size: 72px !important; line-height: 1.1 !important; }

      /* Form control heights */
      .remotion-pay-panel .h-7  { height: 56px !important; }
      .remotion-pay-panel .h-8  { height: 64px !important; }
      .remotion-pay-panel .h-9  { height: 72px !important; }
      .remotion-pay-panel .h-10 { height: 80px !important; }
      .remotion-pay-panel .h-11 { height: 88px !important; }
      .remotion-pay-panel .h-12 { height: 96px !important; }
      .remotion-pay-panel .h-14 { height: 112px !important; }

      /* Icon dimensions (lucide-react svg via w-N/h-N) */
      .remotion-pay-panel .w-3 { width: 24px !important; }
      .remotion-pay-panel .h-3 { height: 24px !important; }
      .remotion-pay-panel .w-4 { width: 32px !important; }
      .remotion-pay-panel .h-4 { height: 32px !important; }
      .remotion-pay-panel .w-5 { width: 40px !important; }
      .remotion-pay-panel .h-5 { height: 40px !important; }
      .remotion-pay-panel .w-6 { width: 48px !important; }
      .remotion-pay-panel .h-6 { height: 48px !important; }
      .remotion-pay-panel .w-11 { width: 88px !important; }
      .remotion-pay-panel .h-11 { height: 88px !important; }
      .remotion-pay-panel .w-12 { width: 96px !important; }

      /* D20: checkmark icon inside h-12/w-12 circle uses size={24} prop (px); scale up to match container */
      .remotion-pay-panel .h-12.w-12 svg { width: 48px !important; height: 48px !important; }

      /* D29: footer + magic dust icons use size={N} SVG prop (not Tailwind w-N/h-N classes).
         Production-parity ratio: text-xs (24px after cascade) / 12px base ≈ 2×.
         FingerprintIcon size={10} → 20px; footer icons size={12} → 24px. */
      .remotion-pay-panel svg[width="10"], .remotion-pay-panel svg[height="10"] { width: 20px !important; height: 20px !important; }
      .remotion-pay-panel svg[width="12"], .remotion-pay-panel svg[height="12"] { width: 24px !important; height: 24px !important; }
      .remotion-pay-panel svg[width="14"], .remotion-pay-panel svg[height="14"] { width: 28px !important; height: 28px !important; }
      /* D32: SmartPayButtonView spinner uses Loader2Icon size={18}; scale up to 48px for visibility */
      .remotion-pay-panel svg[width="18"], .remotion-pay-panel svg[height="18"] { width: 48px !important; height: 48px !important; }

      /* D32: kill animate-breathing text pulse (custom Tailwind animation — flickers at video FPS).
         Only the spinner should animate; text label stays static. */
      .remotion-pay-panel .motion-safe\\:animate-breathing { animation: none !important; }

      /* Padding scale-up (common form classes) */
      .remotion-pay-panel .p-0\\.5 { padding: 4px !important; }
      .remotion-pay-panel .p-1    { padding: 8px !important; }
      .remotion-pay-panel .p-1\\.5 { padding: 12px !important; }
      .remotion-pay-panel .p-2    { padding: 16px !important; }
      .remotion-pay-panel .p-3    { padding: 24px !important; }
      .remotion-pay-panel .p-4    { padding: 32px !important; }
      .remotion-pay-panel .px-2   { padding-left: 16px !important; padding-right: 16px !important; }
      .remotion-pay-panel .px-3   { padding-left: 24px !important; padding-right: 24px !important; }
      .remotion-pay-panel .px-4   { padding-left: 32px !important; padding-right: 32px !important; }
      .remotion-pay-panel .px-6   { padding-left: 48px !important; padding-right: 48px !important; }
      .remotion-pay-panel .py-0\\.5 { padding-top: 4px !important; padding-bottom: 4px !important; }
      .remotion-pay-panel .py-1   { padding-top: 8px !important; padding-bottom: 8px !important; }
      .remotion-pay-panel .py-2   { padding-top: 16px !important; padding-bottom: 16px !important; }
      .remotion-pay-panel .py-2\\.5 { padding-top: 20px !important; padding-bottom: 20px !important; }
      .remotion-pay-panel .py-3   { padding-top: 24px !important; padding-bottom: 24px !important; }
      .remotion-pay-panel .pt-2   { padding-top: 16px !important; }
      .remotion-pay-panel .pt-4   { padding-top: 32px !important; }
      .remotion-pay-panel .pt-5   { padding-top: 40px !important; }
      .remotion-pay-panel .pr-12  { padding-right: 96px !important; }

      /* D18/D28: frame-driven spinner — kill ALL animate-spin variants, use per-frame rotate.
         Three distinct Tailwind classes used across PaymentPanel/SmartPayButtonView:
         1. motion-safe:animate-[spin_1.5s_linear_infinite]  → SmartPayButtonView button span
         2. motion-safe:animate-spin                         → SecondaryActions, StatusBadge, PollingStatus
         3. animate-spin                                     → fallback (no motion-safe wrapper) */
      .remotion-pay-panel .motion-safe\\:animate-\\[spin_1\\.5s_linear_infinite\\],
      .remotion-pay-panel .motion-safe\\:animate-spin,
      .remotion-pay-panel .animate-spin {
        animation: none !important;
        transform: rotate(${frame * 8}deg) !important;
      }

      /* Gap scale-up */
      .remotion-pay-panel .gap-0\\.5 { gap: 4px !important; }
      .remotion-pay-panel .gap-1   { gap: 8px !important; }
      .remotion-pay-panel .gap-1\\.5 { gap: 12px !important; }
      .remotion-pay-panel .gap-2   { gap: 16px !important; }
      .remotion-pay-panel .gap-2\\.5 { gap: 20px !important; }
      .remotion-pay-panel .gap-3   { gap: 24px !important; }
      .remotion-pay-panel .gap-4   { gap: 32px !important; }

      /* Space-y scale-up (vertical rhythm inside panel) */
      .remotion-pay-panel .space-y-2 > * + * { margin-top: 16px !important; }
      .remotion-pay-panel .space-y-4 > * + * { margin-top: 32px !important; }

      /* Border radius — keep visually proportional */
      .remotion-pay-panel .rounded    { border-radius: 8px !important; }
      .remotion-pay-panel .rounded-full { border-radius: 9999px !important; }
      .remotion-pay-panel .rounded-lg { border-radius: 16px !important; }
      .remotion-pay-panel .rounded-xl { border-radius: 24px !important; }
    `}</style>
  );

  // Shared border/shadow strip — placed after panel in DOM so cascade wins over Tailwind
  const panelBorderStrip = (
    <style>{`
      .remotion-pay-panel [data-testid="payment-panel"] { box-shadow: none !important; border-width: 0px !important; border-style: none !important; border-color: transparent !important; outline: none !important; }
      .remotion-pay-panel [data-testid="payment-panel"][data-status="paid"],
      .remotion-pay-panel [data-testid="payment-panel"][data-status="confirming"] { border-width: 0px !important; border-style: none !important; border-color: transparent !important; }
      /* D31: gradient bar (h-1 = 4px) scaled to 12px for video visibility; animate-pulse killed (CSS flicker) */
      .remotion-pay-panel [data-testid="gradient-bar"] { height: 12px !important; }
      .remotion-pay-panel .motion-safe\\:animate-pulse { animation: none !important; }
      /* D34: success state gradient bar — emerald matches "Payment Successful" theme */
      .remotion-pay-panel [data-testid="payment-panel"][data-status="paid"] [data-testid="gradient-bar"] {
        background: linear-gradient(to right, rgb(16, 185, 129), rgb(52, 211, 153)) !important;
      }
    `}</style>
  );

  // Shared PaymentPanel inner content
  const paymentPanelContent = (
    <PaymentPanel
      invoice={DEMO_INVOICE}
      contentHash={DEMO_CONTENT_HASH}
      status={panelStatus}
      txHash={panelTxHash}
      confirmations={confirmations}
      source="received"
      finalized={panelStatus === "paid"}
    >
      {/* CTA — drives SmartPayButtonView per-frame across 6 idle sub-states + sending. */}
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
    </PaymentPanel>
  );

  // Shared overlay elements (BrowserChrome, WalletPill, toasts, captions, hints)
  // These are full-viewport and identical in both orientations.
  const chromeOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const walletOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // D12: Landscape two-column layout
  if (isLandscape) {
    const colWidth = width / 2;
    // Column containers span full height below chrome bar
    const colH = height - CHROME_HEIGHT;
    // D39: canonical paper sizing (Kai-locked formula — matches CreateScene + ShareScene)
    const PAPER_VPAD = 48;
    const availH = height - PAPER_VPAD * 2 - CHROME_HEIGHT;
    const scaleByH = availH / INVOICE_BASE_HEIGHT;
    const scaleByW = (colWidth * 0.85) / INVOICE_BASE_WIDTH;
    const paperScale = Math.min(scaleByW, scaleByH);
    const paperScaledH = INVOICE_BASE_HEIGHT * paperScale;
    const paperTop = CHROME_HEIGHT + PAPER_VPAD + (availH - paperScaledH) / 2;

    // Magic dust halo in landscape: anchored to paper totals area in left column
    // Totals area ~78% down paper, right edge of paper within left column
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
        {magicDustPulseOpacity > 0.01 && (
          <>
            <div
              style={{
                position: "absolute",
                left: haloLeft,
                top: haloTop,
                width: 300,
                height: 160,
                background: "radial-gradient(ellipse, rgba(167,139,250,0.85) 0%, rgba(167,139,250,0.25) 35%, transparent 70%)",
                filter: "blur(14px)",
                opacity: magicDustPulseOpacity,
                pointerEvents: "none",
              }}
            />
            <style>{`
              .remotion-dust-glow [data-magic-dust] .font-mono,
              .remotion-dust-glow .magic-dust-amount {
                text-shadow: 0 0 12px rgba(167,139,250,0.9) !important;
              }
            `}</style>
          </>
        )}

        {/* RIGHT column — PaymentPanel, maxWidth 640, centered */}
        {panelCascadeStyle}
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
            }}
          >
            <div style={{ padding: "36px 36px 30px" }}>
              {paymentPanelContent}
            </div>
          </div>
        </div>
        {panelBorderStrip}

        {/* BrowserChrome — full-width top overlay over BOTH columns */}
        <BrowserChrome opacity={chromeOpacity} />

        {/* WalletPill — top-right of FULL viewport (not confined to right column) */}
        {frame < SUCCESS && (
          <WalletPill
            connected={frame >= PHASE_CONNECTED}
            opacity={walletOpacity}
          />
        )}

        {/* Narrative toasts */}
        <RemotionFakeToast variant="success" title="Wallet connected" startAt={170} hold={60} stackOffset={0} anchor="below-panel" />
        <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={240} hold={60} stackOffset={0} anchor="below-panel" />
        <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={340} hold={140} stackOffset={0} anchor="below-panel" />
        <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={470} hold={120} stackOffset={0} anchor="below-panel" />

        {/* Captions */}
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
  }

  // Portrait (9x16) — UNCHANGED from p30
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* Round 9c L2: InvoicePaper as full-bleed scene backdrop.
           206edeb fix: paper blurred while panel foreground, sharp at F12 paper-alone. */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PaperBackdrop
          paid={paperPaid}
          blurPx={paperBlur}
          dimOpacity={paperDim}
        />
      </AbsoluteFill>

      {/* F1.C1: Magic Dust visual peak — violet halo anchored to paper totals area.
           Spec: bottom-right of totals, radial-gradient ellipse, blur(14px).
           Text-shadow on dust digits injected via <style> tag into paper backdrop. */}
      {magicDustPulseOpacity > 0.01 && (
        <>
          {/* Halo: anchored ~78% down (totals area) right edge of paper */}
          <div
            style={{
              position: "absolute",
              bottom: "18%",
              right: "4%",
              width: 300,
              height: 160,
              background: "radial-gradient(ellipse, rgba(167,139,250,0.85) 0%, rgba(167,139,250,0.25) 35%, transparent 70%)",
              filter: "blur(14px)",
              opacity: magicDustPulseOpacity,
              pointerEvents: "none",
            }}
          />
          {/* Dust digit glow — text-shadow on MagicDustBadge amounts via global style */}
          <style>{`
            .remotion-dust-glow [data-magic-dust] .font-mono,
            .remotion-dust-glow .magic-dust-amount {
              text-shadow: 0 0 12px rgba(167,139,250,0.9) !important;
            }
          `}</style>
        </>
      )}

      {/* β1+β2: Payment panel as floating center modal.
           Mocks v2 surgical: width = 84% of stage, side padding = 36px (12px × 3).
           F10 text sizes via fontSize: "24px" em-cascade into PaymentPanel internals.
           F2.D1: CreateYourOwnCta suppressed — voice-gate violation (self-referential in video). */}
      {panelCascadeStyle}
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
          // overflow:hidden clips PaymentPanel's own border/shadow flush to our rounded corners
          overflow: "hidden",
          // No padding here — padding is on the inner wrapper so PaymentPanel is flush
          // and overflow:hidden clips any conditional border from isPaid state
          padding: 0,
        }}
      >
        {/* Inner padding wrapper — keeps content inset while PaymentPanel border is clipped by outer overflow:hidden */}
        <div style={{ padding: "36px 36px 30px" }}>
          {paymentPanelContent}
        </div>
      </div>
      {/* Border/shadow strip placed AFTER panel in DOM so this <style> wins the cascade over Tailwind */}
      {panelBorderStrip}

      {/* C6: BrowserChrome — mock .chrome spec, full S3 duration (F9-F12) */}
      <BrowserChrome opacity={chromeOpacity} />

      {/* C7: WalletPill — disconnected (F9) → connected (F10-F11), exits at success (F12) */}
      {frame < SUCCESS && (
        <WalletPill
          connected={frame >= PHASE_CONNECTED}
          opacity={walletOpacity}
        />
      )}

      {/* Narrative toasts — anchored below panel right edge */}
      <RemotionFakeToast variant="success" title="Wallet connected" startAt={170} hold={60} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Network switched to Arbitrum" startAt={240} hold={60} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="loading" title="Confirming on-chain" description="Waiting for finality" startAt={340} hold={140} stackOffset={0} anchor="below-panel" />
      <RemotionFakeToast variant="success" title="Payment received" description="Cryptographic receipt verified" startAt={470} hold={120} stackOffset={0} anchor="below-panel" />

      {/* Captions */}
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
