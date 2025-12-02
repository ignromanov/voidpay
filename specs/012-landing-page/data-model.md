# Data Model: Landing Page (Marketing + SEO)

**Feature**: 012-landing-page | **Date**: 2025-12-01

## Overview

Landing page is primarily static content with minimal runtime state. Data models define:
1. Static content structures (features, steps, demo invoices)
2. Component props interfaces
3. Animation state types

## Static Content Types

### Feature Card Data

```typescript
// widgets/landing/why-voidpay/types.ts
type FeatureCard = {
  id: string;           // Unique identifier (e.g., "no-database")
  title: string;        // Card heading (e.g., "No Database")
  description: string;  // Card body text
  icon: ComponentType<{ className?: string }>; // Lucide icon component
};

const FEATURE_CARDS: FeatureCard[] = [
  { id: 'no-database', title: 'No Database', description: '...', icon: Database },
  { id: 'multi-chain', title: 'Multi-Chain', description: '...', icon: Network },
  { id: 'immutable', title: 'Immutable URLs', description: '...', icon: Lock },
  { id: 'aesthetic', title: 'Aesthetic First', description: '...', icon: Palette },
  { id: 'instant', title: 'Instant Pay', description: '...', icon: Zap },
  { id: 'open-standard', title: 'Open Standard', description: '...', icon: Code },
];
```

### How It Works Step Data

```typescript
// widgets/landing/how-it-works/types.ts
type WorkflowStep = {
  step: 1 | 2 | 3;      // Step number
  title: string;        // Step title (e.g., "Create")
  description: string;  // Step explanation
  icon: ComponentType<{ className?: string }>;
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  { step: 1, title: 'Create', description: '...', icon: FileEdit },
  { step: 2, title: 'Share', description: '...', icon: Share2 },
  { step: 3, title: 'Get Paid', description: '...', icon: Wallet },
];
```

### Demo Invoice Data

```typescript
// widgets/landing/demo-section/demo-invoice-data.ts
import type { InvoiceDraft } from '@/entities/invoice';

type DemoInvoice = {
  network: 'ethereum' | 'arbitrum' | 'polygon';
  chainId: number;
  invoice: InvoiceDraft;
};

const DEMO_INVOICES: DemoInvoice[] = [
  {
    network: 'ethereum',
    chainId: 1,
    invoice: {
      id: 'VOID-001',
      issueDate: '2025-01-15',
      dueDate: '2025-02-15',
      currency: 'ETH',
      // ... full invoice data
    },
  },
  // arbitrum, polygon variants...
];
```

## Component Props Interfaces

### HeroSection Props

```typescript
// widgets/landing/hero-section/types.ts
type HeroSectionProps = {
  className?: string;
};

// No external data dependencies - all content is static
```

### DemoSection Props

```typescript
// widgets/landing/demo-section/types.ts
type DemoSectionProps = {
  className?: string;
  autoRotate?: boolean;        // Default: true
  rotationInterval?: number;   // Default: 10000 (10s)
};
```

### Network Badge Data

```typescript
// widgets/landing/hero-section/network-badges.ts
type NetworkBadge = {
  name: string;           // Display name
  chainId: number;        // Chain ID for potential future use
  logo: ComponentType<{ className?: string }>;
};

const SUPPORTED_NETWORKS: NetworkBadge[] = [
  { name: 'Ethereum', chainId: 1, logo: EthereumLogo },
  { name: 'Arbitrum', chainId: 42161, logo: ArbitrumLogo },
  { name: 'Optimism', chainId: 10, logo: OptimismLogo },
];
```

## State Models

### Demo Rotation State

```typescript
// widgets/landing/demo-section/use-demo-rotation.ts
type DemoRotationState = {
  activeIndex: number;           // Current demo index (0-2)
  isTransitioning: boolean;      // Animation in progress
  isPaused: boolean;             // User hovered/paused
};

// Hook interface
type UseDemoRotation = (options: {
  itemCount: number;
  interval: number;
  autoStart?: boolean;
}) => {
  activeIndex: number;
  next: () => void;
  prev: () => void;
  pause: () => void;
  resume: () => void;
};
```

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     LandingPage (app/)                       │
├─────────────────────────────────────────────────────────────┤
│  Composes:                                                   │
│  ├─ HeroSection (widget)                                    │
│  │   ├─ AuroraText (shared/ui) - headline                   │
│  │   ├─ HyperText (shared/ui) - animated tagline            │
│  │   ├─ Button void (shared/ui) - CTA                       │
│  │   └─ NetworkBadge[] - trust signals                      │
│  │                                                          │
│  ├─ HowItWorks (widget)                                     │
│  │   └─ WorkflowStep[] - 3 steps                            │
│  │                                                          │
│  ├─ WhyVoidPay (widget)                                     │
│  │   ├─ Heading (shared/ui)                                 │
│  │   └─ Card[] (shared/ui) - 6 feature cards                │
│  │                                                          │
│  ├─ DemoSection (widget)                                    │
│  │   ├─ DemoInvoice[] - 3 network variants                  │
│  │   ├─ InvoicePaper (future widget) - static display       │
│  │   └─ NetworkBackground (widget) - ambient glow           │
│  │                                                          │
│  └─ FooterCta (widget)                                      │
│      ├─ Heading (shared/ui)                                 │
│      └─ Button void (shared/ui) - secondary CTA             │
└─────────────────────────────────────────────────────────────┘
```

## Validation Rules

| Field | Rule | Reason |
|-------|------|--------|
| `FeatureCard.id` | Unique string, kebab-case | React key, CSS class hook |
| `WorkflowStep.step` | 1, 2, or 3 only | UI displays numbered steps |
| `DemoInvoice.network` | Must match NETWORK_THEMES keys | Sync with NetworkBackground |
| `NetworkBadge.chainId` | Valid EVM chain ID | Future proof for chain switching |

## No Database/API Requirements

This feature requires **zero database storage** and **zero API endpoints**.

- All content is static, defined in TypeScript constants
- Demo invoices are hardcoded sample data
- SEO metadata is static in Next.js Metadata API
- No user input is persisted

**Constitutional Compliance**: Principle I (Zero-Backend Architecture) ✓
