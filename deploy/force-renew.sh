#!/usr/bin/env bash
# Forces a brand-new certificate for DOMAIN right now, ignoring the
# renewal window. Caddy has no "force renew" command, so this deletes the
# cached cert from the caddy_data volume and restarts the container, which
# makes Caddy notice it's missing and request a fresh one on startup.
#
# Let's Encrypt rate-limits duplicate certificates (5/week per domain) —
# run this by hand only when you actually need to, don't put it on cron.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
DOMAIN="${DOMAIN:?Set DOMAIN in .env}"

echo "### Removing cached certificate for $DOMAIN ..."
docker compose exec caddy sh -c \
  "find /data/caddy/certificates -type d -iname '$DOMAIN' -exec rm -rf {} +"

echo "### Restarting Caddy so it re-requests a certificate ..."
docker compose restart caddy
