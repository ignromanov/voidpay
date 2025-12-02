# Feature Specification: Landing Page (Marketing + SEO)

**Feature Branch**: `012-landing-page`
**Created**: 2025-12-01
**Updated**: 2025-12-01 (v2.0 — UX Audit Remediation)
**Status**: Updated
**Design Source of Truth**: `assets/aistudio/v3/` (pages/landing, widgets/landing)

_Note: Updated by `/speckit.specify` command per Constitutional Principle XIII (Feature Specification Workflow). This update addresses 36 failed and 20 partial items from UX Audit Report._

---

## Design System Reference

This section defines the pixel-perfect visual specifications from v3 design assets.

### Typography Scale

| Variant | Desktop | Tablet | Mobile | Weight | Line Height | Tracking |
|---------|---------|--------|--------|--------|-------------|----------|
| `hero` | 96px (text-8xl) | 72px (text-7xl) | 48px (text-5xl) | font-black (900) | 0.95 | tracking-tighter (-0.05em) |
| `h1` | 36px (text-4xl) | 36px | 30px (text-3xl) | font-black (900) | default | tracking-tighter |
| `h2` | 24px (text-2xl) | 24px | 24px | font-bold (700) | default | tracking-tight (-0.025em) |
| `h3` | 20px (text-xl) | 20px | 20px | font-bold (700) | default | tracking-tight |
| `h4` | 14px (text-sm) | 14px | 14px | font-bold (700) | default | tracking-widest (0.1em), uppercase |
| `large` | 20px (text-xl) | 20px | 18px (text-lg) | font-normal | relaxed (1.625) | default |
| `body` | 16px (text-base) | 16px | 16px | font-normal | relaxed | default |
| `small` | 14px (text-sm) | 14px | 14px | font-normal | default | default |

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | zinc-950 (#09090b) | Page background |
| `--text-primary` | white (#ffffff) | Headings, emphasis |
| `--text-secondary` | zinc-400 (#a1a1aa) | Body text |
| `--text-muted` | zinc-500 (#71717a) | Secondary info |
| `--accent-primary` | violet-600 (#7c3aed) | CTAs, highlights |
| `--accent-glow` | violet-500/30 | Shadow effects |
| `--border-subtle` | zinc-800 (#27272a) | Card borders |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| Section padding Y | py-24 (96px) / py-40 (160px) | Vertical rhythm between sections |
| Section padding X | px-4 (16px) mobile / px-6 (24px) desktop | Horizontal gutters |
| Component gap | gap-8 (32px) / gap-12 (48px) | Grid and flex gaps |
| Max content width | max-w-6xl (72rem/1152px) | Content container |

### Animation Specifications

| Animation | Duration | Easing | Trigger | Reduced Motion |
|-----------|----------|--------|---------|----------------|
| Page entrance (opacity + y) | 800ms | ease-out | On mount | Skip animation, show static |
| Badge entrance | 500ms (200ms delay) | ease-out | On mount | Skip animation |
| CTA entrance | 500ms (400ms delay) | ease-out | On mount | Skip animation |
| AuroraText gradient | 3s loop | linear | Always | Show static gradient |
| Invoice rotation | 10,000ms interval | n/a | Auto | Pause rotation |
| CSS transitions | 300ms | ease-out | Hover/focus | Reduce to 0ms |
| Void button spin (idle) | 6s loop | linear | Always | Pause |
| Void button spin (hover) | 2s loop | linear | Hover | Pause |

### Button Specifications

| Variant | Height | Padding | Border Radius | Shadow |
|---------|--------|---------|---------------|--------|
| `glow` size="lg" | h-14 (56px) / h-16 (64px) | px-8 / px-12 | rounded-2xl (16px) | shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] |
| `outline` size="lg" | h-14 (56px) | px-6 | rounded-2xl | none |
| `void` size="lg" | h-12 (48px) | px-6 | rounded-2xl | shadow-[0_0_35px_-5px_rgba(124,58,237,0.6)] |

### Invoice Paper Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Width | 794px | A4 at 96 DPI |
| Height | 1123px | A4 at 96 DPI (1:1.414 ratio) |
| Padding | p-12 (48px) | Internal content padding |
| Scaling algorithm | Responsive fit | Scales to 25%-85% based on viewport |
| Shadow | shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)] | Deep shadow for floating effect |

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - First Impression & Value Understanding (Priority: P1)

A first-time visitor arrives at VoidPay's landing page and immediately understands what the product does through visual design and clear messaging. The hero section with invoice paper visual communicates "crypto invoicing" without requiring text, while the tagline "No backend, no sign-up" reinforces the stateless privacy-first value proposition.

**Why this priority**: First impressions determine whether visitors stay or leave. The hero section is the single most important conversion element on the page. Without a compelling first impression, no other features matter.

**Independent Test**: Can be fully tested by loading the landing page URL and verifying the hero section renders with the animated invoice paper, headline, and value proposition text. Delivers immediate brand recognition and product understanding.

**Acceptance Scenarios**:

1. **Given** a user navigates to the root URL ("/"), **When** the page loads, **Then** they see a full-viewport hero section (min-h-[85vh]) with animated headline text, value proposition, and network trust signals.
2. **Given** a user views the hero section, **When** they read the headline "The Stateless Crypto Invoice" with AuroraText effect, **Then** the page displays headline containing "stateless" and "crypto invoice" with animated gradient text effect.
3. **Given** a user views the page on any device, **When** the hero renders, **Then** the content scales appropriately with typography following the responsive scale (hero: 48px mobile → 72px tablet → 96px desktop).
4. **Given** a user has "prefers-reduced-motion" enabled, **When** the page loads, **Then** animations are disabled and static content is displayed immediately.

---

### User Story 2 - Convert Interest to Action (Priority: P1)

A visitor who understands the product value wants to try it. They see a prominent "Start Invoicing" call-to-action button that takes them directly to the invoice creation page. No friction, no signup required.

**Why this priority**: The primary conversion goal of the landing page. A visitor understanding the product but unable to act immediately represents lost conversion. CTA visibility is critical.

**Independent Test**: Can be fully tested by clicking the primary CTA button and verifying navigation to /create route. Delivers frictionless onboarding.

**Acceptance Scenarios**:

1. **Given** a user views the hero section, **When** they look for a way to start, **Then** they see a prominent "Start Invoicing" button with `variant="glow"`, h-14 (56px) height, ArrowRight icon, and shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] glow effect.
2. **Given** a user clicks "Start Invoicing", **When** the navigation completes, **Then** they arrive at the invoice creation page (/create) via Next.js Link (instant navigation, no loading state required).
3. **Given** a user scrolls to the page footer, **When** they see the final CTA section, **Then** they can click "Create Free Invoice" button with `variant="glow"` size="lg", h-16 (64px) height, and stronger shadow glow.
4. **Given** a user hovers over a CTA button, **When** hover state activates, **Then** the button translates up (-0.5), shadow intensifies, and content scales to 0.95 with tracking-wide effect.

---

### User Story 3 - Feature Discovery & Trust Building (Priority: P2)

A visitor wants to learn more before committing. They scroll down to discover the "How It Works" section (3-step process) and the "Why VoidPay?" feature grid. This content builds confidence through clear explanation and trust signals (supported networks, key differentiators).

**Why this priority**: Some users need more information before converting. Feature discovery content provides the "second impression" that closes the deal for hesitant visitors.

**Independent Test**: Can be fully tested by scrolling the page and verifying feature sections render with correct content and visual hierarchy. Delivers trust and understanding.

**Acceptance Scenarios**:

1. **Given** a user scrolls past the hero section, **When** they view the "How It Works" section, **Then** they see 3 StepCards with:
   - Large background numbers (text-[100px] md:text-[150px])
   - Icon container: w-16 h-16 rounded-2xl bg-violet-600
   - Icons: w-8 h-8 in white (MousePointerClick, Share2, Wallet)
   - Step titles: Create, Share, Get Paid
2. **Given** a user continues scrolling, **When** they view the "Why VoidPay?" section, **Then** they see a 6-card feature grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8) with:
   - Icon container: w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800
   - Icon colors: violet-500, cyan-500, emerald-500, pink-500, yellow-500, orange-500
   - Cards: No Database, Multi-Chain, Immutable, Aesthetic First, Instant Pay, Open Standard
3. **Given** a user views the hero section, **When** they look at trust signals, **Then** they see supported network badges (Ethereum, Arbitrum, Optimism, Polygon) with:
   - Text: text-xs font-bold tracking-widest uppercase
   - Layout: flex gap-8, grayscale opacity-60 with hover:grayscale-0 transition

---

### User Story 4 - Interactive Demo Experience (Priority: P2)

A visitor wants to see the product in action before committing. They interact with the demo section where a sample invoice paper rotates through different networks (Ethereum, Arbitrum, Optimism), showcasing the visual design and network-adaptive theming.

**Why this priority**: Interactive demos significantly increase conversion by letting users "try before they buy." Shows real product capability, not just marketing claims.

**Independent Test**: Can be fully tested by viewing the demo section and verifying invoice rotation, "Use This Template" button functionality, and network background transitions. Delivers product demonstration.

**Acceptance Scenarios**:

1. **Given** a user views the demo section, **When** 10 seconds pass, **Then** the InvoicePaper component rotates to show a different network template (Ethereum → Arbitrum → Optimism → Polygon cycle) with CSS transition duration-300ms ease-out.
2. **Given** a user hovers over the demo invoice paper, **When** they see the overlay (bg-black/5), **Then** a "Use This Template" button appears with:
   - Scale compensation: button scales inversely to parent scale
   - Styling: bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-full font-bold
   - Animation: translate-y-4 → translate-y-0 on hover
3. **Given** a user clicks "Use This Template", **When** the navigation completes, **Then** they arrive at /create with the form pre-populated from `useCreatorStore.activeDraft` (network, sample items, amounts set by `createNewDraft` action).
4. **Given** the demo section renders, **When** it calculates scale, **Then** InvoicePaper uses responsive scaling (25%-85%) based on: `min(availableWidth/794, targetHeight/1123)`.

---

### User Story 5 - Mobile & Accessibility Experience (Priority: P3)

A visitor accesses VoidPay from a mobile device or uses assistive technology. The landing page adapts responsively, animations respect reduced-motion preferences, and all interactive elements are keyboard accessible.

**Why this priority**: Mobile users represent a significant traffic segment. Accessibility is both ethical and legally required for web applications.

**Independent Test**: Can be fully tested by resizing browser, enabling reduced motion in OS settings, and navigating via keyboard only. Delivers inclusive experience.

**Acceptance Scenarios**:

1. **Given** a user views the page on mobile (< 768px), **When** the layout renders, **Then**:
   - Hero min-height: 85vh
   - Typography scales down (hero: text-5xl, h1: text-3xl)
   - Feature grid: grid-cols-1
   - Section padding: px-4 (16px)
   - Invoice demo: scales to 25%-50% with 24px horizontal padding
2. **Given** a user has "prefers-reduced-motion" enabled, **When** the page loads, **Then**:
   - Framer Motion animations: skip (opacity:1, y:0 immediately)
   - AuroraText: show static gradient (no animation)
   - Invoice rotation: pause (show first template)
   - CSS transitions: reduce to 0ms
   - Void button spin: pause
3. **Given** a user navigates via keyboard only, **When** they tab through the page, **Then**:
   - Tab order: Hero CTA → Demo CTA (on hover) → Feature links → Footer CTA
   - Focus ring: focus-visible:ring-1 with violet-500 color
   - All buttons activatable via Enter/Space
   - No keyboard traps

---

### User Story 6 - SEO & Discoverability (Priority: P3)

Search engines crawl the landing page and index it for relevant keywords. The page has proper metadata, semantic HTML structure, and performs well in Core Web Vitals for SEO ranking signals.

**Why this priority**: Organic traffic is the primary growth channel for a privacy-focused product that cannot rely on tracking-based advertising. SEO is essential for long-term user acquisition.

**Independent Test**: Can be fully tested by verifying HTML source contains proper meta tags, semantic structure, and running Lighthouse SEO audit. Delivers search visibility.

**Acceptance Scenarios**:

1. **Given** a search engine crawls the page, **When** it reads the metadata, **Then** it finds:
   - `<title>`: Contains "VoidPay" and "crypto invoice"
   - `<meta name="description">`: 150-160 characters describing value prop
   - `<meta property="og:title">`, `og:description`, `og:image`
   - `<link rel="canonical">`: Points to production URL
2. **Given** a search engine analyzes the content, **When** it evaluates structure, **Then** it finds:
   - Single `<h1>` (hero headline)
   - Structured `<h2>` for each section (How It Works, Why VoidPay)
   - `<section>` elements wrapping each content block
   - Proper heading hierarchy (h1 → h2 → h3, no skipping)
3. **Given** the page is tested with Lighthouse, **When** the SEO audit runs, **Then** the score is 90 or higher with all critical audits passing.

---

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| JavaScript fails to load | Page shows static SSR content with working navigation links (Next.js SSR fallback) |
| Very slow connection (3G) | Hero content visible within 2 seconds; demo loads after |
| Wide monitors (> 2560px) | Content remains centered with max-w-6xl (1152px) constraint |
| Animation frame rate drops | CSS transitions gracefully degrade; layout never breaks |
| "Use This Template" clicked mid-rotation | Navigation uses current visible template (rotation pauses on hover) |
| Viewport < 320px | Minimum supported width; content may overflow horizontally |
| Landscape mobile | Hero uses min-h-[85vh]; content scrolls vertically |
| High-DPI/Retina displays | SVG icons scale perfectly; no bitmap assets required |
| Animation fallback fails | Static text displayed with aria-label for screen readers |
| Network badge images fail | Inline SVG icons used; no external dependencies |

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST render a hero section with:
  - Minimum height: min-h-[85vh]
  - Animated headline using AuroraText component with gradient animation
  - Value proposition text: "No backend, no sign-up, just links."
  - Beta badge with pulsing indicator
- **FR-002**: System MUST display InvoicePaper component in demo section with:
  - Fixed dimensions: 794×1123px (A4 ratio 1:1.414)
  - Responsive scaling: 25%-85% based on viewport
  - Shadow: shadow-[0_50px_150px_-30px_rgba(0,0,0,0.8)]
- **FR-003**: System MUST provide primary "Start Invoicing" CTA with:
  - Button variant: "glow"
  - Size: lg (h-14, 56px)
  - Right icon: ArrowRight (w-4 h-4)
  - Navigation: Link to /create route
- **FR-004**: System MUST auto-rotate demo invoice data every 10 seconds through 4 network variations (Ethereum, Arbitrum, Optimism, Polygon) matching Constitution MVP scope.
- **FR-005**: System MUST display network trust signals in hero section with:
  - Networks: Ethereum, Arbitrum, Optimism, Polygon (all MVP networks per Constitution)
  - Layout: flex gap-8
  - Styling: text-xs font-bold tracking-widest uppercase
  - Effect: grayscale opacity-60, hover:grayscale-0 transition-all duration-500
- **FR-006**: System MUST render "How It Works" section with:
  - 3 StepCards in grid (grid-cols-1 md:grid-cols-3 gap-12)
  - Background numbers: text-[100px] md:text-[150px]
  - Icons: w-8 h-8 in w-16 h-16 violet-600 container
  - Steps: 01 Create, 02 Share, 03 Get Paid
- **FR-007**: System MUST render "Why VoidPay?" section with:
  - 6 FeatureCards in grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8)
  - Icon container: w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800
  - Cards: No Database, Multi-Chain, Immutable, Aesthetic First, Instant Pay, Open Standard
- **FR-008**: System MUST render footer CTA section with:
  - Gradient background: bg-gradient-to-b from-transparent to-violet-950/30
  - CTA button: variant="glow" size="lg" h-16 (64px) rounded-2xl px-12
  - Shadow: shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)]
- **FR-009**: System MUST apply dark theme with:
  - Fixed NetworkBackground component (fixed inset-0 -z-10)
  - Theme adapts to current demo invoice network
- **FR-010**: System MUST implement responsive design with breakpoints:
  - Mobile: < 768px (sm:)
  - Tablet: 768-1024px (md:)
  - Desktop: > 1024px (lg:)
- **FR-011**: System MUST respect prefers-reduced-motion per WCAG 2.3.3:
  - Framer Motion: skip animations
  - CSS transitions: 0ms
  - Auto-rotation: pause
- **FR-012**: System MUST provide "Use This Template" on demo invoice hover:
  - Overlay: bg-black/5 opacity transition
  - Button: bg-violet-600 px-6 py-3 rounded-full
  - Action: Call `useCreatorStore.createNewDraft()` with DemoInvoice data (see dataFlow.md)
  - Navigation: /create (store hydrates form from `activeDraft`)
- **FR-013**: System MUST include SEO metadata via Next.js Metadata API:
  - title, description, Open Graph, Twitter cards, canonical URL
- **FR-014**: System MUST use semantic HTML with heading hierarchy:
  - Single h1 in hero
  - h2 for section titles
  - h3 for card titles
  - No level skipping
- **FR-015**: System MUST ensure accessibility compliance:
  - Focus states: focus-visible:ring-1 on all interactive elements
  - Touch targets: minimum 44×44px on mobile
  - ARIA: decorative icons use aria-hidden="true"
  - Keyboard: no traps, logical tab order
  - Contrast: WCAG 2.1 AA (4.5:1 for normal text)
- **FR-016**: System MUST render a secondary "View Gallery" button in hero with:
  - Button variant: "outline"
  - Size: lg (h-14, 56px)
  - Styling: bg-zinc-900/40 backdrop-blur rounded-2xl
  - Navigation: Scroll to DemoSection (anchor link #demo) — gallery feature not in MVP

### Key Entities

| Entity | Location | Description |
|--------|----------|-------------|
| `LandingPage` | `src/app/page.tsx` | Page composition orchestrating all widgets |
| `HeroSection` | `src/widgets/landing/hero-section/` | Hero with headline, CTAs, trust signals |
| `DemoSection` | `src/widgets/landing/demo-section/` | Rotating InvoicePaper demonstration |
| `ValueProps` | `src/widgets/landing/` | How It Works + Why VoidPay sections |
| `FooterCta` | `src/widgets/landing/footer-cta/` | Final conversion CTA |
| `NetworkBackground` | `src/shared/ui/` | Animated network-themed backdrop |
| `InvoicePaper` | `src/entities/invoice/` | Invoice visualization (794×1123px) |
| `AuroraText` | `src/shared/ui/` | Animated gradient text effect |
| `Button` | `src/shared/ui/` | Design system button (glow/void/outline variants) |
| `Heading/Text` | `src/shared/ui/` | Typography components |

---

## Assumptions

- The existing `NetworkBackground`, `InvoicePaper`, `AuroraText`, `HyperText`, `VoidLogo`, `Button`, `Heading`, and `Text` components from shared/ui and entities are available and functional per v3 design assets.
- The design follows `assets/aistudio/v3/pages/landing/` and `widgets/landing/` reference implementations as the **single source of truth**.
- Dark theme is the only theme for the landing page (no light mode toggle on this page).
- Navigation uses Next.js App Router with Link component for internal routing (instant navigation, no loading states needed).
- The page will be the root route ("/") in the Next.js application.
- SEO metadata will use Next.js Metadata API.
- Network badges use inline SVG (no fallback needed).
- Framer Motion is available for entrance animations.
- Tailwind CSS 4+ with default breakpoints (sm:768px, md:, lg:1024px).
- Minimum supported viewport width: 320px.
- All icons from lucide-react library.
- No disabled button states on landing page (all CTAs always active).
- No skip-link required (landing page is single-purpose with minimal navigation).

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

| ID | Criterion | Measurement Method |
|----|-----------|-------------------|
| SC-001 | Users can navigate from landing page to invoice creation in under 3 seconds (2 clicks maximum) | Manual timing test |
| SC-002 | Page achieves Lighthouse Performance score of 85+ on mobile | Lighthouse CLI audit |
| SC-003 | Page achieves Lighthouse SEO score of 90+ | Lighthouse CLI audit |
| SC-004 | Page achieves Lighthouse Accessibility score of 95+ | Lighthouse CLI audit |
| SC-005 | All hero section content visible within 2 seconds on 3G throttling (RTT 562.5ms, 1.5Mbps) | Chrome DevTools Network throttling |
| SC-006 | Demo invoice completes one full cycle (30s = 3×10s) without CLS > 0.1 | Lighthouse CLS metric |
| SC-007 | 100% of interactive elements reachable via Tab key and activatable via Enter/Space | Manual keyboard navigation test |
| SC-008 | Page renders correctly on Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ | Cross-browser visual regression |
| SC-009 | Text contrast meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) | axe-core or Lighthouse a11y audit |
| SC-010 | Touch targets meet 44×44px minimum on mobile | Manual measurement or Lighthouse tap-targets audit |
