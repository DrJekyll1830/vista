# Vista — Round 9 Analysis

**Input:** your COMMENT on Round 8 and `analysis/13-transcription.md`.

Three things: the system-app layer, which I think is right and needs one guard to keep the trust story intact; my proposal for the rest of the set, including two I would deliberately *not* build; and a correction on the citation you want in the book.

---

# 1. The Android framing, and the one guard it needs

Making Vista an operating system with system modules is right, and «ویترین» is a stronger idea than a store — see §3. But there is a real tension to close before it goes in the book.

**The whole trust story rests on "the user grants, and the user can revoke."** If a growing set of apps is exempt from that, the story erodes exactly where a sceptical reader will press. And the Android analogy is weaker here than it looks, for one specific reason:

> **کاربر اندروید را انتخاب نکرده — با دستگاه به او رسیده. اما ویستا را خودش نصب می‌کند.**

Someone who installs Vista to order food has not knowingly consented to a payment module and a store. So "you installed the system, therefore you consented" does not carry the same weight for a downloadable app as it does for an OS.

**Two things close the gap, and both are cheap:**

**(a) The onboarding contract.** At first run the user sees exactly what is built in and what it does, once, and signs it. It is a contract like any other, it is stored in the record, and it is the document that makes system modules legitimate. This keeps the invariant whole: **there is no software in Vista that acts without a signed document behind it.**

**(b) System modules are exempt from the permission prompt, not from the contract.** This is the sentence that resolves everything:

> **ماژول سیستمی از «اجازه گرفتن» معاف است، نه از «سند دادن».**

The financial module still produces a signed payment contract for every transfer. ویترین still shows the start contract before anything is installed. The assistant still brings documents rather than acting. So the user never grants the financial module permission — but they also never move money without signing for it. Nothing about the security model changes; only the prompt disappears where it would be noise.

With those two, the exemption is defensible under questioning. Without them it is the first thing a bank's security reviewer will attack.

**And the set must be countable.** Small, fixed, published, and listed in the book so a reader can count them. Adding to it is a governance decision, never a partner request. A list a reader can count is a promise; an open-ended category is a loophole.

---

# 2. The system apps — my proposal

Your four, plus one, minus two I would argue against.

## Confirmed

| App | Role |
|---|---|
| **دستیار** | the default chat; the app opens here |
| **ویترین** | discovery and installation of every other app |
| **مالی** | wallet, transactions, payment history |
| **تنظیمات** | identity and authentication setup, signature keys, theme, defaults |

Seeing the assistant as an app is a good simplification and it is already true in the build: chatting with the assistant and chatting with a bot are one component with different content.

## One I would add

in fact **«پرونده» — the record.** Every contract you have ever signed, across every app, in one chronological, searchable place: what you signed, with whom, when, at which signature rung, what it cost, and what happened afterwards. Permissions live here too, because **a permission is a contract** — so revoking one is done where it was granted, not buried in settings. **COMMENT**: good. add it. but rename it as قراردادهای من

I think this is the most important one after the assistant, for a reason beyond utility: **it is the only place the trust claim becomes visible.** Everything else in the architecture — hash-bound signatures, signed events, the audit trail — is invisible plumbing until the user can open one screen and see their own history as documents. It is also, incidentally, the screen to show a regulator.

مالی then becomes the money-shaped view of the same underlying record, not a separate archive.

## One that depends on scope

in fact **«پشتیبانی»** — a system bot for complaints, disputes and account problems. Disputes need a front door, and a dispute is a signed event attached to a contract, so it belongs in the same model. Whether it is phase 1 depends on how much of the liability work is in phase 1; if disputes are deferred, so is this. **COMMENT**: good. add it.

## Two I would deliberately not build

**A notifications centre.** Android has one; we should not. In a chat-shaped product a notification is a message and it belongs in the chat of the app that sent it. A separate notifications screen would duplicate the chat list and immediately drift out of sync with it. **This is a case where the Telegram model beats the Android model, and saying so in the book demonstrates that the system-app list was designed rather than copied.** **COMMENT**: OK. a use case: an app (e.g. Konkooria) sent a notification. user should be able to forward it into the assistant and chat about it.

**A contacts app.** Sharing a contract, splitting a bill, gifting — none of these need a contacts *destination*; they need a contacts *picker* at the moment of sharing. Telegram does it this way and it is right.

**Net: five system apps, six if support is in scope.** Countable, defensible, and two of them argued for by what we chose not to copy.

---

# 3. ویترین is bigger than a store

Two things about it are worth pulling out.

**It reconciles the two onboarding paths.** Curated discovery (browse ویترین, read reviews, see screenshots) and open addition (paste any address) are not two competing models — **they are two ways of arriving at the same door.** Both end at the same start contract with the same permission screen. That is worth one sentence in the book, because "open ecosystem" and "curated store" usually read as a contradiction and here they are not. **COMMENT**: OK

**Discovery by intent is genuinely new.** «برایم یک اپ برای آموزش زبان نصب کن» → the assistant searches ویترین, recommends, and shows the start contract. Neither Play Store nor Telegram can do that. It should be a named capability in the deck, not a footnote — it is one of the few places where the assistant does something a menu structurally cannot. **COMMENT**: OK

**One guard, and it is the same one as before.** The moment the assistant recommends apps, that recommendation becomes the most monetisable surface in the product — and selling it would corrupt the thing the whole architecture exists to protect. The rule already agreed applies here specifically: **placement in ویترین can be sponsored; the assistant's recommendation cannot.** This is where the temptation will actually arrive, so the rule should be written down next to ویترین rather than only in the revenue chapter.

**And a small obligation:** reviews and ratings mean user-generated content, which means moderation. Minor, but real, and it should not be discovered later. **COMMENT**: OK

---

# 4. The familiarity argument — and the right citation

Your reasoning is correct and it deserves to be in both the book and the deck. But the attribution needs fixing before it is printed.

**The precise statement of your point is Jakob's Law, from Jakob Nielsen** — not Nir Eyal:

> «کاربران بیشتر وقتشان را در جای دیگری می‌گذرانند؛ پس ترجیح می‌دهند محصول شما همان‌طور کار کند که بقیهٔ چیزهایی که می‌شناسند کار می‌کنند.»

Nielsen's own framing is that users spend the overwhelming majority of their time on products other than yours, so their mental models are formed elsewhere; when a design deviates from those expectations, usability suffers. That is exactly the claim you are making.

**Eyal is still usable, but for the adjacent point.** *Hooked* treats the action step through BJ Fogg's model, where a behaviour needs motivation, ability and a trigger — and familiarity increases *ability* by lowering the effort of figuring out what to do. So the strongest version of the passage uses both:

> جیکوب نیلسن قاعده را می‌گوید: کاربر مدل ذهنی‌اش را جای دیگری ساخته و انتظار دارد اینجا هم همان‌طور کار کند. نیر ایال توضیح می‌دهد چرا این‌قدر مهم است: هر چه انجام یک کار آسان‌تر باشد، احتمال انجامش بیشتر است، و آشنایی مستقیماً همان آسانی است.

Citing Eyal alone for what is Nielsen's law would be caught by a reader who knows the field, and using both makes the paragraph stronger than either. **COMMENT**: OK

**Applied to us, the argument in the book runs:**
- The chat list is Telegram's, because that is the mental model Iranian users have for "things I am in conversation with."
- The chat itself is ChatGPT's, because that is the mental model they now have for "talking to an assistant."
- The contract as an attachment is the one new object — and it appears inside a container the user already understands, which is the only reason a new object is affordable at all.

That last line is the real point, and it is worth making explicitly: **we spend our novelty budget in exactly one place.**

---

# 5. Your question about the app list component

Telegram's chat list, not Android's app drawer — and there is a functional reason beyond familiarity that is worth having in your pocket:

> **دِرَورِ اندروید اپ‌ها را نشان می‌دهد؛ فهرست تلگرام رابطه‌ها را.**

A row in a chat list can carry the last message, unread state, and — uniquely here — **a contract waiting for your signature.** An app icon cannot express "this one is waiting for you." Given that a pending signature is the single most important state in the product, the chat list is not merely more familiar; it is the only one of the two that can show what matters. **COMMENT**: we should show expired contracts in another way.

And yes: settings belongs in that list as a system app, exactly like the others, reachable by chat or by its mini-app.

---

# 6. Default screen, with one addition

Your rule: open → assistant chat · deep link → that app's chat · settings may make the list the default.

One behaviour to add: **if the assistant is unavailable, the default flips to the list.** Otherwise the user opens into a dead conversation, which is the worst possible first impression of a degraded state — while opening into the list makes the degradation almost invisible, since everything still works. **COMMENT**: we should have a health status for each app including the assistant. if an app is not available, it should be grayed out.

---

# 7. What I will change in the deck

- **New slide: the system layer.** The five apps, the onboarding contract, and the sentence about exemption from the prompt but not from the document — plus the two we deliberately did not copy, because that is what shows the list was designed. **COMMENT**: the two that we dont copy should not be in the deck. just in book.
- **P3 (app list) updated:** system apps at the top of the list, visually distinct, no revoke control on their permissions — and پرونده and ویترین added as rows. **COMMENT**: OK
- **New scene inside P2 or beside it: installing by asking.** «برایم یک اپ برای آموزش زبان نصب کن» → the assistant searches ویترین → recommends → the start contract appears. This shows discovery by intent, which is the differentiator. **COMMENT**: OK
- **UX slide gains the familiarity argument** with Jakob's Law named, and the "one new object inside a familiar container" line. **COMMENT**: OK
- **Default-screen behaviour** noted on the degradation slide. **COMMENT**: just in book

Say the word and I will build these; otherwise I would suggest we start on the book, beginning with «قرارداد» and «هوشمندی و اعتماد».

---

# 8. Open questions

1. in fact **پرونده as a system app (§2)** — agreed, or do you want the record folded into مالی and تنظیمات? **COMMENT**: agreed under قراردادهای من
2. in fact **پشتیبانی in phase 1?** It depends on whether dispute handling is in scope for the first release. **COMMENT**: in phase 1. and the phase list needs revisit.
3. **The two deliberate omissions (§2)** — happy for the book to argue explicitly against a notifications centre and a contacts app? I think it strengthens the chapter, but it is your call whether the book should spend space on what we did not build. **COMMENT**: it's OK for the book.
4. **Sponsorship in ویترین (§3)** — placement sellable, recommendation not. Confirmed as the line? **COMMENT**: I'm not sure yet. for example assistant says "App a if perfect for you and App b is also our sponsor"
