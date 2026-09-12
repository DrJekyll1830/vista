# Vista V0.3 — Round 3 Analysis

**Input:** [01 — transcript](01-transcription.md), [02 — Round 1 with comments](02-round1-analysis-en.md), and [03 — Round 2 with comments](03-round2-analysis-en.md), read in that order.
**Context:** selected Vista book chapters on payments, delegation, the showcase, roadmap, and responsibility. The demo is not a design constraint. Neither Andrew Chen’s nor Teresa Torres’s full book was read for this round.
**Status:** response to the latest comments and a proposal for the next decisions, dated 2026-09-12. Eitala-first is **Omid’s recommendation pending the Irancell meeting**, not an approved launch decision. This document does not edit the book, presentation, SDK, or application. Unresolved recommendations are identified below rather than treated as approved through silence.

The proposed starting point is now concrete: **Vista as a complete conversational channel for Eitala, with Vista login, contracts, wallet payments, notifications, and support.** The strongest remaining dependency is the money path. Your relationship with Eitala substantially reduces partner-acquisition and initial engineering uncertainty; it does not yet establish how a funded Vista wallet and intercompany settlement will operate before Bank Sina integration.

## 1. What your latest comments settle

| Topic               | Position to carry forward                                                                                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Developer ecosystem | Developers must remain able to submit apps to Vista’s showcase. The timing of opening self-service submission is still flexible.                                                                                                                                                                                                  |
| External discovery  | Searching external MCP registries is excluded from at least the first three phases. This is separate from accepting developer submissions.                                                                                                                                                                                        |
| Identity levels     | General user, developer, and financial participant are three distinct levels. The extra developer evidence is not yet specified.                                                                                                                                                                                                  |
| Eitala relationship | You report that its CEO accepted integration on the understanding that you undertake the development; technical-team workload was the concern.                                                                                                                                                                                    |
| First partner       | Present Eitala as your recommendation for the Irancell meeting, described as “tomorrow” in the September 12 comments; no meeting outcome is assumed.                                                                                                                                                                              |
| Eitala scope        | Prices and history, analysis, buying, selling, investment features, FAQs, support, and notifications belong in the target experience.                                                                                                                                                                                             |
| Money route         | Users first fund Vista; purchases use that balance. Eitala cash withdrawals through this channel return to Vista; withdrawal to the user’s IBAN happens through Vista. Eitala’s own checkout is not an acceptable substitute for this pilot. **COMMENT**: this is my recommendation. it is not discussed with Irancell nor Eitala |
| Bank Sina           | You want the initial experience to work before its integration. The interim operating arrangement still needs definition.                                                                                                                                                                                                         |
| Delegation          | Eitala may later receive bounded trading authority. This remains phase two. **COMMENT**: as وکالت                                                                                                                                                                                                                                 |
| Google consent      | Bundle the supported features in one connection journey; the package still has to be knowingly selected by the user.                                                                                                                                                                                                              |

The four supply mechanisms remain: owned/group services, friends’ existing businesses, selected international services, and «داشت». The new work is to make the first partner useful enough to validate the channel, then make its integration pattern reusable by the other three routes.

## 2. Correcting the marketplace interpretation

I overcorrected in Round 2 by treating a curated launch as grounds to postpone the developer ecosystem itself. **A Vista-run app marketplace and external-registry aggregation are independent choices.** Your Café Bazaar analogy describes the former; it is not a request to reproduce that company’s current verification procedures exactly.

The target flow is:

> Developer registers → submits app and endpoints → Vista records publisher identity and app status → app becomes available under the applicable publication policy → user connects through its first contract.

Keep the assistant’s search order: connected capabilities first, then eligible entries in Vista’s own showcase. The showcase can contain both invited apps and developer-submitted apps. It does not need to consult external registries, even in phase three.
**COMMENT**: we need an exact flow: what happens when our assistant suggests an app and a 1st contract happens? what happens when user uses our app store (ویترین) to add an app? tell me what happens in assistant? what happens in app store app? what happens in the added app? tell me in both cases.
### Identity, publication, and financial permission

Your proposed user baseline is mobile number, national ID, and date of birth. That supersedes the earlier shorthand “phone OTP only” as the identity model, although OTP can remain a login method. Collecting identity fields and verifying them are different operations; the verification service and checks still need specification.
**COMMENT**: for Irancell phone number, we CAN allow them to bypass level 1 of identification (national ID and birth date) as Irancell already knows them.

| Level                 | Who it covers                                                                                                                           | Additional evidence / resulting capability                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| General user          | A person using Vista                                                                                                                    | Your stated identity baseline; access to ordinary user features under their contracts                                                           |
| Developer             | A person or organization publishing an app                                                                                              | Stronger identity proof, an accountable contact, and proof of control of the submitted service; exact additional identity evidence remains open |
| Financial participant | An operator asking to use Vista’s wallet/payment facilities **COMMENT**: I meant a developer that wants to use our wallet in their app. | Company documentation and verification of the responsible financial counterparty, settlement destination, and enabled financial operations      |

These levels should not become a single `verified` flag. Record publisher identity, publication status, technical review, and wallet eligibility separately. **A developer can have completed developer verification while their app is still “not reviewed” or lacks financial authorization.** That resolves the apparent contradiction between requiring publisher identification and allowing an initially unapproved app to appear.

My recommendation is that “not reviewed” may be a visible publication category, after minimum identity and endpoint checks, with no wallet authority. This is a proposed policy for the possibility you described, not a decision that every submission must be published. A nonfinancial app can still handle sensitive data, so absence of payment rights is not a complete admission test.

Verify the company once and reuse that identity evidence across its apps. Enable financial operations for each app and settlement configuration explicitly; adding a new app under the same company must not accidentally authorize a new money destination. The user-facing badge can remain simple while its underlying permissions stay precise.

For international entries, distinguish **service owner, connector developer, operator, and Vista submitter**. An official Google-built connector can name Google as developer. A Vista-built adapter to Google Calendar should identify Google Calendar as the service and Vista as the adapter developer/operator. A listing must not imply that Google submitted the app or entered a Vista partnership when it did not.

**Suggested sequence:** invited partners in phase one, broader verified developer onboarding in phase two, wider showcase publication in phase three. Submission timing can move without changing the architecture. External-registry search stays outside all three. The book’s arbitrary URL-addition route needs a separate publication-policy decision; it should not silently bypass the developer identity requirement.

## 3. Eitala is now a credible first-partner proposal

Your previous role as its lead developer and the CEO’s reported acceptance materially strengthen this proposal. We no longer need to ask whether you can get an introductory meeting. The next agreement is about **the supported customer journey, who operates it, and how money and support are handled**.

Taking on the initial development is an effective way to reduce the partner’s integration burden. Still name an Eitala owner for production access, releases, incidents, and changes to business rules. Otherwise a fast integration creates a permanent dependency on your personal availability.

The proposed first cohort remains existing Eitala customers who already save in gold. The proposition should cover the service relationship:

> Understand prices and holdings → inspect relevant analysis → choose an action → review exact terms → pay through Vista → see the result → get help in the same conversation.

That is a stronger distinction from a general chatbot than claiming better financial intelligence. It connects understanding to an existing account and a service that can act on the user’s decision.

### Full target scope, with a first acceptance loop

| Capability | Target experience / important boundary |
|---|---|
| Current and historical prices | Source, timestamp, unit, purity, and buy/sell quote are explicit. “Price at any time” means available recorded history, with gaps disclosed. |
| Account and holdings | Read the linked customer’s balances, orders, and investment positions; distinguish available, reserved, and pending amounts. |
| Analysis | Explain observed changes and compare attributed views, as discussed in section 5. |
| Buy and sell | Obtain an executable quote, authorize exact terms, execute, return a receipt and status. |
| Investment products | Preserve each product’s actual entry, exit, maturity, fee, and liquidity terms. Do not present a project share as immediately redeemable gold. |
| FAQs | Retrieve Eitala-maintained answers with a version/date; personal order questions use account data. |
| Support | Create and follow a case inside Vista, with a case ID, responsible support team, and relevant order/contract references. |
| Notifications | Deliver order, withdrawal, investment, and support events into Vista with access to the related record. |

**Full functional coverage is the target; the first acceptance loop should be one purchase, one sale, return of proceeds to Vista, and a support exchange.** This proves the common machinery before adding every investment lifecycle. It is an implementation order, not a reduction of your requested end state. Before advertising “everything you do in Eitala,” inventory all its user operations and account for each supported or temporarily unavailable one.

The API descriptions checked here identify price, balance, purchase, sale, and withdrawal operations. The bot API explicitly describes bot balances; it must not be assumed to provide isolated customer access for Vista. These descriptions support planning, not a production-readiness claim. [Eitala bot API](../../../../etala/EitalaBot_OpenAPI.yaml), [main API](../../../../etala/backend/runner/api_main/OpenAPI.yaml).

## 4. The wallet requirement changes the roadmap

The current [payment chapter](../../book/02-ویستا/02-07-پرداخت-و-کیف-پول.md) and [roadmap](../../book/05-مسیر-اجرا/05-01-نقشه-راه.md) explicitly put a funded wallet in phase two. Your selected journey requires it at the first Eitala financial launch. **We should describe this as bringing the necessary wallet capability forward**, conditional on an operating arrangement, rather than keeping both contradictory promises. **COMMENT**: the book is wrong then. the wallet is in phase 1 definitely. we may bring Bank Sina as its backend in phase 2.

There are three different dependencies:

- **Vista wallet experience:** balance, funding, purchase, return of proceeds, and withdrawal.
- **Money operator and backing:** who holds the funds, owes the balance to the user, executes payouts, and covers shortfalls.
- **Bank Sina integration:** a particular future institutional and technical connection.

The first can precede the third if the second is provided through a suitable interim arrangement. This round does not establish that such an arrangement already exists or determine its permissibility under Iranian rules. Assign that concrete arrangement to the commercial/payment owners; a ledger implementation alone cannot answer it. Nor should we retain the book’s claim that Bank Sina is already the counterparty if another operator serves the pilot.

### The agreed user route

```text
User’s bank account/card
        │ Vista funding flow
        ▼
Vista cash balance ── authorized purchase ──► Gold held at Eitala
        ▲                                          │
        └────────── sale proceeds / cash return ────┘
        │ Vista withdrawal flow
        ▼
User’s verified bank account
```

This shows the user journey, not the bank-account ownership or intercompany settlement architecture. Cash and gold are different assets; Eitala remains the source of truth for its customer’s gold and investment positions. Vista’s cash operator is the source of truth for the spendable cash balance. Existing Eitala balances must not be copied into Vista as additional money: moving them requires an actual authorized transfer and reconciliation.

For this integration, the book’s general statement that partners may use their own checkout needs a scoped qualification: **the Eitala pilot is explicitly agreed to use Vista’s wallet.** Your comment does not require banning alternative checkout for every future app.

### Settlement at day-end does not settle the user experience

A purchase creates an obligation from the wallet side toward Eitala; a sale or cash return creates an obligation in the other direction. Partners may reconcile and settle those obligations in batches. That does not automatically make a user’s sale proceeds immediately spendable.

If users can spend or withdraw before cash arrives from Eitala, someone must supply liquidity and accept the exposure. Choose and document either prefunding, an agreed credit/exposure limit, or pending funds that become available after confirmed settlement. **My initial recommendation is backed availability: release spendable funds only against confirmed funds or explicitly prefunded coverage.** A simple UI can say “pending” without explaining the accounting. **COMMENT**: at the end of the day, either Eitala OR Vista is debtor and the other is the creditor. I suggest a bilateral credit limit, enough for one day.

The settlement agreement needs a cutoff and calendar, gross-versus-net treatment (**COMMENT**: net), fees/refunds, funding direction, exposure limits, failure handling, and reconciliation ownership. “For example, at the end of the day” remains an option, not a completed settlement design.

### The minimum transaction behavior

1. Obtain a provider-backed quote with explicit currency, gold quantity/purity, fees, account, and expiry. The local API uses rials; if Vista displays tomans, conversion must be exact and covered by the confirmed terms.
2. After user authorization, reserve the necessary cash or gold and execute against the agreed quote. If terms expire or change, obtain a new authorization unless the signed terms explicitly cover the change.
3. Record the provider result and the corresponding cash/asset postings. Use one stable operation identity across retries, contract references, and reconciliation.
4. On a timeout, retrieve status before retrying or releasing reservations. An unknown result is pending, not proof of failure.
5. Complete or compensate from the confirmed outcome. Prevent duplicate orders, duplicate credits, and duplicate refunds; keep failed transfers visible to support.

This is a proposed operating model. It is especially important because the existing Eitala app may remain another channel to the same assets: reservations and available gold must hold across both channels, not only within Vista.

## 5. Analysis can be useful without invented precision

You want the assistant to answer “buy or sell?”, and you proposed adding the analyst-aggregation service transcribed as «سهم تو». I would keep this as an intended capability and make **the origin and meaning of the answer** explicit. The service’s exact name, coverage, rights, and integration availability still need confirmation; a friendship is a route to investigate them, not evidence of a live feed. **COMMENT**: confirmed.

Three outputs need different treatment:

- **Observation:** “The quoted price changed by this amount during this interval.” This comes from comparable, timestamped data.
- **Explanation or scenario:** “This report may have contributed; another relevant factor is…” Temporal coincidence is not proof of causation. Historical news must be aligned by publication time, including later corrections.
- **Recommendation or forecast:** “This analyst recommends buying over this horizon,” or a model’s conditional estimate. Name the source, date, asset, horizon, assumptions, and uncertainty.

**“60% buy / 40% sell” is not meaningful until we define the denominator.** Six of ten comparable, current analyst views favoring a purchase is an opinion count. It is not a 60% probability of profit. Different assets, horizons, stale views, duplicate republications, and missing neutral views must not be mixed into a single score.

A forecast probability needs a defined outcome and horizon plus evidence that the method’s probabilities are calibrated on unseen data. A language model’s expressed confidence supplies neither. For the initial release, my recommendation is attributed analysis and conditional answers, with an explicit “insufficient evidence” option; numerical forecasts should come from a separately evaluated method. This recommendation remains distinct from your request to include analysis.

For example, the assistant can explain that short-term analysts disagree, show their actual reasoning, and calculate the effect of fees under user-selected scenarios. If a user requests an order afterward, the quote and contract must come from Eitala; the assistant’s estimated price is not the executable price.
**COMMENT**: Sahmeto has an endpoint that gives us the number of analysts that say "buy" vs number of analysts that say "sell"
### Attribution is useful; “the AI is responsible” is not an operating model

I disagree with promising that neither Vista nor Eitala can bear responsibility because an AI produced the answer. Labeling generated analysis explains provenance and uncertainty; it does not establish who is responsible for selecting the service, presenting its output, routing an order, or correcting a known defect. The book’s [responsibility chapter](../../book/05-مسیر-اجرا/05-04-مسئولیت.md) already recognizes limits to relying on terms alone.

Assign responsibilities concretely: the analysis provider for its supplied content under its agreement, Vista for faithful presentation and its product behavior, Eitala for its quotes and service execution, and the cash operator for the money path. The enforceable allocation and any advice-related requirements need jurisdiction-specific review; this analysis does not make a legal finding. IOSCO’s [2025 consultation overview](https://www.iosco.org/news/pdf/IOSCONEWS761.pdf) likewise treats AI in financial services as involving investor-protection and market-integrity questions; it is context, not Iranian law.

Keep disclosures concise in the experience and retain the relevant source/version and answer with a linked order where appropriate. A signed order establishes the terms authorized; it does not establish that the reasoning leading to it was accurate.

## 6. Support and notifications complete the integration

“No need to leave Vista” should include a human support handoff, not just an FAQ bot. A user can ask about an order, authorize sending the relevant details, receive a case reference, and see the support team’s replies in the same app conversation.

Use Eitala’s maintained FAQ content for product rules. When the content does not answer the question, escalate instead of inventing a withdrawal deadline or refund promise. Send only the relevant case context, not the entire Vista conversation or unrelated accounts. Existing contract terms can cover that support-data use; no duplicate generic consent screen is needed.

Route responsibility behind the scenes: Eitala handles its service/asset issues; the wallet operator handles funding and payout; Vista handles connection and presentation failures. Give the user one visible case and status even when the teams need to coordinate.

Notifications need authenticated event origin, a unique event ID, order/contract linkage, and duplicate/out-of-order handling. A notification reports state; it does not itself authorize payment or prove cash settlement. Keep financial history accessible if the app is disconnected, while stopping future access and optional notifications under the relevant terms.
**COMMENT**: Eitala has a support endpoint. if our assistant cannot answer the user, it suggest escalating to that endpoint which is done via a rung 1 contract.
## 7. AP2 and phase-two delegation

Keep the AP2-first decision. Its specification provides extension points for checkout objects, payment instruments, and mandate constraints. A new constraint requires a defined type, schema, and evaluation algorithm. That gives us a route to model Vista wallet payments and domain limits without replacing the authorization foundation. It does not itself provide the wallet’s custody or settlement arrangement. [AP2 specification](https://ap2-protocol.org/ap2/specification/).

The Trusted Agent Provider approach fits a partner that explicitly trusts Vista’s consent surface. The provider key is held securely and cannot be used by the model outside that surface. It is not the same claim as a personal user-key signature. [AP2 authorization framework](https://ap2-protocol.org/ap2/agent_authorization/).

For the later specification, map roles and proofs against a pinned AP2 revision. Keep MCP for capability access and draft preparation; execute financial contracts through the separately authorized processor interface. Asset-sale authority, investment terms, and nonfinancial permissions need explicit mapping rather than being relabeled as ordinary purchase payments.

For phase two, **Eitala as the named delegate** and **the Vista assistant acting under a mandate** are separate grants. Permission to one does not authorize the other. An analyst feed contributes information, never authority.

A trading mandate needs more than a purchase ceiling: identified account and asset, permitted buy/sell operations, maximum gold quantity or value sold, per-order and cumulative limits, fees/slippage bounds, expiry, revocation, and exclusions such as withdrawal or illiquid investments. Define whether limits count gross turnover; otherwise selling and rebuying can repeatedly recycle the same budget. Limits should be enforced outside the model, with each use reported and no onward delegation, consistent with the [book’s delegation rules](../../book/02-ویستا/02-06-وکالت.md).

None of this moves autonomous trading into phase one. A recurring alert or fresh analysis is not authority to place an order.

## 8. Two remaining account clarifications

**Google bundling:** yes to one package containing all currently supported Google features that the user knowingly enables. Request the least access required for those features, and honor partial consent. “All features we have” should not include silently selected services or future capabilities. This follows [Google’s OAuth policy](https://developers.google.com/identity/protocols/oauth2/policies), not a requirement to add a dialog for every feature.

**Bank-branch recovery:** your proposal is useful as a future way to recover access to funds if Bank Sina actually provides that service under the agreed account structure. It is not yet a confirmed bank procedure. It also does not prevent a new holder of a reassigned number from entering an inadequately protected Vista account before the original user reaches the branch.

Separate protecting access, recovering the Vista account, and redeeming funds. A branch payout does not restore linked accounts or revoke compromised sessions, and it does not automatically liquidate Eitala gold or investment positions. Before Bank Sina integration, the interim cash operator needs its own documented recovery/redemption route.

My proposal remains an independent factor or equivalent verified recovery procedure for financial access, with no SMS-only bypass of an enabled factor. Exact assurance requirements remain open; your branch comment is not approval of mandatory passkeys. NIST describes recovery codes, contacts, and repeated identity proofing as recovery options; these are design references, not a local regulatory mandate. [NIST account recovery guidance](https://pages.nist.gov/800-63-4/sp800-63b.html#account-recovery).
**COMMENT**: when the bank becomes our wallet backend, then it's in their agreement that user can access their funds via our super app OR via the bank sina infrastructure (branchs/internetBank, etc). in that time, we dont have the ledger ourselves but the Bank Sina does so it cannot fork/drift.
## 9. Proposal text and the next specification

The following can be used in the book when incorporating V0.3, while preserving the pending decision:

> **پیشنهاد امید برای شروع، اتصال ای‌طلا به ویستاست؛ تصمیم نهایی پس از جلسه با ایرانسل گرفته می‌شود.** مدیرعامل ای‌طلا با اصل اتصال موافقت کرده و امید توسعهٔ اولیهٔ این اتصال را بر عهده می‌گیرد. هدف این است که کاربر در ویستا قیمت و سابقهٔ آن و دیدگاه‌های تحلیلیِ منبع‌دار را ببیند، خرید و فروش و قابلیت‌های سرمایه‌گذاری ای‌طلا را با قرارداد انجام دهد، اعلان بگیرد و به پشتیبانی دسترسی داشته باشد. خرید از موجودی کیف پول ویستا انجام می‌شود و وجوه برگشتی به همان کیف پول می‌آید؛ برداشت به شبای کاربر از مسیر ویستا خواهد بود. شروع پیش از اتصال بانک سینا مستلزم تعیین متولی وجوه و سازوکار واریز، برداشت و تسویهٔ دورهٔ نخست است. وکالت برای معاملهٔ خودکار همچنان در فاز دوم قرار دارد.

If the recommendation is selected, the Eitala implementation brief for the development agent should contain: **COMMENT**: it is not decided if eitala uses accepts us as payment gateway or not. it needs further negotiations. and its name is ایتلا not ای‌طلا

| Deliverable | What must become concrete |
|---|---|
| Capability inventory | Every existing customer operation, its Vista journey, and its API or missing interface |
| Identity/connection contract | Vista-issued identity acceptance, existing-account linking, scopes, assurance, revocation, customer isolation |
| MCP surface | Price/history, account reads, FAQs, support operations, and draft preparation with explicit side effects |
| Contract profile | Pinned AP2 mapping, domain extensions, quote validity, exact units, required proofs and execution authorization |
| Financial integration | Named cash operator, reservations, user credits, transfers, refunds, settlement and reconciliation responsibilities |
| Events and support | Authenticated notifications, retry/order behavior, case routing, receipts, and status lookup |
| Acceptance evidence | User-present buy/sell loop, wallet return and withdrawal, concurrent-channel asset protection, timeout recovery, duplicate prevention, support reply, and revoked-account denial |

Do not prescribe code edits against the demo or claim that adding three endpoints completes this brief. The reusable SDK should define the common contracts and identity/events interfaces; the Eitala brief should specify how its business operations implement them.

For the Irancell meeting, the consequential outcomes are: selection of Eitala, ownership of the interim wallet arrangement, agreement on analysis responsibility, and an operating owner on each side. Developer-verification details and later marketplace opening can proceed separately. No partner contact or meeting outcome is assumed here.

## 10. Coordinated changes after this round

| Artifact | Required direction |
|---|---|
| Book: showcase | Restore developer submissions; distinguish identity, review, and payment rights; keep external-registry search outside the first three phases. |
| Book: payments and roadmap | Mark Eitala as a proposal; explicitly bring forward the necessary funded-wallet capability if selected; name the interim dependency and preserve phase-two delegation. |
| Book: identity and responsibility | Carry the three identity levels, consent-through-contracts, recovery distinctions, and attributed analysis with an explicit operating owner. |
| Presentation | Show the complete Eitala journey and the pending partner/payment decisions; avoid claiming the bank or analyst integration is ready. |
| SDK and partner brief | AP2-based common specification plus Eitala-specific mappings, including support and reconciliation. |
| Supply strategy | Keep all four mechanisms; use the first integration to reduce the next partner’s work without making «داشت» or a broad international catalog prerequisites. |

The pilot should be judged on successful complete tasks, repeat voluntary use, effort saved against Eitala’s current experience, support outcomes, and cost per completed task. Measure reconciliation exceptions and time until returned funds become available as well. Growth in trading volume alone cannot establish that the channel is useful or that users received good analysis.

### Evidence boundaries

All three V0.3 documents, including inline comments, were read sequentially. The five linked Vista book chapters were read for the specific conflicts above; this is not a claim to have reread the whole book. Local Eitala inspection was limited to relevant API-description entries; no account, provider connection, or transaction was tested. The reported CEO agreement and planned Irancell meeting come from your comments. External AP2, Google OAuth, and NIST references were checked on 2026-09-12; the IOSCO consultation overview is background only. No current Café Bazaar procedures, Iranian legal conclusion, Bank Sina branch arrangement, or «سهم تو» capability is asserted as independently verified.
