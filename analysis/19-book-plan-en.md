# The Book — Plan Before Writing

Short doc, as you asked, so errors surface now rather than after forty chapters.

---

# 1. What the book is

Persian only. One source tree, two build targets: the full book, and a strategy edition that drops the architecture part and the technical annexes (`strategy: true` in each chapter's frontmatter).

**Primary reader:** Irancell leadership. **Secondary:** Bank Sina, and whoever they hand it to for technical review. It has to survive both without becoming two documents.

**It ends with an ask.** That ask also appears on page one, because a reader who stops after two pages must still see it.

---

# 2. Structure — 41 chapters, 6 parts

`S` = also in the strategy edition.

**بخش ۰ — آغاز**
- `00-01` خلاصهٔ مدیریتی — one page: what, why now, what I need `S`
- `00-02` راهنمای مطالعه — parts, audiences, and the Core / Expansion / Horizon split `S`

**بخش ۱ — مقدمات** — concepts, for a reader who knows none of this
- `01-01` پایان دوران اپلیکیشن‌های جدا — apps → assistants; the trend and its evidence `S`
- `01-02` دستیار چیست و چه نیست — chatbot vs assistant; **کارپرداز و مدیرعامل** `S`
- `01-03` قابلیت و MCP — the capability abstraction, in plain language `S`
- `01-04` سوپر اپلیکیشن: تعریف درست — the mosaic critique; one interaction model, payment, messaging `S`
- `01-05` قرارداد — **the central chapter.** draft → contract → signatures → events. Everything later refers back `S`
- `01-06` هوشمندی و اعتماد — the thesis; پمپاژ هوش `S`

**بخش ۲ — ویستا**
- `02-01` چشم‌انداز `S`
- `02-02` تجربهٔ کاربری — Jakob's Law + Eyal; ChatGPT for the chat, Telegram for the list; one new object in a familiar frame `S`
- `02-03` بات و مینی‌اپ — the integration unit; `/start` as consent `S`
- `02-04` لایهٔ سیستمی — the six apps; قرارداد آغاز; exempt from the prompt, not from the contract; **and the two we deliberately did not build** `S`
- `02-05` مجوزها — Android-shaped, with financial authority separated `S`
- `02-06` پرداخت و کیف پول — licensing path; the bank as invisible party `S`
- `02-07` اطلاع‌رسانی و فوروارد به دستیار — why no notifications centre; forwarding as the bridge `S`
- `02-08` اشتراک‌گذاری قرارداد و لایهٔ اجتماعی — Chen; the atomic network; why not a messenger `S`
- `02-09` ویترین و اکوسیستم — discovery by intent; verify the company once, blue tick `S`
- `02-10` هزینهٔ یکپارچه‌سازی و SDK — the real adoption barrier; port your Telegram bot `S`
- `02-11` پمپاژ هوش `S`
- `02-12` مدل درآمد — the streams; sponsorship rules; ad-free subscription `S`
- `02-13` رقبا و مزیت پایدار — Bale, Rubika, Ap, Eitaa, Snapp; AI is why now, operator assets are why it lasts `S`
- `02-14` امنیت و اعتماد — **flagship.** reads free, writes are contracts, the assistant never signs `S`
- `02-15` دسترس‌پذیری و سلامت اپ‌ها `S`

**بخش ۳ — بانک و پرداخت**
- `03-01` چرا بانک، چرا حالا `S`
- `03-02` بانک به‌عنوان ریل پرداخت — invisible as the rail, named when it is the counterparty `S`
- `03-03` امضای دیجیتال، سیم‌کارت و پلتفرم — the five rungs; web vs Android; OMAPI and carrier privileges `S`
- `03-04` برنامهٔ مستقل نوسازی بانک — resilience; explicitly off Vista's critical path

**بخش ۴ — معماری** (full edition only)
- `04-01` نمای کلان
- `04-02` کنشگران و هویت — person, app, assistant; PKI
- `04-03` مسیر خواندن و نوشتن — the boundary; the processor
- `04-04` مدل قرارداد — the full spec: versions, projections, quorum, events, style
- `04-05` اپ‌به‌اپ و API Gateway — the unification
- `04-06` استانداردها — MCP and MCP Apps; the OpenAI interface; Telegram as vocabulary
- `04-07` جریان داده و حریم خصوصی — MCPs as leaves; per-app data permissions; sandbox without network; sealed inference
- `04-08` لایهٔ مدل — two partners, open weights, API → self-hosting, bring your own key
- `04-09` رصدپذیری، ممیزی و اختلاف
- `04-10` اصول معماری — the numbered principles, restated

**بخش ۵ — مسیر اجرا**
- `05-01` نقشهٔ راه — phases ۰ to ۳; اثبات · مقیاس · گشایش `S`
- `05-02` مسیر حقوقی و نظارتی — the licence list, as Irancell's obligation `S`
- `05-03` ریسک‌ها — risk and answer, separated `S`
- `05-04` مسئولیت و اختلاف — terms of use as the floor, the signed contract as the real defence, remediation fund `S`
- `05-05` اختیارات و ساختار — **the ask.** Option A / Option B, first person singular `S`

**ضمائم**
- `90-01` واژه‌نامه `S`
- `90-02` کارهای باقی‌مانده — open design questions, stated openly
- `90-03` افق‌های دور — وکالت, tokenised assets, self-executing contracts, voice, user-to-user chat

---

# 3. Decisions baked in — check this list

Everything below goes in as settled. **If any line is wrong, say so now.**

**Contract.** A draft binds nobody; it becomes a contract when every field is filled · the app composes and signs first, once per version · any change makes a new version and voids prior signatures · the user signs last · each party signs only what it can see · the contract *is* the instruction, and nothing executes that is not in the signed text · post-contract events (block → deduct → deliver → cancel) are signed events shown as replies inside that app's chat · the app supplies palette and logo, the platform owns layout · fees are always recorded, visibility is a per-template choice.

**Who is a party.** The user, the counterparty app, other users. **Not** Vista. **Not** the payment provider. Bank Sina is named only when it sells a product rather than when it moves money.

**Security.** Reads are free · writes are contracts · the assistant drafts and never signs · execution happens where the assistant cannot reach · MCPs are leaves, one orchestrator · a partner's AI runs as sealed inference and its output is data, never instruction · per-app data permissions declared at admission · the model may compute in a sandbox with no network access.

**Signature.** Five rungs — authenticated request · OTP · device key · SIM key with PIN · in person. Rungs ۱–۲ produce a record, ۳–۴ produce non-repudiation. Ceilings ladder with rungs. Web reaches rung ۳; **rung ۴ is Android-only, and only the SIM issuer can enable it.**

**System layer.** Six apps — دستیار · ویترین · مالی · قراردادهای من · پشتیبانی · تنظیمات · a signed قرارداد آغاز at first run · exempt from the permission prompt, never from the contract · the set is small, fixed and published · no notifications centre and no contacts app, with the reasons given.

**Apps.** Anyone may add any app by address · verification is once per company, not per version or per service · only a verified app, with the blue tick, may request financial authority · health is probed by the platform and shown in the list, and an unavailable app is greyed out and its contracts cannot be signed.

**Business.** Telecom value first, پمپاژ هوش second, transaction fee third, ad-free subscription fourth · never a percentage of marketplace turnover · payment is easy rather than compulsory, and an app that brings its own gateway is not fought · the answer is never sold, only presence beside the answer, with the three tests.

**Model.** Two Chinese partners · open weights mandatory · API first, self-hosting later · a mid-size model, stated not defended · bringing your own key means you pay us nothing.

**Plan.** Phase ۰ prerequisites · phase ۱ Konkooria plus Irancell self-service at rungs ۱–۲ · phase ۲ the subscriber base, rungs ۳–۴, وکالت, stored value · phase ۳ open addition, marketplace revenue, in-app chat behind licensing, voice · legal work is Irancell's obligation · liability is disclaimer as floor, signed contract as the real defence, remediation fund in year one.

---

# 4. Editorial rules

**No archaeology.** Nothing argues against a position the reader has never seen, and nothing explains why something is absent. The test: is the thing being argued against something the reader knows about *the world*, or only from our conversation?

**«قرارداد» only** — «سند» does not appear. **«دستیار»** for the user-facing assistant; «عامل» only where the technical distinction matters.

**Persian conventions.** Every paragraph opens with a Persian word, and «به واقع» appears only where a Latin term would otherwise start it · Persian digits in prose, Latin digits in code · Latin script reserved for MCP, API, SSO, HSM · terminology fixed by the glossary and applied mechanically.

**Register.** First person plural throughout; first person singular in `05-05`, where the shift itself signals that the chapter is the ask.

**Shape.** Each chapter opens with two or three lines saying what it argues and closes with a short summary, so a reader who skims only openings and closings still receives the argument.

**Numbers sit beside the claim they support**, never in a wall.

---

# 5. Eight assumptions — correct me now

1. **Length.** Roughly ۱٬۵۰۰–۲٬۵۰۰ Persian words per chapter, so ۶۰–۹۰ thousand words overall. A real book. Say if you want it shorter.
2. **وکالت** becomes a horizons annex rather than a chapter, since it left phase ۱.
3. **The bank part is four chapters.** It is a jointly funded programme, so you may want more.
4. **Competitor figures go in** — Bale ~۳۱M installs, Rubika ~۳۷M users, Snapp ~۷۰M registered, Eitaa's ۲٪ — each footnoted as needing re-verification before print.
5. **Konkooria's ۲۳٬۰۰۰ appears**, framed as the proving network, with Irancell self-service as the scaling channel.
6. **The shared shareholder** — that Bonyad Mostazafan sits inside Irancell's ownership and also controls Bank Sina — **I plan to leave out.** It is real and it explains why the bank agreed, but in a document that will circulate it adds nothing and travels badly. Tell me if you want it in.
7. **Snapp's percentage is omitted.** Public sources support only "MTN and Irancell together about ۶۰٪", so I will write "a significant minority holding" unless you give me the real figure.
8. **Writing order.** `01-05` قرارداد and `02-14` امنیت first, since everything refers to them; then the rest of parts ۱ and ۲; then ۳ and ۵; architecture last.

---

# 6. Process

I write chapter by chapter and commit each one, so you can read and comment as they land instead of waiting for the whole book.

I will write the two chapters in point ۸ and then stop for your reaction before continuing. If the voice is wrong, better to find out after two chapters than after twenty.
