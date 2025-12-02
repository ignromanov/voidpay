# Active Context

**Last Updated**: 2025-12-02
**Current Session**: 012-landing-page — Visual fixes and animations

## Session Summary

Fixed browser and visual issues to match design v3:

### Changes Made (2025-12-02):

1. **Navigation widget** (`widgets/navigation/Navigation.tsx`):
   - Added VoidLogo icon next to brand name
   - Updated nav links: Home, History, Blocked (red with ShieldAlert icon)
   - Added separator + Create button with Plus icon
   - Added GitHub icon link
   - Added Connect wallet button with Wallet icon
   - Sticky header with backdrop blur

2. **Footer widget** (NEW: `widgets/footer/`):
   - Copyright © 2024 VoidPay Protocol
   - Privacy and Terms links
   - Support VoidPay button with Heart icon
   - GitHub and Twitter social links
   - Added to RootLayout

3. **DemoSection animations** (`widgets/landing/demo-section/`):
   - AnimatePresence for invoice card transitions (fade + slide)
   - Network-colored background glow (ETH=blue, ARB=cyan, OP=red)
   - White paper invoice (removed colored borders)
   - Dark text for light background

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