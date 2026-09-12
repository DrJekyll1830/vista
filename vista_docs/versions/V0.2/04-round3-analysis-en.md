# Vista V0.2 — Round 3 Analysis

**Input:** your COMMENTs on `03-round2-analysis-en.md`.

Five things. One where I was wrong, one architecture question that deserves a real answer rather than a defence of my own diagram, and three consequences.

---

## 1. Deposit — I was wrong, and the useful thing is what falls out

You're right. واریز needs card, CVV2, expiry and رمز پویا, none of which the assistant has or can get. The most it can produce is a payment link the user pays outside the app. My "the assistant can top up the card" scenario doesn't exist. Dropped, and the pool is خرید + برداشت as you said.

**But the same fact breaks something in the book, and it's a headline claim.** 02-07 says:

> «پرداخت داخل خودِ گفت‌وگو انجام می‌شود… هیچ صفحهٔ واسطی وجود ندارد.»

Funding the wallet is precisely an intermediate page, at a PSP, outside our app. So the claim needs splitting into the two halves that are both true:

> **خرج کردن داخل گفت‌وگو انجام می‌شود و هیچ صفحهٔ واسطی ندارد. پر کردن کیف پول یک بار از درگاه بانکی می‌گذرد، چون رمز پویا فقط آنجاست.**

That's a better sentence than the current one, because the second half is the reason the first half is safe: the money entering the wallet passed a check we couldn't perform ourselves.

**And واریز comes out of the rung table.** I had it at «کف پله ۱». Wrong framing — the ladder isn't what secures it. The honest row is «خارج از نردبان ما · احراز از سمت PSP و شاپرک». Which also means the assistant is structurally incapable of funding the wallet — worth stating in 02-15 as a fact about the architecture, not a policy we enforce.

---

## 2. «چرا دروازهٔ قابلیت را حذف نکنیم؟»

Mostly you're right, and the answer is better than either "keep both" or "remove ours."

Look at what دروازهٔ قابلیت actually does in 04-01/04-03. Six jobs. Four of them — routing, health probing, rate limiting, protocol — are generic API-gateway work that یلوهاب will do anyway. Building them twice is waste and I shouldn't have defended it.

Two of them cannot move, and for one reason: **they depend on Vista's consent state and Vista's identity, which are facts یلوهاب has no business holding.** یلوهاب serves the whole group, not just us. If our data-permission model and our on-behalf-of signing live inside it, then the enforcement behind every claim in the security chapter sits in another team's codebase and another team's release cycle.

So: **delete دروازهٔ قابلیت as a box.** Give four jobs to یلوهاب. The remaining two fold into a component that already exists in the diagram — **هویت و مجوزها**. Net result is one box fewer in 04-01, not one more.

```
دستیار ──▶ هویت و مجوزها ──▶ یلوهاب ──▶ اپ
            مجوز داده          مسیر · اعتبارنامه
            گواهی «به نیابت از»  نرخ · سلامت · پروتکل
```

The round-2 invariant survives unchanged: یلوهاب سمت اپ، ماژول ما سمت کاربر. And so does 02-10 — since هویت و مجوزها isn't a transport, long-tail self-hosted apps can be reached without یلوهاب onboarding, so «افزودن اپ با آدرس» doesn't turn into a queue at another company.

**The part worth noticing.** There is a version where یلوهاب does all six, and it's coherent — one gateway, fewer hops, one team, and it was Irancell's original ask in 04-05. It works on exactly one condition: that I can specify the interface یلوهاب implements and refuse a delivery that doesn't match it. That is verbatim two of the items in 05-05's option ب.

So this isn't only an architecture question. **It's the first concrete test of the authority ask**, and it's a good one to put on the table early, because it's small, technical, and answerable now — which makes it a cheap way to find out whether that authority is real before anything expensive depends on it.

---

## 3. Environments — corrected

I had this wrong too. Your model is three, not two, and the difference matters:

| | dev/test | استیج | پروداکشن |
|---|---|---|---|
| قابلیت‌ها | **می‌تواند جلوتر از نقشهٔ راه باشد** | **دقیقاً برابر پروداکشن** | نقشهٔ راه |
| پول | غیرواقعی | غیرواقعی | واقعی |
| اپ‌ها | ساختگی | همه در حالت استیج | پذیرفته‌شده |
| برای چه | ساخت و آزمون داخلی | نمایش · یکپارچه‌سازی شریک | کاربر واقعی |

> **استیج هیچ‌وقت از پروداکشن جلو نمی‌زند. تنها تفاوتشان پول است. آنچه جلو می‌زند dev/test است.**

Two consequences.

**My round-2 reconciliation was wrong.** I wrote that delegated signing "exists in stage now, reaches production in phase ۲." Under no-drift that's not available. If auto-approve is phase ۲, stage doesn't have it either — only dev/test does. And per your comment the phasing itself is still open: phase ۱ if we can afford it, phase ۲ otherwise. So the book should say phase ۲ and the demo should show dev/test, or we move it to phase ۱ deliberately. Not both.

**No-drift makes stage stronger as an on-ramp, not weaker.** A partner who integrates against stage is integrating against production behaviour exactly — no surprises at cutover. That's the sentence for 02-11: **یکپارچه‌سازی با استیج، یکپارچه‌سازی با پروداکشن است؛ فقط پولش واقعی نیست.** No commercial agreement, no licence, no real money, and nothing to redo afterwards.

**One risk to name once.** "Stage is on production" means the isolation is logical, not physical — same infrastructure, same build. That's the classic place where test money becomes real money. The invariant has to live in the ledger and the processor: **یک قرارداد استیج هیچ‌وقت توسط پردازشگر پروداکشن اجرا نمی‌شود**, and stage records never enter the production دفتر. One rule, enforced in one place.
**COMMENT**: delegated signing goes to phase 2. not even in test/dev for now.

---

## 4. Invisible write tools — the consequence, stated once

Taken: users can't tell reads from writes, so we don't show them. That's decided.

What it means, so the book says it accurately rather than implying a control we don't have. Three candidate controls existed on light MCP writes: platform classification (removed round ۱), user visibility and revocation (removed now), and the developer guidance document. **Only the third remains.** It isn't a supporting document any more — it is the entire control surface.

That has one practical consequence and one honesty consequence.

**Practical:** it should be published, versioned, and acknowledged as part of احراز شرکت. An unread internal page is not a control. This costs nothing extra now.

**Honesty:** 02-15 and 90-02 should say what's true — that on non-financial writes we rely on the app's judgement and on the record, not on prevention. The book already earns credit for this kind of admission elsewhere (04-10 §۱۷), and it's better than the alternative, where a careful reader works out for themselves that nothing is stopping an app here.

Two things do survive and they're both ours and both invisible: **ثبت در دفتر** and **محدودیت نرخ**. And revocation still exists, at app granularity — the user removes the app, which is the only lever that makes sense if they can't see the individual tools.
**COMMENT**: زیاد به این چیزها توی کتاب نپرداز

---

## 5. Product lines, not companies — and what that costs option ب

You think they're product lines under یلوتک. That changes 05-05 more than it looks.

When I thought they were four companies, option ب was "CEO of one of them" — and a delivery commitment between two companies is a contract with a counterparty, an owner, and a date. **Between two product lines of the same company, a delivery commitment is internal roadmap negotiation.** There is no boundary to point at when it slips, and no document that means anything.

The chapter's option ب currently rests on «تعهد مکتوب تحویل برای هر وابستگی». Under a product-line structure that sentence needs the escalation path and the interface authority behind it **more** than before, not less, because nothing else is doing that work. The chapter already says where option ب fails — «بدون سه بند آخر… تبدیل می‌شود به پاسخگو بودن در برابر نتیجه‌ای که به وعدهٔ دیگران بند است» — and a product-line structure is exactly the condition that makes those three clauses load-bearing.

Two edits follow:

**Write the ask in authority, not title.** The chapter mostly does this already; keep it, and make each item explicit about whether it is *held* or *delegated in writing*. A product owner does not hold budget or hiring authority by default; if option ب needs them, they must be delegated by یلوتک's CEO in writing, and that sentence belongs in the chapter.

**And this is the argument for keeping both options neutral**, which you already decided. Under a product-line structure the two options are further apart than they were: الف is running the company, ب is running one of four lines while depending on the other three. Stating no preference is the right call, and now it has a reason attached.

Also settled: **مالی is built and operated by the یلوبانک team** — so it's a delivery dependency in 05-05, not my scope. That makes one of the six system apps entirely someone else's, which the 02-04 edit already has to disclose.

---

## Naming — settled

Product stays **ویستا**. Corporate structure gets one paragraph in 00-01. Persian names, English in parentheses on first mention only:

> ایرانسل › **ویستا (Vista)**، بازوی سرمایه‌گذاری › **یلوتک (YellowTech)**، بازوی فنی › چهار خط محصول: **یلواپ (YellowApp)** · **یلوبانک (YellowBank)** · **یلوهاب (YellowHub)** · **یلوساین (YellowSign)**

One sentence needed in that paragraph, or it reads as a contradiction: **آنچه کاربر نصب می‌کند ویستا نام دارد؛ یلواپ نام خط محصولی است که آن را می‌سازد.**

---

## Edit list — delta from round ۲ only

| # | Change |
|---|---|
| ۴ | واریز از جدول پله بیرون می‌رود — «خارج از نردبان ما» · استخر روزانه فقط خرید و برداشت |
| ۶ | 02-07: ادعای «هیچ صفحهٔ واسطی» به دو نیمه تقسیم می‌شود · مالی را تیم یلوبانک می‌سازد |
| ۹ | **دروازهٔ قابلیت حذف می‌شود** · مجوز داده و گواهی «به نیابت از» به «هویت و مجوزها» منتقل می‌شوند · بقیه به یلوهاب — 04-01, 04-03, 04-05, 90-01 |
| ۱۰ | سه محیط، نه دو · استیج بدون drift · جداسازی دفتر و پردازشگر |
| ۲ب | راهنمای توسعه‌دهنده تنها کنترل باقی‌مانده است — منتشرشده و بخشی از احراز · 02-15 و 90-02 صریح باشند |
| ۱۱ | خطوط محصول نه شرکت‌ها — 05-05 اختیارها را «در اختیار» یا «تفویض‌شدهٔ مکتوب» تفکیک کند · نام‌های فارسی با لاتین در پرانتز · ویستا نام محصول می‌ماند |

**Open:** whether auto-approve lands in phase ۱ or ۲ — that's a cost question, not a design one, and it's the only thing left holding up 05-01 and 02-06.
