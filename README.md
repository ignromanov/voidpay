# VoidPay

![CI](https://github.com/ignromanov/voidpay/actions/workflows/test.yml/badge.svg?branch=develop)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fvoidpay.xyz)

Privacy-first crypto invoicing. All data lives in the URL. [Try it →](https://voidpay.xyz)

> Built on [@void-layer](https://github.com/void-layer) — the open invoice codec standard.

---

## Demo

A crypto invoice, created and paid — start to finish.

https://github.com/user-attachments/assets/dcfe5db8-5600-48ab-beaa-24dcfea8747e

[Watch the demo →](https://voidpay.xyz)

---

## How It Works

The URL is the invoice. No backend, no database, no account.

```
https://voidpay.xyz/pay#N4IgbghgTg9g...
                       └─ Brotli-compressed invoice (hash fragment — never sent to server)

https://voidpay.xyz/pay?og=INV-001_1250_USDC_arb_Acme#N4Ig...
                       │                               │
                       └─ OG preview metadata (opt-in) └─ Full invoice (stays in browser)
```

**Three steps:**

1. **[Create](https://voidpay.xyz/create)** — fill the invoice form, generate a self-contained URL
2. **Share** — send the link via any channel (Telegram, email, Discord)
3. **Pay** — payer connects wallet, pays P2P directly on-chain

Zero server involvement. We can't lose your data if we don't have it.

---

## Features

- **5 networks**: Ethereum, Base, Arbitrum, Optimism, Polygon PoS
- **Any token**: native ETH/MATIC or any ERC-20 (Uniswap Token List verification for blue chips)
- **Magic Dust**: micro-amount added to total for deterministic payment matching
- **Payment verification**: waits for `finalized` status — reorg-resistant
- **Client-side PDF export**: generated in-browser, never uploaded
- **LocalStorage history**: created and received invoices, export/import as JSON
- **No signup, no KYC, no cookies**: cookie-free analytics only — never amounts, wallets, or personal data; no Clarity, no Sentry, no session replay
- **Perpetual links**: schema v1 is locked — links created today work forever

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Radix UI, CVA, Framer Motion |
| Web3 | Wagmi v2, Viem, RainbowKit |
| State | Zustand, TanStack Query |
| Architecture | Feature-Sliced Design (FSD) |
| Tests | Vitest — 2,800+ tests, 81%+ coverage |

---

## Quick Start

**Prerequisites**: Node.js v22+, pnpm v10+

```bash
git clone https://github.com/ignromanov/voidpay.git
cd voidpay
pnpm install
cp .env.example .env.local   # add RPC keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm type-check` | Full TypeScript check (~24s) |
| `pnpm type-check:build` | Fast incremental check (~1.5s) |
| `pnpm test` | Tests in watch mode |
| `pnpm test:coverage` | Tests with coverage report |
| `pnpm validate` | type-check + lint + tests |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](./LICENSE).
