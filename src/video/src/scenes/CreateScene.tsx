import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  InvoicePaper,
  INVOICE_BASE_WIDTH,
  INVOICE_BASE_HEIGHT,
} from "@/widgets/invoice-paper";
import { InvoiceFormView, GenerateButton } from "@/widgets/invoice-form";
import { NetworkBackground } from "@/widgets/network-background";
import { Card } from "@/shared/ui";
import { COLORS } from "../constants/colors";
import { TYPEWRITER_CHAR_FRAMES } from "../constants/timing";
import { Caption } from "../components/Caption";
import { MicroLabel } from "../components/MicroLabel";
import { DEMO_INVOICE, DEMO_FROM_ADDRESS } from "../constants/demo-invoice";

// Creative brief §2: Alex · UI Design · $250 USDC · Arbitrum
const INVOICE_FROM = "Alex";
const INVOICE_ITEM = "UI Design";
const INVOICE_AMOUNT = "250.00";
const INVOICE_TOKEN = "USDC";
const INVOICE_NETWORK = "Arbitrum";

// Phase frames — round 8: every constant shifted +60fr from round 7.
// First 60fr = S1 hold (form Card visible, no fields filling) so it doesn't
// "blink" into existence. Fields begin populating at frame 65, all populated
// by frame 130 = BUTTON_VISIBLE.
const INVOICE_NO_APPEAR = 65;
const DATES_APPEAR = 75;
const FROM_START = 82;
const WALLET_APPEAR = 90;
const CLIENT_APPEAR = 97;
const LINE_DESC_APPEAR = 104;
const LINE_PRICE_APPEAR = 110;
const NETWORK_APPEAR = 116;
const TOKEN_APPEAR = 122;
const BUTTON_VISIBLE = 130;

// Form scroll keyframes — round 8: scroll motion expanded 24fr → 54fr (slower).
// Start at frame 90 (1s after fields begin filling, sympathetic to round-7 logic).
// End at frame 144 (= mp4 7.133s). Final offset -420 unchanged from round 7
// (Ignat approved that depth).
const SCROLL_FRAMES = [90, 110, 130, 144];
const SCROLL_OFFSETS = [0, -130, -280, -420];

const noop = () => {
  /* Remotion renders static frames — click handlers never fire */
};

/** Typewriter: reveal `text` char by char starting at `startFrame` */
const typewrite = (text: string, frame: number, startFrame: number): string => {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed / TYPEWRITER_CHAR_FRAMES);
  return text.slice(0, Math.min(chars, text.length));
};

export const CreateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Frame-driven snapshot for the real InvoiceFormView.
  const viewValue = useMemo(() => {
    const fromName = typewrite(INVOICE_FROM, frame, FROM_START);
    const walletAddress = frame >= WALLET_APPEAR ? DEMO_FROM_ADDRESS : undefined;
    const client = frame >= CLIENT_APPEAR ? { name: "Acme Corp" } : undefined;

    // Line item appears progressively: description first, then rate (price)
    const lineItems = frame >= LINE_DESC_APPEAR
      ? [{
          description: INVOICE_ITEM,
          quantity: 1,
          rate: frame >= LINE_PRICE_APPEAR ? INVOICE_AMOUNT : undefined,
        }]
      : undefined;

    const networkLabel = frame >= NETWORK_APPEAR ? INVOICE_NETWORK : undefined;
    const tokenSymbol = frame >= TOKEN_APPEAR ? INVOICE_TOKEN : undefined;

    return {
      ...(frame >= INVOICE_NO_APPEAR && { invoiceId: DEMO_INVOICE.invoiceId }),
      ...(frame >= DATES_APPEAR && {
        issuedAt: "2026-04-18",
        dueAt: "2026-04-25",
      }),
      from: fromName
        ? { name: fromName, ...(walletAddress && { walletAddress }) }
        : undefined,
      ...(client && { client }),
      ...(lineItems && { lineItems }),
      ...(networkLabel && { networkLabel }),
      ...(tokenSymbol && { tokenSymbol }),
      ...(frame >= NETWORK_APPEAR && { chainId: 42161 }),
      magicDustEnabled: true,
    };
  }, [frame]);

  // Focused field drives the violet ring — simulates the "user typing here" beat.
  // Invoice No / Dates aren't part of focusedField enum, so no ring until FROM_START.
  const focusedField: "from" | "client" | "lineItem" | "token" | "network" | undefined =
    frame < FROM_START ? undefined :
    frame < CLIENT_APPEAR ? "from" :
    frame < LINE_DESC_APPEAR ? "client" :
    frame < NETWORK_APPEAR ? "lineItem" :
    frame < TOKEN_APPEAR ? "network" :
    frame < BUTTON_VISIBLE ? "token" :
    undefined;

  // Violet glow overlay behind the card — base glow always visible; pulse
  // intensifies after Generate button appears.
  const baseGlow = 0.25;
  const pulseDelta = frame >= BUTTON_VISIBLE
    ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.05, 0.4])
    : 0;
  const buttonGlowOpacity = baseGlow + pulseDelta;

  // Paper preview layout — depends only on composition size.
  const paperLayout = useMemo(() => {
    const containerW = width * 0.38;
    const containerH = height * 0.8;
    const scale = Math.min(
      containerW / INVOICE_BASE_WIDTH,
      containerH / INVOICE_BASE_HEIGHT,
    );
    return {
      containerW,
      containerH,
      scale,
      scaledW: INVOICE_BASE_WIDTH * scale,
      scaledH: INVOICE_BASE_HEIGHT * scale,
    };
  }, [width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackground />

      {/* Void glow overlay behind the form card — always visible, pulses when Generate button appears */}
      <div
        style={{
          position: "absolute",
          left: width * 0.06 - 24,
          top: height * 0.06 - 24,
          width: width * 0.36 + 48,
          height: height * 0.88 + 48,
          borderRadius: 32,
          boxShadow: `0 0 60px rgba(124,58,237,${buttonGlowOpacity * 0.6}), 0 0 120px rgba(124,58,237,${buttonGlowOpacity * 0.3})`,
          pointerEvents: "none",
        }}
      />

      {/* Round 7 — Card holds form panel + button INSIDE the scroll-translated div.
          Button uses real GenerateButton from @/widgets/invoice-form (same component
          as production form). canGenerate forced to true once frame >= BUTTON_VISIBLE.
          Press-scale wrapper localized to the button only. */}
      <Card
        variant="glass"
        style={{
          position: "absolute",
          left: width * 0.06,
          top: height * 0.06,
          width: width * 0.36,
          height: height * 0.88,
          padding: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            transform: `translateY(${interpolate(
              frame,
              SCROLL_FRAMES,
              SCROLL_OFFSETS,
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )}px)`,
          }}
        >
          <InvoiceFormView
            value={viewValue}
            {...(focusedField && { focusedField })}
            showGenerateButton={false}
          />

          {/* Real GenerateButton — appears after fields populated. Inside scroll
              container so it scrolls with the form. canGenerate=true so button is
              visually active (not the disabled state real validation would force). */}
          {frame >= BUTTON_VISIBLE && (
            <div
              style={{
                marginTop: 16,
                transform: `scale(${interpolate(frame, [198, 200, 215, 217], [1, 0.96, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                transformOrigin: "center",
              }}
            >
              <GenerateButton
                onGenerate={noop}
                canGenerate={true}
                isGenerating={false}
                onSubmitAttempt={noop}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Preview paper (right) — real InvoicePaper, scaled to fit. */}
      <div
        style={{
          position: "absolute",
          right: width * 0.06 + (paperLayout.containerW - paperLayout.scaledW) / 2,
          top: height * 0.1 + (paperLayout.containerH - paperLayout.scaledH) / 2,
          width: paperLayout.scaledW,
          height: paperLayout.scaledH,
          opacity: interpolate(
            frame,
            [90, 150],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          transform: `translateY(${interpolate(
            frame,
            [90, 150],
            [20, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )}px)`,
        }}
      >
        <div
          style={{
            width: INVOICE_BASE_WIDTH,
            height: INVOICE_BASE_HEIGHT,
            transform: `scale(${paperLayout.scale})`,
            transformOrigin: "top left",
          }}
        >
          <InvoicePaper
            data={DEMO_INVOICE}
            status="pending"
            variant="default"
          />
        </div>
      </div>

      {/* Round 8: all label timings shifted +60fr from round 7 to align with the
          extended S1 (260fr total). Sequential Captions remain non-overlapping;
          "No login" still anchored ~50fr after BUTTON_VISIBLE so it appears after
          the press feedback fires. */}
      <Caption text="No backend" position="top" startAt={135} endAt={185} />
      <Caption text="No signup" position="top" startAt={205} endAt={255} />

      <MicroLabel text="Filling out an invoice" startAt={65} endAt={150} x="8%" y="14%" anchor="left" />
      <MicroLabel text="No login. No data stored." startAt={186} endAt={260} x="8%" y="84%" anchor="left" maxWidth={520} />
    </AbsoluteFill>
  );
};
