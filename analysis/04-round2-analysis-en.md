# Vista — Round 2 Analysis

**Inputs:** `01-vista_concept_and_architecture.md`, my Round 1 (`02-vista_concept_en.md`) plus your six COMMENTs, and the voice transcript `03-transcription.md`.

**What this is:** the round-2 pass. Section 1 states what fundamentally changed. Section 2 answers your comments with concrete design. Section 3 delivers the two proposals you explicitly asked for. Section 4 is critical analysis of the new strategic material. Sections 5–8 cover new risks, the book plan, open questions, and claims to verify before publication.

---

# 1. What changed — the frame is different now

Round 1 analysed a platform architecture. The transcript reveals three things that reframe everything:

**1.1 This is not a vendor proposal. It is an incoming leader's terms of engagement.**
Irancell approached you to transform its technology division. The book therefore has to do three jobs at once: (a) convince them the direction is right, (b) demonstrate that you are the person who can execute it, and (c) state what authority you require. Job (c) is the actual purpose. Everything else is the argument that earns it.

*Consequence:* the mandate must appear **twice** — one page at the front (executive summary: here is what I propose and here is what I need) and one chapter at the end (the detailed version). A reader who only reads the first two pages must still see the ask. Right now the plan has it only at the end, where a 200-page book will bury it.

**1.2 The product is a super-app, not a gateway.**
Round 1 asked "consumer product or B2B platform?" — you have answered: consumer super-app with an AI chat interface, and the platform is the machinery underneath. That inverts the document's centre of gravity. Vista's definition changes from *"a distributed operating layer"* to:

> **Vista is an AI-first super-app — one conversational interface to the services people use every day — built on an operating layer that manages identity, permission, payment, and safe execution.**

The OS metaphor survives, but demoted: it is now how we describe the *architecture*, while "super-app" is how we describe the *product*. That is cleaner than Round 1 and resolves the tension I flagged in B4.2.

**1.3 There are two independent programmes, not one.**
Vista (super-app + platform) and Bank Sina (resilient, distributed, AI-addressable bank) each stand alone and must not be blended. Correct call, and the book structure must enforce it — separate parts, and ideally separate budgets, teams, and steering committees, with a named shared spine: **identity, intent, signature, ledger-of-record**. Those four are the only things both programmes must agree on. Everything else can diverge.

**1.4 Your super-app definition is a genuinely sharp thesis and should be stated as a thesis.**
The claim — that what Iran currently calls a super-app is a *mosaic* of mutually ignorant mini-apps behind one shell, and that a real super-app requires one uniform interaction model plus payment plus messaging/notification — is the most quotable idea in the transcript. It gives the book an argumentative spine rather than a feature list, and it defines your competitors as structurally incapable rather than merely behind. Make it Chapter 4 and reference it throughout.

One correction to it, in section 4.2 below.

---

# 2. Answers to your COMMENTs

## 2.1 (C6) OS metaphor — agreed, no further discussion
Used once, early, qualified; *Service Operating Layer* / *Agent Platform* thereafter. In Persian: «لایه عملیاتی خدمات». Registered in the style guide.

## 2.2 (C1) Multiple user types, each with its own client and capability surface

This is a bigger idea than it looks, and I think it should be promoted to an architectural principle rather than a detail. What you have described is that **intent + policy + signature is not a consumer feature — it is the universal control plane of the whole system**. The same machinery that stops an LLM from moving a user's money stops an administrator's agent from silently changing a network policy.

Proposed persona model — each row is a distinct client, a distinct capability surface, and a distinct risk ladder:

| Persona | Client | Representative capabilities | Notes |
|---|---|---|---|
| End user | Vista app | consumer services, payments | L1/L2/L3 as defined |
| Service-provider developer | Developer console | register MCP, publish version, view analytics | publishing is an intent, reviewed |
| Marketplace reviewer | Review console | approve/reject/suspend a capability | approval is an intent, logged |
| Bank branch officer | Branch client | account operations on behalf of a customer | **dual-control**: officer intent + customer confirmation |
| Bank back-office / operations | Ops console | batch, reconciliation, exception handling | high blast radius → M-of-N |
| Compliance / AML officer | Compliance console | investigate, freeze, report | freeze is L3, always dual-signed |
| Platform SRE / admin | Admin console | deploy, scale, rotate keys, kill-switch | kill-switch = single-sign emergency, everything else M-of-N |
| Network governance member | Governance client | protocol/policy change, add or remove node | **M-of-N signing, no single signer** |
| Auditor / regulator | Read-only client | query the ledger and audit trail | see below — this is a strategic asset |

Three design consequences:

**(a) Governance actions become M-of-N signed intents.** An administrator's agent can *propose* "disable all L3 actions for service X" or "add a validator node," but execution requires k of n governance signatures. This is the same pattern as the consumer flow, one level up, and it maps naturally onto a permissioned DLT's governance model. It also means an attacker who compromises one admin — or one admin's agent — cannot change the system.

**(b) Blast radius, not just risk level, drives the tier.** A consumer L3 action risks one user's money. An admin action risks every user. The tiering model therefore needs a second dimension (see 2.4 below), and admin capabilities should default to the strictest tier with explicit downgrades, rather than the reverse.

**(c) Give the regulator an agent.** A read-only supervisory client — where the central bank or an auditor can *ask questions in natural language against an immutable audit trail* — is, politically, one of the strongest cards in the entire proposal. It converts the regulator from an obstacle into a beneficiary, it is cheap to build once the audit layer exists, and no competitor has it. I would make this a named feature in the banking part, not a footnote. **COMMENT**: very good.

## 2.3 (C3) We define standards, but accept a big player's standard

Agreed and pragmatic. To make it operational rather than a slogan, the book should specify three things:

1. **A capability profile registry.** A "Vista standard profile" exists for each domain (`transport.request_ride`, `payment.charge`, `banking.transfer`), and vendor profiles may also be registered. An adapter normalises a vendor profile to the standard profile where the semantics permit.
2. **A non-negotiable core.** Whatever naming a large player brings, its capability must still satisfy the platform contract: an authoritative confirmation payload, a declared risk level, an idempotency key, an expiry, an error taxonomy, and a cancellation path. **Naming is negotiable; the authorization and confirmation contract is not.** Without this rule "we accept their standard" becomes "we accept their security model," which is the whole thing we are trying not to do. 
3. **Standard governance.** Who owns the standard, how it versions, what backward compatibility is guaranteed, and what happens to a published capability when the profile changes. Marketplaces die from unversioned interfaces.

Strategic note: defining the standard is the more valuable position. If Vista's profiles become how Iranian services describe themselves to agents, that is a durable asset independent of the app's own success. Worth stating in the book as a deliberate goal. **COMMENT**: do

## 2.4 (C4) Provider declares levels; >L1 is not in MCP; ≥L2 requires a token the agent never holds

This is the strongest idea in your comments and I want to both endorse it and repair two holes.

**Endorse — promote to a principle:**
> **The agent holds intent-creation capability only. Execution credentials are issued to the client, bound to an authenticated user session and to one canonical transaction, and never enter the model's context.**

This is a real confinement boundary, not a policy check, and it means a fully compromised model — prompt-injected, hallucinating, hostile — still cannot execute a consequential action. That is the sentence that should convince a bank CISO.

**Hole 1 — "not in MCP at all" breaks discovery.** The agent must know that `submit_order` exists in order to build a correct intent for it. Proposed precise formulation:

```
MCP surface (agent-visible):
    read capabilities            (L1)
    create_<action>_intent       (always L1 — creating an intent is not doing anything)
    query intent status

NOT an MCP tool at all (client-only, never model-visible):
    fetch authoritative confirmation payload for intent
    execute intent   ← requires execution token
```

So the agent can *describe* and *prepare* everything and *execute* nothing above L1. The capability catalogue still advertises the existence and schema of high-tier actions — it just does not expose an executing tool for them. This preserves discovery while keeping your confinement intact. **COMMENT**: true

**Hole 2 — provider self-declaration is an escalation path.** If Snapp declares `submit_order` as L1, the confirmation step disappears. Four mitigations, all cheap:
- **Taxonomy, not free-form.** Providers map their actions onto a Vista canonical verb taxonomy that carries default levels. Declaration becomes classification, which is reviewable.
- **Platform floor rules that override declaration.** Any action that carries an amount, mutates state, creates an obligation, or touches credentials is ≥L2 regardless of what the provider declared. A provider may raise a level, never lower it below the floor.
- **Certification at onboarding + re-certification on version change.** A capability's risk level is part of what the marketplace reviewer signs off. Behaviour change after approval is already on your risk list; version-pinned approval is the answer.
- **Contractual liability.** Misdeclaration shifts liability to the provider. This costs nothing to write and changes behaviour.

**Hole 3 — L1 is not risk-free, and the model is one-dimensional.** "Check balance" and "list my saved addresses" are L1 by consequence but carry sensitive data straight into the model's context, which is the exfiltration surface for prompt injection. I propose a **two-axis model**:

```
Consequence axis:   C1 read/no effect · C2 consequential · C3 high-value/irreversible
Sensitivity axis:   S1 public · S2 personal · S3 financial-confidential / regulated
```

The policy engine takes both. `search_restaurants` = C1/S1 → free. `check_balance` = C1/S3 → allowed but the result is *rendered to the client directly and summarised to the model only as a token/reference*, never placed verbatim into a context that a hostile MCP can later read. `submit_order` = C2/S2 → intent + confirmation. `transfer` = C3/S3 → intent + confirmation + step-up + signature.

The mechanism that makes S3 work is worth naming in the book: **reference-passing instead of value-passing.** The agent manipulates handles (`balance_ref#7f2`), the client resolves them against the authoritative service, and the user sees real values the model never held. It is the same insight as authoritative confirmation, applied to reads instead of writes, and it closes the data-exfiltration hole that the current design leaves open. **COMMENT**: ببین اینکه میگی خوبه ولی یه مشکلی داره اونم این هستش که خب مثلاً فرض کن مانده کاربر رو اگه خود ام سی پی نبینه این باعث میشه که نتونه یه سری کارا انجام بده مثلاً فرض بکنیم که یه دونه به هوش مصنوعی کاربر میخواد بگه که بر اساس مانده من برو ببین من چه وامی میتونم بگیرم خب این کار هوش مصنوعی از دو طریق باید انجام بده یعنی یک کاری که باید انجام بده این هست که بره از طریق ام سی پی بره ببینه که هر وامی چقدر مانده نیاز داره مثلا فرض کن و همچنین باید بدونیم که کاربر چقدر مانده داره تا این دو تا رو با همدیگه ترکیب بکنه تا اینکه بفهمه که چقدر میتونه کاربر وام بگیره وقتی که ما نذاریم طرف ماندش رو ببینه یعنی ام سی پی نتونه مانده رو ببینه در نهایت نمیتونه جواب درستی بده پس اجازه بدین ببینیم ما باید یک دیگه پیدا بکنیم که این اطلاعات نرفته جای دیگه مثلاً اینکه خب این الان ما یه دونه هوش مصنوعی داریم این هوش مصنوعی باید اینکه یه دونه ام سی پی رو میتونه فراخوانی بکنه و بعد از اون اون ام سی پی آیا بتونه هوش مصنوعی دیگر رو فراخوانی بکنه یا نه این‌ها رو مثلاً باید محدود بکنیم مثلاً این شکلی باید باشه که یه چیزی اون وسط باشه که نذاره که اطلاعات از یه سامانه بره به یه سامانه دیگه و جای فراخوانیشون باید مشخص باشه یک مقدار اینجا فکر کن من یه سری نظراتی دارم ولی میخوام چون قبلش یه مقدار فکر کرده باشیم

## 2.5 (C2) A book, not a proposal
Accepted in full. Structure, build pipeline, and style guide are in section 6.

## 2.6 (C5) Availability and degraded mode — "propose"
Section 3.1.

---

# 3. The two proposals you asked for

## 3.1 Availability, degradation, and the deterministic floor

The underlying decision here is bigger than an SLO table, so I will state it as a principle first:

> **The agent is an accelerator, never the only path. Every capability must be invocable without the model.**

If the entire product is reachable only through an LLM, then model latency, model cost, model outage, sanctions, Persian ASR quality, low-end devices, and accessibility are all single points of failure for the whole business. If instead the conversational layer sits on top of a complete, deterministic, schema-generated surface, then all of those become degradations rather than outages. This also gives you a demo you can run for a regulator with the model turned off, which is worth more than it sounds.

**Five operating modes:**

| Mode | Trigger | Behaviour |
|---|---|---|
| **1. Full agentic** | normal | conversation, planning, multi-step, all tiers |
| **2. Degraded agentic** | primary model unavailable / overloaded / cost ceiling | smaller or local model, reduced tool set, single-step only, L3 disabled |
| **3. Deterministic** | no model available | structured UI generated from the capability catalogue; recent and frequent actions surfaced as one-tap recipes; full payment and notification still work |
| **4. Read-only** | MCP or provider degradation | reads and status from cache/last-known-good; intents can be created and queued with explicit expiry; no execution |
| **5. Handoff** | capability fully down | deep-link to the partner app with context pre-filled |

**Supporting mechanisms:**
- **Model gateway with tiered routing and failover.** Cheap fast model for intent classification and routing; larger model only for genuine planning. This is a cost control as much as an availability one — per-session token cost is a scaling constraint that nobody has costed yet.
- **Per-capability circuit breakers and health in the catalogue,** so the agent never proposes a capability that is currently failing. An agent that confidently offers a broken service is worse than one that says the service is down.
- **Execution path independent of the model.** The architecture already gives this: intent creation may need the model, execution never does. So the execution path can carry a *higher* SLO than the conversational path.
- **Queued intents.** An intent created during an outage survives, with expiry and re-confirmation on resume — never silent later execution.

**Proposed SLOs to state in the book:**

| Path | Target | Rationale |
|---|---|---|
| App shell + deterministic surface | 99.95% | must survive everything above it |
| Payment / wallet | 99.95% | money must not depend on AI |
| Notification delivery | 99.9% | operator-grade expectation |
| Intent execution (post-confirmation) | 99.9% | no model dependency |
| Conversational (full agentic) | 99.0% | honest; degradation is designed, not an incident |

Publishing a deliberately lower SLO for the agentic path, with a designed fallback, reads as competence. Claiming 99.9% for an LLM path reads as inexperience.
**COMMENT**: I did not like your model. for now, if AI is not available, our super app degrades to mosaic that routes to all those backend services which each should have its own GUI (web) and only consumes our SSO and payment.
## 3.2 Social and messaging — do not build a messenger; build shareable intents

Your instinct is right that AI does not remove the need for human-to-human interaction, and your half-finished-ride example is, in my view, the single most original product idea in the whole corpus. But I would not turn it into a messenger, for three reasons: a general messenger is a war for attention against Telegram and Bale that costs everything and wins nothing; messaging in Iran carries content-moderation and lawful-intercept obligations that will consume disproportionate leadership attention; and it dilutes the one thing that makes Vista different.

**Proposal: the social primitive is the Intent, not the message.**

An Intent becomes a first-class shareable, multi-party object:

```
Intent {
  ...existing fields...
  participants: [ {user, role, contributed_fields, status} ]
  roles:  initiator | payer | beneficiary | approver | contributor
  missing_fields: [...]      ← what the recipient is being asked to supply
  share_token: single-use, expiring, scoped
}
```

Your example becomes native: a user creates a ride intent with the destination filled and origin missing, shares it, the guest opens the link, supplies the origin, and the initiator's payment method settles it. Nothing about this requires owning a messenger.

**Use cases the same primitive unlocks, in rough order of value:**
- **Split payment** — a bill intent with several payers, each confirming their share. Very high frequency, directly monetised.
- **Pay-for-someone-else** — book and pay for a parent's ride, buy a relative's phone credit. Enormous in Iran.
- **Delegated authority** — a parent grants a child, or a manager grants an employee, a capability with a spend ceiling and time window. This is the consent and policy engine you are already building, with a family/organisation UI on top, and it is a strong retention mechanic.
- **Group booking** — several people converging on one reservation.
- **Gifting** — an intent as a present, redeemable by the recipient.
- **Approval chains** — an employee creates, a manager approves. This is the same M-of-N machinery from 2.2, sold to businesses.

**Two design points that matter:**

*Share over any channel.* A shared intent is a link with a single-use scoped token. It can be sent through Vista, through SMS, or through Telegram and WhatsApp. **This means you capture the transaction without owning the conversation** — and the SMS path, where the recipient is not yet a Vista user, is a strong acquisition loop that only an operator can run cheaply. Owning identity by MSISDN gives you a native contact graph on day one.

*The abuse surface is real and must be designed for.* A shareable transactional object is a phishing instrument. Hard rules: a shared intent may **offer** value or **request a non-financial field**, but may never request money from the recipient without the recipient independently initiating; the recipient always sees the authoritative confirmation payload from the service, never the sender's description of it; tokens are single-use and short-lived; unknown-sender intents are rate-limited and visually distinguished; and there is no way for a shared intent to change what the initiator already approved.

**Then, and only then, a thin conversation surface.** Threads attached to shared intents and to the agent — not a social network. If messaging later proves strategically necessary, the operator's existing communication assets can be integrated, but it should be a phase-3 decision made on evidence, not a founding commitment. I would state it in the book exactly that way: **social capability now, messenger later and only if the data demands it.**
**COMMENT**: OK, good. I summarize what you say as: intent can be sharable and an intent may be multi signature. i.e. an intent may have multiple players each should sign/confirm it. an intent should hold last status of it (who already signs and who does not). it is a broad utility and can cover any contract like rent/sale/etc. but we need more formalization and more generalization

---

# 4. Analysis of the new strategic material

## 4.1 The AI chat interface is a wedge, not a moat

This is my most important disagreement, and it is a matter of emphasis rather than direction.

Being AI-first buys a 12–18 month lead. It is not defensible: Bale, Ap, Snapp, and MCI can all bolt a conversational layer onto what they have, and several will within a year of seeing Vista work. If the book's central claim is "we win because we are AI-first," the book is fragile.

What is actually defensible is a short list, and only Irancell has all of it:
1. **Subscriber base and a billing relationship with a large share of the country** — distribution that cannot be bought.
2. **SIM secure element and operator-grade identity** — literally impossible for a non-operator to replicate, and the foundation of the signature story. This is the single most under-used asset in the current draft.
3. **A bank in the group** — payment licensing, float, settlement, and a balance sheet.
4. **Notification reach across SMS, push, and in-app** — an operator-native channel.
5. **Zero-cost distribution** through Irancell's own owned media and channels.

The correct framing: **AI is the reason to move now; the operator assets are the reason it holds.** Restructure the competitive chapter around the five assets, with AI-first as the timing argument. This also makes the mandate ask stronger, because four of the five assets require organisational authority to unlock — which is precisely what you are asking for.

## 4.2 One correction to the super-app thesis: uniform ≠ text-only

Your critique of the mosaic super-app is right. But pure chat is a poor interface for browsing restaurants, picking a seat, comparing prices, or choosing a delivery window — and if Vista makes those tasks slower than Snapp's own app, users go back to Snapp's own app.

The precise version of your own thesis is stronger than the text-only version:

> A real super-app has one **interaction model**, not one widget. In Vista, the user always talks to one agent with one identity, one payment method, and one notification stream; the agent renders **structured surfaces generated from the shared capability schema** when structure serves the user better than prose. **COMMENT**: correct. current chatbots (like chatgpt) now do this. they show tables, links, forms, etc. a good example is claude design that has forms and renders prototypes.

The difference from the mosaic is then exact and defensible: mosaic mini-apps are opaque iframes that share nothing but a shell, whereas Vista's surfaces are generated from a common schema and share identity, payment, notification, memory, and policy. That is a sharper articulation of your own argument, and it conveniently is the same mechanism as the deterministic fallback in 3.1 — one investment, three payoffs.

Also worth stating explicitly, because it is a real differentiator you already identified: **memory and semantic search across services** is something no mosaic can do, because its tiles do not know each other exists.

## 4.3 Supply side — the answer is right, but the cold start is not solved, and you own the solution

Your answer to "what does Snapp gain" is sound: demand, ease of use, competitive advantage over rivals, Irancell's marketing muscle. But it is circular at t=0 — services join because you have users, users come because you have services — and the book must show how the loop starts.

**You control three unlocks, and the third is missing from every document so far:**

1. **Bank Sina** — agreed, mostly secured.
2. **Konkooria** — your own, willing.
3. **Irancell's own services — and this is the one to lead with.** Balance, top-up, package purchase, bill payment, usage queries, roaming, SIM services, support. These are the highest-frequency transactions in the entire proposed portfolio, they are owned outright, they need no negotiation, they are exactly the division you are being hired to run, and they produce daily active usage from day one. A user who opens Vista every week to buy a data bundle is a user Snapp will want to reach.

I would restructure phase 1 as: **Irancell self-service + Bank Sina (read-only and low-value payments) + Konkooria**, launched to a large user base, with Snapp negotiated from a position of demonstrated traffic rather than as a launch dependency. That converts the supply-side risk from a blocker into a sequencing problem, and it is materially more credible to a board than "we will get Snapp to integrate."

**On exclusivity:** I would not offer category exclusivity, even for a fee. It contradicts the vision (the agent choosing the best capability), it invites competition-law attention, it caps the marketplace, and it makes you dependent on the one partner you granted it to. Offer **time-limited launch-partner status** instead — preferential placement, co-marketing, favourable commercial terms for a defined window. Same incentive, none of the lock-in.

## 4.4 Revenue model — the Cafe Bazaar analogy works, with three corrections

The structural analogy holds: the platform provides distribution, mandates its payment rail, and takes a share. It is understood in the Iranian market, which is worth a lot in a proposal.

**Correction 1 — never take a percentage of GMV from a marketplace.** A ride costs 200,000 and Snapp's own take is perhaps 20%. A 30% platform fee on the ride is more than Snapp's entire revenue on it; no marketplace will ever agree. State the model precisely:
- **Marketplace/agency services** (ride, food, delivery): revenue share on the *provider's* commission, not on transaction value.
- **Direct/first-party sales** (digital goods, bundles, subscriptions, content): percentage of transaction value, tiered by category.
- **Financial transactions** (transfer, bill payment): per-transaction fee, small and fixed, because percentages on financial flows are both regulated and commercially impossible.

Publishing a differentiated rate card by category is itself a credibility signal.

**Correction 2 — add the revenue lines that a CFO believes on day one.** Take-rate revenue is real but slow and depends on volume you do not yet have. Three faster lines:
- **Telecom value**: higher ARPU, lower churn, and reduced call-centre and retail cost, from moving self-service into Vista. This is measurable within months, it accrues directly to the division you are being asked to run, and it is the easiest number for an Irancell CFO to accept. **COMMENT**: I did not get it.
- **B2B licensing of the layer**: Bank Sina pays for the AI banking layer; later, other institutions do too. **COMMENT**: ببین این چیزی که من مد نظرم هست اینه که ما می‌خواهیم به سرویس‌ها این قابلیت را بدیم که خودشون رو هوشمند بکنند یعنی مثلاً جستجوی معنایی و امثالهم رو فراهم بکنند بدون اینکه نیاز باشه که خودشون برن این رو انجام بدن و مثلاً پول توکن رو بپردازند و کد بنویسند برای صحبت با هوش مصنوعی و امثال و این ماه هستیم که هوش مصنوعی رو به داخل اینها پمپ می‌کنیم این اصطلاح پمپ کردن رو می‌خوام بهش بپردازیم و توی پروپوزال هم بع بیاد
- **Marketplace and placement**: developer fees, promoted capabilities, later advertising.  **COMMENT**: true: we can advertise a service on related chat.

Lead with telecom value, present take-rate as the scale story, and keep marketplace fees as the long tail. A proposal resting solely on a take rate that requires partners you do not yet have will be discounted.

**Correction 3 — the wallet is a licensing question before it is a product question.** Stored value, top-up from other banks, and settlement between merchants are all regulated activities in Iran. The book must name the intended licensing path — whether Bank Sina provides the licence, whether a PSP is acquired or partnered with, who holds the float, and how it settles. This is not a legal footnote: it determines whether the wallet exists at all, and it is one of the strongest arguments for the bank partnership beyond "a bank is a big service." Get this right and it becomes a chapter-length competitive advantage; leave it vague and any experienced reviewer will treat the payment plan as unserious.  **COMMENT**: OK. we need bank. and if we need anything else, we should name it so that Irancell negotiate it on behalf of me.

## 4.5 Competitive analysis — good, but three gaps

Bale (Bank Melli, settlement via Sadad), Ap (Bank Shahr), Eitaa (no payment arm) is a correct read of the messenger-plus-payment field. Three things missing:

**Gap 1 — Snapp is your most serious competitor, not just a partner.** Snapp already has ride, food, market, pay, doctor, and shop under one brand with an existing payment instrument and enormous daily usage. By your own definition it is a mosaic — but it is a mosaic that already owns the transactions you want, and it is one product decision away from adding a conversational layer. The book must address this directly rather than listing Snapp only as a capability provider. Honest framing: *Snapp owns the demand for individual services; Vista owns the interaction layer and identity across all of them* — and note that Irancell's shareholding makes this a governance conversation as much as a market one.

**Gap 2 — MCI/Hamrah-e Aval's response.** You have said MCI is ahead of Irancell in technology. A board will ask what MCI does when Vista launches. Answer it in the book: what they can copy quickly (the chat layer), what they cannot (your bank relationship, if it is exclusive, and your specific service portfolio), and what the timing window therefore is.

**Gap 3 — the Telegram argument needs sharpening.** "Telegram is filtered and Stars is unavailable" is true but weak: Telegram remains dominant in Iranian usage in spite of filtering, so absence is not the point. The stronger version is structural: **Telegram cannot do Iranian payment, cannot do Iranian identity, and cannot integrate Iranian services — Bale can do payment but is not AI-first and has thin service breadth — Vista can do all three.** That is a durable argument rather than a circumstantial one.

## 4.6 Bank Sina — the scope needs one important reframe

**"Rewrite the entire Bank Sina infrastructure" is the highest-mortality sentence in the corpus.** Core banking replacements are among the most reliably failed projects in enterprise IT, and any bank board or serious reviewer will read that sentence as inexperience. The content of what you want is right; the framing needs to change to a **strangler-fig migration**:

- New capabilities — intent layer, risk engine, agent surface, new ledger — are built on new infrastructure alongside the existing core.
- The new authoritative ledger runs in **shadow mode** first, reconciling against the legacy core until it demonstrably agrees.
- Functions migrate one domain at a time, each with a rollback path.
- The legacy core is progressively strangled and eventually retired — as an outcome, not a phase-one commitment.

Same destination, dramatically lower risk narrative, and it reads as expert rather than ambitious. It also lets Bank Sina work start producing visible results in months rather than years.

**On "survive the destruction of the Tehran datacentre" — this is the best DLT justification in the whole document, and it is stated slightly wrong.** Be careful here, because a sophisticated reviewer will catch it: a geographically distributed, active-active, strongly consistent cluster is achievable with conventional consensus (Raft/Paxos across sites) and is cheaper and faster than a DLT. Survivability alone does not justify distributed ledger technology. **COMMENT**: I dont insist on blockchain if Raft/Paxos is sufficient, so we'll use it. but what about smart contracts?

What *does* justify it is **mutual distrust among the replicas**. The honest and much stronger argument:

> Survivability can be solved conventionally. A permissioned DLT is warranted when the parties holding the replicas do not fully trust one another — bank, operator, regulator, and partner institutions each running a validator — so that no single organisation, and no single compromised administrator, can rewrite history, and so that tamper-evidence holds under adversarial conditions rather than merely under hardware failure. Physical survivability is a co-benefit.

State both options, pick DLT for the multi-party reason, and attach the decision gate I proposed in Round 1: a POC that must hit named throughput, finality, and recovery targets against a conventional replicated baseline, by a named date, or the conventional option wins. That single paragraph converts the most attackable part of the proposal into the most credible.

Two practical constraints to name: inter-city network latency in Iran directly bounds synchronous cross-site consensus, and the POC must measure it rather than assume it; and validator diversity is a governance problem — who is allowed to run a node is a political question, not a technical one, and it should be answered in the book.

## 4.7 The mandate chapter — make the ask concrete

"I will need the necessary authority" will be granted in equally vague terms and then contested in month three. Specify it. My proposed checklist for that chapter:

- **Reporting line and title** — to whom, with what seat at which table.
- **Budget authority** — the ceiling you can commit without external sign-off, and the process above it.
- **Hiring authority** — headcount, the ability to recruit outside existing salary bands (this will be the binding constraint on building a team of this calibre), and the ability to restructure.
- **Technology decision rights** — final say on architecture, vendor selection, and the ability to reverse existing commitments, including WSO2.
- **Authority over subsidiaries and affiliates** — the crucial one. What mechanism obliges or persuades group companies to expose capabilities to Vista? Without an answer, the platform depends on goodwill.
- **Product and pricing authority** — take rates, commercial terms with partners.
- **Time horizon and evaluation criteria** — what you will be judged on, when, and by what metrics. Propose these yourself; a leader who names the terms of their own evaluation is a leader who intends to deliver.
- **Escalation and veto rights** — what you can stop.

State them as what is required for the plan to be executable, not as personal terms. And say plainly, as you put it in the transcript, that without them the plan is not deliverable and it is better not to start — that sentence is the strongest one in the book, and it should be in it.  **COMMENT**: propose to me first

## 4.8 The overall credibility risk of the book

Assembled, the corpus now proposes: a super-app, an AI agent platform, a wallet and payment rail, a capability marketplace, a social layer, a core banking migration, a permissioned DLT, smart contracts, and a gold-backed stable asset. That is four or five companies' worth of work, and the natural executive reaction to a book containing all of it is *"this person will deliver none of it."*  **COMMENT**: ببین راست میگی که این کارو چند تا شرکته و اینجا هم واقعاً کلی تیم زیرش هست ذیل ایرانسل که بهش میگن لفظ ایرانسل لبز که توش تیم‌های مختلفی هست و هر کدوم از این تیم‌ها پروژه‌های مختلفی دستشون هست مثلاً یکیش امضای دیجیتال داره یکیشون چی چی داره خب من هم نمیخوم که این چهار پنج تا کار را همه رو با هم دیگه انجام بدم یکی از این دوتا باید اتفاق بیفته یا اینکه من رو بزارن سی تی او توی لبز که من این تیم های مختلف رو در واقع درست بکنم و اینها رو با همدیگه ربط بدم که مثلا خروجی مثلا تیم امضای دیجیتال برسه به تیم سوپر اپ یا مثلاً فیلم سوپر اپ رو وصل بکنم به بانک سینا و امثالهم یعنی من در واقع بشم ارتباط بین این تیم‌ها طبق همین چیزی که تو این کتاب دارم میگم یکی از اینا اتفاق بیفته یا این یا اینکه من یکی از این پروژه‌ها رو بگیرم بقیه رو دیگران انجام بدن ولی به من قول بدن که چیزهایی که لازم دارم رو انجام بدم که اون چیزی که من بیشتر از همه تو این بین این محصولات ترجیح میدم انجام بدم همون سوپرشن در واقع هوش مصنوعی اول هستش یعنی اینو من انجام بدم ولی خب بعد به من برسونن دیگه اپلیکیشن های که باید توی این سوپر اپ باشه رو باید به من برسونن بقیش رو هم دیگه تیم های دیگری باید انجام بدهند

Three structural mitigations:
1. **A hard, unmistakable line between committed scope and horizon.** The Core / Expansion / Vision tiering from Round 1 (A28) should be printed early and referenced at the start of every part, so a reader always knows which register they are in.
2. **One concrete twelve-month deliverable, named early and specifically.** Something like: *Vista v1 in market with Irancell self-service, Bank Sina read-only plus low-value payment, and Konkooria; N million registered users; X transactions per month.* One paragraph of concrete commitment buys credibility for a hundred pages of vision.
3. **The gold-token chapter is the credibility test.** You want it prominent, and I no longer argue against that — but its prominence makes rigour mandatory. A chapter that lists the failure modes (oracle manipulation, liquidation cascades, custody, redemption, under-collateralisation, regulatory status) and states honestly that it is a horizon contingent on a legal framework will *increase* your credibility. The same chapter written enthusiastically will cost you the entire banking part. Write it as an engineer describing why the problem is hard and what would have to be true.

---

# 5. New risks introduced by the round-2 frame

Additions to the Round 1 register:

**Regulatory and licensing.** Wallet and stored-value licensing; PSP and Shaparak routing rules; central bank position on agent-initiated transactions and on who bears liability for an erroneous one; AML/KYC applied to agent-initiated and *shared* intents (a shared intent crosses users, which is exactly what AML rules care about); legal standing of a SIM-based signature; if a messenger is ever built, content-moderation and lawful-intercept obligations. **Recommendation: a dedicated chapter, with required approvals listed per phase.**  **COMMENT**: note that these are commitments of Irancell. they should resolve legal issues not me.

**Group governance.** Irancell's shareholding structure means group-level strategy and partner-company governance both matter. Worth verifying and addressing: whether MTN group's existing digital platforms create alignment obligations or conflicts, and how the Snapp and Bank Sina shareholdings translate into actual decision rights over integration.  **COMMENT**: ببین این دیگه یه چیزی درون ایرانسل هست اگه ایرانسل درون خودش به این در واقع جمع بندی رسید که این کارو انجام بده دیگه به من میسپاره دیگه دیگه من نباید با این کارو داشته باشم که اونها با ام تی ان بشه جمع بندی میرسند اول باید جمع بندی بکنند بعد منو قرارداد ببندن با من

**Model access and sovereignty.** Now acute, because the model *is* the product. Which model family, self-hosted where, what happens if access is cut, and what quality bar must be met for Persian tool-calling. The model gateway abstraction is the right answer architecturally; the book needs a named phase-1 default and a measured quality bar.  **COMMENT**: ببین اینجام به نظرم میاد که باید یه دونه قرارداد مشارکت بسته بشه با یکی از این شرکت‌های چینی مثلاً کیوون یا دیپسیک یا مثلاً خلاصه هر شرکت‌های معروف که هوش مصنوعی میدن توی چین مثل زد ای آی و امثالهم یکی از اینها باید بیاد و این چیز ما را تامین بکنه هوش مصنوعی ما را تامین بکنه و باید قراردادش همین شکلی باشه که اولش خوب که ستاپ کردن طول میکشه ما هوش مصنوعی را به صورت ای پی آی از اینها بگیریم و بعد کم کم بریم سراغ اینکه خودمون سخت افزار را وارد بکنیم و در واقع اینجا میزبانی بکنیم از جی پی یو و مدل ها حالا باز اگه پیشنهاد

**Persian voice.** The interface is chat *and voice*, and Persian ASR and TTS quality — including accents, code-switching with English technical terms, and noisy environments — is a make-or-break product risk that appears nowhere in any document so far. If voice does not work well, the product is a text chat app, which is a materially weaker proposition. It needs an explicit evaluation and a fallback plan.  **COMMENT**: ببین ما با متن شروع می‌کنیم ولی من دارم می‌بینم که هوش مصنوعی داره قوی‌تر می‌شه توی همین تبدیل صوت به متن برای همین ترند میره به این سمت که ما حالا بعد از اینکه اون بحث متن رو به جای خوبی رسوندیم صوت رو هم وارد خواهیم کرد یعنی صوت رو از روز اول نمیخوایم بیاریم بلکه بر اساس ترندی که داریم میبینیم با متن میریم جلو و امیدواریم وقتی که میخوایم وارد صوت بشیم تکنولوژی به قدر خوبی پیشرفت کرده باشه گرچه همین الان هم امیدوار کننده است الان همین الان این چیزی که الان دارم میگم این خودش صوت تبدیل به متن شده هستش که دارم بهتون میدم و تو هم به عنوان هوش مصنوعی داری متوجه میشی که من چی میگم پس ما اگر صوت رو با همین ابزار تبدیل به متن بکنیم اون هوش مصنوعی که میخواد در نهایت ام سی پی رو فراخوانی بکنه متوجه خواهد شد و اگر هم ابهامی بود می‌پرسه که من منظورت در مورد فلان چیز متوجه نشدم و مثلاً به کاربر چند تا چیپس نشون میده میگه که مثلاً کدوم یک از اینها منظورت بود ولی خب میگم اینو میتونیم همون اولش نگیریم ولی باید تو مستند بیاریم ولی توی نقشه راهی که میچینیم اولش بحث صوت رو میتونیم وارد نکنیم

**User trust in AI-initiated money movement.** Iranian users' willingness to let software move their money is unproven. Design a **trust ladder**: informational first, then low-value payments, then transfers, with the user progressively raising their own limits. Do not launch with a high default ceiling. **COMMENT**: OK

**Cost per session.** Every conversation costs tokens; a large user base of daily conversational users is a real operating expense. It must be modelled, and it is one of the main arguments for tiered model routing and for the deterministic surface. **COMMENT**: ببین اینجا هم جزو جاهایی هستش که من دارم به ترندها اتکا می‌کنم ترندی که من دارم می‌بینم این هست که دارن مدل‌های پرچمدار هی گرون‌تر می‌شن اما مدل‌هایی که با یک مقداری مشخصی قابلیت دارند که کار ما را راه میندازه دارن هی ارزون‌تر می‌شن یعنی مثلاً الان فرض بکن مدل جی پی تی ۵ نانو خب این مثلا عرض قیمت هست و داره کار من راه میندازه الان مدل های بعدی که دارم میان دارن از اینها هم باز ارزونتر میشن الان جی ال ام پنج.3 فلش از این هم از ارزونتره و قطعا کار ما رو راه میندازه و احتمالا مدل های دیگری هم در آینده میان که باز هی ارزونتره ارزونتر میشه پس من در واقع دارم روی یک ترند اتکا میکنم که طی اون با رشد کاربرای من همزمان داره قیمت ها هم شکسته میشه اینم کاری که ما می‌خوایم بکنیم نیاز به در واقع هوش مصنوعی خیلی قوی نداره چون مثلاً یک معمار یه پیچی داره که نمی‌خواد انجام بده هوش مصنوعی در حین اجرا در حین اجرا می‌خواد چهار تا ام سی پی رو فراخوانی بکنه و مثلا منظور کاربر رو بفهمه فکر می‌کنم مدل‌های متوسط و حتی ضعیف هم این کار رو انجام میدن نظر تو چیه

**Liability and dispute resolution.** Still unanswered from Round 1, and now more urgent because shared intents involve multiple people. Who is responsible when an agent orders wrongly, and what must the audit trail prove? This determines what the ledger stores and for how long. Needs a decision, not a chapter. **COMMENT**: ببین مثل همه جاهای دیگه اولش ما باید یه دونه در واقع شرایط استفاده بزاریم و توی اون از خودمون سلب مسئولیت بکنیم و همه مسئولیت رو بندازیم گردن کاربر خب طبعا به مرور زمان این چیزا هم شفاف تر میشه از جهت حقوقی همین که بالاخره احتمال خطا هم میاد پایین تر ولی خب اولش که هنوز شفاف نیست ما بهتره که کاملاً سلب مسئولیت بکنیم

---

# 6. The book — structure, build, and style

## 6.1 Resolving "two documents" versus "one book"

You said two documents (architecture and strategy), then described one book with an architecture part. Both are satisfiable from one source tree: write one book, and have the build script produce **two PDFs** — the full book, and a strategy edition that omits the deep architecture chapters and the technical annexes. Same content, no divergence, no double maintenance. The chapter list below marks which chapters belong to the strategy edition.**COMMENT**: آره من اولش گفتم دوتا مستند بعدش گفتم یه دونه کتاب اون که یه دونه کتاب گفتم اون جدیدتر و درست‌تر هستش

## 6.2 Proposed structure

`S` = included in the strategy edition. One `.md` file per chapter.

```
book/
├── 00-frontmatter/
│   ├── 00-01-عنوان-و-فهرست.md                                    S
│   ├── 00-02-خلاصه-مدیریتی.md              ← includes the ask     S
│   └── 00-03-راهنمای-مطالعه.md                                    S
│
├── 01-مقدمات/                              Foundations
│   ├── 01-01-جهان-پس-از-اپلیکیشن‌ها.md      trend: apps → agents  S
│   ├── 01-02-عامل-چیست.md                  agent vs chatbot      S
│   ├── 01-03-قابلیت-و-MCP.md               capability abstraction S
│   ├── 01-04-سوپر-اپلیکیشن-تعریف-درست.md   ← your thesis          S
│   ├── 01-05-هویت-رضایت-و-اعتماد.md        identity/consent      S
│   └── 01-06-زیرساخت-مالی-برنامه‌پذیر.md    ledger/DLT primer     S
│
├── 02-ویستا/                               The super-app
│   ├── 02-01-چشم‌انداز-ویستا.md                                   S
│   ├── 02-02-تجربه-کاربری.md               chat + generated UI   S
│   ├── 02-03-حافظه-و-جستجوی-معنایی.md                            S
│   ├── 02-04-پرداخت-و-کیف-پول.md           incl. licensing path  S
│   ├── 02-05-نوتیفیکیشن.md                                        S
│   ├── 02-06-اشتراک‌گذاری-کنش-و-لایه-اجتماعی.md  ← §3.2          S
│   ├── 02-07-بازار-قابلیت‌ها.md            marketplace, standards S
│   ├── 02-08-مدل-درآمد.md                  ← §4.4                 S
│   ├── 02-09-رقبا-و-مزیت-رقابتی.md         ← §4.1, §4.5           S
│   ├── 02-10-امنیت-و-اعتماد.md             ← flagship chapter     S
│   └── 02-11-چالش‌ها-و-پاسخ‌ها.md                                 S
│
├── 03-بانک-سینا/                           Banking
│   ├── 03-01-چرا-بانک-چرا-حالا.md                                 S
│   ├── 03-02-بانک-قابل-استفاده-برای-عامل.md                      S
│   ├── 03-03-امضای-دیجیتال-و-سیم‌کارت.md                          S
│   ├── 03-04-تاب‌آوری-و-توزیع‌شدگی.md                              S
│   ├── 03-05-دفتر-کل-توزیع‌شده.md          ← §4.6 + decision gate S
│   ├── 03-06-قرارداد-هوشمند.md
│   ├── 03-07-توکن-طلا-و-دارایی-باثبات.md   ← your requested chapter S
│   └── 03-08-مسیر-مهاجرت-هسته-بانکی.md     ← strangler-fig
│
├── 04-معماری/                              Architecture
│   ├── 04-01-نمای-کلان.md
│   ├── 04-02-هویت-و-مجوز.md
│   ├── 04-03-کنش-سیاست-و-ریسک.md          two-axis model, §2.4
│   ├── 04-04-انواع-کاربر-و-کلاینت‌ها.md    ← §2.2
│   ├── 04-05-دروازه-و-استقلال-از-فروشنده.md  WSO2
│   ├── 04-06-لایه-مدل.md
│   ├── 04-07-دسترس‌پذیری-و-تنزل-تدریجی.md  ← §3.1
│   ├── 04-08-رصدپذیری-و-ممیزی.md
│   └── 04-09-اصول-معماری.md               updated principles
│
├── 05-مسیر-اجرا/                           Execution
│   ├── 05-01-نقشه-راه.md                   phases + 12-month commit S
│   ├── 05-02-مسیر-حقوقی-و-نظارتی.md        ← §5                    S
│   └── 05-03-اختیارات-و-ساختار.md          ← §4.7, the ask         S
│       (team sizing and budget deferred, as you said)
│
└── 90-ضمائم/                               Annexes
    ├── 90-01-واژه‌نامه.md                                          S
    ├── 90-02-تاکسونومی-قابلیت‌ها.md
    ├── 90-03-فهرست-ریسک‌ها.md
    └── 90-04-معیارهای-ارزیابی-DLT.md
```

Thirty-eight files. If that is too many we can merge within parts, but one file per chapter keeps diffs and review manageable and makes it easy to reorder. **Note on 05-03:** you said the execution part is ambiguous and should wait. I agree for team and budget — but not for the authority chapter. That is the purpose of the book and it should be written now.

## 6.3 Build pipeline

Proposed `build.sh`, using Pandoc with XeLaTeX for proper RTL:

- **Ordering** by filename; `book.yaml` for metadata (title, author, date, version) so it is not embedded in chapters.
- **RTL and fonts**: `polyglossia` with `\setmainlanguage{persian}`, `bidi`, main font Vazirmatn, a monospace font with Latin coverage for code blocks, `\setLTRfootnotes` handling.
- **Mixed-direction handling** — the real difficulty of this document. Code blocks, diagrams, and English terms inside Persian paragraphs need explicit direction control, and Pandoc gets this wrong by default. A small Lua filter that wraps code blocks and Latin runs in the correct direction environments solves it. This is the part of the script that will take actual work.
- **Diagrams**: the ASCII diagrams from the source render acceptably in a monospace LTR block; anything more polished should be authored as Mermaid or SVG and pre-rendered to PDF by the script.
- **Two targets**: `./build.sh full` and `./build.sh strategy`, the latter filtered by a `strategy: true` flag in each chapter's YAML header — so inclusion is a property of the chapter, not a list in the script.
- **Output**: numbered chapters, a table of contents, headers and footers, page numbers in Persian digits, and a version stamp.

I can write this when you want it. Suggested sequencing: agree the structure, write two or three chapters, then build the script against real content — writing it against an empty tree guarantees rework.

## 6.4 Persian style guide

Your rule is registered: **every paragraph starts with a Persian word; if it must start with a Latin term, prefix «به واقع»**. This is a bidi rendering issue as much as a stylistic one — a paragraph opening with a Latin token breaks first-line indentation and direction in RTL typesetting. Additional conventions to settle now, since retrofitting them across thirty-eight files is expensive:

- **Terminology.** My recommendation: keep in Latin script the terms that have no stable Persian equivalent and that a technical reader expects — Agent, MCP, Intent, Gateway, Policy, Capability, Token, Ledger. Translate the connective and conceptual vocabulary. Establish the mapping in the glossary and use it mechanically; consistency matters more than purity. Needs your decision — see 7.
- **Digits.** Persian digits in body text, Latin digits in code blocks and tables. Needs your decision.
- **English terms inline.** Latin script with the Persian equivalent at first use, or the reverse — pick one and hold it.
- **Register.** First-person plural for the body; first-person singular for the mandate chapter, where it should be personal and direct.
- **Chapter shape.** Each chapter opens with two or three lines stating what it argues and closes with a short summary. In a book this long, the reader who skims only openings and closings must still get the argument.

---

# 7. Open questions for round 3

Round 1's B6 questions are now answered — audience is Irancell leadership with Bank Sina secondary, the ask is mandate and authority, phase 1 is Bank Sina and Konkooria, the product leads, the form is a book, DLT and the gold token get dedicated chapters, and team and budget are deferred. New ones:

1. **Do Irancell's own self-service capabilities go into phase 1?** I recommend strongly yes, and that they *lead* the launch (§4.3). This changes the roadmap chapter materially. **COMMENT**: yes
2. **Social layer — shareable intents rather than a messenger (§3.2). Agreed?** It changes chapter 02-06 and a phase-3 commitment. **COMMENT**: agreed and say something about importance of social layer in gaining network effects. quote Andrew Chen
3. **Wallet licensing path.** Bank Sina's licence, a partnered PSP, or an acquisition? Who holds the float? I cannot write the payment chapter without a direction here. **COMMENT**: I dont know. guide me
4. **Who funds and owns the Bank Sina programme** — the bank, Irancell, or a joint vehicle? It determines how part 3 is addressed and to whom. **COMMENT**: joint
5. **How candid should the competitive chapter be about Snapp being simultaneously the key partner and the most serious competitor?** My recommendation is fully candid, because the board already knows. **COMMENT**: OK
6. **Is the audience Persian-only?** If MTN group is ever a reader, an English executive edition is a third build target — cheap to add now, expensive later. **COMMENT**: just Persian
7. **Naming.** Is «ویستا» final, and does it name the super-app, the platform, or both? I would recommend one name for the product and a separate internal name for the platform layer, because they will eventually be sold to different audiences. **COMMENT**: name it for the super app. other parts have no name yet. propose some
8. **Persian terminology and digit conventions** (§6.4) — needed before chapter writing starts.**COMMENT**: what do you recommend?
9. **Model commitment.** Do you want to name a phase-1 model family and hosting arrangement in the book, or keep it abstract behind the model gateway? Naming it is more credible but harder to change. **COMMENT**: name some candidates.
10. **Liability position.** When an agent acts wrongly, who bears the loss? A one-paragraph position is needed; it drives the audit design. **COMMENT**: see above

---

# 8. Claims to verify before publication

These are load-bearing facts drawn from the transcript or from my own general knowledge; a book of this weight should not carry an unverified competitive or ownership claim.

- Snapp's shareholding structure and Irancell's stake; likewise Bank Sina's ownership and the exact nature of the Irancell relationship.
- MTN's stake in Irancell and whether MTN group digital platforms create any alignment obligation.
- Bale's current payment arrangement and Ap's relationship with Bank Shahr.
- Eitaa's current payment capability — my understanding is that it has changed recently, so the "no payment arm" claim needs checking before it appears in print. **COMMENT**: I'm sure
- Snapp's current super-app breadth and any announced conversational or assistant features.
- MCI's current digital-services portfolio and any announced assistant.
- Current CBI rules on wallets, stored value, and agent-initiated transactions.
- Legal status of SIM-based and mobile digital signatures under Iranian e-commerce and e-signature law.

I have not verified any of these; several come from the transcript and several from general knowledge that may be out of date. I would rather flag them now than have a reviewer find one.

**COMMENT**: ببین در رابطه با این روابط سهامداری و امثالهم مثلاً ام تی ان توی ایرانسل و امثالهم هرچی می‌دونستم گفتم بقیه‌اش رو باید بری خودت تحقیق بکنی توی اینترنت و امثالهم و بفهمی همچنین در رابطه با ترندها و اینها به چیزهایی که من گفتم اتکا نکن و خودت برو بخون و ببین ترندهایی که من گفتم درست هست یا درست نیست برو چند تا مقاله بخون رو ردییت بخون و خلاصه جاهای مختلف رو بخون و ببین آیا من به درستی در مورد ترندها گفته بودم یا نه اگه اشتباه گفتم درستش چیه و چه تاثیری توی این کتاب ما خواهد گذاشت