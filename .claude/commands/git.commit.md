---
description: Stage and commit changes. Husky runs lint-staged + typecheck automatically.
---

1. **Check for changes**:
   ```bash
   git status --porcelain
   ```
   If empty, inform user "No changes to commit".

2. **Get context**:
   ```bash
   git branch --show-current
   ```

3. **Stage all changes**:
   ```bash
   git add -A
   ```

4. **Generate commit message**:
   - Analyze staged changes via `git diff --cached --stat`
   - Use **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
   - Be concise but descriptive

5. **Commit** (husky pre-commit runs lint-staged + typecheck):
   ```bash
   git commit -m "<message>"
   ```
   - If lint-staged auto-fixes files, husky handles re-staging
   - If typecheck fails, commit aborts — fix errors first

<!-- NOTE: Remote 'origin' not configured for this repository
6. **Push** (husky pre-push runs test:coverage):
   ```bash
   git push origin HEAD --quiet 2>/dev/null || git push -u origin HEAD --quiet
   ```
-->
