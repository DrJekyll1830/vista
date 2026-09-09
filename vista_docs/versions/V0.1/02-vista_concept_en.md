# Vista — Concept, Architecture, and Critical Analysis (English Working Draft)

**Status:** Working English rendering + analysis of `vista_concept_and_architecture.md`.
Not a proposal. Purpose: fix the shared vocabulary, expose the load-bearing ideas, and surface the decisions that must be settled before a Persian proposal can be written.

**Structure:** Part A restates the concept in English, compressed and reordered for an executive/technical reader. Part B is analysis — what is strong, what is under-specified, what is missing, and what must be decided.

---

# PART A — THE CONCEPT

## A1. One-sentence definition

> **Vista is a distributed operating layer for secure, policy-controlled access to digital services by humans and AI agents.**

Product-level phrasing: *"an operating system for digital services and AI agents."*

The word **operating system** is a metaphor and should always be used with its qualifier. A classical OS manages CPU, memory, disk, processes, and hardware. Vista manages nothing of the sort. It manages **business capabilities**: identity, consent, authorization, capability discovery, safe action execution, service-to-service communication, transactions, events, model access, and governance.

Recommended formal terms: **Service Operating Layer** or **Agent Operating Layer**.
Recommended narrative term for executives: **Operating System for Digital Services and AI Agents**.

## A2. Why the OS analogy holds

A traditional OS gives applications a shared abstraction over resources: a program works with *files*, not with disk controllers. Vista does the same for **services**: an agent works with *capabilities*, not with each provider's private API.

An agent should not need to know how Snapp's internal API is shaped, how Snappfood books an order, what core banking system Bank Sina runs, or how SnappPay settles a payment. It calls:

```
search_restaurants()
request_ride()
check_balance()
create_transfer_intent()
find_mentor()
make_payment()
```

| Operating system | Vista |
|---|---|
| Kernel | Policy / Security / Execution layer |
| Process | Agent / application session |
| System call | MCP tool / capability call |
| Driver | Connector / MCP adapter |
| File system | Accessible information and resources |
| Permission | Consent / authorization |
| Scheduler | Agent orchestration |
| IPC | MCP / service-to-service communication |
| Package manager | MCP marketplace |
| User account | Vista identity |
| Secure hardware | SIM / secure element / device key |
| Network stack | API / MCP gateway |
| Audit log | Transaction / security ledger |
| System monitor | Observability / audit / analytics |
| Kill switch | Global policy enforcement |

## A3. Why an API gateway is not enough

The original ask was an API gateway connecting services across the Irancell ecosystem. That need is real and stays. But a gateway answers *service → service*:

```
Service A → API Gateway → Service B
```

Introducing agents changes the question:

```
User → AI Agent → ??? → Multiple Services
```

The open question is no longer "how do we call the API," it is:

- What may the agent access?
- What may it do on its own?
- What requires the user's permission?
- What did the user *actually* approve?
- How is user identity preserved end to end?
- How do several services compose into one transaction?
- How is agent behavior recorded and auditable?

Vista is the answer to that second set of questions. The gateway is a component inside it, not the product.

## A4. Product idea: one login, many capabilities

Today each service means a separate app, account, session, and UX. Vista's premise is one environment where capabilities are simply *available*:

```
Vista
 ├── Irancell
 ├── Snapp
 ├── Snappfood
 ├── Snapp Doctor
 ├── Snapp Shop
 ├── SnappPay
 ├── Bank Sina
 ├── Konkooria
 └── third-party developers
```

The user does not necessarily know which service is executing behind the scenes. They speak in **goals**, not APIs: *"Book me a car for 8 a.m. tomorrow."* The agent decides which capabilities to use.

## A5. Capability marketplace

A marketplace for MCPs and capabilities — a "Cafe Bazaar for services that agents can use." A developer can register an MCP, pass security review and certification, publish, ship versions, see usage analytics, and eventually pay for placement.

Narrative note: sell it as a **marketplace of intelligent capabilities**, not a "marketplace of MCPs." MCP is the technology behind it, not the product.

## A6. An agent is more than a chatbot

A chatbot produces text. An agent inspects service state, selects tools, gathers inputs, prepares an operation, asks for confirmation when required, executes after approval, and reports the result.

```
User: "Get a Snapp to my mother's place."
  → find saved location
  → check service availability
  → create ride intent
  → determine whether confirmation is required
  → execute or request approval
```

## A7. The foundational security principle

> **The LLM is not the authority on permission.**

The model **may**: suggest, propose a decision, select a tool, propose parameters, create an intent.
The model **may not**: escalate its own privileges, lower a security level, execute sensitive operations outside the sanctioned path, forge user confirmation, or bypass policy.

This separation is what contains hallucination, prompt injection, tool misuse, and ordinary agent error.

## A8. Three-tier action model

**Level 1 — low risk.** Restaurant search, viewing data, checking balance, listing orders, adding a non-sensitive address. The agent acts directly:

```
User → Agent → MCP → Service
```

**Level 2 — sensitive.** Placing a food order, booking, purchase, any consequential change. The agent prepares the operation but does not perform the final execution:

```
User → Agent → MCP → create Action Intent
     → client fetches authoritative details
     → user sees a confirmation form
     → user confirms → direct call to the service
```

User confirmation here is not an "Are you sure?" dialog. It is an **architectural boundary**.

**Level 3 — highly sensitive.** High-value transfers, withdrawals, changing security data, changing a destination account, anything with serious financial consequence:

```
Action Intent → Risk evaluation → User confirmation
  → Step-up authentication → Cryptographic signature → Final execution
```

Authentication may use secure device capabilities and/or the SIM secure element. Biometrics should stay on-device; raw biometric data must never reach a service.

## A9. Why the confirmation form must come from the service

What the user sees must never be the LLM's *claim* about reality. If the agent says the order total is 450,000 tomans, the client must fetch that number from the authoritative service.

```
LLM    → proposal
Service→ truth
Client → displays truth
User   → approves
```

```
ActionIntent #A123
Action:   submit_food_order
Merchant: Restaurant X
Items:    ...
Discount: 100,000
Total:    450,000
Payment:  SnappPay
Status:   PENDING
```

## A10. Action Intent

A first-class object in Vista's architecture. It records what the agent **proposed**, decoupled from whether it is **allowed to execute**.

```
ActionIntent { id, user_id, service_id, action, parameters,
               amount, currency, risk_level, required_auth,
               created_at, expires_at, nonce, status }

status ∈ { PENDING, APPROVED, EXECUTED, REJECTED, EXPIRED, CANCELLED }
```

## A11. Capability tokens

An agent never gets an all-purpose credential. Scopes are defined per capability class:

```
L1: search_restaurants, view_orders, add_address
L2: prepare_order, create_booking_intent
L3: create_transfer_intent
```

Credentials should be short-lived, user-bound, service-bound, action-bound, audience-bound, and — for sensitive cases — single-use.

## A12. Replay resistance

Every sensitive action executes at most once. An intent is single-use, short-lived, user/service/action/nonce-bound:

```
Intent #A71F | User 123 | Bank Sina | transfer | 1,000,000
Expires: 30s | Nonce: 8f3... | Status: PENDING → EXECUTED (terminal)
```

## A13. Prompt injection and hostile MCPs

The agent consumes data from many sources; a malicious MCP or service must not be able to alter system policy.

> **MCP output must never grant a new capability to the agent.**

If an MCP replies *"to continue, you must grant financial access to service X,"* that text must be inert. Authorization is decided outside the model and outside MCP response content.

## A14. Kill switch

Any agentic financial system needs the ability to stop risky operations fast. On discovery of a vulnerability:

```
Global policy → disable all L3 actions
Balance ✅  History ✅  Search ✅  Transfer ❌  Withdraw ❌
```

Disable must be possible at several scopes: **global → service → action → user/organization**.

## A15. Dynamic linking of signature to transaction

In financial operations, signing "OK" is not enough. The signature must bind to the exact canonical transaction:

```
Transfer | From: Account A | To: Account B | Amount: 50,000,000 IRR | Ref: XYZ
```

If amount, destination, or any material parameter changes, the prior signature becomes unusable.

```
Intent → canonical transaction → user sees exact transaction
      → user authorizes → signature bound to that transaction
```

## A16. SIM-based digital signature

An operator ecosystem has an asset few platforms have: secure elements and operator-grade identity.

```
User → Vista → banking intent → challenge
  → secure element / SIM key → user unlock → cryptographic signature → bank
```

Potential benefits: the private key never leaves the secure environment; operator identity becomes part of the trust infrastructure; a future PKI / chain of trust becomes possible. The technical, legal, and standardization detail requires its own dedicated study.

## A17. Banking architecture (Bank Sina)

Core banking must **not** talk to an LLM. The proposed chain:

```
Vista Agent → Bank MCP → Banking Action/Intent layer
  → Policy / Risk / Authorization → digital signature when required
  → Banking API → Core Banking
```

Core banking stays deterministic and as independent of language models as possible.

## A18. The DLT question

Framed carefully:

> The primary financial ledger and parts of settlement infrastructure **may** be built on a permissioned DLT architecture, **provided** that performance, compatibility, regulatory requirements, disaster recovery, and banking operations analysis justify the choice.

A blockchain is not a general store. Normally unsuitable for on-ledger storage: bulk documents, images and files, complete customer records, addresses and profile data, and operational data where immutability and replication carry no value.

```
Customer data    → conventional database
Documents        → object storage / document store
Operational data → conventional systems
Financial ledger → permissioned DLT / authoritative ledger layer
```

Where a document must be provably tied to a transaction, store a **hash or reference**, not the data.

**Why DLT could be attractive:** immutable financial event records, auditability, multi-party validation, less dependence on a single point of failure, programmable assets, smart contracts. But *"blockchain is more secure"* is not an argument. The case must show what a DLT solves better than a conventional database with proper replication and controls.

**Nodes:** consensus nodes should represent **trust domains and infrastructure centers**, not necessarily branches — HQ nodes, DR nodes, a regional/independent node, a security/governance node. Bank Sina's small branch count makes branch nodes more feasible than at a large bank, so some branches can be evaluated if operationally justified — but a branch can simply be a service consumer.

**Routing:** the nearest node is not necessarily the right node. Account ownership, transaction domain, shard, availability, consistency, load, and DR policy usually outrank geography. Proximity is one optimization parameter, not the routing rule.

**Hybrid target architecture:**

```
                 Banking Platform
        ┌──────────────┼──────────────┐
   Core Banking    Payment Rails   DLT Layer
        │                             ├── tokenized assets
        │                             ├── shared ledger
        │                             └── smart contracts
        └──────────────┬──────────────┘
                  Unified APIs
```

**Technology choice:** Hyperledger Fabric (3.x with SmartBFT) is a serious shortlist candidate but must not be assumed. A POC must compare throughput, transaction finality, failure handling, Byzantine fault tolerance, operational complexity, backup/recovery, observability, governance, core-banking integration, smart-contract model, and extensibility — benchmarked in a bank-like environment. **COMMENT**: we should have many types of user, each with a level of access. agents can help any user of any type, even administrators governing the network and protocol policies can use AI agents to create intent and then sign the intent. I think it's good that each type of user has its own client and its own surface of API/capabilities.

## A19. Programmable finance (long-term horizon)

With programmable infrastructure, assets can be represented digitally and made available to smart contracts:

```
Tokenized gold → valuation oracle → collateral → smart contract → loan
```

Example at 70% LTV: gold value $100,000 → maximum loan $70,000.

Liquidation, margin calls, oracle failure, price manipulation, custody, and redemption must all be fully specified. A DAI-like stable-value asset can be *studied*, but only after answering: what backs it, how is it priced, how is redemption performed, which institution is accountable, what prevents under-collateralization, how does liquidation work, when is collateral sold, how is the oracle protected, what happens in a market crash, how is governance run, what are the AML/KYC requirements, what is the legal and regulatory status, and how does it interact with foreign currencies.

**Liquidation** is the central problem: as collateral value falls with debt constant, LTV rises. The contract must be designed from day one for `normal → warning/margin call → liquidation threshold → liquidation → settlement`, with a fallback path for oracle outage and price manipulation.

All of this is **long-term vision, not banking MVP**.
**COMMENT**: we need a book instead of proposal. each chapter is a .md file. we need some chapters for introducing concepts and some chapters for vision. and I want a dedicated chapter for this DAI like gold backed coin idea. and I want a script to convert the book folder into a single PDF file. P.S: dont forget to start all paragraphs with a persian word. if you want to start with English word, you should put «به واقع» at the start of it.
## A20. Notification — the operator's natural advantage

The operator ecosystem owns broad user-reach channels:

```
Transaction event → Notification service → SMS | Push | Webhook | In-app
```

Useful for order placement, transfers, status changes, transaction confirmation, security alerts, approval requests, smart-contract events. **Caveat:** a notification channel is never an authorization authority.

## A21. Roadmap — three phases

**Phase 1 — AI-native service platform.** Gateway, MCP, identity, developer platform, policy, security, agent, and a handful of key Irancell/ecosystem services.
*Goal: turn existing services into capabilities that agents can use and that the platform can control.*

**Phase 2 — AI-native banking.** Bank Sina MCP, banking intent, risk engine, transaction confirmation, step-up authentication, digital signature, core banking integration.
*Goal: safe banking through an agent, without granting the LLM unlimited authority.*

**Phase 3 — Programmable financial infrastructure.** Permissioned DLT, ledger modernization, tokenized assets, smart contracts, programmable settlement, third-party financial applications, and — if justified — a digital/stable-value asset.
*Goal: banking infrastructure that also supports programmable financial services built by others.*

**Why the order matters:** starting at blockchain + smart contracts + a global asset makes scope enormous and risk unmanageable. In this sequence each phase builds the substrate of the next, so the project produces value early while keeping its long-term vision:

```
API/MCP → Agent → Secure transactions → Digital identity/signature → Programmable finance
```

## A22. The role of WSO2

WSO2 is infrastructure, not the product.

```
VISTA PRODUCT: agent, MCP manager, marketplace, identity/consent UX,
               action/intent, risk engine, developer ecosystem, billing
        ↓
WSO2 / GATEWAY LAYER: API gateway, MCP gateway, authN/authZ, policies,
               traffic management, analytics/governance
        ↓
Services / APIs / Core systems
```

If WSO2 later proves the wrong choice, the gateway layer must be replaceable with minimal change to the Vista product. **Architectural vendor dependency must be controlled.**

## A23. "MCP Browser" or "Service Operating Layer"?

*MCP Browser* is a great entry-point metaphor — concrete and imaginable. But a browser is only the **client**. The full system is client + agent + identity + consent + marketplace + MCP gateway + API gateway + policy engine + transaction layer + financial infrastructure.

Suggested framing: the product is the **Vista Agent Platform** / **Vista Service Operating Layer**, and "MCP Browser" is one of its user experiences.

## A24. The ten architectural principles

1. **The agent has no absolute authority.** The LLM proposes; policy and authorization decide.
2. **Sensitive operations are intent-driven.** The agent creates an intent instead of executing.
3. **The user approves exactly what will execute.** Transaction detail comes from the authoritative service.
4. **One identity, separate permissions.** Single sign-on is not single privilege.
5. **Privilege never escalates automatically.** MCP output cannot mint permission.
6. **Sensitive operations are short-lived and single-use.** Replay must be impossible.
7. **The kill switch is built in.** Fast stop for sensitive operations.
8. **Data and ledger are separated.** Not all data belongs in immutable distributed storage.
9. **Core banking stays deterministic.** AI does not replace deterministic banking logic.
10. **Vendor independence is preserved.** WSO2 is a tool, not Vista's identity.

## A25. Risk register (as stated in the source)

- **Agent security:** prompt injection, tool abuse, privilege escalation, credential theft, replay, confused deputy, data exfiltration.
- **Financial:** wrong amount, wrong recipient, duplicate transaction, race conditions, double spending, oracle manipulation, liquidation failure.
- **Identity:** session theft, device abuse, SIM swap, credential compromise, account recovery.
- **Availability:** failure of agent, MCP, gateway, AI provider, bank link; disaster recovery.
- **Governance:** malicious MCPs, counterfeit MCPs, unknown owners, MCP behavior changing after approval, version fragmentation.

## A26. Model strategy

Long term, Vista uses several models. **The model is a replaceable dependency, never part of business logic.**

```
Vista Agent → Model Gateway → { Qwen | local model | external model }
```

This allows open-weight models on domestic infrastructure, external models when warranted, failover, cost control, and reduced provider lock-in. **GPU procurement and model selection must not become a precondition for starting Phase 1.**

## A27. Two end-to-end walkthroughs

**Consumer:** *"Book a car for 8 a.m. tomorrow to my mother's place."*
1. Agent interprets the request. 2. MCP manager discovers an available transport capability. 3. Agent uses a low-risk capability to retrieve the saved address. 4. Agent builds a Ride Intent. 5. Policy engine evaluates risk and decides whether confirmation is required. 6. If required, the client fetches final detail from the authoritative service. 7. After approval, the real service API is called. 8. The result returns through the agent.

**Banking:** *"Transfer 50 million tomans to Ali."*

```
User → Agent → find recipient → create Transfer Intent → Risk Engine → L3
 → authoritative transaction details → user sees exact details
 → step-up authentication → digital signature → Banking API
 → Core Banking → ledger/settlement → notification
```

At no point does the LLM execute a money transfer with full authority.

## A28. Scope tiering for the proposal

| Tier | Contents |
|---|---|
| **Core** — without these the project is meaningless | Identity, MCP/API gateway, agent, consent, action intent, policy, security, several real services |
| **Expansion** — multiplies product value | Marketplace, developer ecosystem, banking, digital signature, risk engine, monetization |
| **Long-term vision** — sets direction | Permissioned DLT, tokenized assets, smart contracts, programmable finance, stable-value asset concepts |

This separation lets the proposal be **bold and executable at the same time**.

## A29. Recommended executive narrative

Start from the metaphor, not from MCP and blockchain:

> Today, every digital service requires the user to enter a separate system or app. In the new generation of human–AI interaction, that model can be inverted: instead of visiting many applications, the user talks to a single agent, and the agent — respecting access levels and required approvals — uses the capabilities of many services.
>
> Such a model needs a shared layer that manages identity, permission, security, service connectivity, service discovery, transactions, and agent interaction. Vista can be that layer for the Irancell ecosystem.
>
> In its early steps it is an API/MCP and agent platform; in the long-term vision it can become the operating system for digital services and agents.

---

# PART B — ANALYSIS

## B1. What is genuinely strong

**1. The security thesis is the differentiator, not the agent.** Anyone can wire an LLM to tools. The defensible content here is the chain: *LLM is not the authority → intent object → authoritative confirmation → dynamic linking → single-use, short-lived, audience-bound credentials → kill switch*. This is a coherent, correct model that maps closely to how payment authorization (SCA/dynamic linking) and capability security are done properly. **This should be the spine of the proposal, not a security appendix.**

**2. "Authoritative confirmation" is the single best idea in the document.** The rule that the confirmation UI renders data fetched from the service, not text produced by the model, eliminates an entire class of attacks and is easy to explain to a non-technical executive in one sentence. It is also cheap to implement and demonstrable in a demo.

**3. The phase ordering is right and defensible.** Each phase produces standalone value and the substrate for the next. It resists the classic failure of these proposals (start with blockchain, deliver nothing).

**4. Scope tiering (Core / Expansion / Vision) is a mature move.** It preempts the "this is too big" objection.

**5. The operator assets are real and hard to copy.** SIM secure element, operator identity, and mass notification channels are things a startup cannot replicate. These are the strongest strategic arguments and are currently under-exploited in the narrative.

**6. Vendor independence is called out early.** Good — WSO2 lock-in is the most likely long-term architectural regret.

## B2. Structural weaknesses in the current document

**1. It is an architecture document wearing a strategy document's clothes.** It answers "how would this be built safely" in depth, and "why would anyone use it, and who pays" barely at all. A proposal needs the second question answered first.

**2. The biggest risk in the whole plan is never named: supply-side participation.** Vista is a two-sided platform. It is worth nothing without Snapp, Snappfood, SnappPay, Bank Sina, and Konkooria exposing capabilities. The document treats their APIs as available inputs. In reality each of them:
- owns its own customer relationship and will resist becoming an invisible backend;
- monetizes its own app surface (ads, placement, cross-sell) that Vista's agent bypasses;
- must invest engineering effort to build and maintain an MCP;
- carries the liability if an agent-driven order goes wrong.

**There is no answer in the document to "what's in it for Snapp?"** This is the question that kills platform proposals. It needs a section: incremental transaction volume, zero-CAC demand channel, an agent-native distribution surface before competitors, revenue share, and — the honest lever — the fact that the same corporate group owns much of the ecosystem, which turns a market problem into a governance problem. That is a real advantage and should be stated.

**3. No business model.** Not a single sentence about where revenue comes from. Candidates the proposal must choose among: take-rate on transactions routed through Vista, marketplace placement/rev-share with developers, platform fee to service providers, B2B licensing of the layer to the bank and other institutions, data/analytics products (regulatory risk), and internal-value framing (cost avoidance, retention, ARPU). Pick two and defend them.

**4. No sizing, cost, timeline, or team.** A proposal needs at least: Phase 1 duration, headcount by role, infrastructure cost order-of-magnitude, and 3–5 success metrics per phase. Right now everything is qualitative.

**5. No competitive or "why now / why us" framing.** Missing: what happens if Irancell does nothing (Google/Apple/OpenAI-style assistants, or a domestic super-app, occupy the layer), why the operator is the natural owner of this layer, and what the window is.

**6. Regulatory reality is nearly absent.** For Iranian banking and telecom this is not a footnote — it may be the gating constraint. The proposal must address: central bank rules on agent-initiated transactions and on who bears liability for an erroneous one, AML/KYC applied to agent-initiated flows, e-signature legal validity (does a SIM-based signature have legal standing, and under what framework?), data-protection and cross-border data constraints, and whether a permissioned DLT ledger is acceptable as a book of record. **Recommendation: add an explicit "Regulatory and legal path" section and name the required approvals per phase.**

**7. LLM sourcing is treated as an implementation detail.** Model access under sanctions, Persian-language quality, latency, and per-interaction cost are strategic constraints, not deferred choices. The "model gateway" abstraction is right, but the proposal should state the intended Phase 1 default (a local open-weight model with a specified size class) and its measured quality bar for tool-calling in Persian, because that quality determines whether the product works at all.

## B3. Technical gaps and unanswered questions

**1. Liability and dispute resolution.** An agent orders the wrong meal, transfers to the wrong Ali, or double-books a ride. Who is responsible — user, Vista, the service, the model provider? What does the audit trail have to prove, and to whom? *This is a product requirement, not a legal afterthought:* it dictates what the ledger stores, how long, and in what form. Currently unaddressed.

**2. Identity model detail.** "One identity, separate permissions" is stated but not designed. Unresolved: how a Vista identity maps to each service's existing account (link an existing Snapp account vs. provision a new one), what happens when the user already has an account with the service, how account linking is revoked, how the bank's KYC identity reconciles with the operator's MSISDN identity, and how a shared/family SIM or a changed number is handled. **SIM swap is listed as a risk but no mitigation is given** — for a system that leans on operator identity for signing, that is a critical gap.

**3. Consent lifecycle.** Consent is named as a layer but never specified: granularity (per service, per capability, per amount cap, per time window), duration and renewal, revocation UX, standing consent for recurring actions ("always order my usual"), and how consent is presented so it is meaningful rather than a clickthrough. This is likely a regulatory requirement as well as a UX one.

**4. Capability semantics across providers.** The vision assumes the agent can *choose* among capabilities ("find transport"). That requires a shared ontology — a common `request_ride` contract that Snapp and any competitor implement. The document shows a marketplace of MCPs but no standardization layer. Without it, the agent is hard-wired per provider and the marketplace is a directory, not a market. **Decide: is Vista defining capability standards, or just hosting adapters?** These are very different products with very different effort. **COMMENT**: we should define standards but if a big player has its own standard, we accept it.

**5. Multi-service transactions.** "How do several services compose into one transaction?" is asked in the source (A3) and never answered. There is no design for cross-service consistency: partial failure, compensation/saga semantics, or a distributed intent spanning two providers (book a ride *and* pay with SnappPay). Given that composition is the core value proposition, this is the most important missing piece of architecture.

**6. The risk engine is a black box.** L1/L2/L3 tiering is well described, but who classifies an action into a level, and can it change dynamically? Is the level a static property of the capability declared by the provider, or computed per-invocation from amount, recency, device, behavior? What model or rules drive it? Who audits misclassification? Also: **can a provider self-declare its action as L1?** If yes, that is a privilege-escalation path through the marketplace. **COMMENT**: I think the service provider (e.g. snapp) should tell us its capabilities and their layer. if >L1, then not in MCP at all but intent creation is a L1. and  >=L2 operations need a token to be executed which the AI agent does not have at all.

**7. Non-determinism at the boundary.** The architecture protects against the LLM *exceeding* authority, but not against the LLM being *wrong within* authority — an L1 action is unconfirmed by design, and a bad L1 action (adding a wrong address, leaking data via a search query into a hostile MCP) still causes harm. Prompt-injection defense is stated as a principle ("MCP output cannot grant capability") but no mechanism is described: is MCP output treated as untrusted data, is there content isolation, output filtering, provenance tagging? Needs at least a mechanism sketch.

**8. Observability and audit are listed but not designed.** For a system whose central claim is auditability, the proposal should specify what a Vista audit record contains (prompt? tool calls? model version? intent lineage? user-visible confirmation snapshot?), retention, access control, and how a dispute is reconstructed from it. The confirmation snapshot in particular — *what the user actually saw* — must be stored, or the dynamic-linking guarantee is not provable after the fact.

**9. DLT justification is still an open question, honestly flagged but unanswered.** The document repeatedly says "must be justified" without proposing the test. **Recommendation for the proposal:** state a concrete decision gate — a POC that must demonstrate X TPS at Y finality with Z recovery characteristics against a conventional replicated ledger baseline, with a named decision date. That converts a vague ambition into a managed risk and protects credibility.

**10. Availability of the agent path.** If the model provider or MCP gateway is down, what is the degraded mode? Does the user fall back to conventional apps? An operator-branded assistant that fails during peak has reputational cost. Needs an explicit SLO story and a graceful-degradation design. **COMMENT**: propose

## B4. Framing tensions to resolve before writing the proposal

**1. "Operating system" — asset or liability?** It is an excellent metaphor for a vision slide and a dangerous one in a formal scope document (it invites "so you're rebuilding Android?"). Recommendation: use it exactly once, early, with its qualifier, and then commit to *Service Operating Layer* / *Agent Platform* for the rest of the document. **COMMENT**: OK

**2. Consumer product vs. platform infrastructure.** The document oscillates. "MCP Browser" and the one-login UX describe a consumer super-app; the gateway/policy/marketplace content describes B2B infrastructure. They have different buyers, budgets, KPIs, and org owners. **The proposal must lead with one.** Recommendation: lead with the platform (that is what the org can actually deliver and what the security thesis supports), and present the consumer agent as the flagship first-party client that proves the platform.

**3. Banking depth vs. ecosystem breadth.** Phase 1 says "several key services"; Phase 2 says banking. But Bank Sina is likely the most motivated stakeholder and the most credible funder, while consumer services deliver the visible demo. Consider naming a single Phase-1 "hero" service plus the bank's low-risk (L1) capabilities in the same phase, so both audiences see themselves in phase one.

**4. Two audiences, one document.** The source alternates between explaining what an abstraction is and debating BFT consensus. The Persian proposal should split cleanly: an executive narrative (~20%), then an architecture and security section, then annexes for DLT, programmable finance, and the risk register. **Programmable finance and the gold-token/DAI material should be a clearly-labeled annex** — in the main body it will read as unserious and will draw all the attention away from the real proposal.

**5. The metaphor of "agent decides which service to use" has a political cost.** Telling Snapp that Vista's agent will choose between them and a competitor is exactly the thing that makes providers refuse to integrate. Recommendation: in early phases, frame provider selection as user-controlled/pre-linked, not agent-arbitrated.

## B5. What I recommend the Persian proposal contains

Proposed skeleton, in the order an Iranian executive audience will read it:

1. **The shift** — from apps to agents; a one-paragraph narrative (A29), no jargon.
2. **The opportunity and the window** — why the operator ecosystem is the natural owner of this layer, what happens if it is not built.
3. **What Vista is** — one definition, the OS metaphor once, the one-login-many-capabilities picture, one end-to-end user story (the ride example).
4. **The core innovation** — the trust model: the LLM is not the authority; intent; authoritative confirmation; the L1/L2/L3 tiering. This is the section that should convince a skeptical CISO and impress a CEO.
5. **Architecture** — the layered diagram, the role of the gateway/WSO2, vendor independence.
6. **The ecosystem** — the capability marketplace, what a provider gains, what a developer gains, the governance/certification model.
7. **Banking with Bank Sina** — intent → risk → step-up → signature → core banking, and the SIM signature opportunity.
8. **Roadmap** — three phases, with deliverables, duration, dependencies, and success metrics per phase.
9. **Scope commitment** — Core / Expansion / Vision table (A28).
10. **Risks and mitigations** — including the ones added in B2/B3, honestly stated.
11. **Regulatory and legal path** — required approvals per phase.
12. **Resources and business model** — team, cost, revenue.
13. **Annexes** — DLT evaluation and decision gate; programmable finance; the full security principle set; the risk register.

## B6. Decisions needed from you before drafting

These change the shape of the Persian document, so they should be settled first:

1. **Audience.** Irancell/MTN executive board? Bank Sina board? A joint steering committee? An external partner? The center of gravity moves depending on the answer.
2. **The ask.** Is this proposal requesting budget and headcount, requesting approval-in-principle, or positioning an already-approved project? What is the single decision you want at the end of the document?
3. **Phase 1 boundary.** Which specific services are committed for Phase 1, and is Bank Sina in Phase 1 (read-only capabilities) or Phase 2 only?
4. **Product vs. platform lead** (B4.2).
5. **Length and register.** A 6–8 page executive proposal, or a 25–40 page full proposal with annexes?
6. **How much DLT to include.** My recommendation is a short main-body paragraph plus an annex with a decision gate; if the audience is specifically interested in blockchain, that changes.
7. **Are cost/timeline/team numbers available**, or should the proposal present phases without figures?
8. **Terminology in Persian.** Which terms stay in English (Agent, MCP, Intent, Gateway, Policy) and which get Persian equivalents? Consistency matters more than purity; recommend keeping the technical nouns in Latin script and translating the connective narrative.
