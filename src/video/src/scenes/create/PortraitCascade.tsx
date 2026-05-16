/**
 * ×2 Tailwind cascade for 9:16 portrait — Mocks v2 density.
 * Extracted verbatim from CreateScene.tsx lines 478–590.
 */
export const PortraitCascade: React.FC = () => (
  <style>{`
    .remotion-create-portrait .text-xs,
    .remotion-create-portrait [class*="text-[10px]"],
    .remotion-create-portrait [class*="text-[11px]"]  { font-size: 24px !important; line-height: 1.4 !important; }
    .remotion-create-portrait .text-sm                { font-size: 28px !important; line-height: 1.45 !important; }
    .remotion-create-portrait .text-base              { font-size: 32px !important; line-height: 1.5 !important; }
    .remotion-create-portrait .text-lg                { font-size: 36px !important; line-height: 1.5 !important; }
    .remotion-create-portrait .text-xl                { font-size: 40px !important; line-height: 1.4 !important; }
    .remotion-create-portrait .text-2xl               { font-size: 48px !important; line-height: 1.3 !important; }
    .remotion-create-portrait .text-3xl               { font-size: 60px !important; line-height: 1.2 !important; }
    .remotion-create-portrait .text-4xl               { font-size: 72px !important; line-height: 1.1 !important; }

    /* Form control heights */
    .remotion-create-portrait .h-7  { height: 56px !important; }
    .remotion-create-portrait .h-8  { height: 64px !important; }
    .remotion-create-portrait .h-9  { height: 72px !important; }
    .remotion-create-portrait .h-10 { height: 80px !important; }
    .remotion-create-portrait .h-11 { height: 88px !important; }
    /* D22: Generate button uses h-14 (56px) — scale to 112px for 2× portrait density */
    .remotion-create-portrait .h-14 { height: 112px !important; }

    /* Icon dimensions (lucide-react svg via w-N/h-N) */
    .remotion-create-portrait .w-3 { width: 24px !important; }
    .remotion-create-portrait .h-3 { height: 24px !important; }
    .remotion-create-portrait .w-4 { width: 32px !important; }
    .remotion-create-portrait .h-4 { height: 32px !important; }
    .remotion-create-portrait .w-5 { width: 40px !important; }
    .remotion-create-portrait .h-5 { height: 40px !important; }
    .remotion-create-portrait .w-6 { width: 48px !important; }
    .remotion-create-portrait .h-6 { height: 48px !important; }

    /* Padding scale-up (common form classes) */
    .remotion-create-portrait .p-0\\.5 { padding: 4px !important; }
    .remotion-create-portrait .p-1    { padding: 8px !important; }
    .remotion-create-portrait .p-1\\.5 { padding: 12px !important; }
    .remotion-create-portrait .p-2    { padding: 16px !important; }
    .remotion-create-portrait .p-3    { padding: 24px !important; }
    .remotion-create-portrait .p-4    { padding: 32px !important; }
    .remotion-create-portrait .px-2   { padding-left: 16px !important; padding-right: 16px !important; }
    .remotion-create-portrait .px-3   { padding-left: 24px !important; padding-right: 24px !important; }
    .remotion-create-portrait .py-1   { padding-top: 8px !important; padding-bottom: 8px !important; }
    .remotion-create-portrait .py-2   { padding-top: 16px !important; padding-bottom: 16px !important; }
    .remotion-create-portrait .py-2\\.5 { padding-top: 20px !important; padding-bottom: 20px !important; }
    .remotion-create-portrait .py-3   { padding-top: 24px !important; padding-bottom: 24px !important; }
    .remotion-create-portrait .pt-2   { padding-top: 16px !important; }
    .remotion-create-portrait .pt-4   { padding-top: 32px !important; }

    /* Gap scale-up */
    .remotion-create-portrait .gap-1   { gap: 8px !important; }
    .remotion-create-portrait .gap-1\\.5 { gap: 12px !important; }
    .remotion-create-portrait .gap-2   { gap: 16px !important; }
    .remotion-create-portrait .gap-3   { gap: 24px !important; }
    .remotion-create-portrait .gap-4   { gap: 32px !important; }

    /* Border radius — keep visually proportional */
    .remotion-create-portrait .rounded-lg { border-radius: 16px !important; }
    .remotion-create-portrait .rounded-xl { border-radius: 24px !important; }

    /* D3: CalendarIcon in date label uses inline size={12} (not Tailwind class) —
       scale SVGs inside text-[10px] label spans to match cascade ×2 density */
    .remotion-create-portrait [class*="text-[10px]"] svg { width: 24px !important; height: 24px !important; }

    /* D15: Icons using size={N} prop render SVG width/height attributes directly —
       not caught by Tailwind class cascade above. Scale ×2 for portrait density.
       Covers: CoinsIcon(16), FingerprintIcon(16), AlertCircleIcon(12),
               NetworkIcon(24), TokenIcon(24), Share2Icon(20), ArrowRightIcon(16),
               Loader2Icon via h-5/w-5 (already covered above). */
    .remotion-create-portrait svg[width="12"]  { width: 24px !important; height: 24px !important; }
    .remotion-create-portrait svg[height="12"] { width: 24px !important; height: 24px !important; }
    .remotion-create-portrait svg[width="16"]  { width: 32px !important; height: 32px !important; }
    .remotion-create-portrait svg[height="16"] { width: 32px !important; height: 32px !important; }
    .remotion-create-portrait svg[width="20"]  { width: 40px !important; height: 40px !important; }
    .remotion-create-portrait svg[height="20"] { width: 40px !important; height: 40px !important; }
    .remotion-create-portrait svg[width="24"]  { width: 48px !important; height: 48px !important; }
    .remotion-create-portrait svg[height="24"] { width: 48px !important; height: 48px !important; }

    /* D23: animate-spin is a CSS keyframe — uncontrolled in Remotion (appears very fast).
       Nullify it and replace with frame-driven rotation via CSS custom property
       --remotion-spin injected on the wrapper div when isGenerating.
       Rate: frame*8 = 240deg/s @ 30fps ≈ 1.5s/rev, matching production animate-spin. */
    .remotion-create-portrait .animate-spin {
      animation: none !important;
      transform: rotate(var(--remotion-spin, 0deg)) !important;
    }

    /* D30/D43: Switch toggle — track pill + thumb position.
       Track: w-10→80px wide, h-5→40px tall (proper 2:1 pill)
       Thumb: w-4→32px, h-4→32px (covered by icon cascade above)
       ON: translateX(44px) = 80 - 32 - 2(right) - 2(left-0.5) = 44
       OFF: translateX(0px) — left-0.5 (2px) handles left inset naturally
       D43: explicit bg-color on track — Tailwind bg-violet-600/bg-zinc-700
       classes may lose to cascade; force directly on aria-checked attribute. */
    .remotion-create-portrait .w-10 { width: 80px !important; }
    .remotion-create-portrait [role="switch"] {
      transition: none !important;
      border-radius: 9999px !important;
    }
    .remotion-create-portrait [role="switch"][aria-checked="true"] {
      background: rgb(124, 58, 237) !important;
    }
    .remotion-create-portrait [role="switch"][aria-checked="false"] {
      background: rgb(63, 63, 70) !important;
    }
    .remotion-create-portrait [role="switch"] span {
      transition: none !important;
    }
    .remotion-create-portrait [role="switch"][aria-checked="true"] span {
      transform: translateX(44px) !important;
    }
    .remotion-create-portrait [role="switch"][aria-checked="false"] span {
      transform: translateX(0px) !important;
    }
  `}</style>
);
