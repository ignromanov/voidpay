# Tasks: VoidPay Project Initialization

**Feature**: 001-project-initialization
**Status**: Completed
**Total Tasks**: 31

## Dependencies

- **Phase 1 (Setup)**: Blocking for all
- **Phase 2 (Foundational)**: Blocking for all User Stories
- **Phase 3 (US1)**: Blocking for US2, US3
- **Phase 4 (US2)**: Blocking for US3 (Layout needs providers)
- **Phase 5 (US3)**: Independent
- **Phase 6 (US4)**: Independent
- **Phase 7 (US5)**: Independent
- **Phase 8 (US6)**: Independent

## Implementation Strategy

- **MVP Scope**: Phases 1-4 are critical for a working "Hello World" with Web3.
- **Parallel Execution**: US3, US4, US5 can be executed in parallel after US2 is complete.
- **Testing**: Manual verification steps included as [P] tasks. Automated tests deferred as per spec.

---

## Phase 1: Setup

_Goal: Initialize project and install all dependencies_

- [x] T001 Initialize Next.js project (App Router, TS, Tailwind, ESLint) in `.`
- [x] T002 Install Web3 dependencies (wagmi, viem, @rainbow-me/rainbowkit, @tanstack/react-query)
- [x] T003 Install State & Utility dependencies (zustand, lz-string, clsx, tailwind-merge)
- [x] T004 Initialize Git repository and .gitignore

## Phase 2: Foundational

_Goal: Configure core architecture and quality tools_

- [x] T005 Configure TypeScript strict mode and path aliases in `tsconfig.json`
- [x] T006 Create FSD Directory Structure (`src/{app,widgets,features,entities,shared}`)
- [x] T007 Configure ESLint (`.eslintrc.json`) and Prettier (`.prettierrc`)
- [x] T008 Configure Tailwind CSS (`tailwind.config.ts`) with electric violet theme

## Phase 3: User Story 1 - Developer Environment Setup

_Goal: Functional dev server with basic landing page_

- [x] T009 [US1] Create basic landing page in `src/app/page.tsx`
- [x] T010 [US1] Verify development server startup

## Phase 4: User Story 2 - Core Tech Stack Integration

_Goal: Integrate Web3, State, and UI libraries_

- [x] T011 [US2] Initialize shadcn/ui and add `button`, `card` components
- [x] T012 [US2] Configure Geist fonts in `src/app/layout.tsx`
- [x] T013 [US2] Create Wagmi config in `src/shared/config/wagmi.ts`
- [x] T014 [US2] Create TanStack Query client in `src/shared/config/query.ts`
- [x] T015 [US2] Implement RootLayout with Providers in `src/app/layout.tsx`
- [x] T016 [US2] Create UserPreferences store in `src/entities/user/model/store.ts`
- [x] T017 [P] [US2] Verify Web3 and State integration

## Phase 5: User Story 3 - Project Structure & FSD Setup

_Goal: Implement routing and FSD entities_

- [x] T018 [US3] Create Network Config entity in `src/entities/network/model/networks.ts`
- [x] T019 [US3] Create Invoice Create page in `src/app/create/page.tsx`
- [x] T020 [US3] Create Payment page in `src/app/pay/page.tsx`
- [x] T021 [US3] Configure SEO metadata (noindex) in app routes
- [x] T022 [P] [US3] Verify Routing and FSD imports

## Phase 6: User Story 4 - Environment Configuration

_Goal: Secure RPC configuration_

- [x] T023 [US4] Create `.env.example` with 8 RPC variables
- [x] T024 [US4] Create Environment Config types in `src/shared/config/env.ts`
- [x] T025 [US4] Implement RPC Proxy Edge Function in `src/app/api/rpc/route.ts`
- [x] T026 [P] [US4] Verify Environment Variables and Proxy

## Phase 7: User Story 5 - Development Tooling

_Goal: Finalize scripts and quality gates_

- [x] T027 [US5] Update `package.json` with `lint`, `format`, `type-check` scripts
- [x] T028 [P] [US5] Verify Quality Gate scripts

## Phase 8: User Story 6 - Automated Quality Gates

_Goal: Verify agent workflow_

- [x] T029 [US6] Verify Agent Workflow (manual check of process)

## Final Phase: Polish

_Goal: Documentation and cleanup_

- [x] T030 Update README.md with Quickstart info
- [x] T031 Clean up any default Next.js boilerplate files
