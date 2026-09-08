# vista-app — اسکیل Claude Code برای ساختن اپ ویستا

این پوشه یک **اسکیل** است: هر چیزی که یک عامل کدنویس لازم دارد تا یک سرویس (بات، بک‌اند، وب) را به اپ منطبق با پروتکل ویستا تبدیل کند — مانیفست، ابزارهای MCP، سند قرارداد و امضای Ed25519، تحویل، رویدادها، وکالت، مینی‌اپ — بدون نیاز به کد سکو.

نصب در پروژهٔ خودتان (مثلاً کنکوریا): کل پوشه را به `.claude/skills/vista-app/` کپی کنید؛ Claude Code با دیدن `SKILL.md` آن را هنگام کار روی یکپارچه‌سازی ویستا بارگذاری می‌کند (یا با `/vista-app` صدایش بزنید).

ساختار: `SKILL.md` (راهنمای اصلی و چک‌لیست) · `reference/` (مانیفست، قرارداد، ابزارها، رویدادها و وکالت، مینی‌اپ، نمونهٔ کنکوریا) · `lib/vista-sign.mjs` (هش و امضا، بدون وابستگی) · `lib/example-server.mjs` (اپ نمونهٔ کامل) · `scripts/conformance.mjs` (آزمون انطباق).

آزمون انطباق روی اپ مرجع ویستا (سکوی محلی روی پورت ۸۷۸۷):

```bash
node scripts/conformance.mjs http://localhost:8787/apps/irancell-demo/mcp
node scripts/conformance.mjs https://your-app.example.ir/vista/mcp --tool build_x_contract --args '{"id":"…"}'
```

نیازمندی‌ها: Node ≥ 18. اپ نمونه فقط `@modelcontextprotocol/sdk` و `zod` می‌خواهد.
