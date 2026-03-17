# P0.12 Payment Verification & Status Polling — Design

> Approved: 2026-03-06
> Brief: `specs/022-payment-verification/feature-brief.md`

---

## Decisions

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Alchemy lock-in | Alchemy-only for MVP | `getAssetTransfers` is the only viable way to discover native token transfers by `toAddress`. Fallback to `eth_getLogs` for ERC-20 in P1 |
| 2 | Confirmation strategy | Hybrid: manual block count (soft) + viem `finalized` tag (hard) | Soft gives progress bar UX. Hard via `finalized` tag is always correct. Hard polling is silent — user only sees errors (reorg toast) |
| 3 | Discovery scope | Full (all scenarios A/B/C) | Without discovery, creators never learn about QR/external payments. Core value proposition |
| 4 | Magic Dust display | Adaptive: <=8 decimals show fraction, >8 show atomic + tooltip | USDC `+0.000042` is readable. ETH `+42` with info tooltip avoids 18 zeros |
| 5 | Amount mismatch | Exact match only + manual txHash input | Exact match is Magic Dust's foundation. Manual txHash is escape hatch for fee-on-transfer tokens |
| 6 | Tab visibility | Pause on hidden, catch-up on return, stop if maxDuration exceeded | Saves CU budget. Prevents stale polling after long tab abandonment |

---

## Architecture

### New Modules

```
app/api/transfers/route.ts           -- Alchemy getAssetTransfers proxy
                                        Rate limit: 10 req/min per IP
                                        Method lock: alchemy_getAssetTransfers only
                                        Response stripping: hash, value, rawContract, metadata only
                                        Cooldown: 10s per IP+toAddress
                                        No Infura fallback (Alchemy-proprietary method)

features/payment/
  lib/
    verify-receipt.ts                -- Receipt verification (native + ERC-20 amount matching)
                                        Native: transaction.value === exactTotal
                                        ERC-20: decode Transfer event from receipt.logs
                                        Uses rawContract.value (hex BigInt), NOT value (lossy float)
    match-transfer.ts                -- Exact matching for Alchemy getAssetTransfers responses
                                        Match: rawContract.value === exactTotal (BigInt comparison)
                                        No tolerance, no fuzzy matching
    confirmation-config.ts           -- Per-chain soft confirmation block counts
                                        Ethereum: 3 blocks (~36s)
                                        Arbitrum: 1 block (~instant)
                                        Optimism: 1 block (~instant)
                                        Polygon: 5 blocks (~10s)

  model/
    use-payment-verification.ts      -- Orchestration hook
                                        Input: txHash, invoice, chainId
                                        Flow: verify receipt -> soft confirm (block count) -> setValidated
                                        Triggers useFinalizationTracker on soft confirm
    use-payment-polling.ts           -- TanStack Query polling for discovery (scenarios B/C)
                                        Modes: single-shot, aggressive (10-15s/5min), watch (60->120->300s/30min)
                                        Tab-aware: pause on hidden, catch-up on return
                                        Stop conditions: maxDuration exceeded, payment found, overdue
    use-finalization-tracker.ts      -- Silent background hard confirm
                                        Uses viem waitForTransactionReceipt with status: 'finalized'
                                        On success: set finalized=true (silent, no UI change)
                                        On reorg: toast alert, revert txHashValidated to false
```

### Modified Modules

```
shared/lib/amount-utils/index.ts     -- Fix formatAmount: string-based formatting, no parseFloat
                                        Prerequisite for Magic Dust with 18-decimal tokens

shared/ui/magic-dust-badge/          -- Adaptive display
                                        <=8 decimals: "+0.000042" (full fraction)
                                        >8 decimals: "+42" with info icon + tooltip (full value)

entities/invoice/model/rich-invoice-store.ts
                                     -- Add finalized?: boolean to TrackedInvoice

entities/network/config/chains.ts    -- Add softConfirmations per chain

widgets/payment-panel/ui/
  PaymentPanel.tsx                   -- Polling status indicator, "I've paid" button, txHash input
  PaidConfirmation.tsx               -- Finalized badge (silent, shown only after hard confirm)

app/(app)/pay/
  PayWorkspace.tsx                   -- "I've paid" button, polling status, txHash input field
  use-pay-invoice.ts                 -- Integrate polling for QR/creator scenarios
```

---

## Data Flow

### Scenario A: SmartPayButton (known txHash)

```
SmartPayButton -> txHash -> usePaymentVerification
  -> verify receipt (exact amount match)
  -> soft confirm (count N blocks via polling)
  -> setValidated(id, true) -> UI: "Paid"
  -> background: useFinalizationTracker
     -> viem finalized tag (silent)
     -> set finalized=true (no UI change unless reorg)
```

### Scenario B: QR / External Payment (discovery)

```
"I've paid" click -> usePaymentPolling (aggressive: 10-15s, 5 min max)
  -> /api/transfers -> match-transfer (exactTotal BigInt match)
  -> txHash found -> usePaymentVerification -> same as Scenario A

On timeout (5 min) -> revert to manual "Check payment" button

Page open/reopen -> auto-check (single shot via /api/transfers)
  -> match found -> verification flow
  -> not found -> show "Check payment" + "I've paid" buttons
```

### Scenario C: Creator Discovery

```
History page load -> batch check all pending source:'created' invoices
  -> throttled, sequential /api/transfers calls
  -> matches found -> verification flow per invoice

Per-invoice buttons:
  "Check payment" -> single shot, 30s cooldown
  "Watch for payment" -> adaptive polling (60s->120s->300s, 30 min max)
```

### Escape Hatch: Manual txHash

```
User pastes txHash -> verify toAddress matches -> verify receipt
  -> amount match -> accept as paid (normal verification flow)
  -> amount mismatch -> show error with amounts, do NOT mark as paid
```

---

## Polling Strategy

| Trigger | Where | Interval | Duration | CU/event |
|---------|-------|----------|----------|----------|
| On-open auto-check | /pay + history | Single shot | Once | 120 |
| "Check payment" (manual) | /pay + history | On click, 30s cooldown | Once | 120 |
| "I've paid" (payer) | /pay only | 10-15s | 5 min max | ~2,400-3,600 |
| "Watch for payment" (creator) | /pay + history | 60s->120s->300s | 30 min max | ~2,400 |

### Tab Visibility Rules

- Pause all polling when `document.visibilityState === 'hidden'`
- On return: instant catch-up fetch
- If elapsed time > maxDuration: stop polling, show manual "Check payment"
- Wall-clock time counts (not just active polling time)

### CU Budget (Free tier: 30M CU/month)

Worst case for 100 invoices/month: ~648,000 CU (~2.2% of free tier).

---

## Status Model

Status enum unchanged: `pending | confirming | paid | overdue`

New field: `TrackedInvoice.finalized?: boolean`

| State | Condition | UI |
|-------|-----------|-----|
| pending | No txHash, not overdue | Default |
| confirming | txHash present, not validated | Progress bar (soft confirm blocks) |
| paid | txHash validated | Green checkmark: "Paid" |
| paid + finalized | txHash validated + finalized=true | "Paid" (no visible difference unless reorg) |
| overdue | No txHash, due date passed | Expired state |

Reorg handling (extremely rare): toast alert + revert txHashValidated to false -> back to confirming.

---

## API Route: /api/transfers

### Request

```typescript
interface TransfersRequest {
  chainId: number         // Must be supported chain
  toAddress: string       // Must be valid ETH address
  contractAddress?: string // Must be valid ETH address if present (ERC-20)
  fromBlock: string       // Hex block number
  category: 'external' | 'erc20'
}
```

### Protections

| Protection | Implementation |
|------------|----------------|
| Server-side only | API keys never in client bundle |
| Origin validation | Same isAllowedOrigin as /api/rpc |
| Rate limiting | 10 req/min per IP (stricter than RPC's 100) |
| Method lock | Only alchemy_getAssetTransfers |
| Parameter validation | Address format, category enum, maxCount cap (20) |
| Response stripping | Only hash, value, rawContract, category, metadata.blockTimestamp |
| Cooldown enforcement | 10s per IP+toAddress pair |

### Response (stripped)

```typescript
interface StrippedTransfer {
  hash: string
  value: number           // Lossy — DO NOT use for matching
  rawContract: {
    value: string         // Hex BigInt — USE THIS for matching
    address: string | null
    decimal: string
  }
  category: 'external' | 'erc20'
  blockTimestamp: string
}
```

---

## Constraints

- URL remains source of truth for invoice data
- No transaction data stored server-side
- txHash stored only in user's localStorage
- All verification is client-side (reading blockchain via stateless proxy)
- Exact amount matching only (no tolerance)
- `rawContract.value` (hex BigInt) for precision matching, never `value` (float)
