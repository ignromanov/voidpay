# Quickstart: Landing Page (Marketing + SEO)

**Feature**: 012-landing-page | **Date**: 2025-12-01

## Prerequisites

```bash
# Verify you're in the correct worktree
pwd  # Should show: .../worktrees/012-landing-page

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Development Workflow

### 1. TDD Setup (Red → Green → Refactor)

```bash
# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

### 2. Widget Development Order

Implement widgets in dependency order:

1. **HeroSection** - No dependencies, start here
2. **HowItWorks** - No dependencies  
3. **WhyVoidPay** - No dependencies
4. **FooterCta** - No dependencies
5. **DemoSection** - May depend on InvoicePaper (stub initially)
6. **LandingPage composition** - Combines all widgets

### 3. Component Reuse Checklist

Before creating any JSX, verify reuse from `sharedUiIndex`:

| Need | Use |
|------|-----|
| Headline with gradient | `AuroraText` from `@/shared/ui/aurora-text` |
| Animated text | `HyperText` from `@/shared/ui/hyper-text` |
| CTA buttons | `Button` (void variant) from `@/shared/ui/button` |
| Feature cards | `Card` (glass variant) from `@/shared/ui/card` |
| Typography | `Heading`, `Text` from `@/shared/ui/typography` |
| Animations | `motion`, `AnimatePresence` from `@/shared/ui/motion` |
| Background | `NetworkBackground` from `@/widgets/network-background` |
| Reduced motion | `useReducedMotion` from `@/shared/ui/hooks/use-reduced-motion` |

### 4. File Structure Template

```bash
# Create widget structure
mkdir -p src/widgets/landing/hero-section/__tests__
touch src/widgets/landing/hero-section/{HeroSection.tsx,index.ts}
touch src/widgets/landing/hero-section/__tests__/HeroSection.test.tsx
```

### 5. Test First Pattern

```typescript
// __tests__/HeroSection.test.tsx
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
  it('renders headline with brand text', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders primary CTA with correct link', () => {
    render(<HeroSection />);
    const cta = screen.getByRole('link', { name: /start invoicing/i });
    expect(cta).toHaveAttribute('href', '/create');
  });

  it('displays supported network badges', () => {
    render(<HeroSection />);
    expect(screen.getByLabelText(/ethereum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/arbitrum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/optimism/i)).toBeInTheDocument();
  });
});
```

## Validation Commands

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Full test suite
pnpm test

# Build (validates SSR/SSG)
pnpm build
```

## SEO Verification

After implementation, verify SEO compliance:

```bash
# Build and start production server
pnpm build && pnpm start

# In another terminal, run Lighthouse
npx lighthouse http://localhost:3000 --only-categories=seo,accessibility,performance
```

**Target Scores**:
- Performance: 85+
- SEO: 90+
- Accessibility: 95+

## Key Implementation Notes

1. **Dark theme only** - Landing page uses zinc-950 background (no light mode toggle)
2. **A4 aspect ratio** - Demo invoice paper must be 1:1.414 ratio
3. **Reduced motion** - All animations must respect `prefers-reduced-motion`
4. **Semantic HTML** - Single `<h1>`, proper heading hierarchy
5. **Focus states** - All interactive elements need visible focus

## Memory Updates After Completion

Update these Serena memories after feature completion:

```bash
# 1. Update fsdRegistry.md with new widgets
mcp__serena__edit_memory("fsdRegistry", ...)

# 2. Update progress.md with P0.7 status
mcp__serena__edit_memory("progress", ...)

# 3. Update activeContext.md
mcp__serena__edit_memory("activeContext", ...)
```
