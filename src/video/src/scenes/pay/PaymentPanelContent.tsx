import { interpolate } from "remotion";
import { PaymentPanel } from "@/widgets/payment-panel";
import { SmartPayButtonView } from "@/features/payment/video-internals";
import type { PaymentStep, IdleSubState } from "@/features/payment";
import { DEMO_INVOICE, DEMO_CONTENT_HASH } from "../../constants/demo-invoice";
import { pressScale } from "./phases";
import { FINALIZE } from "./constants";

export const PaymentPanelContent: React.FC<{
  frame: number;
  step: PaymentStep;
  idleSubState: IdleSubState;
  panelStatus: "pending" | "confirming" | "paid";
  panelTxHash: string | undefined;
  confirmations: { current: number; required: number };
  ctaPressTriggerFrame: number;
  panelFinalized: boolean;
}> = ({
  frame,
  step,
  idleSubState,
  panelStatus,
  panelTxHash,
  confirmations,
  ctaPressTriggerFrame,
  panelFinalized,
}) => {
  // Double-tick blink: 8fr period (~0.27s/blink, ~3.75 cycles) over 30fr window starting at FINALIZE.
  // R22 fix: old window was FINALIZE→PANEL_EXIT_START = only 5fr (one cycle never completes).
  // Extended to FINALIZE+30 so blink runs during panel fade-out — blends naturally with global opacity.
  // Min opacity 0.15 (was 0.4) for a noticeably deep dip per R22 9:16 #3.
  const BLINK_WINDOW = 30;
  const blinkOpacity =
    frame >= FINALIZE && frame < FINALIZE + BLINK_WINDOW
      ? interpolate(
          (frame - FINALIZE) % 8,
          [0, 4, 8],
          [1.0, 0.15, 1.0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;

  return (
    <PaymentPanel
      invoice={DEMO_INVOICE}
      contentHash={DEMO_CONTENT_HASH}
      status={panelStatus}
      txHash={panelTxHash}
      confirmations={confirmations}
      source="received"
      finalized={panelFinalized}
      checkmarkOpacity={blinkOpacity}
    >
      {/* CTA — drives SmartPayButtonView per-frame across 6 idle sub-states + sending. */}
      {step !== 'success' && (
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
};
