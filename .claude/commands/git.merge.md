---
description: Merge current feature branch into master with worktree cleanup.
---

1. **Ensure clean working directory**:
   ```bash
   git status --porcelain
   ```
   If not empty, ask user to commit or stash.

2. **Get feature branch name**:
   ```bash
   git branch --show-current
   ```
   Store as `<feature-branch>`.

3. **Switch to master**:
   ```bash
   git checkout master
   ```
   <!-- NOTE: Remote 'origin' not configured - skip pull
   git pull origin master --quiet
   -->

4. **Merge feature branch**:
   ```bash
   git merge <feature-branch>
   ```
   - On conflict: STOP, notify user, offer `git merge --abort`
   - Do NOT auto-resolve complex conflicts

<!-- NOTE: Remote 'origin' not configured - skip push
5. **Push master** (husky pre-push runs test:coverage):
   ```bash
   git push origin master --quiet
   ```
-->

4. **Worktree cleanup** (Constitution Principle X):
   ```bash
   git worktree list | grep -q "<feature-branch>" && git worktree remove worktrees/<feature-branch> --force
   git worktree prune
   ```

5. **Delete feature branch** (offer to user):
   ```bash
   git branch -d <feature-branch>
   ```
   <!-- NOTE: Remote 'origin' not configured - skip remote branch deletion
   git push origin --delete <feature-branch> 2>/dev/null || true
   -->
