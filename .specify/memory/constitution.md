<!--
  SYNC IMPACT REPORT

  Version Change: 1.12.0 → 1.13.0

  Modified Principles:
  - XI. Design Fidelity → Updated to support AI Studio as design source (in addition to V0)
    - Added AI Studio prototype location: assets/aistudio/v{N}/
    - Clarified design source hierarchy: AI Studio (current) > V0 (legacy)
  - XI. Component Library → Replaced shadcn/ui with Radix UI primitives + CVA
    - REMOVED: "via shadcn/ui" reference
    - ADDED: Direct Radix primitives (Dialog, Select, Popover)
    - ADDED: CVA for variant management
    - ADDED: Framer Motion for complex animations

  Added Sections:
  - 11.5 Design Source of Truth (NEW):
    - AI Studio prototype location and purpose
    - Component architecture for production
    - Styling stack definition (CVA, Radix, Framer Motion)
    - Transfer protocol from prototype to production
  - Technology Stack updated:
    - REMOVED: shadcn/ui
    - ADDED: Radix UI primitives (@radix-ui/react-dialog, select, popover)
    - ADDED: class-variance-authority (CVA) 0.7.1+
    - ADDED: Framer Motion 12.x+

  Removed Sections:
  - shadcn/ui references throughout document

  Templates Requiring Updates:
  - CLAUDE.md (✅ updated - Tech Stack section)
  - README.md (✅ updated - Styling line)
  - walkthrough.md (✅ updated - Styling line)
  - .serena/memories/tech-stack-locked.md (✅ updated - UI section)
  - .serena/memories/architecture-summary.md (✅ updated - ui/ description)
  - .serena/memories/project-overview.md (✅ updated - styling line)
  - .serena/memories/constitutional-principles-summary.md (✅ updated - Principle XI)

  Follow-up TODOs:
  - Install new dependencies: pnpm add framer-motion @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-popover
  - Update all Serena memories to reflect new UI stack
  - Update CLAUDE.md Tech Stack section

  Rationale:
  - AI Studio replaced V0 as primary design source
  - shadcn/ui removed because its pre-styled components don't match AI Studio custom design
  - Radix primitives retained for accessibility (Dialog, Select, Popover)
  - CVA retained for variant management (already installed)
  - Framer Motion added for complex animations (NetworkBackground, transitions)
  Date: 2025-11-28
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
  - MUST be justified in feature plan's Complexity Tracking table

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
- **Donation Strategy**:
  - Post-payment widget MUST use **Native Currency** only (single-click, no approval)
  - Footer "Support" modal MAY support ERC20 tokens (standard approval flow)
- **Transaction Discovery**:
  - Payer MUST store `txHash` in LocalStorage immediately upon signing
  - Creator MUST discover `txHash` via background polling (Alchemy Transfers API)
  - `txHash` MUST NOT be stored in the Invoice URL (keeps URL static)

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

**Rationale**: AI agents have context windows that fill quickly. Verbose documentation wastes tokens, slows processing, and reduces the amount of relevant code/context that can be loaded. Information-dense documentation enables agents to understand the project faster and make better decisions. See Principles XIII and XIV for code navigation and knowledge repository efficiency requirements.

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
- Upon completing a feature or significant milestone, agents MUST update the relevant `ROADMAP_P*.md` file with:
  - Feature completion status (🟢 **Completed**: YYYY-MM-DD)
  - **Feature Folder**: Path to the spec folder (e.g., `specs/002-url-state-codec/`)
  - **Implemented**: Brief implementation summary (what was built)
  - **Deviations**: Key deviations from original plan (if any)
  - **Notes**: Technical decisions or constraints encountered
- ROADMAP updates MUST follow the "How to Log Progress" instructions in `ROADMAP.md`
- After feature completion, accumulated deviations MUST be reviewed to determine:
  - Whether spec.md needs updating (requirements changed)
  - Whether plan.md needs updating (approach changed)
  - Whether data-model.md needs updating (schema evolved)
  - Whether constitution.md needs updating (new constraints discovered)
- Major deviations (breaking changes, architectural shifts) MUST trigger immediate artifact updates
- Minor deviations (implementation details, optimizations) MAY be batched for end-of-feature review
- Task completion format MUST include deviation field: `- [x] T001 [Description] | Deviation: [None | <deviation description>]`

**Rationale**: Plans are hypotheses that collide with reality during implementation. Without systematic tracking of what actually happened versus what was planned, design artifacts become stale and misleading. By capturing deviations at task completion time, we create a continuous improvement cycle that keeps specifications, plans, and reality aligned.

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

**Rationale**: Git worktrees enable true parallel development by creating separate working directories for each feature branch while sharing the same Git repository. This prevents file-level conflicts when multiple agents work on different features simultaneously. Without worktrees, concurrent agents would compete for the same working directory, causing constant context switching, merge conflicts, and lost work.

### XI. Design Fidelity & Design Source Integration

**Principle**: All UI implementation MUST be strictly based on approved design assets. Agents MUST NOT invent designs and MUST ask for clarification if assets are missing.

**Rules**:

#### 11.1 Design Source Hierarchy

- **Primary Source**: `assets/aistudio/v3/` — AI Studio (Gemini 3 Pro) prototype (CURRENT active design)
- **Legacy Source**: `assets/v0/` — Vercel V0 designs (DEPRECATED, historical reference only)
- **Version Selection**: Always use the HIGHEST version number folder (e.g., `v2/` over `v1/`)

#### 11.2 Component Library

- **Primitives**: Agents MUST use `@radix-ui/react-*` primitives for interactive components requiring accessibility:
  - `@radix-ui/react-dialog` — Modals, sheets, drawers
  - `@radix-ui/react-select` — Dropdowns, selects
  - `@radix-ui/react-popover` — Tooltips, popovers, menus
- **Variant Management**: Use `class-variance-authority` (CVA) for component variants
- **Styling**: Tailwind CSS classes with `clsx` + `tailwind-merge` for conditional composition
- **Animation**: Framer Motion for complex animations (NetworkBackground, page transitions)

#### 11.3 Strict Fidelity

- Implementations MUST match the design reference pixel-perfectly unless explicitly instructed otherwise
- Color values, spacing, typography MUST be extracted from design source
- Animation timing and easing MUST match prototype behavior

#### 11.4 Agent Responsibility

- Agents MUST search design assets (`assets/aistudio/` or `assets/v0/`) for relevant files before implementation
- If a design element is missing, agents MUST ask the user for guidance, NOT invent a solution
- Agents MUST NOT deviate from the design without explicit user approval

#### 11.5 Design Source of Truth (AI Studio)

**Prototype Location**: `assets/aistudio/v{N}/`

- **Stack**: Vite + React (prototype only, NOT production stack)
- **Purpose**: Visual reference, component design, interaction patterns
- **NOT for**: Direct code copy — prototype uses different routing, state management

**Component Architecture (Production)**:

```
src/shared/ui/
├── primitives/              # Radix wrappers with custom styles
│   ├── dialog.tsx           # @radix-ui/react-dialog + AI Studio styling
│   ├── select.tsx           # @radix-ui/react-select + AI Studio styling
│   └── popover.tsx          # @radix-ui/react-popover + AI Studio styling
├── aurora-text.tsx          # CSS animation (no Radix needed)
├── hyper-text.tsx           # React hooks only (no Radix needed)
├── void-button.tsx          # Complex CSS animation (CVA variants)
└── network-background.tsx   # Framer Motion animation
```

**Styling Stack**:

| Tool | Purpose | Required |
|------|---------|----------|
| CVA (class-variance-authority) | Variant management for components | ✅ Yes |
| clsx + tailwind-merge | Conditional class composition | ✅ Yes |
| Framer Motion | Complex animations (NetworkBackground, transitions) | ✅ Yes |
| tailwindcss-animate | Simple CSS animations (pulse, spin) | ✅ Yes |

**Transfer Protocol** (Prototype → Production):

1. Extract design tokens (colors, spacing, shadows) from AI Studio components
2. Adapt to CVA variant pattern for production components
3. Wrap interactive elements with Radix primitives for accessibility
4. Use Framer Motion for animations that require JS (not CSS-only)
5. Test pixel-fidelity against prototype screenshots

**Rationale**: AI Studio prototypes represent the approved design vision. Using Radix primitives ensures accessibility compliance. CVA provides type-safe variant management. Framer Motion enables smooth, physics-based animations that CSS alone cannot achieve. This separation (design source vs production stack) allows rapid prototyping without compromising production code quality.

### XII. UI/UX Design Principles

**Principle**: The application MUST maintain a consistent visual identity that reinforces the metaphor of "paper on a desk" while ensuring print/PDF fidelity.

**Rules**:

#### 12.1 Theme: Hybrid Theme Strategy

- **App UI (Controls/Layout)**: Deep Dark Mode using `zinc-950` background ("The Desk")
- **Document Surface (Invoice)**: Light Mode using `white` background ("The Paper")
- This dual-theme approach MUST be maintained consistently across all views
- Navigation, toolbars, sidebars, and controls MUST use dark theme colors
- Invoice preview/display components MUST use light theme colors
- NO full-app light mode or full-app dark mode toggle (hybrid is mandatory)

#### 12.2 Visual Physics: ISO 216 Compliance

- All document representations MUST strictly follow ISO 216 (A4) aspect ratio: `1:1.414`
- This applies to: invoice preview components, PDF generation output, print layouts, any visual representation of the invoice document
- Aspect ratio MUST be enforced in CSS/layout calculations
- Deviations from 1:1.414 ratio are NOT permitted (ensures print/PDF consistency)

#### 12.3 Palette: White Paper on Dark Desk

- **Primary Contrast**: White invoice card (`#FFFFFF` or `white`) on dark background (`zinc-950`)
- **Invoice Card Styling**: Background `white`, text/content black ink, subtle shadow for depth
- **Dark Desk Styling**: Background `zinc-950`, UI controls with light text
- **Accessibility**: MUST maintain WCAG AA contrast ratios (≥4.5:1 for both invoice content and UI controls)

#### 12.4 Editor UI: Layout Constraints

**Layout**:

- Application container MUST enforce `max-w-[1600px]` to prevent ultrawide stretching
- Container MUST be centered on viewport
- Responsive breakpoints MUST maintain aspect ratio integrity for invoice preview
- NO full-width layouts that distort the "desk" metaphor

**Preview Component**:

- MUST simulate an A4 sheet with shadow effect (`shadow-2xl`)
- MUST be centered on the dark background
- Optional: Subtle border (`border border-zinc-200`) for definition
- Preview MUST scale proportionally on smaller viewports while maintaining 1:1.414 ratio
- Preview MUST NOT exceed container width minus appropriate padding

#### 12.5 App Shell Architecture (The Desk vs. The Paper)

- **Structure**: Application MUST use an "App Shell" wrapper for `/create` and `/pay` routes
- **Header (The Desk)**: MUST contain VoidPay Logo (Branding) and Action Triggers (Menu, Wallet), visually distinct from invoice content
- **Footer (The Desk)**: MUST contain Trust & Safety elements (Report Abuse, Legal Disclaimer), visually distinct
- **Invoice Card (The Paper)**: MUST contain ONLY invoice data and "Powered by VoidPay" watermark, MUST NOT contain platform-level actions inside the card boundary
- **Receipt Mode**: Upon payment confirmation, MUST visually transform (PAID badge, Tx details)
- **PDF Generation**:
  - **Pending State**: "Download Invoice" generates a "Pro-forma" PDF (watermarked "UNPAID")
  - **Success State**: "Download Receipt" generates a Receipt PDF (watermarked "PAID", includes TxHash)

#### 12.6 Ambient Glow Spec: Network-Specific Lighting

**Technique**:

- Absolute positioned elements behind the invoice paper
- High blur radius: `blur-3xl` (~64px blur)
- Low opacity: `opacity-20` to `opacity-30` range
- Z-index MUST place glow behind paper but above desk background

**Colors by Network**:

- **Arbitrum**: Blue/Cyan gradient (`from-blue-500 to-cyan-500`)
- **Optimism**: Red/Orange gradient (`from-red-500 to-orange-500`)
- **Polygon**: Purple gradient (`from-purple-500 to-purple-600`)
- **Default/Ethereum**: Violet gradient (`from-violet-500 to-violet-600`)

**Implementation Requirements**:

- Glow MUST be subtle and not distract from invoice content
- Glow MUST NOT affect text readability on the white paper
- Glow color MUST update dynamically based on selected network
- Use CSS `mix-blend-mode` if needed to enhance effect without overwhelming

**Rationale**: The Hybrid Theme Strategy creates a strong visual metaphor that distinguishes the application chrome from the invoice document, reinforcing the stateless nature of the system (the "paper" exists independently of the "desk"). ISO 216 compliance ensures that what users see on screen matches what they'll get when printing or exporting to PDF, eliminating layout surprises.

### XIII. Serena-First Code Navigation & Tooling Priority

**Principle**: Agents MUST use Serena MCP symbolic tools as the PRIMARY method for code navigation, exploration, and editing. Direct file reading and text-based search tools are PROHIBITED for indexed languages (TypeScript, Markdown) except in explicitly permitted cases.

**Rules**:

#### 13.1 Mandatory Tool Priority Hierarchy

**Tier 1 - ALWAYS USE FIRST (Serena Symbolic Tools)**:

- `get_symbols_overview` - REQUIRED before reading any .ts/.tsx/.md file
- `find_symbol` - REQUIRED for locating functions/classes/types by name
- `find_referencing_symbols` - REQUIRED before editing any symbol
- `search_for_pattern` - For cross-file content search in indexed languages
- `replace_symbol_body` - For replacing entire functions/classes
- `insert_after_symbol` / `insert_before_symbol` - For adding code

**Tier 2 - FALLBACK ONLY (Non-Serena Tools)**:

- `Read` - ONLY permitted for: non-code files (.json, .yaml, .env.example, .lock files), binary files or generated files, files in languages NOT indexed by Serena (CSS, HTML, config files), AFTER using `get_symbols_overview` for small targeted edits within a symbol
- `Grep` - ONLY permitted for: languages not indexed by Serena (CSS, HTML, YAML, configs), literal string search in non-code files, NEVER for finding TypeScript/Markdown symbols
- `Glob` - ONLY permitted for: finding files by pattern when filename unknown, listing directory contents (Serena's `list_dir` preferred)

**Tier 3 - PROHIBITED**:

- ❌ Reading full .ts/.tsx/.md files without prior `get_symbols_overview`
- ❌ Using `Grep` to find TypeScript functions, classes, types, or interfaces
- ❌ Using `Grep` to search Markdown documentation files
- ❌ Editing symbols without `find_referencing_symbols` check
- ❌ Using `Read` + `Edit` for entire symbol replacement (use `replace_symbol_body`)

#### 13.2 Mandatory Workflows

**Code Exploration Workflow (REQUIRED)**:

```
1. get_symbols_overview(file) → understand file structure
2. find_symbol(name_path, include_body=false) → locate symbol
3. find_symbol(name_path, include_body=true) → read implementation ONLY if needed
4. find_referencing_symbols(name_path) → understand dependencies
```

**Code Editing Workflow (REQUIRED)**:

```
1. find_symbol → locate symbol to edit
2. find_referencing_symbols → check impact
3. replace_symbol_body OR insert_after/before_symbol → apply changes
4. NEVER use Read + Edit for full symbol changes
```

**Cross-File Search Workflow**:

```
1. search_for_pattern (Serena) → for TypeScript/Markdown content search
2. Grep → ONLY if pattern not in indexed files
```

#### 13.3 Indexed Languages & Statistics

**Currently Indexed**:

- **TypeScript**: All .ts/.tsx files in src/ (production code)
- **Markdown**: 67+ files including `.specify/memory/*.md`, `specs/**/*.md`, `CLAUDE.md`, `README.md`

**Cache Location**: `.serena/cache/typescript/` and `.serena/cache/markdown/`

#### 13.4 Rationale

**Token Efficiency**: Reading full files wastes 10-100x tokens vs. targeted symbol reads.

**Semantic Understanding**: Language servers provide type information, definitions, and references that text search cannot. Grep finds strings; Serena finds symbols with full semantic context.

**Refactoring Safety**: `find_referencing_symbols` prevents breaking changes by showing all call sites before edits.

**Constitutional Alignment**: This principle supports Principle VIII (Documentation Context Efficiency) and Principle XIV (Serena Memory) by maximizing information density and minimizing redundant reads.

#### 13.5 Enforcement

- Agents MUST justify usage of Read/Grep on indexed files in commit messages
- Code reviews MUST flag violations as "inefficient tool usage"
- Constitutional compliance checks MUST verify Serena-first adherence

#### 13.6 Exceptions (Explicit Approval Required)

These cases require user approval before violating Serena-first:

1. Language server crashes or indexing failures
2. Serena MCP server unavailable/offline
3. Emergency debugging where speed > efficiency
4. Files explicitly excluded from indexing (gitignored, generated)

### XIV. Serena Memory as Project Knowledge Repository

**Principle**: Serena memory files (`.serena/memories/`) MUST serve as the PRIMARY source of truth for project-wide knowledge, architecture, and decisions. Agents MUST actively **consult, update, and maintain** these memories to keep project knowledge current and accurate.

**Rules**:

#### 14.1 Memory Consultation Requirements (READ)

- Agents MUST read relevant Serena memories BEFORE starting any feature work
- Agents MUST consult memories before reading extensive documentation or source code
- Memory reads MUST take priority over full file reads for understanding project architecture
- Memories provide the "what" and "why"; symbolic tools (Principle XIII) provide the "how"

#### 14.2 Memory Update Requirements (WRITE)

- Agents MUST update Serena memories when discovering new architectural patterns or decisions
- Agents MUST write new memories for major architectural decisions not yet documented
- Memory updates MUST happen at feature completion (alongside ROADMAP updates per Principle IX)
- Memories MUST be updated when existing documentation becomes stale or incomplete
- **Updates are NOT optional** — failing to update stale memory is a Constitutional violation

#### 14.3 Memory Access (MCP Server Commands)

**MANDATORY**: Agents MUST use Serena MCP server tools (prefixed `mcp__serena__*`) for ALL memory operations. Direct file read/write to `.serena/memories/` is PROHIBITED.

**PROHIBITED**:

- ❌ Read(".serena/memories/architecture-summary.md") - Direct file access
- ❌ Write(".serena/memories/new-memory.md", ...) - Direct file write

**REQUIRED**:

- ✅ `mcp__serena__list_memories` - List available memories before reading
- ✅ `mcp__serena__read_memory` - Read memory content
- ✅ `mcp__serena__write_memory` - Create new memory
- ✅ `mcp__serena__edit_memory` - Update existing memory content

#### 14.3.1 Memory Commit Protocol (v1.12.0)

**⚠️ CRITICAL**: Memories are tracked in git and MUST be committed after changes.

**Storage**: `.serena/memories/` is part of the codebase (NOT gitignored)

**After ANY memory write/edit operation — MUST commit**:

```bash
git add .serena/memories/ && git commit -m "docs(memory): update <memory-name>"
```

**Worktree Synchronization**:

- Each worktree has its OWN copy of `.serena/memories/`
- Memory changes in worktree are committed to feature branch
- Memories merged to main along with feature code
- Conflicts resolved like any other code conflict

**Rationale**: Memories as code ensures version control, merge conflict resolution, and proper synchronization across worktrees without symlink security issues.

#### 14.4 Memory Freshness Protocol

**Principle**: Memories MUST remain **accurate and current**. Stale information is worse than no information—it misleads agents and causes incorrect decisions.

**Mandatory Update Triggers** (agent MUST update memory when):

1. **Feature Completion**: After `/speckit.implement` completes, update relevant architecture/pattern memories
2. **New Pattern Discovered**: Any reusable pattern not documented → write new pattern memory
3. **Tech Stack Change**: Dependency added/removed/upgraded → update `tech-stack-locked` memory
4. **Architecture Decision**: Major design decision made → write decision memory or update `architecture-summary`
5. **Deviation Documented**: Task deviation reveals architectural change → update affected memory
6. **Roadmap Milestone**: ROADMAP item completed → update `development-status` memory
7. **Constitution Amendment**: Principle added/modified → update `constitutional-principles-summary` memory
8. **Stale Detection**: Agent finds memory content contradicts current reality → immediate update

**Staleness Detection Criteria**:

- Memory references non-existent files or functions
- Memory describes patterns not used in current code
- Memory lists outdated dependency versions
- Memory contradicts other memories or Constitution
- Memory timestamp >30 days old without feature activity

**Update Workflow**:

```
After Feature Completion:
1. Review memories consulted during feature work
2. Check: Does current memory reflect implemented reality?
3. If stale → use mcp__serena__edit_memory to update
4. If new pattern → use mcp__serena__write_memory to document
5. Update development-status memory with feature completion
```

#### 14.5 Write-First Principle

**Principle**: When agents discover knowledge that SHOULD be in memory but ISN'T, they MUST write it **immediately** rather than continuing work without documentation.

**Rules**:

- Discovered pattern not documented → STOP, write memory, THEN continue
- Found major decision not recorded → STOP, write decision memory, THEN continue
- Knowledge gap found during work → STOP, fill gap, THEN continue

**Rationale**: Knowledge discovered during work is often forgotten after task completion. Immediate capture prevents knowledge loss and compounds project intelligence over time.

**Anti-Pattern (VIOLATION)**:

```
❌ Agent discovers new state management pattern during implementation
   → Continues to feature completion
   → Forgets to document pattern
   → Next agent re-discovers same pattern from scratch  // KNOWLEDGE LOST

✅ Agent discovers new state management pattern during implementation
   → STOPS and writes `state-management-pattern` memory
   → Continues implementation
   → Next agent reads memory and builds on existing knowledge  // KNOWLEDGE PRESERVED
```

#### 14.6 Memory Content Guidelines

**Core Principle**: Memories MUST be **concise and information-dense** to optimize AI context window usage and minimize token consumption.

**MANDATORY Content Rules**:

- Memory files MUST be information-dense following Principle VIII guidelines
- Memories MUST NOT duplicate content from SpecKit artifacts (`specs/###-feature/`)
- Memories capture project-level knowledge; SpecKit captures feature-level design
- Use structured formats (lists, tables, code blocks) over narrative prose
- Maximum memory length target: <300 lines (exceptions for complex architecture docs)
- **Include "Last Updated" date** at top of memory for staleness detection

**Token Efficiency Requirements**:

- **NO verbose prose** — use bullet points, tables, code blocks
- **NO redundant information** — each fact stated ONCE, cross-reference elsewhere
- **NO obvious/inferable information** — only document non-trivial decisions
- **NO full file contents** — document WHAT and WHY, not entire code blocks
- **YES abbreviated keys** — use `iss` not `issueDate`, `net` not `networkId`
- **YES structured data** — JSON/YAML schema snippets over paragraph descriptions
- **YES external links** — reference external docs, don't duplicate content

**Anti-Pattern Examples**:

```
❌ VERBOSE (wastes tokens):
"The project uses TypeScript 5.x which is a strongly typed superset of JavaScript
that compiles to plain JavaScript and provides excellent tooling support and
type safety for large codebases."

✅ CONCISE (saves tokens):
"TypeScript 5.x+ (strict mode) - locked for MVP"
```

```
❌ REDUNDANT (wastes tokens):
"Use Zustand for state management. Zustand is configured in the store.
The Zustand store uses persist middleware. The persist middleware uses LocalStorage."

✅ CONCISE (saves tokens):
"State: Zustand 5+ with persist middleware (LocalStorage)"
```

**Memory Quality Gate**: Before writing/updating memory, ask:
1. Is this information non-obvious? (If obvious → don't write)
2. Is this documented elsewhere? (If yes → reference, don't duplicate)
3. Is this the most concise form? (If not → compress further)

#### 14.7 Source of Truth Hierarchy

1. **Constitution** (`.specify/memory/constitution.md`) - Governance & non-negotiable principles
2. **Serena Memories** (`.serena/memories/`) - Architecture, patterns, tech stack, decisions
3. **SpecKit Artifacts** (`specs/###-feature/`) - Feature-specific design (spec, plan, tasks)
4. **Source Code** - Implementation reality (ultimate source of truth)

When conflicts arise, higher levels override lower levels (Constitution > Memories > SpecKit > Code implies code should change).

#### 14.8 Standard Memory Categories

**Required Memories** (MUST exist for all projects):

| Memory Name | Purpose | Update Frequency |
|-------------|---------|------------------|
| `project-overview` | High-level description, philosophy, value proposition | On major pivot/refocus |
| `tech-stack-locked` | Locked versions, update policy | On any dependency change |
| `architecture-summary` | Project structure, routing, data flow | On architectural change |
| `constitutional-principles-summary` | Quick reference to all principles | On Constitution amendment |
| `development-status` | Roadmap progress, active features, blockers | On every feature completion |

**Optional Memories** (create as needed):

- `<feature-area>-architecture` - Deep dive on specific domain (e.g., `payment-verification-architecture`)
- `<decision-name>-decision` - Major decisions with rationale (e.g., `rpc-proxy-decision`)
- `<pattern-name>-pattern` - Reusable patterns (e.g., `state-management-pattern`)

#### 14.9 Integration with Other Principles

- **Principle VIII (Context Efficiency)**: Memories prevent re-reading verbose documentation
- **Principle XIII (Serena-First)**: Memories provide architecture context; symbolic tools provide code context
- **Principle IX (Deviation Tracking)**: Memories updated when deviations reveal architectural changes
- **Principle XV (SpecKit)**: Memories provide project context before creating specs/plans

#### 14.10 Workflow Integration

**Feature Start Workflow (READ memories FIRST)**:

```
1. mcp__serena__list_memories → identify relevant memories
2. mcp__serena__read_memory for architecture, tech-stack, principles
3. /speckit.specify with context from memories
4. /speckit.plan → reference memories for architectural constraints
5. /speckit.implement → WATCH for new patterns to document
```

**Feature Completion Workflow (UPDATE memories ALWAYS)**:

```
1. Review all memories consulted during feature work
2. For EACH memory consulted:
   - Does it still accurately reflect reality? If not → mcp__serena__edit_memory
3. Check: Did I discover new patterns/decisions? If yes → mcp__serena__write_memory
4. ALWAYS update development-status with feature completion
5. If Constitution amended → update constitutional-principles-summary
```

**Memory Update Workflow Checklist** (MANDATORY after feature completion):

- [ ] `development-status` updated with completed feature
- [ ] Any stale memory content corrected
- [ ] New patterns documented in new memory
- [ ] Tech stack changes reflected in `tech-stack-locked`
- [ ] Architecture changes reflected in `architecture-summary`

#### 14.11 Anti-Patterns (VIOLATIONS)

**VIOLATION #1: Starting feature without reading memories**

```
❌ /speckit.specify "Add payment feature" without reading architecture-summary  // WRONG
✅ read_memory("architecture-summary") → understand FSD layers → /speckit.specify  // CORRECT
```

**VIOLATION #2: Duplicating memory content in SpecKit artifacts**

```
❌ Copy entire tech stack list into specs/005-feature/plan.md  // WRONG
✅ Reference "See tech-stack-locked memory" in plan.md  // CORRECT
```

**VIOLATION #3: Discovering major decision without writing memory**

```
❌ Implement new state pattern, complete feature, never document  // WRONG
✅ Implement pattern → write state-management-pattern memory → update architecture-summary  // CORRECT
```

**VIOLATION #4: Completing feature without updating development-status**

```
❌ Feature done → ROADMAP updated → forget to update development-status memory  // WRONG
✅ Feature done → ROADMAP updated → mcp__serena__edit_memory("development-status")  // CORRECT
```

**VIOLATION #5: Finding stale memory and ignoring it**

```
❌ Read memory → notice it references non-existent file → continue work anyway  // WRONG
✅ Read memory → notice staleness → mcp__serena__edit_memory to fix → continue  // CORRECT
```

**VIOLATION #6: Relying on memory without verifying freshness**

```
❌ Read tech-stack-locked → assume versions are current → use outdated version  // WRONG
✅ Read tech-stack-locked → check Last Updated date → verify if >30 days old  // CORRECT
```

#### 14.12 Rationale

**Token Efficiency**: Without memories, agents waste thousands of tokens re-reading the same architectural documentation for every feature. A 200-line memory prevents reading 2000+ lines of scattered documentation.

**Knowledge Preservation**: As the project evolves, architectural decisions get lost in commit history or outdated documentation. Memories create a living knowledge base that compounds over time.

**Onboarding Efficiency**: New agents (or agent sessions) can quickly understand the project by reading 5-10 memory files instead of exploring dozens of source files.

**Layered Knowledge System**: Constitution (principles) → Memories (architecture) → Symbols (code navigation) → Files (implementation details). Each layer filters and concentrates knowledge for the next.

**Living Documentation**: Memories are not write-once artifacts. They are living documents that evolve with the codebase. Stale memories are worse than no memories—they actively mislead agents.

#### 14.13 Enforcement

- Agents MUST justify NOT consulting memories when starting features
- Agents MUST update `development-status` memory after EVERY feature completion (no exceptions)
- Code reviews SHOULD verify memory updates for features introducing new patterns
- Constitutional compliance checks MUST verify memories exist and are up-to-date
- **Memory Update Audit**: If feature completion lacks memory updates, reviewer MUST block merge

### XV. SpecKit Workflow Compliance

**Principle**: All feature development MUST follow the SpecKit workflow (`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`) with structured artifacts in `specs/###-feature/` directories. Ad-hoc feature development without this workflow is PROHIBITED.

**Rules**:

#### 15.1 Workflow Phases (MANDATORY)

**Phase 1: Specification** (`/speckit.specify <description>`):

- Creates `specs/###-feature/spec.md` with user stories and requirements
- User stories MUST be prioritized (P1, P2, P3) and independently testable
- Generates feature branch (`###-feature-name`)
- Creates Git worktree (`worktrees/###-feature-name`) per Principle X
- Output: spec.md with clear acceptance criteria

**Phase 2: Planning** (`/speckit.plan`):

- Creates `specs/###-feature/plan.md` with technical approach
- Includes Constitution Check (validates all 16 principles)
- Documents research in `research.md` (exploration findings)
- Documents data model in `data-model.md` (schema, entities)
- Creates API contracts in `contracts/` if applicable (endpoints, interfaces)
- Consults Serena memories per Principle XIV before planning
- Output: plan.md, research.md, data-model.md, contracts/ (as needed)

**Phase 3: Tasks Generation** (`/speckit.tasks`):

- Creates `specs/###-feature/tasks.md` with dependency-ordered tasks
- Tasks organized by user story for independent delivery
- Includes parallel execution markers ([P] for parallelizable tasks)
- Includes deviation tracking format per Principle IX
- Output: tasks.md with executable task list

**Phase 4: Implementation** (`/speckit.implement`):

- Executes tasks from tasks.md in feature worktree
- Tracks deviations from plan in tasks.md
- Updates ROADMAP upon completion per Principle IX
- Updates Serena memories if new patterns discovered per Principle XIV
- Output: Working feature, updated ROADMAP, updated memories

#### 15.2 Artifact Requirements

**Directory Structure**:

- All artifacts MUST reside in `specs/###-feature/` (feature number padded to 3 digits: 001, 002, etc.)
- Feature folder name MUST match Git branch name (`###-feature-name`)
- Example: `specs/005-payment-verification/` with branch `005-payment-verification`

**Mandatory Artifacts**:

- `spec.md` - User stories, requirements, success criteria (from /speckit.specify)
- `plan.md` - Technical approach, Constitution Check, complexity tracking (from /speckit.plan)
- `tasks.md` - Dependency-ordered task list (from /speckit.tasks)

**Optional Artifacts** (created by /speckit.plan as needed):

- `research.md` - Exploration findings, external resource links
- `data-model.md` - Schema definitions, entity relationships
- `contracts/` - API contracts, interface definitions
- `quickstart.md` - Setup instructions for the feature

**Artifact Lifecycle**:

- Artifacts MUST NOT be committed to main branch until feature completion
- Artifacts committed in feature worktree during development
- Artifacts merged to main upon feature completion and ROADMAP update
- Completed feature folders serve as historical design documentation

#### 15.3 Compliance Requirements

**MANDATORY Rules**:

- Agents MUST NOT skip phases (no implementation without planning)
- Agents MUST NOT create features outside SpecKit workflow
- Agents MUST NOT directly edit main branch for features (use worktrees per Principle X)
- Agents MUST validate Constitution Check in plan.md before proceeding to tasks

**Permitted Exceptions** (require explicit justification):

- Emergency bug fixes (security vulnerabilities, production incidents)
- Trivial changes (typo fixes, comment updates, formatting)
- Infrastructure maintenance (dependency updates, tooling upgrades)

Exception justification MUST include:

- Why SpecKit workflow was bypassed
- What risk this poses to Constitutional compliance
- What compensating controls are in place

#### 15.4 Integration with Other Principles

**Principle IX (Deviation Tracking)**:

- Deviation tracking happens in tasks.md during `/speckit.implement`
- Format: `- [x] T001 [Description] | Deviation: [None | <deviation description>]`
- Accumulated deviations reviewed at feature completion

**Principle X (Git Worktree Isolation)**:

- Worktrees created automatically during `/speckit.specify`
- Each feature isolated in `worktrees/###-feature-name/`
- Main worktree reserved for integration only

**Principle VIII (Context Efficiency)**:

- All SpecKit artifacts follow information-dense formatting
- spec.md focuses on requirements, not implementation details
- plan.md focuses on technical approach, not step-by-step instructions
- Avoid verbose prose; use structured formats (lists, tables, code blocks)

**Principle XIV (Serena Memory)**:

- Consult Serena memories before creating spec.md (understand architecture)
- Consult memories before planning (understand constraints)
- Update memories after implementation if new patterns discovered

**Constitution Check in plan.md validates all 16 principles**:

- Principle I: Zero-Backend (no server database)
- Principle II: Privacy-First (no analytics)
- Principle III: Permissionless (no auth)
- Principle IV: Schema Versioning (no breaking changes)
- Principle V: Security (blocklist, abuse prevention)
- Principle VI: RPC Protection (proxy, failover)
- Principle VII: Web3 Safety (decimals, finality)
- Principle VIII: Context Efficiency (concise artifacts)
- Principle IX: Deviation Tracking (implemented in tasks.md)
- Principle X: Worktree Isolation (feature developed in worktree)
- Principle XI: Design Fidelity (V0 assets used)
- Principle XII: UI/UX Principles (Hybrid Theme, A4 ratio)
- Principle XIII: Serena-First Navigation (symbolic tools used)
- Principle XIV: Memory Consultation (memories read before planning)
- Principle XV: SpecKit Workflow (this workflow followed)

#### 15.5 Workflow Benefits

**Audit Trail**: Complete history of feature development (why → how → what)

- spec.md: Why (user needs, requirements)
- plan.md: How (technical approach, architecture)
- tasks.md: What (implementation steps)
- Source code: Reality (actual implementation)

**Constitutional Compliance**: Constitution Check in plan.md ensures every feature validates all 16 principles before implementation

**Knowledge Preservation**: Design decisions captured in artifacts, not lost in commits or memory

**Parallel Development**: Multiple agents can work on different features simultaneously (each in isolated worktree)

**Independent Delivery**: User stories prioritized and independently testable enables incremental delivery

#### 15.6 Anti-Patterns (VIOLATIONS)

**VIOLATION #1: Skipping phases**

```
❌ User: "Add payment feature" → Agent: implements directly in main branch  // WRONG
✅ /speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement  // CORRECT
```

**VIOLATION #2: Ad-hoc feature development**

```
❌ Create feature files directly in src/ without specs/ artifacts  // WRONG
✅ Follow SpecKit workflow → all design artifacts in specs/###-feature/  // CORRECT
```

**VIOLATION #3: Incomplete Constitution Check**

```
❌ plan.md Constitution Check validates only Principles I-III  // WRONG
✅ plan.md Constitution Check validates ALL 15 principles  // CORRECT
```

**VIOLATION #4: Feature artifacts on main branch**

```
❌ Commit specs/006-feature/ to main before feature completion  // WRONG
✅ Develop in worktree → merge to main only when feature complete  // CORRECT
```

#### 15.7 Rationale

**Prevents Ad-Hoc Development**: Without enforced workflow, features are developed inconsistently. Some skip planning, others skip requirements. This leads to Constitutional violations and technical debt.

**Ensures Constitutional Compliance**: Constitution Check in plan.md forces validation of all 16 principles before any code is written. This prevents expensive rework when violations discovered late.

**Creates Institutional Knowledge**: SpecKit artifacts serve as historical documentation. When revisiting a feature months later, specs/###-feature/ contains the complete context: why it was built, how it was designed, what changed during implementation.

**Enables Parallel Development**: With structured workflows and isolated worktrees, multiple agents can work on different features without conflicts or coordination overhead.

**Supports Incremental Delivery**: User stories prioritized (P1, P2, P3) and independently testable enables shipping P1 as MVP, then adding P2/P3 incrementally.

#### 15.8 Enforcement

- Agents MUST reject requests to implement features without SpecKit workflow
- Code reviews MUST verify specs/###-feature/ artifacts exist and are complete
- Constitutional compliance checks MUST verify Constitution Check in plan.md validates all 16 principles
- ROADMAP updates MUST reference Feature Folder (proves SpecKit workflow was followed)

#### 15.9 Emergency Exception Protocol

When bypassing SpecKit workflow for emergencies:

1. Create GitHub issue documenting: emergency nature, Constitutional principles affected, compensating controls
2. Implement fix directly on main branch
3. Retrospectively create specs/###-emergency-fix/ with spec.md and plan.md documenting what was done and why
4. Update ROADMAP with emergency feature folder reference
5. Review in next planning session: could this have been prevented? Do we need new Constitutional safeguards?

**Examples of valid emergencies**:

- Security vulnerability requiring immediate patch
- Production incident causing service disruption
- Critical bug affecting user funds or data integrity

**Examples of invalid emergencies** (MUST use SpecKit):

- "Urgent" feature request from stakeholder
- Missed deadline (poor planning, not emergency)
- "Quick fix" that bypasses Constitution Check

### XVI. Test-Driven Development (TDD) Discipline

**Principle**: All feature development MUST follow the Classic (Detroit) TDD cycle: Red → Green → Refactor. Tests MUST be written BEFORE implementation code. Merge to main requires 80%+ code coverage.

**Rules**:

#### 16.1 TDD Cycle (MANDATORY)

**Red-Green-Refactor Cycle**:

```
1. RED: Write a failing test that defines expected behavior
2. GREEN: Write MINIMAL code to make the test pass
3. REFACTOR: Improve code quality while keeping tests green
4. REPEAT: Move to next test case
```

**Cycle Rules**:

- Tests MUST fail before writing implementation (proves test validity)
- Implementation MUST be minimal to pass the test (no speculative code)
- Refactoring MUST NOT change observable behavior (tests remain green)
- Each cycle SHOULD be short (5-15 minutes)

#### 16.2 Testing Framework & Configuration

**Framework**: Vitest (MANDATORY)

- Native ESM support, fast execution, compatible with Next.js 15+
- Jest compatibility for existing patterns
- Built-in coverage reporting

**Test Location**: `__tests__/` folders co-located with source

```
src/
├── features/
│   └── invoice/
│       ├── __tests__/
│       │   ├── create-invoice.test.ts
│       │   └── __snapshots__/
│       │       └── create-invoice.test.ts.snap
│       ├── create-invoice.ts
│       └── index.ts
```

**Naming Conventions**:

- Test files: `*.test.ts` or `*.spec.ts`
- Snapshot files: `__snapshots__/*.snap` (auto-generated)
- Test utilities: `src/shared/lib/test-utils/`

#### 16.3 Coverage Requirements

**Merge Threshold**: 80%+ overall coverage

- Lines: 80% minimum
- Branches: 80% minimum
- Functions: 80% minimum
- Statements: 80% minimum

**CI Enforcement**:

- Coverage report generated on every PR
- Merge BLOCKED if coverage drops below 80%
- Coverage badge displayed in README

**Exceptions**:

- Generated code (excluded from coverage)
- Type-only files (`.d.ts`)
- Configuration files

#### 16.4 Test Types (MANDATORY)

**Unit Tests** (MANDATORY for all features):

- Test individual functions/classes in isolation
- Mock external dependencies
- Fast execution (<100ms per test)
- Located in `__tests__/` next to source

**Snapshot Tests** (MANDATORY for schema & URL encoding):

- Schema serialization (`InvoiceSchemaV1`)
- URL compression output (`lz-string` encoding)
- Protects against accidental breaking changes
- Update with `vitest -u` when intentional changes

#### 16.5 Web3 Testing Strategy

**RPC Mocking** (MANDATORY):

- All blockchain interactions MUST be mocked
- Use `viem/test` utilities or custom mocks
- Deterministic, offline-capable tests
- No testnet dependencies in CI

**Mock Requirements**:

```typescript
// ✅ CORRECT: Mock RPC responses
const mockPublicClient = {
  getBalance: vi.fn().mockResolvedValue(1000000000000000000n),
  getTransaction: vi.fn().mockResolvedValue({ status: 'success' }),
}

// ❌ WRONG: Real RPC calls in tests
const client = createPublicClient({ chain: mainnet, transport: http() })
```

**What to Mock**:

- `getBalance`, `getTransaction`, `getTransactionReceipt`
- Token contract reads (`balanceOf`, `decimals`, `symbol`)
- Block confirmations and finality checks

#### 16.6 SpecKit Integration (Spec-Level Tests)

**Acceptance Tests in spec.md** (MANDATORY):

- Each User Story MUST include acceptance scenarios
- Scenarios use Gherkin-style format: Given/When/Then
- Scenarios become executable tests during implementation

**Workflow Integration**:

```
1. /speckit.specify:
   - Define acceptance scenarios in spec.md
   - Scenarios are human-readable test cases

2. /speckit.plan:
   - Technical Context includes "Testing: Vitest"
   - Identify which scenarios need snapshot tests

3. /speckit.tasks:
   - Task format: T###-test (write test) → T###-impl (implement)
   - Tests BEFORE implementation in task ordering

4. /speckit.implement:
   - Execute Red-Green-Refactor for each task pair
   - Track coverage in task completion
```

**Task Format Example**:

```markdown
## Phase 3: User Story 1 - Create Invoice (P1)

### Tests for User Story 1 (TDD - write FIRST)

- [ ] T010-test [US1] Unit test for invoice validation in **tests**/validate-invoice.test.ts
- [ ] T011-test [US1] Snapshot test for schema encoding in **tests**/invoice-schema.test.ts

### Implementation for User Story 1 (TDD - write AFTER tests fail)

- [ ] T010-impl [US1] Implement invoice validation (make T010-test pass)
- [ ] T011-impl [US1] Implement schema encoding (make T011-test pass)
```

#### 16.7 WIP Commits Exception

**Work-in-Progress Commits**:

- WIP commits in feature branches MAY skip green tests
- Commit message MUST include `[WIP]` prefix
- Purpose: Save progress, share code, intermediate states

**Merge Requirements**:

- All tests MUST pass before merge to main
- Coverage threshold MUST be met
- No `[WIP]` commits in merge request

**Example**:

```bash
# Allowed in feature branch:
git commit -m "[WIP] T010-test: failing test for invoice validation"

# Required before merge:
git commit -m "T010-impl: implement invoice validation (tests passing)"
```

#### 16.8 Anti-Patterns (VIOLATIONS)

**VIOLATION #1: Implementation before test**

```
❌ Write create-invoice.ts → then write create-invoice.test.ts  // WRONG
✅ Write create-invoice.test.ts (fails) → then create-invoice.ts (passes)  // CORRECT
```

**VIOLATION #2: Skipping snapshot tests for schema**

```
❌ Change InvoiceSchemaV1 without updating snapshots  // WRONG
✅ Run `vitest -u` and review snapshot changes  // CORRECT
```

**VIOLATION #3: Real RPC in unit tests**

```
❌ import { createPublicClient } from 'viem'; // Real RPC  // WRONG
✅ vi.mock('viem', () => ({ ... }));  // Mock RPC  // CORRECT
```

**VIOLATION #4: Merging with failing tests**

```
❌ git merge feature-branch  // Tests failing  // WRONG
✅ Fix tests → CI green → git merge  // CORRECT
```

**VIOLATION #5: Merging below coverage threshold**

```
❌ Coverage: 72% → Merge anyway  // WRONG
✅ Add tests → Coverage: 81% → Merge  // CORRECT
```

#### 16.9 Rationale

**Why Classic (Detroit) TDD**:

- Focus on behavior, not implementation details
- Tests serve as executable documentation
- Minimal mocking leads to better design
- Refactoring is safe with comprehensive tests

**Why 80% Coverage Threshold**:

- High enough to catch regressions
- Achievable without test ceremony overhead
- Industry standard for production systems
- Allows pragmatic exceptions

**Why Vitest**:

- 20x faster than Jest for large codebases
- Native ESM support (no transpilation issues)
- Compatible with existing Jest patterns
- Built-in UI for debugging

**Why Spec-Level Tests**:

- Requirements become testable before code
- Acceptance scenarios drive implementation
- User stories verified by acceptance tests
- Traceability: spec → test → code

**Why RPC Mocking**:

- Tests run offline (CI reliability)
- Deterministic results (no network variability)
- Fast execution (no network latency)
- Privacy-first (no telemetry to RPC providers)

#### 16.10 Integration with Other Principles

**Principle IV (Schema Versioning)**:

- Snapshot tests protect schema stability
- Old URL parsing tests MUST pass forever
- Migration adapters tested with fixtures

**Principle VII (Web3 Safety)**:

- Payment verification logic 100% unit tested
- Magic Dust calculation tested for uniqueness
- Decimal handling tested for all supported tokens

**Principle VIII (Context Efficiency)**:

- Test files are information-dense
- One assertion per test (clear failures)
- Descriptive test names (self-documenting)

**Principle XV (SpecKit Workflow)**:

- Acceptance tests defined in spec.md
- Task pairs: T###-test → T###-impl
- TDD cycle enforced during /speckit.implement

#### 16.11 Enforcement

- CI pipeline MUST run `vitest run --coverage` on every PR
- Merge BLOCKED if coverage <80% or tests failing
- Code reviews MUST verify test-first ordering in PRs
- Constitutional compliance checks MUST verify TDD adherence
- Snapshot updates MUST be reviewed (not auto-approved)

## Architectural Constraints

### Technology Stack (Locked for MVP)

The following technology choices are locked for MVP to ensure consistency and maintainability. See Serena memory `tech-stack-locked` for detailed version information.

**Core Framework**:

- Next.js 15+ (App Router + Edge Runtime)
- React 18+
- TypeScript 5.x+ (strict mode)
- Node.js 20+ (specified in .nvmrc)

**Web3 Stack**:

- Wagmi v2+ (Web3 core)
- Viem v2+ (Ethereum interactions)
- RainbowKit v2+ (wallet UI)
- Alchemy + Infura (RPC providers)

**State & Data**:

- Zustand 5+ (client state)
- TanStack Query v5+ (async data, caching)
- lz-string 1.5.0+ (URL compression)

**UI & Styling**:

- Tailwind CSS 4+
- Radix UI primitives (@radix-ui/react-dialog, select, popover)
- class-variance-authority (CVA) 0.7.1+
- Framer Motion 12.x+ (complex animations)
- Lucide React (latest - icons)

**Supported Networks (MVP)**:

- Ethereum Mainnet (Chain ID: 1)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)
- Polygon PoS (Chain ID: 137)

**Version Update Policy**:

- Minor and patch updates are permitted for all dependencies
- Major version updates require constitutional amendment and migration plan
- Security patches should be applied immediately

### Project Structure (Feature-Sliced Design)

The application MUST follow Feature-Sliced Design (FSD) architecture. See Serena memory `architecture-summary` for detailed structure.

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

**Invoice Schema (v1)** - The following fields are locked (see specs/002-url-state-codec/ for full specification):

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
  f: {...};         // Sender info
  c: {...};         // Client info
  it: [...];        // Line items
  tax: string;      // Tax rate
  dsc: string;      // Discount amount
}
```

**URL Constraints**:

- Maximum compressed URL length: 2000 bytes
- Compression algorithm: lz-string (LZW)
- Generation MUST be blocked if URL exceeds limit
- Notes field MUST be limited to 280 characters (enforced in UI)

**Magic Dust Verification**:

- Random micro-amount added to each invoice: 0.000001 - 0.000999
- Provides unique identifier for exact payment matching
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
- Fee-on-transfer tokens → Warning labels
- In-app browsers → Detect and show "Open in system browser" prompt

**Legal/Compliance Risks**:

- OFAC sanctions → NOT implemented in MVP (permissionless philosophy)
- Domain blacklisting → Static blocklist + noindex meta tags
- Support liability → Explicit disclaimers ("non-custodial interface")

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
5. **Memory Updates**: Serena memories updated to reflect Constitutional changes (Principle XIV)
6. **Sync Report**: HTML comment at top of constitution documenting changes
7. **Approval**: Project maintainer approval required

### Compliance Review

**All feature specifications and implementation plans MUST verify compliance with all 16 Constitutional Principles:**

- I: Zero-Backend Architecture
- II: Privacy-First & Self-Custody
- III: Trustless & Permissionless
- IV: Backward Compatibility & Schema Versioning
- V: Security & Abuse Prevention
- VI: RPC Key Protection & Rate Limit Management
- VII: Web3 Safety & Transaction Validation
- VIII: Documentation Context Efficiency
- IX: Implementation Deviation Tracking & Feedback Loop
- X: Git Worktree Isolation for Concurrent Development
- XI: Design Fidelity & V0 Integration
- XII: UI/UX Design Principles
- XIII: Serena-First Code Navigation & Tooling Priority
- XIV: Serena Memory as Project Knowledge Repository
- XV: SpecKit Workflow Compliance
- XVI: Test-Driven Development (TDD) Discipline

**Constitution Check Gate** in plan-template.md MUST verify:

- No backend database introduced (I)
- No user authentication/registration added (III)
- Schema changes follow versioning rules (IV)
- New features preserve privacy-first approach (II)
- Security mechanisms not bypassed (V)
- Documentation follows context efficiency guidelines (VIII)
- UI follows Hybrid Theme Strategy: dark desk, light paper (XII)
- Document representations maintain ISO 216 (A4) aspect ratio (XII)
- All TypeScript/Markdown navigation uses Serena tools first (XIII)
- Serena memories consulted before planning (XIV)
- Following SpecKit workflow phases (XV)
- TDD cycle followed: Red → Green → Refactor with 80%+ coverage (XVI)

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
- Using Read/Grep for TypeScript code navigation (violates Principle XIII)
- Skipping Serena memory consultation (violates Principle XIV)
- Implementing feature without SpecKit workflow (violates Principle XV)
- Merging with coverage below 80% or without TDD cycle (violates Principle XVI)

### Development Philosophy

**Start Simple, Stay Simple**:

- YAGNI (You Aren't Gonna Need It) - No speculative features
- Every feature must have clear user value from brainstorm/spec
- Prefer boring, proven technologies over cutting-edge
- Optimize for maintainability over cleverness

**Testing Discipline** (See Principle XVI for comprehensive TDD requirements):

- All features MUST follow Red-Green-Refactor TDD cycle
- 80%+ coverage threshold for merge to main
- Snapshot tests MANDATORY for schema and URL encoding
- RPC interactions MUST be mocked (no testnet in CI)

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

**Code Navigation Standards** (Principle XIII):

- Always use Serena symbolic tools for TypeScript/Markdown exploration
- Never read full files without `get_symbols_overview` first
- Check references with `find_referencing_symbols` before editing
- Use `replace_symbol_body` for function/class replacements
- Reserve Read/Grep for non-indexed files only

**Knowledge Management Standards** (Principle XIV):

- Consult Serena memories before starting any feature work
- Update memories when discovering new architectural patterns
- Maintain memory hierarchy: Constitution > Memories > SpecKit > Code
- Keep memories information-dense and up-to-date

**Workflow Standards** (Principle XV):

- Follow SpecKit workflow for all features: specify → plan → tasks → implement
- Validate Constitution Check in plan.md before proceeding to implementation
- Track deviations in tasks.md during implementation
- Update ROADMAP and memories upon feature completion

**Version**: 1.13.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-28
