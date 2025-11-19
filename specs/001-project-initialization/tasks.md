# Tasks: VoidPay Project Initialization

**Feature**: 001-project-initialization
**Status**: Pending
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
*Goal: Initialize project and install all dependencies*

- [ ] T001 Initialize Next.js project (App Router, TS, Tailwind, ESLint) in `.`
- [ ] T002 Install Web3 dependencies (wagmi, viem, @rainbow-me/rainbowkit, @tanstack/react-query)
- [ ] T003 Install State & Utility dependencies (zustand, lz-string, clsx, tailwind-merge)
- [ ] T004 Initialize Git repository and .gitignore

## Phase 2: Foundational
*Goal: Configure core architecture and quality tools*

- [ ] T005 Configure TypeScript strict mode and path aliases in `tsconfig.json`
- [ ] T006 Create FSD Directory Structure (`src/{app,widgets,features,entities,shared}`)
- [ ] T007 Configure ESLint (`.eslintrc.json`) and Prettier (`.prettierrc`)
- [ ] T008 Configure Tailwind CSS (`tailwind.config.ts`) with electric violet theme

## Phase 3: User Story 1 - Developer Environment Setup
*Goal: Functional dev server with basic landing page*

- [ ] T009 [US1] Create basic landing page in `src/app/page.tsx`
- [ ] T010 [US1] Verify development server startup

## Phase 4: User Story 2 - Core Tech Stack Integration
*Goal: Integrate Web3, State, and UI libraries*

- [ ] T011 [US2] Initialize shadcn/ui and add `button`, `card` components
- [ ] T012 [US2] Configure Geist fonts in `src/app/layout.tsx`
- [ ] T013 [US2] Create Wagmi config in `src/shared/config/wagmi.ts`
- [ ] T014 [US2] Create TanStack Query client in `src/shared/config/query.ts`
- [ ] T015 [US2] Implement RootLayout with Providers in `src/app/layout.tsx`
- [ ] T016 [US2] Create UserPreferences store in `src/entities/user/model/store.ts`
- [ ] T017 [P] [US2] Verify Web3 and State integration

## Phase 5: User Story 3 - Project Structure & FSD Setup
*Goal: Implement routing and FSD entities*

- [ ] T018 [US3] Create Network Config entity in `src/entities/network/model/networks.ts`
- [ ] T019 [US3] Create Invoice Create page in `src/app/create/page.tsx`
- [ ] T020 [US3] Create Payment page in `src/app/pay/page.tsx`
- [ ] T021 [US3] Configure SEO metadata (noindex) in app routes
- [ ] T022 [P] [US3] Verify Routing and FSD imports

## Phase 6: User Story 4 - Environment Configuration
*Goal: Secure RPC configuration*

- [ ] T023 [US4] Create `.env.example` with 8 RPC variables
- [ ] T024 [US4] Create Environment Config types in `src/shared/config/env.ts`
- [ ] T025 [US4] Implement RPC Proxy Edge Function in `src/app/api/rpc/route.ts`
- [ ] T026 [P] [US4] Verify Environment Variables and Proxy

## Phase 7: User Story 5 - Development Tooling
*Goal: Finalize scripts and quality gates*

- [ ] T027 [US5] Update `package.json` with `lint`, `format`, `type-check` scripts
- [ ] T028 [P] [US5] Verify Quality Gate scripts

## Phase 8: User Story 6 - Automated Quality Gates
*Goal: Verify agent workflow*

- [ ] T029 [US6] Verify Agent Workflow (manual check of process)

## Final Phase: Polish
*Goal: Documentation and cleanup*

- [ ] T030 Update README.md with Quickstart info
- [ ] T031 Clean up any default Next.js boilerplate files
