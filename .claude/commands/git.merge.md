---
description: Merge the current feature branch into master.
---

1. Ensure the working directory is clean.
   ```bash
   git status --porcelain
   ```
   If there are changes, stop and ask the user to commit or stash them.

2. Get the current branch name.
   ```bash
   git branch --show-current
   ```

3. Checkout the `master` branch.
   ```bash
   git checkout master
   ```

4. Pull the latest changes for `master` (quietly).
   ```bash
   git pull origin master --quiet
   ```

5. Merge the feature branch into `master`.
   ```bash
   git merge <feature-branch-name>
   ```
   **Conflict Handling**:
   - If the merge fails with conflicts (`CONFLICT (content): Merge conflict in ...`), **STOP**.
   - Do **NOT** attempt to auto-resolve complex conflicts.
   - Notify the user: "Merge conflict detected in [files]. Please resolve conflicts manually or guide me through the resolution."
   - Abort the merge if the user requests it: `git merge --abort`.

6. **Post-Merge Verification**:
   - Run the build to ensure the merge didn't break anything (suppress success output).
   ```bash
   npm run build > /dev/null
   ```
   - If the build fails, **STOP**. Do not push broken code to master. Notify the user.

7. Push the updated `master` branch (quietly).
   ```bash
   git push origin master --quiet
   ```

8. **Worktree Cleanup (Constitution Principle X)**:
   - Check if a worktree exists for the feature branch:
   ```bash
   git worktree list | grep "<feature-branch-name>"
   ```
   - If worktree exists, remove it:
   ```bash
   git worktree remove worktrees/<feature-branch-name> --force
   git worktree prune
   ```
   - Verify cleanup:
   ```bash
   git worktree list
   ```

9. Offer to delete the feature branch locally and remotely.
   ```bash
   git branch -d <feature-branch-name>
   git push origin --delete <feature-branch-name>
   ```
