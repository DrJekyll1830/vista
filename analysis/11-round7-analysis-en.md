# Vista — Round 7 Analysis

**Input:** `analysis/10-transcription.md` — four voice notes cutting scope hard.

This round removes more than it adds, and the removals are right. Below: what survives the cut and what has to be renamed, the answer to your open question about the app's second signature, three gaps the new model opens, and the exact plan for reworking the deck.

---

# 1. What this round decides

| Decision | Status |
|---|---|
| Smart contracts as a founding feature | **Removed.** Roadmap mention only, and phrased as "we will evaluate", not "we will build" |
| EVM, Besu, chain substrate | **Removed** from book and deck entirely |
| Deterministic, immutable contract execution | **Removed** — the app can change its backend at will and we cannot see it |
| Bank Sina rewrite / chain | **Removed** — the bank is an app that composes and signs payment contracts |
| Bots as the phase-1 integration unit | **Confirmed** |
| `/start` as the consent event | **Confirmed**, with an Android-shaped permission screen |
| Permission grant and revocation as a contract | **Confirmed** |
| Platform named as a party to contracts | **Removed** — it is a party to everything, so naming it carries no information |
| Any app addable by URL | **New** |
| Contract content separated from contract style | **New** |
| The app composes and signs the contract, not the AI | **New, and the most consequential change** |
| System modules exempt from permission | **New** |

**Nothing in the product thesis died with the smart contract.** The differentiators were always one identity across services, one payment, one assistant that composes across apps, a uniform contract and permission model, and the operator assets. None of those needed a chain. Only the plumbing got simpler — and the deck should read that way, not as a retreat.

**And the strongest business argument survives intact.** Atomic fee collection — never having to audit a partner's revenue reporting — came from the platform executing the payment, not from chain code. Without a VM it is *easier*, not harder.

---

# 2. The thesis after the cut

"دو هوشمندی: هوش مصنوعی و قرارداد هوشمند" no longer works, since half of it is gone. The second thing has not disappeared, though — it was never the chain, it was the signed, structured, multi-party, auditable document. It needs a name that does not say "smart contract."

**Proposed replacement:**

> **ویستا دو چیز به سرویس‌ها می‌دهد که خودشان ندارند: فهم، و اعتماد.**
>
> فهم، یعنی دستیاری که می‌فهمد کاربر چه می‌خواهد و بلد است سراغ کدام سرویس برود.
> اعتماد، یعنی هر تعهدی سند دارد، امضا دارد، مجوزش روشن است و بعداً قابل اثبات است.

This keeps your two-part structure, survives the removal of the chain, and is easier for a non-technical reader than "two intelligences" ever was. «پمپاژ هوش» stays as the narrative term for the first half; the second half is «لایهٔ اعتماد» or simply «قرارداد».

---

# 3. The app composes the contract — and the invariant it creates

This is a bigger change than it looks, and it improves three things at once.

**It shrinks the AI's role again, in the right direction.** The assistant no longer authors the document; it interprets the user and asks the right app to produce one. The کارپرداز metaphor actually becomes *more* accurate: a real procurement clerk does not draft the contract either — he goes to the supplier, has the supplier's own contract filled in, and brings it back for signature.

**It settles the template question you objected to in Round 4.** Templates belong to the app, not to a platform library. The platform defines the *schema and the rules* — what fields a contract must carry, how signatures bind, how permissions are declared — and never a catalogue of contract types. That is exactly the position you wanted and it now falls out of the architecture rather than being a policy.

**It gives the SDK its core job:** teach a partner how to compose, sign, and style a contract. Everything else in the kit is supporting material.

**But it creates one thing that must be stated as an invariant.** If the app composes, signs, *and* styles the document, the app controls what the user sees. The protection is that there is nothing else to execute:

> **سند، خودِ دستور است.** هیچ چیزی اجرا نمی‌شود که در متن امضاشده نباشد.

Display and execution cannot diverge, because the signed text *is* the instruction — there is no separate execution payload that could say something different. This replaces the old "authoritative confirmation" machinery completely and is simpler than either earlier version. It should be one of the numbered principles.

---

# 4. Your open question: when does the app sign a second time?

You asked for help here. I think the confusion dissolves with one rule:

> **On any given version of a contract, the app signs first and the user signs last. The app never signs the same version twice. Any change produces a new version, which the app signs once.**

Walk the cases:

| Situation | What happens |
|---|---|
| Nothing changes between app signature and user signature | No second signature. The offer stands, the user accepts. This is the great majority of cases. |
| The user edits a term (quantity, address, note) | The hash changes, so the app's signature is void. The client sends the amended draft back through MCP; the app re-composes — possibly at a new price — and signs **the new version** once. The user sees the updated document. |
| The offer expires before the user signs | Same as above: a fresh version, freshly signed. |
| Multi-party (your shared-ride case) | Host signs; the guest fills the open field; that is a new version, so the app signs it again — but again, once per version — with the fare now computed; host re-confirms; guest signs. |
| The app confirms delivery after execution | **This is not a signature on the contract.** It is a *signed event attached to the contract.* |

That last row is worth keeping separate in the data model. **امضا روی قرارداد** binds a party to terms. **رویداد امضاشدهٔ پیوست به قرارداد** records that something happened afterwards — delivered, cancelled, refunded. Mixing them makes the audit trail ambiguous; separating them makes dispute resolution straightforward. **COMMENT**: good

So: no dedicated UI step for "the app signs." The contract simply arrives already signed, the client verifies that signature before rendering, and the only signature the user ever sees requested is their own.

---

# 5. Content and style — with the boundary that makes it safe

Your XML/XSLT framing is right, and Snappfood pink / Snapp Doctor blue / Snapp green is exactly the kind of detail that makes the product feel finished rather than generic.

It needs one boundary, though, precisely because the app now controls both content and presentation:

> **اپ فقط پالت را تعیین می‌کند: رنگ تم، نشان، و لحن عنوان. چیدمان، ترتیب فیلدها، محل نمایش مبلغ، و بلوک امضا همیشه در اختیار سکو است.**

Without that line, a hostile app could style a contract so the amount is de-emphasised, the recipient is hidden below the fold, or the signature block looks like an ordinary button. With it, every contract in Vista looks structurally identical no matter who composed it — which is itself a security property, because the user learns one document shape and can spot a wrong one.

Practical form: the app supplies a small, validated theme object (a primary colour, a logo, a display name). Nothing more. The style is a *skin*, never a layout. **COMMENT**: correct.

---

# 6. The permission model

Android is the right reference and users already understand it. Two refinements.

**Permission classes, declared by the app and shown at `/start`:** send notifications · read profile · read contacts · read location · store data about me · message me without prompting · **withdraw money up to a ceiling**.

**The last one is not like the others.** Contacts and notifications are Android-shaped: grant once, revoke anytime, low blast radius. A standing withdrawal permission is the وکالت from Round 5 and it needs its own treatment — a ceiling and an expiry as mandatory fields, no unlimited grants, a higher signature rung to grant than to use, no re-delegation, immediate unilateral revocation, a visible spend record, and notification on use. So the permission screen should have **two visually distinct sections**: ordinary permissions, and financial authority.

**Granting, changing, or revoking is a contract version.** The permission set of an app is simply the current version of the start contract between the user and that app. Increasing a permission is a new version requiring a new signature; revoking is unilateral and immediate and does not require the app's agreement.

**And you are right about the platform.** Since Vista is a party to every contract everywhere, naming it as a party carries no information and only adds noise to every document. It stays implicit.

---

# 7. Adding any app by address — the one risk, and a clean line

Letting a user paste an address and start any MCP is a genuinely good idea. It removes the deployment bottleneck, it is exactly how MCP servers are added in ChatGPT's developer mode, and it makes the ecosystem open at the edges while staying curated at the centre.

**It is also the phishing surface.** Telegram has this exact problem: a user is talked into starting a hostile bot. Here the stakes are higher because permissions include money.

The mitigation should be a single clean line rather than a set of restrictions:

> **هر کسی می‌تواند هر اپی را اضافه کند. اما فقط اپِ احرازشده می‌تواند مجوز مالی بخواهد.**

An unverified app — anyone, any address, no coordination with us — can read, converse, render a mini-app, and compose contracts the user signs one by one. To request *standing financial authority*, the app must be verified: a real legal entity, identity checked, with declared limits. That keeps the ecosystem open where openness is valuable and closed exactly where the damage would be.

Supporting details: unverified apps are visually marked throughout, cannot send unsolicited messages, are rate-limited, and their start screen looks visibly different from a verified one.
**COMMENT**: correct. verified apps have a blue check like twitter

---

# 8. System modules

Agreed, and the OS analogy carries it: installing the system is consent to the system. Identity, payment, notification, the assistant itself and the contract layer do not ask permission for their own function.

One caution worth a line in the book: **the system-module set must be small, fixed, and published**, and adding to it must be a platform governance decision — never something a partner can request. Otherwise "system module" becomes the escape hatch through which permission checks are avoided, which is how this pattern fails on every platform that has tried it.

---

# 9. Where your EVM argument is right — and its one boundary

Your reasoning is correct and it is sharper than my Round 4 framing. I had said money must flow through contract code on our substrate rather than through an MCP. Your objection is stronger: **the app is the counterparty, and the app's own behaviour is unverifiable no matter what.** If Snappfood signs a contract to deliver food and then does not, no execution environment fixes that. On-chain code would only be an escrow wrapper around a promise it cannot enforce. For phase 1, EVM buys nothing and costs a great deal.

There is one boundary where the argument stops holding, and you should know it so you know when to revisit rather than discovering it late:

**When a contract holds user funds over time** — a deposit, escrow with a long window, a gold balance, loan collateral — the question changes from "does the app behave" to "can the holder of the money take it." Under platform execution, the custodian is Vista. That is a perfectly defensible answer; it is the same answer every regulated financial institution gives, and in Iran a regulator would almost certainly *prefer* an accountable institutional custodian to autonomous code.

So the honest formulation for the roadmap line:

> بستر قرارداد هوشمندِ خوداجرا زمانی معنا پیدا می‌کند که طرف‌هایی وجود داشته باشند که به خودِ سکو هم اعتماد نکنند. تا آن روز، لنگرِ اعتماد سکوست، و این یک انتخاب آگاهانه است نه یک کمبود.

That converts the deferral from an omission into a stated position, which is a much stronger place to be if a technical reviewer asks.

---

# 10. Bank Sina after the cut

Bank Sina's role in phase 1 is now: **an app — with high trust and verified status — that composes and signs payment contracts and moves money.** No core change, no chain, no rewrite.

The book's banking part therefore shrinks from eight chapters to roughly three: why the bank, the payment and wallet licensing path, and the digital-signature and SIM story. The resilience and modernisation programme stays in the book as an **independent programme with its own justification**, explicitly outside Vista's critical path — which was your own instruction back in Round 2 and is now structurally true rather than merely asserted. **COMMENT**: you misunderstood me. I said we dont need to do blockchain on Bank Sina. but it's not just a verified app! it's the payment provider and is one party of all financial contract!! so we dont name it in contracts!!!

---

# 11. The evidence problem — you are right, and the fix is editorial

Your objection is correct: evidence is cited to support a claim, and the deck currently front-loads statistics before it has made any claim worth supporting. "۵۰۰ میلیون کاربر از مینی‌اپ استفاده می‌کنند" is meaningless to a reader who does not yet know we are building something with mini-apps.

**The fix is to dissolve the statistics slide and move each number to the claim it supports:**

| Number | Moves to |
|---|---|
| MCP adoption, and its donation to the Linux Foundation | the standards slide — supports "we are not betting on one vendor" |
| Telegram mini-apps: 500M users, >$1B volume | the bot and mini-app slide — supports "this pattern works at scale" |
| Inference cost falling ~10× per year | the model and cost slide — supports "a mid-size model is enough and will get cheaper" |
| Gartner: >40% of agentic projects cancelled by 2027 | the risk slide — supports "governance is the failure mode, and it is what we built" |
| SWIFT / Besu / 17 banks | **deleted** |

This is better than a fix; it is how the deck should have been built. A number sitting next to the sentence it proves is worth more than five numbers on a wall.

---

# 12. The presentation — rework plan

**Delete:** the substrate slide (24), the standalone evidence slide (3), tokenised assets as a use case (18, reduced to one roadmap line), every mention of EVM, Besu, chain, and «قرارداد هوشمند».

**Rework:** the two-intelligences slide (7) into فهم و اعتماد · the contract anatomy slide (8) to show the app as composer and to remove the platform as a named party · the standards slide (23) to three layers, with the settlement layer described as the platform's own execution · the roadmap slide to carry the deferred items honestly.

**Add — and this is where you want the weight:**

1. **Phone prototype: adding an app.** An interactive phone frame inside the slide. The viewer types into the assistant «می‌خواهم با این اپ کار کنم» with an address; the assistant returns the start contract; the permission list appears with checkboxes; the viewer ticks and signs; the app joins the list.
2. **Phone prototype: the app list.** A Telegram-shaped chat list showing the apps the user has started, with a floating **+**. Tapping an app shows the contracts signed between the user and that app, and its current permissions with a revoke control. **COMMENT**: and user can chat with that app/bot or opens mini app just like telegram
3. **Phone prototype: a contract in the app's own colours.** The same contract rendered in Snappfood pink and then in Snapp green, to show content and style separated — the layout identical, only the palette changing.
4. **Mini-app.** The bot's own graphical interface rendered inside Vista, for users who prefer a screen to a conversation — with the note that identity, payment and contracts stay ours.

**Net deck length:** roughly 34–36 slides, more interactive and less expository than the current version, which is the direction you asked for.

I will build this next unless you want changes to the plan first. The phone frame is the main new construction; the three prototypes can share one component with different content. **COMMENT**: you should have 3 main components: phone view, chat view and contract as attachment.

---

# 13. Open questions

1. in fact **«فهم و اعتماد» as the replacement thesis (§2)** — does that phrasing work for you, or do you want to keep "دو هوشمندی" with the second one redefined? **COMMENT**: هوشمندی و اعتماد
2. **Verified-app requirement for financial permissions (§7)** — agreed as the line between open and controlled? **COMMENT**: agreed
3. **The style boundary (§5)** — app supplies palette only, platform owns layout. Agreed? **COMMENT**: agreed
4. **Roadmap phrasing for self-executing contracts (§9)** — do you want the "trust anchor" sentence in, or would you rather the roadmap simply list it without justification? **COMMENT**: note that except me, all the readers did not see the previous versions. so we should not say them why sth changed or deleted!!
5. **Bank Sina part shrinking to three chapters (§10)** — or do you want the resilience material kept at fuller length since it is a real programme? **COMMENT**: only in book. not in the presentation.
