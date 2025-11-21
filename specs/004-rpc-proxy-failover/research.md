# Research: RPC Proxy & Multi-Provider Failover

**Feature**: `004-rpc-proxy-failover`
**Date**: 2025-11-21

## 1. Rate Limiting in Edge Runtime

**Problem**: Next.js Edge Functions are stateless and distributed. In-memory rate limiting is ineffective as it doesn't share state across regions or invocations.
**Constraint**: Constitution Principle I prohibits "server-side database for storing invoice data".

**Options Evaluated**:
1.  **In-Memory**: Rejected. Unreliable in serverless.
2.  **Vercel WAF**: Rejected. Enterprise feature, opaque configuration.
3.  **Vercel KV (Redis) + @upstash/ratelimit**: Selected.

**Decision**: Use **Vercel KV** with `@upstash/ratelimit`.
**Rationale**:
-   It is the industry standard for Next.js Edge rate limiting.
-   It stores *transient operational data* (counters), not *persistent user data* (invoices).
-   This distinction allows it to coexist with the "Stateless" philosophy regarding user data.
-   It enables the required "Per IP address" limiting (FR-004).

**Implementation Details**:
-   Use `sliding-window` algorithm for smoother limiting.
-   Fallback to "allow" if KV is unreachable (fail open) to prevent blocking legitimate users during infra issues.

## 2. RPC Failover Strategy

**Problem**: Ensure high availability for RPC requests.

**Options Evaluated**:
1.  **Client-Side Failover (Wagmi)**: Rejected. Requires exposing API keys to client (violates Principle VI).
2.  **Server-Side Proxy Failover**: Selected.

**Decision**: Implement **Server-Side Failover** in the Edge Route.
**Rationale**:
-   Keeps API keys secure on the server.
-   Simplifies client logic (client sees one stable endpoint).

**Implementation Details**:
-   **Primary**: Alchemy.
-   **Fallback**: Infura.
-   **Logic**:
    1.  Attempt request to Primary.
    2.  If error (network or 5xx), log (internally/debug) and attempt Fallback.
    3.  If both fail, return 503.
    4.  Respect `Retry-After` headers if present.

## 3. Mock Provider Implementation

**Problem**: Simulate blockchain interactions without real network calls.

**Decision**: Implement a **Mock Handler** within the Proxy Route.
**Rationale**:
-   Allows switching modes via query params (`?mock=success`) without changing client build.
-   Centralizes mock logic.

**Implementation Details**:
-   Intercept requests when `mock` param is present or `NODE_ENV=development`.
-   Simulate `eth_blockNumber`, `eth_call`, `eth_sendRawTransaction`, `eth_getTransactionReceipt`.
-   Use `setTimeout` to simulate network delay.
