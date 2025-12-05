# Research: Blockchain Network Logo Shapes for CSS Clip-Path

Generated: 2025-12-02
Context: Landing page background shapes that represent blockchain networks

---

## Executive Summary

This research documents the geometric forms of blockchain network logos and provides CSS `clip-path: polygon()` coordinates for creating recognizable background shapes. The project already implements these shapes in `src/widgets/network-background/shapes.tsx` and `src/shared/ui/network-background.tsx`.

---

## R1: Ethereum (ETH) Logo Shape

### Geometric Description

The Ethereum logo is based on an **octahedron** (a Platonic solid with 8 faces) rendered in 2D as a diamond/rhombus shape. The design consists of:

- **6 triangles** total: 4 triangles in the upper half, 2 triangles in the lower half
- **Vertical diamond orientation** (pointed top and bottom)
- **3D depth effect** achieved through varying opacity levels:
  - Central right section: 80% opacity (darkest)
  - Central left section: 45% opacity (lightest)
  - Central rhomboid: 60% opacity

The shape is essentially a **vertically-oriented diamond** with an inner facet that creates the crystal effect.

### CSS Clip-Path Coordinates

```css
/* Outer diamond shape (main ETH crystal) */
.ethereum-outer {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

/* Inner facet (creates 3D depth illusion) */
.ethereum-inner {
  clip-path: polygon(50% 20%, 80% 50%, 50% 80%, 20% 50%);
}
```

### Coordinate Breakdown

| Point | X | Y | Description |
|-------|---|---|-------------|
| Top | 50% | 0% | Top apex of diamond |
| Right | 100% | 50% | Right apex |
| Bottom | 50% | 100% | Bottom apex |
| Left | 0% | 50% | Left apex |

### Key Visual Characteristics

- **Aspect ratio**: Taller than wide (approximately 1.4:1 height:width)
- **Symmetry**: Perfect vertical and horizontal symmetry
- **Color scheme**: Blue (#627EEA) to indigo gradients

### Sources

- [1000logos.net - Ethereum Logo](https://1000logos.net/ethereum-logo/)
- [CoinGape - Ethereum Logo Meaning](https://coingape.com/education/ethereum-logo-meaning-heres-everything-you-should-know-history-of-ethereum-logo-who-made-the-ethereum-logo/)
- [Cointelegraph - Hidden Meanings of Ethereum Logo](https://cointelegraph.com/news/hidden-meanings-of-ethereum-logo-love-compassion-energy-and-self-reflection)

---

## R2: Arbitrum (ARB) Logo Shape

### Geometric Description

The Arbitrum logo is a **stylized letter "A"** formed as an upward-pointing arrow. The shape has:

- **Triangular base** pointing upward
- **Notched bottom** creating the "A" crossbar effect
- **6 vertices** total
- Clean, geometric lines conveying "efficiency and innovation"

The shape resembles an arrowhead or rocket pointing upward, symbolizing L2 scalability "lifting" Ethereum.

### CSS Clip-Path Coordinates

```css
/* Arbitrum stylized A / upward arrow */
.arbitrum-arrow {
  clip-path: polygon(50% 0%, 100% 100%, 70% 100%, 50% 35%, 30% 100%, 0% 100%);
}
```

### Coordinate Breakdown

| Point | X | Y | Description |
|-------|---|---|-------------|
| Top apex | 50% | 0% | Peak of the arrow |
| Bottom-right outer | 100% | 100% | Outer right leg |
| Bottom-right inner | 70% | 100% | Inner right notch |
| Center notch | 50% | 35% | The "crossbar" of the A |
| Bottom-left inner | 30% | 100% | Inner left notch |
| Bottom-left outer | 0% | 100% | Outer left leg |

### Key Visual Characteristics

- **Aspect ratio**: Taller than wide (approximately 1.3:1 height:width)
- **Notch depth**: Approximately 65% down from top
- **Color scheme**: Sky blue (#12AAFF) to cyan

### Sources

- [Brandfetch - Arbitrum Brand Assets](https://brandfetch.com/arbitrum.io)
- [Seeklogo - Arbitrum Logo](https://seeklogo.com/vector-logo/429969/arbitrum)

---

## R3: Optimism (OP) Logo Shape

### Geometric Description

The Optimism logo is a simple **circle** or "O" shape. For the background effect, it's rendered as:

- **Concentric rings** (outer circle with inner cutout)
- Creates the iconic "O" appearance
- Represents unity, completeness, and optimistic energy

The "O" is created using either:
1. A circle with `border-radius: 50%`
2. A ring effect using an outer circle with a dark inner circle overlay

### CSS Implementation

```css
/* Optimism circle - uses border-radius, not clip-path */
.optimism-circle {
  border-radius: 50%;
  /* clip-path not needed for circles */
}

/* For ring effect (O shape), use nested elements:
   Outer colored circle with inner dark circle overlay */
```

### Creating the Ring Effect

```css
.optimism-ring {
  position: relative;
  border-radius: 50%;
  background: #FF0420; /* Optimism red */
}

.optimism-ring::after {
  content: '';
  position: absolute;
  inset: 25%; /* Creates ring thickness */
  border-radius: 50%;
  background: #0a0a0a; /* Dark center */
}
```

### Key Visual Characteristics

- **Aspect ratio**: 1:1 (perfect circle)
- **Ring thickness**: Approximately 25% of diameter
- **Color scheme**: Red (#FF0420) to orange/rose

### Sources

- [Brandfetch - Optimism Brand Assets](https://brandfetch.com/optimism.io)
- [CryptoLogos - Optimism Logo](https://cryptologos.cc/optimism-ethereum)

---

## R4: Polygon (MATIC) Logo Shape

### Geometric Description

The Polygon logo is a **hexagon** (6-sided polygon). Key characteristics:

- **Flat-top orientation** (horizontal edges at top and bottom)
- Brand name derives from Greek: "poly" (many) + "gon" (sides/angles)
- The full logo shows two hexagons forming an infinity-like symbol
- For background shapes, a single hexagon represents the network well

### CSS Clip-Path Coordinates

```css
/* Polygon hexagon - flat-top orientation */
.polygon-hexagon {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

/* Inner hexagon for layered effect */
.polygon-inner {
  clip-path: polygon(35% 15%, 65% 15%, 85% 50%, 65% 85%, 35% 85%, 15% 50%);
}
```

### Coordinate Breakdown

| Point | X | Y | Description |
|-------|---|---|-------------|
| Top-left | 25% | 0% | Upper-left vertex |
| Top-right | 75% | 0% | Upper-right vertex |
| Right | 100% | 50% | Right apex |
| Bottom-right | 75% | 100% | Lower-right vertex |
| Bottom-left | 25% | 100% | Lower-left vertex |
| Left | 0% | 50% | Left apex |

### Key Visual Characteristics

- **Aspect ratio**: 1:1 (regular hexagon)
- **Orientation**: Flat edges top/bottom, pointed sides left/right
- **Color scheme**: Purple (#8247E5) to violet/fuchsia

### Sources

- [DailyCoin - Polygon MATIC Rebranding](https://dailycoin.com/polygon-matic-name-why-this-cryptocurrency-keeps-rebranding/)
- [Logotyp.us - Polygon Logo History](https://logotyp.us/logo/polygon/)
- [CryptoLogos - Polygon Logo](https://cryptologos.cc/polygon)

---

## R5: VoidPay (Brand) Logo Shape

### Design Concept

VoidPay represents a "void" or "black hole" concept - stateless, decentralized, privacy-first. Suggested abstract shapes:

### Option A: Event Horizon Ring

A ring shape (like Optimism) but with gradient fade suggesting matter disappearing into the void.

```css
.voidpay-ring {
  border-radius: 50%;
  background: radial-gradient(circle at center,
    transparent 40%,
    rgba(168, 85, 247, 0.5) 60%,
    transparent 80%
  );
}
```

### Option B: Spiral/Vortex (Complex)

Would require SVG path for true spiral. Simplified as rotating concentric ellipses.

### Option C: Abstract Void (Recommended)

A "blob" shape that feels organic and otherworldly - representing the formless nature of stateless architecture.

```css
/* Organic blob - uses border-radius morphing */
.voidpay-blob {
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  /* Animate border-radius for morphing effect */
}
```

### Key Visual Characteristics

- **No sharp edges** - represents "formlessness" of stateless architecture
- **Color scheme**: Purple/violet (already used in project branding)
- **Animation**: Slow morphing or pulsing suggests "breathing void"

### Implementation in Project

The project already defines blob shapes in `src/widgets/network-background/shapes.tsx`:

```typescript
// Blob uses border-radius with organic shape
blob: undefined, // Uses border-radius instead of clip-path
// ...
borderRadius: isBlob ? '30% 70% 70% 30% / 30% 30% 70% 70%' : undefined,
```

---

## Summary: All CSS Clip-Path Values

```css
/* Ethereum - Diamond/Rhombus */
--eth-outer: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
--eth-inner: polygon(50% 20%, 80% 50%, 50% 80%, 20% 50%);

/* Arbitrum - Stylized A/Arrow */
--arb-arrow: polygon(50% 0%, 100% 100%, 70% 100%, 50% 35%, 30% 100%, 0% 100%);

/* Polygon - Hexagon */
--poly-hex: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
--poly-inner: polygon(35% 15%, 65% 15%, 85% 50%, 65% 85%, 35% 85%, 15% 50%);

/* Optimism - Circle (no clip-path needed) */
/* Use border-radius: 50% */

/* VoidPay - Blob (no clip-path needed) */
/* Use border-radius: 30% 70% 70% 30% / 30% 30% 70% 70% */
```

---

## Existing Project Implementation

The project already implements these shapes in two locations:

### 1. `src/widgets/network-background/shapes.tsx`

```typescript
const CLIP_PATHS: Record<ShapeType, string | undefined> = {
  rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  triangle: 'polygon(50% 0%, 100% 100%, 70% 100%, 50% 35%, 30% 100%, 0% 100%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  circle: undefined,  // Uses border-radius
  blob: undefined,    // Uses border-radius
}
```

### 2. `src/shared/ui/network-background.tsx`

```typescript
const CLIP_PATHS = {
  ethereumOuter: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  ethereumInner: 'polygon(50% 20%, 80% 50%, 50% 80%, 20% 50%)',
  arbitrumArrow: 'polygon(50% 0%, 100% 100%, 70% 100%, 50% 35%, 30% 100%, 0% 100%)',
  polygonHex: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  polygonInner: 'polygon(35% 15%, 65% 15%, 85% 50%, 65% 85%, 35% 85%, 15% 50%)',
}
```

---

## Visual Reference

```
ETHEREUM (Diamond)          ARBITRUM (Arrow)           POLYGON (Hexagon)
      *                          *                        ____
     / \                        /|\                      /    \
    /   \                      / | \                    /      \
   /     \                    /  |  \                  |        |
   \     /                   /   *   \                  \      /
    \   /                   /___|___\ \                  \____/
     \ /                   (notched base)
      *

OPTIMISM (Ring)             VOIDPAY (Blob)
    ____                      .--~~--.
   /    \                   .'        '.
  |  __  |                 /    .--.    \
  | |  | |                |   (    )    |
  |  --  |                 \    '--'   /
   \____/                   '-.____.-'
```

---

## Sources

- [1000logos.net - Ethereum Logo](https://1000logos.net/ethereum-logo/)
- [Brandfetch - Arbitrum](https://brandfetch.com/arbitrum.io)
- [Brandfetch - Optimism](https://brandfetch.com/optimism.io)
- [Logotyp.us - Polygon](https://logotyp.us/logo/polygon/)
- [CSS-Tricks - clip-path](https://css-tricks.com/almanac/properties/c/clip-path/)
- [Clippy - CSS clip-path maker](https://bennettfeely.com/clippy/)
- [CodePen - Hexagon with clip-path](https://codepen.io/chriscoyier/pen/NLXzXX)
- [MDN - polygon()](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/polygon)
