<!--
  SYNC IMPACT REPORT

  Version Change: 1.4.0 → 1.4.1

  Modified Principles:
  - Data Model Constraints: Updated InvoiceSchemaV1 tax/dsc types to string for flexibility

  Added Sections: None

  Removed Sections: None

  Templates Requiring Updates:
  ✅ None

  Follow-up TODOs: None

  Ratification: Correction of schema types to match flexible string requirement (e.g. "10%" vs "50")
  Date: 2025-11-20
-->

# VoidPay Constitution

## Core Principles

### I. Zero-Backend Architecture (Stateless First)

**Principle**: The application MUST operate without a backend database or persistent server-side state. All invoice data is encoded in URLs or stored client-side.

**Rules**:

- NO server-side database for storing invoice data
- NO user authentication or session management
- Invoice state MUST be self-contained in compressed URL parameters
- Client-side storage (LocalStorage) is permitted for user preferences and history only
- Server-side components are limited to: static hosting, RPC proxying, and OG image generation

**Rationale**: This ensures 永久可用性 (永续性 - perpetual availability). Even if hosting is discontinued, the service can be instantly redeployed anywhere, including IPFS or local deployment. Users retain full control and ownership of their invoice data through self-contained URLs.

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

**Rationale**: Abuse (phishing, scams) poses reputational and legal risks that could lead to domain blacklisting. However, mitigation MUST NOT compromise core principles. Blocklist via GitHub provides transparency, community moderation, and privacy preservation. OFAC screening would violate the Trustless principle and is deferred post-MVP.

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

**Principle**: All project documentation MUST prioritize information density and context efficiency for AI agent consumption.

**Rules**:

- Markdown files loaded into agent context MUST be concise and information-dense
- Eliminate redundancy, filler language, and verbose explanations
- Use structured formats (lists, tables, code blocks) over prose paragraphs where appropriate
- Specification documents MUST focus on requirements, not implementation details
- Technical decisions MUST be documented with "Why" not "How" (code shows "how")
- Maximum file length targets (soft limits):
  - spec.md: <400 lines (focus on user stories and requirements)
  - plan.md: <300 lines (technical approach, not implementation steps)
  - tasks.md: Task list only, minimal prose
  - research.md: <200 lines (key findings, links to external resources)
- Use abbreviated keys in JSON schemas (e.g., `iss` not `issueDate`) to reduce URL payload
- Cross-reference external documentation via links rather than duplicating content
- Templates MUST be concise with inline guidance, not separate documentation sections

**Rationale**: AI agents have context windows that fill quickly. Verbose documentation wastes tokens, slows processing, and reduces the amount of relevant code/context that can be loaded. Information-dense documentation enables agents to understand the project faster and make better decisions. Concise docs also benefit human developers by reducing cognitive load.

### IX. Implementation Deviation Tracking & Feedback Loop

**Principle**: Implementation reality MUST be systematically tracked and fed back into planning artifacts to maintain alignment between design and code.

**Rules**:

- When marking tasks as complete, agents MUST record any deviations from the planned implementation
- Deviations MUST be documented with:
  - What was planned (reference to plan.md, spec.md, or data-model.md)
  - What was actually implemented
  - Rationale for the deviation (technical constraints, better approach discovered, requirements changed)
  - Impact assessment (breaking changes, performance implications, security considerations)
- Deviation notes MUST be recorded in tasks.md adjacent to the completed task checkbox
- Upon completing a feature or significant milestone, agents MUST update `.specify/memory/PROGRESS.md` with:
  - Feature completion status (✅ Completed with date)
  - Brief implementation summary (what was built)
  - Key deviations from original plan (if any)
  - Feature folder reference (e.g., `specs/001-feature-name/` for reverse lookup)
  - Any notes about technical decisions or constraints encountered
- PROGRESS.md updates MUST follow the existing format and structure
- After feature completion, accumulated deviations MUST be reviewed to determine:
  - Whether spec.md needs updating (requirements changed)
  - Whether plan.md needs updating (approach changed)
  - Whether data-model.md needs updating (schema evolved)
  - Whether constitution.md needs updating (new constraints discovered)
- Major deviations (breaking changes, architectural shifts) MUST trigger immediate artifact updates
- Minor deviations (implementation details, optimizations) MAY be batched for end-of-feature review
- Task completion format MUST include deviation field: `- [x] T001 [Description] | Deviation: [None | <deviation description>]`

**Rationale**: Plans are hypotheses that collide with reality during implementation. Without systematic tracking of what actually happened versus what was planned, design artifacts become stale and misleading. This creates a negative feedback loop where future work relies on outdated assumptions. By capturing deviations at task completion time, we create a continuous improvement cycle that keeps specifications, plans, and reality aligned. This principle embodies the "documentation as living artifact" philosophy and ensures that project knowledge compounds rather than decays over time.

### X. Git Worktree Isolation for Concurrent Development

**Principle**: Each feature MUST be developed in an isolated Git worktree to prevent conflicts between concurrent agents and enable parallel development.

**Rules**:

- Every feature specification MUST be developed in a dedicated Git worktree
- Worktree naming convention: `worktrees/###-feature-name` (matching feature branch name)
- Feature branch MUST be created before worktree: `git branch ###-feature-name`
- Worktree creation: `git worktree add worktrees/###-feature-name ###-feature-name`
- Agents MUST work exclusively within their assigned worktree directory
- NO cross-worktree file modifications (each agent owns one worktree)
- Main worktree (repository root) is reserved for integration and release work only
- Feature worktrees MUST be removed after feature completion and branch merge: `git worktree remove worktrees/###-feature-name`
- Worktree cleanup MUST be verified: `git worktree prune`
- Specification artifacts (specs/###-feature-name/) MUST be committed in feature worktree before integration
- Integration to main branch MUST happen via rebase or merge from feature worktree
- Concurrent features (e.g., 001-feature-a, 002-feature-b) MUST use separate worktrees to avoid conflicts

**Rationale**: Git worktrees enable true parallel development by creating separate working directories for each feature branch while sharing the same Git repository. This prevents file-level conflicts when multiple agents work on different features simultaneously. Without worktrees, concurrent agents would compete for the same working directory, causing constant context switching, merge conflicts, and lost work. Worktrees provide filesystem-level isolation while maintaining Git's branching model, enabling each agent to work independently without blocking others. This is essential for efficient multi-agent collaboration and rapid feature iteration.

## Architectural Constraints

### Technology Stack (Locked for MVP)

The following technology choices are locked for MVP to ensure consistency and maintainability. These versions represent the latest stable releases as of 2025-11-19.

**Core Framework**:

- Next.js 15+ (App Router + Edge Runtime)
- React 18+
- React DOM 18+
- TypeScript 5.x+ (strict mode)
- Node.js 20+ (specified in .nvmrc)

**Web3 Stack**:

- Wagmi v2+ (Web3 core)
- Viem v2+ (Ethereum interactions)
- RainbowKit v2+ (wallet UI)
- Alchemy + Infura (RPC providers)
- Uniswap Token List (token validation)

**State & Data**:

- Zustand 5+ (client state)
- Zustand persist middleware (LocalStorage integration)
- TanStack Query v5+ (async data, caching)
- lz-string 1.5.0+ (URL compression)

**UI & Styling**:

- Tailwind CSS 4+
- shadcn/ui (Radix UI components)
- Lucide React (latest - icons)
- clsx 2.1.1+ (conditional classes)
- tailwind-merge 2.5.4+ (class merging)

**Typography**:

- Geist Sans (UI/headings)
- Geist Mono (data/addresses/amounts)

**Supported Networks (MVP)**:

- Ethereum Mainnet (Chain ID: 1)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)
- Polygon PoS (Chain ID: 137)

**Version Update Policy**:

- Minor and patch updates are permitted for all dependencies
- Major version updates require constitutional amendment and migration plan
- Security patches should be applied immediately
- Use code execution to verify latest compatible versions when uncertain

### Project Structure (Feature-Sliced Design)

The application MUST follow Feature-Sliced Design (FSD) architecture:

**Layers** (from highest to lowest):

- `app/` - Routing and application initialization
- `pages/` - Page composition
- `widgets/` - Large UI blocks
- `features/` - User interactions and actions
- `entities/` - Business logic and domain models
- `shared/` - Utilities and UI primitives

**Routing**:

- `/` - Marketing landing page (SEO optimized, indexed)
- `/create` - Invoice editor (client-heavy, noindex)
- `/pay` - Payment view (dynamic, noindex)

### Data Model Constraints

**Invoice Schema (v1)** - The following fields are locked:

```typescript
interface InvoiceSchemaV1 {
  v: number;        // Version (always 1 for v1)
  id: string;       // Invoice ID
  iss: string;      // Issue Date (ISO 8601)
  due: string;      // Due Date (ISO 8601)
  nt?: string;      // Notes (max 280 chars - HARD LIMIT)
  net: number;      // Chain ID
  cur: string;      // Currency Symbol
  t?: string;       // Token Address (undefined = native)
  dec: number;      // Token decimals (MANDATORY - baked in)
  f: {...};         // Sender info (name, wallet, optional address/email)
  c: {...};         // Client info (name, optional wallet/address/email)
  it: [...];        // Line items (description, qty, rate)
  tax: string;      // Tax rate (e.g. "10%" or "50")
  dsc: string;      // Discount amount (e.g. "10%" or "50")
}
```

**URL Constraints**:

- Maximum compressed URL length: 2000 bytes
- Compression algorithm: lz-string (LZW)
- Generation MUST be blocked if URL exceeds limit
- Notes field MUST be limited to 280 characters (enforced in UI)

**Magic Dust Verification**:

- Random micro-amount added to each invoice: 0.000001 - 0.000999 (6 decimals) or equivalent
- Provides unique identifier for exact payment matching
- Displayed as "Pretty Print" (rounded) + "Exact Amount" (with dust) for transparency
- NO fuzzy matching or tolerance - exact amount match required

## Security & Risk Management

### Abuse Management

**Static Blocklist Implementation**:

- Source: `https://raw.githubusercontent.com/voidpay/blocklist/main/blocked-hashes.json`
- Format: `{ "hashes": ["sha256_1", ...], "updated": "ISO8601_timestamp" }`
- Hash target: Full URL parameter `?d=...` (not invoice contents)
- Update mechanism: Public Pull Request to blocklist repository
- UI behavior: Red blocking screen for flagged URLs
- Reporting: "Report Abuse" button generates GitHub issue/PR

**Privacy Preservation**:

- Hashes prevent exposure of invoice contents
- Public blocklist ensures transparency
- Community moderation via GitHub

### Risk Mitigation Matrix

**Technical Risks**:

- RPC key leak → Serverless proxy with env variables
- RPC rate limits → Multi-provider failover + aggressive caching
- Browser storage wipe → Export/import JSON functionality
- URL length overflow → Hard limits + validation + short JSON keys
- Schema breaking → Strict versioning + migration adapters

**UX Risks**:

- Partial payments → Display "Partially Paid" status with progress bar
- Fee-on-transfer tokens → Warning labels, consider tolerance post-MVP
- In-app browsers → Detect and show "Open in system browser" prompt

**Legal/Compliance Risks**:

- OFAC sanctions → NOT implemented in MVP (permissionless philosophy)
- Domain blacklisting → Static blocklist + noindex meta tags
- Support liability → Explicit disclaimers ("non-custodial interface")
- Privacy leaks → Warnings when generating shareable links

### Non-Negotiable Security Requirements

- All transaction amounts MUST use exact precision (no floating point)
- Wallet addresses MUST be validated (checksum + visual confirmation via avatar)
- Network IDs MUST be validated against supported list
- Token contracts MUST be validated against token list or show warnings
- All user-facing errors MUST NOT expose internal system details
- All external links MUST open in new tab with `rel="noopener noreferrer"`

## Governance

### Amendment Process

**This Constitution supersedes all other project practices and guidelines.**

Changes to this Constitution require:

1. **Documentation**: Proposed amendment in GitHub issue with rationale
2. **Impact Analysis**: Review of affected templates, code, and user experience
3. **Version Bump Decision**:
   - MAJOR: Backward incompatible changes (principle removal/redefinition)
   - MINOR: New principles or materially expanded guidance
   - PATCH: Clarifications, typo fixes, non-semantic refinements
4. **Template Updates**: All dependent templates (.specify/templates/) updated
5. **Sync Report**: HTML comment at top of constitution documenting changes
6. **Approval**: Project maintainer approval required

### Compliance Review

**All feature specifications and implementation plans MUST verify compliance with:**

- Zero-Backend Architecture (Principle I)
- Privacy-First requirements (Principle II)
- Permissionless access (Principle III)
- Schema versioning rules (Principle IV)
- Security mechanisms (Principle V)
- RPC protection (Principle VI)
- Transaction validation (Principle VII)
- Documentation context efficiency (Principle VIII)
- Implementation deviation tracking (Principle IX)
- Git Worktree isolation (Principle X)

**Constitution Check Gate** in plan-template.md MUST verify:

- No backend database introduced
- No user authentication/registration added
- Schema changes follow versioning rules
- New features preserve privacy-first approach
- Security mechanisms not bypassed
- Documentation follows context efficiency guidelines

### Complexity Justification

Any violation of Constitutional principles MUST be explicitly justified in the "Complexity Tracking" section of plan.md with:

- Which principle is violated
- Why the violation is necessary
- What simpler alternatives were rejected and why

**Examples requiring justification**:

- Introducing server-side session storage (violates Principle I)
- Adding Google Analytics (violates Principle II)
- Requiring email verification (violates Principle III)
- Changing URL compression algorithm without migration (violates Principle IV)
- Writing verbose 800-line specification documents (violates Principle VIII)

### Development Philosophy

**Start Simple, Stay Simple**:

- YAGNI (You Aren't Gonna Need It) - No speculative features
- Every feature must have clear user value from brainstorm/spec
- Prefer boring, proven technologies over cutting-edge
- Optimize for maintainability over cleverness

**Testing Discipline**:

- Schema versioning MUST have integration tests (old URLs must work)
- Payment verification logic MUST have unit tests
- URL compression/decompression MUST have round-trip tests
- Multi-network support MUST have integration tests per network

**Observability Without Telemetry**:

- Text I/O ensures debuggability (console logs in dev)
- Error messages must be actionable for users
- NO error tracking services (violates Privacy principle)
- Debug mode via URL parameter for troubleshooting

**Documentation Standards** (Principle VIII):

- Prefer information density over exhaustive explanation
- Use structured formats (tables, lists) over narrative prose
- Document decisions and rationale, not implementation steps
- Keep specs focused on requirements, plans focused on approach
- Link to external resources rather than duplicating content

**Version**: 1.4.1 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-20
