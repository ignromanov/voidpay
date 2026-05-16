import { PaymentPanel } from "@/widgets/payment-panel";
import { SmartPayButtonView } from "@/features/payment";
import type { PaymentStep, IdleSubState } from "@/features/payment";
import { DEMO_INVOICE, DEMO_CONTENT_HASH } from "../../constants/demo-invoice";
import { pressScale } from "./phases";

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
}) => (
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
