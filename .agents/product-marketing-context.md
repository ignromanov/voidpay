# Product Marketing Context

*Last updated: 2026-03-17*

## Product Overview

**One-liner:** Privacy-first crypto invoicing where ALL data lives in the URL. No backend. No signup. No tracking.

**What it does:** VoidPay lets anyone create professional crypto invoices in 30 seconds by encoding all invoice data into a shareable URL. The payer opens the link, connects their wallet, and pays. No intermediaries, no accounts, no data stored anywhere.

**Product category:** Crypto invoicing / Web3 payment tools

**Product type:** Free tool (open-source, stateless web app)

**Business model:** Free core forever (zero marginal cost — no backend). Future premium: recurring invoices, custom branding, batch payments. North star metric: paid invoices (not created, not viewed).

## Target Audience

**Target users:**
- Crypto freelancers & contractors receiving payments in crypto
- DAO contributors & treasurers managing contributor payments
- Web3 agencies (5-20 people) invoicing clients
- Privacy-conscious individuals needing non-custodial invoicing

**Primary use case:** "I need to receive crypto payment professionally without giving up my data or signing up for anything"

**Jobs to be done:**
1. "Send a professional-looking invoice for my crypto work instead of dropping a raw wallet address"
2. "Get paid in crypto without clipboard hijacking risk or wrong-network mistakes"
3. "Track my invoices without a third party storing my financial history"

**Use cases:**
- Freelancer invoices a DAO for bounty work (Arbitrum, USDC)
- Agency sends monthly retainer invoice to client (Ethereum, ETH)
- DAO treasurer creates payment links for multiple contributors
- Privacy-conscious user creates one-time invoice for consulting

## Personas

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| **Crypto Freelancer** | Speed, professionalism, privacy | "Drop your address in Discord" is unprofessional and dangerous | Professional invoices in 30 seconds, zero data exposure |
| **DAO Treasurer** | Simplicity, no vendor onboarding | Need to pay 20 contributors without setting up infrastructure | Share links, no accounts needed for either party |
| **Web3 Agency Owner** | Cost, no lock-in, multi-chain | Request Finance costs $99+/mo and requires KYC | Free forever, works across 4 networks, no signup |
| **Privacy Advocate** | Zero tracking, self-custody | Every invoicing tool stores your transaction history | We can't leak your data because we never have it |

## Problems & Pain Points

**Core problem:** Receiving crypto payments is either unprofessional (raw addresses), risky (clipboard hijacking, wrong network), or overkill (Request Finance KYC + subscription).

**Why alternatives fall short:**
- **Raw wallet addresses**: Unprofessional, error-prone (copy-paste mistakes cost real money — PeopleDAO lost 76.5 ETH), no payment tracking
- **Request Finance**: Requires signup + KYC + organization setup, costs 1%+ fees, stores all data centrally
- **Google Sheets/Notion templates**: No payment flow, no verification, manual tracking
- **Traditional invoicing (FreshBooks, etc.)**: No crypto support, 3-5 day settlement, 6%+ fees

**What it costs them:** Lost professionalism → lost clients. Wrong address/network → permanent fund loss. KYC → privacy loss + friction. Manual tracking → missed payments.

**Emotional tension:** "I shouldn't have to choose between looking professional and keeping my financial privacy."

## Competitive Landscape

**Direct:** Request Finance — requires signup/KYC, 1% fees, centralized data storage, $99+/mo for teams. Falls short for privacy-conscious users and one-off invoices.

**Secondary:** Smart Invoice (escrow-based, more complex), Gilded Finance (enterprise-focused, custom pricing), BTCPay Server (Bitcoin-only, self-hosting burden).

**Indirect:** Raw wallet addresses in Discord/Telegram (zero cost but zero professionalism), Google Sheets templates (no payment flow).

**Key competitive data (from research):**
- Request Finance: $1.3B all-time volume, 4,034 monthly payments, 2,300+ customers, 88-90% stablecoin
- No competitor combines: zero-backend + no-signup + multi-chain + privacy + zero-fees
- Stripe entering crypto B2B payments (2026) validates market but targets merchants, not freelancers

## Differentiation

**Key differentiators:**
- **Zero-backend architecture**: URL IS the invoice — works even if VoidPay shuts down
- **No signup required**: Create and pay invoices without any account
- **Magic Dust**: Unique micro-amount for deterministic payment matching without backend
- **Privacy by architecture**: Not a policy choice — structurally impossible to collect data
- **Zero platform fees**: Only network gas fees apply

**How we do it differently:** Instead of storing invoices in a database, we compress and encode all data into the URL hash fragment. The hash never touches our servers (browser-only). This makes privacy a structural guarantee, not a promise.

**Why that's better:** VoidPay is the only invoice tool that survives its own shutdown. Competitors can't replicate this without rebuilding from zero-backend mindset — it's a paradigm shift, not a feature.

**Why customers choose us:** Speed (30 seconds), privacy (zero data collection), cost (free forever), simplicity (no signup).

## Objections

| Objection | Response |
|-----------|----------|
| "How do you make money if it's free?" | Zero backend = zero marginal cost. Premium features (recurring invoices, branding) for power users. Core stays free forever. |
| "Is it secure without a backend?" | MORE secure. Your data never touches our servers — nothing to hack, nothing to leak. Invoice data is compressed in the URL using industry-standard algorithms. |
| "What if I lose the URL?" | Same as losing a file. Save it in your browser history (LocalStorage), export to PDF, or bookmark it. The URL IS your invoice — treat it like a document. |
| "Can I trust a tool with no company behind it?" | It's open source — verify the code. And because there's no backend, it works even if we disappear. Self-host it if you want. |

**Anti-persona:** Enterprise companies needing accounting integrations (Xero/QuickBooks), batch payroll automation, or regulatory compliance reporting. They should use Request Finance or Coinshift.

## Switching Dynamics

**Push (away from current solution):**
- "I'm tired of dropping raw addresses in Discord — it looks amateur"
- "Request Finance wants my passport just to send an invoice"
- "I lost $500 because someone copy-pasted the wrong address"
- "Why am I paying 1% to send a link?"

**Pull (toward VoidPay):**
- "30 seconds, no signup, just a link — that's how crypto should work"
- "The URL IS the invoice — that's beautiful"
- "Zero tracking, zero data collection — finally someone gets privacy"
- "Free and open source — no lock-in"

**Habit (keeps them stuck):**
- "I've always just sent addresses, it works fine"
- "My team already uses Request Finance, switching is effort"
- "I know my Google Sheet, even if it's manual"

**Anxiety (about switching):**
- "Will payers trust a link from an unknown tool?"
- "What if the URL breaks or changes?"
- "Is this actually safe for large amounts?"

## Customer Language

**How they describe the problem:**
- "Drop your address in Discord"
- "Just send me your wallet"
- "I need to look professional when billing in crypto"
- "Request Finance is overkill for a $500 invoice"
- "I don't want another account that stores my financial data"

**How they describe us:**
- "Just send a link"
- "The app with no backend"
- "Works even if they shut down"
- "Like a Google Doc link, but for invoices"

**Words to use:** invoice, link, privacy, professional, instant, free, no signup, zero tracking, open source, self-custody, permissionless

**Words to avoid:** blockchain (use "crypto"), decentralized (use "private"), Web3 (use for dev audience only), trustless (confusing), token (we don't have one), platform (we're a tool)

**Glossary:**
| Term | Meaning |
|------|---------|
| Magic Dust | Random micro-amount added to total for unique payment identification |
| Baked Decimals | Token decimals stored in URL at creation time — no RPC dependency |
| Hybrid Theme | Dark app UI + light invoice paper — "paper on desk" metaphor |
| Static Blocklist | SHA-256 hashes of abusive URLs on GitHub — privacy-preserving moderation |

## Brand Voice

**Tone:** Adaptive mix
- **Landing page / Product Hunt**: Professional pragmatic — "Professional crypto invoicing, simple and private"
- **Dev communities / HN**: Builder/hacker — "We built the impossible: an app with no backend"
- **DAO outreach / Crypto Twitter**: Cypherpunk lite — "Sovereignty, privacy, no middlemen"

**Style:** Direct, concise, confident but not arrogant. Educational when explaining architecture. Never hype-driven.

**Personality:** Trustworthy, minimalist, principled, builder-minded, privacy-obsessed

## Proof Points

**Metrics:**
- 2,021 tests passing, 69% code coverage
- 4 networks supported (Ethereum, Arbitrum, Optimism, Polygon)
- Zero data breaches possible (no data to breach)
- 30-second invoice creation time

**Customers:** Pre-launch (MVP ~94% complete)

**Testimonials:** None yet (pre-launch)

**Value themes:**
| Theme | Proof |
|-------|-------|
| Privacy by architecture | Hash fragment never sent to server — browser-only parsing |
| Works forever | Schema versioning — old URLs always parseable |
| Zero cost | No backend = zero marginal cost = free forever |
| Professional | ISO 216 (A4) invoice design, PDF export, QR codes |

## Goals

**Business goal:** Validate PMF with first 100 active creators generating paid invoices

**Conversion action:** Create first invoice → Share link → Receive payment (full loop)

**Magic Moment:** Payer pays and creator sees green checkmark of success

**PMF validation (composite):**
1. Sean Ellis test: 40%+ "very disappointed" if VoidPay disappeared
2. Repeat usage: 2+ invoices created within 30 days
3. Organic referral: User recommends without prompting

**Current metrics:** Pre-launch. North star = paid invoices.

**Phase targets (from Nexus launch plan):**
| Phase | Creators | Invoices | Paid |
|-------|----------|----------|------|
| Phase 1 (W1-2) | 10+ | 20+ | 5+ |
| Phase 2 (W3-4) | 50+ | 150+ | 30+ |
| Phase 3 (W5-8) | 200+ | 800+ | 150+ |
| Phase 4 (W9-12) | 500+ | 2000+ | 400+ |
