# 🗺️ VoidPay Roadmap: Future (Post-MVP)

> **Focus**: Enhancements, optimizations, and long-term vision.
> **Status**: Planning / Research

---

## 📋 Legend

- **P2** - Medium (Post-MVP) - Valuable enhancements
- **P3** - Low (Future) - Nice to have, research phase
- ✅ Compliant | ⚠️ Review Required | 🔒 Locked

---

## 🚀 Phase 4: Post-MVP Enhancements (P2)

### P1.42 - Payload Inspector / Debugger

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Development Philosophy

- Route `/debug`.
- Raw JSON inspector.
- Validation output.

### P2.1 - ENS Resolution & Display

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

- Resolve ENS names.
- Reverse resolution.
- Avatar display.

### P2.2 - Multi-Language Support (i18n)

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

- `next-intl`.
- EN, RU, ES, CN.
- Localized currency.

### P2.3 - Partial Payment Support

**Status**: 🔴 **Priority**: P2 **Compliance**: ⚠️

- "Partially Paid" status.
- Progress bar.
- Multiple payments.

### P2.4 - Recurring Invoice Templates

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

- Save as template.
- Variables `{{CLIENT_NAME}}`.
- Template management UI.

### P2.5 - QR Code Payment Links (Mobile Optimization)

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

- Mobile QR scanner.
- Deep linking.
- WalletConnect improvements.

### P2.6 - Export/Import History (Data Portability)

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Principle II

- JSON export/import.
- Merge strategy.

### P2.7 - Calendar Reminders (.ics Integration)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Principle I

- Generate `.ics` file.
- "Remind me to pay".

### P2.8 - Batch Invoice Generation (CSV Import)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅

- CSV upload.
- Batch generation loop.
- Download All.

### P2.9 - Stateless History Recovery (On-Chain Scan)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Principle II

- Scan Alchemy Transfers API.
- Find Magic Dust signatures.
- Reconstruct history.

### P2.10 - URL Pre-fill API (Deep Linking)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅

- Query params mapping.
- "Invoice this" integrations.

### P2.11 - Local Analytics Dashboard (Personal Finance)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Principle II

- Charts (Bar/Pie).
- Stats (Total Earned).
- Local computation only.

### P2.13 - Smart Grid Paste (Excel/Sheets Support)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅

- Paste handler for table.
- TSV/CSV parser.

### P2.14 - Embeddable Payment Button (Iframe)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅

- `/embed/pay` route.
- Code generator.

### P2.16 - ASCII Art Receipt Generator

**Status**: 💡 **Priority**: P2 **Compliance**: ✅

- Copy as ASCII.
- Hacker aesthetic.

### TD.1 - Visual Regression Testing (Playwright/Storybook)

**Status**: 💡 **Priority**: P2 **Compliance**: ✅

- Screenshot comparison.
- CI Pipeline blocking.

### Monitoring & Observability (Privacy-First)

**Status**: 🔴 **Priority**: P2 **Compliance**: ⚠️ **Constitutional**: Principle II

- Client-side error logging.
- Web Vitals.
- NO third-party tracking.

### Performance Optimization

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

- Code splitting.
- Lazy load pdf renderer.
- Aggressive caching.

### Developer Documentation

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅ **Constitutional**: Principle VIII

- README, CONTRIBUTING, ARCHITECTURE, API docs.

### User Guide & FAQ

**Status**: 🔴 **Priority**: P2 **Compliance**: ✅

- Guides and Video tutorials.

---

## 🔮 Phase 5: Future Possibilities (P3)

### P3.1 - AES Link Encryption (Password Protection)

**Status**: 💡 **Priority**: P3 **Compliance**: ⚠️ **Constitutional**: Future (Part 7)

- Encrypt data with password.
- Client-side decryption.

### P3.2 - Cross-Chain Payments (Li.Fi / Jumper Integration)

**Status**: 💡 **Priority**: P3 **Compliance**: ⚠️ **Constitutional**: Future (Part 7)

- Widget integration.
- Bridge + Swap.

### P3.3 - IPFS Data Offloading

**Status**: 💡 **Priority**: P3 **Compliance**: ⚠️ **Constitutional**: Future (Part 7)

- Upload large data to IPFS.
- Store CID in URL.

### P3.4 - Escrow Smart Contract (Secure Deals)

**Status**: 💡 **Priority**: P3 **Compliance**: 🚫 **Constitutional**: VIOLATES Principle I

- Optional escrow mode.
- Smart contract deployment.

### P3.5 - Telegram Mini App

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

- Native TMA version.
- TON integration.

### P3.6 - Gnosis Safe App Integration

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

- Multisig treasury support.

### P3.7 - Accounting Export (CSV/Koinly/CoinTracking)

**Status**: 💡 **Priority**: P3 **Compliance**: ✅ **Constitutional**: Future (Part 7)

- Tax software compatibility.

### On-Chain Metrics (Public Data Only)

**Status**: 🔴 **Priority**: P3 **Compliance**: ✅

- Track invoices created (via hash).
- Network distribution.

---

**Document Version**: 1.1.0
**Last Updated**: 2025-11-21
