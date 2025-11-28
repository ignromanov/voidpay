# Contracts

**Feature**: 008-wagmi-rainbowkit-setup

This feature does not introduce new API contracts.

## Existing Integration

The feature uses the existing `/api/rpc` endpoint (P0.4):

```
POST /api/rpc?chainId={id}
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_blockNumber",
  "params": []
}
```

No modifications required to the RPC proxy.
