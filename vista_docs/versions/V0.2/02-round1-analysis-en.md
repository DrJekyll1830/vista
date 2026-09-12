# Vista V0.2 — Round 1 Analysis

**Input:** `01-transcription.md` — ten voice messages, 2026-09-09, 20:17–20:48.
**Against:** the book as it stands (46 chapters, six parts).

Nine changes. Seven are additive and fit the existing model without strain. **Two of them cut into the load-bearing wall** — the claim that the assistant cannot write. Those two are Part I, and they need a decision from you before I touch the book, because the way we word them determines whether the security chapter survives intact or gets rewritten down to something weaker than it needs to be.

I think both can be landed without losing the argument. But not by pretending nothing changed.

---

# Part I — The two changes that touch the security model

## 1. Delegated signing (وکالت به دستیار)

**What you asked for.** The user can sign a contract inside the assistant app that authorises the assistant to sign on their behalf, at whatever rung they choose. Granting requires one rung above the rung being granted. Since rungs ۳ and ۴ don't exist yet, only rung-۱ delegation is possible today, granted with OTP (rung ۲). Rung-۲ actions — transfers, purchases above the daily threshold — cannot be delegated, because granting them would need rung ۳.

**First, the good news: most of this is already in the book.** Chapter 02-06 وکالت already says «دادن وکالت یک پله امضای بالاتر می‌خواهد از استفاده کردن از آن» and already carries six rules: mandatory ceiling and expiry, no sub-delegation, one-sided revocation, one visible list, notification on every use. What's new is not the rule — it's **who the وکیل can be.** Until now it was always an app. Now it can be the assistant.

That's a much smaller edit than it first looks, and it gives us the right frame: **وکالت به دستیار is a new species of an existing concept and inherits all six rules unchanged.**

**Now the hard part.** In voice message 4 you say: «احتمالاً باید اون کلید سطح یک کاربر رو در اختیار دستیار بذاریم تا دستیار بتونه به نیابت از کاربر اون امضای سطح یک رو انجام بده» — and then, correctly, «این معماری باید یکم شفاف‌تر بشه». Here is the clarification.

There are two ways to build this and they are not equivalent.

### Option A — give the model the rung-۱ credential

The assistant process holds the credential and signs. Simplest to build. It kills these sentences outright:

- 02-15: «دستیار نمی‌تواند بنویسد. پس به‌خطر افتادنِ دستیار نمی‌تواند به نوشتن ختم شود.»
- 04-03: «هیچ زنجیره‌ای از رویدادها وجود ندارد که با به‌خطر افتادن دستیار شروع شود و به یک نوشتن ختم شود.»
- 04-10 §۱: «اگر روزی برای راحتی چیزی به دستیار داده شود که به آن نزدیک شود، بقیهٔ این کتاب بی‌اعتبار است.»

There is a second problem specific to rung ۱. Rung ۱ is defined as «درخواستی که از داخل برنامه و با هویت احرازشدهٔ کاربر می‌آید» — it is not a separate key, it's the session. Handing the model "the rung-۱ key" means handing it the session token, which is strictly worse than handing it a signing key: it can then do everything the session can do, not just sign within a mandate.

### Option B — the auto-signer sits beside the client, not inside the model — **recommended**

Nothing about the assistant changes. It still reads, still asks the app to build the contract, and the app-signed contract still arrives at the client. What changes is what the client does next:

```
قرارداد امضاشده توسط اپ  ──▶  کلاینت
                                 │
                    آیا وکالت معتبری این قرارداد را پوشش می‌دهد؟
                    (اپ · نوع قرارداد · مبلغ · سقف باقی‌مانده · انقضا)
                                 │
              ┌──────────────────┴──────────────────┐
             بله                                   خیر
              │                                     │
   امضا بدون پرسیدن،                        قرارداد به کاربر
   اطلاع‌رسانی به‌جای پرسش                  نشان داده می‌شود
              │                                     │
              └──────────────────┬──────────────────┘
                                 ▼
                            پردازشگر
```

The mandate check is deterministic code sitting on the signing path. The model is not in it, cannot reach it, and cannot argue with it. The processor already checks سقف and انقضا (04-03), so most of this exists.

**What this costs us, stated honestly.** The absolute claim weakens to a bounded one:

> **بدترین کاری که دستیارِ کاملاً به‌خطر‌افتاده می‌تواند بکند، مصرف سقف وکالتی است که کاربر خودش با OTP امضا کرده — و نه یک ریال بیشتر.**

That is exactly the claim the book already makes for app mandates in 02-06, so we are not introducing a new class of risk; we are extending an accepted one to a new holder. And the strongest half of the original claim survives untouched: **there is still no path to an unbounded write.** I'd keep that distinction explicit in 02-15, because it's the difference between "we bounded the damage" and "we lost the argument."

**Option B keeps «کلید امضا هیچ‌وقت دست دستیار نیست» literally true.** Option A doesn't. That sentence is worth real money in a room with a regulator, and Option B costs almost nothing to build. This is the recommendation. **COMMENT**: OK, agreed

### Two new rules this forces, and they are not optional

Voice message 7 makes the daily rung-۱ threshold user-configurable. Combine that with a rung-۱ mandate and there is a hole: raise the threshold from ۱۰ to ۱۰۰ million and the existing mandate silently covers ten times more. So:

> **۱. هیچ وکالتی نمی‌تواند وکالت تازه بدهد، سقف وکالت موجودی را بالا ببرد، یا سیاست امضا را عوض کند.**
>
> **۲. سقف وکالت و آستانهٔ پله دو عدد مستقل‌اند. بالا بردن هر کدام، خودش پلهٔ بالاتر می‌خواهد.**

Without those two, an injected assistant raises its own ceiling and the bound is decorative. **COMMENT**: there is no such risk because raising the ceiling needs one upper rung.

### Scope question I need you answered

Your document-MCP example (comments, edits) suggests the mandate should cover non-financial writes too. But voice message 6 says those can now be plain MCP tools, which means they never become contracts and never need a mandate at all. So: **is the assistant mandate scoped to purchases up to a ceiling, or to "any rung-۱ contract"?**

My recommendation: **scoped**, per app + per contract type + ceiling + expiry — never a global "all rung-۱ contracts." A global rung-۱ mandate is exactly the unbounded-approval failure mode that 02-06 already cites as the reason the rules are strict. **COMMENT**: any rung 1 contract.

### Phasing changes

02-06 currently says «این قابلیت در نسخهٔ نخست نیست و در فاز دوم می‌آید». Under this change, **وکالت به دستیار at rung ۱ moves into phase 1** while **وکالت به اپ stays in phase 2**. 05-01 نقشهٔ راه needs the same split. This is defensible — the assistant mandate is bounded by a ceiling the user set with an OTP, and the assistant is ours, whereas an app mandate hands authority to a third party — but it should be argued in the text, not slipped in. **COMMENT**: we'll ship them together in phase 2

---

## 2. Writes through MCP are no longer categorically forbidden

**What you asked for.** No blanket ban. An app may expose harmless writes as MCP tools and let the assistant perform them. Anything with a financial charge — anything moving the user's money through our wallet — stays contract-only. Editing a document in a document app is a write with no financial charge, so if the app decides to expose it, it can.

**What this contradicts, precisely:**

- 01-03: «دستهٔ دوم اصلاً به این شکل در دسترس نیست»
- 04-06: «هیچ ابزاری که مستقیماً چیزی را عوض کند منتشر نمی‌شود»
- 02-15, second of the four sentences: «نوشتن قرارداد است»

The four sentences are the most quoted thing in the book. They need rewording, not deletion. **COMMENT**: yes, so do the rewording

### The new boundary

The old line was **read vs. write**. That line was clean but wrong — it forces a contract-and-signature ceremony onto "add a comment to my document," which nobody wants, and it makes the platform look naive to any developer who reads it. The new line is **consequence**:

| دسته | چیست | مسیر |
|---|---|---|
| **خواندن** | چیزی را عوض نمی‌کند | آزاد، از دروازهٔ قابلیت |
| **نوشتن سبک** | فقط وضعیت داخل خودِ اپ را عوض می‌کند · بار مالی ندارد · تعهدی میان طرف‌ها نمی‌سازد · اپ آن را برگشت‌پذیر اعلام کرده | ابزار MCP، مشروط به مجوزی که کاربر هنگام استارت به همان اپ داده |
| **نوشتن اثرگذار** | پول جابه‌جا می‌کند، تعهد می‌سازد، یا برگشت‌ناپذیر است | فقط قرارداد |

### One thing I'd push back on, then implement as you asked

You said «این رو باید در اختیار خود اپ بذاریم که چه چیزی رو میزاره توی ام سی پی». I'd narrow that: **the app declares, the platform classifies, and the platform can override.** Two reasons.

The money boundary is already structural and safe — an MCP tool has no path to our wallet, so an app cannot misclassify its way to the user's money even if it tries. That half needs no policing.

The non-financial half is where the risk actually is, and it isn't about money: it's about irreversibility. "Delete all my documents," "cancel my reservation," "send this message to my contacts" are all writes with no financial charge and real consequence. An app that misjudges — carelessly, not maliciously — turns prompt injection from a contained problem into an exploitable one, because now a hostile app's response can induce the assistant to call *another* app's write tool. Today that's impossible; after this change it isn't.

So the floor: light writes are **declared** by the app, **granted** by the user as a named permission at start (a new row in the 02-05 list — «ویرایش به‌جای من در این اپ»), **revocable**, **rate-limited**, **logged in دفتر**, and **surfaced to the user** at least as a digest. The app chooses freely inside that box; the platform owns the box.

If you'd rather the app be the sole judge, say so and I'll write it that way — but I'd want the risk named in 90-02 rather than unstated. **COMMENT**: the app is the sole judge. we should write down a guidance document for app developer  and tell them what should not be in MCP and why and what is the trade off.

### The four sentences, rewritten

Current:

> خواندن آزاد است. · نوشتن قرارداد است. · دستیار قرارداد را می‌آورد و هیچ‌وقت امضا نمی‌کند. · اجرا جایی انجام می‌شود که دستیار به آن دسترسی ندارد.

Proposed:

> **خواندن آزاد است.**
> **هر چه پول یا تعهد در آن باشد، قرارداد است.**
> **کلید امضا هیچ‌وقت دست دستیار نیست.**
> **اجرا جایی انجام می‌شود که دستیار به آن دسترسی ندارد.**

Sentence two absorbs change 2. Sentence three absorbs change 1 under Option B and stays literally true. Sentences one and four are untouched.

---

# Part II — Model changes that fit without strain

## 3. Any contract is a start (استارت ضمنی)

Signing a contract with an app is itself a start. From that moment the app may send notifications — order delivered, cancelled, ticket issued as a file in reply to the contract. No explicit /start needed. The user can revoke at any time. Anything beyond notification is a separate permission contract.

This is right, it matches Telegram's start-with-parameter, and it removes a step nobody wanted. Three consequences to write down:

**The permission disclosure moves into the contract panel.** 02-10 promises «پیش از نصب ببیند هر اپ چه مجوزهایی می‌خواهد». That promise now has to be kept inside the signature panel for a first contract — a band reading «این اولین قرارداد شما با اسنپ‌فود است» plus the one implied permission. One line, not a second wall; a wall in front of a food order is the thing this change was meant to delete.

**02-03's guarantee survives, slightly weaker.** «اپ‌ها نمی‌توانند سراغ کاربری بروند که سراغشان نرفته» still holds — the user signed. But the user may now be reachable by an app they never chose by name, because the assistant chose it. Worth one honest sentence rather than leaving it for someone to find. **COMMENT**: the name of the backend app will always be visible in any contract.

**Notification permission outlives the contract.** Once the food is delivered and the contract is settled, the permission persists until revoked — that's what "revocable" implies. It belongs in the app's settings page and in «قراردادهای من» alongside every other permission. **COMMENT**: True

**Chapters:** 02-03 (rewrite «استارت، همان قرارداد اول است» → «هر قراردادی یک استارت است»), 02-05, 02-08, 02-10, 90-01 (استارت definition).
**COMMENT**: remember that non verified apps cant do financial works via our wallet. so the assistant should not suggest them for financial works at all.
## 4. The rung depends on where the money lands, not only how much

Voice messages 8 and 9 together give a rule the book doesn't have yet, and it's a good one:

> **پله را مقصد پول تعیین می‌کند، نه فقط مبلغ. هر جا پول می‌تواند از سامانه خارج شود و به دست کسی جز خودِ کاربر یا یک اپِ احرازشده برسد، پله بالاتر می‌رود.**

| مقصد پول | نمونه | کف پله | یادداشت |
|---|---|---|---|
| ورود پول به سامانه (واریز) | شارژ کیف پول از کارت خودِ کاربر | ۱ | مالکیت کارت را PSP و شاپرک چک می‌کنند، نه ما |
| اپِ احرازشده (خرید) | سفارش غذا، بسته، قبض | ۱ تا آستانهٔ روزانه، بالاتر از آن ۲ | آستانه قابل تنظیم — تغییر ۷ |
| حساب بانکی خودِ کاربر (برداشت) | برداشت به شبای خودِ کاربر | ۱ | چون مقصد به نام خودِ کاربر تأیید می‌شود |
| کیف پول کاربر دیگر (انتقال) | انتقال وجه، تقسیم صورتحساب | ۲ | سقف به‌مراتب پایین‌تر از برداشت |
| شخص ثالثِ غیر اپ | کارت‌به‌کارت، در آینده | ۲ امروز، ۳ و ۴ برای مبالغ بالاتر | پایین‌ترین سقف |

The reasoning behind the asymmetry is the part worth writing: purchase is safe at a low rung **because only verified apps can take money from a user** — the recipient is findable. Withdrawal is safe at a low rung **because the destination is verified as the user's own**. Transfer is dangerous **because the recipient can cash out**. That's one causal rule, not five arbitrary numbers, which is what makes it defensible to a regulator.

**Chapters:** 02-15 and 03-03 (the rung tables gain a destination dimension), 02-07, 04-04.

## 5. The daily threshold is user-configurable

Default ۱۰ million toman/day for purchases, changeable in تنظیمات. Fine, and consistent with 02-06's «سقف‌های پیش‌فرض پایین که خودِ کاربر بالا می‌برد». Three constraints:

- Raising it needs at least rung ۲ (it is itself an authority-granting act). **COMMENT**: correct
- There is a platform hard cap the user cannot exceed, whatever the setting says. **COMMENT**: correct
- It is never covered by any mandate — see the two rules in Part I.

## 6. Deposit and withdrawal (واریز و برداشت) — product, this version

in fact **واریز** — bringing money from any bank account into the Vista wallet. The card must belong to the user; PSP and Shaparak already enforce that against mobile number and national ID, so it isn't our check to build. Rung ۱.

in fact **برداشت** — moving money from the wallet to the user's own SHEBA at any bank, in three steps: (۱) neither verify nor execute; (۲) verify SHEBA ownership against national ID and birth date, queue for an admin, admin ticks, notification fires under the withdrawal contract; (۳) real API, real movement, notification with tracking number.

Four notes:

**This already fits the contract state machine.** «برداشت یه قرارداد هست که اولش که امضا می‌کنیم اتفاق خاصی نمیفته» is precisely the 04-04 event model: signature, then رویداد. No new machinery — one new event type at most.

**The admin's tick must be a signed event.** 04-04 says رویدادها امضاشده‌اند. A manual step in the middle of a money movement is the single most audit-sensitive thing in step ۲, and treating it as a signed ledger event costs nothing and closes the gap before anyone asks. **COMMENT**: admin does not use this client. he is a bank employee and it has a different client and possibly works only in the bank office.

**This is the first contract whose counterparty is not an app.** In a deposit or a withdrawal, the user is contracting with the wallet issuer. 03-02 already covers it — «بانک وقتی ریل است دیده نمی‌شود، و وقتی طرف معامله است نام برده می‌شود» — and this is the "طرف معامله" case. Worth stating in 03-02, since it's the first place the rule bites. **COMMENT**: wrong. the counter party is the Bank Sina and this is a contract in bank Sina app (مالی)

**And this contradicts 02-07 as written.** The book says «در فاز نخست کیف پولِ دارای موجودی نداریم» — no funded wallet until phase 2, under the bank's licence. What you described is a funded wallet with deposits and withdrawals, in the version being shown now. I don't think these are actually in conflict, but the book has to say which is which: the demo version has a wallet with a fake gateway to show how the system works; the commercial phase 1 runs on the bank's existing rails; the licensed funded wallet is phase 2. Right now the book has no word for the demo, so this reads as a contradiction. **Decision needed** — see Part V. **COMMENT**: we will have a stage/test environment which the money is not real and also all apps are running in stage mode (no real money in neither app). 

**On the fake gateway:** worth one line of caution. A payment page that looks real is the most reputationally dangerous artifact in any demo. It should be unmistakably marked as simulated on the page itself, and no real card number should ever be enterable in it. Cheap to do now, expensive to explain later. **COMMENT**: correct.

---

# Part III — Architecture clarifications (voice messages 4 and 5)

These are the "این معماری باید یکم شفاف‌تر بشه" items. Nothing here changes a decision; it makes explicit what the book left implicit.

## 7. Two authentication hops, not one

The book draws the write path as `کلاینت → پردازشگر → اجرا` and stops. You're right that it hides the second half. The full path:

```
هویتِ اول ──  کلاینت ──امضای کاربر──▶ پردازشگر
                                          │
                        پردازشگر امضاها را وارسی می‌کند،
                        هویت همهٔ طرف‌ها را تأیید می‌کند،
                        و بستهٔ کامل را با کلید خودش امضا می‌کند
                                          │
هویتِ دوم ──                              ▼
                        ای‌پی‌آی‌ای که فقط پردازشگر به آن دسترسی دارد
                        نه دستیار · نه کلاینت · نه کاربر
                                          ▼
                                     سرویس انتهایی
                                          │
                                   نتیجه ──▶ پردازشگر
                                          │
                                   تأیید ──▶ کلاینت + اطلاع‌رسانی
```

**The user never talks to the end service directly.** The processor is the counterparty. It attests who the user is, having verified them, and the end service trusts the processor's signature rather than doing its own identity work.

Three things follow, and two of them are gains:

**The processor becomes a fourth actor.** 04-02 has three — آدم، اپ، دستیار. The processor now signs. It needs a row: it holds a key, its signature is an attestation of identity and validity, and it is not a contract party.

**Principle ۸ survives, if we say why.** 04-10 §۸ says «طرف قرارداد کسی است که تعهدی دارد» and that the platform is never named. The processor's signature is a **transport and attestation signature**, not a party signature. Say it in those words in 04-03, or the first careful reader will think the platform quietly became a party to every contract.

**This is a partial answer to the open regulatory question.** 05-02 and 90-02 both flag that no regulator has a position on assistant-initiated transactions. The processor's signature gives us the thing a regulator will actually want: a single licensed point that attests «این کاربر، این قرارداد، هویت تأییدشده» before anything executes. That is a much better place to start the conversation from than "the user tapped a button." Worth adding to 05-02.

**And it goes in the partner SDK.** «تو داخل اون [SDK] این فرایند اینکه پردازنده خودش رو چه شکلی داره اثبات میکنه مشخص شده باشه» — how the processor proves itself, and how to verify it, belongs in the spec document from 02-11, alongside the test suite.

## 8. The notification module

Apps cannot send notifications directly. They hand the notification to a notification module, which checks whether that app holds permission to notify that user, and only then delivers. Contract-bearing or not.

The book describes notification behaviour (02-08) but has no module for it — 04-01's diagram doesn't contain one. It needs to be added as a component beside the processor, with the permission check named as its job. It's also the natural enforcement point for change 3: the implicit-start permission and its revocation live exactly here.

## 9. On-behalf-of identity in MCP calls

When the assistant asks Snapp or Neshan "where is mom's house saved," *which user* is asking is part of the query. Every request the assistant sends to an MCP must carry a verified statement of who it is acting for — and the same holds if MCP writes are enabled, which after change 2 they are.

**The gateway is already the right home.** 04-03 lists دروازهٔ قابلیت's jobs as routing, data permission, health, rate limit. Add one: **it injects and signs the on-behalf-of assertion**, so the assistant never asserts its own principal and the end app can verify rather than trust.

This produces a symmetry worth stating outright in 04-01, because it makes the whole architecture easier to hold in one's head:

> **دروازهٔ قابلیت هویت کاربر را برای خواندن گواهی می‌کند. پردازشگر همان کار را برای نوشتن انجام می‌دهد. در هیچ‌کدام، دستیار خودش مدعی هویت نیست.**

**Chapters:** 04-01 (both modules into the diagram), 04-02 (fourth actor), 04-03 (both hops, both attestations), 04-06 (how the assertion maps onto MCP), 02-08, 02-11.
**COMMENT**: so the API hub should stand between the agent and apps MCP servers and also API hub stands between the processor and apps execution stubs and also API hub stands between apps and the notification module. correct?
---

# Part IV — The corporate map (book and deck only, not product)

You were explicit that this one doesn't touch the product. Structure as described:

```
                        ایرانسل
                           │
                     ویستا (بازو)
                           │
                    یلوتک — بازوی فنی
                           │
      ┌────────────┬───────┴───────┬────────────────┐
      │            │               │                │
 سوپر اپلیکیشن   زیرساخت      یلوهاب —        امضای دیجیتال
   (شما)         بانک سینا    دروازهٔ API         و PKI
```

- **سوپر اپلیکیشن** — the product. Your company under option ب.
- **زیرساخت بانک سینا** — rewrites the bank's software infrastructure. This is 03-04's independent modernisation programme, now with a corporate home.
- **یلوهاب** — the API gateway connecting services. Bank Sina's payment service reaches the super app through it; the super app's processor reaches Alibaba, SnappFood and the rest through it.
- **امضای دیجیتال و PKI** — serves the super app and others. This is 04-02's «زیرساخت کلید»، the item the book already calls the longest-lead work after hardware.

## What this fixes

05-05 option ب currently asks for «تعهد مکتوب تحویل برای هر وابستگی، با مالک مشخص و تاریخ مشخص» and then lists five dependencies with no owners. Under this structure the list acquires owners:

| وابستگی | مالک |
|---|---|
| امضای درون سیم‌کارت و عنصر امن | شرکت امضای دیجیتال و PKI |
| قابلیت‌های بانک سینا | شرکت زیرساخت بانک + خودِ بانک |
| اتصال سرویس‌ها و دروازهٔ API | یلوهاب |
| قابلیت‌های خدمات ایرانسل · هویت و ورود یکپارچه · سکوی اطلاع‌رسانی | ایرانسل |

That is a real strengthening of the chapter, not just a diagram. An ask with named counterparties is a different document from an ask with abstract ones.

## The one thing that needs deciding, not describing

in fact **04-05 اپ‌به‌اپ و API Gateway now has a problem.** Its thesis is: «دروازهٔ API ساخته می‌شود. اما به‌جای آنکه سامانهٔ جداگانه‌ای در کنار سوپر اپلیکیشن باشد، همان لایه است که از سمت اپ‌ها نگاه شده. یک بار ساخته می‌شود و دو نیاز را پاسخ می‌دهد.» If YelloHub is a separate company building a separate API gateway, that sentence is no longer true as written.

I think the thesis survives if we split the two layers cleanly and say so:

- **دروازهٔ قابلیت (ours)** — the semantic layer: capability catalogue, data permission, the on-behalf-of assertion, health, rate limiting.
- **یلوهاب** — the connectivity layer: the actual plumbing to group and partner services, credentials, network, the commercial relationships with those services.
- **قرارداد** — remains the only way a write happens, wherever the transport runs.

And then the boundary that has to be written down now, in the book, while it's cheap:

> **معنای نوشتن مالِ ماست. یلوهاب مسیر است، نه مرجع. هیچ نوشتنی از طریق یلوهاب انجام نمی‌شود که قراردادی امضاشده پشتش نباشد.**

I'd put that sentence in both 04-05 and 05-05. This is precisely the kind of boundary that looks pedantic today and gets negotiated away in month six, and 05-05's «اختیار تعریف رابط‌ها» is the authority that defends it. Naming it in the book is how you make it a stated position instead of an argument you have later.

## Rewriting 05-05 اختیارات

الف and ب become named roles:

- **الف — مدیرعامل یلوتک**، with all four companies under it.
- **ب — مدیرعامل شرکت سوپر اپلیکیشن**، ذیل یلوتک.

Two things I'd hold on to while making that edit.

**The authority lists don't get shorter because the roles now have names.** The chapter's whole force is in the enumerations — budget, hiring, roadmap, interface definition, right of refusal, escalation path with a deadline. A title without those is the thing the chapter already warns against: «عنوانی که دارایی‌های عملیاتی را با خودش نیاورد، توان اجرای این طرح را نمی‌دهد». That sentence should stay, restated against یلوتک rather than ایرانسل لبز. **COMMENT**: remove Irancell Labs completely.

**And the closing threat is unchanged and should stay verbatim:** «این طرح شدنی است. اما بدون اختیارِ اجرا، شدنی نیست.»

**Names to confirm:** یلوتک / YelloTech, یلوهاب / YelloHub, and the exact wording of Vista's relationship to Irancell — the transcription is garbled at that point («بازوی وی سیل ایرانسل»). Also whether these are working names or settled ones, since putting a provisional name in a printed book is worth avoiding. **COMMENT**: Irancell has a VC arm named Vista. Vista will have a tech arm named YellowTech. and YellowTech will have at least 4 products: YellowHub, YellowBank, YellowApp and YellowSign

---

# Part V — Decisions I need from you

**1. Option A or Option B for delegated signing?** Recommend B — the auto-signer beside the client, not the key inside the model. Keeps «کلید امضا هیچ‌وقت دست دستیار نیست» literally true, and costs almost nothing extra to build. **COMMENT**: B

**2. Is the assistant mandate scoped or general?** Recommend scoped — per app, per contract type, with ceiling and expiry. Never a blanket "all rung-۱ contracts." **COMMENT**: general but tell them the خطر just like auto approve in other AI agents like codex.

**3. Who classifies a light write — app alone, or app declares and platform can override?** Recommend the latter, for the irreversibility cases rather than the money cases. If you want app-alone, I'll write it that way and log the risk in 90-02. **COMMENT**: app alone

**4. Demo version vs. phase 1 in 02-07.** Does the book gain a third phase label («نسخهٔ نمایشی») ahead of فاز یک, or does 02-07's «در فاز نخست کیف پولِ دارای موجودی نداریم» change? Recommend the former — the regulatory argument in 02-07 and 05-02 depends on the funded wallet arriving under the bank's licence, and I don't want to weaken that to accommodate a demo. **COMMENT**: read above. propose correct phasing and environments.

**6. Does a deposit/withdrawal contract name the bank as a party?** Recommend yes, per 03-02's own rule. It's the first contract in the product whose counterparty is not an app. **COMMENT**: yes.

**7. Does 05-05 state a preference between الف and ب?** You said you'd probably decline الف. The chapter is written in the first person and gets its credibility from candor, so a single sentence of preference with the reason would fit — but it does trade away some negotiating symmetry. Your call. I'd keep both fully specified either way.**COMMENT**: no prefrences

**8. Notification volume after implicit start.** Every signed contract now opens a notification channel that persists until revoked. Does a default digest or quiet rule apply, or does every app get full notification rights from its first contract? Small now, structural at scale. **COMMENT**: full notification right.

---

# Part VI — Edit list

| #   | Change                                   | Chapters                                                                                                                                               | Kind                  |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| ۱   | وکالت به دستیار                          | 02-06 (rewrite: وکیل can be the assistant; two new rules; phasing), 02-15 (four sentences + blast radius), 04-02, 04-03, 04-10 §۱ and §۲, 05-01, 90-01 | product · book · deck |
| ۲   | نوشتن سبک از راه MCP                     | 01-03, 02-05 (new permission row), 02-15 (four sentences), 04-06, 04-10 §۳, 90-01, 90-02                                                               | product · book        |
| ۳   | هر قراردادی یک استارت است                | 02-03 (retitle the section), 02-05, 02-08, 02-10, 90-01                                                                                                | product · book · deck |
| ۴   | پله بر حسب مقصد پول                      | 02-15, 03-03, 02-07, 04-04                                                                                                                             | product · book        |
| ۵   | آستانهٔ روزانهٔ قابل تنظیم               | 02-15, 03-03, 02-07                                                                                                                                    | product · book        |
| ۶   | واریز و برداشت                           | 02-07 (new section), 03-02, 04-04 (event types)                                                                                                        | product · book        |
| ۷   | دو هویت: کلاینت→پردازشگر، پردازشگر→سرویس | 04-01, 04-02 (fourth actor), 04-03, 02-11, 05-02                                                                                                       | book                  |
| ۸   | ماژول اطلاع‌رسانی                        | 04-01, 02-08                                                                                                                                           | product · book        |
| ۹   | هویت «به نیابت از» در MCP                | 04-01, 04-03, 04-06                                                                                                                                    | product · book        |
| ۱۰  | نقشهٔ چهار شرکت                          | 05-05 (rewrite الف/ب), 04-05 (یلوهاب boundary), 03-04, 00-01                                                                                           | book · deck           |

**Order I'd work in.** Decisions ۱–۳ first, because 02-15's four sentences are quoted in five other chapters and every one of them moves when those sentences move. Then Part III, which is clarification and carries no risk. Then Part II. Then 05-05 and the deck last, once the security wording is settled — the deck's security slide is downstream of a sentence we haven't finalised yet.
