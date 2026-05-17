/**
 * ×0.85 Tailwind cascade for 16:9 landscape CreateScene.
 * R14-A: ratio reduced 1.2 → 0.85 (all values × 0.71 from prior ×1.2 state).
 * Target: text-base body → 28px, form inputs → 40px, Generate button → 51px.
 *
 * Applied to .remotion-create-landscape wrapper in CreateSceneLandscape.tsx
 * (form block only — invoice paper does not receive this cascade).
 */
export const LandscapeCreateCascade: React.FC = () => (
  <style>{`
    .remotion-create-landscape .text-xs,
    .remotion-create-landscape [class*="text-[10px]"],
    .remotion-create-landscape [class*="text-[11px]"]  { font-size: 20px !important; line-height: 1.4 !important; }
    .remotion-create-landscape .text-sm                { font-size: 23px !important; line-height: 1.45 !important; }
    .remotion-create-landscape .text-base              { font-size: 28px !important; line-height: 1.5 !important; }
    .remotion-create-landscape .text-lg                { font-size: 31px !important; line-height: 1.5 !important; }
    .remotion-create-landscape .text-xl                { font-size: 34px !important; line-height: 1.4 !important; }
    .remotion-create-landscape .text-2xl               { font-size: 41px !important; line-height: 1.3 !important; }

    /* Form control heights — ×0.85 from Tailwind base */
    .remotion-create-landscape .h-7  { height: 40px !important; }
    .remotion-create-landscape .h-8  { height: 40px !important; }
    .remotion-create-landscape .h-9  { height: 40px !important; }
    .remotion-create-landscape .h-10 { height: 45px !important; }
    .remotion-create-landscape .h-11 { height: 51px !important; }
    .remotion-create-landscape .h-14 { height: 51px !important; }

    /* Icon dimensions */
    .remotion-create-landscape .w-3 { width: 20px !important; }
    .remotion-create-landscape .h-3 { height: 20px !important; }
    .remotion-create-landscape .w-4 { width: 20px !important; }
    .remotion-create-landscape .h-4 { height: 20px !important; }
    .remotion-create-landscape .w-5 { width: 28px !important; }
    .remotion-create-landscape .h-5 { height: 28px !important; }
    .remotion-create-landscape .w-6 { width: 34px !important; }
    .remotion-create-landscape .h-6 { height: 34px !important; }

    /* Padding scale */
    .remotion-create-landscape .p-0\\.5 { padding: 3px !important; }
    .remotion-create-landscape .p-1    { padding: 6px !important; }
    .remotion-create-landscape .p-1\\.5 { padding: 9px !important; }
    .remotion-create-landscape .p-2    { padding: 11px !important; }
    .remotion-create-landscape .p-3    { padding: 17px !important; }
    .remotion-create-landscape .p-4    { padding: 23px !important; }
    .remotion-create-landscape .px-2   { padding-left: 11px !important; padding-right: 11px !important; }
    .remotion-create-landscape .px-3   { padding-left: 17px !important; padding-right: 17px !important; }
    .remotion-create-landscape .py-1   { padding-top: 6px !important; padding-bottom: 6px !important; }
    .remotion-create-landscape .py-2   { padding-top: 11px !important; padding-bottom: 11px !important; }
    .remotion-create-landscape .py-2\\.5 { padding-top: 14px !important; padding-bottom: 14px !important; }
    .remotion-create-landscape .py-3   { padding-top: 17px !important; padding-bottom: 17px !important; }
    .remotion-create-landscape .pt-2   { padding-top: 11px !important; }
    .remotion-create-landscape .pt-4   { padding-top: 23px !important; }

    /* Gap scale */
    .remotion-create-landscape .gap-1   { gap: 6px !important; }
    .remotion-create-landscape .gap-1\\.5 { gap: 9px !important; }
    .remotion-create-landscape .gap-2   { gap: 11px !important; }
    .remotion-create-landscape .gap-3   { gap: 17px !important; }
    .remotion-create-landscape .gap-4   { gap: 23px !important; }

    /* Border radius */
    .remotion-create-landscape .rounded-lg { border-radius: 11px !important; }
    .remotion-create-landscape .rounded-xl { border-radius: 17px !important; }

    /* SVGs via size={N} prop — R14-A icon harmonisation:
       Arbitrum (size=16) + USDC (size=16) + MagicDust (size=24) all render equal at 34px. */
    .remotion-create-landscape [class*="text-[10px]"] svg { width: 20px !important; height: 20px !important; }
    .remotion-create-landscape svg[width="12"]  { width: 20px !important; height: 20px !important; }
    .remotion-create-landscape svg[height="12"] { width: 20px !important; height: 20px !important; }
    .remotion-create-landscape svg[width="16"]  { width: 34px !important; height: 34px !important; }
    .remotion-create-landscape svg[height="16"] { width: 34px !important; height: 34px !important; }
    .remotion-create-landscape svg[width="20"]  { width: 34px !important; height: 34px !important; }
    .remotion-create-landscape svg[height="20"] { width: 34px !important; height: 34px !important; }
    .remotion-create-landscape svg[width="24"]  { width: 34px !important; height: 34px !important; }
    .remotion-create-landscape svg[height="24"] { width: 34px !important; height: 34px !important; }

    /* Switch toggle — track + thumb */
    .remotion-create-landscape .w-10 { width: 57px !important; }
    .remotion-create-landscape [role="switch"] {
      transition: none !important;
      border-radius: 9999px !important;
    }
    .remotion-create-landscape [role="switch"][aria-checked="true"] {
      background: rgb(124, 58, 237) !important;
    }
    .remotion-create-landscape [role="switch"][aria-checked="false"] {
      background: rgb(63, 63, 70) !important;
    }
    .remotion-create-landscape [role="switch"] span {
      transition: none !important;
    }
    .remotion-create-landscape [role="switch"][aria-checked="true"] span {
      transform: translateX(31px) !important;
    }
    .remotion-create-landscape [role="switch"][aria-checked="false"] span {
      transform: translateX(0px) !important;
    }

    /* animate-spin nullification — Remotion CSS keyframes are uncontrolled */
    .remotion-create-landscape .animate-spin {
      animation: none !important;
      transform: rotate(var(--remotion-spin, 0deg)) !important;
    }
  `}</style>
);
