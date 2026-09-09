#!/usr/bin/env bash
# ساخت PDF از پوشهٔ کتاب.
#   ./build/build.sh
# خروجی: out/vista.pdf
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/out"
mkdir -p "$OUT"

CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"
[ -n "$CHROME" ] || { echo "مرورگر کرومیوم پیدا نشد."; exit 1; }

echo "ساخت HTML…"
python3 "$ROOT/build/mkhtml.py" "$ROOT/book" "$OUT/vista.html"

echo "ساخت PDF…"
"$CHROME" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$OUT/vista.pdf" \
  --virtual-time-budget=30000 --run-all-compositor-stages-before-draw \
  "file://$OUT/vista.html" 2>/dev/null

echo "خروجی: $OUT/vista.pdf"
