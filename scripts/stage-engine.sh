#!/usr/bin/env bash
# Regenerate the Engine deploy repos (web + worker) from this monorepo.
# The Engine packages (@growengine/core, @growengine/db) are vendored into each
# deploy repo as file: deps with prebuilt dist, so Hostinger auto-detects a
# standalone Next.js app (web) / Node app (worker) — no workspaces at the root.
#
# Usage:  bash scripts/stage-engine.sh
# Then:   cd "$HOME/grow-deploy-staging/engine-web"    && git add -A && git commit && git push
#         cd "$HOME/grow-deploy-staging/engine-worker" && git add -A && git commit && git push
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$HOME/grow-deploy-staging"
cd "$ROOT"

echo "→ Building engine packages (db, core)…"
npm run build --workspace=@growengine/db
npm run build --workspace=@growengine/core

vendor() {
  local dest="$1"
  rsync -a --exclude node_modules --exclude '.env' packages/engine-core/ "$dest/packages/core/"
  rsync -a --exclude node_modules --exclude '.env' packages/engine-db/   "$dest/packages/db/"
  python3 - "$dest" <<'PY'
import json, sys
dest = sys.argv[1]
p = f"{dest}/package.json"; d = json.load(open(p))
d.setdefault("dependencies", {})["@growengine/core"] = "file:packages/core"
d["dependencies"]["@growengine/db"] = "file:packages/db"
d.pop("workspaces", None)
json.dump(d, open(p, "w"), indent=2)
cp = f"{dest}/packages/core/package.json"; c = json.load(open(cp))
c["dependencies"]["@growengine/db"] = "file:../db"
json.dump(c, open(cp, "w"), indent=2)
PY
  printf 'legacy-peer-deps=true\n' > "$dest/.npmrc"
}

echo "→ Staging engine-web → $STAGE/engine-web"
mkdir -p "$STAGE/engine-web/packages"
rsync -a --exclude node_modules --exclude .next --exclude .env "$ROOT/apps/engine-web/" "$STAGE/engine-web/"
vendor "$STAGE/engine-web"
sed -i'' -e 's#resolve(process.cwd(), "../../.env")#resolve(process.cwd(), ".env")#' "$STAGE/engine-web/next.config.ts" || true

echo "→ Staging engine-worker → $STAGE/engine-worker"
mkdir -p "$STAGE/engine-worker/packages"
rsync -a --exclude node_modules --exclude dist --exclude .env "$ROOT/apps/engine-worker/" "$STAGE/engine-worker/"
vendor "$STAGE/engine-worker"
cp "$ROOT/tsconfig.base.json" "$STAGE/engine-worker/tsconfig.base.json"
sed -i'' -e 's#"../../tsconfig.base.json"#"./tsconfig.base.json"#' "$STAGE/engine-worker/tsconfig.json"

echo "✓ Done. Commit & push each staged repo to its GitHub remote."
