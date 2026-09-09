# Vista — Round 5 Analysis

**Input:** your COMMENTs on Round 4, plus the five voice notes at 20:20–20:53.

Three moves this round, in descending order of importance: **contracts are bilateral**, which closes the loop back to Irancell's original API-gateway request; **delegation (وکالت)**, which is the most powerful and most dangerous feature yet proposed; and **the bot pivot**, which replaces the mosaic with something better. Then the smaller answers, and an honest note about 23,000 users.

---

# 1. Bilateral contracts — and the thing this quietly fixes

You are right that no contract should be unilateral, and the consequence is larger than the correction.

## 1.1 It retires "authoritative confirmation"

From the very first document, the hardest security requirement was: *the user must see the real price, not the model's claim about the price.* The answer was that the client fetches authoritative data from the service before showing the confirmation form. It worked, but it was machinery.

**With bilateral contracts it disappears.** The service signs the terms. Its signature *is* the authoritative attestation. There is nothing left to fetch and nothing left to verify separately — the user is looking at a document the service has already cryptographically committed to. If the terms were wrong, the service signed them anyway and is bound.

This is strictly stronger than the earlier mechanism, because before, the service merely *reported* the price; now it *commits* to it. And it is much easier to explain.

## 1.2 It makes these actual contracts, which matters legally

Offer, acceptance, defined terms, identified parties, consideration. Your model reproduces the structure of contract law rather than approximating it. In the liability chapter this is worth a great deal: the difference between *"the user tapped OK in an app"* and *"both parties signed a document with defined terms, and here is the signed instrument"* is the difference between a disclaimer and evidence.

## 1.3 Who signs first — the rule you asked for

You asked whether the service always signs first. It should not; the template declares it, and the rule is:

> **Whoever commits to terms the other party will rely on signs first.**

| Pattern | First signer | Then | Examples |
|---|---|---|---|
| **Offer → acceptance** | the app | the user accepts | food order, ride, purchase, subscription — the seller commits to a price, the buyer accepts |
| **Request → acceptance** | the user | the app accepts or declines | loan application, service request, appointment request — the user commits, the provider evaluates |
| **Peer** | either | the other | rental between two users, split payment — order is immaterial, quorum is what matters |
| **App ↔ app** | initiator | counterparty | data exchange, service composition (§2) |

**A practical addition: pre-signed offers.** Requiring a live signature from the service before every order means a synchronous round trip and a new failure mode. Most of the time it is unnecessary — the service can **pre-sign an offer** with a validity window, exactly like a signed price list or a quotation. The menu is signed once; the order references it. Only price-volatile or inventory-constrained cases need a live counter-signature. Without this, every food order waits on Snappfood's signing service, and the first outage becomes a product outage. **COMMENT**: it's not such a big deal. the app signer is the app itself. if it's out, then that app is out.

## 1.4 Three-party contracts

Your restaurant + Snappfood + user example is right and the model handles it: parties with declared roles, a declared quorum, and per-party field projections so the restaurant sees the order but not the customer's payment instrument. The fee split (§8.2) is where the third party earns its place in the document.

---

# 2. The unification you found: the super-app *is* the API gateway

This is the most important structural insight so far, and I think it should be a chapter of its own.

Irancell asked for an API gateway. You moved the requirement toward a super-app. In your voice note you noticed that these are not two projects — **contracts between apps are the API gateway's write path, and policy-governed reads are its read path.** One mechanism serves both.

**The unified actor model:**

| Principal | Identity | Reads via | Writes via |
|---|---|---|---|
| **Person** | Vista identity, MSISDN-rooted | their agent, or a bot directly | signing a contract, rungs 0–4 |
| **App / organisation** | app identity, key in HSM or software | MCP / API, under read policy | signing a contract, with declared limits |
| **Agent** | acts *for* a person, never *as* one | on behalf of its principal | **cannot sign — drafts only** |

Three principal types, one read path, one write path. A contract does not care whether its signers are two people, a person and an app, or two apps. **That single sentence is the API gateway.**

What it means in practice, and what to say to Irancell: *the API gateway you asked for is not cancelled and not deferred — it is the same mechanism as the super-app, seen from the app side instead of the user side.* That is a far better answer than "we changed the requirement," and it converts what could look like scope drift into architectural economy.

**App-to-app contracts need no AI at all.** As you said, deterministic code can compose the contract; app A signs, app B signs, done. Worth stating explicitly in the book, because it demonstrates that the platform is not AI-dependent at its foundation — the AI is a convenience for the human path.

## 2.1 App identity, limits, and their governance

Your model here is right and recursive in a satisfying way:

- Every app has a **declared signing mechanism** — software key or HSM — recorded in its registry entry.
- Every app has **declared transaction limits**: per transaction, per day, per counterparty class.
- Limits are tied to assurance level: a software key earns modest limits; an HSM plus operational requirements earns higher ones.
- **Changing an app's limits is itself a bilateral contract**: the app requests, the platform agrees. Governance uses the same primitive as everything else.

Two additions. First, this requires **an internal PKI** — issuing app identities and keys, rotation, revocation, and a certificate policy. It is unglamorous, it has a long lead time, and it should be a named workstream from the start rather than discovered later; it is also the same infrastructure the SIM signature story eventually needs, so the investment is shared. Second, the registry entry — signing mechanism, limits, capabilities, data permissions, review status, current version hash — should be **publicly visible to users**. "This app can move up to X per day and signs with an HSM" is a trust signal no competitor offers, and it costs nothing to publish. **COMMENT**: I agree with PKI but let's keep the transparency problem open.

---

# 3. Delegation (وکالت) — the most powerful feature, and the most dangerous

Your ERC-20 analogy is exactly right: `approve` / `allowance` generalised from tokens to arbitrary capabilities. And your framing of the two automation modes is the right decomposition:

- **Per-event consent** — the bill arrives, the user is shown a pre-filled contract, the user signs each time.
- **Standing consent (delegation)** — the user grants an app authority to act within limits, once, and the app then acts without further signatures.

Both are needed. Subscriptions, standing orders, family allowances, automatic bill payment, and any recurring service require the second.

## 3.1 The object

A delegation is itself a bilateral contract — the user grants, the app accepts:

```
Delegation {
  grantor, grantee
  scope:        which contract types / which counterparties / which capabilities
  ceiling:      per transaction · per period · aggregate
  period:       daily / monthly / total
  valid_until:  mandatory expiry
  conditions:   optional (e.g. only bills addressed to this user)
  revocable:    always, unilaterally, immediately
  usage:        running record of what has been spent under it
}
```

Editing a delegation — raising, lowering, or revoking — is a new contract, as you said. Revocation is the exception: **it must be unilateral and immediate**, never requiring the grantee's agreement.

## 3.2 Where I push back on "prefer no policy over over-restricted policy"

I have agreed with that principle everywhere else, and I agree with it for reads. **Delegation is the one place where I would not apply it**, for a specific reason: every other part of this system has the user present at the moment of action. Delegation is defined by the user's absence. The safety cannot come from the confirmation step, because there is no confirmation step.

The Ethereum ecosystem ran this experiment for us, and unlimited `approve` allowances became the single largest source of consumer losses through phishing — users granting infinite spending authority to a contract they did not understand, then being drained months later. That is accumulated knowledge you explicitly want to inherit. **Inherit the scar tissue too.**

Six rules, all cheap:

1. **No unlimited delegations, ever.** A ceiling and an expiry are mandatory fields, not defaults that can be set to infinity.
2. **Granting requires a higher signature rung than using.** If the delegation permits actions at rung 1, granting it requires at least rung 2 or 3. A meta-capability must cost more than the capability. This is the single most important rule here.
3. **No delegation chaining.** A grantee cannot re-delegate. Otherwise the confused-deputy problem returns through the back door.
4. **One screen listing every active delegation**, with what has been spent, what remains, and one-tap revocation. Users will not audit what they cannot see.
5. **Periodic re-consent.** Long-lived delegations resurface for reconfirmation — quarterly is reasonable — with usage shown.
6. **Notify on use, at least in summary.** The operator's notification channel is right here; use it. Silent spending is what makes delegation abuse invisible.

None of these limit what a legitimate app can do. All of them limit what a compromised or malicious one can do while the user is not watching.

## 3.3 What it unlocks

Worth listing in the book, because it is a large product surface from one mechanism: automatic bill payment, subscriptions, family and child allowances with ceilings, employee spending authority, recurring rent, savings rules, an app that renews a data bundle when it runs low, and — later — an agent operating within a budget the user has set. That last one is the long-term direction of the entire product, and delegation is its prerequisite.

---

# 4. The bot pivot — accepted, with one synthesis and one warning

This is a good change and better than the mosaic. Bots give you a mental model Iranian users already have, a natural fallback that requires no shadow UI, a cheap integration unit, a visible home for contracts, and — elegantly — **`/start` as consent**, which makes the anti-abuse rule from Round 4 fall out of a familiar UX pattern instead of a policy document. Your framing that starting a bot is itself signing a contract is exactly right, and it should be built that way rather than described that way.

## 4.1 The synthesis: the mosaic did not die, it became the mini-app

Your two ideas are compatible, and Telegram has already proven the combination at scale. A bot is a *container*, and it can render a web view. So the provider's existing responsive web UI becomes a mini-app inside the bot conversation — which is the mosaic tile you described in Round 3, now framed inside a conversation that already carries identity, payment, notification, and contracts. **COMMENT**: good.

**The precedent is strong enough to cite in the book.** Telegram has over a billion active users, with around 500 million engaging with Mini Apps; Mini Apps generated over $1 billion in transaction volume in 2025, projected past $5 billion by 2027; the @Wallet bot alone serves about 25 million active accounts with zero-fee transfers between contacts. Mini Apps are ordinary HTML/CSS/JS running inside the client, and a medium-complexity one costs roughly $20–50K over three to six months.

Two things follow. First, **"build a bot" is a much smaller ask than it sounds** — bot shell plus a mini-app pointing at the provider's existing responsive web. Say this explicitly to partners, because "build a bot for us" otherwise sounds like more work than a web link. Second, the transaction-volume figures are the answer to anyone who thinks conversational commerce is speculative.

## 4.2 The UI question — a concrete recommendation

"Copy ChatGPT, and fall back to Telegram" is the sharpest product line in the corpus, and your observation that Eitaa and Bale succeeded precisely by copying Telegram closely is the right evidence for it. But the two references have incompatible information architectures, and you asked which of your two options to take.

My recommendation, which is your second option with a specific shape:

> **The assistant is the app.** Opening Vista opens a full-screen conversation with the assistant, visually close to ChatGPT — because that is now the habituated pattern and it signals what Vista is in one second. **One gesture reveals the list** — bots, contracts, and later people — visually close to Telegram.

Not a mode toggle, which forces the user to understand a state; a drawer, which they can ignore. This matches your stated priority ordering exactly: services and the assistant first, conversation alongside. It also degrades correctly — if the AI is unavailable, the app opens on the list instead of the assistant, and nothing else changes.

**One thing to preserve from the ChatGPT reference:** rich rendering in the conversation. Cards, tables, forms, chips, and contract attachments. You already agreed to this in Round 3, and it is what stops pure chat from being worse than a native app for browsing and choosing.

## 4.3 The warning: user-to-user chat is a licensing event

This is where I would push back on sequencing rather than on the idea.

Bot-to-user messaging is a service interface. **User-to-user messaging makes you a messenger**, and in Iran operating a messenger is conditional on approval from the supervisory body — SATRA licensing, registration through the single window, and the content and oversight obligations that come with it. That is a substantial and continuing operational burden, and it is precisely the burden you wanted to avoid in Round 2.

**Recommendation:** launch with the assistant, bots, and contract sharing — where sharing travels by link, SMS, or any external messenger. That preserves nearly the entire product, including your shared-ride and split-payment cases, because a contract link works fine when sent through Telegram. Then add in-app user-to-user chat as a later phase, with the licensing path handled deliberately as its own workstream rather than as a side effect of a UI decision.**COMMENT**: OK. add it to book (roadmap section)

You lose very little and you defer a great deal. And it remains consistent with your own position that user-to-user conversation is a secondary feature you are not betting on.

One tailwind worth noting for the licensing chapter: there is a standing directive requiring executive bodies to deliver services and public information through domestic messengers. A service-oriented domestic platform with a bot model is unusually well positioned for that, and it is a distribution channel worth naming.

---

# 5. The contract as a message type

Your framing of the contract as an attachment — like a photo — is the right product primitive, and it deserves to be stated formally because it unifies a lot:

> **A contract is a message type.** It renders as a card showing terms, parties, signature status, and the action available to *this* recipient. It can be sent by a bot to a user, by a user to a bot, by a user to another user, by the assistant to its principal, and by an app to another app. It can be forwarded. Signing it is an action taken inside the message.

Everything collapses into this one object: the shared ride with a missing origin, split payment, a rental between two people, a bot's offer, a system-initiated bill, an app-to-app data agreement, a delegation grant, a limit increase. One message type, one card, one signature flow, one audit trail.

For the book, this is also the best possible illustration: a single screenshot of a contract card explains the entire product to a non-technical reader. **COMMENT**: we need a book and a presentation (html?). in that presentation, we should show some use cases graphically.

---

# 6. The SDK — and why it is the answer to the supply-side problem

Your comment about shipping an SDK as `.md` and `.yaml` files that partners feed to their own AI is, I think, more strategically significant than you framed it.

**Recall the biggest risk I raised in Round 2:** Vista is a two-sided platform and its fate depends on services integrating. Every argument since — distribution, demand, competitive advantage, pumped intelligence — addresses *why* they would integrate. **None addressed how expensive it is.** Integration cost is what actually kills platform adoption: a partner's product manager weighs three months of engineering against uncertain returns and defers.

An AI-readable specification changes that calculation. If a partner can point their coding agent at Vista's spec and have a working integration in days, the decision stops being an investment and becomes an experiment. **That is the single largest lever on supply-side adoption in the entire plan**, and it deserves a section rather than a mention.

**Proposed kit:**

| File                      | Purpose                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `SPEC.md`                 | the whole model in prose — principals, reads, contracts, signatures, delegation. Written to be read by a model as much as by a person |
| `capabilities.yaml`       | declare capabilities: read/write, parameters, data classes needed, risk level                                                         |
| `contracts/`              | contract manifests — terms schema, parties, roles, quorum, required rungs, fees, fulfilment mode                                      |
| `bot.yaml`                | commands, buttons, message types, mini-app entry point **COMMENT**: for bots and mini apps, we copy Telegram contract/interface       |
| `AGENTS.md`               | instructions aimed specifically at a coding agent doing the integration                                                               |
| reference implementations | one complete worked example per integration pattern                                                                                   |
| conformance suite         | a partner runs it and knows whether they are done                                                                                     |

There is a precedent worth citing: MCP itself spread this fast largely because its specification was simple enough for a model to implement against. Vista should copy that property deliberately.
**COMMENT**: we should adopt these standards: telegram bot/mini app, solidity/EVM, openAI (for bring your own agent) and MCP. but it's unclear how they co exist.

---

# 7. Contract admission without a template library

You did not like the closed template set, and combined with the SDK the better design is clear: **anyone can write a contract; what is gated is how much damage it can do.**

**Gate on blast radius, not on membership:**

| Tier | Ceiling | Requirements |
|---|---|---|
| **Sandbox** | very low aggregate value; test users only | self-service, SDK conformance suite passes |
| **Standard** | modest per-transaction and daily ceilings | automated analysis, review of the declared manifest, identified publisher |
| **Elevated** | high ceilings; may hold user funds | external audit, HSM signing, operational requirements |
| **Privileged** | may receive delegations; may issue tokens | audit plus formal verification for the money-touching paths, plus a bilateral agreement |

Ceilings rise with audit and with track record — the same progression you described for app transaction limits, which means it is one mechanism, not two.

**Audited reference libraries exist but are not mandatory.** OpenZeppelin's role in the Ethereum ecosystem is the model: most people use the reviewed implementations because it is easier, not because they are forced to. Combine that with the SDK and a partner's AI will naturally reach for the reference library, which achieves the safety benefit of templates without the constraint you objected to.

**Formal verification is reserved for the small set that everything depends on** — the rial contract, the escrow primitive, the delegation primitive, the fee-splitting primitive. Perhaps ten pieces of code. Verifying ten things is achievable, and it protects everything built on top of them.

---

# 8. Answers to the remaining comments

**8.1 SIM signature unlocks with a PIN — corrected.** Rung 4 is PIN-unlocked, not biometric. This is worth a sentence in the book, because it is a genuine security property rather than a detail: the SIM key is protected by something the user knows, and the device key by something the user is. Requiring both at the top rung means an attacker with an unlocked phone still cannot sign, which is exactly the SIM-swap and device-theft scenario from the risk register.

**8.2 Fee transparency as "can", not "must" — agreed and adjusted.** The platform *can* expose the fee split to signers, and where it does it is a strong trust signal. Making it mandatory would deter partners for no compensating benefit, and some commercial terms are legitimately private. Suggested position for the book: fee fields are always recorded in the contract and always auditable; **visibility to the user is a per-template choice**, and Vista's own first-party contracts choose full visibility as an example.

**8.3 Bank Sina's core, eventually — reconciled.** Three horizons, presented as a progression rather than as one project:
1. **Bank Sina as the rial contract issuer.** Small, fast, on Vista's critical path.
2. **Bank Sina's resilience and modernisation programme.** Jointly funded, valuable in its own right, *not* a Vista dependency.
3. **Core replacement.** The long horizon, via strangler-fig progressive replacement, explicitly not a precondition for anything above it.
Stating it this way keeps your ambition intact while ensuring no reviewer thinks the super-app is waiting on a core banking migration.

**8.4 "We do the first but advertise the second" — with one caution.** I read this as: build on the token substrate, describe it publicly as a bank wallet. That is legitimate **provided the legal substance genuinely is a bank-issued wallet** — the bank issues, the bank holds the float, the user's balance is a bank liability. In that case the plain description is not a euphemism, it is an accurate description at the level of abstraction the audience needs. Regulators judge substance, not vocabulary. So: make the substance genuinely a bank instrument, then present it plainly. Keep the internal technical documentation candid; there is no reason for the public description to lead with the substrate.

**8.5 Escrow versus optimistic release is a contract property — agreed.** Not a platform default. The template declares its fulfilment mode, its window, and its dispute path. You asked for examples rather than a policy, so the book should carry three worked ones: a food order (optimistic release, reverse on dispute), a rental (escrow with a deposit and a defined release condition), and a marketplace purchase (escrow with a delivery window). Examples will teach it better than a rule.

**8.6 Besu — confirmed and named.** With the SWIFT precedent as the argument.

**8.7 Bridges and general-purpose contracts — your framing accepted.** The substrate is general: it must support any smart contract. Whether a *particular* contract is admitted is a policy and regulatory decision made at admission, not an architectural limitation. That is the right separation and it is cleaner than what I proposed. The bridge caution survives, relocated: it is a note in the admission-policy section rather than a constraint on the platform.

---

# 9. Konkooria at 23,000 — handling this honestly

23,000 is a real atomic network by Chen's standard, where density beats size, and it is genuinely the right place to start: dense, connected, engaged, with a real payment need, and you own the hard side of it outright. All of that is true.

**It is also not a launch story for a board,** and the book will be weaker if it presents 23,000 users as the answer to "how does this reach scale." The honest structure is three distinct stages with three distinct purposes:

| Stage | Network | Purpose | What it proves |
|---|---|---|---|
| **Prove** | Konkooria, ~23K | validate the model end to end | that contracts, signatures, payment, sharing, and the assistant work with real users and real money |
| **Scale** | Irancell self-service subscribers | acquire the user base | that the mechanism holds at tens of millions and that telecom value is real |
| **Open** | third-party services via the SDK | build the ecosystem | that integration is cheap enough for partners to self-serve |

Presented that way, 23,000 is a strength — a controlled environment where you can make mistakes with people who will forgive you, before touching an Irancell subscriber base where you cannot. Presented as the plan, it invites the wrong question.

**One thing worth testing specifically in the proving stage:** contract sharing between users. It is the mechanic the whole social strategy rests on, it has never been tried in this market, and a student cohort is close to the ideal population for it.

---

# 10. What this does to the book

- **New chapter, foundations part: the contract as the platform's single primitive.** Bilateral by construction, a message type, signed at a declared rung. This is now the spine.
- **New chapter: apps as principals — the API gateway.** §2, and it should be prominent, because it answers Irancell's original request inside the architecture rather than beside it.
- **New chapter: delegation.** §3, with the ERC-20 lessons stated as inherited experience rather than as caution.
- **The availability chapter becomes the bot chapter.** Bots as first-class citizens, mini-apps as the rendering surface, the assistant as the primary interface with the bot list as the fallback. The mosaic material folds in here.
- **New section in the ecosystem chapter: the SDK,** framed as the answer to integration cost.
- **The security chapter simplifies again:** reads are policy-governed, writes are bilateral signed contracts, the agent drafts and never signs, delegation is the one place with strict defaults.
- **The competition chapter gains the Telegram Mini Apps evidence** as proof that conversational commerce is a proven pattern at scale, not a bet.
- **The licensing chapter gains SATRA** and the user-to-user sequencing decision.
- **The roadmap chapter gains the prove/scale/open structure** from §9.

---

# 11. Open questions

1. **User-to-user chat — defer to a later phase behind the licensing work (§4.3)?** My recommendation is yes; it costs little and defers a lot. **COMMENT**: OK
2. **Pre-signed offers (§1.3)** — agreed as the default for commerce contracts, with live counter-signature only where price or inventory demands it? **COMMENT**: OK. note that a rent contract is a 3 (or more) party contract: the app (which can pre sign it), the houselord, the tenant and possibly witnesses.
3. **The six delegation rules (§3.2)** — this is the one place I am arguing for strict defaults. Do you accept them, or is there one you want relaxed? **COMMENT**: agreed
4. **App registry visible to users (§2.1)** — publish each app's signing mechanism, limits, and review status? I think it is a free trust asset. **COMMENT**: only if that app wants.
5. **PKI as a named workstream (§2.1)** — it has the longest lead time of anything except hardware, and it is shared with the SIM signature ambition. **COMMENT**: yes, add PKI to the roadmap.
6. **The three worked examples for fulfilment (§8.5)** — food order, rental, marketplace purchase. Are those the right three, or would you swap one for a bill or a transfer? **COMMENT**: OK

---

# 12. On starting to write

The architecture has stabilised. The last two rounds changed the foundations; this one refined them and closed the API-gateway question, which was the largest structural gap remaining. I do not think another analysis round will produce as much as a draft chapter will, because the open questions above are now product decisions rather than architectural ones.

**Proposal:** I draft the foundations chapters first — the contract, the two intelligences, and the کارپرداز framing — because every other chapter refers back to them, and because seeing the argument in Persian prose will surface tone and terminology problems that no amount of English analysis will. Say the word and I will start with the contract chapter, applying the style guide from Round 3 and your paragraph rule.
