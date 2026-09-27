#!/usr/bin/env bash
# Personal dev CA, following https://dev.to/fakhrulhilal/creating-ssl-certificate-with-custom-ca-402e
#
# Root + intermediate CA live in $LOCAL_CA_DIR (default ~/.local-ca) —
# OUTSIDE this repo, on purpose. That's the whole point: it's the same CA
# reused by every project on this machine, and if you copy that one folder
# to a new machine, this script sees the files already exist and skips
# straight to issuing the leaf cert. You trust the root CA once per
# machine, ever — not once per project, not once per `docker volume rm`.
#
# The leaf cert (comment.localhost + blog.localhost) is project-local,
# signed by the intermediate, and safe to regenerate any time.
#
# Usage:
#   deploy/ca/generate-cert.sh          # generate whatever's missing
#   deploy/ca/generate-cert.sh --force  # regenerate everything
set -euo pipefail

if openssl version | grep -qi libressl; then
  echo "WARNING: system openssl is LibreSSL (macOS default) — it doesn't" >&2
  echo "reliably support -addext. Install a real OpenSSL first:" >&2
  echo "  brew install openssl && export PATH=\"\$(brew --prefix openssl)/bin:\$PATH\"" >&2
  exit 1
fi

OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
CA_DIR="${LOCAL_CA_DIR:-$HOME/.local-ca}"
DOMAINS=(comment.localhost blog.localhost)
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

mkdir -p "$CA_DIR"

if [ "$FORCE" = 1 ] || [ ! -f "$CA_DIR/root-CA.key" ] || [ ! -f "$CA_DIR/root-CA.crt" ]; then
  echo "### Generating root CA in $CA_DIR (this should happen ONCE ever) ..."
  openssl genrsa -out "$CA_DIR/root-CA.key" 4096
  openssl req -x509 -new -nodes -key "$CA_DIR/root-CA.key" -sha256 -days 3650 \
    -out "$CA_DIR/root-CA.crt" \
    -subj "/C=ID/O=Personal Dev/CN=Personal Dev Root CA" \
    -addext 'keyUsage = critical, cRLSign, keyCertSign' \
    -addext 'basicConstraints = critical, CA:TRUE' \
    -addext 'subjectKeyIdentifier=hash'
  NEW_ROOT=1
else
  echo "### Reusing existing root CA: $CA_DIR/root-CA.crt"
  NEW_ROOT=0
fi

if [ "$FORCE" = 1 ] || [ ! -f "$CA_DIR/server-CA.key" ] || [ ! -f "$CA_DIR/server-CA.crt" ]; then
  echo "### Generating intermediate CA in $CA_DIR ..."
  openssl genrsa -out "$CA_DIR/server-CA.key" 4096
  openssl req -new -key "$CA_DIR/server-CA.key" -out "$CA_DIR/server-CA.csr" \
    -subj "/C=ID/O=Personal Dev/OU=Development/CN=Personal Dev Server CA"
  openssl x509 -req -in "$CA_DIR/server-CA.csr" \
    -CA "$CA_DIR/root-CA.crt" -CAkey "$CA_DIR/root-CA.key" -CAcreateserial \
    -out "$CA_DIR/server-CA.crt" -days 3650 -sha256 \
    -extfile <(cat <<'EOF'
basicConstraints = critical, CA:TRUE, pathlen:0
keyUsage = critical, keyCertSign, cRLSign
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer:always
EOF
)
  rm -f "$CA_DIR/server-CA.csr"
else
  echo "### Reusing existing intermediate CA: $CA_DIR/server-CA.crt"
fi

LEAF_KEY="$OUT_DIR/local.key"
LEAF_CRT="$OUT_DIR/local.crt"
if [ "$FORCE" = 1 ] || [ ! -f "$LEAF_KEY" ] || [ ! -f "$LEAF_CRT" ]; then
  echo "### Issuing leaf certificate for ${DOMAINS[*]} ..."
  SAN=""
  for d in "${DOMAINS[@]}"; do SAN="${SAN}DNS:${d},"; done
  SAN="${SAN%,}"

  openssl genrsa -out "$LEAF_KEY" 2048
  openssl req -new -key "$LEAF_KEY" -out "$OUT_DIR/local.csr" \
    -subj "/C=ID/O=Personal Dev/CN=${DOMAINS[0]}"
  openssl x509 -req -in "$OUT_DIR/local.csr" \
    -CA "$CA_DIR/server-CA.crt" -CAkey "$CA_DIR/server-CA.key" -CAcreateserial \
    -out "$LEAF_CRT" -days 397 -sha256 \
    -extfile <(cat <<EOF
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = ${SAN}
EOF
)
  rm -f "$OUT_DIR/local.csr"
  # Full chain (leaf + intermediate) so clients that don't already have the
  # intermediate cached can still build a trust path to your trusted root.
  cat "$LEAF_CRT" "$CA_DIR/server-CA.crt" > "$OUT_DIR/local.fullchain.crt"
else
  echo "### Reusing existing leaf certificate: $LEAF_CRT"
fi

if [ "${NEW_ROOT:-0}" = 1 ]; then
  echo
  echo "### New root CA generated — trust it on THIS machine once:"
  echo "###   macOS: sudo security add-trusted-cert -d -r trustRoot \\"
  echo "###     -k /Library/Keychains/System.keychain $CA_DIR/root-CA.crt"
  echo "###   Then restart your browser."
  echo "### On any other machine, copy $CA_DIR there first — this script"
  echo "### will detect it and skip straight to the leaf cert."
fi
