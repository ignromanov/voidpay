import { InvoiceSummary } from "@/widgets/share-modal";
import { DEMO_INVOICE } from "../../constants/demo-invoice";

/**
 * CSS cascade overrides for InvoiceSummary inside the Share modal.
 * Two variants: portrait (9:16) and landscape (16:9) — differ in font-size scale.
 *
 * D6: cascade overrides for amount sum (text-base/lg→36px) + network chip (text-xs→22px).
 * F4.2: sub-line text min 24px for 9:16 legibility.
 */

export const SummaryCascadePortrait: React.FC = () => (
  <div className="remotion-summary-override">
    <style>{`
      .remotion-summary-override .text-base,
      .remotion-summary-override .text-lg { font-size: 36px !important; line-height: 1.2 !important; }
      .remotion-summary-override .font-mono { font-family: monospace !important; }
      .remotion-summary-override .font-extrabold { font-weight: 800 !important; }
      .remotion-summary-override .tabular-nums { font-variant-numeric: tabular-nums !important; }
      .remotion-summary-override .text-zinc-100 { color: #f4f4f5 !important; }
      .remotion-summary-override .text-xs { font-size: 22px !important; line-height: 1.4 !important; }
      .remotion-summary-override .text-zinc-500 { color: #a1a1aa !important; }
      .remotion-summary-override .text-violet-400 { color: #a78bfa !important; }
      .remotion-summary-override .bg-violet-500\\/10 { background-color: rgba(139,92,246,0.15) !important; }
      .remotion-summary-override .px-1\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
      .remotion-summary-override .py-0\\.5 { padding-top: 4px !important; padding-bottom: 4px !important; }
      .remotion-summary-override .rounded { border-radius: 6px !important; }
      .remotion-summary-override .font-semibold { font-weight: 600 !important; }
      .remotion-summary-override .gap-2 { gap: 16px !important; }
      .remotion-summary-override .px-3 { padding-left: 24px !important; padding-right: 24px !important; }
      .remotion-summary-override .py-2\\.5 { padding-top: 18px !important; padding-bottom: 18px !important; }
      .remotion-summary-override .sm\\:px-4 { padding-left: 28px !important; padding-right: 28px !important; }
      .remotion-summary-override .sm\\:py-3 { padding-top: 20px !important; padding-bottom: 20px !important; }
      .remotion-summary-override .gap-3 { gap: 18px !important; }
      .remotion-summary-override .rounded-lg { border-radius: 12px !important; }
    `}</style>
    <InvoiceSummary invoice={DEMO_INVOICE} />
  </div>
);

export const SummaryCascadeLandscape: React.FC = () => (
  <div className="remotion-summary-override remotion-summary-landscape">
    <style>{`
      .remotion-summary-landscape .text-base,
      .remotion-summary-landscape .text-lg { font-size: 22px !important; line-height: 1.2 !important; }
      .remotion-summary-landscape .font-mono { font-family: monospace !important; }
      .remotion-summary-landscape .font-extrabold { font-weight: 800 !important; }
      .remotion-summary-landscape .tabular-nums { font-variant-numeric: tabular-nums !important; }
      .remotion-summary-landscape .text-zinc-100 { color: #f4f4f5 !important; }
      .remotion-summary-landscape .text-xs { font-size: 14px !important; line-height: 1.4 !important; }
      .remotion-summary-landscape .text-zinc-500 { color: #a1a1aa !important; }
      .remotion-summary-landscape .text-violet-400 { color: #a78bfa !important; }
      .remotion-summary-landscape .bg-violet-500\\/10 { background-color: rgba(139,92,246,0.15) !important; }
      .remotion-summary-landscape .px-1\\.5 { padding-left: 6px !important; padding-right: 6px !important; }
      .remotion-summary-landscape .py-0\\.5 { padding-top: 3px !important; padding-bottom: 3px !important; }
      .remotion-summary-landscape .rounded { border-radius: 6px !important; }
      .remotion-summary-landscape .font-semibold { font-weight: 600 !important; }
      .remotion-summary-landscape .gap-2 { gap: 10px !important; }
      .remotion-summary-landscape .px-3 { padding-left: 14px !important; padding-right: 14px !important; }
      .remotion-summary-landscape .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
      .remotion-summary-landscape .sm\\:px-4 { padding-left: 16px !important; padding-right: 16px !important; }
      .remotion-summary-landscape .sm\\:py-3 { padding-top: 12px !important; padding-bottom: 12px !important; }
      .remotion-summary-landscape .gap-3 { gap: 12px !important; }
      .remotion-summary-landscape .rounded-lg { border-radius: 8px !important; }
    `}</style>
    <InvoiceSummary invoice={DEMO_INVOICE} />
  </div>
);
