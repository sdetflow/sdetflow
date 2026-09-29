#!/usr/bin/env bash
set -euo pipefail

NAME="Sumanth Gumedelli"
EMAIL="sumantthh@gmail.com"
SIGNING_UID="${NAME} <${EMAIL}>"
OUT_DIR="${HOME}/Desktop/sdetflow-signing"

if ! command -v gpg >/dev/null 2>&1; then
  echo "GnuPG (gpg) is not installed."
  echo "Install GnuPG first, then run this script again."
  exit 1
fi

mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR"

echo "Creating a primary RSA 3072 signing key for:"
echo "  $SIGNING_UID"
echo
echo "GPG will ask you to protect the private key with a passphrase."
echo "Use a strong passphrase and keep it private."
echo

gpg --quick-generate-key "$SIGNING_UID" rsa3072 sign 2y

FPR="$(gpg --list-secret-keys --with-colons "$EMAIL" | awk -F: '$1=="fpr"{print $10; exit}')"
if [[ -z "$FPR" ]]; then
  echo "Could not determine the new key fingerprint."
  exit 1
fi

gpg --armor --export "$FPR" > "$OUT_DIR/sdetflow-maven-public.asc"
gpg --armor --export-secret-keys "$FPR" > "$OUT_DIR/sdetflow-maven-private.asc"
chmod 600 "$OUT_DIR/sdetflow-maven-private.asc"

echo
echo "Key fingerprint:"
echo "  $FPR"
echo
echo "Publishing public key to keyserver.ubuntu.com..."
gpg --keyserver keyserver.ubuntu.com --send-keys "$FPR"

echo
echo "Created:"
echo "  $OUT_DIR/sdetflow-maven-public.asc"
echo "  $OUT_DIR/sdetflow-maven-private.asc"
echo
echo "Next:"
echo "  1. Add the ENTIRE private .asc file as GitHub Actions secret MAVEN_GPG_PRIVATE_KEY."
echo "  2. Add the passphrase you chose as GitHub Actions secret MAVEN_GPG_PASSPHRASE."
echo "  3. Do not paste either secret into chat, issues, commits, or workflow inputs."
echo "  4. Keep a secure offline backup of the private key and passphrase."
