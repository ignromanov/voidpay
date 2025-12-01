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

| Slice                          | Public API                                                                                       | Status      | SpecKit |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ----------- | ------- |
| `shared/ui/primitives/dialog`  | `Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose` | Implemented | P0.7.5  |
| `shared/ui/primitives/select`  | `Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel`        | Implemented | P0.7.5  |
| `shared/ui/primitives/popover` | `Popover, PopoverTrigger, PopoverContent, PopoverAnchor`                                         | Implemented | P0.7.5  |
| `shared/ui/motion`             | `FadeIn, SlideIn, ScaleIn, AnimatePresence`                                                      | Implemented | P0.7.5  |
| `shared/ui/input`              | `Input`                                                                                          | Implemented | P0.8.0  |
| `shared/ui/textarea`           | `Textarea`                                                                                       | Implemented | P0.8.0  |
| `shared/ui/badge`              | `Badge, badgeVariants`                                                                           | Implemented | P0.8.0  |
| `shared/ui/typography`         | `Heading, Text`                                                                                  | Implemented | P0.8.0  |
| `shared/ui/card`               | `Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription`                          | Implemented | P0.8.0  |
| `shared/ui/button`             | `Button, buttonVariants`                                                                         | Implemented | P0.6.5  |

### shared/lib

| Slice                     | Public API             | Status      | SpecKit |
| ------------------------- | ---------------------- | ----------- | ------- |
| `shared/lib/utils`        | `cn`                   | Implemented | P0.6    |
| `shared/lib/compression`  | `compress, decompress` | Implemented | P0.2    |
| `shared/lib/binary-codec` | `encode, decode`       | Draft       | P1.42   |

### shared/config

| Slice                    | Public API                             | Status      | SpecKit |
| ------------------------ | -------------------------------------- | ----------- | ------- |
| `shared/config/wagmi`    | `config, chains`                       | Implemented | P0.5    |
| `shared/config/networks` | `SUPPORTED_NETWORKS, getNetworkConfig` | Implemented | P0.6    |

---

## Entities Layer

| Slice              | Public API                                                                        | Status      | SpecKit    | Dependencies  |
| ------------------ | --------------------------------------------------------------------------------- | ----------- | ---------- | ------------- |
| `entities/network` | `NetworkConfig, networkThemes, SUPPORTED_CHAINS`                                  | Implemented | P0.6       | shared/config |
| `entities/token`   | `TokenInfo, getTokenList, isBlueChip`                                             | Implemented | P0.6       | shared/config |
| `entities/invoice` | `InvoiceSchemaV1, useCreatorStore, usePayerStore, parseInvoice, serializeInvoice` | Implemented | P0.2, P0.3 | shared/lib    |

---

## Features Layer

| Slice                       | Public API                                      | Status      | SpecKit | Dependencies                    |
| --------------------------- | ----------------------------------------------- | ----------- | ------- | ------------------------------- |
| `features/invoice-codec`    | `encodeInvoice, decodeInvoice, validateInvoice` | Implemented | P0.2    | entities/invoice, shared/lib    |
| `features/wallet-connect`   | `ConnectButton, useWalletStatus`                | Implemented | P0.5    | entities/network, shared/config |
| `features/network-switch`   | `NetworkSwitcher, useSwitchNetwork`             | Draft       | P0.5    | entities/network                |
| `features/address-input`    | `AddressInput`                                  | Implemented | P0.8.1  | entities/network, shared/ui     |
| `features/network-select`   | `NetworkSelect`                                 | Implemented | P0.8.1  | entities/network, shared/ui     |
| `features/token-select`     | `TokenSelect`                                   | Implemented | P0.8.1  | entities/token, shared/ui       |
| `features/invoice-item-row` | `InvoiceItemRow`                                | Implemented | P0.8.1  | shared/ui                       |

---

## Widgets Layer

| Slice                        | Public API                 | Status      | SpecKit | Dependencies                              |
| ---------------------------- | -------------------------- | ----------- | ------- | ----------------------------------------- |
| `widgets/app-shell`          | `AppShell, Header, Footer` | Implemented | P0.6.6  | features/wallet-connect, shared/ui        |
| `widgets/ambient-background` | `AmbientBackground`        | Implemented | P0.6.6  | entities/network                          |
| `widgets/invoice-paper`      | `InvoicePaper`             | Draft       | P0.8.3  | entities/invoice, shared/ui               |
| `widgets/invoice-editor`     | `InvoiceEditor`            | Pending     | P0.8.3  | features/\*, entities/invoice             |
| `widgets/payment-terminal`   | `PaymentTerminal`          | Pending     | P0.12   | features/wallet-connect, entities/invoice |

---

## Pages Layer (app/)

| Route     | Composition | Status  | SpecKit | Dependencies                                    |
| --------- | ----------- | ------- | ------- | ----------------------------------------------- |
| `/`       | LandingPage | Pending | P0.7    | widgets/app-shell                               |
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
