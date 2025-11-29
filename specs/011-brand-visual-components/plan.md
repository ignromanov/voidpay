# Implementation Plan: Brand & Visual Components

**Branch**: `011-brand-visual-components` | **Date**: 2025-11-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-brand-visual-components/spec.md`

## Summary

Implement 5 brand and visual effect components for VoidPay's cosmic theme:

1. **VoidLogo** - SVG logo with eclipse, lightning bolts, and pulsing glow
2. **NetworkBackground** - Animated ambient background with 6 network themes
3. **Button void variant** - Black hole accretion disk animation with physics effects
4. **AuroraText** - Animated gradient text with aurora effect
5. **HyperText** - Character-by-character scramble reveal animation

**Approach**: Extend existing UI primitives (Radix + CVA + Framer Motion) with complex animations. VoidLogo, AuroraText, HyperText in `src/shared/ui/`, NetworkBackground as widget in `src/widgets/network-background/`, void variant integrated into existing Button component.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode), React 19.0.0+, Node.js 20+
**Primary Dependencies**: Framer Motion 12.23.24, CVA 0.7.1+, Tailwind CSS 4.1.17+, clsx, tailwind-merge
**Storage**: N/A (pure UI components)
**Testing**: Vitest 4.0.14, @testing-library/react 16.3.0, 80%+ coverage required
**Target Platform**: Modern browsers (Chrome, Firefox, Safari), responsive
**Project Type**: web - Next.js 16.0.3+ App Router
**Performance Goals**: 60fps animations, no layout shift (CLS=0), <100ms first paint
**Constraints**: prefers-reduced-motion respect, GPU-accelerated transforms only
**Scale/Scope**: 5 components, ~15-20 test files, integration with existing 12 shared UI components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] No backend database introduced (I) - Pure client-side visual components
- [x] No user authentication/registration added (III) - UI components only
- [x] Schema changes follow versioning rules (IV) - No schema changes
- [x] New features preserve privacy-first approach (II) - No analytics or tracking
- [x] Security mechanisms not bypassed (V) - No security changes
- [x] Documentation follows context efficiency guidelines (VIII) - Concise spec/plan
- [x] UI follows Hybrid Theme Strategy: dark desk (`zinc-950`), light paper (`white`) (XII) - NetworkBackground for desk theme
- [x] Document representations maintain ISO 216 (A4) aspect ratio `1:1.414` (XII) - N/A for brand components
- [x] All TypeScript/Markdown navigation uses Serena tools first (XIII) - Using Serena throughout planning
- [x] Serena memories consulted before planning via `mcp__serena__*` tools (XIV) - Consulted development-status, constitutional-principles-summary
- [x] Memory update plan identified: which memories need updating after feature completion (XIV) - Update `development-status` after completion
- [x] Following SpecKit workflow phases: specify → plan → tasks → implement (XV) - Currently in plan phase
- [x] TDD cycle planned: Red → Green → Refactor with 80%+ coverage target (XVI) - Tests written before implementation

## Project Structure

### Documentation (this feature)

```text
specs/011-brand-visual-components/
├── plan.md              # This file
├── research.md          # Phase 0: Animation patterns research
├── data-model.md        # Phase 1: Component props/types specification
├── quickstart.md        # Phase 1: Usage examples
├── contracts/           # Phase 1: Component API contracts
│   ├── void-logo.ts
│   ├── network-background.ts
│   ├── button-void-variant.ts
│   ├── aurora-text.ts
│   └── hyper-text.ts
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── shared/
│   └── ui/
│       ├── void-logo.tsx           # VoidLogo component (NEW)
│       ├── aurora-text.tsx         # AuroraText component (NEW)
│       ├── hyper-text.tsx          # HyperText component (NEW)
│       ├── button.tsx              # Button (MODIFY: add void variant)
│       ├── __tests__/
│       │   ├── void-logo.test.tsx
│       │   ├── aurora-text.test.tsx
│       │   ├── hyper-text.test.tsx
│       │   └── button-void.test.tsx
│       └── index.ts                # Export barrel (MODIFY)
└── widgets/
    └── network-background/
        ├── NetworkBackground.tsx    # NetworkBackground widget (NEW)
        ├── index.ts                 # Widget export
        └── __tests__/
            └── NetworkBackground.test.tsx
```

**Structure Decision**: Feature-Sliced Design (FSD) compliance per spec FR-028/029/030:

- Simple branded primitives → `src/shared/ui/`
- Complex widget with multiple animation layers → `src/widgets/network-background/`

## Complexity Tracking

> **No Constitution Check violations - no complexity justifications needed**

## Animation Strategy

### Framer Motion Usage

| Component         | Animation Type                   | Technique                                      |
| ----------------- | -------------------------------- | ---------------------------------------------- |
| VoidLogo          | Crescent pulse                   | CSS @keyframes (simpler, no JS)                |
| NetworkBackground | Shape movement, theme transition | `motion.div` + `AnimatePresence`               |
| Button void       | Accretion disk rotation          | CSS @keyframes + `motion.div` for hover states |
| AuroraText        | Gradient cycle                   | CSS @keyframes (background-position)           |
| HyperText         | Character scramble               | `useState` + `useEffect` + interval            |

### Performance Optimizations

1. **GPU acceleration**: `transform`, `opacity` only (no layout properties)
2. **will-change**: Applied to animated elements
3. **AnimatePresence**: For NetworkBackground theme crossfades
4. **useReducedMotion**: Respect user preference, disable complex animations
5. **Lazy render**: NetworkBackground shapes rendered only when in viewport

## Design Tokens Reference

From spec and CLAUDE.md:

```typescript
const DESIGN_TOKENS = {
  colors: {
    electricViolet: '#7C3AED', // Primary accent
    networks: {
      arbitrum: { primary: '#12AAFF', secondary: '#28A0F0' },
      optimism: { primary: '#FF0420', secondary: '#FF5C5C' },
      polygon: { primary: '#8247E5', secondary: '#A77CF2' },
      ethereum: { primary: '#627EEA', secondary: '#8B9EF5' },
      base: { primary: '#0052FF', secondary: '#3D7DFF' },
      voidpay: { primary: '#7C3AED', secondary: '#A78BFA' },
    },
  },
  animation: {
    voidButton: {
      idle: '6s linear infinite',
      hover: '2s linear infinite',
      loading: '0.5s linear infinite',
    },
    networkTransition: '1.5s ease-in-out',
  },
}
```

## Dependencies Check

- [x] P0.8.0 (Core Primitives Transfer) - Button component exists
- [x] P0.7.5 (Design Transfer Environment) - Framer Motion 12.23.24 installed, motion.tsx wrapper exists
- [x] CVA 0.7.1+ - Already in use for Button variants
- [x] Tailwind CSS 4.1.17+ - Custom keyframes support available

## Test Strategy (TDD - Principle XVI)

### Test Categories

| Component         | Unit Tests               | Visual Tests       | Integration        |
| ----------------- | ------------------------ | ------------------ | ------------------ |
| VoidLogo          | Props, accessibility     | Snapshot           | Header integration |
| NetworkBackground | Theme switching, shapes  | AnimatePresence    | Widget isolation   |
| Button void       | State transitions        | Animation phases   | Hover/focus events |
| AuroraText        | Gradient application     | Snapshot           | Text wrapping      |
| HyperText         | Character reveal, timing | Scramble animation | Dynamic content    |

### Test Files (Write FIRST - must FAIL)

1. `void-logo.test.tsx` - SVG structure, glow effect, pulse animation
2. `network-background.test.tsx` - Theme variants, shape rendering, crossfade
3. `button-void.test.tsx` - Accretion disk, state animations, disabled
4. `aurora-text.test.tsx` - Gradient classes, shadow effect
5. `hyper-text.test.tsx` - Scramble timing, static characters, duration prop

## Risks & Mitigations

| Risk                                     | Impact         | Mitigation                                    |
| ---------------------------------------- | -------------- | --------------------------------------------- |
| Animation performance on low-end devices | UX degradation | useReducedMotion hook, GPU-only transforms    |
| Safari conic-gradient support            | Visual bugs    | Fallback to radial gradient                   |
| Theme transition flicker                 | UX issue       | AnimatePresence mode="wait"                   |
| HyperText layout shift                   | CLS impact     | Fixed-width characters, monospace font option |

## Next Steps

1. **Phase 0**: Generate `research.md` with animation pattern best practices
2. **Phase 1**: Generate `data-model.md` with component interfaces
3. **Phase 1**: Generate `contracts/` with TypeScript type definitions
4. **Phase 1**: Generate `quickstart.md` with usage examples
5. **Phase 2**: Generate `tasks.md` via `/speckit.tasks`
