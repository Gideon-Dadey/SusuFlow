#!/usr/bin/env bash
# Remove sensitive files from entire git history.
# Run only if real secrets were committed. Requires git-filter-repo:
#   pip install git-filter-repo   OR   brew install git-filter-repo
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v git-filter-repo &>/dev/null; then
  echo "ERROR: git-filter-repo is not installed."
  echo "Install: pip install git-filter-repo"
  exit 1
fi

echo "This rewrites git history to remove .env and .env.* files."
echo "All collaborators must re-clone after you force-push."
read -r -p "Continue? [y/N] " confirm
if [[ "${confirm,,}" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

git filter-repo --force \
  --path-glob '.env' \
  --path-glob '.env.*' \
  --invert-paths

echo ""
echo "History rewritten. Next steps:"
echo "  1. Verify: git log --all -- .env"
echo "  2. git push --force --all"
echo "  3. git push --force --tags"
echo "  4. Rotate any secrets that were ever committed."
