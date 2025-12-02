# Active Context

**Last Updated**: 2025-12-02
**Current Session**: 012-landing-page — NetworkBackground and theme sync

## Session Summary

### Changes Made (2025-12-02 - Latest):

1. **VoidLogo redesign** (`shared/ui/void-logo.tsx`):
   - Changed from crescent moon to black hole design
   - Black center (#09090B / #000000) with subtle violet glow (#7C3AED)
   - Thin 1.5px violet border with soft blur filter
   - New animation: `animate-blackhole-pulse` (subtle drop-shadow pulsing)

2. **Social Images** (`app/`):
   - `icon.tsx` — 32x32 favicon with black hole
   - `apple-icon.tsx` — 180x180 Apple Touch Icon
   - `opengraph-image.tsx` — 1200x630 OG image
   - `twitter-image.tsx` — 1200x600 Twitter Card
   - All using consistent black hole + VoidPay branding

3. **CSS Animation** (`app/globals.css`):
   - Added `--animate-blackhole-pulse` with subtle violet glow pulse

### Previous Session (2025-12-02):

Implemented network-themed background animations and synced network highlighting:

### Changes Made (2025-12-02):

1. **NetworkBackground widget** (`widgets/network-background/`):
   - 2 large floating shapes on left/right sides (65-70% viewport height)
   - Network-specific shapes: rhombus (ETH), triangle (ARB), circle (OP), hexagon (Polygon)
   - Slow horizontal drift animation with subtle glow (opacity 0.12-0.22)
   - AnimatePresence for smooth 1.5s theme transitions
   - Respects prefers-reduced-motion accessibility

2. **NetworkThemeContext** (`widgets/landing/context/`):
   - React Context to sync active network between DemoSection and background
   - Consumed by: NetworkBackground, HeroSection, DemoSection

3. **LandingContent wrapper** (`widgets/landing/ui/LandingContent.tsx`):
   - Wraps landing sections with NetworkThemeProvider
   - Provides network theme context to all child components

4. **HeroSection network badges** (`widgets/landing/hero-section/`):
   - Added Polygon network to supported networks list
   - Network badges highlight when active (opacity 0.85 vs 0.45)
   - Subtle animation sync with DemoSection network selection

5. **Shape clipPaths** (`widgets/network-background/shapes.tsx`):
   - Ethereum: tall diamond crystal (polygon 50% 0%, 85% 45%, 50% 100%, 15% 45%)
   - Arbitrum: triangle (polygon 50% 0%, 100% 100%, 0% 100%)
   - Optimism: circle (border-radius 50%)
   - Polygon: hexagon (6-point polygon)

### Previous Session (2025-12-01):

### Changes Made:
1. **Button component** (`shared/ui/button.tsx`):
   - Added `glow` variant with violet glow effects and hover animations
   - Updated `lg` size to h-12 with rounded-2xl
   - Updated `outline` variant with proper zinc border colors

2. **HeroSection** (`widgets/landing/hero-section/`):
   - Added beta badge with pulsing indicator animation
   - Added background glow element (800px violet blur)
   - Framer Motion entrance animations
   - Two-line headline: "The Stateless" / "Crypto Invoice." with AuroraText
   - Updated value proposition with on-chain business emphasis
   - Primary CTA with glow variant and ArrowRight icon (h-14)
   - Secondary "View Gallery" button with outline variant
   - Network badges with grayscale hover effect

3. **HowItWorks** (`widgets/landing/how-it-works/`):
   - Large background step numbers (100px mobile, 150px desktop)
   - Violet icon containers (w-16 h-16 rounded-2xl bg-violet-600)
   - Updated icons: MousePointerClick, Share2, Wallet from lucide-react
   - Section with border-t border-zinc-900 and py-40 spacing

4. **WhyVoidPay** (`widgets/landing/why-voidpay/`):
   - Colored icons per card: violet, cyan, emerald, pink, yellow, orange
   - Icon containers with bg-zinc-950 border border-zinc-800
   - Hover effects: scale icon, border color change
   - Left-aligned header on desktop with max-w-2xl subtitle
   - Grid gap-8 spacing

5. **FooterCta** (`widgets/landing/footer-cta/`):
   - Gradient background: from-transparent to-violet-950/30
   - Hero-sized heading (text-4xl md:text-6xl)
   - Larger CTA button (h-16) with stronger shadow glow

6. **DemoSection** (`widgets/landing/demo-section/`):
   - A4 dimensions (794×1123px) with responsive scaling
   - Deep shadow: shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)]
   - Background glow with violet/indigo gradient
   - "Use This Template" button with glow variant on hover

7. **Page ordering** (`app/page.tsx`):
   - Updated section order: Hero → Demo → HowItWorks → WhyVoidPay → FooterCta

### Validation:
- `pnpm type-check` passes
- `pnpm lint` passes