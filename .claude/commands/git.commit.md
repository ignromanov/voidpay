---
description: Run project checks (lint, type-check, build) and commit changes if successful.
---

0. **Worktree Context Detection (Constitution Principle X)**:
   - Detect if running in a worktree:
   ```bash
   git rev-parse --show-toplevel
   ```
   - Get current branch to include in commit context:
   ```bash
   git branch --show-current
   ```
   - If in a worktree (path contains `worktrees/`), note this for commit message scope.

1. Check for unstaged changes.
   ```bash
   git status --porcelain
   ```
   If the output is empty, stop and inform the user.

2. Run linting to ensure code quality (quiet mode).
   ```bash
   npm run lint -- --quiet
   ```
   **Error Handling**: If this fails, analyze the lint errors. If they are simple auto-fixable issues, run `npm run lint -- --fix`. If they are complex, stop and list the errors for the user to fix.

3. Run type checking to ensure type safety.
   ```bash
   npm run type-check
   ```
   **Error Handling**: If this fails, stop and list the type errors for the user. Do not commit broken code.

5. If all checks pass, stage all changes (including new and deleted files).
   ```bash
   git add -A
   ```

6. Generate a commit message.
   - **Instruction**: Analyze the staged changes.
   - **Instruction**: Generate a **Conventional Commit** message (e.g., `feat: add new workflow`, `fix: resolve type error`).
   - **Instruction**: The message should be concise but descriptive.

7. Commit the changes.
   ```bash
   git commit -m "<generated_message>"
   ```

8. Push changes if a remote repository exists.
   ```bash
   git remote | grep -q "origin" && git push origin HEAD --quiet
   ```
