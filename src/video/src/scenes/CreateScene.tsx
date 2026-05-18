import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DEMO_FROM_ADDRESS, DEMO_NETWORK_ID } from "../constants/demo-invoice";
import { CreateSceneLandscape } from "./create/CreateSceneLandscape";
import { CreateScenePortrait } from "./create/CreateScenePortrait";
import type { HookVariant } from "./captions/thesis-captions";
import { typewrite } from "./create/typewrite";
import {
  INVOICE_FROM,
  INVOICE_ITEM,
  INVOICE_AMOUNT,
  INVOICE_TOKEN,
  INVOICE_NETWORK,
  INVOICE_NO_APPEAR,
  DATES_APPEAR,
  FROM_START,
  WALLET_APPEAR,
  CLIENT_APPEAR,
  LINE_DESC_APPEAR,
  LINE_PRICE_APPEAR,
  NETWORK_APPEAR,
  TOKEN_APPEAR,
  FILL_COMPLETE,
  BUTTON_VISIBLE,
  MAGIC_DUST_TOGGLE_FRAME,
  PAPER_APPEAR,
} from "./create/constants";

type Props = {
  hookVariant?: HookVariant;
};

export const CreateScene: React.FC<Props> = ({ hookVariant = "v1" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // Round 9c L7: portrait re-layout — form centered, paper in lower half.
  const isPortrait = width < 1200;
  // D12-D14: landscape two-column layout (16:9 = 1920×1080, width > height).
  const isLandscape = width > height;

  // Frame-driven snapshot for the real InvoiceFormView.
  const viewValue = useMemo(() => {
    const fromName = typewrite(INVOICE_FROM, frame, FROM_START);
    const walletAddress = frame >= WALLET_APPEAR ? DEMO_FROM_ADDRESS : undefined;
    const client = frame >= CLIENT_APPEAR ? { name: "VoidPay" } : undefined;

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
      ...(frame >= INVOICE_NO_APPEAR && { invoiceId: "VP-DEMO-001" }),
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
      ...(frame >= NETWORK_APPEAR && { chainId: DEMO_NETWORK_ID }),
      // C3: toggle off → on at MAGIC_DUST_TOGGLE_FRAME (good anchor for Spark hint copy)
      magicDustEnabled: frame >= MAGIC_DUST_TOGGLE_FRAME,
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
    frame < FILL_COMPLETE ? "token" :
    undefined;

  // Round 9a: violet pulse glow active throughout fill.
  const baseGlow = 0.25;
  const fillPulseDelta =
    frame >= INVOICE_NO_APPEAR && frame < BUTTON_VISIBLE
      ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.05, 0.4])
      : 0;
  const settledHalo = frame >= BUTTON_VISIBLE
    ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.0, 0.15])
    : 0;
  const buttonGlowOpacity = baseGlow + fillPulseDelta + settledHalo;

  // Mocks v2 surgical: portrait width = 84% of stage (907px on 1080), landscape keeps 768.
  const formWidth  = isPortrait ? Math.round(width * 0.84) : 768;
  const formHeight = isPortrait ? Math.round(height * 0.713) : 720;  // B3: +15% vertical stretch (0.62 → 0.713)
  const formLeft   = (width - formWidth) / 2;
  const formTop    = (height - formHeight) / 2;

  // γ3: single mercating neon glow — sin-driven pulse, no border (avoids double-rim)
  const neonPulse = 0.5 + 0.5 * Math.sin((frame / 60) * Math.PI * 2);   // 1 cycle / 2s
  const glowIntensity = 0.35 + neonPulse * 0.3;                         // 0.35 → 0.65
  const glowSpread = 30 + neonPulse * 30;                               // 30 → 60

  // A5: form dims when invoice paper appears — draws attention to the paper reveal.
  // Portrait only; landscape uses separate opacity path via CreateSceneLandscape formOpacity prop.
  const formOpacity = interpolate(
    frame,
    [PAPER_APPEAR, PAPER_APPEAR + 20],
    [1.0, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const sharedProps = {
    frame,
    viewValue: viewValue as Record<string, unknown>,
    focusedField,
    formHeight,
    glowSpread,
    glowIntensity,
    buttonGlowOpacity,
    formOpacity,
  };

  if (isLandscape) {
    return (
      <AbsoluteFill>
        <CreateSceneLandscape {...sharedProps} hookVariant={hookVariant} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <CreateScenePortrait
        {...sharedProps}
        isPortrait={isPortrait}
        formWidth={formWidth}
        formLeft={formLeft}
        formTop={formTop}
        hookVariant={hookVariant}
      />
    </AbsoluteFill>
  );
};
