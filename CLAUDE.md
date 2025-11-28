# CLAUDE.md - VoidPay Development Guide

> **VoidPay** - Stateless Crypto Invoice Platform
> **Constitution**: `.specify/memory/constitution.md` (v1.6.0) 🔴 **READ FIRST**

---

## 🎯 What is VoidPay?

Privacy-first crypto invoicing platform. Invoice data encoded in **URLs** (no backend, no database).

**URL State Model**: `https://voidpay.xyz/pay?d=N4IgbghgTg9g...` ← Compressed invoice JSON

---

## 📜 Constitutional Principles (NON-NEGOTIABLE)

**Read `.specify/memory/constitution.md` before ANY architectural decisions.**

### The Ten Principles

1. **Zero-Backend** - No server-side database or persistent state
2. **Privacy-First** - No analytics, no tracking, LocalStorage only
3. **Permissionless** - No signup, no KYC, no approval gates
4. **Backward Compatibility** - Old URLs must work forever (strict versioning)
5. **Security & Abuse Prevention** - GitHub blocklist, no OFAC in MVP
6. **RPC Key Protection** - Serverless proxy only, never expose in client
7. **Web3 Safety** - Baked decimals, finalized confirmations, exact matching
8. **Documentation Context Efficiency** - Information-dense docs for AI agents
9. **Implementation Deviation Tracking** - Track reality vs. plan in `ROADMAP_P*.md`
10. **Git Worktree Isolation** - Each feature in isolated worktree (parallel development)

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
├── ROADMAP.md            # Project Status & Index
├── ROADMAP_P0.md         # Critical / MVP Blocker
├── ROADMAP_P1.md         # High / MVP Core
├── ROADMAP_FUTURE.md     # Future / Post-MVP
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

## 🧪 Testing (Constitutional Principle XVI)

**TDD Cycle**: Red → Green → Refactor (Classic Detroit style)

### Requirements

| Requirement            | Value                               |
| ---------------------- | ----------------------------------- |
| **Coverage threshold** | 80%+ for merge                      |
| **Framework**          | Vitest                              |
| **Test location**      | `__tests__/` co-located with source |
| **Web3 tests**         | Mocked RPC only (no testnet in CI)  |
| **Snapshots**          | MANDATORY for schema/URL encoding   |

### Commands

```bash
pnpm test           # Run all tests
pnpm test:coverage  # Run with coverage (80% threshold enforced)
pnpm test:watch     # Watch mode for TDD development
pnpm test:ui        # Vitest UI for visual debugging
pnpm typecheck      # TypeScript type checking
```

### Test Utilities

Located in `src/shared/test-utils/`:

- **render.tsx** - Custom React render with Wagmi + QueryClient providers
- **wagmi-mock.ts** - Mock Wagmi configuration using `mock` connector
- **rpc-mocks.ts** - RPC mock utilities for Web3 testing without network calls

```typescript
// Example: Testing with mocked Web3
import { render, setupRpcMocks, MOCK_WALLETS } from '@/shared/test-utils'

const cleanup = setupRpcMocks({
  eth_getBalance: () => '0xde0b6b3a7640000', // 1 ETH
})
// ... your tests ...
cleanup()
```

### Mandatory Test Coverage

1. **Schema versioning** - Old URLs parse correctly (snapshot tests)
2. **URL compression** - Round-trip without data loss (snapshot tests)
3. **Magic Dust** - Unique, within range, exact match (unit tests)
4. **Multi-network** - Each network confirmation flow (mocked RPC tests)

### Git Hooks

- **Pre-commit**: `pnpm lint-staged && pnpm typecheck`
- **Pre-push**: `pnpm test:coverage` (blocks if <80%)

---

## 📚 Documentation

**Read First**:

1. `.specify/memory/constitution.md` - GOVERNANCE 🔴
2. `.specify/memory/ROADMAP.md` - Project Status & Index
3. `.specify/memory/brainstorm/DECISIONS.md` - Tech stack

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

**CONSTITUTIONAL REQUIREMENT**: All features MUST follow SpecKit workflow (Principle XV). Ad-hoc development is PROHIBITED.

### Feature Development (with Git Worktrees)

Each feature is developed in an **isolated Git worktree** to enable parallel development without conflicts:

```bash
# 1. Create feature (automatically creates worktree)
/speckit.specify "Add user authentication"
# Creates: worktrees/001-user-auth/
# All work happens in worktree

# 2. Plan → Tasks → Implement (all in worktree)
/speckit.plan
/speckit.tasks
/speckit.implement

# 3. After completion: integrate and cleanup
git checkout main
git merge 001-user-auth
git worktree remove worktrees/001-user-auth
git worktree prune
```

**Benefits**:

- Multiple agents can work on different features simultaneously
- No filesystem conflicts between concurrent features
- Clean separation: `worktrees/001-feature-a/` vs `worktrees/002-feature-b/`

### Process

1. Read constitution before starting
2. **Consult Serena memories** via `mcp__serena__*` tools (Principle XIV)
3. `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
4. Verify Constitution Check (all 15 principles)
5. All work happens in feature worktree (Principle X)
6. **Update Roadmap & Memories**: Mark item completed in `ROADMAP_P*.md`, update Serena memories if new patterns discovered

---

## 🧰 Serena MCP Usage Guidelines

**⚠️ CONSTITUTIONAL REQUIREMENTS**:

- **Principle XIII**: Serena symbolic tools MANDATORY for TypeScript/Markdown navigation
- **Principle XIV**: Serena memories (`.serena/memories/`) MANDATORY as project knowledge source of truth

**Access**: All Serena operations via `mcp__serena__*` tools. Direct file access to `.serena/` is PROHIBITED.

**Indexed Files**: 67+ Markdown + All TypeScript (see `.serena/cache/`)

### 🚫 PROHIBITED (Constitutional Violations)

1. ❌ **PROHIBITED** - Reading .ts/.tsx/.md files via Read without prior `get_symbols_overview`
2. ❌ **PROHIBITED** - Using Grep to find TypeScript functions/classes/types/interfaces
3. ❌ **PROHIBITED** - Using Grep to search Markdown documentation files
4. ❌ **PROHIBITED** - Editing symbols without `find_referencing_symbols` check
5. ❌ **PROHIBITED** - Using Read + Edit for entire symbol replacement (use `replace_symbol_body`)
6. ❌ **PROHIBITED** - Direct file access to `.serena/memories/` (use `mcp__serena__*` tools)

### ✅ MANDATORY (Constitutional Requirements)

1. ✅ **MANDATORY** - Use `get_symbols_overview` before reading any TypeScript/Markdown file
2. ✅ **MANDATORY** - Use `find_symbol` for locating functions/classes by name
3. ✅ **MANDATORY** - Use `find_referencing_symbols` before editing any symbol
4. ✅ **MANDATORY** - Use `search_for_pattern` (Serena) instead of Grep for .ts/.md files
5. ✅ **MANDATORY** - Use `replace_symbol_body` for replacing entire functions/classes
6. ✅ **MANDATORY** - Consult Serena memories via `mcp__serena__read_memory` before starting features

### Core Principles

1. **Never Read Entire Files Unless Necessary**
   - Use `get_symbols_overview` to see file structure first
   - Read only specific symbols with `find_symbol`
   - ONLY read full files for non-code content or when symbol tools insufficient

2. **Intelligent Step-by-Step Code Reading**
   - Start with overview → Find specific symbols → Read only needed bodies
   - Use cached index (67+ Markdown files + All TypeScript)
   - Don't re-read what you already have

3. **Symbol-First Navigation**
   - Symbols identified by `name_path` + `relative_path`
   - Example: `Foo/__init__` (Python) or `MyClass/myMethod` (TypeScript)
   - Use `depth` parameter to control child symbol visibility

### Workflow

**Before Any Code Changes (REQUIRED):**

```
1. get_symbols_overview (file) → see top-level structure
2. find_symbol (specific symbol) → get details without body
3. find_symbol (with include_body=true) → read implementation
4. find_referencing_symbols → understand usage before editing
```

**For Code Search:**

- `search_for_pattern` (Serena) - REQUIRED for TypeScript/Markdown content search
- `find_symbol` - Symbolic search when you know name
- `find_referencing_symbols` - Track dependencies
- `Grep` - ONLY for non-indexed files (CSS, HTML, YAML)

**For Editing:**

- `replace_symbol_body` - Replace entire function/class (REQUIRED for full symbol changes)
- `insert_after_symbol` - Add new code after symbol
- `insert_before_symbol` - Add imports or prepend code
- `Read` + `Edit` - ONLY for small edits within a symbol body

### ⚠️ Anti-Patterns (Constitutional Violations)

**VIOLATION #1**: Reading TypeScript without symbols

```
❌ Read("src/features/invoice/create.tsx")  // PROHIBITED
✅ get_symbols_overview("src/features/invoice/create.tsx")  // CORRECT
```

**VIOLATION #2**: Using Grep for code symbols

```
❌ Grep(pattern="function createInvoice", type="ts")  // PROHIBITED
✅ find_symbol("createInvoice")  // CORRECT
```

**VIOLATION #3**: Reading full file then using symbolic tools (wasteful)

```
❌ Read("file.ts") → find_symbol("Foo")  // PROHIBITED (duplication)
✅ find_symbol("Foo", include_body=true)  // CORRECT (efficient)
```

**VIOLATION #4**: Editing without checking references

```
❌ replace_symbol_body() without find_referencing_symbols  // PROHIBITED (unsafe)
✅ find_referencing_symbols() → review → replace_symbol_body()  // CORRECT
```

**VIOLATION #5**: Grep in Markdown documentation

```
❌ Grep(pattern="Constitutional Principle", glob="**/*.md")  // PROHIBITED
✅ search_for_pattern("Constitutional Principle", paths_include_glob="**/*.md")  // CORRECT
```

### Rationale

- **Token Efficiency**: Symbolic reads save 10-100x tokens vs full file reads
- **Semantic Understanding**: Language servers provide type info that grep cannot
- **Refactoring Safety**: `find_referencing_symbols` prevents breaking changes
- **Constitutional Alignment**: Supports Principle VIII (Context Efficiency)

**Memory**: Serena creates project-specific memories in `.serena/memories/` (auto-populated on first use)

---

**Philosophy**: Privacy > Features. Simplicity > Cleverness. YAGNI always.

## Active Technologies

- TypeScript 5.x+ (Strict Mode) + `lz-string` (v1.5.0+), `zod` (for runtime validation), `big.js` or native `BigInt` (for amounts) (002-url-state-codec)
- None (Stateless URL-based state) (002-url-state-codec)
- TypeScript 5.x+ + Next.js 15+ (App Router + Edge Runtime), Wagmi v2+, Viem v2+ (004-rpc-proxy-failover)
- N/A (testing infrastructure only) (005-testing-environment)

- TypeScript 5.x+ (strict mode) + Zustand 5+, Zustand persist middleware, Next.js 15+ (App Router), React 18+ (003-zustand-state-management)
- Browser LocalStorage (client-side only, no server-side database) (003-zustand-state-management)

- Next.js 16.0.3+, React 19.0.0+, TypeScript 5.x+ (strict mode), Node.js 20+ (specified in .nvmrc)
- Wagmi 2.19.4+, Viem 2.39.3+, RainbowKit 2.2.9+
- Zustand 5.0.8+, TanStack Query 5.90.10+
- Tailwind CSS 4.1.17+, shadcn/ui (Radix UI), Lucide React (latest)
- lz-string 1.5.0+, clsx 2.1.1+, tailwind-merge 2.5.4+
- Client-side only (LocalStorage via Zustand persist), no backend database (Constitutional Principle I)

## Recent Changes

- 2025-11-19: Constitution v1.4.0 - Added Git Worktree isolation principle for concurrent development
- 2025-11-19: Constitution v1.1.0 - Locked library versions with latest stable releases
- 001-project-initialization: Initial project setup with core technology stack
