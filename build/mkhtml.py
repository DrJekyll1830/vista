# -*- coding: utf-8 -*-
"""پوشهٔ کتاب را به یک HTML آمادهٔ چاپ تبدیل می‌کند."""
import io, os, re, sys, glob, html

BOOK, OUTPUT = sys.argv[1], sys.argv[2]

PARTS = {
    "00-آغاز": None,
    "01-مقدمات": "بخش یکم — مقدمات",
    "02-ویستا": "بخش دوم — ویستا",
    "03-بانک-و-پرداخت": "بخش سوم — بانک و پرداخت",
    "04-معماری": "بخش چهارم — معماری",
    "05-مسیر-اجرا": "بخش پنجم — مسیر اجرا",
    "90-ضمائم": "ضمائم",
}

FA = "۰۱۲۳۴۵۶۷۸۹"
def fa(n): return "".join(FA[int(d)] for d in str(n))


def inline(t):
    t = html.escape(t)
    t = re.sub(r"`([^`]+)`", r'<code>\1</code>', t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![*\w])\*([^*]+)\*(?!\w)", r"<em>\1</em>", t)
    return t


def render(md):
    """زیرمجموعه‌ای از مارک‌داون که در این کتاب به کار رفته."""
    out, i, lines = [], 0, md.split("\n")
    while i < len(lines):
        ln = lines[i]

        if ln.startswith("```"):
            block = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                block.append(html.escape(lines[i])); i += 1
            i += 1
            out.append('<pre dir="ltr">%s</pre>' % "\n".join(block))
            continue

        if ln.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s:|-]+\|$", lines[i + 1]):
            head = [c.strip() for c in ln.strip("|").split("|")]
            i += 2
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in lines[i].strip("|").split("|")]); i += 1
            th = "".join("<th>%s</th>" % inline(c) for c in head)
            tb = "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r) for r in rows)
            out.append("<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>" % (th, tb))
            continue

        if ln.startswith("> "):
            block = []
            while i < len(lines) and lines[i].startswith(">"):
                block.append(lines[i].lstrip(">").strip()); i += 1
            out.append("<blockquote>%s</blockquote>" %
                       "".join("<p>%s</p>" % inline(p) for p in " ".join(block).split("  ") if p.strip()))
            continue

        m = re.match(r"^(\s*)[-*] (.+)$", ln)
        if m:
            items = []
            while i < len(lines) and re.match(r"^\s*[-*] ", lines[i]):
                items.append(inline(re.sub(r"^\s*[-*] ", "", lines[i]))); i += 1
            out.append("<ul>%s</ul>" % "".join("<li>%s</li>" % x for x in items))
            continue

        m = re.match(r"^\s*\d+\. (.+)$", ln)
        if m:
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\. ", lines[i]):
                items.append(inline(re.sub(r"^\s*\d+\. ", "", lines[i]))); i += 1
            out.append("<ol>%s</ol>" % "".join("<li>%s</li>" % x for x in items))
            continue

        if ln.startswith("### "): out.append("<h3>%s</h3>" % inline(ln[4:])); i += 1; continue
        if ln.startswith("## "):  out.append("<h2>%s</h2>" % inline(ln[3:])); i += 1; continue
        if ln.startswith("# "):   i += 1; continue          # عنوان فصل جداگانه می‌آید
        if ln.startswith("---"):  out.append("<hr>"); i += 1; continue
        if ln.startswith("<!--"): i += 1; continue

        if ln.strip():
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(
                    r"^(#|```|\||> |\s*[-*] |\s*\d+\. |---|<!--)", lines[i]):
                para.append(lines[i].strip()); i += 1
            out.append("<p>%s</p>" % inline(" ".join(para)))
            continue
        i += 1
    return "\n".join(out)


chapters, toc, ch_no = [], [], 0
for part_dir, part_title in PARTS.items():
    files = sorted(glob.glob(os.path.join(BOOK, part_dir, "*.md")))
    if not files:
        continue
    if part_title:
        chapters.append('<section class="part"><h1>%s</h1></section>' % html.escape(part_title))
        toc.append('<li class="p">%s</li>' % html.escape(part_title))
    for f in files:
        raw = io.open(f, encoding="utf-8").read()
        m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
        meta, body = (m.group(1), m.group(2)) if m else ("", raw)
        tm = re.search(r'title:\s*"(.*?)"', meta)
        title = tm.group(1) if tm else os.path.basename(f)
        ch_no += 1
        cid = "c%d" % ch_no
        chapters.append(
            '<section class="chapter" id="%s"><div class="cn">فصل %s</div><h1>%s</h1>%s</section>'
            % (cid, fa(ch_no), html.escape(title), render(body)))
        toc.append('<li><a href="#%s"><span>%s</span><b>%s</b></a></li>'
                   % (cid, html.escape(title), fa(ch_no)))

DOC = u"""<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<title>ویستا</title>
<style>
@page { size: A4; margin: 22mm 20mm 20mm 20mm; }
*{box-sizing:border-box}
body{font-family:"Noto Sans Arabic",sans-serif;font-size:10.5pt;line-height:1.95;color:#16202e;margin:0;
     text-align:justify;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3{font-family:"Noto Kufi Arabic","Noto Sans Arabic",sans-serif;line-height:1.45;
     break-after:avoid;page-break-after:avoid;text-align:right}
p{margin:0 0 .62em}
code{font-family:"DejaVu Sans Mono",monospace;font-size:.86em;direction:ltr;unicode-bidi:isolate;
     background:#eef2f8;padding:.05em .3em;border-radius:3px}
pre{font-family:"DejaVu Sans Mono",monospace;font-size:8.4pt;line-height:1.55;direction:ltr;text-align:left;
     background:#f4f7fb;border:1px solid #dde5f0;border-radius:5px;padding:.8em 1em;overflow:visible;
     white-space:pre-wrap;break-inside:avoid;page-break-inside:avoid;margin:1em 0}
blockquote{margin:1.1em 0;padding:.7em 1.1em;border-right:3px solid #c13b2f;background:#faf3f2;
     border-radius:0 5px 5px 0;break-inside:avoid;page-break-inside:avoid}
blockquote p{margin:0;font-weight:500}
table{width:100%;border-collapse:collapse;margin:1.1em 0;font-size:9.4pt;
     break-inside:avoid;page-break-inside:avoid}
th,td{border:1px solid #d5dfec;padding:.42em .6em;text-align:right;vertical-align:top}
th{background:#eef2f8;font-weight:700}
ul,ol{margin:0 0 .7em;padding-right:1.3em}
li{margin-bottom:.3em}
hr{border:0;border-top:1px solid #dde5f0;margin:1.6em 0}
strong{font-weight:700}

.cover{height:247mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
.cover .t{font-family:"Noto Kufi Arabic",sans-serif;font-size:56pt;font-weight:700;margin:0}
.cover .s{font-size:14pt;color:#46566f;margin-top:.5em;line-height:1.7}
.cover .r{width:70mm;height:3px;background:#c13b2f;margin:1.4em 0}
.cover .d{margin-top:auto;font-size:10pt;color:#6b7b96}

.toc{page-break-after:always}
.toc h1{font-size:22pt;margin:0 0 1.2em}
.toc ul{list-style:none;padding:0;margin:0}
.toc li{margin:0}
.toc li.p{font-family:"Noto Kufi Arabic",sans-serif;font-weight:700;font-size:11.5pt;
     margin:1.1em 0 .45em;color:#c13b2f}
.toc a{display:flex;justify-content:space-between;gap:.6em;text-decoration:none;color:#16202e;
     font-size:10pt;padding:.16em 0;border-bottom:1px dotted #ccd6e4}
.toc a b{font-weight:400;color:#6b7b96}

.part{height:190mm;display:flex;align-items:center;page-break-before:always;page-break-after:always}
.part h1{font-size:30pt;margin:0;color:#c13b2f;border-right:4px solid #c13b2f;padding-right:.5em}

.chapter{page-break-before:always}
.chapter .cn{font-size:9pt;color:#6b7b96;letter-spacing:.08em;margin-bottom:.3em}
.chapter h1{font-size:21pt;margin:0 0 1.1em;padding-bottom:.4em;border-bottom:2px solid #16202e}
.chapter h2{font-size:13pt;margin:1.6em 0 .5em;color:#16202e}
.chapter h3{font-size:11pt;margin:1.2em 0 .4em;color:#46566f}
</style></head><body>

<div class="cover">
  <h1 class="t">ویستا</h1>
  <div class="r"></div>
  <div class="s">سوپر اپلیکیشن هوش‌مصنوعی‌محور<br>و لایهٔ قرارداد</div>
  <div class="d">سند مفهوم و معماری · شهریور ۱۴۰۵</div>
</div>

<div class="toc"><h1>فهرست</h1><ul>@@TOC@@</ul></div>
@@BODY@@
</body></html>"""

doc = DOC.replace("@@TOC@@", "\n".join(toc)).replace("@@BODY@@", "\n".join(chapters))
io.open(OUTPUT, "w", encoding="utf-8").write(doc)
print("  %d chapters" % ch_no)
