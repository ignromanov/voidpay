---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs: 
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup - Detect worktree and run prerequisites**:

   a. First, try running from current directory:
      ```bash
      .specify/scripts/bash/setup-plan.sh --json
      ```

   b. If the above fails with "Not on a feature branch" error, detect the active worktree:
      - List all worktrees: `git worktree list --porcelain`
      - Find the feature worktree in `worktrees/` directory (the one that's not the main repo)
      - Run the script FROM that worktree directory:
        ```bash
        cd <WORKTREE_PATH> && .specify/scripts/bash/setup-plan.sh --json
        ```

   c. Parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH, WORKTREE_DIR.

   d. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Worktree Verification (Constitution Principle X)**:
   - Verify that you are currently in the worktree directory (WORKTREE_DIR from JSON)
   - Check current directory: `pwd` should return `worktrees/###-feature-name/` path
   - If NOT in worktree, ERROR: "Planning must be executed in feature worktree. Expected: {WORKTREE_DIR}, Current: {pwd}"
   - This ensures isolation and prevents conflicts with other concurrent features

3. **Load context (Serena-First - Constitutional Principle XIII)**:
   - ❌ **PROHIBITED**: `Read` for .md files without Serena first
   - ✅ **MANDATORY**: Use Serena tools for Markdown documentation
   - FEATURE_SPEC (spec.md in worktree): Use `mcp__serena__search_for_pattern` for specific sections
   - Constitution: Use `mcp__serena__read_memory("constitution")` or search_for_pattern
   - IMPL_PLAN template: Can use `Read` (templates are acceptable, not project documentation)

4. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design
   - **IMPORTANT**: All files MUST be created within the worktree directory

5. **Stop and report**: Command ends after Phase 2 planning. Report branch, worktree directory, IMPL_PLAN path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Launch research-agent** using the Task tool:

   ```
   Use Task tool with:
   - subagent_type: "research-agent"
   - prompt: Format the input as follows:

   ## RESEARCH TASK
   Feature: [feature name from spec]
   Spec: [SPECS_DIR]/spec.md

   ## UNKNOWNS TO RESEARCH
   1. [Unknown 1]: [context from Technical Context NEEDS CLARIFICATION]
   2. [Unknown 2]: [context]
   ...

   ## CONSTRAINTS
   - Project Stack: Next.js 15+, React 19+, TypeScript 5+, Wagmi 2+, Viem 2+, Zustand 5+
   - Constitution Principles: [relevant principles for this feature]
   - Existing Patterns: [patterns found in codebase via Serena]

   ## OUTPUT PATH
   [SPECS_DIR]/research.md
   ```

3. **Verify agent output**:
   - If agent returns BLOCKED → resolve blockers before proceeding to Phase 1
   - If agent returns COMPLETED → verify research.md exists and has all unknowns resolved

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Memory Bank Update** (replaces bash script - memories are the single source of truth):

   a. **Update `activeContext`** with current feature session:
      ```
      mcp__serena__edit_memory(
        memory_file_name: "activeContext",
        needle: "\\*\\*Current Session\\*\\*:.*",
        repl: "**Current Session**: [BRANCH] — [Feature Name] (In Progress)",
        mode: "regex"
      )
      ```

   b. **Update `techContext`** ONLY if plan introduces NEW dependencies:
      - Read current `techContext` to check if dependency already exists
      - If new dependency found in plan's "Primary Dependencies" field:
        ```
        mcp__serena__edit_memory(
          memory_file_name: "techContext",
          needle: "## [Relevant Section]\\n",
          repl: "## [Relevant Section]\n\n| New Dep | Version |\n",
          mode: "regex"
        )
        ```
      - ⚠️ Note: techContext is "Locked for MVP" — only add if absolutely required

   c. **Log feature start in `progress`** if not already tracked:
      ```
      mcp__serena__read_memory("progress")
      // If feature not listed, add to current milestone
      ```

   d. **DO NOT** write to CLAUDE.md or any other agent files — Memory Bank is the source of truth

**Output**: data-model.md, /contracts/*, quickstart.md, Memory Bank updates (activeContext, progress, techContext if needed)

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
