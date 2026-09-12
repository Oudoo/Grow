#!/bin/sh
# Launch one Hostinger MCP server with its API token read from the macOS
# Keychain at start time — so the token lives in exactly one place, and never
# in ~/.claude.json, this repo, or a shell history line.
#
#   usage: hostinger-mcp.sh <account-label> <server-binary>
#   e.g.   hostinger-mcp.sh grow hostinger-hosting-mcp
#
# Store a token once with scripts/mcp/setup-hostinger.sh, which also registers
# the servers in Claude Code through this wrapper. Server binaries (all in the
# hostinger-api-mcp package): hostinger-hosting-mcp, hostinger-dns-mcp,
# hostinger-domains-mcp, hostinger-reach-mcp, hostinger-vps-mcp,
# hostinger-ecommerce-mcp, hostinger-mail-mcp, hostinger-billing-mcp,
# hostinger-api-mcp (everything, ~390 tools).
set -eu

account="${1:?account label, e.g. grow}"
server="${2:?server binary, e.g. hostinger-hosting-mcp}"

# The desktop app may start this with a minimal PATH; make node/npx findable.
for d in /opt/homebrew/bin /usr/local/bin "$HOME/.local/bin" "$HOME"/.nvm/versions/node/*/bin; do
  [ -d "$d" ] && PATH="$d:$PATH"
done
export PATH

token="$(security find-generic-password -s hostinger-api-token -a "$account" -w 2>/dev/null || true)"
if [ -z "$token" ]; then
  echo "hostinger-mcp: no Keychain item (service hostinger-api-token, account '$account'). Run scripts/mcp/setup-hostinger.sh $account" >&2
  exit 1
fi

HOSTINGER_API_TOKEN="$token" exec npx -y --package=hostinger-api-mcp@latest "$server"
