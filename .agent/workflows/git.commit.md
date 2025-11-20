---
description: Run project checks (lint, type-check, build) and commit changes if successful.
---

1. Check for unstaged changes.
   ```bash
   git status --porcelain
   ```
   If the output is empty, stop and inform the user.

2. Run linting to ensure code quality (quiet mode).
   ```bash
   pnpm lint -- --quiet
   ```
   **Error Handling**: If this fails, analyze the lint errors. If they are simple auto-fixable issues, run `pnpm lint -- --fix`. If they are complex, stop and list the errors for the user to fix.

3. Run type checking to ensure type safety.
   ```bash
   pnpm type-check
   ```
   **Error Handling**: If this fails, stop and list the type errors for the user. Do not commit broken code.

4. If all checks pass, stage all changes (including new and deleted files).
   ```bash
   git add -A
   ```

5. Generate a commit message.
   - **Instruction**: Analyze the staged changes.
   - **Instruction**: Generate a **Conventional Commit** message (e.g., `feat: add new workflow`, `fix: resolve type error`).
   - **Instruction**: The message should be concise but descriptive.

6. Commit the changes.
   ```bash
   git commit -m "<generated_message>"
   ```

7. Push changes if a remote repository exists.
   ```bash
   git remote | grep -q "origin" && git push origin HEAD --quiet
   ```
