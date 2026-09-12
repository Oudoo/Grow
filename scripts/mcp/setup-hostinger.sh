#!/bin/sh
# One-time setup, per Hostinger account, on a Mac:
#   1. store the account's API token in the macOS Keychain (typed at a hidden
#      prompt — it never touches shell history, this repo, or ~/.claude.json);
#   2. register the Hostinger MCP servers in Claude Code (user scope) through
#      scripts/mcp/hostinger-mcp.sh, which reads the token back at launch.
#
#   usage: scripts/mcp/setup-hostinger.sh <account-label> [server ...]
#     scripts/mcp/setup-hostinger.sh grow                      # hosting dns domains reach vps ecommerce
#     scripts/mcp/setup-hostinger.sh cdx hosting dns           # a second account, two servers
#     scripts/mcp/setup-hostinger.sh grow --import hostinger-grow
#         reuse the token already stored in ~/.claude.json under that server
#         name instead of typing it (then remove the plain-text entries).
#
# Tokens are created in hPanel → (profile menu) → Account → API. They are
# account-wide and unscoped: treat one like the hPanel password.
set -eu

here="$(cd "$(dirname "$0")" && pwd)"
wrapper="$here/hostinger-mcp.sh"
account="${1:?account label, e.g. grow}"
shift

import_from=""
if [ "${1:-}" = "--import" ]; then
  import_from="${2:?server name in ~/.claude.json to copy the token from}"
  shift 2
fi
servers="${*:-hosting dns domains reach vps ecommerce}"

command -v claude >/dev/null || { echo "claude CLI not on PATH — install Claude Code first" >&2; exit 1; }
chmod +x "$wrapper"

if [ -n "$import_from" ]; then
  token="$(python3 - "$import_from" <<'PY'
import json, os, sys
cfg = json.load(open(os.path.expanduser("~/.claude.json")))
print(cfg.get("mcpServers", {}).get(sys.argv[1], {}).get("env", {}).get("HOSTINGER_API_TOKEN", ""))
PY
)"
  [ -n "$token" ] || { echo "no HOSTINGER_API_TOKEN under mcpServers.$import_from in ~/.claude.json" >&2; exit 1; }
  security add-generic-password -U -s hostinger-api-token -a "$account" -j "Hostinger API token ($account) — used by scripts/mcp/hostinger-mcp.sh" -w "$token"
  unset token
else
  echo "Paste the Hostinger API token for account '$account' (hidden; asked twice by Keychain):"
  security add-generic-password -U -s hostinger-api-token -a "$account" -j "Hostinger API token ($account) — used by scripts/mcp/hostinger-mcp.sh" -w
fi

for s in $servers; do
  name="hostinger-$account-$s"
  claude mcp remove --scope user "$name" >/dev/null 2>&1 || true
  claude mcp add --scope user --transport stdio "$name" -- "$wrapper" "$account" "hostinger-$s-mcp"
done

echo
echo "Stored: Keychain item (service hostinger-api-token, account $account)."
echo "Registered (user scope):$(for s in $servers; do printf ' hostinger-%s-%s' "$account" "$s"; done)"
echo "Check with:  claude mcp list     — then restart Claude Code so the new servers connect."
[ -n "$import_from" ] && echo "Now remove the plain-text entry:  claude mcp remove --scope user $import_from"
exit 0
