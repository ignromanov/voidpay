# Feature Specification: RPC Proxy & Multi-Provider Failover

**Feature Branch**: `004-rpc-proxy-failover`  
**Created**: 2025-11-21  
**Status**: Draft

## Clarifications

### Session 2025-11-21

- Q: Should the RPC proxy endpoint be publicly accessible or require authentication? → A: Public access with CORS restrictions, method validation (POST only), JSON-RPC method allowlist, and origin/referer verification (no user authentication required)
- Q: How should the system monitor proxy health and provider availability without logging user request data? → A: Anonymous request IDs with metrics (pseudonymized tracking for operational monitoring)
- Q: What should the system do when all configured RPC providers are unavailable? → A: Return error with retry guidance (HTTP 503, user-friendly message)
- Q: What is the scope of rate limiting enforcement? → A: Per IP address (100 requests per minute per unique IP address)
- Q: How should developers switch between different mock simulation modes? → A: Query parameters (e.g., `?mock=success`, `?mock=error`, `?mock=slow`)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Production RPC Requests with Automatic Failover (Priority: P1)

A user interacts with the invoice application, triggering blockchain operations (e.g., viewing on-chain payment status, submitting transactions). The application sends RPC requests through a proxy that automatically routes to available providers, ensuring uninterrupted service even when a primary provider experiences downtime or rate limiting.

**Why this priority**: This is the core functionality that enables reliable blockchain connectivity in production. Without automatic failover, users would experience service interruptions whenever a single RPC provider fails or hits rate limits, directly impacting the application's reliability and user trust.

**Independent Test**: Can be fully tested by configuring multiple RPC providers, making blockchain requests through the proxy, and simulating provider failures. Delivers continuous blockchain connectivity without manual intervention.

**Acceptance Scenarios**:

1. **Given** the primary provider (Alchemy) is operational, **When** a user triggers a blockchain read operation, **Then** the request is successfully routed through Alchemy and returns valid data
2. **Given** the primary provider (Alchemy) is down or rate-limited, **When** a user triggers a blockchain read operation, **Then** the request automatically fails over to the secondary provider (Infura) and returns valid data
3. **Given** both providers are operational, **When** the primary provider returns an error, **Then** the system attempts the request with the fallback provider before returning an error to the user
4. **Given** a user is making multiple requests, **When** the rate limit is approached on one provider, **Then** subsequent requests are automatically distributed to prevent hitting limits

---

### User Story 2 - Privacy-Preserving Request Proxying (Priority: P1)

A user makes blockchain requests through the application. All requests are proxied through the application's API route, ensuring that user IP addresses and request patterns are not directly exposed to third-party RPC providers, and no telemetry or logging occurs that could compromise user privacy.

**Why this priority**: Privacy is a constitutional principle (Principle VI) and a core value proposition. Direct client-to-provider connections would expose user metadata to third parties, violating the stateless and privacy-first design philosophy.

**Independent Test**: Can be fully tested by inspecting network traffic to verify all RPC requests go through the proxy, examining server logs to confirm no request data is persisted, and verifying that provider API keys are never exposed to the client. Delivers enhanced privacy protection.

**Acceptance Scenarios**:

1. **Given** a user loads the application, **When** blockchain data is fetched, **Then** all RPC requests are routed through `/api/rpc` and never directly to external providers
2. **Given** a user makes an RPC request, **When** the proxy processes it, **Then** no request details, user identifiers, or metadata are logged or persisted
3. **Given** the application is running, **When** inspecting client-side code and network requests, **Then** provider API keys are never exposed or accessible to the client
4. **Given** a user makes multiple requests, **When** examining server behavior, **Then** no telemetry, analytics, or tracking data is sent to any third party

---

### User Story 3 - Development Mode with Mock RPC Provider (Priority: P2)

A developer works on the invoice application locally or with debug mode enabled. The application automatically uses a mock RPC provider that simulates various blockchain scenarios (successful transactions, errors, delayed finalization) without requiring real blockchain connections or consuming API quota.

**Why this priority**: Essential for efficient development and testing workflows. Enables developers to work offline, test edge cases, and iterate quickly without depending on external services or spending real resources.

**Independent Test**: Can be fully tested by running the application with `?debug=1` query parameter or on localhost, triggering various blockchain operations, and verifying that mock responses are returned with appropriate delays and states. Delivers a complete development environment without external dependencies.

**Acceptance Scenarios**:

1. **Given** the application is running on localhost, **When** a blockchain request is made, **Then** the mock provider returns simulated data without contacting real RPC endpoints
2. **Given** the application URL includes `?debug=1`, **When** a transaction is submitted, **Then** the mock provider generates a fake transaction hash and simulates transaction lifecycle
3. **Given** mock mode is active, **When** testing different scenarios, **Then** the developer can switch between success (`?mock=success`), error (`?mock=error`), and delayed finalization (`?mock=slow`) states using query parameters
4. **Given** a developer is testing transaction flows, **When** a mock transaction is submitted, **Then** realistic delays and state transitions are simulated to match production behavior

---

### User Story 4 - Rate Limiting and Resource Protection (Priority: P2)

The application serves multiple concurrent users making blockchain requests. The proxy implements rate limiting to prevent abuse, protect API quota across providers, and ensure fair resource distribution among users.

**Why this priority**: Protects the application from excessive costs and service degradation. Without rate limiting, a single user or attack could exhaust API quotas, causing service disruption for all users.

**Independent Test**: Can be fully tested by simulating high-volume requests from single and multiple sources, verifying that limits are enforced, and confirming that legitimate traffic continues to flow. Delivers cost control and service stability.

**Acceptance Scenarios**:

1. **Given** a user makes requests at a normal rate, **When** the proxy processes them, **Then** all requests are fulfilled without rate limit errors
2. **Given** a user exceeds the rate limit threshold, **When** additional requests are made, **Then** the proxy returns a rate limit error with appropriate HTTP status code (429)
3. **Given** multiple users are making concurrent requests, **When** the aggregate rate approaches provider limits, **Then** the proxy distributes requests across providers to maximize throughput
4. **Given** rate limits are enforced, **When** a user waits for the rate limit window to reset, **Then** subsequent requests are processed normally

---

### Edge Cases

- **Complete provider failure**: When both primary and fallback providers are simultaneously unavailable, the system returns HTTP 503 with a user-friendly error message advising users to retry later.

**Deferred to Post-MVP** (see ROADMAP_P1.md: P1.41 - RPC Proxy Edge Cases & Error Resilience):

- Partial provider failures (some RPC methods work, others fail)
- Invalid or malformed provider data responses
- Mock-to-production mode transitions
- Simultaneous rate limits on all providers
- Network timeouts and extremely slow responses
- Missing or invalid environment variables
- Localhost vs. deployed environment behavior consistency

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a server-side API endpoint that proxies all blockchain RPC requests
- **FR-002**: System MUST configure at least two RPC providers with primary and fallback designation
- **FR-003**: System MUST automatically failover to the fallback provider when the primary provider returns errors, timeouts, or rate limit responses
- **FR-004**: System MUST implement rate limiting at the proxy level with limits enforced per IP address to prevent abuse and protect API quotas
- **FR-005**: System MUST NOT log, persist, or transmit any user-identifiable data, IP addresses, or request content; anonymous request IDs for operational metrics are permitted
- **FR-006**: System MUST securely manage provider API keys through environment variables
- **FR-007**: System MUST expose provider API keys only on the server side and never in client-side bundles
- **FR-008**: System MUST implement a mock blockchain provider that simulates blockchain interactions for development and testing
- **FR-009**: Mock provider MUST activate automatically when running on localhost OR when `?debug=1` query parameter is present
- **FR-010**: Mock provider MUST support simulation modes for "Success", "Error", and "Long Finalization" transaction scenarios, controllable via query parameters (`?mock=success`, `?mock=error`, `?mock=slow`) when mock mode is active
- **FR-011**: Mock provider MUST generate realistic fake transaction hashes for UI testing purposes
- **FR-012**: System MUST enable automatic provider failover at the client library level
- **FR-013**: System MUST handle provider failover transparently without requiring user intervention or page reloads
- **FR-014**: System MUST return appropriate HTTP status codes for different failure scenarios (429 for rate limits, 503 for provider unavailability, etc.)
- **FR-015**: Mock provider MUST simulate realistic timing delays for transaction submission and finalization
- **FR-016**: System MUST enforce strict CORS policy allowing requests only from the application's own domain
- **FR-017**: Proxy endpoint MUST accept only POST requests and reject all other HTTP methods
- **FR-018**: System MUST validate incoming requests against a JSON-RPC method allowlist and reject unauthorized methods
- **FR-019**: System MUST verify Origin and Referer headers to prevent cross-origin abuse
- **FR-020**: System MUST collect operational metrics (request counts, error rates, provider health status) using anonymous request IDs that cannot be linked to users

### Key Entities

- **RPC Request**: Represents a blockchain RPC call, including method name, parameters, and target chain. Does not include user identifiers or metadata.
- **RPC Provider**: Represents a configured blockchain node provider (Alchemy or Infura), including endpoint URL, API key, and health status.
- **Rate Limit State**: Tracks request counts and timing windows for enforcing rate limits per IP address.
- **Mock Transaction**: Represents a simulated blockchain transaction with fake hash, status, and timing information for development testing.
- **Provider Configuration**: Contains environment-specific settings for RPC providers, including API keys, endpoints, and failover rules.

## Assumptions

- **Provider Selection**: Based on user requirements, Alchemy will be used as the primary provider and Infura as the fallback. These are industry-standard RPC providers with proven reliability.
- **Deployment Platform**: The application will be deployed on Vercel for environment variable management and Edge Functions support.
- **Framework Context**: The application uses Next.js with Edge API routes and Wagmi for blockchain interactions.
- **Mock Mode Activation**: Mock provider activates when running on localhost OR when `?debug=1` query parameter is present. Simulation modes (`?mock=success|error|slow`) control behavior when mock mode is active.
- **Rate Limit Threshold**: Default rate limit of 100 requests per minute per source is assumed as a reasonable starting point to prevent abuse while allowing normal usage patterns.
- **Failover Timeout**: 2-second timeout for failover operations is assumed to balance responsiveness with allowing sufficient time for network operations.
- **Transaction Simulation Timing**: Mock transactions will simulate realistic timing (1-3 seconds for success, 10-30 seconds for long finalization) based on typical blockchain confirmation times.
- **Privacy Requirement**: Zero logging and telemetry is a constitutional requirement (Principle VI) and must be strictly enforced.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 99.9% of blockchain requests succeed when at least one provider is operational
- **SC-002**: Failover from primary to fallback provider completes within 2 seconds for any request type
- **SC-003**: Zero user request data is logged or persisted on the server (verifiable through code audit and log inspection)
- **SC-004**: Rate limiting prevents any single IP address from consuming more than 100 requests per minute
- **SC-005**: Mock provider activates automatically on localhost and with `?debug=1` parameter 100% of the time
- **SC-006**: Mock transaction simulations complete with realistic timing (1-3 seconds for success, 10-30 seconds for long finalization)
- **SC-007**: Provider API keys remain unexposed in client-side bundles (verifiable through bundle analysis and network inspection)
- **SC-008**: Application handles complete provider outages gracefully with user-friendly error messages
