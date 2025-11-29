---
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
tools: ['github/github-mcp-server/issue_write']
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

   c. Parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

   d. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
1. From the executed script, extract the path to **tasks**.
1. Get the Git remote by running:

```bash
git config --get remote.origin.url
```

**ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL**

1. For each task in the list, use the GitHub MCP server to create a new issue in the repository that is representative of the Git remote.

**UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL**
