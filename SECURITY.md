# Security Policy

VoidPay is a privacy-first, zero-backend crypto invoicing tool. All invoice data lives in the URL — no database, no user accounts, no server-side storage. This document describes how to report security vulnerabilities responsibly.

## Reporting a Vulnerability

**Preferred channel**: [GitHub Private Vulnerability Reporting](https://github.com/ignromanov/voidpay/security/advisories/new)

**Alternative**: security@voidpay.xyz

Please do not report security issues in public GitHub Issues, pull requests, or social media. Use private channels only.

Include in your report:
- Vulnerability type and affected component
- Step-by-step reproduction instructions
- Proof-of-concept or exploit code (if applicable)
- Potential impact assessment
- Your suggested severity level

## Response Timeline

| Stage | Target |
|-------|--------|
| Acknowledgment | 48 hours |
| Triage and initial assessment | 5 business days |
| Fix for Critical severity | 7 days |
| Fix for High severity | 14 days |
| Fix for Medium severity | 30 days |
| Fix for Low severity | 90 days |

We will keep you informed throughout the process. If you do not receive an acknowledgment within 48 hours, follow up at security@voidpay.xyz.

## Scope

### In Scope

| Component | Examples |
|-----------|---------|
| **Codec / URL handling** | Decompression bomb bypass, schema validation bypass, TLV tampering, salt/domain separator forgery |
| **RPC proxy** (`/api/rpc`) | Rate limit bypass, IP spoofing via `X-Forwarded-For`, unauthorized network access |
| **Transfers proxy** (`/api/transfers`) | Rate limit bypass, CORS origin bypass, unauthorized data exposure |
| **OG image endpoint** (`/api/og`) | Server-side request forgery, parameter injection, denial of service |
| **Content Security Policy** | CSP bypass that enables XSS on voidpay.xyz |
| **Payment flows** | Magic Dust collision that enables payment spoofing, payment verification bypass, wrong-network payment acceptance |
| **Smart contract interactions** | `tx.origin` usage, reentrancy in future on-chain components |
| **LocalStorage data** | Cross-origin data leakage, invoice history exposure |
| **Abuse blocklist** | Bypass of SHA-256 hash filtering |

### Out of Scope

- Social engineering attacks against the VoidPay team
- Denial-of-service attacks against production infrastructure
- Vulnerabilities in third-party services (Alchemy, Infura, WalletConnect, RainbowKit, Vercel)
- Vulnerabilities requiring physical access to a user's device
- Self-XSS (the attacker must exploit themselves)
- Issues in browser extensions not developed by VoidPay
- Health check endpoint (`/api/health`) information disclosure (returns only service availability status)
- Spam or abuse of the invoice creation form without a security impact
- Theoretical vulnerabilities without a working proof-of-concept
- Publicly known vulnerabilities in dependencies without demonstrated exploitability against VoidPay

## Severity Classification

### Critical

Full compromise of user funds or wallet, payment redirection to attacker-controlled address, remote code execution on voidpay.xyz infrastructure.

Examples:
- Codec manipulation that silently changes the payment address in a decoded invoice
- RPC proxy exploitation that leaks API keys enabling unrestricted blockchain write access
- XSS that injects a malicious transaction payload into the wallet signing prompt

### High

Significant privacy breach, partial payment flow manipulation, or persistent data corruption affecting multiple users.

Examples:
- Decompression bomb that causes denial of service for all /pay page visitors
- Rate limit bypass on the RPC proxy enabling mass blockchain queries at attacker scale
- Invoice URL crafted to bypass the abuse blocklist for a known malicious address

### Medium

Limited-scope privacy leak, non-critical functionality bypass, or information disclosure without direct fund risk.

Examples:
- OG endpoint (`?og=`) leaking more invoice metadata than documented
- CORS misconfiguration on `/api/transfers` allowing cross-origin reads
- Magic Dust PRNG bias reducing uniqueness guarantees below acceptable entropy

### Low

Minor information disclosure, missing hardening, or issues requiring significant user interaction to exploit.

Examples:
- Missing `Subresource Integrity` on third-party scripts
- HTTP security header misconfiguration without demonstrated exploit path
- Non-sensitive error messages leaking internal implementation details

## Safe Harbor

VoidPay commits to the following for good-faith security research:

- We will not pursue legal action against researchers who follow this policy
- We will not report researchers to law enforcement for good-faith testing
- We consider good-faith research to be: testing only against your own accounts/wallets, not accessing or modifying other users' data, not performing denial-of-service attacks, not publicly disclosing before a fix is available

Testing that causes harm to other users, degrades production availability, or involves unauthorized access to third-party infrastructure is outside the scope of safe harbor.

## Recognition

We maintain a Hall of Fame for researchers who responsibly disclose valid vulnerabilities. With your permission, your name or handle will be listed in [SECURITY-HALL-OF-FAME.md](./SECURITY-HALL-OF-FAME.md) after the issue is resolved.

**Bug bounty program**: We do not currently offer monetary rewards for vulnerability reports. We are considering a formal bug bounty program for future versions. Researchers who submit valid reports before a program launches will be eligible retroactively at our discretion.

## Supported Versions

| Version | Supported |
|---------|-----------|
| v1.x (current) | Yes |
| Pre-v1.0 | No |

Schema v1 codec URLs are immutable and will be supported indefinitely. Security fixes apply to the current deployed version at voidpay.xyz.

## Security Architecture Notes

These are documented design decisions, not vulnerabilities:

- **Hash fragments are never sent to the server** (RFC 3986). Invoice data is client-only by design.
- **`unsafe-eval` in CSP** is required by WalletConnect's WASM runtime. This is an accepted, monitored risk.
- **`unsafe-inline` in CSP** is required by RainbowKit's inline style injection. Accepted risk with strict `frame-ancestors: 'none'`.
- **No backend storage** means there is no server-side database to breach. The threat model is client-side only.
- **Finalized confirmation status** (not just included/safe) is used for payment verification to protect against reorg attacks.
