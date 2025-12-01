# Product Context

**Last Updated**: 2025-12-01
**Project**: VoidPay - Stateless Crypto Invoice Platform
**Constitution**: v2.0.0 (14 Principles)

## What is VoidPay?

Privacy-first crypto invoicing. ALL invoice data encoded in URLs. Zero backend, zero database, zero accounts.

**Core Innovation**: `https://voidpay.xyz/pay?d=N4IgbghgTg9g...` ← Compressed invoice JSON

## Philosophy (The 4 Pillars)

1. **Zero-Backend** — No server-side database
2. **Privacy-First** — No analytics, no tracking
3. **Permissionless** — No signup, no KYC
4. **Perpetual Availability** — Old URLs work forever

## Target Users

- **Freelancers** — Crypto-native designers, developers
- **DAOs** — Contributor payments without centralized tools
- **Micro-SaaS** — Small businesses accepting crypto
- **Consultants** — International clients, low-friction invoicing

## USP

**"The only invoice tool that works even if we shut down."**

- No backend → Deploy anywhere (Vercel, IPFS, localhost)
- No database → URLs are self-contained
- No accounts → Instant start
- No surveillance → Full privacy

## MVP Scope

| Category     | Details                                                            |
| ------------ | ------------------------------------------------------------------ |
| **Networks** | Ethereum, Arbitrum, Optimism, Polygon PoS                          |
| **Tokens**   | Native + ERC20                                                     |
| **Features** | Invoice editor, Payment terminal, PDF export, LocalStorage history |
| **Security** | Magic Dust verification, Static blocklist, RPC proxy               |

## Key Constraints

- URL max 2000 bytes (compressed)
- Notes max 280 chars
- Schema v1 LOCKED (breaking changes = new version)
- RPC keys server-side only
- Finalized confirmations (15-45 min)
- Magic Dust exact matching (NO fuzzy tolerance)

## Critical Files

- `.specify/memory/constitution.md` — 14 Principles (READ FIRST)
- `CLAUDE.md` — Agent guide
- `.specify/memory/ROADMAP_P0.md` — MVP tasks
