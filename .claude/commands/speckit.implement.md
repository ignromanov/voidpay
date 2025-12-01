---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Detect worktree and run prerequisites**:

   a. First, try running from current directory:
      ```bash
      .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
      ```

   b. If the above fails with "Not on a feature branch" error, detect the active worktree:
      - List all worktrees: `git worktree list --porcelain`
      - Find the feature worktree in `worktrees/` directory (the one that's not the main repo)
      - Run the script FROM that worktree directory:
        ```bash
        cd <WORKTREE_PATH> && .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
        ```

   c. Parse FEATURE_DIR, WORKTREE_DIR, and AVAILABLE_DOCS list. All paths must be absolute.

   d. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Worktree Verification (Constitution Principle X)**:
   - Verify that you are currently in the worktree directory (WORKTREE_DIR from JSON)
   - Check current directory: `pwd` should return `worktrees/###-feature-name/` path
   - If NOT in worktree, ERROR: "Implementation must be executed in feature worktree. Expected: {WORKTREE_DIR}, Current: {pwd}"
   - This ensures:
     - All file modifications happen in isolated worktree
     - No conflicts with other concurrent agents working on different features
     - Clean separation of feature work from main branch
   - **CRITICAL**: ALL code changes, file creation, and modifications MUST happen within the worktree directory

3. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ```

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 4

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 4

4. **Load and analyze the implementation context (Serena-First - Constitutional Principle XIII)**:
   - ❌ **PROHIBITED**: Direct `Read` for .md files
   - ✅ **MANDATORY**: Use `mcp__serena__search_for_pattern` to extract specific sections
   - **REQUIRED**: Search tasks.md for task list and execution plan sections
   - **REQUIRED**: Search plan.md for tech stack, architecture, and file structure sections
   - **IF EXISTS**: Search data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ files (JSON/YAML schemas are acceptable via Read)
   - **IF EXISTS**: Search research.md for technical decisions and constraints
   - **IF EXISTS**: Search quickstart.md for integration scenarios
   - **IMPORTANT**: All paths are relative to the worktree directory
   - **RATIONALE**: Targeted section extraction saves 10-100x tokens vs. full file reads

5. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`
   - **IMPORTANT**: Create/verify ignore files in the worktree directory

6. **Parse tasks.md and prepare execution batches**:
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements
   - **IMPORTANT**: All file paths in tasks are relative to the worktree directory

   **Group tasks into executor batches**:
   - Identify tasks that can be parallelized (marked with [P] and no file conflicts)
   - Group sequential tasks by phase
   - Each batch becomes a prompt for the `speckit-code-executor` agent

7. **Execute implementation via speckit-code-executor agents**:

   For each task batch, launch the `speckit-code-executor` agent using the **Task** tool with:
   - `subagent_type`: `speckit-code-executor`
   - `model`: `sonnet` (for speed) or `opus` (for complex tasks)

   **Executor Prompt Format** (MANDATORY):
   ```
   ## TASK
   [One-sentence description of what to implement]

   ## CONTEXT
   - Spec: [SpecKit reference if applicable]
   - Slice: [FSD slice location]
   - Dependencies: [What this code depends on]
   - User Story: [US1, US2, etc. if applicable]
   - Worktree: [WORKTREE_DIR absolute path]

   ## TASK LIST

   ### T001 [Action]
   - File: [exact/path/to/file.ts]
   - Operation: [create/modify/add-to]
   - Code:
   ```typescript
   [exact code to write]
   ```
   - Checkpoint: [how to verify this task worked]

   ### T002 [Action]
   ...

   ## COMPLETION CRITERIA
   - [ ] [Specific checkable criterion]
   - [ ] [Another criterion]
   - [ ] `pnpm type-check` passes
   - [ ] `pnpm lint` passes
   ```

   **Parallelization Rules**:
   - Tasks marked [P] with NO file conflicts → launch multiple agents in ONE message
   - Tasks with shared files → sequential execution (wait for previous agent to complete)
   - Setup tasks → always sequential (first batch)
   - Test tasks → can parallelize if independent files

   **Example parallel launch**:
   ```
   <Task tool call 1: "Implement currency formatter" with tasks T001-T003>
   <Task tool call 2: "Implement date formatter" with tasks T004-T006>
   ```

8. **Handle executor reports**:

   Each executor agent returns one of two statuses:

   **COMPLETED**:
   - Review the execution report
   - Verify all checkpoints passed
   - Mark tasks as [X] in tasks.md (within worktree)
   - Proceed to next batch

   **BLOCKED**:
   - Read the block reason carefully
   - Decide:
     - **Fix and retry**: Provide clarification and re-launch executor with updated instructions
     - **Skip task**: If task is optional, mark as skipped and continue
     - **Escalate**: Ask user for guidance if architectural decision needed
   - Document any deviations in specDrift memory

   **Error handling**:
   - If executor fails validation (`pnpm type-check` or `pnpm lint`), review errors
   - Provide fixed code in retry prompt
   - Maximum 2 retry attempts per batch before escalating to user

9. **Progress tracking**:
   - Report progress after each completed batch
   - Display running summary:
     ```
     Phase: [Current Phase]
     Completed: T001, T002, T003
     In Progress: T004 (Executor running)
     Pending: T005, T006, T007
     Blocked: T008 (reason)
     ```
   - Update tasks.md checkboxes after each successful batch
   - Halt if non-recoverable error occurs

10. **Completion validation**:
    - Verify all required tasks are marked [X]
    - Run final validation:
      ```bash
      pnpm type-check
      pnpm lint
      pnpm test  # if tests exist
      ```
    - Check that implemented features match the original specification
    - Confirm the implementation follows the technical plan
    - Report final status with summary of completed work

11. **Memory Bank Update** (MANDATORY before worktree cleanup):
    - **Update `activeContext`** — mark feature session as COMPLETE
    - **Update `progress`** — mark feature milestone as completed
    - **Update `fsdRegistry`** — if new slices created (Feature, Entity, Widget)
    - **Update `sharedUiIndex`** — if new UI components added to `shared/ui`
    - **Update `dataFlow`** — if new Zustand stores created
    - **Check `specDrift`** — log any intentional deviations from spec (including executor deviations)
    - ⚠️ **DO NOT** write to CLAUDE.md — Memory Bank is the source of truth

12. **Post-Implementation: Integration and Worktree Cleanup**:
    - After feature completion, commit all changes in the worktree: `git add . && git commit -m "..."`
    - Switch back to main branch: `git checkout main` (or appropriate base branch)
    - Merge feature branch: `git merge ###-feature-name` or `git rebase ###-feature-name`
    - Remove the worktree: `git worktree remove worktrees/###-feature-name`
    - Prune worktree metadata: `git worktree prune`
    - Verify worktree cleanup: `git worktree list` should not show removed worktree

---

## Executor Agent Reference

The `speckit-code-executor` agent is a **disciplined implementation worker** that:
- Executes code changes EXACTLY as instructed
- NEVER makes independent architectural decisions
- STOPS and reports when encountering discrepancies
- Returns structured COMPLETED or BLOCKED reports

**When to use executor vs. direct implementation**:
| Scenario | Approach |
|----------|----------|
| Well-defined task with exact code | Launch executor |
| Complex task needing judgment | Implement directly or break down further |
| Multiple independent tasks | Launch parallel executors |
| Task with unclear requirements | Clarify first, then launch executor |

**Executor limitations** (do NOT delegate these):
- Architectural decisions
- Spec interpretation
- Naming conventions not in spec
- Feature additions beyond task scope

---

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/speckit.tasks` first to regenerate the task list.
