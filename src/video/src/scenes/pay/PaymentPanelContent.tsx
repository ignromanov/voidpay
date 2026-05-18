import { interpolate } from "remotion";
import { PaymentPanel } from "@/widgets/payment-panel";
import { SmartPayButtonView } from "@/features/payment/video-internals";
import type { PaymentStep, IdleSubState } from "@/features/payment";
import { DEMO_INVOICE, DEMO_CONTENT_HASH } from "../../constants/demo-invoice";
import { pressScale } from "./phases";
import { FINALIZE, PANEL_EXIT_START } from "./constants";

export const PaymentPanelContent: React.FC<{
  frame: number;
  step: PaymentStep;
  idleSubState: IdleSubState;
  panelStatus: "pending" | "confirming" | "paid";
  panelTxHash: string | undefined;
  confirmations: { current: number; required: number };
  ctaPressTriggerFrame: number;
}> = ({
  frame,
  step,
  idleSubState,
  panelStatus,
  panelTxHash,
  confirmations,
  ctaPressTriggerFrame,
}) => {
  // Double-tick blink: 8fr period pulse during FINALIZE→PANEL_EXIT_START window (~3 blinks at 30fps).
  const blinkOpacity =
    frame >= FINALIZE && frame < PANEL_EXIT_START
      ? interpolate(
          (frame - FINALIZE) % 8,
          [0, 4, 8],
          [1.0, 0.4, 1.0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;

  return (
    <div style={{ position: "relative" }}>
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
      {/* Double-tick blink overlay — targets the 48×48px checkmark badge (top-left of PaidConfirmation).
          Bounded to FINALIZE→PANEL_EXIT_START (frame 460–465, ~3 blinks). */}
      {frame >= FINALIZE && frame < PANEL_EXIT_START && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.15)",
            opacity: blinkOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
