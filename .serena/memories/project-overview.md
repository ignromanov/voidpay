# VoidPay - Project Overview

**Project**: VoidPay - Stateless Crypto Invoice Platform
**Domain**: voidpay.xyz
**Status**: Active Development (MVP Phase)
**Constitution**: v1.13.0 (16 Principles - NON-NEGOTIABLE)
**Last Updated**: 2025-11-28 (v1.13.0 - UI stack update)

## What is VoidPay?

Privacy-first crypto invoicing platform where ALL invoice data is encoded in URLs. Zero backend, zero database, zero user accounts.

**Core Innovation**: Invoice state lives in compressed URL parameters (`https://voidpay.xyz/pay?d=N4IgbghgTg9g...`)

## Philosophy

1. **Zero-Backend** - No server-side database or persistent state
2. **Privacy-First** - No analytics, no tracking, LocalStorage only
3. **Permissionless** - No signup, no KYC, no approval gates
4. **永久可用性** (Perpetual Availability) - Old URLs must work forever

## Target Users

- **Freelancers** - Crypto-native designers, developers
- **DAOs** - Contributor payments without centralized tools
- **Micro-SaaS** - Small businesses accepting crypto
- **Consultants** - International clients, low-friction invoicing

## USP (Unique Selling Proposition)

**"The only invoice tool that works even if we shut down."**

- No backend → Deploy anywhere (Vercel, IPFS, localhost)
- No database → URLs are self-contained
- No accounts → Instant start
- No surveillance → Full privacy

## Current MVP Scope

**Networks**: Ethereum, Arbitrum, Optimism, Polygon PoS
**Tokens**: Native + ERC20
**Features**: Invoice editor, Payment terminal, PDF export, LocalStorage history
**Security**: Magic Dust verification, Static blocklist, RPC proxy

## Tech Stack (Locked)

- Next.js 15+, React 19+, TypeScript 5+ (strict)
- Wagmi 2+, Viem 2+, RainbowKit 2+
- Zustand 5+, TanStack Query 5+
- Tailwind CSS 4+, Radix UI primitives, CVA, Framer Motion
- lz-string 1.5.0+ (URL compression)

## Architecture Pattern

**Feature-Sliced Design (FSD)**:
- `app/` - Routing (/, /create, /pay)
- `page-compositions/` - Page assembly
- `widgets/` - UI blocks (InvoicePaper, PaymentTerminal)
- `features/` - User actions
- `entities/` - Business logic (Invoice, Token, Network)
- `shared/` - Utilities, UI primitives

## Critical Files

- `.specify/memory/constitution.md` - 13 principles (READ FIRST)
- `.specify/memory/ROADMAP_P0.md` - MVP critical tasks
- `.specify/memory/brainstorm/DECISIONS.md` - All finalized decisions
- `CLAUDE.md` - Development guide for AI agents

## Development Workflow

1. Read constitution before ANY architectural decision
2. Use `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
3. All features developed in isolated Git worktrees (Principle X)
4. Update ROADMAP_P*.md after feature completion (Principle IX)
5. MANDATORY: Use Serena symbolic tools for TypeScript/Markdown navigation (Principle XIII)

## Project Status

**Phase**: P0 (MVP Core Features)
**Completed**: P0.2 (URL Codec), P0.3 (Zustand Stores), P0.4 (RPC Proxy), P0.6 (FSD Structure), P0.6.5 (Design System), P0.6.6 (App Shell)
**In Progress**: P0.8 (Page Compositions & UI Components)
**Next**: P0.12 (Payment Terminal), P0.13 (Magic Dust), P0.14 (Payment Polling)

## Key Constraints

- URL max 2000 bytes (compressed)
- Notes field max 280 chars (hard limit)
- Schema v1 LOCKED (breaking changes = new version + migration)
- RPC keys server-side only (never in client)
- Finalized confirmations required (15-45 min depending on network)
- Magic Dust exact matching (NO fuzzy tolerance)

## NEVER Do

- Add server-side database for invoices
- Implement user authentication/registration
- Add analytics (GA, Sentry, etc.)
- Expose RPC keys in client code
- Modify existing schema parsers (versioning required)
- Use Read/Grep for TypeScript/Markdown (use Serena symbolic tools)

## ALWAYS Do

- Encode invoice state in URLs
- Store user data in LocalStorage only
- Validate schema version on parse
- Use RPC proxy (`/api/rpc`) for blockchain calls
- Wait for finalized confirmations
- Use Serena MCP tools for code navigation (Principle XIII)
