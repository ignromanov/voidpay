# Spec Drift Log

**Last Updated**: 2025-12-01
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
