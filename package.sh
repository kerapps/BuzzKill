#!/usr/bin/env bash
set -euo pipefail

OUTFILE="linkedout.zip"

rm -f "$OUTFILE"

zip -r "$OUTFILE" \
  manifest.json \
  background.js \
  translator.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  popup.css \
  icons/icon16.png \
  icons/icon48.png \
  icons/icon128.png

echo ""
echo "Created $OUTFILE"
echo ""
unzip -l "$OUTFILE"
