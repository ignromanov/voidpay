/** Frame-driven panel cascade style — kills CSS animations and injects per-frame rotation.
 *  MUST be a React component (not a static string) because transform: rotate(${frame * 8}deg)
 *  changes every frame. */
export const PanelCascadeStyle: React.FC<{ frame: number }> = ({ frame }) => (
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
