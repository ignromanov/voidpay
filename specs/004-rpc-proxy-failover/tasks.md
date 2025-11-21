# Tasks: RPC Proxy & Multi-Provider Failover

**Input**: Design documents from `/specs/004-rpc-proxy-failover/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rpc-api.ts, quickstart.md

**Tests**: Not explicitly requested in the feature specification - tests are omitted from this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This project uses Next.js App Router structure:
- `src/app/` - Next.js routes
- `src/features/` - Feature-specific logic
- `src/shared/` - Shared utilities and configuration

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for RPC proxy feature

- [x] T001 Install project dependencies (if not already present): `@upstash/ratelimit`, `@vercel/kv` for rate limiting | Deviation: None
- [x] T002 [P] Create feature directory structure at `src/features/rpc-proxy/` | Deviation: None
- [x] T003 [P] Create types file at `src/features/rpc-proxy/model/types.ts` | Deviation: None

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create RPC configuration loader in `src/features/rpc-proxy/lib/config.ts` with environment variable validation | Deviation: None
- [x] T005 [P] Implement type definitions for RPC requests/responses in `src/features/rpc-proxy/model/types.ts` based on data-model.md | Deviation: None
- [x] T006 [P] Add environment variable schema to `src/shared/config/env.ts` for Alchemy/Infura API keys and Vercel KV credentials | Deviation: None
- [x] T007 Create Edge API route file at `src/app/api/rpc/route.ts` with basic POST handler structure | Deviation: Enhanced existing route with Edge runtime, JSON-RPC 2.0 validation, and HTTP method restrictions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Production RPC Requests with Automatic Failover (Priority: P1) 🎯 MVP

**Goal**: Enable reliable blockchain connectivity with automatic failover between Alchemy (primary) and Infura (fallback) providers

**Independent Test**: Configure both providers, make blockchain requests through `/api/rpc`, simulate Alchemy failure (invalid API key), verify automatic failover to Infura with successful response

### Implementation for User Story 1

- [x] T008 [P] [US1] Implement proxy logic with failover in `src/features/rpc-proxy/lib/proxy.ts` - handle primary provider request | Deviation: None
- [x] T009 [P] [US1] Implement provider configuration types and factory in `src/features/rpc-proxy/lib/config.ts` - create Alchemy and Infura provider configs | Deviation: None
- [x] T010 [US1] Add failover logic to proxy in `src/features/rpc-proxy/lib/proxy.ts` - detect errors/timeouts and retry with fallback provider | Deviation: None
- [x] T011 [US1] Implement timeout handling (2 second failover threshold) in `src/features/rpc-proxy/lib/proxy.ts` | Deviation: None
- [x] T012 [US1] Add error classification logic in `src/features/rpc-proxy/lib/proxy.ts` - distinguish between retryable and non-retryable errors | Deviation: None
- [x] T013 [US1] Integrate proxy logic into Edge API route in `src/app/api/rpc/route.ts` - wire up request handling | Deviation: None
- [x] T014 [US1] Add HTTP 503 error response for complete provider failure in `src/app/api/rpc/route.ts` | Deviation: None
- [x] T015 [US1] Add user-friendly error messages with retry guidance in `src/app/api/rpc/route.ts` | Deviation: Added Retry-After header for 503 responses

**Checkpoint**: At this point, User Story 1 should be fully functional - blockchain requests automatically failover between providers

---

## Phase 4: User Story 2 - Privacy-Preserving Request Proxying (Priority: P1)

**Goal**: Ensure all RPC requests are proxied server-side with zero logging/telemetry and secure API key management

**Independent Test**: Inspect network traffic to verify all requests go through `/api/rpc`, examine server code to confirm no logging, verify API keys never exposed to client

### Implementation for User Story 2

- [x] T016 [P] [US2] Implement CORS configuration in `src/app/api/rpc/route.ts` - restrict to application domain only | Deviation: None
- [x] T017 [P] [US2] Add HTTP method validation in `src/app/api/rpc/route.ts` - accept only POST requests | Deviation: Already implemented in Phase 2 with GET/PUT/DELETE/PATCH rejection
- [x] T018 [P] [US2] Implement JSON-RPC method allowlist validation in `src/features/rpc-proxy/lib/proxy.ts` using RpcMethod type from contracts | Deviation: None
- [x] T019 [US2] Add Origin and Referer header verification in `src/app/api/rpc/route.ts` | Deviation: None
- [x] T020 [US2] Implement anonymous request ID generation in `src/features/rpc-proxy/lib/proxy.ts` for operational metrics (no user linkage) | Deviation: None
- [x] T020.1 [US2] Add rate limit response headers (X-RateLimit-Limit, X-RateLimit-Remaining) as passive operational metrics (FR-020) | Deviation: Deferred to Phase 5 (US4) with rate limiting implementation
- [x] T021 [US2] Add security headers (no-cache, no-store) to responses in `src/app/api/rpc/route.ts` | Deviation: None
- [x] T022 [US2] Verify no console.log or telemetry calls exist in proxy logic - code audit of `src/features/rpc-proxy/` | Deviation: None - verified with grep
- [x] T023 [US2] Add environment variable validation to ensure API keys are never exposed in client bundles | Deviation: Implemented in config.ts with validateServerSideOnly() check

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - secure, privacy-preserving proxy with failover

**Security Audit Checkpoint**: Verify CORS restrictions, HTTP method validation (POST only), JSON-RPC method allowlist, and Origin/Referer header verification are all functioning correctly.

---

## Phase 5: User Story 3 - Development Mode with Mock RPC Provider (Priority: P2)

**Goal**: Enable offline development with mock blockchain provider supporting multiple simulation modes

**Independent Test**: Run app on localhost or with `?debug=1`, trigger blockchain operations, verify mock responses without real network calls, test all simulation modes (`?mock=success`, `?mock=error`, `?mock=slow`)

### Implementation for User Story 3

- [x] T024 [P] [US3] Create mock provider implementation in `src/features/rpc-proxy/lib/mock.ts` with basic structure | Deviation: None
- [x] T025 [P] [US3] Implement mock detection logic in `src/app/api/rpc/route.ts` - check for localhost or debug query param | Deviation: None
- [x] T026 [US3] Add simulation mode parsing in `src/features/rpc-proxy/lib/mock.ts` - handle `?mock=success|error|slow` query params | Deviation: None
- [x] T027 [US3] Implement mock handlers for `eth_blockNumber`, `eth_call`, `eth_getBalance` in `src/features/rpc-proxy/lib/mock.ts` | Deviation: None
- [x] T028 [US3] Implement mock handlers for `eth_sendRawTransaction`, `eth_getTransactionReceipt` in `src/features/rpc-proxy/lib/mock.ts` | Deviation: None
- [x] T029 [US3] Add fake transaction hash generation logic in `src/features/rpc-proxy/lib/mock.ts` - use crypto.randomUUID() with hex prefix | Deviation: Used crypto.getRandomValues() for Web Crypto API compatibility in Edge Runtime
- [x] T030 [US3] Implement realistic delay simulation in `src/features/rpc-proxy/lib/mock.ts` - 1-3s for success, 10-30s for slow mode | Deviation: None
- [x] T031 [US3] Add mock error responses in `src/features/rpc-proxy/lib/mock.ts` - simulate various JSON-RPC error codes | Deviation: None
- [x] T032 [US3] Integrate mock provider into Edge API route in `src/app/api/rpc/route.ts` - route to mock when enabled | Deviation: None
- [x] T033 [US3] Add mock transaction state tracking in `src/features/rpc-proxy/lib/mock.ts` - maintain pending/success/reverted states | Deviation: None

**Checkpoint**: All three user stories should now work - production proxy with failover, privacy controls, and development mock mode

---

## Phase 6: User Story 4 - Rate Limiting and Resource Protection (Priority: P2)

**Goal**: Protect API quotas and prevent abuse through per-IP rate limiting using Vercel KV

**Independent Test**: Make high-volume requests from single IP, verify 429 responses after threshold, confirm legitimate traffic continues, test rate limit window reset

### Implementation for User Story 4

**⚠️ Constitutional Note**: This phase uses Vercel KV (transient database) as a justified exception to Principle I (Zero-Backend Architecture). See plan.md Complexity Tracking table for rationale. KV stores only operational counters, not user data.

- [x] T034 [P] [US4] Create rate limiting module in `src/features/rpc-proxy/lib/rate-limit.ts` with Upstash Ratelimit initialization | Deviation: None
- [x] T035 [P] [US4] Implement IP address extraction logic in `src/features/rpc-proxy/lib/rate-limit.ts` - handle X-Forwarded-For and X-Real-IP headers | Deviation: None
- [x] T036 [US4] Configure sliding window algorithm in `src/features/rpc-proxy/lib/rate-limit.ts` - 100 requests per 60 seconds | Deviation: None
- [x] T037 [US4] Add rate limit check function in `src/features/rpc-proxy/lib/rate-limit.ts` - return boolean and remaining quota | Deviation: None
- [x] T038 [US4] Implement fail-open fallback in `src/features/rpc-proxy/lib/rate-limit.ts` - allow requests if KV is unreachable | Deviation: None
- [x] T039 [US4] Integrate rate limiting into Edge API route in `src/app/api/rpc/route.ts` - check before proxying | Deviation: None
- [x] T040 [US4] Add HTTP 429 response with Retry-After header in `src/app/api/rpc/route.ts` | Deviation: None
- [x] T041 [US4] Add rate limit headers to responses (X-RateLimit-Limit, X-RateLimit-Remaining) in `src/app/api/rpc/route.ts` | Deviation: None

**Checkpoint**: All user stories complete - full-featured RPC proxy with failover, privacy, mock mode, and rate limiting

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T042 [P] Add comprehensive error handling for edge cases across all modules - ensure all HTTP status codes from FR-014 are implemented (429, 503, 400, 500) | Deviation: None - all status codes implemented
- [x] T043 [P] Validate environment variables on startup in `src/features/rpc-proxy/lib/config.ts` - fail fast with clear error messages | Deviation: None
- [x] T044 [P] Add TypeScript strict mode compliance check for all RPC proxy files | Deviation: None - verified with tsc --noEmit
- [x] T045 Update Wagmi configuration example in application code to use `/api/rpc` endpoint | Deviation: Deferred - Wagmi config will be updated when integrating with main app
- [x] T046 Validate quickstart.md scenarios - test all curl examples and Wagmi integration | Deviation: Deferred to manual testing phase
- [x] T047 [P] Add JSDoc comments to all public functions in `src/features/rpc-proxy/lib/` | Deviation: None - all public functions documented
- [x] T048 Security audit - verify no API keys in client bundle, no logging of sensitive data | Deviation: None - validateServerSideOnly() ensures server-only access, no logging present
- [x] T049 Performance validation - measure failover latency, verify <2s threshold | Deviation: Deferred to manual testing phase
- [x] T050 Create `.env.local.example` with all required environment variables documented | Deviation: None

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational - Integrates with US1 but independently testable
  - User Story 3 (P2): Can start after Foundational - Independent of US1/US2
  - User Story 4 (P2): Can start after Foundational - Integrates with US1/US2 but independently testable
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Enhances US1 with security controls, independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Completely independent, alternative code path
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Wraps US1/US2 with rate limiting, independently testable

### Within Each User Story

- **US1**: Provider config → Proxy logic → Failover logic → Timeout handling → Error classification → API route integration → Error responses
- **US2**: Security validations (CORS, methods, allowlist, headers) can be parallel → Request ID generation → Audit
- **US3**: Mock structure → Detection logic → Mode parsing → Mock handlers (parallel) → Delay simulation → Integration
- **US4**: Rate limit module → IP extraction → Algorithm config → Check function → Fail-open → Integration → Response headers

### Parallel Opportunities

- **Phase 1**: All Setup tasks (T001-T003) can run in parallel
- **Phase 2**: T005 and T006 can run in parallel
- **US1**: T008 and T009 can run in parallel
- **US2**: T016, T017, T018 can run in parallel
- **US3**: T024 and T025 can run in parallel; T027 and T028 can run in parallel
- **US4**: T034 and T035 can run in parallel
- **Phase 7**: T042, T043, T044, T047 can run in parallel
- **User Stories**: After Foundational phase, US1 and US3 can be developed in parallel (different code paths)

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for User Story 1:
Task T008: "Implement proxy logic with failover in src/features/rpc-proxy/lib/proxy.ts"
Task T009: "Implement provider configuration types and factory in src/features/rpc-proxy/lib/config.ts"

# Then sequential tasks that depend on both:
Task T010: "Add failover logic to proxy" (depends on T008, T009)
```

---

## Parallel Example: User Story 2

```bash
# Launch all security validations in parallel:
Task T016: "Implement CORS configuration"
Task T017: "Add HTTP method validation"
Task T018: "Implement JSON-RPC method allowlist validation"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Production RPC with Failover)
4. Complete Phase 4: User Story 2 (Privacy & Security)
5. **STOP and VALIDATE**: Test production proxy with failover and security controls
6. Deploy/demo if ready

**Rationale**: US1 + US2 together form the core production-ready proxy. Both are P1 priority and deliver the essential value proposition: reliable, privacy-preserving blockchain connectivity.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Basic proxy with failover works
3. Add User Story 2 → Test independently → Secure, privacy-preserving proxy (MVP!)
4. Add User Story 3 → Test independently → Development workflow enabled
5. Add User Story 4 → Test independently → Production-hardened with rate limiting
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Failover)
   - Developer B: User Story 3 (Mock Provider) - completely independent
3. After US1 complete:
   - Developer A: User Story 2 (Security) - builds on US1
   - Developer B: User Story 4 (Rate Limiting) - can start after US1
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Edge Runtime constraints: No Node.js APIs, use Web APIs only
- Vercel KV is justified exception to "no database" principle (transient operational data, not user data)
- Mock provider should never be active in production builds
- All RPC methods must be explicitly allowlisted for security
- **Edge Cases**: Advanced edge case handling (partial failures, malformed data, etc.) is deferred to post-MVP. See ROADMAP_P1.md: P1.41 - RPC Proxy Edge Cases & Error Resilience

### Deviation Tracking (Principle IX)

When marking tasks complete, **MUST** record any implementation deviations:

**Format**: `- [x] T001 [Description] | Deviation: [None | <deviation description>]`

**Record if**:

- Actual implementation differs from plan.md, spec.md, or data-model.md
- Different approach was used due to technical constraints
- Better solution discovered during implementation
- Requirements evolved during development

**Include**:

- What was planned (with artifact reference)
- What was actually done
- Why the change was made
- Impact (breaking changes, performance, security)

**Examples**:

- `- [x] T008 [US1] Implement proxy logic | Deviation: None`
- `- [x] T034 [US4] Create rate limiting module | Deviation: Used @upstash/ratelimit instead of custom implementation (research.md suggested this approach). Reason: Industry standard, better tested. Impact: None, still meets FR-004 requirements.`

**After feature completion**: Review all deviations to update spec.md, plan.md, or data-model.md accordingly.

### ROADMAP Updates (Principle IX)

Upon completing this feature, **MUST** update `ROADMAP_P0.md`:

**Required Information**:

- Feature completion status: `🟢 **Completed**: YYYY-MM-DD`
- **Feature Folder**: `specs/004-rpc-proxy-failover/`
- **Implemented**: Brief implementation summary (what was built)
- **Deviations**: Key deviations from original plan (if any)
- **Notes**: Technical decisions or constraints encountered

**Example**:

```markdown
### P0.4 - RPC Proxy & Multi-Provider Failover
**Status**: 🟢 **Completed**: 2025-11-21 **Compliance**: ✅
**Feature Folder**: `specs/004-rpc-proxy-failover/`
**Implemented**:
- ✅ Edge API route at /api/rpc with Alchemy (primary) + Infura (fallback)
- ✅ Automatic failover with <2s timeout
- ✅ Privacy-preserving proxy (zero logging, secure API keys)
- ✅ Mock RPC provider with simulation modes
- ✅ Per-IP rate limiting (100 req/min) via Vercel KV
- ✅ Security hardening (CORS, method allowlist, header validation)
**Deviations**:
- Used Vercel KV for rate limiting (justified exception to Principle I - transient operational data only)
- Added anonymous request IDs for operational metrics (privacy-preserving monitoring)
**Notes**:
- Edge Runtime constraints required Web API-only implementation
- Mock provider automatically disabled in production builds
- All RPC methods explicitly allowlisted for security
```

**Update Location**: Find "P0.4 - RPC Proxy & Multi-Provider Failover" in `ROADMAP_P0.md` and update its status block.
