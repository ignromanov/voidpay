# AGENTS.md — VoidPay (voidpay.xyz)

> Instructions for AI coding agents (Antigravity, Codex, Gemini CLI, Cursor, Copilot, Claude Code, …).
> Humans: see [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
> **Maintainers:** if `.ai/AGENTS.md` exists (private ops overlay, symlinked from `../ai`), read it too — it adds specs, memory and process rules.

## Product in one paragraph

VoidPay is privacy-first crypto invoicing where **the URL is the invoice**. Invoice data is TLV-encoded, Brotli-compressed and stored in the URL **hash fragment** (never sent to a server). No backend database, no signup, no tracking. Payment is P2P from the payer's wallet. Old links must work forever.

## Non-negotiable invariants

1. **Perpetual URLs** — never change how an existing schema version decodes. New data = new TLV tags (even = mandatory, odd = optional/ignored by old parsers). Codec format: [docs/codec-v1-format.md](docs/codec-v1-format.md).
2. **Zero-backend** — no database or persistent server-side user state. Server code is limited to stateless edge/API helpers (RPC proxy, OG images, rate limiting via transient KV).
3. **Privacy** — invoice contents, wallet addresses, amounts, names and notes never go to analytics, logs, error reports or any server request. Analytics are cookie-free, aggregate-only, typed, and user-opt-out.
4. **Web3 safety** — token decimals are baked into the URL at creation (no runtime fetch); exact-amount matching (Magic Dust), no fuzzy tolerance; wait for `finalized` confirmations; unknown tokens show a warning; RPC keys are server-side only.
5. **Fail-closed security** — the edge guard / rate limiter must fail closed; don't add fail-open fallbacks.

## Stack

Next.js 16 (App Router, Turbopack dev / webpack build) · React 19 · TypeScript (strict, project references) · Tailwind CSS v4 + CVA + `tailwind-merge` · Radix UI · Framer Motion · wagmi 2 + viem 2 + RainbowKit · TanStack Query · Zustand 5 · react-hook-form + zod · Vitest 4 + Testing Library · Remotion (marketing video) · Upstash (rate limiting). Node 24 (`.nvmrc`), pnpm 10.

## Commands

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Dev server | `pnpm dev` (http://localhost:3000) |
| Fast validation (run before every "done") | `pnpm type-check:build & pnpm lint & wait` |
| Tests + coverage (≥80% required) | `pnpm test:coverage` |
| Single test file | `pnpm vitest run path/to/file.test.ts` |
| Full validation | `pnpm validate` |
| Production build / start | `pnpm build && pnpm start` |
| Format | `pnpm format` |

Env: copy `.env.example` → `.env.local`. Never commit `.env*` or print secrets.

## Architecture — Feature-Sliced Design

```
src/
  app/       Next.js routes, layouts, providers, API routes   (may import anything below)
  widgets/   composed page sections                           (→ features, entities, shared)
  features/  user-facing capabilities (payment, invoice-codec, generate-link, …)  (→ entities, shared)
  entities/  business models: invoice, network, token, creator, user              (→ shared)
  shared/    ui kit, lib, config — no business logic                              (→ external only)
  video/     Remotion compositions
  proxy.ts   edge middleware (rate limiting / guard)
```

- Imports go **downward only**. Features never import features; entities never import features.
- Import other slices only through their public `index.ts` (`@/features/invoice`, `@/shared/ui`) — never deep paths. Inside a slice, relative imports are fine.
- Business types/constants live in `entities/`; generic utils in `shared/lib/`; app config in `shared/config/`. Grep `entities/` and `shared/` before creating anything new.

## Code style

- `unknown` over `any`; named exports; explicit return types on public functions.
- `?.` and `??` over `&&` / `||` for optional/nullish values.
- Functions < 50 lines, single-level ternaries, early returns, destructured props.
- PascalCase components/types, `use*` hooks, SCREAMING_SNAKE_CASE constants.
- UI: Radix primitives + CVA variants + `cn()`; reuse existing components before adding new ones. Dark "desk" app chrome (`zinc-950`) with light "paper" invoice.

## Testing

- Import render utilities from `@/shared/lib/test-utils` (never directly from `@testing-library/react`). `vi`, `describe`, `it`, `expect` are globals.
- Reuse fixtures: `TEST_INVOICES.full()` / `.minimal()` / `.unicode()` (call as functions), `TEST_ADDRESSES`, `TEST_PARTIES`, `TEST_LINE_ITEMS`, `TEST_TIMESTAMPS`, `generateRandomInvoice()`, `createLargeInvoice()`.
- Codec / URL changes need round-trip and backward-compat tests against existing vectors.
- No absolute machine paths (`/Users/...`, `/home/...`) in tests or scripts.

## Gotchas

- **Never** `router.push/replace` or `next/link` to a URL containing an invoice `#hash` — use `navigateToHashUrl` from `@/shared/lib/navigation`. The prod router duplicates the hash on cached routes (`#A#A` → "Corrupted Data"); `next dev` does not reproduce it — verify with `pnpm build && pnpm start`.
- `pnpm build` runs a `prebuild` step (demo hash generation) and `postbuild` sitemap generation.
- Pre-push hook runs `lint-staged` + `type-check:build`.

## Git & PRs

- Git Flow: branch `###-short-slug` from `develop`; PRs target **`develop`** (squash merge only). `master` = releases (merge commit only, via release PR).
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:` (+ optional scope, e.g. `fix(security): …`).
- PR description: what/why, linked issue, test evidence, screenshots for UI changes. Keep PRs focused.
