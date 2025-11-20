---
description: Push current branch and create a Pull Request.
---

1. Run build to ensure the project builds successfully before creating a PR.
   ```bash
   pnpm build > /dev/null
   ```
   **Error Handling**: If this fails, stop and report the build error.

2. Push the current branch to the remote repository (quietly).
   ```bash
   git push -u origin HEAD --quiet
   ```

3. Generate PR content.
   - **Instruction**: Analyze the commits on this branch relative to `master` (concise log).
     ```bash
     git log master..HEAD --oneline
     ```
   - **Instruction**: Generate a descriptive **Title** and **Body** for the PR.
     - **Title**: Concise summary of the feature or fix.
     - **Body**: Detailed description of changes, motivation, and any breaking changes. Use markdown.

4. Create a Pull Request using the GitHub CLI.
   ```bash
   gh pr create --title "<generated_title>" --body "<generated_body>"
   ```
   **Fallback**: If `gh` is not installed or configured:
   - Print the generated Title and Body for the user.
   - Print the URL to create the PR manually (from the `git push` output).
