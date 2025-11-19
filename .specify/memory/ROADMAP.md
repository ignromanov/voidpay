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

**SpecKit Prompt**:

```
/speckit.specify Set up development tooling including ESLint, Prettier, Husky git hooks for commit validation, and ensure .nvmrc is configured for Node 20+. Configure TypeScript strict mode rules for financial data handling. Follow Constitution Principle VIII (context efficiency) - focus on essentials only.
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement URL state codec system for invoice data. Create TypeScript interfaces for InvoiceSchemaV1 with all fields (v, id, iss, due, nt, net, cur, t, dec, f, c, it, tax, dsc). Implement compression using lz-string library with validation for 2000 byte limit. Include schema versioning support for future migrations. CRITICAL: Follow Constitution Principle IV - schema v1 must be immutable once deployed. Include reserved fields for extensibility.
```

---

### P0.3 - Client-Side Storage (Zustand Stores)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle II

**Features**:

- `useCreatorStore` - drafts, preferences, history, invoice ID counter
- `usePayerStore` - payment receipts
- LocalStorage persistence via Zustand middleware
- Export/Import functionality (JSON)
- Data portability (user data ownership)

**SpecKit Prompt**:

```
/speckit.specify Implement client-side state management using Zustand with persist middleware. Create two stores: useCreatorStore (invoice drafts, user preferences, creation history, auto-incrementing invoice ID counter) and usePayerStore (payment receipts). Add export/import functionality for data portability. CRITICAL: No server-side storage (Constitution Principle I & II). All data stored in browser LocalStorage only.
```

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

**SpecKit Prompt**:

```
/speckit.specify Create serverless RPC proxy using Next.js Edge Runtime API routes. Implement /api/rpc endpoint that proxies requests to Alchemy (primary) and Infura (fallback) with automatic failover. Store API keys in environment variables only - NEVER expose in client code. Add rate limiting. CRITICAL: Constitution Principle VI - RPC keys must be server-side only. Principle II - no telemetry or request logging (privacy-first).
```

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

**SpecKit Prompt**:

```
/speckit.specify Set up Web3 infrastructure using Wagmi v2.19.4+, Viem v2.39.3+, and RainbowKit v2.2.9+. Configure support for Ethereum Mainnet, Arbitrum, Optimism, and Polygon PoS. Customize RainbowKit theme with Electric Violet accent color (#7C3AED). Implement progressive wallet connection - optional for invoice creators, required only when paying. Use RPC proxy endpoint created in previous feature.
```

---

### P0.6 - Feature-Sliced Design (FSD) Structure

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Architectural Constraints

**Features**:

- Implement FSD layers: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`
- Define entity models: `invoice`, `token`, `network`
- Create shared utilities and UI primitives
- Set up routing structure: `/`, `/create`, `/pay`

**SpecKit Prompt**:

```
/speckit.specify Establish Feature-Sliced Design (FSD) architecture. Create directory structure with layers: app (routing), pages (composition), widgets (UI blocks), features (user actions), entities (business logic), shared (utilities). Define entity models for invoice, token, and network. Set up routing for landing page (/), editor (/create), and payment view (/pay). Follow FSD best practices for component isolation and dependency rules.
```

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

**SpecKit Prompt**:

```
/speckit.specify Create marketing landing page at route /. Include hero section with value proposition "The Stateless Crypto Invoice", feature grid highlighting Privacy-First, Zero-Backend, and Trustless architecture. Add trust signals (GitHub link, open source). Implement SEO optimization with meta tags and OG image. Use dark mode (Zinc-950 background) and Geist Sans typography. CTA button leads to /create.
```

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

**SpecKit Prompt**:

```
/speckit.specify Build invoice editor interface at /create route. Implement split-screen layout - left side for form inputs (sender, client, line items, tax, discount, notes), right side for live preview. Add smart address input with Blockies avatar generation. Implement token selector with Uniswap Token List integration and custom token support (auto-fetch decimals via RPC proxy). Include invoice ID auto-increment from LocalStorage, notes field limited to 280 characters with counter UI. Auto-save drafts to useCreatorStore. Mobile: use tab-based UI instead of split-screen.
```

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

**SpecKit Prompt**:

```
/speckit.specify Create InvoicePaper widget component for displaying invoice as receipt-style card. Show text-only branding (no image logos), large Pretty Print amount display (rounded), exact amount with Magic Dust below in smaller text. Include line items table (collapsible on mobile), tax/discount calculations, subtle network theme indicator. Use Geist Sans for UI text, Geist Mono for amounts/addresses. Responsive mobile-first design.
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement link generation feature. Create "Generate Link" button that validates form, compresses invoice data using lz-string, checks URL length (<2000 bytes). If valid, show success modal with: generated URL with copy button, QR code, share buttons for Twitter/Telegram. Save invoice metadata to useCreatorStore history in LocalStorage. If URL exceeds limit, show error modal suggesting to shorten notes field. Use URL state codec from P0.2.
```

---

### P0.11 - Payment View (/pay) - Read-Only Mode

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- URL parameter parsing and decompression
- Schema version validation
- Invoice data hydration
- Read-only mode (no wallet required)
- Display invoice details using InvoicePaper component
- Network-specific ambient background (Ethereum: gray, Arbitrum: blue, Optimism: red, Polygon: purple)
- "Report Abuse" footer button
- Disclaimer text: "You are sending funds directly to [address]. VoidPay is not an intermediary."

**SpecKit Prompt**:

```
/speckit.specify Create payment view page at /pay route. Parse and decompress URL parameter ?d=..., validate schema version, hydrate invoice data. Display invoice using InvoicePaper component in read-only mode (no wallet connection required for viewing). Implement network-specific ambient backgrounds (Ethereum gray, Arbitrum blue, Optimism red, Polygon purple gradients). Add "Report Abuse" button in footer and disclaimer text about non-custodial nature. Use URL state codec from P0.2.
```

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

**SpecKit Prompt**:

```
/speckit.specify Build Payment Terminal widget with smart payment button having 6 states: Disconnected (connect wallet), Wrong Network (switch network prompt), Insufficient Funds (disabled), Ready (show Pretty Print amount), Processing (spinner + explorer link), Success (confetti + receipt download). Implement Magic Dust exact amount calculation (add random micro-amount 0.000001-0.000999). Handle network switching (user-initiated only per Constitution Principle VII). Support both native currency and ERC20 token payments. Include actionable error messages.
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement Magic Dust payment verification system. At invoice creation, generate cryptographically secure random micro-amount (0.000001-0.000999 for 6 decimal tokens, scaled for others). Add to base amount to create unique payment identifier. Display both Pretty Print (rounded) and Exact Amount (with dust) for transparency. During verification, use EXACT matching only - no fuzzy tolerance (Constitution Principle VII). Ensure decimal precision handling matches token decimals. Document collision probability (<0.0001%).
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement payment verification polling using Alchemy Transfers API via RPC proxy. Poll every 10 seconds for incoming transactions matching: recipient address, token address, EXACT amount (including Magic Dust), timestamp >= invoice issue date. Optionally filter by sender wallet if provided in invoice. Wait for 'finalized' status per Constitution Principle VII (Ethereum ~15min, Arbitrum/Optimism ~10-15min, Polygon ~30-45min). Display three status phases: Processing, Confirming, Paid. Use TanStack Query for polling management and caching.
```

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

**SpecKit Prompt**:

```
/speckit.specify Add PDF generation capability using @react-pdf/renderer. Create PDF template matching InvoicePaper HTML design. Implement client-side only PDF generation (Constitution Principle I - no backend). Add download button that generates filename: Invoice-{ID}-{ClientName}.pdf. Lazy load @react-pdf/renderer to minimize bundle size. Trigger from both /create preview and /pay receipt download button.
```

---

### P1.2 - History Drawer (Creator)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Slide-over panel from right
- List of created invoices (from LocalStorage)
- Display: Invoice ID, Client Name, Amount, Date, Status preview
- Actions per item: Copy Link, Delete
- Search/filter by client name or ID
- Sort by date (newest first)

**SpecKit Prompt**:

```
/speckit.specify Create History Drawer widget accessible from /create page header button. Implement slide-over panel showing list of created invoices from useCreatorStore LocalStorage. Display invoice metadata: ID, client name, amount, creation date. Add action buttons: Copy Link, Delete. Include search/filter by client name or invoice ID, sort by date (newest first). Use shadcn/ui Sheet component for drawer animation.
```

---

### P1.3 - Payment Receipt (Payer History)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Save payment receipt to usePayerStore on successful payment
- Receipt data: invoice details, tx hash, paid timestamp, network
- View receipts from menu (payer-side history)
- Download PDF receipt
- Transaction explorer link

**SpecKit Prompt**:

```
/speckit.specify Implement payment receipt saving to usePayerStore LocalStorage upon successful payment. Store invoice data, transaction hash, payment timestamp, network ID. Create receipts viewer accessible from app menu. Display paid invoices with status, amounts, dates. Add actions: View Details, Download PDF Receipt, View on Block Explorer. Use same PDF template as creator receipts.
```

---

### P1.4 - Network Theme System (Ambient Backgrounds)

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅

**Features**:

- Dynamic background gradients per network:
  - Ethereum: Monochrome gray/slate
  - Arbitrum: Deep blue with glow
  - Optimism: Red tint with glow
  - Polygon: Purple haze
- Apply on `/pay` page based on invoice `net` field
- Subtle accent color changes on primary buttons
- Helper function: `getNetworkTheme(chainId)`
- Tailwind CSS integration

**SpecKit Prompt**:

```
/speckit.specify Create network-specific theming system with ambient backgrounds. Implement getNetworkTheme(chainId) helper that returns Tailwind classes for: Ethereum (gray/slate), Arbitrum (deep blue glow), Optimism (red tint), Polygon (purple haze). Apply dynamic background on /pay page based on invoice network field. Include subtle accent color changes for primary buttons. Use Tailwind CSS gradients and glow effects for visual distinction.
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement token validation using Uniswap Token List. Fetch and cache token list, identify verified tokens (USDC, USDT, DAI, WETH) with green checkmark status. Show yellow warning for unknown/unverified tokens with message "Unknown Token. Verify contract address carefully" per Constitution Principle VII. Create token selector with autocomplete search showing symbol, name, logo. Allow manual address entry for custom tokens with prominent warnings. Use TanStack Query for token list caching.
```

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

**SpecKit Prompt**:

```
/speckit.specify Create dynamic OG (Open Graph) image generation for /pay route using Next.js Image Generation API. Generate 1200x630 images showing invoice amount, sender name, VoidPay branding with network-specific theme colors. Implement meta tags for social media sharing (Twitter Cards, Facebook OG). Create fallback static OG image for landing page. Use Geist Sans font, Electric Violet accent, network-appropriate background gradients.
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement abuse blocklist system per Constitution Principle V. Fetch blocklist from GitHub raw URL (https://raw.githubusercontent.com/voidpay/blocklist/main/blocked-hashes.json) with 15-minute cache. Generate SHA-256 hash of entire URL parameter ?d=... (not invoice contents for privacy). If hash found in blocklist, show red blocking screen: "This invoice has been reported for abuse". Add "Report Abuse" footer button that generates GitHub issue with hash. Document privacy preservation approach.
```

---

### P1.8 - SEO Optimization & noindex Meta Tags

**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V

**Features**:

- Landing `/` - indexed, full SEO (title, description, keywords, OG tags)
- `/create` - noindex, nofollow (X-Robots-Tag)
- `/pay` - noindex, nofollow (prevent invoice indexing)
- Sitemap generation (landing page only)
- robots.txt configuration

**SpecKit Prompt**:

```
/speckit.specify Configure SEO and indexing per Constitution Principle V. Set landing page (/) as indexed with full SEO meta tags (title, description, keywords, OG tags, Twitter Cards). Add noindex/nofollow meta tags and X-Robots-Tag headers to /create and /pay routes to prevent indexing of invoice editor and payment pages. Generate sitemap.xml with landing page only. Create robots.txt allowing crawler access to / but disallowing /create and /pay.
```

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

**SpecKit Prompt**:

```
/speckit.specify Add ENS (Ethereum Name Service) support. Implement ENS name resolution during invoice creation - convert name.eth to address. Reverse resolve addresses to ENS names for display. Fetch ENS avatar records and display instead of Blockies when available. Fallback to Blockies/Jazzicon if no ENS found. Use Wagmi/Viem ENS utilities. Show ENS names prominently in UI with address in small text below.
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement internationalization (i18n) using next-intl. Add support for English (default), Russian, Spanish, Chinese. Create language selector in app header. Localize all UI strings, error messages, currency formatting. Add invoice language preference field to schema (optional, for future use). Prepare structure for RTL support (Arabic) in future. Use locale-aware number formatting for amounts.
```

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

**SpecKit Prompt**:

```
/speckit.specify Add partial payment support. Modify payment verification to track multiple transactions toward same invoice. Display "Partially Paid" status with progress bar (paid vs remaining). Update status flow: Pending → Partial → Paid. Store all transaction hashes in receipt. IMPORTANT: Review Constitution Principle VII compliance - this changes verification logic from exact match to cumulative tracking. May require schema v2 migration.
```

---

### P2.4 - Recurring Invoice Templates

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- Save invoice as template (Creator feature)
- Template store in LocalStorage
- Template variables: {{CLIENT_NAME}}, {{AMOUNT}}, {{DATE}}
- Quick create from template
- Template management UI (edit, delete, duplicate)

**SpecKit Prompt**:

```
/speckit.specify Add recurring invoice templates feature. Allow creators to save invoice as reusable template with variables: {{CLIENT_NAME}}, {{AMOUNT}}, {{DATE}}. Store templates in useCreatorStore LocalStorage. Create template management UI for viewing, editing, deleting, duplicating templates. Add "Create from Template" button in /create page that pre-fills form with template data. Support template variable substitution.
```

---

### P2.5 - QR Code Payment Links (Mobile Optimization)

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- Display QR code on payment page (not just in creator modal)
- Mobile QR scanner support
- Deep linking to mobile wallets
- "Open in [Wallet]" buttons for Rainbow, MetaMask, Coinbase Wallet
- WalletConnect integration improvements

**SpecKit Prompt**:

```
/speckit.specify Enhance mobile payment UX with QR code optimization. Display QR code on /pay page itself (in addition to creator modal). Add "Open in Wallet" buttons for popular mobile wallets (Rainbow, MetaMask, Coinbase Wallet) using deep linking. Improve WalletConnect mobile flow. Add QR scanner support for opening payment links via camera. Test in-app browser detection (Telegram, Instagram) and show "Open in Safari/Chrome" prompt.
```

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

**SpecKit Prompt**:

```
/speckit.specify Implement data portability per Constitution Principle II. Add Export/Import functionality for both creator and payer history. Export to JSON file with metadata (version, timestamp). Import with validation and merge strategy (avoid duplicates, preserve newer data). Show privacy warning on export: "File contains all invoice data, store securely". Add buttons in settings/history drawer. Support cross-device data migration via manual file transfer.
```

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

**SpecKit Prompt**:

```
/speckit.specify Research and prototype password-protected invoice links using AES-256-GCM encryption. Encrypt invoice JSON before URL compression, decrypt client-side with user-provided password. Design password input UI on /pay page. Document security model: password shared via separate channel (Signal, in-person). Evaluate impact on URL length (encryption overhead). Consider as schema v2 feature. Review Constitution Principle IV compliance - requires versioning strategy.
```

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

**SpecKit Prompt**:

```
/speckit.specify Research cross-chain payment integration using Li.Fi or Jumper widget. Enable payers to pay Arbitrum USDC invoice using ETH on Optimism (automatic bridge + swap). Evaluate widget options: Li.Fi SDK, Jumper Exchange widget, Squid Router. Design UX: show total cost including bridge/swap fees, slippage settings, estimated time. Document Constitutional concerns: adds third-party dependency, potential privacy implications. Prototype on testnet first.
```

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

**SpecKit Prompt**:

```
/speckit.specify Research IPFS integration for handling large invoice data exceeding URL limits. Prototype file upload to IPFS (using NFT.Storage or Pinata), store CID in invoice schema field. Fetch data from IPFS gateway when loading /pay page. Design fallback UX if IPFS unreachable. Document privacy concerns: IPFS data is public, permanent, unencryptable without additional layer. Consider for schema v2 with optional IPFS fields.
```

---

### P3.4 - Escrow Smart Contract (Secure Deals)

**Status**: 💡 **Priority**: P3 **Compliance**: 🚫 **Constitutional**: VIOLATES Principle I

**Features**:

- Optional escrow mode: funds locked in smart contract
- Release conditions: time-based or confirmation-based
- Refund mechanism if conditions not met
- UI toggle: "Use Escrow" (extra fee for gas)
- WARNING: Requires smart contract deployment (violates zero-backend)

**SpecKit Prompt**:

```
/speckit.specify [⚠️ CONSTITUTIONAL VIOLATION] Research escrow functionality via smart contracts. Design optional escrow mode where payments lock in contract, released after confirmation or timeout. Prototype simple escrow contract (Solidity), deploy on testnets. Document gas costs, UX flow. CRITICAL: This violates Constitution Principle I (Zero-Backend). Requires explicit constitutional amendment or deferred to separate product. Evaluate if optional feature exempts from principle.
```

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

**SpecKit Prompt**:

```
/speckit.specify Research Telegram Mini App integration. Design native invoice creation interface within Telegram using Mini App API. Enable sending payment links as chat messages. Explore Telegram Wallet integration for TON payments. Maintain same URL state model for cross-platform compatibility (web + Telegram). Prototype basic mini app, test wallet connection, evaluate limitations vs web version.
```

---

### P3.6 - Gnosis Safe App Integration

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

**Features**:

- Gnosis Safe App plugin
- Pay invoices from multisig treasury
- Proposal creation for invoice payment
- Signer approval workflow visualization
- DAO invoice management dashboard

**SpecKit Prompt**:

```
/speckit.specify Research Gnosis Safe App integration for DAO treasury management. Create Safe App that loads invoice from URL, proposes payment transaction for multisig approval. Design DAO invoice dashboard showing pending invoices awaiting multi-sig approval. Follow Gnosis Safe App development guide. Test with Safe on testnet. Evaluate UX for invoice creators targeting DAOs - how to indicate Safe-friendly invoices.
```

---

### P3.7 - Accounting Export (CSV/Koinly/CoinTracking)

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

**Features**:

- Export payment history to CSV
- Format compatibility: Koinly, CoinTracking, TaxBit
- Include: date, amount, token, network, tx hash, counterparty
- Tax category suggestions (income, expense)
- Multi-network consolidated export

**SpecKit Prompt**:

```
/speckit.specify Add accounting export feature. Enable users to export payment receipts (from usePayerStore) and invoice history (from useCreatorStore) to CSV format compatible with crypto tax tools: Koinly, CoinTracking, TaxBit. Include columns: date, description, amount, token, network, tx hash, counterparty address, suggested tax category. Support filtering by date range, network. Add export button in history drawer.
```

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

**SpecKit Prompt**:

```
/speckit.specify Design privacy-first observability approach per Constitution Principle II. FORBIDDEN: Google Analytics, Sentry, third-party trackers. Implement client-side error logging to console only. Add debug mode triggered by URL param ?debug=1 for troubleshooting. Measure Web Vitals locally. Research self-hosted analytics (Plausible, Umami) as optional post-MVP feature with explicit user consent and opt-in. Document zero-telemetry architecture in docs.
```

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

**SpecKit Prompt**:

```
/speckit.specify Establish testing infrastructure per Constitution Development Philosophy. Set up Vitest + React Testing Library. MANDATORY test coverage: (1) Schema versioning - old URLs parse correctly, (2) Payment verification - Magic Dust exact matching, (3) URL compression - round-trip without data loss, (4) Multi-network - confirmation flow for each network. Add Playwright E2E tests for critical paths: create invoice, generate link, view payment page, connect wallet, pay. Target >80% coverage for entities/features layers.
```

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

**SpecKit Prompt**:

```
/speckit.specify Optimize application performance. Implement code splitting per route (/, /create, /pay). Lazy load @react-pdf/renderer to reduce initial bundle. Configure TanStack Query with aggressive caching: staleTime: Infinity for static data (token decimals, symbols). Use Next.js Image component for optimized images. Preload Geist fonts. Add bundle analyzer, target <200kb initial bundle. Optimize Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1.
```

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

**SpecKit Prompt**:

```
/speckit.specify Conduct security audit per Constitution Principles V and VII. Review code for OWASP Top 10: prevent XSS in notes field (sanitize/escape), validate all user inputs, implement CSP headers. Add rate limiting to /api/rpc proxy. Configure CORS properly. Run npm audit for dependency vulnerabilities, update vulnerable packages. Document security model: no backend = no SQL injection, no auth = no session hijacking. Create security.md documenting threat model and mitigations.
```

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

**SpecKit Prompt**:

```
/speckit.specify Design privacy-preserving success metrics using only public on-chain data and anonymized client-side signals. Track: network distribution, popular tokens, approximate invoice count (via URL hash checks without storing hashes). NO tracking of: user identities, invoice amounts, personal data. Consider optional anonymous usage ping (count page loads) with explicit user consent. Document privacy-first metrics approach in compliance with Constitution Principle II.
```

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

**SpecKit Prompt**:

```
/speckit.specify Create developer documentation following Constitution Principle VIII (context efficiency). Write concise README.md with quickstart, CONTRIBUTING.md with dev setup, ARCHITECTURE.md explaining FSD structure and data flow. Document RPC proxy API and invoice schema specification. CRITICAL: Keep each file <400 lines, use examples over prose, structured formats (lists, tables, code blocks) over paragraphs. Information-dense, minimal filler. Include constitution.md reference in all docs.
```

---

### User Guide & FAQ

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

**Features**:

- "How to create an invoice" guide
- "How to pay an invoice" guide
- FAQ: What is stateless? Is it safe? Where is data stored?
- Troubleshooting: Wrong network, insufficient funds, failed tx
- Video tutorial (optional, hosted on YouTube)

**SpecKit Prompt**:

```
/speckit.specify Create user documentation. Write guides: "How to Create Invoice", "How to Pay Invoice". Build FAQ page addressing common questions: What is stateless?, Is it safe?, Where is my data?, Can invoices be edited after creation?, What if I lose the link?. Add troubleshooting section: wrong network errors, insufficient balance, transaction failures. Keep language simple, non-technical. Optional: create short video tutorial (2-3 min) demonstrating core flow.
```

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

**SpecKit Prompt**:

```
/speckit.specify Create pre-launch verification checklist. Systematically test all P0 features on testnets (Sepolia, Arbitrum Goerli, Optimism Goerli, Polygon Mumbai). Run Lighthouse audit (target >90 score). Verify mobile responsiveness on iOS Safari and Android Chrome. Test abuse blocklist fetch and blocking UI. Review legal disclaimers with counsel if available. Configure production domain (voidpay.xyz) and Vercel deployment. Triple-check: no analytics/telemetry enabled (Constitution Principle II). Prepare launch announcement (Twitter, Product Hunt). Document known limitations.
```

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
