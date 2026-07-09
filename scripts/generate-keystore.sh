#!/usr/bin/env bash
# Run this ONCE locally to generate a signing keystore.
# Then base64-encode it and store as a GitHub Secret:
#   base64 -w 0 ovelin-release.keystore > /tmp/keystore_b64.txt
# Add to repo secrets:
#   KEYSTORE_BASE64   = contents of /tmp/keystore_b64.txt
#   KEYSTORE_PASSWORD = (choose a strong password)
#   KEY_ALIAS         = ovelin
#   KEY_PASSWORD      = (same or different password)

set -e

KEYSTORE="ovelin-release.keystore"
ALIAS="ovelin"
STORE_PASS="${1:-ovelin2024}"

keytool -genkey -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 36500 \
  -dname "CN=Ovelin Mall,OU=Mobile,O=Ovelin,L=Khartoum,S=Sudan,C=SD" \
  -storepass "$STORE_PASS" \
  -keypass "$STORE_PASS"

echo ""
echo "Keystore generated: $KEYSTORE"
echo "Now run:"
echo "  base64 -w 0 $KEYSTORE | pbcopy   # macOS"
echo "  base64 -w 0 $KEYSTORE            # Linux — copy the output"
echo ""
echo "Then add to GitHub Secrets:"
echo "  KEYSTORE_BASE64  = <paste>"
echo "  KEYSTORE_PASSWORD = $STORE_PASS"
echo "  KEY_ALIAS = $ALIAS"
echo "  KEY_PASSWORD = $STORE_PASS"
