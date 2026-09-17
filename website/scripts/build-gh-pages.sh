#!/usr/bin/env bash
# Builds a static export of the marketing site for GitHub Pages — the one
# free host reachable without an external account. GitHub Pages can't run
# server code, so this temporarily moves the two API routes (email capture
# forwarding, the canary-token tripwire) out of the build; both need a real
# server and stay in the tracked source for whenever this gets deployed
# somewhere dynamic (Vercel, etc.) instead.
set -euo pipefail
cd "$(dirname "$0")/.."

API_DIR="app/api"
API_BACKUP="$(mktemp -d)/api"

cleanup() {
  if [ -d "$API_BACKUP" ] && [ ! -d "$API_DIR" ]; then
    mv "$API_BACKUP" "$API_DIR"
  fi
}
trap cleanup EXIT

if [ -d "$API_DIR" ]; then
  mv "$API_DIR" "$API_BACKUP"
fi

# Stale build cache can reference the routes just moved out of the way.
rm -rf .next

GITHUB_PAGES_BUILD=1 \
NEXT_PUBLIC_SITE_URL="https://savtech-alterx.github.io/AlterXtra" \
  npx next build

touch out/.nojekyll

echo "Static export ready at website/out/ (GitHub Pages, basePath /AlterXtra)"
