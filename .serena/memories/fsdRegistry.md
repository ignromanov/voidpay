# FSD Registry

**Last Updated**: 2025-12-01
**Purpose**: Source of truth for all FSD slices
**Pattern**: Feature-Sliced Design

## Layer Rules (STRICT)

```
app/ ──────────► Can import: widgets, features, entities, shared
widgets/ ──────► Can import: features, entities, shared
features/ ─────► Can import: entities, shared
entities/ ─────► Can import: shared
shared/ ───────► Can import: nothing (leaf layer)
```

**VIOLATIONS PROHIBITED**:

- ❌ Features importing Features
- ❌ Entities importing Features/Widgets
- ❌ Circular dependencies
- ❌ Importing from inside slice (use Public API)

---

## Shared Layer

### shared/ui

| Slice                     | Public API                                                                                       | Status      | SpecKit |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ----------- | ------- |
| `shared/ui/dialog`        | `Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose` | Implemented | P0.7.5  |
| `shared/ui/select`        | `Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel`        | Implemented | P0.7.5  |
| `shared/ui/popover`       | `Popover, PopoverTrigger, PopoverContent, PopoverAnchor`                                         | Implemented | P0.7.5  |
| `shared/ui/motion`        | `motion, AnimatePresence, useAnimationControls, useScroll, useTransform`                         | Implemented | P0.7.5  |
| `shared/ui/input`         | `Input`                                                                                          | Implemented | P0.8.0  |
| `shared/ui/textarea`      | `Textarea`                                                                                       | Implemented | P0.8.0  |
| `shared/ui/badge`         | `Badge, badgeVariants`                                                                           | Implemented | P0.8.0  |
| `shared/ui/typography`    | `Heading, Text`                                                                                  | Implemented | P0.8.0  |
| `shared/ui/card`          | `Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription`                          | Implemented | P0.8.0  |
| `shared/ui/button`        | `Button, buttonVariants`                                                                         | Implemented | P0.6.5  |
| `shared/ui/address-input` | `AddressInput`                                                                                   | Implemented | P0.8.1  |

### shared/lib

| Slice                    | Public API                                 | Status      | SpecKit |
| ------------------------ | ------------------------------------------ | ----------- | ------- |
| `shared/lib/utils`       | `cn, generateBlockieHash, getBlockieColor` | Implemented | P0.6    |
| `shared/lib/compression` | `compress, decompress`                     | Implemented | P0.2    |

### shared/config

| Slice                 | Public API                              | Status      | SpecKit |
| --------------------- | --------------------------------------- | ----------- | ------- |
| `shared/config/wagmi` | Re-exports from features/wallet-connect | Implemented | P0.5    |

---

## Entities Layer

| Slice              | Public API                                                                      | Status      | SpecKit | Dependencies  |
| ------------------ | ------------------------------------------------------------------------------- | ----------- | ------- | ------------- |
| `entities/creator` | `useCreatorStore, CreatorStoreV1, InvoiceIDCounter, UserPreferences`            | Implemented | P0.3    | shared/lib    |
| `entities/user`    | `usePayerStore`                                                                 | Implemented | P0.3    | shared/lib    |
| `entities/network` | `NETWORKS` (no public index.ts)                                                 | Partial     | P0.6    | shared/config |
| `entities/invoice` | `LineItem, InvoiceDraft, InvoiceTemplate, CreationHistoryEntry, PaymentReceipt` | Implemented | P0.2    | shared/lib    |

---

## Features Layer

| Slice                      | Public API                                                                                                                    | Status      | SpecKit | Dependencies                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- | ------- | ------------------------------- |
| `features/invoice-codec`   | `encodeInvoice, decodeInvoice, generateInvoiceUrl, InvoiceSchemaV1`                                                           | Implemented | P0.2    | entities/invoice, shared/lib    |
| `features/wallet-connect`  | `ConnectWalletButton, DefaultConnectButton, truncateAddress, wagmiConfig, chains, voidPayTheme, NetworkSelect, TestnetBanner` | Implemented | P0.5    | entities/network, shared/config |
| `features/invoice`         | `TokenSelect, InvoiceItemRow, NETWORK_TOKENS`                                                                                 | Implemented | P0.8.1  | entities/invoice, shared/ui     |
| `features/invoice-draft`   | `TemplateList, NewInvoiceDialog`                                                                                              | Implemented | P0.8.1  | entities/creator, shared/ui     |
| `features/invoice-history` | `HistoryList`                                                                                                                 | Implemented | P0.8.1  | entities/creator, shared/ui     |
| `features/rpc-proxy`       | `proxyRequest, loadRpcConfig, checkRateLimit`                                                                                 | Implemented | P0.4    | shared/lib                      |
| `features/data-export`     | `exportUserData, downloadUserData, importUserData`                                                                            | Implemented | P0.3    | entities/creator, entities/user |

---

## Widgets Layer

| Slice                        | Public API                   | Status      | SpecKit | Dependencies                              |
| ---------------------------- | ---------------------------- | ----------- | ------- | ----------------------------------------- |
| `widgets/navigation`         | `Navigation` (no public API) | Draft       | P0.6.6  | features/wallet-connect, shared/ui        |
| `widgets/network-background` | `NetworkBackground`          | Implemented | P0.8.2  | shared/ui (motion, brand-tokens)          |
| `widgets/invoice-paper`      | -                            | Pending     | P0.8.3  | entities/invoice, shared/ui               |
| `widgets/invoice-editor`     | -                            | Pending     | P0.8.3  | features/\*, entities/invoice             |
| `widgets/payment-terminal`   | -                            | Pending     | P0.12   | features/wallet-connect, entities/invoice |

---

## Pages Layer (app/)

| Route     | Composition | Status  | SpecKit | Dependencies                                    |
| --------- | ----------- | ------- | ------- | ----------------------------------------------- |
| `/`       | LandingPage | Pending | P0.7    | widgets/navigation                              |
| `/create` | EditorPage  | Pending | P0.8.3  | widgets/invoice-editor, widgets/invoice-paper   |
| `/pay`    | PaymentPage | Pending | P0.8.3  | widgets/invoice-paper, widgets/payment-terminal |

---

## Adding New Slices

When creating a new slice:

1. **Check Registry** — Avoid duplication
2. **Verify Layer Rules** — No upward imports
3. **Create Public API** — Every slice needs `index.ts`
4. **Update Registry** — Add entry with all fields
5. **Link SpecKit** — Reference spec ID
