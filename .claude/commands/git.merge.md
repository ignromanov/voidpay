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

3. **Switch to master and update**:
   ```bash
   git checkout master && git pull origin master --quiet
   ```

4. **Merge feature branch**:
   ```bash
   git merge <feature-branch>
   ```
   - On conflict: STOP, notify user, offer `git merge --abort`
   - Do NOT auto-resolve complex conflicts

5. **Push master** (husky pre-push runs test:coverage):
   ```bash
   git push origin master --quiet
   ```

6. **Worktree cleanup** (Constitution Principle X):
   ```bash
   git worktree list | grep -q "<feature-branch>" && git worktree remove worktrees/<feature-branch> --force
   git worktree prune
   ```

7. **Delete feature branch** (offer to user):
   ```bash
   git branch -d <feature-branch>
   git push origin --delete <feature-branch> 2>/dev/null || true
   ```
