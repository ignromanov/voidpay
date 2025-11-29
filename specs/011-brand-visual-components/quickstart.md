# Quickstart: Brand & Visual Components

**Feature**: 011-brand-visual-components | **Date**: 2025-11-29

## Installation

All components are included in VoidPay. No additional dependencies required.

```bash
# Dependencies already installed:
# - framer-motion: ^12.23.24
# - class-variance-authority: ^0.7.1
# - tailwind-merge: ^2.5.4
```

---

## VoidLogo

Eclipse logo with lightning bolts and pulsing glow.

```tsx
import { VoidLogo } from '@/shared/ui'

// Basic usage
<VoidLogo />

// Size presets
<VoidLogo size="sm" />  {/* 32px */}
<VoidLogo size="md" />  {/* 48px (default) */}
<VoidLogo size="lg" />  {/* 64px */}

// Custom size
<VoidLogo size={96} />

// Static (no animation)
<VoidLogo static />

// With custom classes
<VoidLogo className="opacity-80 hover:opacity-100" />
```

---

## NetworkBackground

Ambient background with network-themed floating shapes.

```tsx
import { NetworkBackground } from '@/widgets/network-background'

// Default (VoidPay theme)
<NetworkBackground />

// Network-specific themes
<NetworkBackground theme="arbitrum" />   {/* Blue triangles */}
<NetworkBackground theme="optimism" />   {/* Red circles */}
<NetworkBackground theme="polygon" />    {/* Purple hexagons */}
<NetworkBackground theme="ethereum" />   {/* Blue rhombus */}
<NetworkBackground theme="base" />       {/* Blue circles */}
<NetworkBackground theme="voidpay" />    {/* Violet blobs */}

// Dynamic theme switching (smooth crossfade)
const [theme, setTheme] = useState<NetworkTheme>('arbitrum')

<NetworkBackground theme={theme} />
<button onClick={() => setTheme('optimism')}>Switch to Optimism</button>
```

**Note**: Place at root of your layout. Component uses `fixed` positioning with `pointer-events-none`.

---

## Button (void variant)

Black hole button with accretion disk animation.

```tsx
import { Button } from '@/shared/ui'

// Basic void button
<Button variant="void">Pay Now</Button>

// With loading state
const [isLoading, setIsLoading] = useState(false)

<Button variant="void" isLoading={isLoading}>
  {isLoading ? 'Processing...' : 'Confirm Payment'}
</Button>

// Disabled state (no accretion disk, grayscale)
<Button variant="void" disabled>
  Not Available
</Button>

// Size variants (inherits from Button)
<Button variant="void" size="sm">Small</Button>
<Button variant="void" size="lg">Large</Button>

// With icon
<Button variant="void">
  <WalletIcon className="mr-2 h-4 w-4" />
  Connect Wallet
</Button>
```

---

## AuroraText

Animated gradient text effect.

```tsx
import { AuroraText } from '@/shared/ui'

// Basic usage (renders as span)
<AuroraText>Magical Text</AuroraText>

// As heading
<AuroraText as="h1" className="text-4xl font-bold">
  Welcome to VoidPay
</AuroraText>

// As paragraph
<AuroraText as="p">
  Privacy-first crypto invoicing
</AuroraText>

// Combined with other elements
<h2>
  <AuroraText>Stateless</AuroraText> Invoice Platform
</h2>
```

---

## HyperText

Character scramble reveal animation.

```tsx
import { HyperText } from '@/shared/ui'

// Basic usage (animates on mount)
<HyperText text="INVOICE PAID" />

// Custom duration (in milliseconds)
<HyperText text="LOADING" duration={500} />

// Disable initial animation
<HyperText text="STATUS" animateOnLoad={false} />

// With completion callback
<HyperText
  text="VERIFIED"
  onAnimationComplete={() => console.log('Animation done!')}
/>

// Dynamic text (re-animates when text changes)
const [status, setStatus] = useState('PENDING')

<HyperText text={status} />
<button onClick={() => setStatus('COMPLETE')}>Complete</button>

// Styled
<HyperText
  text="INV-001"
  className="font-mono text-2xl text-violet-400"
/>
```

---

## Accessibility

All components respect `prefers-reduced-motion`:

```css
/* Users with motion sensitivity see static versions */
@media (prefers-reduced-motion: reduce) {
  /* VoidLogo: static glow, no pulse */
  /* NetworkBackground: static gradient, no shapes */
  /* Button void: solid ring, no spinning */
  /* AuroraText: static gradient */
  /* HyperText: instant text, no scramble */
}
```

Check programmatically:

```tsx
import { useReducedMotion } from 'framer-motion'

function MyComponent() {
  const shouldReduceMotion = useReducedMotion()

  return shouldReduceMotion ? <StaticContent /> : <AnimatedContent />
}
```

---

## Common Patterns

### Header with Logo

```tsx
<header className="flex items-center gap-2 p-4">
  <VoidLogo size="sm" />
  <AuroraText as="h1" className="text-xl font-bold">
    VoidPay
  </AuroraText>
</header>
```

### Payment Page Layout

```tsx
<div className="relative min-h-screen">
  <NetworkBackground theme={selectedNetwork} />
  <main className="relative z-10 flex flex-col items-center pt-20">
    <VoidLogo size="lg" className="mb-8" />
    <HyperText text={`PAY ${amount}`} className="mb-6 text-3xl" />
    <Button variant="void" size="lg" isLoading={isPaying}>
      Confirm Payment
    </Button>
  </main>
</div>
```

### Status Reveal

```tsx
const [status, setStatus] = useState<'pending' | 'confirmed' | 'paid'>('pending')

<div className="flex flex-col items-center gap-4">
  <HyperText
    text={status.toUpperCase()}
    className={cn(
      'text-4xl font-bold',
      status === 'paid' && 'text-green-500',
      status === 'confirmed' && 'text-yellow-500'
    )}
    key={status} // Re-animate on status change
  />
</div>
```

---

## TypeScript

Full type exports available:

```tsx
import type { VoidLogoProps, AuroraTextProps, HyperTextProps } from '@/shared/ui'

import type { NetworkBackgroundProps, NetworkTheme } from '@/widgets/network-background'
```
