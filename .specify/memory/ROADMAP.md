# 🗺️ VoidPay Development Roadmap

> **Project**: VoidPay - Stateless Crypto Invoice Platform
> **Constitution**: v1.6.0 (MUST READ: `.specify/memory/constitution.md`)
> **Last Updated**: 2025-11-21
> **Status**: Active Development

---

## 📂 Roadmap Index

The roadmap has been split into three files based on priority to improve manageability.

### 🔴 [P0 - Critical (MVP Blocker)](./ROADMAP_P0.md)

**Must have for launch.**
Contains Phase 0 (Foundation), Phase 1 (Core Infrastructure), and Phase 2 (MVP Core Features - Critical items). Also includes the Release Checklist.

### 🟡 [P1 - High (MVP Core)](./ROADMAP_P1.md)

**Essential for complete MVP experience.**
Contains Phase 2 (MVP Core Features - Polish items), Phase 3 (MVP Polish), Testing Infrastructure, and Security Audit.

### 💡 [Future - Post-MVP & Research](./ROADMAP_FUTURE.md)

**Enhancements and long-term vision.**
Contains Phase 4 (Post-MVP Enhancements), Phase 5 (Future Possibilities), Technical Debt, and Documentation.

---

## 📝 Notes

### Roadmap Formatting Rules

**Roadmap items MUST be concise.** Details belong in Serena memories.

| In Roadmap               | In Serena Memory         |
| ------------------------ | ------------------------ |
| Feature name + status    | Full configuration       |
| 3-5 bullet points max    | Code examples            |
| Dependencies             | Implementation guide     |
| Success criteria (brief) | Rationale & alternatives |

**Rule**: If a roadmap item exceeds 15 lines, move details to a memory file and reference it.

### Using This Roadmap

1. Copy the feature section from the relevant file.
2. Run `/speckit.specify <prompt>` to generate detailed spec.
3. Follow SpecKit workflow: `.specify` → `.plan` → `.tasks` → `.implement`.
4. Always verify Constitution compliance before implementation.
5. Update roadmap status as features complete.

### How to Log Progress

When marking an item as **Completed** in `ROADMAP_P*.md`:

1. Change Status to 🟢 **Completed**: YYYY-MM-DD.
2. Add **Feature Folder**: Path to the spec folder (e.g., `specs/002-url-state-codec/`).
3. Add **Implemented**: Brief summary of what was built.
4. Add **Deviations**: Any differences from the original plan/spec.
5. Add **Notes**: Technical decisions, constraints, or important context.
6. **Update Document Metadata**: Update the "Last Updated" date at the top of the file.

### Roadmap Maintenance

- **Version**: Increment document version (at bottom of file) for major structural changes.
- **Date**: Always update "Last Updated" when modifying status.
- **Context**: The "Feature Folder" is critical for other agents to find the full context (spec, plan, research) of the implementation.

### Constitutional Compliance

- ✅ **Compliant**: Feature aligns with all 8 principles
- ⚠️ **Review Required**: May affect principles, needs justification
- 🚫 **Blocked**: Violates constitution, requires amendment or rejection
- 🔒 **Locked**: Cannot change (e.g., schema v1, tech stack versions)

---

**Document Version**: 2.0.0 (Split)
**Created**: 2025-11-19
**Split**: 2025-11-21
**License**: Same as project (open source)
