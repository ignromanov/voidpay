# 🗺️ VoidPay Roadmap: P1 (High / MVP Core)

> **Focus**: Essential features for a complete MVP experience and polish.
> **Status**: Active Development

---

## 📋 Legend
- **P1** - High (MVP Core) - Essential for complete MVP experience
- ✅ Compliant | ⚠️ Review Required | 🔒 Locked

---

## 💎 Phase 2: MVP Core Features

### P0.7.5 - Interactive Hero Demo (Autoplay Invoice)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle XI
- **Scenario Engine**: Freelance, Micro-SaaS, Consulting scenarios.
- **Typing Animation**: "Typewriter" effect for inputs.
- **Theme Sync**: Ambient Background changes with scenario.
- **Interaction**: "Edit this" button to prefill `/create`.

### P0.8.1 - Editor Page UI Skeleton (Widgets Composition)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Page `editor`**: Assembly of `/create`.
- **Desktop Layout**: Floating Workspace (Cockpit + Paper).
- **Mobile Layout**: Tab-based switcher (Edit | Preview).

### P0.8 - Invoice Editor (Logic & Inputs)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Visual Checksum Input**: Blockies avatar in address field.
- **Wallet Prefill**: "Connect Wallet" to auto-fill sender.
- **Dev Tip Logic**: Optional 1% tip.
- **Ghost Row UX**: Auto-add new row.
- **Floating Workspace**: Centered layout.

### P0.9.1 - Invoice Paper Component (The Document)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle XI
- **Widget `invoice-paper`**: Visual document representation.
- **Physics**: A4 aspect ratio (`aspect-[210/297]`).
- **Internal Grid**: Header, From/To, Table, Totals.
- **Responsive**: `transform: scale()` for mobile.
- **States**: Draft vs Paid.

### P0.9 - Invoice Preview Component (Paper Design)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Auto-Height Physics**: Grows with content.
- **Receipt-style Design**: Shadow-2xl, floating effect.
- **Pretty Print**: Rounded amounts + Micro-text.

### P0.9.5 - Mobile Tab Navigation Logic
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Navigation**: Top/Bottom tabs (Editor vs Preview).
- **State Management**: Persist active tab.
- **Scroll Sync**: Reset scroll on switch.

### P0.10.1 - Interaction Overlays & Modals
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Widget `share-modal`**: Success dialog with QR and Copy.
- **Widget `donation-modal`**: Footer support modal.
- **Visuals**: Shadcn Dialog with blur.

### P0.10 - Link Generation & QR Code Modal
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- "Generate Link" with validation.
- URL compression + length check.
- Success modal (Link, QR, Share).
- Save to history.

### P0.11 - Payment View (/pay) - Document First Strategy
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle XI
- **Document Fidelity**: Render Full InvoicePaper immediately.
- **No Internal Scroll**: Window scrolls.
- **Read-Only Mode**: Hydrate from URL.
- **App Shell**: Floating Header + Footer outside paper.

### P0.12.5 - The "Paid" Stamp Animation
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Visual**: SVG Stamp "PAID".
- **Physics**: `mix-blend-mode: multiply`.
- **Animation**: Scale-in with random rotation.

### P0.12.5 - Token-Specific Particle System
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Logic**: Custom confetti per token (ETH crystals, USDC coins).
- **Physics**: Bouncing particles.

### P0.14.5 - Forensic Verification Animation
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Trigger**: "Confirming" status.
- **Visuals**: Scanning bar, matrix numbers, stop on Magic Dust.
- **Message**: "Blockchain signature verified."

### P0.16 - Smart Social Sharing Intents
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Pre-filled Messages**: Platform specific (Telegram vs Twitter).
- **Platform Detection**: Mobile vs Desktop.
- **Email `mailto:`**: Subject and body generation.

### P0.17 - Real-time Fiat Counter-values
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Price Feed**: CoinGecko/CryptoCompare via RPC Proxy.
- **UI Display**: `≈ $1,250.00` (grey text).
- **Disclaimer**: "Estimated value".

### P0.18 - Network Health & Latency Indicator
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Ping**: RPC provider latency check.
- **UI**: Green/Yellow/Red dot.
- **Fallback**: Auto-switch suggestion.
- **Gas Tracker**: Gwei display.

### P0.15 - Quick Clone / Duplicate Functionality
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Action**: "Duplicate" button.
- **Logic**: Copy JSON, new ID, new Date.
- **Redirect**: To `/create`.

### P0.19 - "Hire Me" Call-to-Action
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Schema**: Optional `links` field.
- **UI**: Button under PAID stamp.
- **Value**: Lead generation.

---

## 🎨 Phase 3: MVP Polish

### P1.1 - PDF Generation (@react-pdf/renderer)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle XI
- **WYSIWYG Fidelity**: Exact match to HTML.
- **Stateful Rendering**: PAID stamp overlay.
- **Watermark**: "Powered by VoidPay".
- Client-side generation.

### P1.2.1 - History Drawer UI
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- **Widget `history-sidebar`**: Sheet component.
- **List Item Card**: Client, Date, Amount, Status.
- **Empty State**: "No invoices yet".

### P1.2 - History Drawer (Creator)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Slide-over panel.
- List from LocalStorage.
- Actions: Copy, Delete, Paid.
- Search/Filter.

### P1.3 - Payment Receipt (Payer History)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Save receipt to `usePayerStore`.
- **Receipt Mode**: Visual transformation (PAID badge).
- Download PDF receipt.

### P1.4 - Network Theme System (Ambient Backgrounds)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Dynamic background animations per network.
- "Blur Wrapper" pattern.
- Accent color changes.

### P1.5 - Token Validation (Uniswap Token List)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle VII
- Fetch/Cache Uniswap Token List.
- Blue chip verification.
- Unknown token warning.

### P1.6 - OG Image Generation (Dynamic Previews)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Dynamic OG image for `/pay`.
- Display amount, sender, branding.
- Network-specific theme.

### P1.7 - Abuse Blocklist (Static GitHub)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V
- Fetch blocklist from GitHub.
- Hash generation (SHA-256).
- Red blocking screen.
- "Report Abuse" button.

### P1.8 - SEO Optimization & noindex Meta Tags
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V
- Landing `/` indexed.
- `/create` & `/pay` noindex.
- Sitemap & robots.txt.

### P1.9 - In-App Browser Guard
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: UX Risk Mitigation
- Detect UA (Telegram, Instagram).
- Blocking/Warning screen.
- "Open in System Browser" instruction.

### P1.10 - Advanced Donation System (Footer Modal)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- "Support VoidPay" button.
- Token selection (Native/ERC20).
- Custom Amount.

### P1.11 - Global Error Handling & Storage Safeguards
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- React Error Boundary.
- LocalStorage quota handling.
- Broken link handling.

### P1.12 - Native Mobile Interactions (Share & Haptics)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- `navigator.share()`.
- Haptic Feedback (`navigator.vibrate`).

### P1.13 - Legal & Disclaimer Content
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V
- Terms of Service & Privacy Policy (Static).
- First Run Disclaimer.

### P1.14 - Intelligent Token List Management
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle VII
- Top-100 default.
- Lazy Search.
- Local caching.

### P1.15 - Financial Input Masking
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Decimal constraints.
- Prevent invalid inputs.
- Auto-formatting (thousands separator).

### P1.16 - Brand Assets, Favicons & Manifest
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Favicon set.
- Web Manifest (PWA).
- Social Assets.

### P1.17 - Accessibility (A11y) & Keyboard Navigation
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Focus Management.
- ARIA Labels.
- Keyboard Shortcuts.
- Contrast Check.

### P1.18 - Native Print Optimization (@media print)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle XI
- Aggressive `@media print` overrides.
- Ink Saving (White bg, Black text).
- Layout Reset (Hide UI).

### P1.19 - International Date & Timezone Handling
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- ISO 8601 storage.
- Client Localization.
- Relative Time.

### P1.20 - UI Skeletons & Suspense States
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Document Skeleton.
- Image Preloading.
- Progressive Loading.

### P1.21 - Local Address Book & Autocomplete
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle II
- Save Contact.
- Store in LocalStorage.
- Autocomplete.

### P1.24 - Sonic Interaction Design (Sound FX)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- `use-sound` library.
- Triggers: Success, Copy, Error.
- Mute Toggle.

### P1.25 - Pre-Transaction Gas Estimator
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- `estimateGas` on hover.
- UI Display.
- High Fee Warning.

### P1.26 - Privacy Shredder (Panic Button)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle II
- "Clear All Data" button.
- Wipes LocalStorage, SessionStorage, Cache.

### P1.27 - Mobile-First Refinements
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- `h-dvh`.
- Sticky Payment Action.
- Safe Areas.

### P1.28 - Branded Error & 404 Pages
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- 404 "Lost in the Void".
- 500 "Chain Reorganization?".
- Global Error.tsx.

### P1.29 - Contextual Help System (Tooltips)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Tooltips for Magic Dust, Network, etc.

### P1.30 - First-Run Experience (Onboarding)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Demo Hydration.
- Visual Cues.
- Welcome Toast.

### P1.32 - Live URL "DNA" Visualizer
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Capacity Bar.
- Color states (Green/Yellow/Red).
- Animation.

### P1.33 - "Into the Void" Deletion Effect
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Physics Engine (`framer-motion`).
- Sucking animation on delete.

### P1.34 - "Thermal Printer" PDF Transition
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Animation of printing receipt.

### P1.35 - Reactive Atmospheric Weather (Gas Monitor)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- `useGasPrice`.
- Animation speed linked to gas price.

### P1.36 - "God Mode" Command Palette (Cmd+K)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- `cmdk`.
- Global actions.

### P1.37 - Respect for Reduced Motion
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle XI
- `useReducedMotion`.
- Disable animations.

### P1.38 - PWA Quick Actions (App Shortcuts)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Manifest shortcuts (New Invoice, Scan QR, History).

### P1.40 - Discrete Mode (Sensitive Data Masking)
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle II
- Blur balances.
- Reveal on Hover.

### P2.15 - GitHub Community Health Files
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅
- Issue Templates.
- PR Template.
- Security Policy.

---

## 🛠️ Infrastructure & Audits

### Testing Infrastructure
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Development Philosophy
- Schema versioning tests.
- Payment verification tests.
- URL compression tests.
- Vitest + Playwright.

### Security Audit
**Status**: 🔴 **Priority**: P1 **Compliance**: ✅ **Constitutional**: Principle V, VII
- OWASP check.
- XSS prevention.
- Dependency scanning.

---

**Document Version**: 1.1.0
**Last Updated**: 2025-11-21
