# API Contracts: Landing Page

**Feature**: 012-landing-page | **Date**: 2025-12-01

## No API Endpoints Required

This feature is a **static marketing page** with no backend API requirements.

### Rationale

Per Constitutional Principle I (Zero-Backend Architecture):
- All content is statically defined in TypeScript
- No user data is collected or stored
- No server-side processing required
- Page is fully rendered at build time (SSG compatible)

### External Dependencies

| Dependency | Purpose | Contract |
|------------|---------|----------|
| None | N/A | N/A |

### Internal Route

| Route | Method | Purpose |
|-------|--------|---------|
| `/` | GET | Landing page (static HTML) |

**Note**: `/create` and `/pay` routes are existing routes, not part of this feature.

## Component Contracts

Since no API contracts exist, widget component interfaces serve as the internal "contracts":

### HeroSection

```typescript
// Input: None (static content)
// Output: JSX.Element
type HeroSectionProps = {
  className?: string;
};
```

### DemoSection

```typescript
// Input: Optional configuration
// Output: JSX.Element with auto-rotating demo
type DemoSectionProps = {
  className?: string;
  autoRotate?: boolean;        // Default: true
  rotationInterval?: number;   // Default: 10000ms
};
```

### HowItWorks

```typescript
// Input: None (static content)
// Output: JSX.Element
type HowItWorksProps = {
  className?: string;
};
```

### WhyVoidPay

```typescript
// Input: None (static content)
// Output: JSX.Element
type WhyVoidPayProps = {
  className?: string;
};
```

### FooterCta

```typescript
// Input: None (static content)
// Output: JSX.Element
type FooterCtaProps = {
  className?: string;
};
```

## Navigation Contracts

| User Action | Destination | Method |
|-------------|-------------|--------|
| Click "Start Invoicing" (Hero) | `/create` | Next.js Link |
| Click "Create Free Invoice" (Footer) | `/create` | Next.js Link |
| Click "Use This Template" (Demo) | `/create?template={id}` | Next.js Link with query |
