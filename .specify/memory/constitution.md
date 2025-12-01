<!--
  SYNC IMPACT REPORT

  Version Change: 1.13.0 → 2.0.0

  Modified Principles:
  - REMOVED: XIII. Serena-First Code Navigation (moved to Memory Bank as agent tooling)
  - REMOVED: XIV. Serena Memory Repository (moved to Memory Bank protocol in .serena/memories/)
  - SIMPLIFIED: XV → XIII. Feature Specification Workflow (removed agent commands, kept artifact requirements)
  - RENUMBERED: XVI → XIV. Test-Driven Development (TDD) Discipline

  Added Sections:
  - None

  Removed Sections:
  - All agent-specific tool instructions (Serena MCP, symbolic navigation, memory access patterns)
  - SpecKit slash commands references (/speckit.specify, /speckit.plan, etc.)
  - Agent workflow patterns (moved to Memory Bank + SpecKit commands)

  Templates Requiring Updates:
  - agent-file-template.md (⚠ DEPRECATED - no longer used)
  - .serena/memories/* (✅ DONE - Memory Bank structure in place)

  Follow-up TODOs:
  - ✅ DONE: Memories renamed to Memory Bank format (activeContext, productContext, etc.)
  - ✅ DONE: Agent context moved from CLAUDE.md to Memory Bank

  Rationale:
  - Constitution should contain ONLY project governance and constraints
  - Agent tooling belongs in Memory Bank (.serena/memories/) + SpecKit slash commands
  - Separation enables constitution to be useful for human developers too

  Date: 2025-12-01
-->

# VoidPay Constitution

## Core Principles

### I. Zero-Backend Architecture (Stateless First)

**Principle**: The application MUST operate without a backend database or persistent server-side state for user data. All invoice data is encoded in URLs or stored client-side.

**Rules**:

- NO server-side database for storing invoice data
- NO user authentication or session management
- Invoice state MUST be self-contained in compressed URL parameters
- Client-side storage (LocalStorage) is permitted for user preferences and history only
- Server-side components are limited to: static hosting, RPC proxying, and OG image generation
- **Exception**: Transient operational storage (e.g., Redis/KV) is permitted for infrastructure state only:
  - Rate limiting counters (short TTL, no user data)
  - RPC response caching (ephemeral, no PII)
  - Operational metrics (anonymous, aggregated)
  - MUST NOT store user-identifiable data or invoice contents
  - MUST have explicit TTL and automatic expiration

**Rationale**: Ensures perpetual availability. Even if hosting is discontinued, the service can be instantly redeployed anywhere, including IPFS or local deployment. Users retain full control and ownership of their invoice data through self-contained URLs.

### II. Privacy-First & Self-Custody

**Principle**: User financial data MUST remain private and under user control at all times.

**Rules**:

- NO collection of analytics or telemetry about invoice creation or payments
- NO tracking of user behavior or payment patterns
- History MUST be stored exclusively in browser LocalStorage (never server-side)
- NO third-party analytics services (no Sentry, no Google Analytics)
- URL parameters MUST NOT leak through server logs (use client-side URL parsing)
- Export/import functionality MUST be provided for user data portability

**Rationale**: Financial privacy is a fundamental right. Centralized storage of transaction history creates honeypots for data breaches and enables surveillance. Users must have complete autonomy over their financial records.

### III. Trustless & Permissionless

**Principle**: The system MUST NOT require permission, registration, or trust in any centralized authority.

**Rules**:

- NO user registration or account creation
- NO KYC (Know Your Customer) requirements
- NO approval workflows or administrative gates
- Users MUST be able to create invoices without providing any personal information
- Payments MUST occur directly between parties (peer-to-peer) without intermediaries
- NO custody of user funds at any time

**Rationale**: Permissionless access is core to the crypto ethos. Any gating mechanism creates censorship opportunities and excludes users. True decentralization requires removing all trusted intermediaries.

### IV. Backward Compatibility & Schema Versioning

**Principle**: Once an invoice URL is generated, it MUST remain functional indefinitely regardless of future application changes.

**Rules**:

- Schema version (`v` field) MUST be embedded in every invoice URL
- Parsing logic for schema version N MUST NEVER be modified or removed
- New schema versions MUST be additive only (new versions = new parsers)
- Migration adapters MUST convert old schemas to new formats at runtime for display
- Reserved fields (`meta`, `_future`) MUST be included in schema v1 for extensibility
- URL compression format MUST remain stable (lz-string algorithm locked)
- Breaking changes require new schema version with migration adapter

**Rationale**: Following the Excalidraw model, breaking old URLs destroys user trust and creates data loss. Invoice URLs may be stored in emails, contracts, or bookmarks for years. Immutability of old versions is non-negotiable.

### V. Security & Abuse Prevention

**Principle**: The system MUST implement defense mechanisms against abuse while preserving privacy and permissionlessness.

**Rules**:

- Static blocklist MUST be maintained via public GitHub repository
- Blocklist MUST hash full URL parameters (SHA-256 of `?d=...`) to preserve privacy
- Blocklist updates MUST be transparent (public Pull Requests)
- "Report Abuse" functionality MUST be prominently displayed
- OFAC sanctions checking is explicitly prohibited in MVP (preserving permissionless philosophy)
- Disclaimers MUST clarify non-custodial nature and liability limits
- SEO indexing MUST be blocked on `/pay` and `/create` routes (X-Robots-Tag: noindex)
- Only landing page (`/`) should be indexed by search engines

**Rationale**: Abuse (phishing, scams) poses reputational and legal risks that could lead to domain blacklisting. However, mitigation MUST NOT compromise core principles. Blocklist via GitHub provides transparency, community moderation, and privacy preservation.

### VI. RPC Key Protection & Rate Limit Management

**Principle**: RPC provider API keys MUST be protected from exposure and abuse while maintaining decentralization.

**Rules**:

- RPC keys MUST be stored server-side in environment variables (never in client code)
- Edge Functions/API Routes MUST act as proxy between client and RPC providers
- Multiple RPC providers MUST be configured with automatic failover (Wagmi config)
- Primary provider: Alchemy (speed, Transfers API integration)
- Fallback provider: Infura (reliability, SLA guarantees)
- Static data (decimals, token symbols) MUST be cached aggressively (React Query `staleTime: Infinity`)
- Rate limiting MUST be implemented at proxy level to prevent abuse
- NO telemetry from proxy layer (privacy-first)

**Rationale**: Exposing RPC keys in client code leads to inevitable abuse and service disruption. Serverless proxy balances security with stateless architecture. Multi-provider failover ensures reliability. Aggressive caching minimizes RPC costs while maintaining decentralization.

### VII. Web3 Safety & Transaction Validation

**Principle**: All blockchain interactions MUST be validated for correctness and safety before execution.

**Rules**:

- Token decimals MUST be "baked" into URL at creation time (snapshot approach)
- Token addresses MUST be validated against Uniswap Token List
- Unknown tokens MUST display warning: "Unknown Token. Verify contract address carefully"
- Blue chip tokens (USDC, USDT, DAI, WETH) MUST show verified status (green checkmark)
- Network switching MUST be user-initiated ("Switch to Arbitrum" button), not automatic
- Transaction confirmation MUST wait for `finalized` status:
  - Ethereum: ~15 minutes (2 epochs)
  - Arbitrum/Optimism: ~10-15 minutes
  - Polygon PoS: ~30-45 minutes
- Payment verification MUST use exact amount matching (Magic Dust ensures uniqueness)
- NO reliance on fuzzy matching or tolerance thresholds
- Disclaimers MUST clarify direct peer-to-peer nature and irreversibility

**Rationale**: Cryptocurrency transactions are irreversible. Any error in decimals, addresses, or amounts results in permanent loss. Baking decimals into URLs eliminates RPC dependency and prevents decimal mismatch attacks. Finalized confirmations protect recipients from chain reorganizations. Magic Dust provides deterministic payment verification without backend.

### VIII. Documentation Context Efficiency

**Principle**: All project documentation MUST prioritize information density and context efficiency.

**Rules**:

- Markdown files MUST be concise and information-dense
- Eliminate redundancy, filler language, and verbose explanations
- Use structured formats (lists, tables, code blocks) over prose paragraphs
- Specification documents MUST focus on requirements, not implementation details
- Technical decisions MUST be documented with "Why" not "How" (code shows "how")
- Maximum file length targets (soft limits):
  - spec.md: <400 lines
  - plan.md: <300 lines
  - tasks.md: Task list only, minimal prose
- Use abbreviated keys in JSON schemas (e.g., `iss` not `issueDate`) to reduce URL payload
- Cross-reference external documentation via links rather than duplicating content

**Rationale**: Verbose documentation wastes time and reduces comprehension. Information-dense documentation enables faster understanding and better decisions.

### IX. Implementation Deviation Tracking

**Principle**: Implementation reality MUST be systematically tracked and fed back into planning artifacts.

**Rules**:

- When marking tasks as complete, developers MUST record any deviations from the planned implementation
- Deviations MUST be documented with:
  - What was planned (reference to plan.md, spec.md, or data-model.md)
  - What was actually implemented
  - Rationale for the deviation
  - Impact assessment (breaking changes, performance implications)
- Upon completing a feature, developers MUST update the relevant `ROADMAP_P*.md` file
- Major deviations (breaking changes, architectural shifts) MUST trigger immediate artifact updates
- Task completion format: `- [x] T001 [Description] | Deviation: [None | <description>]`

**Rationale**: Plans are hypotheses that collide with reality during implementation. Without systematic tracking, design artifacts become stale and misleading.

### X. Git Worktree Isolation for Concurrent Development

**Principle**: Each feature MUST be developed in an isolated Git worktree to prevent conflicts.

**Rules**:

- Every feature MUST be developed in a dedicated Git worktree
- Worktree naming convention: `worktrees/###-feature-name`
- Feature branch MUST be created before worktree
- Main worktree (repository root) is reserved for integration only
- Feature worktrees MUST be removed after completion and merge
- Worktree cleanup MUST be verified: `git worktree prune`

**Rationale**: Git worktrees enable true parallel development by creating separate working directories for each feature branch while sharing the same Git repository.

### XI. Design Fidelity & Component Architecture

**Principle**: All UI implementation MUST be strictly based on approved design assets.

**Rules**:

#### 11.1 Design Source Hierarchy

- **Primary Source**: `assets/aistudio/v3/` — AI Studio prototype (CURRENT)
- **Legacy Source**: `assets/v0/` — Vercel V0 designs (DEPRECATED)
- **Version Selection**: Always use the HIGHEST version number folder

#### 11.2 Component Library

- **Primitives**: Use `@radix-ui/react-*` for interactive components requiring accessibility
- **Variant Management**: Use `class-variance-authority` (CVA) for component variants
- **Styling**: Tailwind CSS classes with `clsx` + `tailwind-merge`
- **Animation**: Framer Motion for complex animations

#### 11.3 Strict Fidelity

- Implementations MUST match the design reference pixel-perfectly
- Color values, spacing, typography MUST be extracted from design source
- Animation timing and easing MUST match prototype behavior

**Rationale**: Consistent design language builds user trust. AI Studio prototypes represent the approved design vision.

### XII. UI/UX Design Principles

**Principle**: The application MUST maintain a consistent visual identity reinforcing "paper on a desk" metaphor.

**Rules**:

#### 12.1 Theme: Hybrid Theme Strategy

- **App UI (Controls)**: Deep Dark Mode using `zinc-950` background ("The Desk")
- **Document Surface (Invoice)**: Light Mode using `white` background ("The Paper")
- NO full-app light/dark mode toggle (hybrid is mandatory)

#### 12.2 Visual Physics: ISO 216 Compliance

- All document representations MUST follow ISO 216 (A4) aspect ratio: `1:1.414`
- Aspect ratio MUST be enforced in CSS/layout calculations

#### 12.3 Palette

- **Primary Contrast**: White invoice card on dark background (`zinc-950`)
- **Accessibility**: MUST maintain WCAG AA contrast ratios (≥4.5:1)

#### 12.4 Network-Specific Ambient Glow

- **Arbitrum**: Blue/Cyan gradient
- **Optimism**: Red/Orange gradient
- **Polygon**: Purple gradient
- **Ethereum/Default**: Violet gradient

**Rationale**: The Hybrid Theme Strategy creates a strong visual metaphor that distinguishes application chrome from invoice document.

### XIII. Feature Specification Workflow

**Principle**: All feature development MUST follow a structured specification workflow with artifacts in `specs/###-feature/` directories.

**Rules**:

#### 13.1 Mandatory Artifacts

Every feature MUST have:

- `spec.md` - User stories, requirements, success criteria
- `plan.md` - Technical approach, Constitution Check
- `tasks.md` - Dependency-ordered task list

#### 13.2 Optional Artifacts

- `research.md` - Exploration findings
- `data-model.md` - Schema definitions
- `contracts/` - API contracts

#### 13.3 Constitution Check

Every `plan.md` MUST validate compliance with all Constitutional Principles before implementation.

#### 13.4 Permitted Exceptions

- Emergency bug fixes (security vulnerabilities, production incidents)
- Trivial changes (typo fixes, comment updates)
- Infrastructure maintenance (dependency updates)

**Rationale**: Structured workflow prevents ad-hoc development and ensures Constitutional compliance.

### XIV. Test-Driven Development (TDD) Discipline

**Principle**: All feature development MUST follow TDD cycle: Red → Green → Refactor. Merge to main requires 80%+ code coverage.

**Rules**:

#### 14.1 TDD Cycle (MANDATORY)

```
1. RED: Write a failing test that defines expected behavior
2. GREEN: Write MINIMAL code to make the test pass
3. REFACTOR: Improve code quality while keeping tests green
4. REPEAT: Move to next test case
```

#### 14.2 Testing Framework

- **Framework**: Vitest (MANDATORY)
- **Test Location**: `__tests__/` folders co-located with source
- **Naming**: `*.test.ts` or `*.spec.ts`

#### 14.3 Coverage Requirements

- **Merge Threshold**: 80%+ overall coverage (lines, branches, functions, statements)
- **CI Enforcement**: Merge BLOCKED if coverage drops below 80%

#### 14.4 Mandatory Test Types

- **Unit Tests**: For all business logic
- **Snapshot Tests**: MANDATORY for schema & URL encoding

#### 14.5 Web3 Testing

- All blockchain interactions MUST be mocked
- No testnet dependencies in CI
- Deterministic, offline-capable tests

#### 14.6 Task Format

```markdown
## Tests (write FIRST - must FAIL) 🔴

- [ ] T010-test Unit test for invoice validation

## Implementation (make tests PASS) 🟢

- [ ] T010-impl Implement invoice validation
```

**Rationale**: TDD ensures code quality, prevents regressions, and creates executable documentation.

## Architectural Constraints

### Technology Stack (Locked for MVP)

**Core Framework**:

- Next.js 15+ (App Router + Edge Runtime)
- React 19+
- TypeScript 5.x+ (strict mode)
- Node.js 20+

**Web3 Stack**:

- Wagmi 2+, Viem 2+, RainbowKit 2+
- Alchemy + Infura (RPC providers)

**State & Data**:

- Zustand 5+ (client state)
- TanStack Query 5+ (async data)
- lz-string 1.5.0+ (URL compression)

**UI & Styling**:

- Tailwind CSS 4+
- Radix UI primitives
- CVA 0.7.1+, Framer Motion 12.x+

**Supported Networks (MVP)**: Ethereum, Arbitrum, Optimism, Polygon PoS

**Version Update Policy**:

- Minor/patch updates permitted
- Major version updates require constitutional amendment
- Security patches applied immediately

### Project Structure (Feature-Sliced Design)

```
src/
├── app/        # Routing (/, /create, /pay, /api/rpc)
├── widgets/    # Large UI blocks
├── features/   # User interactions
├── entities/   # Business logic
└── shared/     # Utilities, UI primitives
```

### Data Model Constraints

**Invoice Schema (v1)** - LOCKED:

```typescript
interface InvoiceSchemaV1 {
  v: number;        // Version (always 1)
  id: string;       // Invoice ID
  iss: string;      // Issue Date (ISO 8601)
  due: string;      // Due Date
  nt?: string;      // Notes (max 280 chars)
  net: number;      // Chain ID
  cur: string;      // Currency Symbol
  t?: string;       // Token Address (undefined = native)
  dec: number;      // Token decimals (MANDATORY)
  f: {...};         // Sender info
  c: {...};         // Client info
  it: [...];        // Line items
  tax: string;      // Tax rate
  dsc: string;      // Discount
}
```

**URL Constraints**:

- Maximum compressed URL length: 2000 bytes
- Notes field: 280 characters (hard limit)

## Governance

### Amendment Process

Changes to this Constitution require:

1. **Documentation**: Proposed amendment with rationale
2. **Impact Analysis**: Review of affected code and user experience
3. **Version Bump**:
   - MAJOR: Backward incompatible changes
   - MINOR: New principles or expanded guidance
   - PATCH: Clarifications, typo fixes
4. **Approval**: Project maintainer approval required

### Compliance Review

All feature specifications MUST verify compliance with all 14 Constitutional Principles:

- I: Zero-Backend Architecture
- II: Privacy-First & Self-Custody
- III: Trustless & Permissionless
- IV: Backward Compatibility & Schema Versioning
- V: Security & Abuse Prevention
- VI: RPC Key Protection
- VII: Web3 Safety & Transaction Validation
- VIII: Documentation Context Efficiency
- IX: Implementation Deviation Tracking
- X: Git Worktree Isolation
- XI: Design Fidelity
- XII: UI/UX Design Principles
- XIII: Feature Specification Workflow
- XIV: Test-Driven Development (TDD)

### Development Philosophy

- **YAGNI**: No speculative features
- **Privacy > Features**: Never compromise user privacy
- **Simplicity > Cleverness**: Optimize for maintainability
- **Testing Discipline**: 80%+ coverage, TDD cycle mandatory

**Version**: 2.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-12-01
