/**
 * ×1.2 Tailwind cascade for 16:9 landscape ShareScene.
 * Anchored to PaymentPanel baseline + 20% uplift, matching LandscapeCreateCascade scale.
 * Applied to .remotion-share-landscape wrapper in ShareSceneLandscape.tsx.
 */
export const LandscapeShareCascade: React.FC = () => (
  <style>{`
    .remotion-share-landscape .text-xs,
    .remotion-share-landscape [class*="text-[10px]"],
    .remotion-share-landscape [class*="text-[11px]"]  { font-size: 28px !important; line-height: 1.4 !important; }
    .remotion-share-landscape .text-sm                { font-size: 32px !important; line-height: 1.45 !important; }
    .remotion-share-landscape .text-base              { font-size: 40px !important; line-height: 1.5 !important; }
    .remotion-share-landscape .text-lg                { font-size: 44px !important; line-height: 1.5 !important; }
    .remotion-share-landscape .text-xl                { font-size: 48px !important; line-height: 1.4 !important; }
    .remotion-share-landscape .text-2xl               { font-size: 58px !important; line-height: 1.3 !important; }

    /* Form control heights */
    .remotion-share-landscape .h-7  { height: 56px !important; }
    .remotion-share-landscape .h-8  { height: 56px !important; }
    .remotion-share-landscape .h-9  { height: 56px !important; }
    .remotion-share-landscape .h-10 { height: 64px !important; }
    .remotion-share-landscape .h-11 { height: 72px !important; }
    .remotion-share-landscape .h-14 { height: 72px !important; }

    /* Icon dimensions */
    .remotion-share-landscape .w-3 { width: 28px !important; }
    .remotion-share-landscape .h-3 { height: 28px !important; }
    .remotion-share-landscape .w-4 { width: 28px !important; }
    .remotion-share-landscape .h-4 { height: 28px !important; }
    .remotion-share-landscape .w-5 { width: 40px !important; }
    .remotion-share-landscape .h-5 { height: 40px !important; }
    .remotion-share-landscape .w-6 { width: 48px !important; }
    .remotion-share-landscape .h-6 { height: 48px !important; }

    /* Padding scale */
    .remotion-share-landscape .p-1    { padding: 8px !important; }
    .remotion-share-landscape .p-2    { padding: 16px !important; }
    .remotion-share-landscape .p-3    { padding: 24px !important; }
    .remotion-share-landscape .p-4    { padding: 32px !important; }
    .remotion-share-landscape .px-2   { padding-left: 16px !important; padding-right: 16px !important; }
    .remotion-share-landscape .px-3   { padding-left: 24px !important; padding-right: 24px !important; }
    .remotion-share-landscape .px-4   { padding-left: 32px !important; padding-right: 32px !important; }
    .remotion-share-landscape .py-1   { padding-top: 8px !important; padding-bottom: 8px !important; }
    .remotion-share-landscape .py-2   { padding-top: 16px !important; padding-bottom: 16px !important; }
    .remotion-share-landscape .py-2\\.5 { padding-top: 20px !important; padding-bottom: 20px !important; }
    .remotion-share-landscape .py-3   { padding-top: 24px !important; padding-bottom: 24px !important; }

    /* Gap scale */
    .remotion-share-landscape .gap-1  { gap: 8px !important; }
    .remotion-share-landscape .gap-2  { gap: 16px !important; }
    .remotion-share-landscape .gap-3  { gap: 24px !important; }
    .remotion-share-landscape .gap-4  { gap: 32px !important; }

    /* Border radius */
    .remotion-share-landscape .rounded-lg { border-radius: 16px !important; }
    .remotion-share-landscape .rounded-xl { border-radius: 24px !important; }

    /* SVGs via size={N} prop */
    .remotion-share-landscape svg[width="12"]  { width: 28px !important; height: 28px !important; }
    .remotion-share-landscape svg[height="12"] { width: 28px !important; height: 28px !important; }
    .remotion-share-landscape svg[width="16"]  { width: 28px !important; height: 28px !important; }
    .remotion-share-landscape svg[height="16"] { width: 28px !important; height: 28px !important; }
    .remotion-share-landscape svg[width="20"]  { width: 40px !important; height: 40px !important; }
    .remotion-share-landscape svg[height="20"] { width: 40px !important; height: 40px !important; }
    .remotion-share-landscape svg[width="24"]  { width: 48px !important; height: 48px !important; }
    .remotion-share-landscape svg[height="24"] { width: 48px !important; height: 48px !important; }
  `}</style>
);
