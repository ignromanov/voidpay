# VoidPay

> **The Stateless Crypto Invoice**
> No backend, no sign-up, just links.

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-v2-purple)](https://wagmi.sh/)

**VoidPay** is a privacy-first, permissionless crypto invoicing platform. Create professional payment requests encoded entirely in URLs—no database, no registration, no intermediaries.

🔗 **[voidpay.xyz](https://voidpay.xyz)** (Coming Soon)

---

## ✨ Features

### 🔐 **Zero-Backend Architecture**
- Invoice data encoded in URLs (stateless)
- No database, no servers, no data collection
- Deploy anywhere: Vercel, IPFS, local machine
- **永久可用性** (perpetual availability)

### 🕵️ **Privacy-First**
- No analytics, no tracking, no telemetry
- History stored in browser LocalStorage only
- No accounts, no email, no personal information
- Your financial data stays yours

### ⚡ **Instant & Permissionless**
- Create invoices in seconds—no signup required
- Share via URL, QR code, or social media
- Direct peer-to-peer payments (no custody)
- Works with any Web3 wallet (MetaMask, Rainbow, Coinbase Wallet)

### 🌐 **Multi-Network Support**
- Ethereum Mainnet
- Arbitrum (low fees)
- Optimism (low fees)
- Polygon PoS (ultra-low fees)

### 🎨 **Professional & Beautiful**
- Modern dark mode UI (Electric Violet accent)
- PDF invoice generation
- QR code for easy mobile payments
- Network-themed ambient backgrounds

### 🛡️ **Safe & Reliable**
- **Magic Dust Verification**: Unique micro-amounts for exact payment matching
- **Finalized Confirmations**: Wait for blockchain finality (no reorg risk)
- **Token Validation**: Verified tokens from Uniswap Token List
- **Abuse Prevention**: Community-moderated blocklist via GitHub

---

## 🚀 Quick Start

### For Users

1. **Create an Invoice**
   - Visit [voidpay.xyz/create](https://voidpay.xyz/create)
   - Fill in recipient details, amount, and token
   - Click "Create Link" → Get shareable URL

2. **Share the Link**
   - Copy URL or QR code
   - Send via email, Telegram, Discord, Twitter

3. **Get Paid**
   - Client opens link
   - Connects wallet (MetaMask, Rainbow, etc.)
   - Clicks "Pay" → Transaction sent directly to you
   - No middlemen, no fees (except gas)

### For Developers

```bash
# Clone repository
git clone https://github.com/voidpay/voidpay.git
cd voidpay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Alchemy/Infura API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 🏗️ How It Works

### URL State Architecture

VoidPay stores all invoice data **in the URL itself** using compression:

```
https://voidpay.xyz/pay?d=N4IgbghgTg9gLhCe...
                           ↑
                    Compressed invoice JSON
```

**Flow**:
1. **Create** (`/create`) → Invoice JSON → Compress (lz-string) → URL
2. **Share** → URL sent to client
3. **Pay** (`/pay?d=...`) → Decompress URL → Display invoice → Connect wallet → Send transaction
4. **Verify** → Poll blockchain for exact amount → Wait for finalized status

**No backend database needed!** The URL **is** the database.

---

## 🧠 Philosophy

### Why "Stateless"?

> "We can't lose your data if we never had it."

Traditional invoicing platforms store your data on their servers. This creates:
- **Privacy risks** (data breaches, surveillance)
- **Censorship risks** (account bans, service shutdown)
- **Vendor lock-in** (can't migrate data easily)

VoidPay **flips this model**:
- Invoice data lives in URLs you control
- History stored in your browser (LocalStorage)
- If our domain disappears, redeploy the app anywhere

### Core Principles

1. **Zero-Backend** - No database, no persistent server state
2. **Privacy-First** - No analytics, no tracking, no telemetry
3. **Permissionless** - No signup, no KYC, no approval gates
4. **Trustless** - Direct peer-to-peer payments, no custody
5. **Backward Compatible** - Old invoice URLs work forever
6. **Community-Moderated** - Abuse prevention via transparent GitHub blocklist

See [`.specify/memory/constitution.md`](.specify/memory/constitution.md) for full governance.

---

## 🛠️ Technology Stack

### Core
- **Next.js 14+** (App Router, Edge Runtime, Server Components for OG images)
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui** (Radix UI components)

### Web3
- **Wagmi v2** + **Viem** (lightest Web3 stack)
- **RainbowKit v2** (beautiful wallet connection UI)
- **Alchemy** (primary RPC) + **Infura** (fallback)
- **Uniswap Token List** (token validation)

### State & Data
- **Zustand** (client state + LocalStorage persistence)
- **TanStack Query** (async data, RPC caching)
- **lz-string** (URL compression - LZW algorithm)

### Utilities
- **Geist Sans/Mono** (typography)
- **react-pdf** (PDF generation in browser)

---

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # Landing page (/)
│   ├── create/       # Invoice editor (/create)
│   ├── pay/          # Payment view (/pay)
│   └── api/          # Edge Functions (RPC proxy)
├── pages/            # Page compositions (FSD)
├── widgets/          # Large UI blocks (InvoiceCard, PaymentFlow)
├── features/         # User actions (CreateInvoice, ProcessPayment)
├── entities/         # Business logic (Invoice, Token, Network)
└── shared/           # Utilities, UI primitives, hooks
```

**Architecture**: [Feature-Sliced Design (FSD)](https://feature-sliced.design/)

---

## 🔐 Security & Privacy

### Privacy Guarantees

✅ **NO**:
- User accounts or authentication
- Server-side invoice storage
- Analytics or telemetry (Google Analytics, Sentry, etc.)
- Tracking pixels or cookies
- Email collection
- IP logging

✅ **YES**:
- LocalStorage only (client-side)
- Export/import functionality (data portability)
- Open-source codebase (auditable)
- Self-hostable

### Security Features

**RPC Key Protection**:
- API keys stored server-side (Vercel env vars)
- Edge Functions proxy RPC calls
- Multi-provider failover (Alchemy → Infura)

**Payment Safety**:
- **Magic Dust**: Unique micro-amounts (e.g., 1000.000042 USDC) for exact matching
- **Finalized Confirmations**: Wait 15-45 min for blockchain finality (no reorg risk)
- **Token Validation**: Verified tokens show green checkmark, unknown tokens show warning

**Abuse Prevention**:
- Community-moderated blocklist (GitHub)
- SHA-256 hashing (preserves invoice privacy)
- Transparent moderation (public Pull Requests)
- "Report Abuse" button

---

## 🌍 Supported Networks

| Network           | Chain ID | Use Case                  | Avg. Gas Cost |
|-------------------|----------|---------------------------|---------------|
| **Ethereum**      | 1        | High-value, max security  | $5-50         |
| **Arbitrum**      | 42161    | DAO payments, mid-value   | $0.10-1       |
| **Optimism**      | 10       | DAO payments, mid-value   | $0.10-1       |
| **Polygon PoS**   | 137      | Micropayments, low-value  | $0.01-0.10    |

---

## 🎨 Design

### Visual Identity

- **Accent Color**: Electric Violet (`#7C3AED`)
- **Theme**: Dark mode (Zinc-950 background)
- **Typography**: Geist Sans (UI) + Geist Mono (data)

### Network Themes

Each network has unique ambient background:
- **Ethereum**: Gray monochrome (secure, classic)
- **Arbitrum**: Deep blue gradient (futuristic)
- **Optimism**: Red glow (energetic)
- **Polygon**: Purple haze (vibrant)

---

## 📖 Documentation

- **[Constitution](.specify/memory/constitution.md)** - Project governance & principles
- **[Decisions](.specify/memory/brainstorm/DECISIONS.md)** - Tech stack choices
- **[Brainstorm Summary](.specify/memory/brainstorm/BRAINSTORM_SUMMARY.md)** - Design overview
- **[CLAUDE.md](CLAUDE.md)** - Developer guide for AI assistants

---

## 🤝 Contributing

We welcome contributions! However, please note:

1. **Read the Constitution first**: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
2. **No breaking changes**: Backward compatibility is non-negotiable
3. **Privacy-first**: No analytics, no tracking, no external services
4. **Simplicity**: YAGNI (You Aren't Gonna Need It) - reject speculative features

### Reporting Abuse

If you find a malicious invoice (phishing, scam):

1. Click "Report Abuse" on the invoice page
2. Or open a PR to [`voidpay/blocklist`](https://github.com/voidpay/blocklist)
3. Include SHA-256 hash of the URL parameter

---

## 🛣️ Roadmap

### MVP (Current)
- ✅ URL state architecture (lz-string compression)
- ✅ Invoice editor with preview
- ✅ Multi-network support (ETH, Arbitrum, Optimism, Polygon)
- ✅ RainbowKit wallet integration
- ✅ Magic Dust payment verification
- ✅ PDF generation
- ✅ Static blocklist

### Post-MVP
- 🔮 Password-protected links (AES encryption)
- 🔮 Cross-chain payments (Li.Fi integration)
- 🔮 IPFS offloading for heavy data
- 🔮 Telegram Mini App
- 🔮 Gnosis Safe integration

---

## ⚠️ Disclaimer

**VoidPay is a non-custodial interface.** We do not:
- Process payments
- Hold user funds
- Intermediate transactions
- Provide refunds or support for lost funds

**Cryptocurrency transactions are irreversible.** Always verify:
- Recipient wallet address
- Token contract address
- Network (chain ID)
- Amount before sending

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

Inspired by:
- [Excalidraw](https://excalidraw.com) - URL state architecture
- [Request Finance](https://request.finance) - Crypto invoicing (centralized)
- [Ethereum](https://ethereum.org) - Permissionless finance

Built with:
- [Next.js](https://nextjs.org) by Vercel
- [Wagmi](https://wagmi.sh) & [Viem](https://viem.sh) by Wevm
- [RainbowKit](https://rainbowkit.com) by Rainbow
- [shadcn/ui](https://ui.shadcn.com) by shadcn

---

## 🔗 Links

- **Website**: [voidpay.xyz](https://voidpay.xyz) (Coming Soon)
- **GitHub**: [github.com/voidpay/voidpay](https://github.com/voidpay/voidpay)
- **Blocklist**: [github.com/voidpay/blocklist](https://github.com/voidpay/blocklist)

---

<p align="center">
  <strong>Built with ❤️ for the crypto community</strong><br>
  <em>Privacy-first. Permissionless. Forever.</em>
</p>
