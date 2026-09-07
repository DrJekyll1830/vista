#!/usr/bin/env bash
# ساخت PDF از پوشهٔ کتاب.
#   ./build/build.sh full       کل کتاب
#   ./build/build.sh strategy   فقط فصل‌هایی که strategy: true دارند
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BOOK="$ROOT/book"
OUT="$ROOT/out"
EDITION="${1:-full}"

command -v pandoc  >/dev/null || { echo "pandoc نصب نیست: sudo apt install pandoc"; exit 1; }
command -v xelatex >/dev/null || { echo "xelatex نصب نیست: sudo apt install texlive-xetex texlive-lang-arabic"; exit 1; }

mkdir -p "$OUT"

# فصل‌ها به ترتیب نام فایل
mapfile -t ALL < <(find "$BOOK" -name '*.md' | sort)

CHAPTERS=()
for f in "${ALL[@]}"; do
  if [ "$EDITION" = "strategy" ]; then
    grep -qE '^strategy:[[:space:]]*true' "$f" || continue
  fi
  CHAPTERS+=("$f")
done

[ ${#CHAPTERS[@]} -gt 0 ] || { echo "هیچ فصلی برای این نسخه پیدا نشد."; exit 1; }
echo "نسخهٔ $EDITION — ${#CHAPTERS[@]} فصل"

# فیلتر Lua: بلوک‌های کد و نشانی‌ها چپ‌به‌راست بمانند
cat > "$OUT/dir.lua" <<'LUA'
function CodeBlock(el)
  return pandoc.RawBlock('latex',
    '\\begin{LTR}\\begin{verbatim}\n' .. el.text .. '\n\\end{verbatim}\\end{LTR}')
end
function Code(el)
  return pandoc.RawInline('latex', '\\lr{\\texttt{' ..
    el.text:gsub('([\\%%%$#&_{}])', '\\%1') .. '}}')
end
LUA

pandoc \
  --metadata-file="$BOOK/book.yaml" \
  --pdf-engine=xelatex \
  --lua-filter="$OUT/dir.lua" \
  -V babel-lang=persian \
  -V mainfont="Vazirmatn" \
  -V monofont="DejaVu Sans Mono" \
  -V colorlinks=true -V linkcolor=RoyalBlue -V toccolor=black \
  -H <(printf '%s\n' \
        '\usepackage{polyglossia}' \
        '\setmainlanguage{persian}' \
        '\setotherlanguage{english}' \
        '\usepackage{bidi}' \
        '\setlength{\parskip}{0.6em}' \
        '\setlength{\parindent}{0pt}') \
  -o "$OUT/vista-$EDITION.pdf" \
  "${CHAPTERS[@]}"

echo "خروجی: $OUT/vista-$EDITION.pdf"
