import { ShieldCheckIcon } from "@/shared/ui/icons";

interface RemotionPaidConfirmationProgressProps {
  current: number;
  required: number;
}

/**
 * Round 9a: Remotion-safe reorg-progress overlay.
 * Forked from PaidConfirmation.tsx's confirming block — replaces
 * framer-motion `animate={{ width }}` with a plain style-driven bar
 * driven by frame-interpolated current/required values.
 *
 * Rendered as an absolute overlay over the PaymentPanel area during
 * PHASE_CONFIRMING so the production widget snapshot stays byte-identical.
 */
export function RemotionPaidConfirmationProgress({
  current,
  required,
}: RemotionPaidConfirmationProgressProps) {
  const progressPercent = Math.min((current / required) * 100, 100);

  return (
    <div
      style={{
        background: "rgba(23, 37, 84, 0.1)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: 8,
        padding: 12,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <span
        style={{
          padding: 6,
          background: "rgba(59, 130, 246, 0.1)",
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShieldCheckIcon size={16} style={{ color: "rgba(96, 165, 250, 1)" }} />
      </span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(147, 197, 253, 1)",
            }}
          >
            Protecting against chain reorgs
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "rgba(96, 165, 250, 1)",
            }}
          >
            {Math.floor(current)} / {required}
          </span>
        </div>
        {/* Plain style-driven bar — no framer-motion, no per-frame animation restart */}
        <div
          style={{
            width: "100%",
            height: 4,
            background: "rgba(23, 37, 84, 0.3)",
            borderRadius: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "rgba(59, 130, 246, 1)",
              borderRadius: 9999,
            }}
          />
        </div>
      </div>
    </div>
  );
}
