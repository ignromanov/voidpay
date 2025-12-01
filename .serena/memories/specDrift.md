# Spec Drift Log

**Last Updated**: 2025-12-01 (audit sync)
**Purpose**: Track deviations between SpecKit specifications and actual implementation
**Rule**: Log here when implementation MUST differ from spec

---

## How to Log

When implementation differs from spec:

```markdown
## [Feature Name] - [YYYY-MM-DD]

**Spec**: specs/###-feature/spec.md
**Expected**: [What spec said]
**Actual**: [What was implemented]
**Reason**: [Why deviation was necessary]
**Impact**: [Breaking changes, performance, security implications]
**Action**: [None | Update spec | Create follow-up task]
```

---

## Logged Deviations

### P0.1 Repository Setup - 2025-11-19

**Spec**: specs/001-project-initialization/ (inferred)
**Expected**: Next.js 16, Node 20, Radix UI in P0.5, Geist fonts in P0.8
**Actual**: Next.js 15.5.6, Node 22.19.0, Radix UI + CVA in P0.1, Geist fonts in P0.1
**Reason**: User preference for stability (Next.js 15), latest LTS (Node 22), early UI setup reduces later work
**Impact**: None - minor version differences, beneficial early setup
**Action**: None - deviations are improvements

### P0.2 URL State Codec - 2025-11-20

**Spec**: specs/002-url-state-codec/
**Expected**: Test tasks T009, T011, T013 implemented
**Actual**: Tests skipped, focus on MVP functionality
**Reason**: Implementation strategy prioritized core over comprehensive coverage
**Impact**: Low - core functionality tested, edge cases deferred
**Action**: Consider adding tests in P1 hardening phase

### P0.4 RPC Proxy - 2025-11-21

**Spec**: specs/004-rpc-proxy-failover/
**Expected**: Zero external state (Principle I), Wagmi integration (T045) in same phase
**Actual**: Vercel KV for rate limiting, anonymous request IDs, Wagmi T045 deferred
**Reason**: KV is transient operational data (justified exception), Wagmi for app integration phase
**Impact**: Minor constitutional exception (documented), no functional impact
**Action**: None - exception justified in ROADMAP

### P0.6 FSD Structure - 2025-11-22

**Spec**: specs/005-fsd-design-system/
**Expected**: FSD `pages/` layer
**Actual**: Renamed to `page-compositions/`
**Reason**: Avoid collision with Next.js Pages Router directory convention
**Impact**: None - semantic rename, FSD pattern preserved
**Action**: Update FSD documentation to use `page-compositions/`

### P0.6.7 Testing Environment - 2025-11-28

**Spec**: specs/005-testing-environment/
**Expected**: Schema tests in `entities/invoice/`
**Actual**: Schema tests in `features/invoice-codec/`
**Reason**: FSD alignment - codec is a feature, not entity
**Impact**: None - better FSD compliance
**Action**: None - deviation is improvement

### P0.5 Wagmi Setup - 2025-11-28

**Spec**: specs/008-wagmi-rainbowkit-setup/spec.md
**Expected**: `useWatchPendingTransactions` returns data object
**Actual**: Uses callback-based API (`onTransactions` callback)
**Reason**: Wagmi v2 API design uses callbacks for streaming data
**Impact**: None - different pattern, same functionality
**Action**: None - spec was aspirational, implementation is correct

### P0.8.1 Form Components - 2025-11-29

**Spec**: specs/010-form-components/spec.md
**Expected**: Custom token entry in TokenSelect (P2)
**Actual**: Deferred to future feature
**Reason**: MVP scope reduction, not blocking core flow
**Impact**: None - P2 feature, not required for MVP
**Action**: Create P1.X task for custom token entry

---

## Review Checklist

After feature completion:

- [ ] Any deviations logged above?
- [ ] If major deviation → update spec.md
- [ ] If pattern changed → update systemPatterns.md
- [ ] If new constraint discovered → consider constitution amendment
