# Data Model: RPC Proxy

**Feature**: `004-rpc-proxy-failover`

## Entities

### 1. RPC Configuration (Server-Side)

Configuration for the proxy behavior, loaded from Environment Variables.

```typescript
interface RpcConfig {
  providers: {
    primary: RpcProviderConfig;
    fallback: RpcProviderConfig;
  };
  rateLimit: {
    requestsPerMinute: number; // Default: 100
    windowSeconds: number;     // Default: 60
  };
  mock: {
    enabled: boolean;          // True if NODE_ENV=development
  };
}

interface RpcProviderConfig {
  name: 'Alchemy' | 'Infura';
  url: string; // Full URL including API Key
  apiKey: string;
}
```

### 2. RPC Request (Client -> Proxy)

The standard JSON-RPC 2.0 request body sent by the client.

```typescript
interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: any[];
  id: number | string | null;
}
```

### 3. RPC Response (Proxy -> Client)

The standard JSON-RPC 2.0 response.

```typescript
interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string | null;
}
```

### 4. Mock Transaction State

Internal state for the Mock Provider.

```typescript
interface MockTransaction {
  hash: string;
  status: 'pending' | 'success' | 'reverted';
  from: string;
  to: string;
  value: string;
  timestamp: number;
}
```

## Storage Schema

### Rate Limit (Vercel KV)

Transient storage for rate limiting counters.

- **Key Format**: `rate_limit:${ip_address}`
- **Value**: `number` (Request count)
- **TTL**: 60 seconds (Sliding window)
