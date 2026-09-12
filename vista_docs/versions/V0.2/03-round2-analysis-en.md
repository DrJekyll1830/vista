# Vista V0.2 — Round 2 Analysis

**Input:** your COMMENTs on `02-round1-analysis-en.md`.

Twelve decisions are now settled. Three of your comments corrected me and I've taken all three. The rest of this round is mostly consequence: **several of your decisions are individually reasonable and compose into something none of them says on its own.** Part 2 is that. It's the only place I'm asking you to add something rather than just write down what you've already decided.

Also one blocking question at the end, about names. It's a 46-chapter question and I'd rather raise it now than after the book is typeset.

---

# Part 0 — Settled

| | Decision |
|---|---|
| وکالت به دستیار | Option B — auto-signer beside the client. Assistant never holds a key. |
| دامنهٔ وکالت | **General** — any rung-۱ contract. Not scoped per app. |
| فاز | وکالت به دستیار and وکالت به اپ **ship together in phase ۲**. |
| نوشتن سبک از MCP | **The app is the sole judge.** Platform does not override. |
| راهنمای توسعه‌دهنده | New published document. What not to put in MCP, why, and the trade-off. |
| استارت ضمنی | Any contract is a start. Full notification rights from the first contract. |
| نام اپ | Always visible in every contract. |
| آستانهٔ روزانه | User-configurable · raising needs rung ۲ · platform hard cap above it. |
| اپ احرازنشده | **Cannot take money from the user at all.** Assistant must not propose it for financial work. |
| واریز و برداشت | Counterparty is **Bank Sina**, inside the **مالی** app. |
| محیط | A stage environment — no real money, all apps in stage mode. |
| 05-05 | No preference stated between الف and ب. Remove ایرانسل لبز entirely. |

---

# Part 1 — Three places you were right

## 1.1 The one-rung rule is self-enforcing, and my rule ۱ was redundant

You wrote: «there is no such risk because raising the ceiling needs one upper rung.»

Correct, and I should have seen it. Granting a rung-۱ mandate needs rung ۲. Raising the rung-۱ threshold needs rung ۲. A rung-۱ mandate covers rung-۱ acts only. So a rung-۱ mandate cannot grant a mandate, cannot raise a ceiling, cannot touch signature policy. It falls out of the rule that's already in 02-06 — it isn't a new rule and I'm dropping it.

**One narrow case survives, and it arrives in the same phase as the feature.** The moment rungs ۳ and ۴ exist, a **rung-۲** mandate becomes grantable (with rung ۳). A rung-۲ mandate covers rung-۲ acts — and raising the rung-۱ threshold *is* a rung-۲ act. So at that point the assistant could widen its own rung-۱ ceiling. Both rungs ۳/۴ and the mandates ship in phase ۲, so this is live on day one of phase ۲, not some distant edge case.

The fix is one sentence in 02-06, not a general rule:

> **سیاست امضا — آستانه‌ها و سقف‌ها — هیچ‌وقت با وکالت عوض نمی‌شود، در هیچ پله‌ای.**

That's the whole correction. Everything else you said stands.

## 1.2 The admin's tick — and it resolves better than what I proposed

You wrote: «admin does not use this client. he is a bank employee and it has a different client and possibly works only in the bank office.»

That's cleaner than my version. I was treating the manual step in برداشت step ۲ as an internal Vista operator action needing special audit handling. It isn't one. The bank employee acts in the bank's own back office, which means the confirmation reaches us as **an event from Bank Sina, who is already a named party to that contract**. That's the ordinary 04-04 event model with no special case at all — the same shape as SnappFood saying «سفارش شما تحویل شد».

So drop my "signed admin event" paragraph. What replaces it is a dependency, not a rule: **step ۲ needs a queue and a back-office screen on the bank side**, which belongs in the delivery-commitment table in 05-05 under YellowBank, alongside the wallet and the movement API.

## 1.3  in fact مالی is Bank Sina's app — and I had the system-app list wrong

You wrote: «the counter party is the Bank Sina and this is a contract in bank Sina app (مالی)».

I had been reading مالی as a platform module with the bank abstractly behind it. It isn't. مالی is a system app **operated by Bank Sina**, and that changes something in 02-04 that the book currently implies without ever saying: **not all six system apps are ours.** One of them belongs to a partner.

This is worth being precise about, because it makes 03-02's rule land properly for the first time. 03-02 says «بانک سینا وقتی ریل است دیده نمی‌شود، و وقتی طرف معامله است نام برده می‌شود». Now both halves have a concrete home:

| کار | بانک کجاست | در قرارداد |
|---|---|---|
| سفارش غذا از اسنپ‌فود | ریل | نام برده نمی‌شود |
| واریز به کیف پول | طرف معامله، در اپ مالی | **بانک سینا، با نام** |
| برداشت به شبای خودِ کاربر | طرف معامله، در اپ مالی | **بانک سینا، با نام** |
| وام یا سپرده | طرف معامله | **بانک سینا، با نام** |

**Edits this forces:** 02-04's list of six gains a "چه کسی اداره‌اش می‌کند" column · 03-02 gains the table above · 04-04 gains واریز and برداشت as contract types whose طرف is a bank, not an app · and the قرارداد آغاز in 02-04 has to disclose that مالی is operated by Bank Sina, since the user is agreeing to a system app run by someone else.

**One question this raises:** who *builds* مالی — Bank Sina, YellowBank, or the super-app team building a front end over the bank's interfaces? It determines whether مالی is a delivery dependency in 05-05 or part of my own scope, and those are very different asks.

---

# Part 2 — What the general mandate implies, once your other decisions are stacked on it

This is the one part of this round asking you for something new. Everything below follows from decisions you've already made; none of it is me re-opening them.

## The chain

Take the four settled decisions together:

1. The mandate is **general** — any rung-۱ contract, auto-signed.
2. **Any contract is a start** — signing one is how an app enters the user's life.
3. **The app alone** decides which of its writes are MCP tools.
4. Light MCP writes are performed by the assistant without a contract.

Now follow it:

```
دستیار وکالت عمومی پلهٔ یک دارد
        ↓
اپ تازه‌ای را در ویترین مناسب تشخیص می‌دهد
        ↓
قرارداد استارت — پلهٔ یک — خودکار امضا می‌شود        ← هیچ‌کس نپرسید
        ↓
ابزارهای نوشتن سبک آن اپ حالا در دسترس دستیارند       ← اپ خودش تعیینشان کرده
        ↓
پاسخ‌های همان اپ به متن دستیار وارد می‌شوند           ← سطح تزریق دستور
```

Every link was individually approved and the chain is still something you didn't approve: **the assistant can bring a new counterparty into the user's life, accept its permissions, and start writing through it, without the user being asked once.**

## You picked the right analogy, and it contains the answer

You said: «general but tell them the خطر just like auto approve in other AI agents like codex.»

Codex's auto-approve is exactly this shape — broad by default, and with a short published list of things it never covers regardless. Network access and writes outside the working directory are never auto-approved, not because they're high-value, but because they're the two that turn a contained mistake into an uncontained one. That list is short on purpose; it's what makes "approve everything else" safe to offer.

So I'm not asking you to scope the mandate. I'm asking for the equivalent short list. **Two items.**

> **وکالت عمومی است. دو چیز را هیچ‌وقت پوشش نمی‌دهد:**
>
> **۱. استارت زدن اپ تازه.** آوردن یک طرف قرارداد تازه به زندگی کاربر، همیشه از خود کاربر پرسیده می‌شود.
>
> **۲. قراردادی که از بیرون آمده.** وکالت قراردادهایی را پوشش می‌دهد که از خواستهٔ خودِ کاربر در همین گفت‌وگو ساخته شده‌اند، نه قراردادی که کاربر یا اپ دیگری فرستاده است.

Item ۱ closes the chain above. Item ۲ closes something separate that I missed in round ۱ and that has nothing to do with the assistant: **bill splitting.** 02-09 lets any user send another user a contract to sign their share. That contract is rung ۱. Under a general mandate with no carve-out, it auto-signs. Anyone who can address a contract to a user can drain the daily ceiling without the assistant being involved or compromised at all. That one isn't a subtle composition risk — it's a direct attack, and it works on day one of phase ۲.

Neither item costs anything in the cases the mandate exists for. «قبض برق را پرداخت کن» and «همان بستهٔ همیشگی را بخر» both go through untouched: existing app, contract born from the user's own request.

## The daily ceiling should be one pool

The rung-by-destination table (change ۴) puts واریز at rung ۱ and برداشت به شبای خودِ کاربر at rung ۱. Both are therefore inside a general rung-۱ mandate.

برداشت is fine — the destination is the user's own verified account, money doesn't leave their control.

**واریز is not fine, and it's an easy thing to miss.** A deposit pulls money from the user's bank card into the wallet. If the assistant can auto-deposit and auto-purchase, then the effective bound isn't the wallet balance any more — it's whatever the card can fund. The user's mental model («حداکثر همان چیزی که در کیف پولم هست») quietly becomes false, which is the worst kind of security property: one the user believes and doesn't have.
**COMMENT**: the assistant CANNOT do the deposit on it's own. it requires card OTP that the assistant DOES NOT HAVE AT ALL!! so there is no worry at all. all the assistant can do is to generate a payment link that user should pay outside our app via a PSP.
The fix costs nothing:

> **آستانهٔ روزانهٔ پلهٔ یک یک استخر واحد است: خرید، واریز و برداشت همه از همان کم می‌کنند.**

Then the bound holds no matter which combination the assistant uses, and the user's mental model is true again.

## The grant screen

Since the mandate is general and the risk is real, the screen that grants it is doing more work than any other screen in the product. Draft:

> **این کار را به دستیار می‌سپارید.**
>
> از این پس دستیار قراردادهای پلهٔ یک را بدون پرسیدن از شما امضا می‌کند — تا سقف **۱۰ میلیون تومان در روز**، تا **۳۰ آذر ۱۴۰۵**.
>
> **دستیار می‌تواند اشتباه کند و می‌تواند فریب بخورد.** آنچه در این محدوده خرج شود، خرج شده است.
>
> این‌ها هیچ‌وقت خودکار نمی‌شوند: استارت زدن اپ تازه · قراردادی که از بیرون آمده · دادن مجوز · تغییر سقف‌ها.
>
> هر مصرف به شما اطلاع داده می‌شود. هر لحظه می‌توانید پس بگیرید.
>
> [ امضا با رمز یک‌بارمصرف ]

The second line is the one that matters and it should not be softened. 02-06 already argues that unbounded approvals became the largest source of user loss in the smart-contract ecosystem precisely because people forgot what they'd granted. A grant screen that reads like a feature announcement reproduces that outcome.

---

# Part 3 — The four sentences, final

You said: do the rewording. Here it is, and it changed again after your "app is sole judge" decision — for the better.

What I proposed in round ۱ was:

> خواندن آزاد است. · **هر چه پول یا تعهد در آن باشد، قرارداد است.** · کلید امضا هیچ‌وقت دست دستیار نیست. · اجرا جایی انجام می‌شود که دستیار به آن دسترسی ندارد.

in fact **«تعهد» has to come out, and the reason is your decision, not my preference.** Once the app alone classifies its writes, an app can expose an MCP tool that creates a genuine obligation with no money in it — reserving a table, cancelling a booking, sending something to a third party. So «هر چه تعهد در آن باشد، قرارداد است» would be a sentence the architecture doesn't enforce. Money is different: money moves only through the processor, so that half is structural and true no matter what any app declares.

The four sentences should contain only what is absolutely true. Everything app-judged belongs in a paragraph underneath, not in the slogan:

> **خواندن آزاد است.**
> **پول فقط از راه قرارداد جابه‌جا می‌شود.**
> **کلید امضا هیچ‌وقت دست دستیار نیست.**
> **اجرا جایی انجام می‌شود که دستیار به آن دسترسی ندارد.**

They got narrower and stronger at once. Nothing here depends on an app behaving well, on a filter working, or on the model being correct. All four are structural.

And underneath, said plainly rather than buried:

> میان خواندن و قرارداد، دستهٔ سومی هست: **نوشتن سبک**. اپ می‌تواند کارهایی را که بار مالی ندارند به‌صورت ابزار در اختیار دستیار بگذارد — ویرایش یک مستند، گذاشتن یک یادداشت. **این تصمیم با خودِ اپ است**، و ما راهنمایی منتشر می‌کنیم که بگوید چه چیزی نباید آنجا باشد و چرا. آنچه ما تضمین می‌کنیم این است که هیچ‌کدام از این‌ها به پول کاربر نمی‌رسند.

The last sentence is the honest boundary of the claim. It's still a strong one.

**Blast radius, restated for 02-15:**

> بدترین کاری که دستیارِ کاملاً به‌خطر‌افتاده می‌تواند بکند: مصرف سقف روزانه‌ای که کاربر خودش با رمز یک‌بارمصرف امضا کرده، و انجام نوشتن‌های سبکی که اپ‌های موجودِ کاربر اعلام کرده‌اند. نه می‌تواند اپ تازه‌ای بیاورد، نه مجوز تازه‌ای بگیرد، نه سقفی را بالا ببرد، و نه یک ریال بیرون از آن سقف خرج کند.

---

# Part 4 — The developer guidance document

You asked for it, and after "app is sole judge" **it is the only control that exists on this boundary.** That has a consequence worth deciding deliberately: if it's an internal page nobody signs, then the honest sentence in 02-15 is "we have no control here." If it's published, versioned, and acknowledged at app onboarding, it's a real control. The second costs almost nothing more than the first. I'd publish it and make acknowledgement part of احراز.

Proposed outline — `spec/mcp-write-guidance-fa.md`:

**۱. آنچه ما اعمال می‌کنیم، و قابل مذاکره نیست.** پول از راه ابزار MCP جابه‌جا نمی‌شود. هیچ ابزاری به کیف پول کاربر نمی‌رسد. این ساختاری است، نه قاعده‌ای که ما اعمالش کنیم — مسیر پول از پردازشگر می‌گذرد و ابزار MCP راهی به آن ندارد.

**۲. آنچه به شما واگذار شده.** هر چیز دیگری. شما تصمیم می‌گیرید کدام قابلیت ابزار باشد و کدام قرارداد.

**۳. چهار پرسش پیش از اینکه چیزی را ابزار کنید.**
- اگر این کار اشتباه انجام شود، کاربر می‌تواند خودش برش گرداند؟
- نتیجه‌اش برای کسِ دیگری قابل مشاهده می‌شود؟
- اگر هزار بار پشت سر هم انجام شود، خودِ حجمش خسارت است؟
- کاربر انتظار دارد پیش از انجامش از او پرسیده شود؟

**۴. معامله‌ای که دارید می‌کنید، صریح.** ابزار MCP سریع است و تشریفات ندارد و نرخ تبدیل را بالا می‌برد. قرارداد کند است و در عوض سندی امضاشده به شما می‌دهد که در اختلاف می‌توانید نشانش دهید. **شما میان نرخ تبدیل و قابلیت اثبات انتخاب می‌کنید.** هر جا احتمال اختلاف هست، قرارداد ارزان‌تر از چیزی است که به نظر می‌رسد.

**۵. جملهٔ کلیدی.**
> **اگر ابزاری وقتی کسی جز کاربر صدایش بزند خطرناک است، جایش قرارداد است، نه MCP.**

با توضیح اینکه چرا: پاسخی که اپ دیگری برمی‌گرداند وارد متن دستیار می‌شود، و متنی که شما ننوشته‌اید می‌تواند ابزار شما را صدا بزند.

**۶. سه فهرست کوتاه.** بی‌خطر · با احتیاط · هرگز. با مثال واقعی برای هر کدام.

**۷. آنچه ما به هر حال انجام می‌دهیم.** ثبت در دفتر · محدودیت نرخ · نمایش به کاربر در تنظیمات اپ · و امکان لغو.

Item ۷ is the part I'd keep even under app-sole-judge, because it's not classification — it's visibility. **Question for you:** does the user see the list of an app's write tools, and can they revoke it? Your decision settles who *classifies*; it doesn't settle whether the user is told. My recommendation is that the declared write tools appear in the app's start disclosure and in its settings page, revocable like any other permission. Say the word if you want them invisible instead. **COMMENT**: there is no way for use to distinguish between reads and writes. so leave it. dont show them to users.

---

# Part 5 — Environments and phasing

You asked me to propose this. Your stage-environment answer is better than my «نسخهٔ نمایشی» idea, because it makes this an **environment** axis rather than a third phase — which means 02-07's regulatory argument («کیف پولِ دارای موجودی زیر مجوز بانک، در فاز دوم») doesn't have to be weakened at all. The two axes are independent.

## محیط

| | استیج | پروداکشن |
|---|---|---|
| پول | غیرواقعی | واقعی |
| اپ‌ها | همه در حالت استیج | فقط اپ‌های پذیرفته‌شده |
| درگاه پرداخت | شبیه‌سازی‌شده — موفق / ناموفق | شاپرک و ریل بانک |
| کیف پول | دارای موجودی، از روز اول | طبق فاز |
| هویت و امضا | واقعی — پله‌های ۱ و ۲ | واقعی |
| دفتر | جدا | جدا |

Four rules:

in fact **هیچ اپی هم‌زمان در دو محیط نیست.** An app is in stage or in production, never bridging. This is the rule that makes the whole thing safe and it's the one that will be under pressure the first time a partner wants "just one real transaction to test."

in fact **هویت واقعی است، پول نیست.** Real mobile auth and real OTP to a real SIM, so rungs ۱ and ۲ are genuinely exercised rather than mocked. Only the money is simulated. Otherwise stage demonstrates nothing about the part people doubt.

in fact **استیج در همه‌جای برنامه دیده می‌شود، نه فقط روی صفحهٔ پرداخت.** You agreed on labelling the fake gateway. The same logic covers the whole build — a persistent band, not a page-level notice. A screenshot of a stage build with no marking is indistinguishable from a production one, and screenshots travel.

in fact **استیج دوطرفه است.** Your comment says all apps run in stage mode too. That's a real requirement on partners: **every app must expose a stage endpoint**, which goes into the partner spec alongside the test suite.

## And stage is worth more than a demo

02-11 argues that platforms die of integration cost, not partner reluctance. Stage is a direct answer to that and the book doesn't currently mention it: **a partner can build and test the entire contract lifecycle — capability declaration, contract construction, signature, execution, events — against stage without a commercial agreement, without a licence, and without ever touching real money.** Combined with the machine-readable spec and the test suite, "try it" costs a developer an afternoon and costs their management nothing to approve. That's a stronger sentence than anything currently in 02-11.

## فاز

Your comment moves both mandates to phase ۲, which means the roadmap barely moves:

| | اضافه می‌شود |
|---|---|
| **فاز صفر** | بدون تغییر · plus the developer guidance document and the stage environment |
| **فاز یک** | استارت ضمنی · پله بر حسب مقصد پول · آستانهٔ قابل تنظیم · نوشتن سبک از MCP · ماژول اطلاع‌رسانی · گواهی «به نیابت از» · امضای پردازشگر |
| **فاز دو** | پله‌های ۳ و ۴ · **وکالت به دستیار و وکالت به اپ، با هم** · کیف پول دارای موجودی در پروداکشن · واریز و برداشت در پروداکشن · اپ شخص ثالث احرازشده · پمپاژ هوش |
| **فاز سه** | بدون تغییر |

**One thing to reconcile in the text.** Voice message ۱ describes delegated signing as available in «نسخه اولیه که ما الان بالا گذاشتیم». With mandates now in phase ۲, the resolution is the environment axis: **delegated signing exists in stage now, to demonstrate the mechanism; it reaches production in phase ۲.** Worth writing explicitly, or the book and whatever you demo will contradict each other in the room. **COMMENT**: if we can afford that deliver `auto approve` in phase 1, we can do it in phase 1. but if we push it into phase 2, then stage environment has it in phase 2 too. stage environment is on production, do drift. we'll have a test/dev environment that can go forward.

واریز and برداشت are the same shape: real in stage today, production in phase ۲ with the funded wallet.

---

# Part 6 — Your API-hub question

You asked: «so the API hub should stand between the agent and apps MCP servers and also API hub stands between the processor and apps execution stubs and also API hub stands between apps and the notification module. correct?»

**Correct on all three legs.** With one thing added that your sentence leaves open — the ordering.

```
دستیار ──▶ دروازهٔ قابلیت ──▶ یلوهاب ──▶ MCP اپ
              مجوز داده · گواهی «به نیابت از» · سلامت

پردازشگر ──▶ یلوهاب ──▶ اجرای اپ
   وارسی امضا · حد نصاب · پله · سقف · یکتایی · امضای گواهی

اپ ──▶ یلوهاب ──▶ ماژول اطلاع‌رسانی ──▶ کاربر
                      بررسی مجوز اطلاع‌رسانی
```

Note that on the third leg YellowHub is **upstream** of the notification module, which is what you said and which is right — the permission check has to be the last gate before the user, not something sitting behind a transport.

The invariant that generalises all three, and the sentence I'd put in 04-05:

> **یلوهاب همیشه سمت اپ می‌ایستد و ماژول‌های ما همیشه سمت کاربر. هیچ درخواستی از کاربر به اپ نمی‌رود که اول از ماژول ما نگذشته باشد، و هیچ چیزی از اپ به کاربر نمی‌رسد که آخر از ماژول ما نگذشته باشد.**

That's what keeps the boundary defensible when YellowHub is a different company with its own roadmap. YellowHub carries connectivity, credentials, protocol adaptation, network-level rate limiting, and the commercial relationship with each service. It never carries data permission, the on-behalf-of assertion, signature verification, or the notification permission check. Those four are what the security chapter is made of.

## But one thing breaks if it's *all* traffic

02-10 promises: «سرویس‌دهنده اپش را هر جا که خواست بالا می‌آورد و آدرسش را می‌دهد… لازم نیست جایی خاص میزبانی شود و لازم نیست از پیش با ما هماهنگ شده باشد.»

If every app must be reachable through YellowHub, then adding an app by address requires YellowHub onboarding, and the gatekeeper the book explicitly removed comes back — wearing a different company's badge, which is worse, because now it isn't even ours to remove.

Recommended split:

- in fact **یلوهاب** fronts services that need a negotiated integration: بانک سینا، خدمات ایرانسل، اسنپ، علی‌بابا — anything with a commercial relationship and non-standard interfaces.
- in fact **دروازهٔ قابلیت** talks directly to long-tail apps that already speak MCP and host themselves.

Same policy layer either way; two transports beneath it. The book's open-ecosystem claim survives, and YellowHub gets the work it's actually for instead of becoming a queue every hobbyist waits in. **COMMENT**: why not simply remove دروازه قابلیت and keep YellowHub only?

---

# Part 7 — The verification line moved, and I under-reported it

Your comment: «non verified apps can't do financial works via our wallet. so the assistant should not suggest them for financial works at all.»

I treated this in round ۱ as part of the rung table. It's bigger than that — **it moves the single most quoted line in 02-10.**

Current: «هر کسی می‌تواند هر اپی را اضافه کند. اما فقط اپِ احرازشده می‌تواند **اختیار مالی بخواهد**.»

New: «هر کسی می‌تواند هر اپی را اضافه کند. اما فقط اپِ احرازشده می‌تواند **از کاربر پول بگیرد**.»

The transcript backs the stronger version — «فقط اپ‌های احراز شده میتونند از کاربر پول بگیرند» — so this is a correction to the book, not a new decision.

**What it costs, said plainly.** An unverified app can now read, chat, show a mini-app, and make non-financial contracts. It cannot sell anything. 02-10's «هم‌زمان باز و کنترل‌شده» argument currently leans on unverified apps being able to do real commerce one signature at a time. That half goes away.

**Why it's still a good line, and probably a better one.** It's the platform position everyone already understands: build freely, distribute freely, but you cannot take money through us until we know who you are. It's easier to defend to a regulator than the previous line, and it's easier to explain to a user — نشان آبی stops meaning "can ask for a standing mandate," which nobody could hold in their head, and starts meaning «این اپ می‌تواند از شما پول بگیرد»، which everyone can.

**And your second sentence is a new rule, not a restatement.** «the assistant should not suggest them for financial works at all» puts verification into the assistant's selection logic, not just into enforcement. That's the same shape as a rule 02-16 already has — «دستیار قابلیتی را پیشنهاد نمی‌دهد که اپش از کار افتاده» — and it should be written the same way, because the reasoning is identical: proposing something that will be refused converts a clean boundary into a broken promise, which is worse than the boundary.

> **سلامت و احراز هر دو به تصمیم دستیار می‌رسند، نه فقط به اعمالِ سکو. دستیار اپی را برای کار مالی پیشنهاد نمی‌دهد که نتواند پول بگیرد.**

**Chapters:** 02-10, 02-11 (سطح‌بندی بر اساس اثر), 02-16, 04-10 §۱۱, 90-01 (نشان آبی).

---

# Part 8 — Names. This one blocks the book.

Your comment: «Irancell has a VC arm named Vista. Vista will have a tech arm named YellowTech. and YellowTech will have at least 4 products: YellowHub, YellowBank, YellowApp and YellowSign»

Two things in there change the book, and one of them changes all of it.

## 8.1 The super app appears to be called YellowApp

The book is titled **ویستا**. Every one of the 46 chapters uses ویستا to mean the product: «ویستا سوپر اپلیکیشنی است که…», «در ویستا هر کاری که وضعیتی را عوض کند…», «آنچه ویستا نیست…». If Vista is Irancell's VC arm and the super app is YellowApp, then the book's subject and the book's title are two different entities, and the opening sentence of the executive summary is factually wrong.

Two readings, and I need you to pick:

in fact **(الف) ویستا stays the consumer brand.** YellowApp is the corporate/product-line name inside YellowTech; the thing users install is ویستا. Book unchanged, one clarifying paragraph in 00-01 explaining the corporate structure. **This is my recommendation** — consumer brand and corporate structure are different layers and there's no reason they must match. Also, as a consumer name in Persian, ویستا is simply better than یلواپ. **COMMENT**: correct.

**(ب) The product is renamed YellowApp.** Then it's a 46-chapter replacement, the title changes, the glossary changes, the deck changes, and every «در ویستا» becomes «در یلواپ». Doable, but I want to do it once and knowingly, not discover halfway through that it was (الف).

## 8.2 Products or companies?

Voice message ۳ said «چهار تا شرکت وجود خواهد داشت هر کدام … یه دونه ماموریت دارند». Your comment says «at least 4 products».

That distinction is the whole of 05-05. Option ب is currently «مدیرعامل شرکت سوپر اپلیکیشن» — a company with its own budget authority, hiring authority, and P&L. If YellowApp is a product line inside YellowTech, then option ب is «مدیرعامل محصول» inside someone else's company, and most of the authority list in that chapter has to be requested from YellowTech's CEO rather than held. **That is a materially different ask**, and 05-05's closing sentence — «این طرح شدنی است. اما بدون اختیارِ اجرا، شدنی نیست» — is aimed exactly at that gap.

So: **are the four subsidiaries or product lines?** If product lines, 05-05 needs rewriting so the authority list is explicit about what a product owner holds versus requests, because a product-owner title with a company-CEO's list attached would be the strongest version of the thing the chapter warns against. **COMMENT**: it's not final but I think they are product lines under YellowTech company.

## 8.3 Mapping, once you confirm

| نام | چه بود در تحلیل قبلی |
|---|---|
| **YellowApp** | سوپر اپلیکیشن |
| **YellowBank** | زیرساخت بانک سینا · کیف پول · صف و میز پشتیبان برداشت · احتمالاً پشتِ اپ مالی |
| **YellowHub** | دروازهٔ API |
| **YellowSign** | امضای دیجیتال و PKI |

That maps cleanly onto the four boxes from round ۱, which is a good sign. Two loose ends: whether the Persian book spells these یلواپ / یلوبانک / یلوهاب / یلواساین or keeps them Latin (the book currently keeps only MCP, API, HSM in Latin, per 90-01, so four more Latin names would be a visible departure), and whether these are settled names or working ones — a provisional name in a printed book is expensive to unwind. **COMMENT**: use persian names with English parantheses for first time you name them

---

# Part 9 — Open questions

Short list. Everything else is decided.

**1.** The two mandate carve-outs — استارت اپ تازه, and قرارداد از بیرون. The second one closes a direct bill-splitting attack, so I'd take it even if you reject the first. **COMMENT**: they are OK for now. but I may change my mind.
**2.** One shared daily pool across خرید · واریز · برداشت? **COMMENT**: only خرید و برداشت
**3.** Does the user see and revoke an app's declared write tools? (Separate from who classifies them, which is settled: the app.) **COMMENT**: no
**4.** Who builds مالی — Bank Sina, YellowBank, or my team over the bank's interfaces? **COMMENT**: YellowBank team.
**5.** in fact ویستا or YellowApp as the product name in the book. **Blocking.** **COMMENT**: vista
**6.** Four companies or four product lines? Determines how 05-05 is written. **COMMENT**: product lines
**7.** Do the Yellow* names appear in the Persian book in Latin or transliterated? **COMMENT**: in Persian

---

# Part 10 — Updated edit list

Changes from round ۱ marked.

| # | Change | Chapters | Kind |
|---|---|---|---|
| ۱ | وکالت به دستیار — عمومی، Option B, **فاز ۲**, دو استثنا, استخر واحد | 02-06, 02-15, 04-02, 04-03, 04-10 §۱, 05-01, 90-01 | product · book · deck |
| ۲ | نوشتن سبک — **اپ تنها داور**, بدون بازبینی سکو | 01-03, 02-05, 02-15, 04-06, 04-10 §۲ §۳, 90-01, 90-02 | product · book |
| ۲ب | **راهنمای توسعه‌دهنده** — سند منتشرشده | 02-11, 02-15, 90-02 · new `spec/` doc | **new** |
| ۳ | هر قراردادی یک استارت است · نام اپ همیشه دیده می‌شود · حق کامل اطلاع‌رسانی | 02-03, 02-05, 02-08, 02-10, 90-01 | product · book · deck |
| ۴ | پله بر حسب مقصد پول | 02-15, 03-03, 02-07, 04-04 | product · book |
| ۴ب | **خط احراز جابه‌جا شد** — اپ احرازنشده اصلاً پول نمی‌گیرد · دستیار پیشنهادش نمی‌دهد | 02-10, 02-11, 02-16, 04-10 §۱۱, 90-01 | **new** · product · book · deck |
| ۵ | آستانهٔ روزانهٔ قابل تنظیم · سقف سخت سکو | 02-15, 03-03, 02-07 | product · book |
| ۶ | واریز و برداشت — **طرف: بانک سینا، در اپ مالی** · صف سمت بانک | 02-04 (اپ‌های سیستمی: چه کسی اداره می‌کند), 02-07, 03-02, 04-04, 05-05 | product · book |
| ۷ | دو هویت · امضای گواهیِ پردازشگر · کنشگر چهارم | 04-01, 04-02, 04-03, 02-11, 05-02 | book |
| ۸ | ماژول اطلاع‌رسانی | 04-01, 02-08 | product · book |
| ۹ | گواهی «به نیابت از» در دروازه | 04-01, 04-03, 04-06 | product · book |
| ۱۰ | **محیط استیج** — دو محور مستقل · استیج به‌عنوان مسیر ورود شریک | 02-07, 02-11, 05-01, 90-01 | **new** · product · book |
| ۱۱ | ساختار شرکتی · یلوهاب سمت اپ · دو مسیر برای اپ‌های دم‌بلند · **حذف ایرانسل لبز** | 00-01, 03-04, 04-05, 05-05 | book · deck |

**Order.** Part 3's four sentences first — they're quoted in five chapters and everything downstream moves with them. Then Parts 6 and 7, which are self-contained. Then Part 5's environment axis, which 02-07 and 02-11 both need. 05-05 and the deck last, and 05-05 can't start until question ۶ is answered.
