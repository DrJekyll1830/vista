# Vista — Round 8 Analysis

**Input:** your COMMENTs on Round 7. Short round — mostly convergent. Two things matter: the Bank Sina correction, and an editorial rule that turns out to have contaminated the current deck in three places.

---

# 1. Bank Sina — I had it wrong

You corrected me and the correction is structural, not a detail. Bank Sina is not a verified app. **It is the payment provider and therefore a party to every financial contract — which is exactly why it is never named in one.**

That puts it in the same structural position as the platform:

| Entity | Role | Named in contracts? |
|---|---|---|
| ویستا | party to everything | **No** — carries no information |
| بانک سینا | party to every financial contract | **No** — same reason |
| اپ سرویس‌دهنده | the counterparty for this transaction | **Yes** |
| کاربر · کاربران دیگر | the human parties | **Yes** |

**Three consequences worth stating in the book:**

**(a) There is no "Bank Sina bot."** The bank is not something the user starts, grants permissions to, or finds in the marketplace. The wallet, payment and transfer are **system modules** — which connects directly to your §8: the user consented to the payment system by using Vista, exactly as installing an operating system grants the OS its own functions. The bank is the institution behind that module, not an app inside it.

**(b) The bank's cut is a fee field, not a party.** Its share and Vista's share are declared amounts in the fee block of the contract. Fees do not require parties; parties require obligations.

**(c) But the bank has a second role, and that one *is* named.** When Bank Sina acts as the payment rail it is invisible. When it *sells a product* — a loan, a deposit, a facility — it is the counterparty like any other service, and it appears as a named party with obligations of its own.

So: **بانک سینا وقتی ریل است دیده نمی‌شود، و وقتی طرف معامله است نام برده می‌شود.** That single sentence resolves the whole ambiguity and should be in the banking chapter.

**And a benefit that falls out of it:** the deck no longer needs a banking use case at all. Every payment slide already demonstrates the bank without mentioning it. Banking depth moves entirely to the book, which is what you asked for.

---

# 2. The rule about readers who have not seen earlier versions

This is the most useful comment of the round, and it is broader than the roadmap sentence you flagged. **Nothing in the deck or the book may argue against a position the reader has never encountered, or explain why something is absent.** Every such passage is a trace of our conversation leaking into the deliverable.

I audited the current deck. **Three violations:**

| Where | Text | Problem |
|---|---|---|
| Slide ۲۰ | «همین چهار جمله جای کل آن دسته‌بندی سه‌سطحی و توکن‌های قابلیت و اجرا را می‌گیرد…» | Refers to a three-tier model and two token types the reader has never seen. Pure archaeology. **Delete.** |
| Slide ۲۴ | «چه وقت به این بستر نیاز پیدا می‌کنیم؟ تا وقتی قراردادها را خودمان اجرا می‌کنیم…» | Explains why we are *not* doing something. Slide is being deleted anyway. |
| Slide ۳۱ | «اگر حرف اصلی ما این باشد که «برنده‌ایم چون زودتر هوش مصنوعی آوردیم»، حرف سستی زده‌ایم.» | Self-critique. Reads as internal analysis, and puts a weak claim in the reader's head in order to knock it down. **Rewrite as the positive claim only.** |

**One passage I checked and am keeping:** slide ۹'s «در طراحی‌های متعارف، برنامه باید مبلغ را جداگانه از سرویس بگیرد…». That contrasts with ordinary industry practice, not with an earlier draft of ours — the reader can follow it without prior context. The test is whether the thing being argued against is something the reader already knows about the *world*, not something they would only know from our previous conversation.

**Applied to the roadmap:** self-executing contracts get listed as a future item with no justification. No "trust anchor" sentence, no explanation of why they are not in phase one. A roadmap lists what comes later; it does not defend what came out.

I will apply this test to every chapter as it is drafted.

---

# 3. Settled

- **Thesis: «هوشمندی و اعتماد».** Adopted.
- **Verified apps carry a blue check**, like Twitter's — instantly legible, and it does real work here since it is the line between an app that may request financial authority and one that may not.
- **Style boundary:** app supplies palette, platform owns layout. Confirmed.
- **Signed events kept separate from signatures on the contract.** Confirmed.
- **Bank Sina resilience material: book only, not the presentation.** Confirmed.
- **App list behaves like Telegram:** tap an app to chat with it, or open its mini-app; the contracts and permissions between you and it live in the same place.

---

# 4. The three components

Building the prototypes from three reusable pieces, as you specified:

| Component | What it is | Used in |
|---|---|---|
| **قاب گوشی** | the device frame — status bar, screen, home indicator | every prototype |
| **نمای گفت‌وگو** | message list — user bubbles, assistant bubbles, system notes, chips, buttons | adding an app · talking to the assistant · talking to a bot directly |
| **قرارداد به‌عنوان پیوست** | the contract card *inside* the conversation — terms, parties, signature state, action | everywhere a contract appears, in-chat and standalone |

The third is the important one: a contract rendered inside a chat bubble is the single image that explains the product. It is also what makes the styling demonstration work — the same card, the same layout, two different palettes. **COMMENT**: another component is "App List" we should think that it's like Telegram chatlist or like Android App deck. I prefer Telegram chat list. but maybe a settings help?

---

# 5. What I am building now

**Deck: ~37 slides.** Deletions: the substrate slide, the standalone statistics slide, tokenised assets as a use case, every mention of chain and EVM and «قرارداد هوشمند», and the three archaeology passages above.

**Numbers redistributed to the claims they support** — MCP to the standards slide, Telegram's mini-app figures to the bot slide, inference cost to the model slide, Gartner to the risk slide.

**Four new prototype slides:**
1. گفت‌وگو با دستیار — a request becomes a contract, in the chat
2. افزودن اپ تازه — paste an address, read the start contract, tick permissions, sign
3. فهرست اپ‌ها — the Telegram-shaped list, per-app contracts and permissions, revoke, mini-app
4. یک قرارداد، دو رنگ — content and style separated

**Rewritten:** the thesis slide to «هوشمندی و اعتماد» · the contract slide to show the app as composer and to name neither the platform nor the bank · the standards slide to three layers · the competition slide without the self-critique.
