# RPC Proxy API Contract

**Endpoint**: `/api/rpc`
**Runtime**: Vercel Edge Runtime
**Purpose**: Securely proxy blockchain RPC requests while protecting API keys from client exposure (Constitutional Principle VI)

---

## POST /api/rpc

### Description

Forwards JSON-RPC requests to Alchemy RPC provider, injecting API key from server-side environment variables. This endpoint acts as a transparent proxy - clients send standard JSON-RPC payloads without knowledge of the underlying provider or API keys.

### Authentication

- **None** (public endpoint)
- Rate limiting: Inherits Vercel Edge Function limits (1000 req/s per region)
- Abuse prevention: Deferred to future feature (IP-based rate limiting, request validation)

### Request

**Method**: `POST`

**Headers**:

```http
Content-Type: application/json
```

**Body** (JSON-RPC 2.0 format):

```typescript
interface RpcProxyRequest {
  jsonrpc: '2.0' // JSON-RPC version (required)
  method: string // RPC method (e.g., "eth_getBalance", "eth_call")
  params: any[] // Method-specific parameters
  id: number | string // Request ID (echoed in response)
  chainId: number // Target network (1, 42161, 10, 137)
}
```

**Example**:

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getBalance",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"],
  "id": 1,
  "chainId": 1
}
```

### Response

**Success (200 OK)**:

```typescript
interface RpcProxyResponse {
  jsonrpc: '2.0'
  result: any // Method-specific result
  id: number | string // Echoed request ID
}
```

**Example**:

```json
{
  "jsonrpc": "2.0",
  "result": "0x1b3e8a5c3e0c8d0000",
  "id": 1
}
```

**RPC Error (200 OK with error object)**:

```typescript
interface RpcErrorResponse {
  jsonrpc: '2.0'
  error: {
    code: number // JSON-RPC error code
    message: string // Human-readable error
    data?: any // Optional additional error data
  }
  id: number | string
}
```

**Example**:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Invalid params: invalid address"
  },
  "id": 1
}
```

**Proxy Error (500 Internal Server Error)**:

```typescript
interface ProxyError {
  error: string // Error message
  chainId?: number // Chain ID if provided in request
}
```

**Example**:

```json
{
  "error": "Missing RPC URL for chain ID 1. Check NEXT_PUBLIC_ALCHEMY_ETH_URL environment variable."
}
```

**Validation Error (400 Bad Request)**:

```typescript
interface ValidationError {
  error: string // Validation error message
}
```

**Example**:

```json
{
  "error": "Invalid request: chainId is required"
}
```

---

## Implementation Requirements

### Request Validation

1. **Required fields**: `jsonrpc`, `method`, `params`, `id`, `chainId`
2. **Chain ID validation**: Must be one of `[1, 42161, 10, 137]`
3. **Method validation** (optional MVP): Allowlist common methods (security hardening)

### RPC URL Resolution

```typescript
const RPC_URLS: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_ALCHEMY_ETH_URL!,
  42161: process.env.NEXT_PUBLIC_ALCHEMY_ARB_URL!,
  10: process.env.NEXT_PUBLIC_ALCHEMY_OPT_URL!,
  137: process.env.NEXT_PUBLIC_ALCHEMY_POLY_URL!,
}

const rpcUrl = RPC_URLS[chainId]
if (!rpcUrl) {
  return new Response(JSON.stringify({ error: `Unsupported chain ID: ${chainId}` }), {
    status: 400,
  })
}
```

### Error Handling

- **Missing env var**: Return 500 with clear error message
- **Invalid chain ID**: Return 400 with supported chains list
- **Upstream RPC error**: Pass through JSON-RPC error (preserve error code/message)
- **Network timeout**: Return 504 Gateway Timeout (future: automatic Infura fallback)

### Privacy & Security

- **NO logging** of request/response bodies (Constitutional Principle II: Privacy-First)
- **NO tracking** of user IPs or request patterns
- **NO caching** of responses at proxy level (handled by client-side TanStack Query)
- Environment variables must NEVER be exposed in error messages

### Future Enhancements (Not MVP)

- **Infura fallback**: Retry with Infura URL on Alchemy failure
- **Rate limiting**: Per-IP request limits (100 req/min)
- **Method allowlist**: Block dangerous methods (e.g., `eth_sendRawTransaction` - not needed for read-only app)
- **Request batching**: Support JSON-RPC batch requests
- **Metrics**: Anonymous usage metrics (requests/sec, error rate) WITHOUT request details

---

## Usage Examples

### Client-Side Integration (React Hook)

```typescript
// src/shared/lib/useRpcRequest.ts
import { useMutation } from '@tanstack/react-query'

interface RpcRequest {
  method: string
  params: any[]
  chainId: number
}

export function useRpcRequest() {
  return useMutation({
    mutationFn: async ({ method, params, chainId }: RpcRequest) => {
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: Date.now(),
          chainId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'RPC request failed')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error.message)
      }

      return data.result
    },
  })
}

// Usage in component
function BalanceDisplay({ address, chainId }: Props) {
  const { mutate: fetchBalance, data, error } = useRpcRequest()

  useEffect(() => {
    fetchBalance({ method: 'eth_getBalance', params: [address, 'latest'], chainId })
  }, [address, chainId])

  // ...
}
```

### Direct Fetch (Non-React)

```typescript
async function getBlockNumber(chainId: number): Promise<number> {
  const response = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
      chainId,
    }),
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)

  return parseInt(data.result, 16) // Convert hex to decimal
}
```

---

## Testing Requirements

### Unit Tests

- [x] Valid request returns 200 with result
- [x] Missing chainId returns 400
- [x] Unsupported chainId returns 400
- [x] Missing RPC URL (env var) returns 500
- [x] Upstream RPC error passes through error object
- [x] Request ID is echoed in response

### Integration Tests

- [x] End-to-end request to Alchemy (using test API key)
- [x] Verify environment variables are injected correctly
- [x] Verify error messages don't leak API keys

### Edge Cases

- [x] Empty params array
- [x] Non-numeric request ID (string)
- [x] Malformed JSON body
- [x] Very large response (>1MB)

---

## OpenAPI Specification (Optional)

```yaml
openapi: 3.1.0
info:
  title: VoidPay RPC Proxy API
  version: 1.0.0
  description: Secure proxy for blockchain RPC requests

paths:
  /api/rpc:
    post:
      summary: Forward JSON-RPC request to blockchain provider
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [jsonrpc, method, params, id, chainId]
              properties:
                jsonrpc:
                  type: string
                  enum: ['2.0']
                method:
                  type: string
                  example: eth_getBalance
                params:
                  type: array
                  items: {}
                id:
                  oneOf:
                    - type: number
                    - type: string
                chainId:
                  type: number
                  enum: [1, 42161, 10, 137]
      responses:
        '200':
          description: Successful RPC response
          content:
            application/json:
              schema:
                oneOf:
                  - type: object
                    properties:
                      jsonrpc:
                        type: string
                      result: {}
                      id:
                        oneOf:
                          - type: number
                          - type: string
                  - type: object
                    properties:
                      jsonrpc:
                        type: string
                      error:
                        type: object
                        properties:
                          code:
                            type: number
                          message:
                            type: string
                      id:
                        oneOf:
                          - type: number
                          - type: string
        '400':
          description: Invalid request
        '500':
          description: Proxy error
```

---

## Constitutional Compliance

### Principle I: Zero-Backend Architecture ✅

- Edge Function is stateless (no database, no sessions)
- No server-side caching of responses

### Principle II: Privacy-First ✅

- No logging of request/response bodies
- No tracking of user behavior
- No telemetry/analytics

### Principle VI: RPC Key Protection ✅

- API keys stored in environment variables (never in client code)
- Keys injected server-side only
- Error messages don't leak keys

---

## Notes

**Why not use Wagmi's built-in transports directly?**

- Wagmi transports DO use direct RPC URLs (configured in `src/shared/config/wagmi.ts`)
- This `/api/rpc` endpoint is for **future custom RPC calls** that Wagmi doesn't support (e.g., Alchemy Transfers API, custom contract calls)
- MVP may not use this endpoint heavily, but it's foundational for future features

**Why `NEXT_PUBLIC_` prefix if keys should be secret?**

- Good catch! For Wagmi config (runs in browser), we need `NEXT_PUBLIC_` prefix
- For RPC proxy (server-side), we should use **non-public** env vars (e.g., `ALCHEMY_ETH_URL`)
- Revised approach:
  - Wagmi config: Uses `NEXT_PUBLIC_ALCHEMY_*_URL` (necessary evil - Wagmi runs in browser)
  - RPC proxy: Uses `ALCHEMY_*_URL` (server-only, more secure)
  - This provides defense-in-depth even if one approach is compromised

**Future: Remove `NEXT_PUBLIC_` prefix entirely**

- Use RPC proxy for ALL requests (including Wagmi)
- Requires custom Wagmi transport that calls `/api/rpc` instead of direct URLs
- Deferred to post-MVP (more complex, but better security)
