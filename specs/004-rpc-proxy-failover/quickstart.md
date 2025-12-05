# Quickstart: RPC Proxy

## Overview

The RPC Proxy (`/api/rpc`) provides a secure, privacy-preserving gateway to blockchain networks. It handles failover between Alchemy and Infura, enforces rate limits, and offers a mock mode for development.

## Usage

### Production

Send standard JSON-RPC requests to `/api/rpc`.

```bash
curl -X POST https://voidpay.com/api/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

### Development (Mock Mode)

Enable mock mode by appending `?mock=success` (or `error`, `slow`) to the URL, or by running locally with `NODE_ENV=development`.

```bash
# Simulate Success
curl -X POST "http://localhost:3000/api/rpc?mock=success" ...

# Simulate Error
curl -X POST "http://localhost:3000/api/rpc?mock=error" ...

# Simulate Slow Network
curl -X POST "http://localhost:3000/api/rpc?mock=slow" ...
```

## Configuration

Ensure the following Environment Variables are set in `.env.local`:

```bash
# Primary Provider (Alchemy)
ALCHEMY_API_KEY=...
ALCHEMY_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/

# Fallback Provider (Infura)
INFURA_API_KEY=...
INFURA_RPC_URL=https://mainnet.infura.io/v3/

# Rate Limiting (Optional for Dev)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## Client Integration (Wagmi)

Configure Wagmi to use the proxy endpoint:

```typescript
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http('/api/rpc'), // Point to local proxy
  },
})
```
