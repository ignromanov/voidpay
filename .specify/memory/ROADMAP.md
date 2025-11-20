# 🗺️ VoidPay Development Roadmap

> **Project**: VoidPay - Stateless Crypto Invoice Platform
> **Constitution**: v1.2.0 (MUST READ: `.specify/memory/constitution.md`)
> **Last Updated**: 2025-11-19
> **Status**: Active Development

---

## 📋 Legend

### Priority Levels

- **P0** - Critical (MVP Blocker) - Must have for launch
- **P1** - High (MVP Core) - Essential for complete MVP experience
- **P2** - Medium (Post-MVP) - Valuable enhancements
- **P3** - Low (Future) - Nice to have, research phase

### Status Icons

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Paused
- 🚫 Blocked
- 💡 Research Phase

### Constitutional Compliance

- ✅ Compliant - Follows all principles
- ⚠️ Review Required - May affect principles
- 🔒 Locked - Cannot change (schema v1, tech stack)

---

## 🎯 Phase 0: Project Foundation (Week 1)

### P0.1 - Repository Setup & Tooling

**Status**: 🟢 **Priority**: P0 **Compliance**: ✅

**Completed**:

- ✅ Next.js 16.0.3+ boilerplate
- ✅ TypeScript strict mode config
- ✅ Tailwind CSS 4.1.17+ setup
- ✅ Constitution v1.2.0 documented
- ✅ Brainstorm artifacts finalized

**Remaining**:

- 🔴 ESLint + Prettier config
- 🔴 Git hooks (Husky) for commit validation
- 🔴 .nvmrc with Node 20+

---

## 🏗️ Phase 1: Core Infrastructure (Week 1-2)

### P0.2 - URL State Codec & Schema Validation

**Status**: 🔴 **Priority**: P0 **Compliance**: 🔒 **Constitutional**: Principle IV

**Features**:

- Invoice Schema v1 TypeScript interfaces (locked structure)
- lz-string compression/decompression utilities
- URL state encode/decode with error handling
- Schema version validation (`v: 1`)
- URL length validation (max 2000 bytes)
- Reserved fields for future (`meta`, `_future`)

---

### P0.3 - Client-Side Storage (Zustand Stores)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle II

**Features**:

- `useCreatorStore` - drafts, preferences, history, invoice ID counter
- `usePayerStore` - payment receipts
- LocalStorage persistence via Zustand middleware
- Export/Import functionality (JSON)
- Data portability (user data ownership)

---

### P0.4 - RPC Proxy & Multi-Provider Failover

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle VI

**Features**:

- Next.js Edge API route `/api/rpc`
- Alchemy (primary) + Infura (fallback) configuration
- Automatic failover via Wagmi config
- Rate limiting at proxy level
- Environment variable management (Vercel)
- NO telemetry or logging of requests

---

### P0.5 - Wagmi + Viem + RainbowKit Setup

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

**Features**:

- Wagmi v2.19.4+ configuration
- Viem v2.39.3+ for contract interactions
- RainbowKit v2.2.9+ wallet connector UI
- Support for 4 networks: Ethereum (1), Arbitrum (42161), Optimism (10), Polygon (137)
- Custom theme with Electric Violet accent (#7C3AED)
- Progressive wallet connection (optional for creators, required for payers)

---

### P0.6 - Feature-Sliced Design (FSD) Structure

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Architectural Constraints

**Features**:

- Implement FSD layers: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`
- Define entity models: `invoice`, `token`, `network`
- Create shared utilities and UI primitives
- Set up routing structure: `/`, `/create`, `/pay`

---

## 💎 Phase 2: MVP Core Features (Week 2-3)

### P0.7 - Landing Page (Marketing + SEO)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

**Features**:

- Hero section with value proposition
- Feature grid (Privacy-First, Zero-Backend, Trustless)
- Trust signals (GitHub link, open source badge)
- CTA button "Start Invoicing" → `/create`
- SEO optimization (indexed, meta tags, OG tags)
- Dark mode theme (Zinc-950)
- Geist Sans typography

---

### P0.8 - Invoice Editor (Split-Screen UI)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Desktop: 50/50 split view (Form | Live Preview)
- Mobile: Tab-based UI (`[Edit]` / `[Preview]`)
- Form inputs: sender info, client info, line items, tax, discount
- Smart address input with Blockies/Jazzicon avatar
- Token selector with search (Uniswap Token List)
- Custom token support (paste address, auto-fetch decimals via RPC)
- Invoice ID auto-increment (from LocalStorage counter)
- Notes field with 280 char limit + counter
- Real-time validation + error messages
- Draft auto-save to Zustand

---

### P0.9 - Invoice Preview Component (Paper Design)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Receipt-style card design
- Text-only branding (no logo uploads)
- Pretty Print display: large rounded amounts (1,000.00 USDC)
- Exact amount display: Magic Dust shown below (1,000.000042 USDC)
- Line items table (collapsible on mobile)
- Tax and discount calculations
- Network theme indicator (subtle)
- Responsive design (mobile-first)

---

### P0.10 - Link Generation & QR Code Modal

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- "Generate Link" button with validation
- URL compression + length check (block if >2000 bytes)
- Success modal with:
  - Generated link (copy button)
  - QR code display
  - Share buttons (Twitter, Telegram)
- Save to history (LocalStorage)
- Error handling for URL overflow (suggest shortening notes)

---

### P0.11 - Payment View (/pay) - Read-Only Mode

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- URL parameter parsing and decompression
- Schema version validation
- Invoice data hydration
- Read-only mode (no wallet required)
- Display invoice details using InvoicePaper component
- Wrapped in App Shell (Header/Footer separation)
- Network-specific "Network Vibes" (Ambient animated shapes)
- "Report Abuse" footer button (in App Shell)
- Disclaimer text: "You are sending funds directly to [address]. VoidPay is not an intermediary."

---

### P0.12 - Payment Terminal Widget (Web3 Flow)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle III, VII

**Features**:

- Smart button with 6 states:
  1. **Disconnected**: "Connect Wallet"
  2. **Wrong Network**: "Switch to Arbitrum" (polite prompt)
  3. **Insufficient Funds**: Disabled with "Not enough USDC"
  4. **Ready**: "Pay 1,000.00 USDC" (Pretty Print on button)
  5. **Processing**: Spinner + Etherscan link
  6. **Success**: Confetti + "Download Receipt"
- Magic Dust integration (exact amount calculation)
- Network switching (user-initiated, not automatic)
- Transaction submission (native vs ERC20)
- Error handling with actionable messages

---

### P0.13 - Magic Dust Payment Verification

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle VII

**Features**:

- Random micro-amount generation at creation (0.000001 - 0.000999)
- Crypto-secure randomness
- Decimal precision handling (6 decimals for USDC, 18 for ETH)
- Exact amount matching (NO fuzzy tolerance)
- Display transparency: Pretty Print + Exact Amount shown
- Payment uniqueness guarantee (collision probability <0.0001%)

---

### P0.14 - Payment Status Polling (Alchemy Transfers API)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle VII

**Features**:

- Integration with Alchemy Transfers API
- Polling interval: 10 seconds
- Filter by: recipient address, token address, exact amount (with Magic Dust), timestamp >= invoice issue date
- Optional filter: sender wallet (if `c.w` provided)
- Finalized confirmation waiting:
  - Ethereum: ~15 min (2 epochs)
  - Arbitrum/Optimism: ~10-15 min
  - Polygon: ~30-45 min
- Three status phases: "Processing" → "Confirming" → "Paid ✓"
- TanStack Query for polling + caching

---

## 🎨 Phase 3: MVP Polish (Week 3-4)

### P1.1 - PDF Generation (@react-pdf/renderer)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Client-side PDF generation (no server)
- React components → PDF conversion
- Invoice template matching HTML design
- Download functionality
- Lazy loading (@react-pdf/renderer) to minimize bundle impact
- Filename: `Invoice-{invoiceID}-{clientName}.pdf`

---

### P1.2 - History Drawer (Creator)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Slide-over panel from right
- List of created invoices (from LocalStorage)
- Display: Invoice ID, Client Name, Amount, Date, Status preview
- Actions per item: Copy Link, Delete, Payed
- Search/filter by client name or ID
- Sort by date (newest first)

---

### P1.3 - Payment Receipt (Payer History)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Save payment receipt to usePayerStore on successful payment
- Receipt data: invoice details, tx hash, paid timestamp, network
- View receipts from menu (payer-side history)
- Download PDF receipt
- Transaction explorer link

---

### P1.4 - Network Theme System (Ambient Backgrounds)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Dynamic background animations per network ("Network Vibes"):
  - Ethereum: Rhombuses/Diamonds (Vertical hovering)
  - Arbitrum: Triangles (Diagonal movement)
  - Optimism: Circles/Spheres (Floating bubbles)
  - Polygon: Hexagons (Rotation)
- Technical: "Blur Wrapper" pattern (Matryoshka) for performance
- Apply on `/pay`, `/create` page based on invoice `net` field
- Subtle accent color changes on primary buttons
- Helper function: `getNetworkTheme(chainId)`
- Tailwind CSS integration

---

### P1.5 - Token Validation (Uniswap Token List)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle VII

**Features**:

- Fetch and cache Uniswap Token List
- Blue chip tokens: USDC, USDT, DAI, WETH (green checkmark ✓)
- Unknown tokens: Yellow warning icon + "Unknown Token. Verify contract address carefully"
- Token search with autocomplete
- Display: symbol, name, logo (if verified)
- Manual address entry for custom tokens (with warning)

---

### P1.6 - OG Image Generation (Dynamic Previews)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Dynamic OG image for `/pay` route using Next.js Image Generation
- Display: Invoice amount, sender name, VoidPay branding
- Network-specific theme colors
- Size: 1200x630 (Twitter/Facebook standard)
- Meta tags for social sharing
- Fallback static OG image for landing page

---

### P1.7 - Abuse Blocklist (Static GitHub)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V

**Features**:

- Fetch blocklist from: `https://raw.githubusercontent.com/voidpay/blocklist/main/blocked-hashes.json`
- Format: `{ "hashes": ["sha256_1", ...], "updated": "ISO8601" }`
- Hash generation: SHA-256 of full URL param `?d=...`
- Block UI: Red screen "This invoice has been reported for abuse"
- "Report Abuse" button generates GitHub issue with hash
- Privacy: hash URL param, not invoice contents
- Caching: 15 min cache, revalidate on page load

---

### P1.8 - SEO Optimization & noindex Meta Tags

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V

**Features**:

- Landing `/` - indexed, full SEO (title, description, keywords, OG tags)
- `/create` - noindex, nofollow (X-Robots-Tag)
- `/pay` - noindex, nofollow (prevent invoice indexing)
- Sitemap generation (landing page only)
- robots.txt configuration

---

## 🚀 Phase 4: Post-MVP Enhancements (Week 5-6)

### P2.1 - ENS Resolution & Display

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- Resolve ENS names to addresses during creation
- Display ENS name instead of address (when available)
- Reverse resolution: address → ENS name
- Avatar display from ENS records
- Fallback to Blockies if no ENS

---

### P2.2 - Multi-Language Support (i18n)

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- next-intl or react-i18next integration
- Initial languages: English (default), Russian, Spanish, Chinese
- Language selector in header
- Localized currency formatting
- RTL support for Arabic (future)
- Invoice language preference (stored in schema)

---

### P2.3 - Partial Payment Support

**Status**: 🔴 **Priority**: P2 **Compliance**: ⚠️

**Features**:

- Display "Partially Paid" status
- Progress bar showing paid/remaining amount
- Accept multiple payments to same invoice
- Update status: Pending → Partial → Paid
- Receipt includes all transaction hashes
- Warning: This changes verification logic (review Constitutional compliance)

---

### P2.4 - Recurring Invoice Templates

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- Save invoice as template (Creator feature)
- Template store in LocalStorage
- Template variables: {{CLIENT_NAME}}, {{AMOUNT}}, {{DATE}}
- Quick create from template
- Template management UI (edit, delete, duplicate)

---

### P2.5 - QR Code Payment Links (Mobile Optimization)

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- Display QR code on payment page (not just in creator modal)
- Mobile QR scanner support
- Deep linking to mobile wallets
- "Open in [Wallet]" buttons for Rainbow, MetaMask, Coinbase Wallet
- WalletConnect integration improvements

---

### P2.6 - Export/Import History (Data Portability)

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Principle II

**Features**:

- Export history to JSON file (creator + payer)
- Import history from JSON
- Merge strategy for imports (avoid duplicates)
- Data validation on import
- Export format includes metadata (version, export date)
- Privacy note: exported file contains all invoice data

---

## 🔮 Phase 5: Future Possibilities (Post-MVP v2+)

### P3.1 - AES Link Encryption (Password Protection)

**Status**: 💡 **Priority**: P3 **Compliance**: ⚠️ **Constitutional**: Future (Part 7)

**Features**:

- Encrypt invoice data with password before URL encoding
- AES-256-GCM symmetric encryption
- Password not stored anywhere (user must share separately)
- Decrypt client-side on page load (password prompt)
- Use case: Sensitive financial data, confidential deals
- Warning: Adds complexity to URL state model

---

### P3.2 - Cross-Chain Payments (Li.Fi / Jumper Integration)

**Status**: 💡 **Priority**: P3 **Compliance**: ⚠️ **Constitutional**: Future (Part 7)

**Features**:

- Widget integration (Li.Fi, Jumper, or Squid Router)
- Pay invoice on Network A using tokens from Network B
- Automatic bridging + swapping in single transaction
- Fee transparency (bridge + swap costs)
- Slippage protection
- Fallback: "Try another route" if bridge fails

---

### P3.3 - IPFS Data Offloading

**Status**: 💡 **Priority**: P3 **Compliance**: ⚠️ **Constitutional**: Future (Part 7)

**Features**:

- Upload large data (attachments, long TOS) to IPFS
- Store IPFS CID in invoice URL instead of full data
- Fetch from IPFS when loading /pay page
- Use public IPFS gateway (cloudflare-ipfs.com) or NFT.Storage
- Fallback if IPFS unreachable (show warning)
- Privacy consideration: data is public on IPFS

---

### P3.4 - Escrow Smart Contract (Secure Deals)

**Status**: 💡 **Priority**: P3 **Compliance**: 🚫 **Constitutional**: VIOLATES Principle I

**Features**:

- Optional escrow mode: funds locked in smart contract
- Release conditions: time-based or confirmation-based
- Refund mechanism if conditions not met
- UI toggle: "Use Escrow" (extra fee for gas)
- WARNING: Requires smart contract deployment (violates zero-backend)

---

### P3.5 - Telegram Mini App

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

**Features**:

- Native Telegram Mini App version
- Create invoice directly in chat
- Send payment link as message
- Telegram Wallet integration (TON)
- Push notifications for payment status
- Same URL state model (cross-compatible)

---

### P3.6 - Gnosis Safe App Integration

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

**Features**:

- Gnosis Safe App plugin
- Pay invoices from multisig treasury
- Proposal creation for invoice payment
- Signer approval workflow visualization
- DAO invoice management dashboard

---

### P3.7 - Accounting Export (CSV/Koinly/CoinTracking)

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

**Features**:

- Export payment history to CSV
- Format compatibility: Koinly, CoinTracking, TaxBit
- Include: date, amount, token, network, tx hash, counterparty
- Tax category suggestions (income, expense)
- Multi-network consolidated export

---

## 🛠️ Technical Debt & Infrastructure

### Monitoring & Observability (Privacy-First)

**Status**: 🔴 **Priority**: P2 **Compliance**: ⚠️ **Constitutional**: Principle II

**Features**:

- **NO** Google Analytics, Sentry, or third-party analytics (violates Principle II)
- Client-side error logging to browser console only
- Debug mode via URL param `?debug=1`
- Performance monitoring using Web Vitals (local only)
- Optional: self-hosted analytics (Plausible, Umami) with explicit user consent

---

### Testing Infrastructure

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Development Philosophy

**Features**:

- **REQUIRED** per Constitution:
  - Schema versioning tests (old URLs must work)
  - Payment verification logic unit tests
  - URL compression/decompression round-trip tests
  - Multi-network integration tests
- Framework: Vitest + Testing Library
- E2E: Playwright for critical flows
- Test coverage: >80% for entities, features

---

### Performance Optimization

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- Code splitting by route (landing, create, pay)
- Lazy load @react-pdf/renderer
- Aggressive RPC response caching (TanStack Query `staleTime: Infinity` for static data like decimals)
- Image optimization (Next.js Image component)
- Font optimization (Geist preload)
- Bundle size monitoring (max 200kb initial load)

---

### Security Audit

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V, VII

**Features**:

- Code review for OWASP Top 10 vulnerabilities
- No SQL injection (N/A - no database)
- No XSS (sanitize user inputs in notes field)
- No command injection
- CSRF protection (Next.js built-in)
- Rate limiting on RPC proxy
- Content Security Policy (CSP) headers
- Dependency vulnerability scanning (npm audit)

---

## 📊 Success Metrics & Analytics (Privacy-Preserving)

### On-Chain Metrics (Public Data Only)

**Status**: 🔴 **Priority**: P3 **Compliance**: ✅

**Features**:

- Track invoices created (via URL hash in blocklist check - no PII)
- Monitor unique payment addresses (on-chain public data)
- Network distribution (Ethereum vs Arbitrum vs others)
- Token popularity (USDC, ETH, DAI usage)
- NO tracking of individual users, amounts, or invoice contents

---

## 🎓 Documentation & Community

### Developer Documentation

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Principle VIII

**Features**:

- README.md with quickstart
- CONTRIBUTING.md with dev setup
- ARCHITECTURE.md (FSD structure, data flow)
- API.md (RPC proxy, schema specification)
- Keep docs concise per Principle VIII (<400 lines per file)
- Use examples over lengthy explanations

---

### User Guide & FAQ

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- "How to create an invoice" guide
- "How to pay an invoice" guide
- FAQ: What is stateless? Is it safe? Where is data stored?
- Troubleshooting: Wrong network, insufficient funds, failed tx
- Video tutorial (optional, hosted on YouTube)

---

## 🚦 Release Checklist (Pre-Launch)

### MVP Launch Criteria

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

**Must Complete Before Launch**:

- [ ] All P0 features implemented and tested
- [ ] Security audit completed (no critical vulnerabilities)
- [ ] Performance benchmarks met (Lighthouse score >90)
- [ ] Mobile responsive design verified on iOS Safari + Android Chrome
- [ ] Multi-network testing on testnets (Sepolia, Arbitrum Goerli, etc.)
- [ ] Abuse blocklist system operational
- [ ] Legal disclaimer reviewed
- [ ] Domain configured (voidpay.xyz)
- [ ] Vercel deployment with env vars configured
- [ ] Constitution compliance verified for all features
- [ ] Analytics/telemetry confirmed disabled
- [ ] Open source license added (MIT or Apache 2.0)
- [ ] GitHub repository public

---

## 📅 Timeline Estimation

**Week 1-2**: Phase 0-1 (Foundation + Core Infrastructure)
**Week 2-3**: Phase 2 (MVP Core Features)
**Week 3-4**: Phase 3 (MVP Polish)
**Week 5-6**: Phase 4 (Post-MVP Enhancements) + Launch Prep
**Week 7+**: Phase 5 (Future Features) + Community Feedback

**Total MVP**: ~4-6 weeks for solo developer
**Total MVP + Polish**: ~6-8 weeks

---

## 🔄 Maintenance & Iteration

### Post-Launch Monitoring

- Monitor GitHub blocklist repo for abuse reports
- Track domain reputation (Google Safe Browsing, PhishTank)
- Collect user feedback via GitHub Issues
- Bug fixes and patches (weekly cycle)
- Dependency updates (monthly security patches)
- Constitutional amendments (as needed with community input)

### Version Roadmap

- **v1.0**: MVP Launch (Schema v1, Core Features)
- **v1.1**: Post-MVP Enhancements (ENS, i18n, Partial Payments)
- **v1.2**: Advanced Features (Templates, Exports, Mobile)
- **v2.0**: Major Upgrades (Requires Schema v2 - Password Encryption, IPFS, Partial Payments if not in v1)

---

## 🎯 Critical Path (MVP Only)

**Fastest path to functional MVP**:

1. P0.2 → P0.3 → P0.4 → P0.5 (Infrastructure in parallel)
2. P0.8 → P0.9 → P0.10 (Create flow)
3. P0.11 → P0.12 → P0.13 → P0.14 (Pay flow)
4. P1.1 + P1.7 + P1.8 (Essential polish)
5. Testing + Launch

**Estimated**: 4 weeks for experienced Next.js + Web3 developer

---

## 📝 Notes

### Using This Roadmap

1. **Copy SpecKit prompt** from each feature section
2. Run `/speckit.specify <prompt>` to generate detailed spec
3. Follow SpecKit workflow: `.specify` → `.plan` → `.tasks` → `.implement`
4. Always verify Constitution compliance before implementation
5. Update roadmap status as features complete

### Constitutional Compliance

- ✅ **Compliant**: Feature aligns with all 8 principles
- ⚠️ **Review Required**: May affect principles, needs justification
- 🚫 **Blocked**: Violates constitution, requires amendment or rejection
- 🔒 **Locked**: Cannot change (e.g., schema v1, tech stack versions)

### Priority Guidelines

- **P0**: Must have for MVP, blocks launch
- **P1**: Core MVP experience, launch without but immediately post-launch
- **P2**: Valuable enhancements, 1-2 months post-launch
- **P3**: Future vision, research phase, 3+ months out

---

**Document Version**: 1.0.0
**Created**: 2025-11-19
**Author**: Claude Code (Anthropic)
**License**: Same as project (open source)

---

**Remember**: Privacy > Features. Simplicity > Cleverness. YAGNI always. 🚀
