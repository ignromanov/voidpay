# Feature Specification: VoidPay Project Initialization

**Feature Branch**: `001-project-initialization`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "давай инициализируем наш проект"

## Clarifications

### Session 2025-11-19

- Q: RPC Endpoint Configuration Strategy - Should each network have both Alchemy and Infura endpoints configured separately, or use shared provider keys? → A: Network-specific endpoints - Each of the 4 networks (Ethereum, Arbitrum, Optimism, Polygon PoS) has both Alchemy and Infura endpoints configured separately for complete failover coverage

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Environment Setup (Priority: P1)

A developer clones the VoidPay repository and needs to get a functional development environment running with Next.js, TypeScript, and all required dependencies installed and configured.

**Why this priority**: Without a working development environment, no other features can be implemented. This is the foundation for all subsequent work.

**Independent Test**: Can be fully tested by cloning the repo, running `pnpm install`, and starting the dev server. Success is verified when the app runs without errors and displays a basic landing page.

**Acceptance Scenarios**:

1. **Given** a fresh repository clone, **When** developer runs `pnpm install`, **Then** all dependencies install without errors
2. **Given** dependencies are installed, **When** developer runs `pnpm dev`, **Then** Next.js dev server starts and is accessible at `localhost:3000`
3. **Given** dev server is running, **When** developer opens browser, **Then** a basic landing page is displayed without console errors
4. **Given** TypeScript is configured, **When** developer opens any `.ts` or `.tsx` file, **Then** IDE shows proper TypeScript support and type checking

---

### User Story 2 - Core Tech Stack Integration (Priority: P2)

Developers need all essential libraries and frameworks integrated and properly configured: Web3 (Wagmi, Viem, RainbowKit), state management (Zustand), styling (Tailwind, shadcn/ui), and data fetching (TanStack Query).

**Why this priority**: These are the fundamental building blocks defined in the constitution. Having them configured correctly ensures consistent development patterns and prevents technical debt.

**Independent Test**: Can be tested by creating a minimal test component that uses each major library (e.g., a button that connects a wallet, uses Zustand state, and fetches data). Success is verified when all libraries work together without conflicts.

**Acceptance Scenarios**:

1. **Given** Wagmi and RainbowKit are installed, **When** user clicks "Connect Wallet" button, **Then** RainbowKit modal opens and wallet connection works
2. **Given** Tailwind and shadcn/ui are configured, **When** developer uses shadcn components, **Then** components render with correct Tailwind styling
3. **Given** Zustand is configured, **When** developer creates a store with persist middleware, **Then** state persists to LocalStorage correctly
4. **Given** TanStack Query is configured, **When** developer creates a query, **Then** data fetching, caching, and error handling work as expected
5. **Given** lz-string is installed, **When** developer compresses/decompresses data, **Then** round-trip encoding/decoding works without data loss

---

### User Story 3 - Project Structure & FSD Setup (Priority: P2)

The project follows Feature-Sliced Design architecture with proper folder structure (`app/`, `widgets/`, `features/`, `entities/`, `shared/`) and TypeScript path aliases configured for clean imports.

**Why this priority**: Proper architecture from day one prevents refactoring pain later. FSD is mandated by the constitution and enables scalable, maintainable code organization.

**Independent Test**: Can be tested by creating test files in each FSD layer and verifying imports work correctly. Success is verified when path aliases resolve properly and layer dependencies follow FSD rules (e.g., shared can't import from features).

**Acceptance Scenarios**:

1. **Given** FSD folder structure exists, **When** developer creates a file in `src/features/`, **Then** folder structure matches `src/features/feature-name/index.ts` pattern
2. **Given** TypeScript path aliases are configured, **When** developer imports from `@/shared/ui/button`, **Then** import resolves correctly without relative paths
3. **Given** basic routing is set up, **When** developer navigates to `/`, `/create`, `/pay`, **Then** Next.js App Router serves correct route layouts (even if placeholder content)
4. **Given** Geist fonts are configured, **When** page renders, **Then** Geist Sans is used for UI text and Geist Mono for data/code

---

### User Story 4 - Environment Configuration & Secrets Management (Priority: P3)

Developers can configure RPC provider API keys (Alchemy, Infura) via environment variables, with a clear `.env.example` template and validation that prevents app startup if required keys are missing.

**Why this priority**: RPC keys are required for Web3 functionality, but proper secrets management is critical for security (Principle VI). This can be set up later since basic UI development doesn't require working RPC connections.

**Independent Test**: Can be tested by copying `.env.example` to `.env`, filling in test API keys, and verifying the app reads them correctly. Success is verified when RPC proxy route can make requests using environment variables.

**Acceptance Scenarios**:

1. **Given** `.env.example` exists, **When** developer copies it to `.env`, **Then** file contains clear documentation of all 8 required RPC endpoint variables (4 Alchemy + 4 Infura, one per network)
2. **Given** `.env` has valid keys, **When** app starts, **Then** environment variables are loaded and accessible in Edge Functions
3. **Given** `.env` is missing required keys, **When** app attempts RPC call, **Then** clear error message indicates which environment variable is missing
4. **Given** `.gitignore` is configured, **When** developer commits code, **Then** `.env` is excluded but `.env.example` is included

---

### User Story 5 - Development Tooling & Quality Gates (Priority: P3)

The project has ESLint, Prettier, and TypeScript configured with strict rules, plus basic pnpm scripts for common tasks (dev, build, lint, format, type-check).

**Why this priority**: Code quality tools prevent bugs and maintain consistency, but they can be configured after initial setup. Not blocking for getting started, but important for long-term maintainability.

**Independent Test**: Can be tested by running each pnpm script and intentionally creating code violations. Success is verified when linters catch errors and formatters automatically fix issues.

**Acceptance Scenarios**:

1. **Given** ESLint is configured, **When** developer writes code violating rules, **Then** ESLint shows warnings/errors in IDE and `pnpm lint` reports issues
2. **Given** Prettier is configured, **When** developer runs `pnpm format`, **Then** all files are formatted consistently
3. **Given** TypeScript strict mode is enabled, **When** developer writes unsafe code, **Then** `pnpm type-check` fails with clear error messages
4. **Given** pre-commit hooks are configured (optional), **When** developer commits, **Then** linting and type checking run automatically

---

### User Story 6 - Automated Quality Gates & Agent Workflow (Priority: P3)

After completing any development task, the AI agent (Claude Code) automatically runs quality checks (TypeScript, ESLint) in minimal/fast mode to catch errors before commit. User reviews changes and confirms, then agent creates git commit.

**Why this priority**: Automated quality gates catch errors early and maintain code quality without manual intervention. This workflow can be established after basic tooling is set up.

**Independent Test**: Can be tested by completing a task that introduces TypeScript errors, then verifying agent catches them before attempting commit. Success is verified when agent runs checks, fixes errors, waits for user confirmation, and creates commit only after approval.

**Acceptance Scenarios**:

1. **Given** agent completes a development task, **When** task is marked done, **Then** agent automatically runs `pnpm type-check` and `pnpm lint` in fast mode
2. **Given** quality checks pass, **When** agent detects no errors, **Then** agent reports "All checks passed" and awaits user confirmation
3. **Given** quality checks fail, **When** TypeScript or ESLint errors are found, **Then** agent automatically attempts to fix errors and re-runs checks
4. **Given** errors cannot be auto-fixed, **When** manual intervention is needed, **Then** agent reports specific errors and asks user for guidance
5. **Given** all checks pass and user confirms, **When** user approves commit, **Then** agent creates git commit with descriptive message following constitution guidelines
6. **Given** user does not confirm, **When** user requests changes, **Then** agent does not create commit and returns to development mode

---

### Edge Cases

- What happens when a developer uses npm or yarn instead of pnpm? (Preferred: pnpm for faster installs and better monorepo support; pnpm-lock.yaml vs package-lock.json vs yarn.lock)
- How does system handle missing `.env` file on first clone? (Should gracefully degrade or show clear setup instructions)
- What if Next.js version in package.json becomes outdated? (Need upgrade path documentation)
- How to handle conflicts between different Node.js versions? (Specify required Node version in `package.json` engines field and use `.nvmrc`)
- What happens if shadcn/ui components need customization? (Document how to extend default theme)
- What if quality checks timeout during agent workflow? (Set reasonable timeout limits, e.g., 30s for type-check, 15s for lint)
- How to handle partial commit scenarios? (Agent should check git status and only commit files related to completed task)
- What happens when one RPC provider fails for a specific network? (Wagmi should automatically failover to the alternate provider for that network; implement retry logic with exponential backoff)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Project MUST use locked core framework versions (Constitution v1.2.0):
  - Next.js 1%+, React 18+, React DOM 18+, TypeScript 5.x+ (strict mode), Node.js 20+ (.nvmrc)
- **FR-002**: Project MUST include all constitutional tech stack dependencies with locked versions (Constitution v1.2.0):
  - Web3: `wagmi@2+`, `viem@2+`, `@rainbow-me/rainbowkit@2.2.9+`
  - State: `zustand@5+`, `@tanstack/react-query@5+`
  - Compression: `lz-string@1.5.0+`
  - UI: `tailwindcss@4+`, `shadcn/ui` components, `lucide-react` (latest)
  - Utils: `clsx@2.1.1+`, `tailwind-merge@2.5.4+`
  - Fonts: Geist Sans and Geist Mono
- **FR-003**: Project MUST follow Feature-Sliced Design architecture with layers: `app/`, `widgets/`, `features/`, `entities/`, `shared/`
- **FR-004**: Project MUST configure TypeScript path aliases for FSD layers (e.g., `@/shared/`, `@/features/`)
- **FR-005**: Project MUST create route structure: `/` (landing), `/create` (invoice editor), `/pay` (payment view)
- **FR-006**: Project MUST configure Tailwind CSS with shadcn/ui design system and electric violet accent color (`#7C3AED`)
- **FR-007**: Project MUST set up RainbowKit with Wagmi for wallet connection supporting Ethereum, Arbitrum, Optimism, and Polygon PoS networks
- **FR-008**: Project MUST configure environment variables for RPC providers with network-specific endpoints:
  - Alchemy endpoints for each network: `NEXT_PUBLIC_ALCHEMY_ETH_URL`, `NEXT_PUBLIC_ALCHEMY_ARB_URL`, `NEXT_PUBLIC_ALCHEMY_OPT_URL`, `NEXT_PUBLIC_ALCHEMY_POLY_URL`
  - Infura endpoints for each network: `NEXT_PUBLIC_INFURA_ETH_URL`, `NEXT_PUBLIC_INFURA_ARB_URL`, `NEXT_PUBLIC_INFURA_OPT_URL`, `NEXT_PUBLIC_INFURA_POLY_URL`
  - Each network has dual-provider redundancy for complete failover coverage
- **FR-009**: Project MUST provide `.env.example` template with all required environment variables documented
- **FR-010**: Project MUST configure Zustand persistence to LocalStorage (not SessionStorage or server-side)
- **FR-011**: Project MUST configure TanStack Query with aggressive caching strategy for static blockchain data
- **FR-012**: Project MUST include ESLint, Prettier, and TypeScript type checking in npm scripts
- **FR-013**: Project MUST configure `.gitignore` to exclude `.env`, `node_modules/`, `.next/`, and other build artifacts
- **FR-014**: Project MUST set up Geist font family loading (Sans for UI, Mono for data)
- **FR-015**: Project MUST configure Next.js metadata for SEO (only `/` indexed, `/create` and `/pay` with `noindex`)
- **FR-016**: Development server MUST start without errors and serve a basic landing page
- **FR-017**: Project MUST specify Node.js version requirement in `package.json` engines field (Node 20+ recommended)
- **FR-018**: Project MUST use pnpm as primary package manager with corresponding scripts in `package.json`
- **FR-019**: Project MUST provide `.nvmrc` file specifying exact Node.js version for consistency
- **FR-020**: Agent workflow MUST include automated quality checks after task completion:
  - TypeScript type checking (`pnpm type-check`)
  - ESLint linting (`pnpm lint`)
  - Fast/minimal mode for context efficiency
- **FR-021**: Agent MUST wait for explicit user confirmation before creating git commits
- **FR-022**: Agent MUST attempt automatic error fixing when quality checks fail, with fallback to user guidance if auto-fix fails
- **FR-023**: All configuration files MUST follow Documentation Context Efficiency principle (Constitution v1.2.0 Principle VIII):
  - README.md and docs prioritize information density
  - Use structured formats (lists, tables) over prose
  - Configuration comments are concise
  - Cross-reference external docs via links

### Key Entities _(include if feature involves data)_

- **Development Environment**: Represents the local setup required for developers (Node.js version, package manager, installed dependencies, environment variables)
- **Build Configuration**: Represents compilation settings (Next.js config, TypeScript config, Tailwind config, PostCSS config)
- **Network Configuration**: Represents supported blockchain networks with their Chain IDs, dual RPC endpoints per network (Alchemy primary, Infura fallback), and display properties (name, colors, native currency)
- **Font Assets**: Represents Geist Sans and Geist Mono font files and their loading configuration

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developer can complete environment setup (clone → install → run dev server) in under 5 minutes
- **SC-002**: Development server starts successfully on first `pnpm dev` after fresh install (no errors in console)
- **SC-003**: All TypeScript files compile without errors when running `pnpm type-check`
- **SC-004**: All ESLint rules pass when running `pnpm lint` on initial codebase
- **SC-005**: Basic landing page renders in browser with correct fonts (Geist Sans) and styling (Tailwind + shadcn/ui)
- **SC-006**: RainbowKit wallet connection modal opens and displays at least 4 wallet options
- **SC-007**: All four target networks (Ethereum, Arbitrum, Optimism, Polygon PoS) appear in network switcher
- **SC-008**: Path aliases resolve correctly in IDE (no TypeScript import errors when using `@/shared/*` syntax)
- **SC-009**: Production build completes successfully with `pnpm build` (no build errors)
- **SC-010**: Bundle size for initial landing page is under 500KB (compressed) to ensure fast loading
- **SC-011**: Quality checks (type-check + lint) complete in under 45 seconds total on average project size
- **SC-012**: Agent successfully catches and reports at least 90% of common TypeScript/ESLint errors before commit
- **SC-013**: Agent workflow from task completion to commit ready status takes under 2 minutes (including checks and auto-fixes)
- **SC-014**: Project documentation (README, config comments) is concise with <50 lines for core setup instructions
