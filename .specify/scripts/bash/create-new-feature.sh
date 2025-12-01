#!/usr/bin/env bash

set -e

JSON_MODE=false
SHORT_NAME=""
BRANCH_NUMBER=""
UPDATE_BRANCH=""
ARGS=()
i=1
while [ $i -le $# ]; do
    arg="${!i}"
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --short-name)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            # Check if the next argument is another option (starts with --)
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            SHORT_NAME="$next_arg"
            ;;
        --number)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            BRANCH_NUMBER="$next_arg"
            ;;
        --branch)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --branch requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --branch requires a value' >&2
                exit 1
            fi
            UPDATE_BRANCH="$next_arg"
            ;;
        --help|-h)
            echo "Usage: $0 [--json] [--short-name <name>] [--number N] [--branch <name>] <feature_description>"
            echo ""
            echo "Options:"
            echo "  --json              Output in JSON format"
            echo "  --short-name <name> Provide a custom short name (2-4 words) for the branch"
            echo "  --number N          Specify branch number manually (overrides auto-detection)"
            echo "  --branch <name>     Update existing branch (skip branch/worktree creation)"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 'Add user authentication system' --short-name 'user-auth'"
            echo "  $0 --branch '012-landing-page' 'Updated description'"
            exit 0
            ;;
        *)
            ARGS+=("$arg")
            ;;
    esac
    i=$((i + 1))
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Usage: $0 [--json] [--short-name <name>] [--number N] <feature_description>" >&2
    exit 1
fi

# Function to find the repository root by searching for existing project markers
find_repo_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Function to get highest number from specs directory
get_highest_from_specs() {
    local specs_dir="$1"
    local highest=0
    
    if [ -d "$specs_dir" ]; then
        for dir in "$specs_dir"/*; do
            [ -d "$dir" ] || continue
            dirname=$(basename "$dir")
            number=$(echo "$dirname" | grep -o '^[0-9]\+' || echo "0")
            number=$((10#$number))
            if [ "$number" -gt "$highest" ]; then
                highest=$number
            fi
        done
    fi
    
    echo "$highest"
}

# Function to get highest number from git branches
get_highest_from_branches() {
    local highest=0
    
    # Get all branches (local and remote)
    branches=$(git branch -a 2>/dev/null || echo "")
    
    if [ -n "$branches" ]; then
        while IFS= read -r branch; do
            # Clean branch name: remove leading markers and remote prefixes
            clean_branch=$(echo "$branch" | sed 's/^[* ]*//; s|^remotes/[^/]*/||')
            
            # Extract feature number if branch matches pattern ###-*
            if echo "$clean_branch" | grep -q '^[0-9]\{3\}-'; then
                number=$(echo "$clean_branch" | grep -o '^[0-9]\{3\}' || echo "0")
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            fi
        done <<< "$branches"
    fi
    
    echo "$highest"
}

# Function to get next available feature number (global across ALL branches and specs)
# This ensures unique sequential numbering regardless of short-name
get_next_feature_number() {
    local specs_dir="$1"

    # Fetch all remotes to get latest branch info (suppress errors if no remotes)
    git fetch --all --prune 2>/dev/null || true

    local max_num=0

    # Get highest number from ALL local branches matching ###-* pattern
    local local_max=$(git branch 2>/dev/null | grep -oE '[0-9]{3}-' | sed 's/-//' | sort -rn | head -1)
    if [ -n "$local_max" ]; then
        local_max=$((10#$local_max))
        if [ "$local_max" -gt "$max_num" ]; then
            max_num=$local_max
        fi
    fi

    # Get highest number from ALL remote branches matching ###-* pattern
    local remote_max=$(git ls-remote --heads origin 2>/dev/null | grep -oE '/[0-9]{3}-' | sed 's/\///' | sed 's/-//' | sort -rn | head -1)
    if [ -n "$remote_max" ]; then
        remote_max=$((10#$remote_max))
        if [ "$remote_max" -gt "$max_num" ]; then
            max_num=$remote_max
        fi
    fi

    # Get highest number from ALL specs directories matching ###-* pattern
    if [ -d "$specs_dir" ]; then
        local specs_max=$(ls -1 "$specs_dir" 2>/dev/null | grep -oE '^[0-9]{3}' | sort -rn | head -1)
        if [ -n "$specs_max" ]; then
            specs_max=$((10#$specs_max))
            if [ "$specs_max" -gt "$max_num" ]; then
                max_num=$specs_max
            fi
        fi
    fi

    # Also check worktrees directory
    local worktrees_dir="$(dirname "$specs_dir")/worktrees"
    if [ -d "$worktrees_dir" ]; then
        local worktrees_max=$(ls -1 "$worktrees_dir" 2>/dev/null | grep -oE '^[0-9]{3}' | sort -rn | head -1)
        if [ -n "$worktrees_max" ]; then
            worktrees_max=$((10#$worktrees_max))
            if [ "$worktrees_max" -gt "$max_num" ]; then
                max_num=$worktrees_max
            fi
        fi
    fi

    # Return next number
    echo $((max_num + 1))
}

# Function to clean and format a branch name
clean_branch_name() {
    local name="$1"
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//'
}

# Resolve repository root. Prefer git information when available, but fall back
# to searching for repository markers so the workflow still functions in repositories that
# were initialised with --no-git.
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
    HAS_GIT=true
else
    REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"
    if [ -z "$REPO_ROOT" ]; then
        echo "Error: Could not determine repository root. Please run this script from within the repository." >&2
        exit 1
    fi
    HAS_GIT=false
fi

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# ============================================================================
# UPDATE MODE: If --branch is provided, switch to existing branch/worktree
# ============================================================================
if [ -n "$UPDATE_BRANCH" ]; then
    BRANCH_NAME="$UPDATE_BRANCH"

    # Validate branch exists
    if [ "$HAS_GIT" = true ]; then
        if ! git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
            echo "Error: Branch '$BRANCH_NAME' does not exist" >&2
            exit 1
        fi
    fi

    # Extract feature number from branch name (expects ###-name format)
    FEATURE_NUM=$(echo "$BRANCH_NAME" | grep -oE '^[0-9]{3}' || echo "")
    if [ -z "$FEATURE_NUM" ]; then
        echo "Error: Branch name '$BRANCH_NAME' does not match expected format (###-name)" >&2
        exit 1
    fi

    WORKTREES_DIR="$REPO_ROOT/worktrees"
    WORKTREE_DIR="$WORKTREES_DIR/$BRANCH_NAME"

    # Check if worktree exists, create if not
    if [ "$HAS_GIT" = true ] && [ ! -d "$WORKTREE_DIR" ]; then
        mkdir -p "$WORKTREES_DIR"
        git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
        >&2 echo "[specify] Created worktree: $WORKTREE_DIR"

        # Create symlink to root node_modules
        if [ -d "$REPO_ROOT/node_modules" ] && [ ! -e "$WORKTREE_DIR/node_modules" ]; then
            ln -s "$REPO_ROOT/node_modules" "$WORKTREE_DIR/node_modules"
            >&2 echo "[specify] Created node_modules symlink"
        fi

        # Copy .serena if needed
        if [ -d "$REPO_ROOT/.serena" ] && [ ! -e "$WORKTREE_DIR/.serena" ]; then
            mkdir -p "$WORKTREE_DIR/.serena/cache" "$WORKTREE_DIR/.serena/logs"
            if [ -d "$REPO_ROOT/.serena/memories" ]; then
                cp -r "$REPO_ROOT/.serena/memories" "$WORKTREE_DIR/.serena/memories"
            fi
            >&2 echo "[specify] Created .serena/ with copied memories"
        fi

        # Setup .claude if needed
        if [ -d "$REPO_ROOT/.claude" ] && [ ! -e "$WORKTREE_DIR/.claude" ]; then
            mkdir -p "$WORKTREE_DIR/.claude"
            if [ -f "$REPO_ROOT/.claude/settings.local.json" ]; then
                cp "$REPO_ROOT/.claude/settings.local.json" "$WORKTREE_DIR/.claude/settings.local.json"
            fi
            if [ -d "$REPO_ROOT/.claude/commands" ]; then
                ln -s "$REPO_ROOT/.claude/commands" "$WORKTREE_DIR/.claude/commands"
            fi
            >&2 echo "[specify] Created .claude/ with settings"
        fi
    elif [ "$HAS_GIT" = true ]; then
        >&2 echo "[specify] Using existing worktree: $WORKTREE_DIR"
    else
        WORKTREE_DIR="$REPO_ROOT"
    fi

    FEATURE_DIR="$WORKTREE_DIR/specs/$BRANCH_NAME"
    SPEC_FILE="$FEATURE_DIR/spec.md"

    # Verify spec file exists
    if [ ! -f "$SPEC_FILE" ]; then
        echo "Error: Spec file not found at $SPEC_FILE" >&2
        exit 1
    fi

    >&2 echo "[specify] Update mode: editing existing spec"

    # Output and exit
    export SPECIFY_FEATURE="$BRANCH_NAME"

    if $JSON_MODE; then
        printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s","WORKTREE_DIR":"%s","FEATURE_DIR":"%s","MODE":"update"}\n' "$BRANCH_NAME" "$SPEC_FILE" "$FEATURE_NUM" "$WORKTREE_DIR" "$FEATURE_DIR"
    else
        echo "BRANCH_NAME: $BRANCH_NAME"
        echo "SPEC_FILE: $SPEC_FILE"
        echo "FEATURE_NUM: $FEATURE_NUM"
        echo "WORKTREE_DIR: $WORKTREE_DIR"
        echo "FEATURE_DIR: $FEATURE_DIR"
        echo "MODE: update"
    fi
    exit 0
fi

# ============================================================================
# CREATE MODE: Create new branch and worktree
# ============================================================================

# Function to generate branch name with stop word filtering and length filtering
generate_branch_name() {
    local description="$1"
    
    # Common stop words to filter out
    local stop_words="^(i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set)$"
    
    # Convert to lowercase and split into words
    local clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/ /g')
    
    # Filter words: remove stop words and words shorter than 3 chars (unless they're uppercase acronyms in original)
    local meaningful_words=()
    for word in $clean_name; do
        # Skip empty words
        [ -z "$word" ] && continue
        
        # Keep words that are NOT stop words AND (length >= 3 OR are potential acronyms)
        if ! echo "$word" | grep -qiE "$stop_words"; then
            if [ ${#word} -ge 3 ]; then
                meaningful_words+=("$word")
            elif echo "$description" | grep -q "\b${word^^}\b"; then
                # Keep short words if they appear as uppercase in original (likely acronyms)
                meaningful_words+=("$word")
            fi
        fi
    done
    
    # If we have meaningful words, use first 3-4 of them
    if [ ${#meaningful_words[@]} -gt 0 ]; then
        local max_words=3
        if [ ${#meaningful_words[@]} -eq 4 ]; then max_words=4; fi
        
        local result=""
        local count=0
        for word in "${meaningful_words[@]}"; do
            if [ $count -ge $max_words ]; then break; fi
            if [ -n "$result" ]; then result="$result-"; fi
            result="$result$word"
            count=$((count + 1))
        done
        echo "$result"
    else
        # Fallback to original logic if no meaningful words found
        local cleaned=$(clean_branch_name "$description")
        echo "$cleaned" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//'
    fi
}

# Generate branch name
if [ -n "$SHORT_NAME" ]; then
    # Use provided short name, just clean it up
    BRANCH_SUFFIX=$(clean_branch_name "$SHORT_NAME")
else
    # Generate from description with smart filtering
    BRANCH_SUFFIX=$(generate_branch_name "$FEATURE_DESCRIPTION")
fi

# Determine branch number
if [ -z "$BRANCH_NUMBER" ]; then
    if [ "$HAS_GIT" = true ]; then
        # Get next available number globally (across ALL branches, specs, worktrees)
        BRANCH_NUMBER=$(get_next_feature_number "$SPECS_DIR")
    else
        # Fall back to local directory check
        HIGHEST=$(get_highest_from_specs "$SPECS_DIR")
        BRANCH_NUMBER=$((HIGHEST + 1))
    fi
fi

FEATURE_NUM=$(printf "%03d" "$BRANCH_NUMBER")
BRANCH_NAME="${FEATURE_NUM}-${BRANCH_SUFFIX}"

# GitHub enforces a 244-byte limit on branch names
# Validate and truncate if necessary
MAX_BRANCH_LENGTH=244
if [ ${#BRANCH_NAME} -gt $MAX_BRANCH_LENGTH ]; then
    # Calculate how much we need to trim from suffix
    # Account for: feature number (3) + hyphen (1) = 4 chars
    MAX_SUFFIX_LENGTH=$((MAX_BRANCH_LENGTH - 4))
    
    # Truncate suffix at word boundary if possible
    TRUNCATED_SUFFIX=$(echo "$BRANCH_SUFFIX" | cut -c1-$MAX_SUFFIX_LENGTH)
    # Remove trailing hyphen if truncation created one
    TRUNCATED_SUFFIX=$(echo "$TRUNCATED_SUFFIX" | sed 's/-$//')
    
    ORIGINAL_BRANCH_NAME="$BRANCH_NAME"
    BRANCH_NAME="${FEATURE_NUM}-${TRUNCATED_SUFFIX}"
    
    >&2 echo "[specify] Warning: Branch name exceeded GitHub's 244-byte limit"
    >&2 echo "[specify] Original: $ORIGINAL_BRANCH_NAME (${#ORIGINAL_BRANCH_NAME} bytes)"
    >&2 echo "[specify] Truncated to: $BRANCH_NAME (${#BRANCH_NAME} bytes)"
fi

if [ "$HAS_GIT" = true ]; then
    # Constitution Principle X: Git Worktree Isolation for Concurrent Development
    # Create feature branch first (worktree requires existing branch)
    git branch "$BRANCH_NAME"

    # Create worktree directory structure
    WORKTREES_DIR="$REPO_ROOT/worktrees"
    mkdir -p "$WORKTREES_DIR"

    WORKTREE_DIR="$WORKTREES_DIR/$BRANCH_NAME"

    # Create isolated worktree for this feature
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
    >&2 echo "[specify] Created worktree: $WORKTREE_DIR"
    >&2 echo "[specify] All feature work must happen in this worktree directory"

    # Create symlink to root node_modules for IDE/tooling compatibility (vitest, eslint, etc.)
    if [ -d "$REPO_ROOT/node_modules" ] && [ ! -e "$WORKTREE_DIR/node_modules" ]; then
        ln -s "$REPO_ROOT/node_modules" "$WORKTREE_DIR/node_modules"
        >&2 echo "[specify] Created node_modules symlink for tooling compatibility"
    fi

    # Create .serena directory structure for worktree (isolated cache, copied memories)
    # Constitution v1.12.0: Memories are code, tracked in git, copied to worktrees (not symlinked)
    if [ -d "$REPO_ROOT/.serena" ] && [ ! -e "$WORKTREE_DIR/.serena" ]; then
        mkdir -p "$WORKTREE_DIR/.serena/cache" "$WORKTREE_DIR/.serena/logs"

        # Copy memories to worktree (memories are code, must be merged like code)
        if [ -d "$REPO_ROOT/.serena/memories" ]; then
            cp -r "$REPO_ROOT/.serena/memories" "$WORKTREE_DIR/.serena/memories"
        fi

        # Create worktree-specific project.yml
        cat > "$WORKTREE_DIR/.serena/project.yml" << SERENAEOF
# Serena project config for worktree: $BRANCH_NAME
# Memories are part of the codebase and must be committed after changes

languages:
- typescript
- markdown

encoding: "utf-8"
ignore_all_files_in_gitignore: true
ignored_paths: []
read_only: false
excluded_tools: []
initial_prompt: ""

# Use the same project name as main repo for consistent memory access
project_name: "stateless-invoicing-platform"

included_optional_tools: []
SERENAEOF

        # Create .gitignore for .serena (cache/logs local, memories tracked in git)
        cat > "$WORKTREE_DIR/.serena/.gitignore" << GITIGNOREEOF
# Serena cache and logs are local to each worktree
cache/
logs/
GITIGNOREEOF

        >&2 echo "[specify] Created .serena/ with isolated cache and copied memories"
    fi

    # Generate .mcp.json with worktree-specific path for Serena MCP
    if [ -f "$REPO_ROOT/.mcp.json" ] && [ ! -e "$WORKTREE_DIR/.mcp.json" ]; then
        cat > "$WORKTREE_DIR/.mcp.json" << MCPEOF
{
"mcpServers": {
    "serena": {
    "command": "uvx",
    "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--project",
        "$WORKTREE_DIR"
    ]
    }
}
}
MCPEOF
        >&2 echo "[specify] Created .mcp.json with worktree path: $WORKTREE_DIR"
    fi

    # Setup Claude Code settings for worktree
    if [ -d "$REPO_ROOT/.claude" ] && [ ! -e "$WORKTREE_DIR/.claude" ]; then
        mkdir -p "$WORKTREE_DIR/.claude"

        # Copy settings.local.json to worktree (each worktree may need different settings)
        if [ -f "$REPO_ROOT/.claude/settings.local.json" ]; then
            cp "$REPO_ROOT/.claude/settings.local.json" "$WORKTREE_DIR/.claude/settings.local.json"
        fi

        # Symlink commands to share across worktrees
        if [ -d "$REPO_ROOT/.claude/commands" ]; then
            ln -s "$REPO_ROOT/.claude/commands" "$WORKTREE_DIR/.claude/commands"
        fi

        >&2 echo "[specify] Created .claude/ with settings and shared commands"
    fi

    # Set up feature directory within the worktree
    FEATURE_DIR="$WORKTREE_DIR/specs/$BRANCH_NAME"
    mkdir -p "$FEATURE_DIR"

    # Copy spec template to worktree
    TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
    SPEC_FILE="$FEATURE_DIR/spec.md"
    if [ -f "$TEMPLATE" ]; then
        cp "$TEMPLATE" "$SPEC_FILE"
    else
        touch "$SPEC_FILE"
    fi
else
    >&2 echo "[specify] Warning: Git repository not detected; skipped branch and worktree creation for $BRANCH_NAME"

    # Fallback: create in main repo without worktree
    WORKTREE_DIR="$REPO_ROOT"
    FEATURE_DIR="$SPECS_DIR/$BRANCH_NAME"
    mkdir -p "$FEATURE_DIR"

    TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
    SPEC_FILE="$FEATURE_DIR/spec.md"
    if [ -f "$TEMPLATE" ]; then cp "$TEMPLATE" "$SPEC_FILE"; else touch "$SPEC_FILE"; fi
fi

# Set the SPECIFY_FEATURE environment variable for the current session
export SPECIFY_FEATURE="$BRANCH_NAME"

if $JSON_MODE; then
    printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s","WORKTREE_DIR":"%s","FEATURE_DIR":"%s"}\n' "$BRANCH_NAME" "$SPEC_FILE" "$FEATURE_NUM" "$WORKTREE_DIR" "$FEATURE_DIR"
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "FEATURE_NUM: $FEATURE_NUM"
    echo "WORKTREE_DIR: $WORKTREE_DIR"
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "SPECIFY_FEATURE environment variable set to: $BRANCH_NAME"
fi
