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
import { NetworkBackground } from "@/widgets/network-background";
import { COLORS } from "../constants/colors";
import { SPRING_CONFIGS } from "../constants/timing";
import { RemotionFakeToast } from "../components/RemotionFakeToast";
import { Caption } from "../components/Caption";
import { HintBadge } from "../components/HintBadge";
import { NetworkBackgroundLayer } from "../components/NetworkBackgroundLayer";
import { BrowserChrome } from "../components/BrowserChrome";
import { WalletPill } from "../components/WalletPill";
import { RemotionPaymentPanelSkin } from "../components/RemotionPaymentPanelSkin";
import { DEMO_INVOICE } from "../constants/demo-invoice";

// Phase timing — κ-3 reshuffle (S3-local frames):
//   0–90    idle:disconnected   ("Connect Wallet")
//  90–170   connecting
// 170–240   switching
// 240–340   sending
// 340–470   confirming
// 470–575   success/paid
const PHASE_CONNECTING     = 90;
const PHASE_SWITCHING      = 170;
const PHASE_SENDING        = 240;
const PHASE_CONFIRMING     = 340;
const SUCCESS              = 470;
const MAGIC_DUST_HIGHLIGHT = 240;
const MAGIC_DUST_PEAK_END  = 390;
const CONFIRMATIONS_REQUIRED = 12;

const PANEL_EXIT_START = 525;
const PANEL_EXIT_END   = 545;
const PANEL_WIDTH = 780;

type SkinStep = 'idle' | 'connecting' | 'switching' | 'sending' | 'confirming' | 'paid';

const stepAt = (frame: number): SkinStep => {
  if (frame >= SUCCESS) return 'paid';
  if (frame >= PHASE_CONFIRMING) return 'confirming';
  if (frame >= PHASE_SENDING) return 'sending';
  if (frame >= PHASE_SWITCHING) return 'switching';
  if (frame >= PHASE_CONNECTING) return 'connecting';
  return 'idle';
};

// Round 9c L2: PaperBackdrop — full-bleed InvoicePaper centered in viewport.
// Paper is status-driven (pending → paid as payment progresses).
// C10: PayScene exception — paper sits at top:64px below browser chrome per mock.
// Chrome bar height ~60px (18px padding × 2 + 15px dot + 9px content) + 4px gap = ~64px.
const CHROME_HEIGHT = 64;   // mock top:64px — paper starts just below chrome
const PaperBackdrop: React.FC<{ paid: boolean }> = ({ paid }) => {
  const { width, height } = useVideoConfig();
  const targetWidth = width * 0.92;
  const scale = targetWidth / INVOICE_BASE_WIDTH;
  const scaledH = INVOICE_BASE_HEIGHT * scale;
  // Center paper in the space below chrome bar
  const availableHeight = height - CHROME_HEIGHT;
  const top = CHROME_HEIGHT + Math.max(0, (availableHeight - scaledH) / 2);

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
      <InvoicePaper
        data={DEMO_INVOICE}
        status={paid ? "paid" : "pending"}
        variant="default"
      />
    </div>
  );
};

export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame, fps, config: SPRING_CONFIGS.smooth });
  const step = stepAt(frame);
  const paperPaid = step === 'paid';

  // Confirming progress 0→CONFIRMATIONS_REQUIRED across the confirming window
  const confirmingProgress = interpolate(
    frame,
    [PHASE_CONFIRMING, SUCCESS],
    [0, CONFIRMATIONS_REQUIRED],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Magic dust violet pulse — peak window straddles sending→confirming
  const magicDustPulseOpacity = interpolate(
    frame,
    [MAGIC_DUST_HIGHLIGHT - 10, MAGIC_DUST_HIGHLIGHT + 10, MAGIC_DUST_PEAK_END - 10, MAGIC_DUST_PEAK_END + 10],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Pre-CTA panel exit — fade + small downward drift
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
          // F4 fix: RemotionPaymentPanelSkin owns all internal sizing — no em-cascade wrapper
          transform: `translate(-50%, -50%) scale(${cardScale}) translateY(${panelExit}px)`,
          transformOrigin: "center center",
          opacity: cardScale * (1 - panelExitOpacity),
        }}
      >
        {/* F4 fix: skin replaces production PaymentPanel — Mocks v2 ×3 sizes, frame-driven */}
        <RemotionPaymentPanelSkin
          step={step}
          confirmingProgress={confirmingProgress}
          magicDustPulseOpacity={magicDustPulseOpacity}
        />
      </div>

      {/* C6: BrowserChrome — mock .chrome spec, full S3 duration (F9-F12) */}
      <BrowserChrome
        opacity={interpolate(frame, [0, 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />

      {/* C7: WalletPill — disconnected (F9) → connected (F10-F11), exits at success (F12) */}
      {frame < SUCCESS && (
        <WalletPill
          connected={frame >= PHASE_CONNECTING}
          opacity={interpolate(frame, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      )}

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

      {/* η4 (F10): Mocks v2 anchor top:24.7% right:3.9% — "unique micro-amount ← payment ID" */}
      <HintBadge
        text="unique micro-amount ← payment ID"
        startAt={255}
        endAt={345}
        variant="arrow"
        fontSize={40}
        style={{
          top: "24.7%",
          right: "3.9%",
          zIndex: 10,
        }}
      />

      {/* ζ5: Spark caption — Content Anchor #1 "Not our servers" reframe.
           κ-3: startAt=490 local (20fr into new SUCCESS=470); T4 fires at 470.
           C8: emerald variant signals payment success (color shift per mock F12). */}
      <Caption
        text="Not our servers."
        position="top"
        startAt={490}
        fontSize={38}
        variant="emerald"
      />
    </AbsoluteFill>
  );
};
