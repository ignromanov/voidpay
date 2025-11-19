# CLAUDE.md - VoidPay Development Guide

> **VoidPay** - Stateless Crypto Invoice Platform
> **Constitution**: `.specify/memory/constitution.md` (v1.1.0) 🔴 **READ FIRST**

---

## 🎯 What is VoidPay?

Privacy-first crypto invoicing platform. Invoice data encoded in **URLs** (no backend, no database).

**URL State Model**: `https://voidpay.xyz/pay?d=N4IgbghgTg9g...` ← Compressed invoice JSON

---

## 📜 Constitutional Principles (NON-NEGOTIABLE)

**Read `.specify/memory/constitution.md` before ANY architectural decisions.**

### The Seven Laws

1. **Zero-Backend** - No server-side database or persistent state
2. **Privacy-First** - No analytics, no tracking, LocalStorage only
3. **Permissionless** - No signup, no KYC, no approval gates
4. **Backward Compatibility** - Old URLs must work forever (strict versioning)
5. **Security & Abuse Prevention** - GitHub blocklist, no OFAC in MVP
6. **RPC Key Protection** - Serverless proxy only, never expose in client
7. **Web3 Safety** - Baked decimals, finalized confirmations, exact matching

### ❌ NEVER

- Server-side database for invoices
- User auth/registration
- Analytics (GA, Sentry, etc.)
- RPC keys in client code
- Modify existing schema parsers
- Fuzzy payment matching

### ✅ ALWAYS

- LocalStorage for user data
- URL parameters for invoice state
- Schema version validation
- Serverless RPC proxy
- Finalized confirmations (15-45 min)
- Magic Dust exact matching
- Feature-Sliced Design (FSD)

---

## 🛠️ Tech Stack (LOCKED)

**Core**: Next.js 16.0.3+, React 19.0.0+, TypeScript 5.x+, Node.js 20+, Tailwind CSS 4.1.17+, shadcn/ui
**Web3**: Wagmi 2.19.4+, Viem 2.39.3+, RainbowKit 2.2.9+
**RPC**: Alchemy (primary), Infura (fallback)
**State**: Zustand 5.0.8+ + persist, TanStack Query 5.90.10+, lz-string 1.5.0+
**UI**: Lucide React (latest), clsx 2.1.1+, tailwind-merge 2.5.4+
**Networks**: Ethereum, Arbitrum, Optimism, Polygon PoS

---

## 📁 Structure (FSD)

```
src/
├── app/        # Routes (/, /create, /pay, /api/rpc)
├── widgets/    # InvoiceCard, PaymentFlow
├── features/   # CreateInvoice, ProcessPayment
├── entities/   # Invoice, Token, Network
└── shared/     # Utils, UI primitives

.specify/memory/
├── constitution.md       # 🔴 GOVERNANCE
└── brainstorm/
    ├── DECISIONS.md      # Tech choices
    └── *.md              # Design rationale
```

**Routing**:

- `/` - Landing (indexed)
- `/create` - Editor (noindex)
- `/pay?d=...` - Payment (noindex)

---

## 📊 Invoice Schema v1 (LOCKED)

```typescript
interface InvoiceSchemaV1 {
  v: 1;           // Version
  id: string;     // INV-001
  iss: string;    // Issue date (ISO)
  due: string;    // Due date
  nt?: string;    // Notes (max 280 chars)
  net: number;    // Chain ID
  cur: string;    // Currency symbol
  t?: string;     // Token address (undefined = native)
  dec: number;    // Decimals (MANDATORY - baked in)
  f: {...};       // From (name, wallet)
  c: {...};       // Client (name, optional wallet)
  it: [...];      // Line items (description, qty, rate)
  tax: number;    // Tax %
  dsc: number;    // Discount
}
```

**URL Limits**: Max 2000 bytes (compressed), Notes max 280 chars

---

## 🔐 Security Model

### RPC Proxy (REQUIRED)

```
Client → Edge Function (/api/rpc) → Alchemy/Infura
         (adds API key from env)
```

Keys in Vercel env vars, never in client.

### Magic Dust Verification

```typescript
// Creation: Add unique micro-amount
const dust = crypto.getRandomValues(...)[0] % 1000 / 1000000;
const exact = 1000 + dust; // 1000.000042 USDC

// Verification: Exact match only (NO tolerance)
if (received === exact) // ✅
if (received >= exact * 0.97) // ❌ WRONG
```

Display: "Pretty Print" (1,000.00) + "Exact" (1,000.000042)

---

## 🚨 Common Mistakes

### ❌ DON'T

```typescript
// Server-side storage
await db.invoices.create({...}); // VIOLATES Principle I

// Analytics
gtag('event', 'invoice_created'); // VIOLATES Principle II

// Modify existing parser
if (invoice.v === 1) { /* changing breaks old URLs! */ }

// Client RPC keys
const provider = new JsonRpcProvider(`...${ALCHEMY_KEY}`); // VIOLATES Principle VI
```

### ✅ DO

```typescript
// URL state
const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(invoice));
router.push(`/pay?d=${compressed}`);

// LocalStorage
useCreatorStore.persist.setOptions({
  name: 'voidpay-creator',
  storage: createJSONStorage(() => localStorage),
});

// New schema version (old untouched)
function parse(data: any) {
  if (data.v === 1) return parseV1(data);
  if (data.v === 2) return parseV2(data); // NEW
}

// RPC proxy
// app/api/rpc/route.ts
export async function POST(req: Request) {
  const { method, params } = await req.json();
  return fetch(`...${process.env.ALCHEMY_KEY}`, {...});
}
```

---

## 🧪 Testing (MUST)

1. **Schema versioning** - Old URLs parse correctly
2. **URL compression** - Round-trip without data loss
3. **Magic Dust** - Unique, within range, exact match
4. **Multi-network** - Each network confirmation flow

---

## 📚 Documentation

**Read First**:

1. `.specify/memory/constitution.md` - GOVERNANCE 🔴
2. `.specify/memory/brainstorm/DECISIONS.md` - Tech stack
3. `.specify/memory/brainstorm/BRAINSTORM_SUMMARY.md` - Overview

**Architecture**: `brainstorm/02-architectural-hypotheses.md`
**UX Design**: `brainstorm/03-ux-and-design.md`
**Web3 Logic**: `brainstorm/04-web3-mechanics.md`

---

## 🎨 Design

**Accent**: Electric Violet `#7C3AED`
**Typography**: Geist Sans (UI), Geist Mono (data)
**Theme**: Dark mode (Zinc-950)
**Network Themes**: ETH (gray), Arbitrum (blue), Optimism (red), Polygon (purple)

---

## 🔄 Workflow

1. Read constitution before starting
2. `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
3. Verify no principle violations

---

**Philosophy**: Privacy > Features. Simplicity > Cleverness. YAGNI always.

## Active Technologies

- Next.js 16.0.3+, React 19.0.0+, TypeScript 5.x+ (strict mode), Node.js 20+ (specified in .nvmrc)
- Wagmi 2.19.4+, Viem 2.39.3+, RainbowKit 2.2.9+
- Zustand 5.0.8+, TanStack Query 5.90.10+
- Tailwind CSS 4.1.17+, shadcn/ui (Radix UI), Lucide React (latest)
- lz-string 1.5.0+, clsx 2.1.1+, tailwind-merge 2.5.4+
- Client-side only (LocalStorage via Zustand persist), no backend database (Constitutional Principle I)

## Recent Changes

- 2025-11-19: Constitution v1.1.0 - Locked library versions with latest stable releases
- 001-project-initialization: Initial project setup with core technology stack
