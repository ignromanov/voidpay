/**
 * ×1.7 Tailwind cascade for 16:9 landscape CreateScene.
 * Scaled from ×1.2 baseline by ratio 17/12 ≈ 1.4167.
 * Target: text-base body → 57px, form inputs → 79px, Generate button → 102px.
 *
 * Applied to .remotion-create-landscape wrapper in CreateSceneLandscape.tsx
 * (form block only — invoice paper does not receive this cascade).
 */
export const LandscapeCreateCascade: React.FC = () => (
  <style>{`
    .remotion-create-landscape .text-xs,
    .remotion-create-landscape [class*="text-[10px]"],
    .remotion-create-landscape [class*="text-[11px]"]  { font-size: 40px !important; line-height: 1.4 !important; }
    .remotion-create-landscape .text-sm                { font-size: 45px !important; line-height: 1.45 !important; }
    .remotion-create-landscape .text-base              { font-size: 57px !important; line-height: 1.5 !important; }
    .remotion-create-landscape .text-lg                { font-size: 62px !important; line-height: 1.5 !important; }
    .remotion-create-landscape .text-xl                { font-size: 68px !important; line-height: 1.4 !important; }
    .remotion-create-landscape .text-2xl               { font-size: 82px !important; line-height: 1.3 !important; }

    /* Form control heights — scaled from ×1.2 baseline by 17/12 */
    .remotion-create-landscape .h-7  { height: 79px !important; }
    .remotion-create-landscape .h-8  { height: 79px !important; }
    .remotion-create-landscape .h-9  { height: 79px !important; }
    .remotion-create-landscape .h-10 { height: 91px !important; }
    .remotion-create-landscape .h-11 { height: 102px !important; }
    .remotion-create-landscape .h-14 { height: 102px !important; }

    /* Icon dimensions */
    .remotion-create-landscape .w-3 { width: 40px !important; }
    .remotion-create-landscape .h-3 { height: 40px !important; }
    .remotion-create-landscape .w-4 { width: 40px !important; }
    .remotion-create-landscape .h-4 { height: 40px !important; }
    .remotion-create-landscape .w-5 { width: 57px !important; }
    .remotion-create-landscape .h-5 { height: 57px !important; }
    .remotion-create-landscape .w-6 { width: 68px !important; }
    .remotion-create-landscape .h-6 { height: 68px !important; }

    /* Padding scale */
    .remotion-create-landscape .p-0\\.5 { padding: 6px !important; }
    .remotion-create-landscape .p-1    { padding: 11px !important; }
    .remotion-create-landscape .p-1\\.5 { padding: 17px !important; }
    .remotion-create-landscape .p-2    { padding: 23px !important; }
    .remotion-create-landscape .p-3    { padding: 34px !important; }
    .remotion-create-landscape .p-4    { padding: 45px !important; }
    .remotion-create-landscape .px-2   { padding-left: 23px !important; padding-right: 23px !important; }
    .remotion-create-landscape .px-3   { padding-left: 34px !important; padding-right: 34px !important; }
    .remotion-create-landscape .py-1   { padding-top: 11px !important; padding-bottom: 11px !important; }
    .remotion-create-landscape .py-2   { padding-top: 23px !important; padding-bottom: 23px !important; }
    .remotion-create-landscape .py-2\\.5 { padding-top: 28px !important; padding-bottom: 28px !important; }
    .remotion-create-landscape .py-3   { padding-top: 34px !important; padding-bottom: 34px !important; }
    .remotion-create-landscape .pt-2   { padding-top: 23px !important; }
    .remotion-create-landscape .pt-4   { padding-top: 45px !important; }

    /* Gap scale */
    .remotion-create-landscape .gap-1   { gap: 11px !important; }
    .remotion-create-landscape .gap-1\\.5 { gap: 17px !important; }
    .remotion-create-landscape .gap-2   { gap: 23px !important; }
    .remotion-create-landscape .gap-3   { gap: 34px !important; }
    .remotion-create-landscape .gap-4   { gap: 45px !important; }

    /* Border radius */
    .remotion-create-landscape .rounded-lg { border-radius: 23px !important; }
    .remotion-create-landscape .rounded-xl { border-radius: 34px !important; }

    /* SVGs via size={N} prop — scale icons to match cascade */
    .remotion-create-landscape [class*="text-[10px]"] svg { width: 40px !important; height: 40px !important; }
    .remotion-create-landscape svg[width="12"]  { width: 40px !important; height: 40px !important; }
    .remotion-create-landscape svg[height="12"] { width: 40px !important; height: 40px !important; }
    .remotion-create-landscape svg[width="16"]  { width: 40px !important; height: 40px !important; }
    .remotion-create-landscape svg[height="16"] { width: 40px !important; height: 40px !important; }
    .remotion-create-landscape svg[width="20"]  { width: 57px !important; height: 57px !important; }
    .remotion-create-landscape svg[height="20"] { width: 57px !important; height: 57px !important; }
    .remotion-create-landscape svg[width="24"]  { width: 68px !important; height: 68px !important; }
    .remotion-create-landscape svg[height="24"] { width: 68px !important; height: 68px !important; }

    /* Switch toggle — track + thumb */
    .remotion-create-landscape .w-10 { width: 113px !important; }
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
      transform: translateX(62px) !important;
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
