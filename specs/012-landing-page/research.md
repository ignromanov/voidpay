# Research: Landing Page (Marketing + SEO)

**Feature**: 012-landing-page | **Date**: 2025-12-01

## Research Tasks

### R1: Static Invoice Paper Display

**Question**: How to display the InvoicePaper component in demo section?

**Decision**: Static InvoicePaper component with CSS shadow for depth

**Rationale**:
- Simplicity over complexity (YAGNI)
- Focus animation budget on data transitions, not paper effects
- Better performance, smaller bundle

**Implementation Pattern**:
```tsx
<div className="relative">
  <InvoicePaper 
    invoice={currentDemoInvoice}
    className="shadow-2xl"
  />
</div>
```

**Alternatives Considered**:
- 3D transforms: Unnecessary complexity for marketing page
- Floating animation: Distracting from content

---

### R2: Demo Invoice Data Rotation

**Question**: How to implement automatic invoice data rotation through networks?

**Decision**: `useInterval` hook + Framer Motion for data field transitions on the invoice

**Rationale**:
- Interval-based rotation is predictable and testable
- Animate data changes ON the static invoice (not the paper itself)
- Network theme changes sync with NetworkBackground component

**Implementation Pattern**:
```tsx
const DEMO_NETWORKS = ['ethereum', 'arbitrum', 'optimism', 'polygon'] as const;
const ROTATION_INTERVAL = 10_000; // 10 seconds per spec

const [activeIndex, setActiveIndex] = useState(0);

useInterval(() => {
  setActiveIndex((i) => (i + 1) % DEMO_NETWORKS.length);
}, ROTATION_INTERVAL);

// Invoice stays static, data fields animate
<InvoicePaper invoice={DEMO_INVOICES[activeIndex].invoice}>
  {/* Internal fields use motion for fade/slide transitions */}
</InvoicePaper>
```

**Alternatives Considered**:
- Full paper crossfade: Unnecessary, data transition is more elegant
- Manual user clicks only: Less engaging, spec requires auto-rotation

---

### R3: SEO Metadata Strategy

**Question**: How to implement SEO metadata for Next.js 15 App Router?

**Decision**: Next.js Metadata API with static `generateMetadata` export

**Rationale**:
- Native Next.js approach, no additional dependencies
- Supports Open Graph, Twitter Cards, canonical URLs
- Works with SSR/SSG for search engine crawling

**Implementation Pattern**:
```tsx
// app/page.tsx or app/layout.tsx
export const metadata: Metadata = {
  title: 'VoidPay - Stateless Crypto Invoicing',
  description: 'Create crypto invoices without accounts or servers. Privacy-first, zero-backend invoicing for Ethereum, Arbitrum, Optimism, and Polygon.',
  keywords: ['crypto invoice', 'web3 payments', 'stateless', 'privacy'],
  openGraph: {
    title: 'VoidPay - Stateless Crypto Invoicing',
    description: '...',
    url: 'https://voidpay.xyz',
    siteName: 'VoidPay',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoidPay',
    description: '...',
  },
  robots: {
    index: true, // Landing page IS indexed
    follow: true,
  },
};
```

**Alternatives Considered**:
- next-seo package: Unnecessary abstraction over native API
- Manual `<head>` tags: Loses Next.js optimization benefits

---

### R4: Reduced Motion Accessibility

**Question**: How to respect `prefers-reduced-motion` for all animations?

**Decision**: Use existing `useReducedMotion` hook from shared/ui, disable all motion variants

**Rationale**:
- Hook already exists in codebase (`@/shared/ui/hooks/use-reduced-motion`)
- Consistent with brand components that already use it
- WCAG 2.1 SC 2.3.3 compliance

**Implementation Pattern**:
```tsx
const prefersReducedMotion = useReducedMotion();

// Disable animation when reduced motion preferred
const floatAnimation = prefersReducedMotion 
  ? {} 
  : { y: [0, -10, 0], transition: { repeat: Infinity, duration: 4 } };

// Disable HyperText scramble
<HyperText 
  text="The Stateless Crypto Invoice" 
  animateOnMount={!prefersReducedMotion} 
/>
```

**Alternatives Considered**:
- Per-component media queries: Inconsistent, hard to maintain
- Global CSS approach: Doesn't work for Framer Motion animations

---

### R5: Network Trust Signals Display

**Question**: How to display supported network badges in hero section?

**Decision**: Static SVG network logos with semantic markup

**Rationale**:
- SVGs are crisp at any size, small file size
- Semantic `<ul>` with `role="list"` for accessibility
- No need for dynamic loading - networks are fixed for MVP

**Implementation Pattern**:
```tsx
const SUPPORTED_NETWORKS = [
  { name: 'Ethereum', icon: EthereumLogo },
  { name: 'Arbitrum', icon: ArbitrumLogo },
  { name: 'Optimism', icon: OptimismLogo },
  { name: 'Polygon', icon: PolygonLogo },
] as const;

<ul role="list" aria-label="Supported networks" className="flex gap-4">
  {SUPPORTED_NETWORKS.map(({ name, icon: Icon }) => (
    <li key={name}>
      <Icon aria-label={name} className="h-8 w-8" />
    </li>
  ))}
</ul>
```

**Alternatives Considered**:
- Image files: Larger, not scalable
- Icon font: Accessibility issues, extra HTTP request

---

### R6: Feature Grid Layout

**Question**: How to implement responsive 6-card feature grid?

**Decision**: CSS Grid with auto-fit + minmax for responsive behavior

**Rationale**:
- Pure CSS, no JS required for layout
- Automatic wrapping based on available space
- Consistent card sizing with gap control

**Implementation Pattern**:
```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {FEATURES.map((feature) => (
    <Card key={feature.id} variant="glass">
      <CardHeader>
        <feature.icon className="h-8 w-8 text-violet-400" />
        <CardTitle>{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text variant="body-sm">{feature.description}</Text>
      </CardContent>
    </Card>
  ))}
</div>
```

**Alternatives Considered**:
- Flexbox: Harder to achieve consistent column widths
- CSS Columns: Wrong use case, for text flow not cards

---

## Summary

All research questions resolved. No NEEDS CLARIFICATION items remain.

**Key Decisions**:
1. Static InvoicePaper with shadow (no 3D transforms)
2. Interval-based rotation with animated data transitions on invoice
3. Next.js Metadata API for SEO
4. Existing `useReducedMotion` hook for accessibility
5. SVG logos for network trust signals
6. CSS Grid for responsive feature layout

**Existing Components to Reuse**:
- `AuroraText` - Hero headline effect
- `HyperText` - Text scramble animation
- `VoidLogo` - Brand logo
- `NetworkBackground` - Animated network backdrop
- `Button` (void variant) - CTAs
- `Card` (glass variant) - Feature cards
- `Heading`, `Text` - Typography
- `useReducedMotion` - Accessibility hook
