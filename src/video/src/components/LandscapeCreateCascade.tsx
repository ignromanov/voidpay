/**
 * ×1.2 Tailwind cascade for 16:9 landscape CreateScene.
 * Anchored to PaymentPanel baseline (PanelCascadeStyle.tsx) + 20% uplift.
 * Target: text-base body → 40px, form inputs → 56px, Generate button → 72px.
 *
 * Applied to .remotion-create-landscape wrapper in CreateSceneLandscape.tsx.
 */
export const LandscapeCreateCascade: React.FC = () => (
  <style>{`
    .remotion-create-landscape .text-xs,
    .remotion-create-landscape [class*="text-[10px]"],
    .remotion-create-landscape [class*="text-[11px]"]  { font-size: 28px !important; line-height: 1.4 !important; }
    .remotion-create-landscape .text-sm                { font-size: 32px !important; line-height: 1.45 !important; }
    .remotion-create-landscape .text-base              { font-size: 40px !important; line-height: 1.5 !important; }
    .remotion-create-landscape .text-lg                { font-size: 44px !important; line-height: 1.5 !important; }
    .remotion-create-landscape .text-xl                { font-size: 48px !important; line-height: 1.4 !important; }
    .remotion-create-landscape .text-2xl               { font-size: 58px !important; line-height: 1.3 !important; }

    /* Form control heights — PaymentPanel h-14=112px baseline ×1.2 → 72px for h-9 (close to brief 56px target) */
    .remotion-create-landscape .h-7  { height: 56px !important; }
    .remotion-create-landscape .h-8  { height: 56px !important; }
    .remotion-create-landscape .h-9  { height: 56px !important; }
    .remotion-create-landscape .h-10 { height: 64px !important; }
    .remotion-create-landscape .h-11 { height: 72px !important; }
    .remotion-create-landscape .h-14 { height: 72px !important; }

    /* Icon dimensions */
    .remotion-create-landscape .w-3 { width: 28px !important; }
    .remotion-create-landscape .h-3 { height: 28px !important; }
    .remotion-create-landscape .w-4 { width: 28px !important; }
    .remotion-create-landscape .h-4 { height: 28px !important; }
    .remotion-create-landscape .w-5 { width: 40px !important; }
    .remotion-create-landscape .h-5 { height: 40px !important; }
    .remotion-create-landscape .w-6 { width: 48px !important; }
    .remotion-create-landscape .h-6 { height: 48px !important; }

    /* Padding scale */
    .remotion-create-landscape .p-0\\.5 { padding: 4px !important; }
    .remotion-create-landscape .p-1    { padding: 8px !important; }
    .remotion-create-landscape .p-1\\.5 { padding: 12px !important; }
    .remotion-create-landscape .p-2    { padding: 16px !important; }
    .remotion-create-landscape .p-3    { padding: 24px !important; }
    .remotion-create-landscape .p-4    { padding: 32px !important; }
    .remotion-create-landscape .px-2   { padding-left: 16px !important; padding-right: 16px !important; }
    .remotion-create-landscape .px-3   { padding-left: 24px !important; padding-right: 24px !important; }
    .remotion-create-landscape .py-1   { padding-top: 8px !important; padding-bottom: 8px !important; }
    .remotion-create-landscape .py-2   { padding-top: 16px !important; padding-bottom: 16px !important; }
    .remotion-create-landscape .py-2\\.5 { padding-top: 20px !important; padding-bottom: 20px !important; }
    .remotion-create-landscape .py-3   { padding-top: 24px !important; padding-bottom: 24px !important; }
    .remotion-create-landscape .pt-2   { padding-top: 16px !important; }
    .remotion-create-landscape .pt-4   { padding-top: 32px !important; }

    /* Gap scale */
    .remotion-create-landscape .gap-1   { gap: 8px !important; }
    .remotion-create-landscape .gap-1\\.5 { gap: 12px !important; }
    .remotion-create-landscape .gap-2   { gap: 16px !important; }
    .remotion-create-landscape .gap-3   { gap: 24px !important; }
    .remotion-create-landscape .gap-4   { gap: 32px !important; }

    /* Border radius */
    .remotion-create-landscape .rounded-lg { border-radius: 16px !important; }
    .remotion-create-landscape .rounded-xl { border-radius: 24px !important; }

    /* SVGs via size={N} prop — scale icons to match cascade */
    .remotion-create-landscape [class*="text-[10px]"] svg { width: 28px !important; height: 28px !important; }
    .remotion-create-landscape svg[width="12"]  { width: 28px !important; height: 28px !important; }
    .remotion-create-landscape svg[height="12"] { width: 28px !important; height: 28px !important; }
    .remotion-create-landscape svg[width="16"]  { width: 28px !important; height: 28px !important; }
    .remotion-create-landscape svg[height="16"] { width: 28px !important; height: 28px !important; }
    .remotion-create-landscape svg[width="20"]  { width: 40px !important; height: 40px !important; }
    .remotion-create-landscape svg[height="20"] { width: 40px !important; height: 40px !important; }
    .remotion-create-landscape svg[width="24"]  { width: 48px !important; height: 48px !important; }
    .remotion-create-landscape svg[height="24"] { width: 48px !important; height: 48px !important; }

    /* Switch toggle — track + thumb */
    .remotion-create-landscape .w-10 { width: 80px !important; }
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
      transform: translateX(44px) !important;
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
