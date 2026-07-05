#!/usr/bin/env bash
# Regenerate the Hub deploy repo (Grow-Hub) from this monorepo.
#
# The Hub depends on workspace packages (@growengine/core, @growengine/db,
# @growengine/worker). These are vendored into the deploy repo as file: deps
# with prebuilt dist, so Hostinger auto-detects a standalone Next.js app.
#
# Usage:  bash scripts/stage-hub.sh
# Then push:
#   git push https://github.com/Oudoo/Grow-Hub.git deploy/hub:main --force
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Building engine packages (db, core, worker)…"
npm run build --workspace=@growengine/db
npm run build --workspace=@growengine/core
npm run build --workspace=@growengine/worker 2>/dev/null || echo "  (worker build skipped — may not have tsconfig)"

# ── 1. Subtree-split apps/grow into deploy/hub branch ──────────────────
echo "→ Subtree-splitting apps/grow…"
git branch -D deploy/hub 2>/dev/null || true
git subtree split --prefix=apps/grow -b deploy/hub

# ── 2. Checkout the deploy branch in a temp worktree to vendor packages ─
STAGE=$(mktemp -d)
echo "→ Checking out deploy/hub into $STAGE…"
git worktree add --detach "$STAGE" deploy/hub

# ── 3. Vendor packages into the deploy tree ─────────────────────────────
echo "→ Vendoring @growengine packages…"
mkdir -p "$STAGE/packages/engine-core" "$STAGE/packages/engine-db" "$STAGE/packages/engine-worker"

rsync -a --exclude node_modules --exclude '.env' \
  "$ROOT/packages/engine-core/" "$STAGE/packages/engine-core/"

rsync -a --exclude node_modules --exclude '.env' \
  "$ROOT/packages/engine-db/"   "$STAGE/packages/engine-db/"

rsync -a --exclude node_modules --exclude dist --exclude '.env' \
  "$ROOT/apps/engine-worker/"   "$STAGE/packages/engine-worker/"
# Copy the pre-built dist for the worker
if [ -d "$ROOT/apps/engine-worker/dist" ]; then
  rsync -a "$ROOT/apps/engine-worker/dist/" "$STAGE/packages/engine-worker/dist/"
fi

# ── 4. Patch package.json: workspace "*" → file: references ────────────
echo "→ Patching package.json with file: references…"
python3 - "$STAGE" <<'PY'
import json, sys
dest = sys.argv[1]

# Main app package.json
p = f"{dest}/package.json"
d = json.load(open(p))
d["dependencies"]["@growengine/core"] = "file:packages/engine-core"
d["dependencies"]["@growengine/db"] = "file:packages/engine-db"
d["dependencies"]["@growengine/worker"] = "file:packages/engine-worker"
json.dump(d, open(p, "w"), indent=2)

# engine-core depends on engine-db
cp = f"{dest}/packages/engine-core/package.json"
c = json.load(open(cp))
c["dependencies"]["@growengine/db"] = "file:../engine-db"
json.dump(c, open(cp, "w"), indent=2)

# engine-worker depends on core + db
wp = f"{dest}/packages/engine-worker/package.json"
w = json.load(open(wp))
w["dependencies"]["@growengine/core"] = "file:../engine-core"
w["dependencies"]["@growengine/db"] = "file:../engine-db"
json.dump(w, open(wp, "w"), indent=2)
PY

# Ensure legacy-peer-deps so npm ci doesn't choke on nested file: deps
printf 'legacy-peer-deps=true\n' > "$STAGE/.npmrc"

# ── 5. Commit vendored packages onto the deploy/hub branch ─────────────
echo "→ Committing vendored packages…"
cd "$STAGE"
git add -A
git commit -m "chore(deploy): vendor @growengine packages for standalone build" --allow-empty

# Update the deploy/hub branch ref to point to the new commit
COMMIT=$(git rev-parse HEAD)
cd "$ROOT"
git update-ref refs/heads/deploy/hub "$COMMIT"

# Cleanup worktree
git worktree remove --force "$STAGE" 2>/dev/null || rm -rf "$STAGE"

echo ""
echo "✓ deploy/hub branch is ready with vendored packages."
echo "  Push with:"
echo "    git push https://github.com/Oudoo/Grow-Hub.git deploy/hub:main --force"
