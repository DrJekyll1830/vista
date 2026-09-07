# Vista — Round 3 Analysis

**Inputs:** your COMMENTs on Round 2, plus the web research you asked for.

**Order:** research findings first, because three of them change the content of the book. Then the two design problems you asked me to think about — information flow, and formalising the Intent. Then the smaller answers, the mandate draft you asked to see first, and naming.

---

# 1. Research findings — what checks out and what does not

You told me not to rely on your account of the trends or the shareholdings, and to go and read. I did. Your trend instincts are largely right. Three market facts are wrong or missing, and one is politically delicate.

## 1.1 Confirmed

**MCP as the bet.** Stronger than either of us assumed. MCP is now the de facto integration standard — roughly 97M monthly SDK downloads, 9,400+ public servers, native support from Anthropic, OpenAI, Google DeepMind and Microsoft, and about 41% of surveyed software organisations running MCP servers in limited or broad production. Critically, **Anthropic donated MCP to the Agentic AI Foundation under the Linux Foundation in December 2025**, so it is a vendor-neutral standard with community governance. That last fact belongs in the book: betting the platform on MCP is not betting on a single vendor. There is also a companion protocol, **A2A**, emerging for agent-to-agent delegation — relevant to §2 below.

**Inference cost collapse.** Your thesis is correct and stronger than you stated. Cost for a fixed capability level has fallen roughly 10× per year; Epoch AI measures the price of reaching a given benchmark milestone falling anywhere from 9× to 900× per year depending on the milestone; Gartner projects trillion-parameter inference costing >90% less by 2030. Cheap tiers are genuinely cheap — Gemini 3.1 Flash at about $0.10/M input, described as a 99.7% reduction over three years. **You are right to plan against this trend rather than against today's prices.** Caveats in §10.

**Developers already work through agents.** Confirmed by the MCP adoption numbers and the agentic-coding tooling landscape. The premise of your Chapter 1 holds.

**Open-weight Chinese models are competitive at agentic work.** GLM-5.x, Qwen3.5/3.6, DeepSeek V4, Kimi K3 and MiniMax M3 are all real, all open-weight, and all in the frontier conversation for tool-calling and agentic tasks. Your partnership instinct is sound. Details in §9.  **COMMENT**: Qwen has 3.8 now. I fear your info is out of date.

**Bale.** Built by Sadad, Bank Melli's payment arm; messenger plus financial super-app; roughly 31 million installs on Cafe Bazaar alone as of Bahman 1404. Your read is accurate.

**Gartner's warning, which you should quote.** Over 40% of agentic AI projects may be cancelled by 2027 due to unclear value, rising costs, and weak governance. Put this in the risk chapter and then answer it — the whole security and governance architecture *is* the answer, and citing the industry failure rate before presenting your governance model is a strong rhetorical move.

## 1.2 Wrong or missing — these change the book

**(a) Eitaa has payment. You were sure it did not.**
Eitaa runs in-app payment links, has an Eitaa wallet, and **takes a 2% commission on customer payments** while charging nothing on member-to-member transfers. So the competitor you dismissed as structurally crippled is already operating the exact revenue model you proposed in the transcript. Two consequences: the "Eitaa has no payment arm" line must come out of the competition chapter, and the take-rate model needs to be defended on its merits rather than presented as novel — 2% is now a visible market reference point that will anchor any negotiation. **COMMENT**: I'm still sure that Eitaa pay is only for Eitaa internal use cases not for apps it hosts.

**(b) Rubika is missing from your competitive analysis, and it is large.**
Rubika markets itself as the first Iranian super-app, claims **over 37 million users**, and already carries messenger, voice and video calling, a social network (Rubino), video, music, education, and payment services including a wallet, bill payment, top-up, and card-to-card. By your own definition it is a mosaic — but it is a 37-million-user mosaic with a wallet, and any board member will ask about it. It has to be in the chapter.  **COMMENT**: it's very limited and cannot host new app categories (e.g. car like snapp or airbnb style apps) because it only supports native/partner apps and no mechanism to integrate to new apps.

**(c) Snapp is not "one product decision away" from AI. It has already started.**
Snapp reports **over 70 million registered users** in 1405. An AI shopping assistant is already live in Snapp Express; Snapp Market runs «سوپرسنج», a smart shopping assistant, and AI support chatbots; Snapp Doctor uses AI on vital-sign analysis; and there is reporting on Snapp adding its own cost-efficient AI model to its chat app. **Your most important partner is also your most advanced competitor, and the window is narrower than Round 2 assumed.**

This does not break the strategy — Snapp is building assistants *inside individual services*, which is precisely the mosaic pattern your thesis attacks, and none of it gives them cross-service identity, cross-service payment, or a capability marketplace. But the book must say this explicitly and early, because a reader who knows the market will otherwise think the analysis is out of date. The honest framing: *Snapp is proving the demand for conversational service access; only Vista can provide it across services.*

## 1.3 The ownership structure — factually useful, politically delicate

MTN Irancell is 51% Iran Electronic Development Company (IEDC) and 49% MTN Group. **IEDC's holding is itself split between Iran Electronics Industries (Sairan, under the defence ministry) and Bonyad Mostazafan.** Separately, **Bank Sina is controlled by Bonyad Mostazafan**, which is its largest shareholder.

So Irancell and Bank Sina share an ultimate shareholder. That is almost certainly why Bank Sina's agreement was easy to secure, and it is the real governance lever behind your phase-1 plan — considerably more reliable than a commercial argument.

Two cautions. First, on Snapp: reported MTN stakes vary across sources (43% in more recent reporting; earlier reports describe roughly 60% held between MTN and Irancell with the balance elsewhere), so **do not print a specific Snapp percentage without checking the current cap table internally.** Second, MTN has repeatedly impaired its Iran holding and has publicly considered selling its Snapp stake — meaning the Snapp shareholding lever may be weakening exactly when you plan to use it. Worth knowing before you build a chapter on it.  **COMMENT**: independent of MTN, Irancell has a 1/3 share in snapp. confirm it.

On phrasing: I would state the shared-shareholder fact plainly but neutrally — "a common ultimate shareholder" — and not elaborate. The material advantage is real; the elaboration adds nothing and travels badly.

## 1.4 A finding that affects your mandate choice directly

**Irancell Labs, as publicly described, is not a delivery organisation.** It was established around 1399/2020 with three divisions — Research & Development, the Irancell Innovation Center, and Irancell Academy — and its public activity is accelerators (the Galaxy accelerator), startup pitch events, university engagement, and R&D in AI, big data, blockchain, cloud, NLP and biometrics.

That is an innovation, accelerator and research arm. If the public description matches the internal reality, **"CTO of Irancell Labs" may give you research and innovation authority but not authority over Irancell's production digital products, billing, self-service channels, or the customer-facing app estate** — which is exactly what the super-app needs.

This matters for §13. Before choosing Option A, establish what Labs actually controls in delivery terms, and if it does not control the production estate, the mandate must name the production organisation explicitly rather than the Labs title. Getting a title that does not carry the assets would be the worst outcome of this negotiation.  **COMMENT**: Irancell should give the authority to Labs so that I accept the offer.

## 1.5 Persian model quality — the one place your optimism needs a check

Persian evaluation work through 2026 consistently shows closed models ahead of open ones by a wide margin: on one broad Persian evaluation, OpenAI's o3 reached about 92% against roughly 82.5% for the best open checkpoint. There is a substantial and active Persian benchmark literature (PerCoR, Parse, PerHalluEval, PersLitEval, PBBQ), which is useful to you — it means the evaluation infrastructure exists and you do not have to build it from nothing.

Implication: an open-weight Chinese model self-hosted in Iran will be **materially weaker in Persian than the frontier API you can rent today**, and the gap is largest exactly where you need reliability — instruction following, parameter extraction, and hallucination resistance. This does not defeat the plan; it makes the Persian evaluation harness a phase-0 deliverable rather than an afterthought. See §9.  **COMMENT**: can we start with western models like gpt 5 nano?

---

# 2. The information-flow problem — your comment on reference-passing

Your objection is correct and it defeats my Round 2 proposal as stated. If the model cannot see the balance, it cannot answer "based on my balance, what loan can I get" — because that answer requires joining the balance with the loan catalogue. I was optimising the wrong invariant.

## 2.1 The invariant was wrong

Wrong: *the model must never see sensitive data.*
Right: **sensitive data must not reach an unauthorised sink.**

Seeing is not leaking. Leaking is crossing a trust boundary without authorisation. Once stated that way, your instinct in the comment — *"something in the middle that doesn't let information go from one system to another, and the place of their calls must be defined"* — is exactly the right architecture. It is called information-flow control, and it belongs in the middle, as you said.

## 2.2 Name the sinks

The design becomes tractable once the destinations are enumerated, because each gets its own rule:

| Sink | Risk | Control |
|---|---|---|
| A third-party MCP or service | Snapp's server learns your bank balance | **the dangerous one** — default deny, per-purpose consent to allow |
| The model provider | data in their logs or training set | contract + deployment: S3 data routes only to self-hosted inference |
| Another user | via a shared pact or a group | per-party field projection (§3) |
| Long-term memory | quiet accumulation of a sensitive profile | labelled storage, TTL, user-visible and user-erasable |
| The client / the user | none — it is their own data | always allowed |
| Audit log | necessary; access-controlled | always written, read-restricted |
| Analytics and internal services | re-identification | aggregate only, labels enforced |

Note what falls out: **the model itself is not the primary threat.** The primary threat is a third-party MCP, and secondarily the model *provider*. That reframing makes the design cheaper and the product better.

## 2.3 The mechanism: a Data Broker in the middle

Every tool result and every outbound call passes through a broker inside Vista's trust domain — never inside the model, never inside an MCP.

The broker does five things:
1. **Labels** every returned field: owner, originating domain, sensitivity (S1–S3), collection purpose, TTL.
2. **Propagates taint** — the working context carries the union of the labels it has absorbed.
3. **Checks egress** before any outbound call: may these labels reach this destination, for this declared purpose?
4. **Enforces** with one of: allow · redact · reduce-to-predicate · compute-in-broker · require explicit user consent · deny.
5. **Logs every crossing**, user-visibly. "Your balance was disclosed to the assistant on 12 Mehr for the purpose of loan eligibility" is both a trust feature and a regulatory asset — and it is exactly what the read-only regulator agent queries.

## 2.4 Solving your loan example — four techniques, in order of preference

**1 — Predicate evaluation inside the owning domain (no disclosure at all).**
The bank's MCP exposes `evaluate_loan_eligibility(catalogue) → eligible[]`. The balance-versus-threshold comparison happens inside the bank, which already knows the balance. The model receives an eligible set, not a number. **This is the right answer whenever both inputs live in one domain, and it should be the default pattern we ask every provider to implement.**  **COMMENT**: no. we need to پمپ intelligence into apps and we should not expect them to be intelligent. and the loan suggestion needs intelligence.

**2 — Computation in the broker (the cross-domain case, and the one you actually raised).**
When the thresholds come from domain A and the balance from domain B, neither side may see the other's data. So neither side computes — **the broker does.** The model emits a declarative expression over handles rather than over values:

```
filter(loan_catalogue, λ product: product.min_balance <= @balance_ref#7f2)
```

The broker resolves both handles inside Vista's trusted domain, evaluates a restricted, non-Turing-complete expression language (comparisons, arithmetic, filter, sort, aggregate — no I/O, no branching on undisclosed values into free text), and returns only the result. The model learns which loans qualify. Neither the bank nor the loan provider learns anything about the other. Nothing crossed a boundary.

This is the direct answer to your comment: **the thing in the middle does not merely block the flow, it performs the computation so that no flow is needed.**

**3 — Banded disclosure.**
Where the model genuinely needs to reason numerically, disclose a band rather than a value: "balance is in the 50–100M range." Sufficient for planning, far lower leak value, and it degrades gracefully.

**4 — Sealed disclosure under closed egress.**
The escape hatch. The value enters the context, and for the remainder of that turn the session is sealed: no third-party MCP calls, no memory writes, no pact sharing. If a third-party call then becomes necessary, the runtime forks a clean sub-context inheriting only explicitly de-tainted fields. Rare, logged, and reviewable.
 **COMMENT**: I think the model should do the calculation itself or by writing a transient script. our job is to not let unauthorized MCP to access sensitive data model has.
## 2.5 MCP → AI callbacks — your second question

**Rule: MCPs are leaves. The call graph is a tree with exactly one orchestrator.** No MCP may call back into the user's agent, receive the session context, create a pact, or address the user. This closes the confused-deputy path you were worried about.

But you also want providers to have AI — that is the "pumping" idea in §6 — so the exception has to be defined precisely rather than forbidden:

> **Sealed inference.** A provider's model runs as a separate instance with its own context, no tools, no session history, and inputs limited to what the broker permits. Its output is **data, never instructions**: it cannot create pacts, request capabilities, escalate privilege, or speak to the user in its own voice.

That is what makes selling AI to partners safe: we sell them inference, not a seat at the orchestration table.

On A2A: agent-to-agent delegation is becoming a real standard alongside MCP, and it will be asked about. Position it as **not in phase 1, and if ever adopted, only through the broker with an explicit capability grant** — because A2A is precisely the protocol that would let a provider's agent talk to the user's agent, which is the boundary this whole design exists to defend.
 **COMMENT**: making MCPs leaves is true and I think it's enough. I dont want to over limit the AI. it should be intelligent enough. I dont fear giving info to a partner AI provider. I prefer no policy over over restricted policy. if we dont have the good policy yet, we mark it as "work to be done"
## 2.6 Three supporting rules

- **Purpose binding.** A capability declares what data it needs and why. Consent is granted per (data, purpose, service) — not per session and not per app.
- **Per-domain context partitioning.** The working context is partitioned by service domain; a Snapp call sees the Snapp partition plus fields explicitly promoted by policy or by the user.
- **Self-hosting becomes a security requirement, not only a cost one.** S3 data may route only to inference we host. This strengthens the argument for your Chinese-partnership roadmap in §9: the migration from API to self-hosted is what unlocks the sensitive-data use cases, so it has a product deadline, not just a cost rationale.

## 2.7 Revised recommendation

Round 2's "S3 never enters the model context" is withdrawn. Replace with: **S3 may enter the model context under a sealed egress regime, and prefer predicate evaluation or broker computation over disclosure wherever the pattern permits.** Reference-passing survives as an optimisation — it is how handles reach the broker — not as the security boundary.

---

# 3. Formalising the Pact — your generalisation of the Intent

Your summary is right and the generalisation is larger than the ride example. What you have described is a **multi-party, signed, conditional agreement object**, of which a single-user intent is the degenerate one-signer case, and of which a smart contract is the fully-automated case. One object, three levels of automation. That unification is, I think, the strongest architectural idea in the whole corpus, because it connects the super-app and the bank through a single primitive.

I propose naming it **«پیمان» (Pact)** — see §14.

## 3.1 The object

```
Pact {
  id, version, parent_id                      // amendments chain
  type: transfer | order | booking | rent | sale | escrow | grant | governance
  schema_ref                                   // the capability profile defining terms

  parties: [ { party_id, role, signature_required, visible_fields,
               obligations, status, signed_at, signature } ]
  roles:   initiator | payer | payee | beneficiary | approver |
           contributor | custodian | witness | executor

  terms:        { ... }        // the canonical field set — the thing that is signed
  open_fields:  [ { field, owner_party } ]     // what a named party must still supply
  conditions:   [ ... ]        // must hold at execution time
  effects:      [ ... ]        // the state changes execution will cause

  policy: { risk_level, required_auth per party, quorum_rule }

  state: DRAFT → OPEN → PARTIALLY_SIGNED → FULLY_SIGNED → READY
                 → EXECUTING → SETTLED
         exits:  AMENDED · REJECTED · EXPIRED · CANCELLED · DISPUTED · REVERSED

  canonical_hash                                // over terms + parties + conditions + effects
  nonce, created_at, expires_at
  audit: [ every transition, disclosure, and signature ]
}
```

## 3.2 The invariants — this is the formalisation

1. **A signature binds to the canonical hash.** Dynamic linking, generalised from one signer to n.
2. **Any change to terms creates a new version and invalidates every prior signature.** Whether unaffected parties must re-sign is a declared property of the pact type, never a silent default. Your shared-ride case gets its safety from this rule for free: when the guest supplies the origin and the price changes, the initiator's earlier confirmation is automatically void.
3. **A party signs only what it can see.** Each party has a field-level projection — the seller does not see the buyer's balance — and signs a Merkle commitment over the full canonical terms plus a proof that their projection is consistent with it. Everyone signs the same object without everyone seeing all of it. **This is where the pact model and the flow-control model in §2 become the same design.**
4. **Quorum is declared, not inferred.** k-of-n, or role-based ("all payers plus any one approver").
5. **Execution requires** FULLY_SIGNED · conditions hold · not expired · nonce unconsumed. Single-use, as before.
6. **The agent drafts; it never signs.** Signature is always an act by a principal at a client, human or credentialed.
7. **Every executed pact produces a ledger entry.** This is the bridge to Part 3 and to §4.

## 3.3 Generality — the same object across the whole book

| Case | Parties | Shape |
|---|---|---|
| Simple purchase | 1 | one signer, immediate settlement — today's Intent |
| Split bill | n payers | quorum = all; settles on last signature |
| Shared ride (your example) | initiator + guest | guest owns an open field; re-hash triggers re-confirmation |
| Gift | giver + recipient | payer ≠ beneficiary |
| Family / delegated spend | grantor + grantee | type `grant`; effect is a scoped capability with limits |
| Rent | landlord + tenant (+ custodian) | recurring effects, deposit condition, duration |
| Sale with escrow | buyer + seller + custodian | condition = delivery confirmed; effect = release |
| Loan | borrower + bank | collateral condition; liquidation as a conditional effect |
| Governance change | k of n administrators | your C1 comment, expressed in the same object |

Nine use cases, one primitive, one audit model, one signature model. That is what makes it a platform rather than a feature.

## 3.4 The consequence for the roadmap

Because a pact is already multi-party, signed, conditional, and ledger-settled, **the social layer, the marketplace, the banking layer and the smart-contract layer are all the same machinery at different settings.** The book should introduce the pact once, early, in the foundations part, and then have every later part refer back to it. It will make a very large book feel like one argument.

---

# 4. Smart contracts without a blockchain — answering your question

You said you do not insist on blockchain if Raft or Paxos suffices, and asked what happens to smart contracts. The answer is that they are unaffected, and this is good news for the roadmap.

**A smart contract needs three things:** deterministic conditional logic, a tamper-evident ordered ledger, and automatic execution when conditions hold. **None of the three requires Byzantine consensus.** A Raft-replicated deterministic state machine gives you determinism, total ordering, durability, geographic survivability, and automation. Contract code is versioned, signed, deployed, and executed by that state machine.

**What you lose without BFT** is narrow and specific: protection against *the ledger's own operator* rewriting history, and independent verification by parties who do not trust that operator.

**You can recover most of it very cheaply.** Add to the Raft ledger a hash-chained append-only log with a Merkle tree, and publish **signed checkpoints** to external parties — the regulator, the partner bank, an independent auditor. Any of them can then verify inclusion and detect retroactive alteration without running a consensus node. This is the Certificate-Transparency pattern, it is well understood, it costs almost nothing, and it turns your read-only regulator agent into an actual verifier rather than a viewer. **I consider this the single most valuable architectural recommendation of this round for Part 3.**

**When BFT is still warranted:** validators that are genuinely different organisations with no common operator; third-party custody of tokenised assets; or a regulator requiring that no single operator can finalise state.

**Proposed roadmap consequence, which materially de-risks the book:**
> Phase 2 delivers programmable pacts on a Raft-replicated **verifiable ledger** with external signed checkpoints. Phase 3 evaluates BFT/permissioned DLT **only** for tokenised assets held by third parties, against the decision gate.

Smart contracts arrive years earlier, the DLT chapter becomes a genuine engineering evaluation rather than a commitment, and the gold-token chapter gets a concrete substrate to sit on.
**COMMENT**: I think we should integrate the pact idea and the smart contract idea somehow. my idea:
[۲۰۲۶-۰۹-۰۷ ۱۸:۳۳] تبدیل ویس به متن in reply to امید:  
> Voice message  
ببین من الان دارم بلند بلند فکر می‌کنم و به کمک و راهنمای تو نیاز دارم تا این ایده رو بهتر بپزی اون چیزی که من الان دارم بهش فکر می‌کنم این هست که این کارهایی که می‌شود در چیز انجام داد در این سامانه انجام داد خب گفتیم سه تا لایه داریم دیگه لایه یک لایه دو لایه کلاً کارهای خوندنی یعنی از جنس دیدن که هیچی کلاً نیازی به تایید کاربر نباید داشته باشه به نظرم حتی اگه اطلاعات حساس باشه این داره بیش از حد پیچیده می‌کنه کار رو بخوام اطلاعات رو من باب حساس بودن یا نبودن با همدیگه فرق یعنی باید فرض بکنیم که همه اطلاعات را می‌شود خوند از جاهای مختلف اون چیزی که اینجا می‌تونه مشکل ساز باشه اینه که این هوش مصنوعی بیاد اطلاعات رو بده به در واقع یه دونه ام سی پی که ما دوست نداریم این اطلاعات رو به اون بدیم اولاً این خودش خیلی مسئله خاصی نیست یعنی ما در واقع باید ام سی پی ها رو در واقع باید از قبل بررسی بکنیم بعد اجازه بدیم بیان وصل بشن و اینکه حالا من یک مدلی مد نظر دارم که اون مدل رو می‌گم تا باهاش کار بکنیم که به نظرم این مدله اگه خوب در واقع فرمال بشود و خوب پخته بشود جواب خیلی از مشکلات رو میده  
[۲۰۲۶-۰۹-۰۷ ۱۸:۴۸] تبدیل ویس به متن in reply to امید:  
> Voice message  
مدلی که من مد نظرم هست یه چیزی شبیه همون بلاک چین و قرارداد هوشمند هست خب ببین الان هر کدوم از این ام سی پی ها دارند یه دونه چیز می‌کنن دیگه یه دونه در واقع برای خودشون یک امضایی دارند یعنی مشخصه که چه توابعی دارن چه ورودی های میگیره و امثالهم درسته خب ما این رو اگر با مفهوم قرارداد هوشمند ترکیب بکنیم یعنی چی یعنی قرارداد شفافی که تغییر دادن اون باعث میشه که یک اتفاقی بیفته هر کدومشون یک هشت دارند و معلوم هستش که این قرارداد هوشمند چه نسخه‌ای هست یعنی تغییر عملکرد اون شفاف هست و ما می‌تونیم مثلاً یک نسخه مشخص رو بریم بررسی بکنیم و اون رو اجازه بدیم بیاد توی سامانه و اگه تغییر کرد باید دوباره بررسی بشود یه همچین چیزی یعنی تقریباً شبیه کار کمی کافه بازار میکنه دیگه یعنی یه دونه نسخه از برنامه رو بررسی می‌کنه تا وقتی آپدیت بدی دوباره آپدیت تو رو هم بررسی میکنه یه همچین کاری بکنیم یعنی همچین مکانیزمی داشته باشیم که هر کدوم از اون سرویس های که دارن میان تو سامانه ما رو ما اون چیزش رو بررسی می‌کنیم اون عملکردش رو اون امضای برنامه رو بررسی می‌کنیم که مثلاً چیز بدی نخواد و اینها اگر رفتش عوض کرد باید اون چیز جدیدش رو دیپلوی بکنه و ما بررسی بکنیم و تایید بدیم یه همچین کاری یه مکانیزمی باید وجود داشته باشه شبیه کاری که تو اتریوم انجام میشه که میان و یه دونه قرارداد هوشمند رو مثلاً به روز رسانی می‌کنند و امثالهم و مثلاً غیر قابل تغییر هست و اینجور چیزا پس ما یه همچین مکانیزم های من دوست دارم که از دانش انباشته اتریوم استفاده بکنم بالاخره اونجا یه همچین کاری کردن یعنی من میخوام قرارداد هوشمند اتریوم رو با همون ساختار و با همون روش کد زدن داشته باشم و اون رو ترکیب بکنم با ام سی پی یه جوری این دو تا رو می‌خوام با همدیگه ترکیب بکنم این ترکیب کردن دو تا خوبی به من میده یکی اینکه الان گفتم بود یعنی من دیگه می‌تونم خیالم راحت باشه که یه دونه ام سی پی مخرب نیست چون بخواد مخرب باشه باید تغییر رو بده توی امضای خودش و وقتی که می‌خواد تغییر رو بده خب بعد من دوباره تایید بدم رو نسخه جدیدش درسته ممکنه که بدون تغییر دادن امضای اون در واقع سرویس اون پشت بره یه کار ناشایستی بکنه با همون دیتایی که داره میگیره یه کار ناشایستی بکنه اینو دیگه من ریسکش رو می‌پذیرم اینو دیگه می‌ذاریم کنار یعنی فرض میکنیم که دیگه اون پشتش اتفاق بدی اگر می‌خواد بیفته داره میفته دیگه یعنی اینو دیگه دخیل نمی‌کنیم تو محاسبات خودمون اما خوبی دومی که داره هم بحث امکان بررسی در واقع فراخوانی‌ها هستش ببینید ما مثلاً فرض بکن همون مثال گرفتن اسنپ چه بخواد برای خودش بگه چه بخواد برای دیگری بگیره خب این رو می‌تونیم ببریم تو همین قالب قرارداد هوشمند و فراخوانی قرارداد هوشمند یعنی چی یعنی اینکه یه دونه در واقع وقتی که کاربر مثلاً برای خودش یه دونه اسنپ می‌خواد بگیره داره انگار یه قرارداد هوشمند رو فراخوانی می‌کنه با یه مقدار تعدادی پارامتر مشخص که در واقع این هوش مصنوعی براش میاد اون قرارداد پر نشده رو آماده می‌کنه کاربر فقط میاد اونجا امضا میزنه کاری که همین الان مثلاً کارپردازها و تحصیل‌دارها و امثالهم انجام میدن دیگه یعنی میان برای مدیرعامل قرارداد رو آماده می‌کنند همه فیلدهای قرارداد رو پر می‌کنند همه چیز آماده است فقط امضای مدیرعامل مونده که بزنه پای اون اینم شبیه همچین چیزی هست یعنی هر فراخوانی نوشتنی نه خواندنی خواندنی‌ها نه خواندنی‌ها نیازی به این مکانیزم ندارن و آزادانه انجام داد اما نوشتنی‌ها یعنی وقتی که میخواد یه دونه چیز رو بنویسه یه قراردادی رو امضا بکنه یعنی می‌خواد یک سرویسی رو استفاده بکنه که مثلاً حالا تغییر توی استیتی خواهد داد این اتفاق باید بیفته که این هوش مصنوعی براش یه قرارداد پر شده ولی ام شده آماده کنه و این کاربر باشه که اون رو امضا می‌کنه خب همونطور که قراردادها از جهت اینکه چقدر امضا باید داشته باشند تا اجرایی بشوند متفاوت هستند اینم همین شکلیه یعنی مثلاً یه قراردادی هست فقط امضای مدیرعامل کافیه یه قراردادی هست که هم امضای مدیرعامل می‌خواد و هم اثر انگشت می‌خواد یکی دیگه هست هم امضا می‌خواد هم اثر انگشت می‌خواد هم مرغ شرکت رو می‌خواد یکی دیگه هست که همه این سه تا رو می‌خواد هم از مدیرعامل هم از یکی از اعضای هیئت مدیره مثلاً فرض بکن یعنی این تفاوت‌ها رو همین الان تو قراردادهای عادی هم داریم دیگه تو اینجا هم باید داشته باشیم یه کاری هستش که کار سبکیه مثل مثلاً سفارش دادن غذا این کار سبک باز همچنان امضا می‌خواد اما امضایی که در حد همین لاگینی هستش که کاربر توی برنامه کرده یعنی وقتی کاربر توی برنامه لاگین می‌کنه براش یه دونه کلید درون برنامه ایجاد میشه که در واقع  
[۲۰۲۶-۰۹-۰۷ ۱۸:۴۸] تبدیل ویس به متن in reply to امید:  
> Voice message  
همون چیزی نیست جز همون درخواستی که داره میده به سمت سرور ما یعنی بیرون از رویه هوش مصنوعی میتونه به سرور ما یه درخواستی بده و کلا به نظرم میاد که ام سی پی فقط خوندن رو انجام بده و آماده کردن قراردادهای امضا نشده اینکه کاربر امضا بکنه یعنی بعضی وقتا امضاش همین فقط فرستادن درخواست هست به اون در واقع هندلر ما که حالا یه اسم بد براش بزاریم پردازشگر ما که میاد قراردادهای امضا شده رو پردازش می‌کنه بعضی وقتا همین که درخواست رو بفرسته و ما احراز هویت بکنیم که این کاربر این درخواست رو فرستاده به منزله همون امضا هست به خاطر اینکه اون کار کار حساسیت کمی داشته یه لایه حساسیت بالاترش این می‌شود که باید اون امضای دیجیتال بشه امضا دیجیتال رو هم با چی انجام میدیم حالا اینم باز می‌تونه مثلاً بسته به میزان امنیت امضای دیجیتالش متفاوت باشه مثلاً اگر از امضا دیجیتالش رو از طریق اون کلیدی که توی گوشی ذخیره شده انجام بده با کمک مثلاً اثر انگشت یا تشخیص چهره اونو باز بکنه و انجام بده این یک لایه مثلاً از امنیت داره و مثلاً تا انجام بشه یک لایه بالاترش این هستش که بخواد در واقع اون کلید توی سیم کارت ذخیره بشه و اون چیزی که می‌خواد امضا بشه بره توی سیم کارت امضا بشه و بیاد بیرون یا مثلاً توی یک توکن usb یا امثالهم انجام بشه که این یه دونه احراز بالاتریه و یه سری کارهای مثلا فرض کن سقف های بالاتری از انتقال را میشه با این انجام داد مثلاً می‌گیم برای اینکه تو بتونی مثلاً انتقال بدی انتقال که امضا می‌خواد حالا تا یه سقفی رو میتونی با امضای درون گوشی انجام بدی تا یه سقف بالاتری رو باید با امضای درون سیمکار انجام بدی یه بار بالاتر از اونم دیگه مثلاً دیگه باید بری شعبه دیگه مثلاً دیگه حضوری باید بیشتر از اون سقفه رو دیگه نمی‌تونی از طریق برنامه انجام بدی این شبیه همون مکانیزمی که گفتم در رابطه با امضا و اثر انگشت و مهر یعنی امضا میشه همون چیزی که یه درخواستیو بفرستیم امضا اثر انگشت می‌شه اون چیزی که میاد توی درواقعشی امضا توی گوشی انجام میشه اون که مهر هم میزنی انگار که همون مثل همون سیم کارته هست دیگه که امضا در سیم کارت داره انجام می‌شه خب پس ما در واقع سه تا لایه متفاوت از امضا رو بیان کردیم حالا یک لایه وسط این دو تا می‌تونه باشه یعنی بالاتر از درخواست خالی و پایین‌تر از امضای دیجیتال و اون همین هستش که یه دونه otp بفرستیم و otp رو وارد بکنه این هم یک لایه دیگه هست اون وسط‌ها می‌تونه قرار بگیره مثلاً به سیم کارتش یه دونه otp چند رقمی میفرستیم و اون رو وارد می‌کنیم خب پس لایه‌های مختلفی داریم برای امضا کردن یک قرارداد هوشمند پیش ساخته توسط هوش مصنوعی ام سی پی که در واقع کاربر می‌تونه امضا کنه حالا بعضی از قراردادها چند امضای هستند مثلاً چی مثلاً قرارداد که یه نفر خونش رو به نفر دیگه اجاره میده اینا رو لزومی نداره که اولش پشتیبانی کنیم ولی مثلاً همچین چیزی گذاشتنش راحته یه دونه سرویس میاد که آقا بیان قرارداد اجاره رو خودتون با همدیگه بنویسید این شکلی میشه که اول یکی از طرفین مثلاً فرض کنید که اجاره دهنده یعنی صاحب خونه میاد و این رو پر می‌کنه مشخصات خونه رو اینا رو می‌نویسه همه اطلاعات رو می‌ذاره بعد خودش امضا می‌کنه و بعدش هم اون رو میده به مستاجر اونم امضا می‌کنه اگه دقت کنید این شبیه دوبار فراخوانی یه دونه قرارداد هوشمند هست دیگه یعنی قرارداد هوشمند‌هایی که همه الان توی اتریوم هستند این شکلی اند که بالاخره یکی میاد یه جاییشو امضا می‌کنه از یه استیتی میره به استیت دیگر که مثلاً در انتظار تایید مستاجر میشه بعد مستاجر هم میاد همون امضا میکنه در فیلد مستاجر رو و بعدشم تموم میشه حتی ممکنه شاهد و اینها هم داشته باشه یعنی علاوه بر این‌ها یه نفر شاهد هم میاد این قرارداد هوشمند رو بتونه امضا کنه یعنی جا برای امضای شاهد و شاهدها هم وجود داشته باشه پس در واقع ما اگر این قضیه قرارداد هوشمند رو ببریم یه دونه چیز یک شهروند درجه یک بکنیم به نظرم خیلی از مسائل حل میشه یعنی نه تنها تو بحث بانک سینا این رو داشته باشیم بلکه تو کل پلتفرم ما مفهوم قرارداد هوشمند بشود یک مفهوم درجه یک که کاربران میان اون قرارداد هوشمند رو امضا میکن و مشخص هم باشه که در چه سطحی این امضا کردند در سطح پایینش که میشه درخواست احراز هویت شده سطح دوم میشه با کمک otp سطح سوم میشه با امضای دیجیتال درون گوشی و سطح چهارم میشه با امضای دیجیتال درون سیم کارت و حتی می‌تونه ترکیبی از این‌ها هم باشه دیگه یعنی مثلاً چند تا از این امضاها رو با همدیگه داشته باشه خب پس این شد در واقع این مکانیزم کلمه من گفتم  
[۲۰۲۶-۰۹-۰۷ ۱۸:۵۲] تبدیل ویس به متن in reply to امید:  
> Voice message  
ببین یک مفهوم دیگه‌ای هم هست که باید اینجا داشته باشیم اون هم در واقع چیزهایی هستش که محرک اونها کاربر نیست و سیستم هست یعنی چی یعنی مثلاً فرض بکنید که یه دونه قبض جدید برای کاربر صادر میشه این قبضه رو لازم نباید باشه کاربر بیاد بگه من یه قبض جدید برام اومده من می‌خوام پرداخت بکنم که ما بعداً بهش بگیم که خب بیا این قرارداد هوشمند که تو امضا بکن تا پرداخت بشود نه برعکسش باشه یعنی ما وقتی که یه قبضی برای شماره قبضی که میدونیم برای این کاربر هست از قبل اومده بهش یه دونه نوتیفیکیشن می‌فرستیم و قرارداد هوشمند نیمه آماده پرداخت قبض رو بهش نشون میدیم که تالار بتونه با یک تایید این را در واقع پرداخت بکنه و همچنین قرارداد هوشمند‌های مثل اجاره و این‌ها فرض بخوایم یک سرویسی اون پشت هست که اون سرویسه با این بحث اجاره رو داره بین دو تا کاربر انجام میده یعنی ما خودمون کاری نکردیم یه دونه سرویس هست در قالب ام سی پی کمک می‌کنه که قراردادهای اجاره نوشته بشه و پرداخت بشه خب وقتی این سرویسه دو نفر درونش یه دونه قرارداد اجاره ثبت کردن خب توی اونجا معلومه که موعد اجاره کی به کیه وقتی موعد اجاره فرا میرسه خود همین سرویس می‌تونه یک نوتیفیکیشن بفرسته به اون در واقع کاربر مستاجر و ازش بخواد که الان موعد اجاره هستش بیا پرداخت بکن یعنی به جای اینکه کاربر بیاد خارج از این مکانیزم و به صورت مثلاً کارت به کارت یا به عنوان انتقال وجه پولو بده انتقال وجه در قالب پر کردن این قرارداد هوشمند اجاره بهای مهم مثلاً آبان در واقع انجام میده یعنی بازم همچنان پول ازش کسر می‌شه ولی پولی که داره کسر میشه نه به عنوان انتقال وجه عادی بلکه به عنوان پر کردن یک قرارداد هوشمند اجاره انجام میشه طبعاً اون سرویس اجاره‌ای که اون وسط یکی می‌نویسه یه درصد کمی از این مبلغ رو به عنوان کارمزد برمی‌داره مثلاً فرض بکنید نیم درصد رو ورمداره و ما هم از اون کارمزدی که اون ورمداره مثلاً ۲۰ درصدشو ما ورمداریم بقیه رو هم اون کارمزده وداره و مابقیش رو هم یعنی اون ۹۹.۵ درصد باقی مونده رو هم که خب به کیف پول در واقع صاحب خونه واریز می‌شود  
[۲۰۲۶-۰۹-۰۷ ۱۸:۵۶] تبدیل ویس به متن in reply to امید:  
> Voice message  
پس با این شیوه که الان مطرح کردم اون قضیه بانک سینا از یک پروژه‌ای که می‌تونه موازی انجام بشه تبدیل می‌شود به یک چیزی در دل این کار که در واقع اون بانک سینا هم در واقع یک سرویس دهنده میشود از بین این سرویس دهندگان که امکان برداشت از حساب رو فراهم میکنه در نهایت چه کاربر بخواد به یک سرویس دیگه پرداختی داشته باشه چه بخواد در واقع انتقال وجه بکنه یا بخواد شارژ بکنه و امثالهم همه اینها در واقع پر کردن قرارداد هوشمند های هستند که یک طرف همین مثلاً بانک سینا باشه که مثلا قرارداد هوشمند ریال خواهد داشت که اون قرارداد هوشمند ریال این کارها را فراهم می‌کنه اون بحث‌هایی که در مورد قرارداد هوشمند های مربوط به طلا و دلار و دای و امثالهم گفتم هم تو همین مکانیزم میاد دیگه لازم نیست که ما توی هسته بانک سینا بخواهیم کاری بکنیم یعنی بانک سینا رو هم دیگه ما هوشمند نمی‌کنیم برای اینکه هوشمندیه ویستا رو توی بانک سینا هم پمپ می‌کنیم شبیه اینکه این هوشمندی رو همه جا پمپ می‌کنیم اینجا هم پمپ می‌کنیم که هوشمندی که ما پمپ میکنیم همین ترکیب ای آی یعنی هوش مصنوعی به اضافه قرارداد هوشمند هست این دو تا در کنار همدیگه می‌شود هوشمندی که ما پمپ می‌کنیم توی سرویس‌های مختلف از جمله بانک سینا که بعداً مثلاً فرض کن یه دونه سرویس دهنده دیگه که طلا یه آب شده می‌فروشه بدون اینکه لازم باشه خیلی کار خاصی بکنه فقط میاد یه قرارداد هوشمند می‌نویسه که طلا رو بتونه کاربر از اینجا بخره و بتونه به اینجا بفروشه و میاد خب از همون کیف پول بانک سینا یه کاربر کم میشه طلا اضافه میشه که اون یه توکن دیگه هست درون همین سامانه و برعکس شبیه کاری که تو اتریوم می‌کنن دیگه مثلاً کاربر تتر میده و یه دونه کوین دیگه مثل کوین طلا می‌گیره و برعکس یعنی همه این کوین‌ها هم کم کم می‌تونن یه دونه بریج و پل درون سامانه ماه داشته باشند یعنی مثلاً فرض کن تتر که تو چند تا شبکه هست یه دونه بریج هم توی این شبکه داشته باشه نمی‌دونم آیا واقعاً بلاک چین لازم هست یا نیست واقعاً شاید بلاکچین لازم نباشه اما این سبک قرارداد هوشمند نویسی به سبک اتریوم رو ما لازم خواهیم داشت یا مثلاً به سبک باینس رو ما لازم خواهیم داشت و همچنین این هوش مصنوعی که گفتم رو لازم خواهیم داشت پس در واقع ما دو تا هوشمندی داریم یعنی این سوپر اپ ما دو نوع هوشمندی درون خودش داره یه دونه هوشمندی او همین هوش مصنوعی هست که داریم پمپ می‌کنیم و هوشمندی دیگر او قرارداد هوشمند هست که ما زیرساختش رو فراهم خواهیم کرد

---

# 5. Availability — your mosaic model accepted, and it is better than mine

You rejected the generated deterministic surface. You are right, and I had conflated two different things: **structured rendering inside the conversation** (which you agreed with, and which stays) and **the fallback when AI is unavailable** (which is where you are correct that generating a whole shadow UI is not worth building).

Your model — degrade to a mosaic that routes to each backend service's own web GUI, consuming only Vista SSO and Vista payment — is cheaper, simpler, and has a benefit beyond fallback:

**It gives you a two-tier integration model, which solves onboarding.**

| Tier | Provider ships | Provider gets |
|---|---|---|
| **1 — Mosaic** | a web GUI that consumes Vista SSO + Vista payment | distribution, SSO, payment, notification, presence in Vista |
| **2 — Agentic** | additionally, an MCP with declared capabilities and levels | the agent can invoke it, semantic discovery, AI pumping (§6) |

Tier 1 is a very low barrier — most services can do it in weeks — and it answers "what if a provider will not build an MCP." Tier 2 is the upgrade you sell them. **Present this as a strength of the onboarding funnel, not merely as a degradation path.** **COMMENT**: OK

On the rhetorical tension with your own thesis: address it directly in the book. *The mosaic is Vista's floor, not its ceiling — and even the floor is better than the competitors' ceiling, because Vista's mosaic shares one identity, one payment method, and one notification stream, which theirs do not.* That turns a potential inconsistency into a point.

What I would keep from Round 2: **differentiated SLOs** — SSO, payment and notification must carry a materially higher target than the conversational path, and publishing a deliberately lower SLO for the AI path with a designed fallback reads as competence — and **capability health in the catalogue**, so the agent never offers a service that is currently down. I withdraw the queued-intent mechanism; it adds state for little benefit.

---

# 6. «پمپاژ هوش» — productising the idea in your comment

Your comment is a product line, not a revenue footnote, and it deserves a name and a chapter. The idea: **services do not have to become AI companies. Vista pumps AI into them.** They get semantic search, recommendation, conversational support and structured extraction over their own catalogue and data, without hiring an AI team, buying tokens, or writing model-integration code.

Proposed Persian term, since you asked for the metaphor to be kept: **«پمپاژ هوش»** as the narrative term, with **«سرویس هوش ویستا»** as the formal product name.

**What is actually sold:**
- semantic and intent-aware search over the provider's own catalogue
- recommendation and ranking
- conversational customer support drawing on the provider's own content
- structured extraction and enrichment (turning their unstructured data into declared capabilities)
- an evaluation harness, so the provider can see quality rather than take it on faith

**Why it is strategically valuable, beyond revenue:**
1. It is a second answer to "what does Snapp gain" — not just demand, but capability uplift they would otherwise have to build.
2. It aggregates inference demand across the ecosystem, which is what justifies the GPU investment in §9. Every partner using pumped AI improves the unit economics of self-hosting.
3. It produces the capability metadata the marketplace needs, as a by-product of a service the provider is paying for.
4. It is a clean subscription/usage revenue line that does not depend on transaction volume you do not yet have.

**Two constraints to state in the same chapter:** it runs as **sealed inference** under §2.5, and ingesting a partner's catalogue is a data-governance event requiring an explicit agreement on retention, isolation, and whether their data may improve anything shared.

---

# 7. Revenue — two answers

## 7.1 "Telecom value" — what I meant by the line you did not follow

Plainly: Irancell already serves millions of self-service interactions a month — checking balance, buying a bundle, paying a bill, activating a service, asking why the internet is slow. Today these happen through the Irancell app, USSD codes, the call centre, and retail outlets. **The call centre and retail cost real money per interaction; the app and USSD are cheap but convert poorly.**

Moving these into Vista produces value in three measurable ways:

1. **Cost avoidance.** Every support call that a competent agent resolves instead of a human is a direct, attributable saving. This is the easiest number in the entire business case, and a CFO will accept it because they already track cost per call.
2. **Revenue per subscriber.** Conversational purchase converts better than menu navigation. "Your data runs out tomorrow, shall I renew the same bundle?" is a sale that a USSD menu never makes. Attach rates on bundles and add-ons rise.
3. **Churn.** Subscribers who use an operator's digital services churn measurably less than those who only make calls. Every additional service the user consumes inside Vista raises switching cost.

Why it matters for the proposal: this value is **measurable within months, requires no external partner, and accrues directly to the division you are being asked to run.** Take-rate revenue is larger eventually but depends on partners, volume, and time. Lead the business case with telecom value, and present take-rate as the scale story behind it. It is the difference between a business case a CFO can verify and one they must believe. **COMMENT**: good.

## 7.2 In-chat advertising — right idea, and the one thing that can destroy the product

You are right that a related service can be surfaced in the relevant conversation, and it is a strong revenue line. It is also the single most reliable way to kill an assistant, because the entire product rests on the user believing the agent acts for them. Once a user suspects the recommendation was bought, every recommendation is suspect — including the honest ones.

Four rules I would put in the book as commitments, because publishing the constraint is what makes the revenue line survivable:

1. **Sponsored suggestions are visibly labelled and visually distinct** from agent recommendations. **COMMENT**: correct.
2. **Money never influences an intent already formed.** If the user has said "get me a car," no payment may change which provider executes it. Advertising may introduce a service the user has not chosen; it may never redirect a choice already made. **COMMENT**: true
3. **Nothing sponsored ever appears in a confirmation payload.** The confirmation surface is authoritative-data-only, forever. This is the same boundary as §2 and it must not be crossed for revenue. **COMMENT**: of course
4. **A sponsored suggestion may not be presented as an agent judgement.** "Snappfood is offering X" is fine; "I recommend Snappfood" in exchange for payment is not.

Practical framing for the book: sell **placement and discovery**, never **advice**. That distinction preserves the asset. **COMMENT**: good

---

# 8. Payment and wallet — the guidance you asked for

You said you do not know the licensing path and asked me to guide you. Research changes my confidence here, and the recommendation is clear.

**Findings that drive it:** Iran's Central Bank has issued technical and operational standards for electronic wallet operators, and **wallets are instruments issued by banks or financial institutions**. PSP licensing is effectively closed — reporting indicates no new PSP licences have been issued since 2012 — and **PSPs are explicitly barred from issuing payment instruments or electronic money**. Separately, the CBI has published a revised **پرداخت‌یاری (payment facilitator)** framework, moving to a two-tier structure with defined capital and guarantee requirements.

**Recommendation:**

> **Vista must not attempt to become a licensed payment institution. The wallet is legally Bank Sina's; Vista is its interface.**

Concretely:
- **Phase 1** — no stored value at all. Payment runs on Bank Sina's existing rails: card payment through the bank's gateway, direct debit and card-on-file, plus **Irancell carrier billing** for telecom items, which you already control and which needs no new licence. Vista aggregates merchants under a **پرداخت‌یاری** arrangement, which is the realistic and currently-open licence route.
- **Phase 2** — the wallet launches as **a bank-issued e-money account** under Bank Sina's licence, with Vista as the user experience. Each user's balance is legally a bank liability. **The float sits at the bank; Vista earns fee income, not float income.** This is both the cleaner regulatory posture and the structure your competitors already use — Bale with Sadad and Bank Melli, Ap with Bank Shahr.
- **Do not** pursue a PSP licence. It is closed, and it would not even permit e-money issuance.

This also strengthens the joint-vehicle decision you already made for the Bank Sina programme: the bank is not merely a large service, it is the **regulatory vehicle** without which the payment layer does not exist. That belongs in the chapter as a stated reason for the partnership. **COMMENT**: true

## 8.1 The list Irancell must clear on your behalf

You said legal matters are Irancell's commitment, not yours. Then the book should say so explicitly and hand them a list. Draft — to be confirmed with counsel, as I am working from public sources:

- **پرداخت‌یاری** authorisation for merchant aggregation, under the current two-tier framework
- **Electronic wallet** operation under Bank Sina's licence, per the CBI wallet standards
- **Shaparak** connectivity and certification for card flows
- **AML/CFT** registration and reporting obligations, explicitly extended to agent-initiated and multi-party pacts
- A written **CBI position on agent-initiated transactions** — who bears liability for an erroneous one. This does not exist anywhere and someone has to ask; better Irancell than you, and better before launch than after an incident
- **Legal standing of SIM-based and mobile signatures** under Iranian electronic-commerce and e-signature law, including whether a pact signature is admissible evidence
- **Data protection and localisation** constraints, especially for cross-service joins under §2
- **Telecom VAS and carrier-billing** limits for phase-1 billing
- **Messenger licensing** — only if a messenger is ever built; another reason not to build one
- **Enamad** and consumer e-commerce registrations

Framing it as a checklist of counterparty obligations does two things: it protects you, and it demonstrates that you know what the project actually requires — which is itself an argument for giving you the mandate.

---

# 9. Model strategy — candidates and contract terms

Your instinct to partner with a Chinese provider, starting on API and migrating to self-hosted, is sound and matches what the market supports.

**The non-negotiable selection criterion: open weights.** An API-only partner makes the migration path fictional. Everything below is open-weight.

**Candidates, as of mid-2026 — versions must be re-checked at contract time:**

| Family | Vendor | Notes |
|---|---|---|
| **Qwen 3.5 / 3.6** | Alibaba | strongest all-round open-weight agentic family; very long context; broad multilingual coverage, which matters most for Persian |
| **GLM-5.x** | Z.ai / Zhipu | tops open-weight intelligence indices; strong on terminal and agentic work; aggressive pricing — matches the "GLM Flash" tier you cited |
| **DeepSeek V4** | DeepSeek | strong coding and reasoning; MoE architecture gives good self-hosting economics |
| **Kimi K3** | Moonshot | competitive frontier open-weight; very large, heavier to host |
| **MiniMax M3** | MiniMax | specifically strong at agentic tool-calling workflows |

**Recommended posture: dual-source.** Contract with two of them. It costs little, it prevents lock-in, it gives real failover, and it gives you leverage in the second negotiation. Given your requirements I would shortlist **Qwen** (breadth and multilingual strength) and **GLM** (cost and agentic performance) for the first evaluation, with MiniMax as a specialist option for the routing tier.

**Contract terms to insist on:**
- **Weights licence for on-premises deployment in Iran**, not merely API access — this is the whole point
- **Rights to fine-tune on Persian data** and to keep the resulting weights
- **Support for the API-to-self-hosted migration**, with a defined timeline
- **Assistance with hardware sourcing** — see below, this is the hard part
- **A no-training and no-retention clause** on our data, which is a §2 requirement, not a preference
- **An exit clause** that leaves us able to run the last delivered weights indefinitely

**The hardware is harder than the model.** Sourcing NVIDIA accelerators into Iran is the binding constraint, and no model contract fixes it. Two implications: make hardware sourcing an explicit part of the partnership rather than a separate problem, and evaluate **Huawei Ascend** as the accelerator path — Chinese, more accessible, with real software-maturity risk that must be tested rather than assumed. This should be a named workstream, because it has the longest lead time of anything in the plan.

**Phase-0 deliverable: a Persian agentic evaluation harness.** Given §1.5 — open models trail closed ones substantially in Persian — you cannot choose a model or a size on vendor benchmarks. Build a small evaluation that measures what you actually need: Persian intent classification, parameter extraction (amounts, names, dates, account references), multi-tool orchestration over four to six MCPs, refusal-to-hallucinate on missing data, and disambiguation-question quality. It is inexpensive, it decides the model contract, it decides the cost model, and **no one else in Iran has one** — which makes it a small strategic asset in its own right. The academic Persian benchmark literature gives you a starting point rather than a blank page.

---

# 10. Your cost thesis — largely right, with four caveats

The research supports you: cost for a fixed capability level is falling roughly an order of magnitude per year, and cheap tiers are extraordinarily cheap. Planning against the trend rather than today's price is the correct call. Four things to hold alongside it:

1. **Agentic tasks amplify token consumption.** A single request that plans, calls four MCPs, handles a failure and retries consumes far more tokens than a chat turn. Per-token price falls faster than per-task cost. Budget per completed task, not per token.
2. **Tool-calling reliability, not comprehension, is the binding constraint at small sizes.** Small models understand the request; they fail at multi-tool orchestration, correct parameter extraction, and admitting they lack data. Those are exactly the failures that matter here.
3. **Persian degrades faster than English as size drops.** Most cheap tiers are optimised for English and Chinese. A model that is adequate in English at a given size may not be adequate in Persian at that size. This is the one place your optimism needs measurement before it becomes a plan — hence §9's evaluation harness.
4. **The good news, and it is a real architectural point worth putting in the book:** because the agent cannot execute anything above L1, **a weaker model degrades the user experience but not the safety of the system.** The security architecture is what makes running cheap models a viable strategy. That converts a cost argument into an architecture argument, which is a much stronger thing to present to a board.

My overall answer to your question: yes, medium and even small models will handle understanding a request and calling four MCPs — **in Persian, once measured, with tiered routing** (a small model for classification and routing, a mid-size model for planning, a large one for rare hard cases) and aggressive caching. **COMMENT**: we should put tiering in roadmap but at start, we start with a medium to large model as PoC.

---

# 11. Voice — agreed, deferred, with one addition

Agreed: text first, voice in a later phase, documented in the book but out of the initial roadmap. Your reasoning from the trend is sound and this very conversation is evidence.

One observation worth putting in the book, because it connects voice risk to the security architecture you have already built. Your transcripts contain real ASR errors — «آب» for «آپ», «فیلم سوپر اپ» for «تیم سوپر اپ» — and I recovered both from context, exactly as a downstream model would. **So ASR errors in prose are self-correcting.** The dangerous case is an error in a *parameter*: an amount, a name, an account number. And that case is already handled — because the user confirms against an authoritative payload rendered from the service, not against the agent's transcription.

That gives you a clean line for the voice chapter: **voice is safe in this architecture specifically because nothing the agent hears is ever what gets executed.** Combined with disambiguation chips for structured choices, it makes voice a phase-2 feature with no new security surface.

---

# 12. Liability — your position, with the limits stated

Your instruction — comprehensive terms of use, disclaim liability, place responsibility on the user, tighten over time as the legal picture clarifies — is standard practice and the correct starting posture. Three limits you should know before relying on it:

1. **A blanket disclaimer will not hold across the payment and banking layer.** Consumer-protection and banking regulation generally do not permit an institution to disclaim liability for unauthorised transactions, and the parts of Vista most likely to cause loss are exactly the parts most likely to be regulated. So liability should be **tiered by action level**: L1 fully disclaimed; L2 disclaimed with evidence; **L3 governed by the bank's existing liability regime, which cannot be contracted away.**
2. **Reputationally, a disclaimer is not a defence.** "You approved it" fails publicly when the user says the assistant misled them. What actually protects you is evidence, and you already have it: the user confirmed an authoritative payload, cryptographically bound to the canonical terms, with the confirmation snapshot stored. **That is a far stronger position than any terms-of-use clause, and the architecture gives it for free.** The book should say so — it is a security feature doing double duty as a legal one.
3. **Budget for goodwill remediation in the early phase.** A small discretionary fund that makes wronged early users whole regardless of fault is cheap insurance against the incident that would otherwise define the product's reputation in its first year.

So: disclaimer as the legal floor, the audit trail as the actual defence, tiered liability by action level, and a remediation fund for phase 1. And add to §8.1 the request that Irancell obtain a written CBI position, since ambiguity here is their risk to resolve, not yours.

---

# 13. The mandate — draft for your review

You asked to see this before it goes in. Your comment defines two acceptable outcomes, so the chapter should present exactly those two and let Irancell choose. Presenting a choice is stronger than presenting a demand: it is harder to refuse both.

**Note first the finding in §1.4** — publicly, Irancell Labs looks like R&D, an innovation centre, and an academy, not a delivery organisation. Verify what it actually controls before accepting Option A framed around that title. A title without the production estate would be the worst result of this negotiation.

---

### Draft — Chapter «اختیارات و ساختار»

**Framing paragraph.** This book describes a system larger than one team. Building it requires either that the parts be brought under one technical direction, or that one part be built while the others are delivered against commitments. Both are workable. What is not workable is responsibility for the outcome without authority over the inputs. What follows is what each option requires.

---

**Option A — Technical direction across the programme**

*Scope:* architectural authority over the whole system in this book; the teams currently holding digital signature, identity, payment, the super-app and the Bank Sina work are aligned to a single roadmap and a single architecture.

*Required:*
1. Reporting to the chief executive, with a standing seat wherever technology investment is decided.
2. Architectural decision rights across all participating teams, including the right to reverse existing technology and vendor commitments.
3. Roadmap authority: what each contributing team delivers, and in what order, for the parts on this roadmap.
4. Budget authority to a defined ceiling without external approval, and a named process above it.
5. Hiring authority, including recruitment outside existing salary bands and the ability to restructure teams. This will be the binding constraint on assembling a team capable of this work.
6. A named executive sponsor with authority to resolve disputes between contributing organisations within a defined period.
7. A written mechanism obliging group companies and affiliates to expose capabilities to the platform on defined terms — not goodwill, a mechanism.
8. Product and commercial authority over take rates and partner terms.

---

**Option B — Ownership of the super-app, with delivered dependencies**

*Scope:* the AI-first super-app and its platform — agent, capability layer, marketplace, identity and consent experience, payment experience, pacts. Other teams build digital signature, the bank programme, and the service integrations.

*Required:*
1. Everything in A.4, A.5, and A.8 — budget, hiring, and commercial authority — for the super-app organisation.
2. **Delivery commitments, in writing, with named owners and dates**, for each dependency: SIM and secure-element signature; Bank Sina capability exposure; Irancell self-service capability exposure; identity and SSO; the notification platform.
3. **Interface authority.** I define the contracts those teams deliver against — capability profiles, risk levels, confirmation payloads, signature semantics. A dependency delivered to a different contract is not delivered.
4. Acceptance rights: the right to reject a delivery that does not meet the published contract.
5. An escalation path with a defined resolution period when a dependency slips, terminating at a named executive.
6. Priority of the super-app roadmap over the contributing teams' local roadmaps for committed items.

*Note on B's failure mode, stated openly:* without items 3, 4 and 5, Option B decays into responsibility for an outcome that depends on promises. That is the outcome this chapter exists to prevent, and I would rather name the risk than discover it in month six.

---

**Preconditions on both options.** Irancell should reach internal alignment — including with its shareholders — before contracting. That alignment is not something I can or should carry, and the plan assumes it is settled beforehand.

**Legal and regulatory obligations** listed in the licensing chapter are Irancell's to obtain. The architecture is designed to be compliant; obtaining permissions is a shareholder function, not a technical one.

**Evaluation.** I would rather propose the terms of my own assessment than receive them: [the twelve-month deliverable from the roadmap chapter], measured at defined intervals against named metrics.

**Closing.** If neither option is available in substance, it is better for both sides not to begin. The plan in this book is executable; it is not executable without the authority to execute it.

---

*Two notes on the draft.* First, in Persian this chapter is first-person singular while the rest of the book is first-person plural — the shift itself signals that this is the ask. Second, my recommendation is **Option A if and only if it comes with the production estate**; otherwise Option B with items 3–5 written hard, because a well-defended Option B beats an Option A that turns out to be an innovation title.

---

# 14. Naming — proposals

Vista names the super-app. For the rest, candidates:

| Component                        | Proposal                                                         | Why                                                                                                                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The multi-party signed object    | **«پیمان» / Pact**                                               | real Persian word for a covenant; spans intent → agreement → contract; brandable; a Pact with one signer is just an intent **COMMENT**: it's been over used in blockchain ecosystem. but it's OK to use it more. |
| The platform layer beneath Vista | **«بنیاد» / Bonyad** — or **«بستر»** if the former is too loaded | the foundation the product stands on                                                                                                                                                                             |
| The capability marketplace       | **«بازارچه قابلیت‌ها»**, product name **«بازارک»**               | avoids "MCP marketplace"; matches your framing of a market of intelligent capabilities                                                                                                                           |
| The data broker (§2)             | **«میانجی» / Miyanji**                                           | literally *the mediator in the middle* — exactly your phrase in the comment **COMMENT**: I dont like it                                                                                                          |
| The policy and risk engine       | **«داور» / Davar**                                               | the arbiter; decides, is not persuaded **COMMENT**: I dont like it                                                                                                                                               |
| The model gateway                | **«درگاه خرد»**                                                  | keeps the model a replaceable dependency behind a door                                                                                                                                                           |
| AI-as-a-service for partners     | narrative **«پمپاژ هوش»**, formal **«سرویس هوش ویستا»**          | your metaphor, kept                                                                                                                                                                                              |
| The verifiable ledger (§4)       | **«دفتر» / Daftar**                                              | the plain word for a ledger; deliberately unexotic                                                                                                                                                               |
| The Bank Sina programme          | **«سینا نو»** or **«بانک باز»**                                  | signals renewal without promising a rewrite                                                                                                                                                                      |

Two I would flag. **«میانجی»** and **«داور»** are the two names worth getting right, because they are the components that make the security story concrete for a non-technical reader — "the mediator" and "the arbiter" are self-explaining in a way that "policy engine" is not. And I would avoid a name for the agent itself: it should simply be Vista, because the moment the assistant has its own name it becomes a character, and characters attract expectations of personality rather than trust.

---

# 15. Persian conventions — my recommendation

You asked what I recommend. Firmly:

**Terminology.** Keep in Latin script only the terms with no stable Persian equivalent and which a technical reader expects in Latin: MCP, API, SSO, Token, LLM. Translate everything else and use the translation consistently, including for terms that feel natural in English: Agent → «عامل» (with *Agent* in parentheses at first use), Intent/Pact → «پیمان», Capability → «قابلیت», Policy → «سیاست», Gateway → «دروازه», Ledger → «دفتر», Consent → «رضایت», Marketplace → «بازارچه». Rationale: this is a strategy book for a mixed audience, and heavy Latin insertion in Persian prose both reads as unfinished and creates the bidi problems your own paragraph rule is designed to avoid. A glossary at the back carries the English for the technical readers.

**Digits.** Persian digits throughout body text, tables, and figures; Latin digits only inside code blocks and in technical identifiers. Mixed digit systems in one paragraph look careless, and this book will be judged partly on how finished it looks.

**Numbers with units.** Persian digits with Persian units — «۵۰ میلیون تومان» — and thousands separators consistently. Currency stated in تومان in narrative text and ریال only where a regulatory figure requires it.

**First use.** Persian term first, Latin in parentheses once, per part — not per chapter, which becomes noise in a book this size.

**Your paragraph rule** is registered and I will apply it: every paragraph opens with a Persian word, and «به واقع» prefixes any paragraph that would otherwise open with a Latin term.

**Chapter shape.** Each chapter opens with two or three lines stating what it argues and closes with a short summary. In a book of this length, a reader who reads only openings and closings must still receive the whole argument.

---

# 16. Changes to the book plan

Deltas against the Round 2 structure — the rest stands:

- **New chapter in the foundations part: «پیمان».** Introduce the pact object early, since every later part refers to it. This is the change that makes the book feel like one argument.
- **New chapter in the architecture part: «میانجی» — جریان داده و حریم خصوصی.** The §2 design. Given that data protection is the objection most likely to come from a bank or a regulator, this chapter carries real weight.
- **New chapter in the Vista part: «پمپاژ هوش».** §6.
- **Rewrite «دفتر کل توزیع‌شده»** as a verifiable-ledger chapter (§4), with DLT demoted to an evaluated option behind a decision gate. Smart contracts move from Part 3 to Part 2 in narrative terms, because they no longer wait on a blockchain.
- **Rewrite the competition chapter** to add Rubika, to correct Eitaa, and to state plainly that Snapp is already shipping AI assistants (§1.2).
- **Payment chapter** gains the licensing structure and the counterparty checklist (§8).
- **Availability chapter** becomes the two-tier integration model (§5), and moves partly into the marketplace chapter, since it is now an onboarding story as much as a resilience one.
- **The social chapter** gains Andrew Chen. The useful concepts are the **atomic network** — the smallest stable network from which the rest grows, where *density beats total size* — and **the hard side of the network**, the small minority who do most of the work and must be acquired first. Both map directly onto your plan: the atomic network is not "Irancell subscribers," it is something much smaller and denser, and the hard side is the service providers, not the users. That reframing sharpens the phase-1 launch argument considerably.
- **Mandate chapter** per §13, written now rather than deferred; team sizing and budget still deferred as you said.

---

# 17. Open questions for round 4

1. **Which is the atomic network?** Following Chen, phase 1 should not target "Irancell subscribers" but the smallest dense group for whom Vista is already complete — one city, one segment, one bundle of high-frequency services. My instinct is Irancell self-service plus Bank Sina basics for a defined subscriber segment. Your view will shape the roadmap chapter. **COMMENT**: an atomic network is an existing service + its users. for example Konkooria  and its users. do you agree?
2. **Does Irancell Labs actually control the production digital estate?** (§1.4) This determines whether Option A is worth asking for. **COMMENT**: I dont know. we can assume it.
3. **The Snapp shareholding lever may be weakening** — MTN has considered selling. Does that change how much of the plan should depend on Snapp? **COMMENT**: we should not depend on Snapp at all. we provide a good service that Snapp would BEG to use it.
4. **The broker's expression language (§2.4, technique 2)** — do you want me to specify it concretely, or keep the book at the level of the principle? I would keep the book at the principle and put the specification in an annex. **COMMENT**: correct.
5. **Dual-source models — acceptable, or do you prefer a single deep partnership?** Dual-source costs more relationship management and buys much more leverage. **COMMENT**: dual
6. **Do you want the Persian evaluation harness named as a phase-0 deliverable in the book?** I recommend yes; it is cheap, decisive, and it demonstrates rigour.
7. **The remediation fund (§12.3)** — do you want it in the book, or is that a detail for later? **COMMENT**: let it be in the book
8. **Which naming proposals survive (§14)?** «پیمان» and «میانجی» are the two that matter, because chapters get written around them. **COMMENT**: we dont need to name all of them in Persian. just user faced ones need persian names.

Once 1, 2 and 8 are settled I can start drafting chapters. I would suggest beginning with «پیمان» and the security chapter, since everything else references them.
