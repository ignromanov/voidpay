---
description: Push branch and create Pull Request via GitHub CLI.
---

<!-- NOTE: Remote 'origin' not configured - skip push
1. **Push branch** (husky pre-push runs test:coverage):
   ```bash
   git push -u origin HEAD --quiet
   ```
-->

1. **Get commit log for PR body**:
   ```bash
   git log master..HEAD --oneline
   ```

2. **Generate PR content**:
   - **Title**: Concise summary (Conventional Commit style)
   - **Body**:
     - What changed and why
     - Breaking changes (if any)
     - Link to related issues

3. **Create PR**:
   ```bash
   gh pr create --title "<title>" --body "<body>"
   ```
   If `gh` not available, print title/body for manual creation.
