# Vista — Round 10 Analysis

**Input:** your COMMENTs on Round 9.

Five design answers this round — contract states in the list, app health, the forwarding primitive you introduced, a revised phase list, and a recommendation on the sponsorship question you left open. Your forwarding idea turns out to be the largest of the five.

---

# 1. Settled

- in fact **«قراردادهای من»** — adopted, replacing «پرونده». The plain name is better; it says what the screen is rather than what it means.
- in fact **«پشتیبانی» is in phase 1.** Which follows: money moves in phase 1, so disputes exist in phase 1, so the front door has to exist too.
- **Six system apps:** دستیار · ویترین · مالی · قراردادهای من · تنظیمات · پشتیبانی.
- **The two deliberate omissions go in the book only, not the deck.** Agreed — a deck should not spend a reader's attention on what we did not build.
- **Default-screen behaviour: book only.**

---

# 2. Forwarding into the assistant — the biggest idea in this round

Your notification case is a much larger primitive than it looks, and I would formalise it as:

> **هر چیزی که در ویستا هست — پیام، اعلان، قرارداد — می‌تواند به دستیار فوروارد شود.**

Four reasons it is worth naming rather than treating as a feature:

**(a) It removes the last argument for a notifications centre.** Konkooria sends «آزمون فردا ساعت ۸». The user forwards it to the assistant and says «برام ماشین بگیر برای اون ساعت». The notification did its job in the chat where it belongs, and the action happened where actions happen. A notifications screen would have added a place to look without adding a thing to do.

**(b) It is the human-carried bridge between apps.** MCPs are leaves and no app can talk to another through the assistant — that boundary is what makes the security model hold. But the *user* can carry content across, and when they do, they have chosen to. So the system feels connected without the boundary moving. **This is app-to-app communication with a human in the loop, and it is safe precisely because the human is the transport.**

**(c) Forwarding a contract is the strongest small feature in the product.** The user forwards a document they are about to sign and asks «این یعنی چی؟» — and the assistant explains it. In one gesture:

> **دستیاری که سند را برایت توضیح می‌دهد، ولی نمی‌تواند امضایش کند.**

That single line carries the whole architecture to a non-technical reader better than any diagram we have. It also does real work — it is the answer to "users will sign without reading", which is the standard objection to any consent-based system.

**(d) It is a gesture users already have.** Forwarding is the most-used verb in Telegram. We are not teaching anything.

**One security note, and it is small:** forwarded content is untrusted data, exactly like any MCP response. If someone forwards a hostile notification containing instructions, the assistant reads it as text about which the user asked a question, never as an instruction. That rule already exists; forwarding just makes it user-initiated, which if anything is safer.

---

# 3. Contract states in the list — the rule that stops badge proliferation

You are right that expired contracts need different treatment. The general rule I would propose:

> **حالت روی ردیف فقط برای چیزهایی است که کاری از کاربر می‌خواهند. باقی حالت‌ها رویدادی در گفت‌وگو هستند.**

| State | Where it shows |
|---|---|
| **در انتظار امضای شما** | badge on the row, accent colour — the single most important state in the product |
| **در انتظار دیگری** | quiet line on the row, no badge; informational, nothing to do |
| **در اختلاف** | badge on the row — ongoing and actionable |
| **منقضی شد** | a message in the chat, once. Row returns to normal |
| **رد شد** · **لغو شد** | same — an event, not a state |
| **اجرا شد** | same — an event, and the receipt |

So an expired contract is not a lingering alert; it is a moment in a conversation, which is also how it actually feels to a person. And the row stays clean, so «در انتظار امضای شما» never has to compete for attention.

**One addition:** a contract nearing expiry should warn before it dies — «این قرارداد تا ۱۰ دقیقه دیگر منقضی می‌شود» — for anything time-boxed or high-value. Silent expiry of a booking a user believed was made is a support call and a lost transaction.

---

# 4. App health — and the part that is not cosmetic

Three states, per app, including the assistant:

| State | In the list | Meaning |
|---|---|---|
| **در دسترس** | normal | everything works |
| **محدود** | muted, small mark | reachable but some capabilities are failing |
| **در دسترس نیست** | greyed out | unreachable |

Health comes from the platform's own probing plus the app's self-report, with the platform's observation winning when they disagree.

**Two consequences that matter more than the colour:**

**(a) The assistant must not offer a capability whose app is down.** Health feeds planning, not just rendering. An assistant that confidently offers a broken service is worse than one that says the service is unavailable — it converts an outage into a broken promise.

**(b) A contract belonging to an unavailable app cannot be signed.** The sign button is disabled with «این اپ در دسترس نیست». The alternative — accept the signature and queue the execution — produces the worst possible sequence: the user signs, believes it is done, and finds out later that it was not. Better to refuse clearly at the moment of signing.

**And system apps are different.** If مالی is unavailable, payment is unavailable everywhere, which is not an app-level grey row but a platform incident and should be surfaced as a banner. Greying out the wallet row would understate it. **COMMENT**: no.

---

# 5. Sponsorship — you were undecided, and your instinct is better than my rule

My earlier line — placement sellable, recommendation not — was too blunt, and your example is the sharper version of it. «اپ الف برای تو مناسب است و اپ ب هم اسپانسر ماست» is honest, legible, and does not degrade the answer. That is the Google pattern: the organic answer stands, the paid one is labelled and adjacent.

**The distinction that actually matters is not placement versus recommendation. It is this:**

> **پاسخ فروخته نمی‌شود. حضورِ کنارِ پاسخ فروخته می‌شود.**

Three tests that make it enforceable rather than a slogan:

1. **The answer must be identical whether or not anyone paid.** If removing every sponsorship from the system would change which app the assistant names first, the line has been crossed. This is testable — run the recommendation engine with sponsorship stripped and diff the output. I would make that an actual internal check, not a principle.
2. **The sponsor is named as a sponsor, in the assistant's own voice.** Your phrasing is right; it is more honest than a small grey "Ad" label and it costs nothing.
3. **Never inside a formed intent, and never in a confirmation.** Once the user has said what they want, money cannot change who fulfils it; and the document surface stays free of anything paid for.

**One addition I would push for:** a per-user switch that turns sponsored suggestions off entirely. Very few people will use it, so it costs almost nothing in revenue — and being able to say "the user can turn it off" is worth a great deal with both users and a regulator. It converts the feature from something done *to* the user into something they permitted. **COMMENT**: they should pay to switch sponsored sggestions off.

---

# 6. The phase list, revised

You said it needs revisiting, and it does — three of the things it was built around are gone and six system apps have arrived.

in fact **فاز صفر — پیش‌نیازها.** Nothing ships. Persian agentic evaluation harness · model partner contract, dual-source, open weights mandatory · PKI design · end-to-end prototype of the contract layer, from composition to signature to execution to record · accelerator sourcing started, since it has the longest lead time of anything · the licence list handed to Irancell as their obligation.

in fact **فاز یک — اثبات.** Konkooria and Irancell self-service.
The six system apps · the contract engine · **signature rungs ۱ and ۲ only** (authenticated request and OTP) · bots, mini-apps and MCP · payment on Bank Sina's existing rails, no stored value yet · contract sharing by link and SMS · SDK v1 · dispute handling through پشتیبانی.

in fact **فاز دو — مقیاس.** The Irancell subscriber base.
**Signature rungs ۳ and ۴** — device key and SIM — which depend on the PKI and cannot precede it · وکالت · the stored-value wallet under the bank's licence · third-party apps through the SDK at the verified tier · پمپاژ هوش as a sold product · tiered model routing and the start of self-hosting.

in fact **فاز سه — گشایش.** Open app addition at scale · marketplace monetisation · in-app user-to-user chat, behind messenger licensing · voice · and, to be evaluated rather than promised, tokenised assets and self-executing contracts.

**The one sequencing decision worth stating aloud:** the signature ladder splits across phases 1 and 2. Rungs 3 and 4 are the operator's distinctive asset, and they are also the ones that depend on PKI and SIM work with long lead times. So phase 1 launches with request-and-OTP — which is what every Iranian banking app already uses and which users accept — and the asset that no competitor can copy arrives in phase 2, when the infrastructure for it exists. Naming that openly is better than letting a reader assume the SIM signature is in the first release.

---

# 7. Deck changes I will make now

- **New slide: لایهٔ سیستمی.** The six apps, the onboarding contract, and the sentence about exemption from the prompt but not from the document. **Without** the two omissions, per your comment.
- **New scene: نصب با درخواست.** «برایم یک اپ برای آموزش زبان نصب کن» → the assistant searches ویترین → recommends → the start contract appears.
- **P3 rebuilt:** system apps at the top and visually distinct, no revoke on their permissions, health states with a greyed-out app, and contract states on rows per §3.
- **P1 gains forwarding:** the user forwards a contract and asks what it means; the assistant explains and still cannot sign. This is now the strongest thirty seconds in the deck.
- **UX slide:** Jakob's Law named, plus the line about spending the entire novelty budget on one object.
- **Roadmap slide:** rebuilt to §6, with the signature-ladder split stated.

Building these next.

---

# 8. Open questions

1. **The sponsorship off-switch (§5)** — worth including, or does it read as an apology for the feature? **COMMENT**: read above
2. **Health self-report versus platform probe (§4)** — I have the platform's observation winning. Any reason a partner would object? **COMMENT**: platform probe winning
3. **Phase 1 without rungs ۳–۴ (§6)** — comfortable stating openly that the SIM signature lands in phase 2? It is more credible than implying it ships first, but it does move your distinctive asset out of the launch story. **COMMENT**: OK
