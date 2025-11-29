# VoidPay - Constitutional Principles (Quick Reference)

**Version**: 1.13.0
**Last Updated**: 2025-11-28 (v1.13.0 - shadcn/ui → Radix + CVA + Framer Motion)
**Status**: NON-NEGOTIABLE (Requires amendment for changes)
**Full Document**: `.specify/memory/constitution.md`

## The 16 Principles

### I. Zero-Backend Architecture
- NO server-side database for invoice data
- NO user authentication/session management
- Invoice state MUST be self-contained in URLs
- LocalStorage permitted for user preferences/history only
- **Exception**: Transient operational storage (Redis/KV) for rate limiting, caching (NO user data, explicit TTL)

### II. Privacy-First & Self-Custody
- NO analytics or telemetry
- NO tracking of user behavior
- History MUST be LocalStorage only
- NO third-party services (Sentry, GA)
- Export/import functionality required

### III. Trustless & Permissionless
- NO user registration or KYC
- NO approval workflows
- Direct peer-to-peer payments
- NO custody of user funds

### IV. Backward Compatibility & Schema Versioning
- Schema version (`v`) MUST be in every URL
- Old parsers MUST NEVER be modified
- New versions = new parsers + migration adapters
- Breaking changes require new version
- Reserved fields (`_reserved1-5`) in schema v1

### V. Security & Abuse Prevention
- Static blocklist via public GitHub repo
- SHA-256 hash of full URL params
- "Report Abuse" functionality required
- OFAC screening prohibited in MVP
- SEO noindex on `/pay` and `/create`

### VI. RPC Key Protection & Rate Limiting
- RPC keys MUST be server-side env vars
- Edge Functions as proxy (`/api/rpc`)
- Multi-provider failover (Alchemy primary, Infura fallback)
- Aggressive caching (static data: `staleTime: Infinity`)
- Rate limiting at proxy level

### VII. Web3 Safety & Transaction Validation
- Token decimals "baked" into URL at creation
- Token addresses validated against Uniswap Token List
- Finalized confirmations required (15-45 min)
- **Magic Dust**: Exact amount matching (NO tolerance)
- Native Currency ONLY for post-payment donations
- TxHash stored in LocalStorage (NOT in URL)

### VIII. Documentation Context Efficiency
- Information-dense, concise documentation
- Structured formats > prose paragraphs
- Soft limits: spec.md <400 lines, plan.md <300 lines
- Abbreviated JSON keys (e.g., `iss` not `issueDate`)
- Cross-reference external docs (no duplication)

### IX. Implementation Deviation Tracking
- Record deviations at task completion
- Document: What planned, What implemented, Rationale, Impact
- Update ROADMAP_P*.md after feature completion
- Format: `- [x] T001 [Desc] | Deviation: [None | <desc>]`
- Major deviations trigger immediate artifact updates

### X. Git Worktree Isolation
- Each feature MUST use dedicated worktree
- Naming: `worktrees/###-feature-name`
- NO cross-worktree file modifications
- Cleanup after merge: `git worktree remove` + `git worktree prune`

### XI. Design Fidelity & Design Source Integration
- **Primary Source**: AI Studio (Gemini 3 Pro) prototype (`assets/aistudio/v3/`) - CURRENT
- **Legacy Source**: Vercel V0 designs (`assets/v0/`) - DEPRECATED for new features
- **Component Library**: Radix UI primitives (Dialog, Select, Popover) + CVA for variants
- **Animation**: Framer Motion for complex animations (NetworkBackground, transitions)
- Pixel-perfect fidelity to design source
- Ask for guidance if design missing (DON'T invent)

### XII. UI/UX Design Principles
- **Hybrid Theme**: Dark Desk (Zinc-950) + Light Paper (White)
- **ISO 216 Compliance**: A4 aspect ratio 1:1.414 (MANDATORY)
- **App Shell**: Header/Footer (The Desk) vs Invoice (The Paper)
- **Network Themes**: Ambient glow per network (Arbitrum blue, Optimism red, Polygon purple)
- **Max Width**: `max-w-[1600px]` centered container

### XIII. Serena-First Code Navigation
- **MANDATORY**: Use Serena symbolic tools for TypeScript/Markdown
- **PROHIBITED**: Read/Grep for .ts/.tsx/.md files without `get_symbols_overview`
- **Workflow**: `get_symbols_overview` → `find_symbol` → `find_referencing_symbols` → `replace_symbol_body`
- **Indexed**: 67+ Markdown files + All TypeScript files
- **Rationale**: 10-100x token efficiency, semantic understanding, refactoring safety

### XIV. Serena Memory as Project Knowledge Repository (Enhanced v1.11.0)
- **READ**: Consult memories BEFORE starting any feature work
- **WRITE**: Update memories when discovering new patterns or decisions
- **MANDATORY UPDATE TRIGGERS**:
  1. Feature completion → update `development-status`
  2. New pattern discovered → write new pattern memory
  3. Tech stack change → update `tech-stack-locked`
  4. Architecture decision → update `architecture-summary`
  5. Stale detection → immediate update
- **Write-First Principle**: Discovered knowledge MUST be documented IMMEDIATELY
- **Memory Freshness**: Stale information is WORSE than no information
- **Content Quality**: CONCISE, information-dense, no verbose prose
  - NO redundant info (state each fact ONCE)
  - NO obvious info (only non-trivial decisions)
  - YES structured formats (tables, lists, code blocks)
  - YES abbreviated keys (save tokens)
- **Tools**: `mcp__serena__list_memories`, `read_memory`, `write_memory`, `edit_memory`
- **PROHIBITED**: Direct file access to `.serena/memories/`

### XV. SpecKit Workflow Compliance
- **MANDATORY**: specify → plan → tasks → implement (no skipping phases)
- **Artifacts**: specs/###-feature/ directory with spec.md, plan.md, tasks.md
- **Validation**: Constitution Check in plan.md validates ALL 16 principles
- **Integration**: Worktree isolation (X), Memory consultation (XIV), TDD cycle (XVI)

### XVI. Test-Driven Development (TDD) Discipline
- **Cycle**: Red → Green → Refactor (Classic Detroit style)
- **Coverage**: 80%+ threshold for merge to main
- **Framework**: Vitest (mandatory)
- **Web3**: All RPC interactions MUST be mocked (no testnet in CI)
- **Task Format**: T###-test (write first, must fail) → T###-impl (make pass)
- **Snapshots**: MANDATORY for schema and URL encoding

## Compliance Gates

Before ANY feature implementation, verify:
- ✅ No backend database introduced (I)
- ✅ No user auth added (III)
- ✅ Schema changes follow versioning (IV)
- ✅ Privacy-first approach preserved (II)
- ✅ RPC keys stay server-side (VI)
- ✅ UI follows Hybrid Theme + ISO 216 (XII)
- ✅ Serena tools used for code navigation (XIII)
- ✅ Serena memories consulted before planning (XIV)
- ✅ Memory update plan identified (XIV)
- ✅ TDD cycle planned: Red → Green → Refactor (XVI)

## Violation Examples

❌ `await db.invoices.create({...})` - VIOLATES Principle I
❌ `gtag('event', 'invoice_created')` - VIOLATES Principle II
❌ Modifying existing schema v1 parser - VIOLATES Principle IV
❌ `const provider = new JsonRpcProvider(ALCHEMY_KEY)` - VIOLATES Principle VI
❌ `if (received >= expected * 0.97)` fuzzy match - VIOLATES Principle VII
❌ `Read("src/file.tsx")` before `get_symbols_overview` - VIOLATES Principle XIII
❌ Feature completion without memory update - VIOLATES Principle XIV
❌ Finding stale memory and ignoring it - VIOLATES Principle XIV
❌ Verbose prose in memory (wastes tokens) - VIOLATES Principle XIV
❌ Writing implementation before tests - VIOLATES Principle XVI
❌ Merging with coverage <80% - VIOLATES Principle XVI

## Amendment Process

1. Document proposal in GitHub issue
2. Impact analysis (affected templates, code, UX)
3. Version bump decision (MAJOR/MINOR/PATCH)
4. Update dependent templates (`.specify/templates/`)
5. Add sync report (HTML comment at top of constitution.md)
6. Require project maintainer approval
