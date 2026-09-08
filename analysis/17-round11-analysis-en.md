# Vista — Round 11 Analysis

**Input:** your COMMENTs on Round 10 and `analysis/16-feedback-on-deck-v4.md`.

Four corrections where I had the substance wrong — Cafe Bazaar, the competition, bring-your-own-key, and the review model. Two additions to the contract model that were genuinely missing. One research answer. Then the deck work.

---

# 1. Research answer: SIM signing on Android — yes, and only you can do it

You asked me to check. The answer is better than "yes."

**Android:** since Android 9, applications reach the secure element through **OMAPI / `SEService`**, the Open Mobile API maintained by the Trusted Connectivity Alliance. An applet on the UICC can sign, and the app calls it by AID. But access is not open — it is governed by **access rules stored on the SIM itself** (an ARA applet or ARF file) that name which app certificates may talk to which applet, and it requires **carrier privileges**, which are granted *by the SIM*.

**That last sentence is the strategic point.** Only whoever issues the SIM can install the signing applet and write the access rule that admits our app. Not Snapp, not Bale, not a bank, not a startup — **the operator, and only the operator.** This is not "an advantage we have"; it is a capability nobody else can construct.

**Web:** no secure-element access from a browser. Rung ۳ is still available through passkeys, which give a device-bound key unlocked by biometrics, and rungs ۱–۲ obviously work. **Rung ۴ is Android-only.**

**iOS:** third parties get no UICC secure-element access at all. Worth knowing before anyone asks in the room.

So the honest platform statement:

| | رمز یک‌بارمصرف · درخواست احرازشده | کلید درون گوشی | کلید درون سیم‌کارت |
|---|---|---|---|
| **وب** | ✓ | ✓ | ✗ |
| **اندروید** | ✓ | ✓ | **✓** |

And the sentence that goes with it: **کلید داخل سیم‌کارت را فقط کسی می‌تواند بگذارد که سیم‌کارت را صادر کرده است.**

---

# 2. Two things missing from the contract model

## 2.1 پیش‌نویس — before there is a contract

You are right, and this was a real hole. Until every field is filled there is nothing to sign and no price to quote, so there is no contract — there is a **draft**, which binds nobody.

```
پیش‌نویس            فیلدها در حال تکمیل · هیچ امضایی · هیچ تعهدی
    ↓  همهٔ فیلدها پر شد
قرارداد             اپ امضا می‌کند — اولین امضا همیشه مال اوست
    ↓
در انتظار امضا      کاربران یکی‌یکی امضا می‌کنند
    ↓
امضاشده → اجرا
```

This resolves the shared-ride flow, and it also resolves rent, where the landlord fills in the property before anything exists to sign. **The app signs when the draft becomes a contract, not before** — because before the price is known it has nothing to commit to.

## 2.2 رویدادهای پس از قرارداد

Also right, and also missing. Signing is not payment, and payment is not delivery. At least four distinct moments:

| Moment | What happens |
|---|---|
| **امضا** | funds must exist and are **blocked**, not taken |
| **کسر** | money actually leaves — which may be at delivery, not at signature |
| **تحویل** | the service confirms fulfilment |
| **لغو / بازگشت** | the block is released, or money returns |

Each is an event attached to the contract, and each **appears as a message from that app in that app's chat** — «سفارش شما تحویل شد» arriving from Snappfood, under the contract it belongs to. That is how a receipt should feel, and it means the chat is also the audit trail.

Book, not deck. The deck shows one signature and one outcome; the book carries the state machine. **COMMENT**: ببین داخل ارائه هم باید به این نحوی که میگم بیاد یه جایی هست که داره فهرست اپ‌ها رو نشون میده شبیه فهرست چت‌های تلگرام اولا که اینجا یه اشتباهی می‌کنه که روی هر یه دونه اپ که میزنی میره تو صفحه تنظیمات اون اپ که این اشتباهه وقتی رو یه دونه اپ میزنی باید بره به صفحه چت با اون اپ وقتی اون بالا روی اسم اپ میزنه باید بره به صفحه تنظیمات اون اپ که تو صفحه تنظیمات اون اپ خیلی چیزها هست دیگه میتونه مجوز ها رو لغو بکنه میتونه یه دونه اپ رو در واقع میوت بکنه که دیگه نوتیفیکیشن نیاد و خیلی کارهای دیگری که توی مثلاً صفحه تنظیمات یه دونه چت با نتیجه نفر کاربر یه دونه ربات میبینه اینجا هم هست مثلا تصاویری که با اون اپ به اشتراک گذاشته و از همه مهمتر قراردادهایی که با اون اپ به اشتراک گذاشته رو می‌تونه توی فهرستی تو صفحه تنظیمات اون اپ ببینه این صفحه تنظیمات یک اپ مجزا هست از صفحه چت با اون اپ تو صفحه چت با اون اپ میتونه قراردادها رو ببینه پیام های که فرستاده جوابایی که اون داده و همچنین رویدادهایی که روی قرارداد اومده رو میتونه ببینه برای همین وقتی که روی یه قرارداد یه اتفاقی میفته مثلا سفارش تحویل میشه خب یه دونه پیام میاد در پاسخ به اون قرارداد این رو میتونه یک نمونه اش رو توی همون پروتوتایپ ببینه مث روی اسنپ فوت میزنه مثلا یه دونه قرارداد سفارش غذا رو ببینه و یه پیام هم میبینه که روی اون در واقع ریپلای داده که مثلاً سفارش شما تحویل شد به همراه زمانش که مثل تلگرام اون پایینش زمان را نوشته و خلاصه اینها

---

# 3. Four things I had wrong

## 3.1 Cafe Bazaar

I said their weakness is that transactions do not pass through them and must be audited afterwards. **That is simply false** — Cafe Bazaar has payment and mandates it.

Your version is the real one, and it is a better argument: **their payment is an obligation with no benefit to the app.** The developer would rather use their own gateway; they use Cafe Bazaar's because they are made to.

Ours is the opposite. The assistant can complete a payment in one step, inside the conversation, with no redirect to a gateway. **That is easier than what the app would build for itself**, so an app uses it because it is better, not because it is compelled. And the position that follows is stronger than a mandate:

> **اگر اپی ترجیح داد درگاه خودش را بیاورد، با او نمی‌جنگیم. فقط راحتیِ پرداختِ ما را از دست می‌دهد.**

A platform that does not need to compel is in a better negotiating position than one that does — and it reads far better to a partner who is deciding whether to trust us.

## 3.2 The competition

I wrote that no competitor has a cross-service capability marketplace. **Wrong** — Eitaa has one, Bale has one, Ap likely does. Rubika is the exception.

Worse, having removed that claim I had left **no stated advantage over Bale at all**, which is the one competitor that matters. The advantage is the thing the whole product is about and I failed to say it:

> **بله یک هوش مصنوعی دارد و جدا از آن یک بازار خدمات. اما نمی‌شود از طریق آن هوش مصنوعی، آن خدمات را فراخوانی کرد.**
>
> **در ویستا، دستیار خودش خدمات را صدا می‌زند.** کاربر نمی‌رود سراغ مینی‌اپ؛ می‌گوید چه می‌خواهد و دستیار سراغ اپ درست می‌رود، قرارداد را می‌آورد، و کاربر فقط امضا می‌کند.

That is the whole differentiator in three lines, and it is defensible because bolting an assistant onto a mini-app market is not a feature — it needs the capability declaration, the contract layer, and the permission model underneath it.

## 3.3 Bring your own key, not bring your own agent

I had this wrong in a way that mattered. Taking our MCP into ChatGPT cannot work, because the signing and contract infrastructure is not there — so there is nothing to promise.

What you actually want is narrower and more useful: **the user supplies a provider address and an API key and their own model drives Vista's assistant**, instead of the model we supply. The assistant, the contracts, the apps and the signatures are all still ours; only the brain is swapped.

And the pricing correction: **our model is not free either.** The user pays for it. Bringing your own key is an alternative for someone who wants a stronger model, not an escape from paying. **COMMENT**: if they bring their own provider and api key, they dont pay. it's like Hermes.

## 3.4 Review once per company, not per version

Simpler than what I had, and right: **verify the provider once** — a real company, registration documents, a responsible legal entity — and then **every service that company publishes carries the blue tick.** No per-service review, no re-review on every version.

That also removes the whole "we pin the manifest and monitor for drift" apparatus from the deck. It can stay in the book as an operational detail; it is not a pitch element.

---

# 4. Colour, and a word

**Red was doing the wrong job.** I had seal-red marking signed parties and completed states, which reads as alarm where it should read as reassurance. Corrected semantics:

| | Meaning |
|---|---|
| **سبز** | امضاشده · انجام‌شده · احرازشده · اعتماد |
| **قرمز** | منتظر شماست · اختلاف — یعنی جایی که باید نگاه کنید |
| **آبی** | دستیار و عناصر تعاملی |

Trust is green. Red is for what wants you.

**And one word, everywhere: «قرارداد».** «سند» is gone. Two words for one object was making the deck feel translated.

---

# 5. Sponsorship — the off switch becomes a product

Your answer is better than mine: **paying to turn sponsored suggestions off.** It is a real revenue line rather than a concession, it is a pattern users already understand from every app they use, and it still gives the honest answer to a regulator — the user can always remove it.

So there are two ways to be free of sponsorship: pay, or bring your own key and pay for that instead. Both are the user buying their way out with money instead of attention, which is a coherent position. **COMMENT**: bring your key is irrelevent to this switch

---

# 6. What comes out of the deck

**Deleted entirely:** تقسیم صورتحساب · پذیرش و بازبینی هر نسخه · چه چیزی روی دفتر می‌نشیند · یک بار بساز در سه جا اجرا کن · وکالت as a use case, which moves to the roadmap.

**On "build once, run in three places" — you are right and the reverse is the real pitch:**

> **همین حالا بات تلگرام یا بله دارید؟ با تغییری اندک، همان بات در ویستا کار می‌کند.**

That is addressed to people who exist, about work they have already done. The version I wrote was addressed to a developer who does not exist in this market, about a place we do not want them to go.

---

# 7. Deck rebuild — what I am changing

| Slide | Change |
|---|---|
| قرارداد | remove the two leaked lines; «قرارداد» only; app composes and signs; assistant never signs |
| سفارش غذا | no separate memory — the assistant searches the app and «قراردادهای من» |
| سفر مشترک | corrected flow: draft → guest fills → app signs → payer signs |
| تقسیم صورتحساب | deleted |
| وکالت | deleted as a use case; appears in the roadmap |
| هوش مصنوعی در دسترس نیست | rebuilt as a phone prototype — assistant greyed in the list, other apps still working |
| کلید خودت را بیاور | rewritten: own provider and key, inside Vista; our model is paid too |
| پذیرش و بازبینی | deleted; replaced by one line — verify the company once, blue tick for all its services |
| دفتر و داده | deleted |
| مدل | reordered: Chinese partner → two partners → open weights → API then self-hosting → mid-size model, stated not defended |
| SDK | de-technicalised: one spec, given to the partner's own developer AI |
| یک بار بساز… | replaced by the Telegram/Bale port pitch |
| مدل درآمد | Cafe Bazaar corrected; easy payment as the reason apps use it, not compulsion; paid ad-free tier added |
| رقبا | Bale has a market; our advantage is the assistant that calls services |
| پیش‌نیازها | plain language, fewer items: legal path, PKI, Chinese model partner |
| ریسک‌ها | risk and answer visually separated |
| اسلاید پایانی | plain Persian |
| **new** | پلتفرم: وب و اندروید، و اینکه پلهٔ ۴ فقط دست صادرکنندهٔ سیم‌کارت است |

Building it now.
