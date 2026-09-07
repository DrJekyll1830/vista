# Vista — Round 4 Analysis

**Input:** your COMMENTs on Round 3, above all the five voice notes at 18:33–18:56 proposing the fusion of MCP and smart contracts.

**Summary judgement first:** that proposal is the best architectural idea in the entire corpus, it is better than the model I had been building, and it collapses several of the book's hardest problems at once. Most of this round is spent formalising it, then listing honestly the four things that must be solved before it works. Section 1 is the fact-checking you asked for; the design starts at §2.

---

# 1. Fact checks

**Qwen — you were right, I was out of date.** Qwen3.8-Max launched 3 August 2026: a 2.4-trillion-parameter MoE with ~95B active, multimodal, ~1M context, and it is now the highest-ranked Chinese model for text on Arena.AI. Alibaba followed on 26 August with **Qwen3.8-Flash-Next — 125B parameters, ~6B active per token**, framed as a preview of the Qwen 4 architecture. That Flash-Next tier is almost exactly the "cheap but sufficient" class your cost thesis depends on, and it is a data point in your favour. **One caution to verify at contract time:** Alibaba's *Max* tier has historically been API-only while the smaller models carry open weights. Since open weights are your non-negotiable requirement for self-hosting, the target is the Flash/Next and open MoE lines, **not** Max. Confirm the licence per model before the partnership is scoped around it.

**Snapp — I cannot confirm one third.** The public record supports only that **MTN and Irancell together hold about 60%**, with roughly 30% attributed to the German shareholder (Iyad Elkaser), per Snapp's then-CEO in 1398. The split of that 60% between MTN and Irancell is not public. So your one-third figure is plausible and consistent, but unverifiable from outside. **Do not print a number; verify it against the cap table internally, or write "a significant minority holding."**

**Rubika — your critique appears correct.** I found no official mini-app or third-party developer platform; the only "API" surface I could locate is an unofficial third-party panel, not a Rubika developer programme. So the structural claim holds: Rubika is a bundle of native and partner services with no mechanism for onboarding a new category such as ride-hailing or short-term rental. Note this is absence of evidence rather than proof, so phrase it as an observation about their public developer offering rather than as a categorical statement. **It is a good critique and it belongs in the book**, because it is the same point your super-app thesis makes: a mosaic cannot grow beyond what its owner builds.

**Eitaa — you are right and I was too broad.** The evidence points to a wallet at pay.eitaa.com and **personal and business payment links published inside channels and groups** — that is payment for Eitaa's own messaging context, not a payment rail for third-party hosted applications. So your position stands: Eitaa monetises payments inside its own surface, and does not operate a platform payment rail for hosted apps. Correct the Round 3 note accordingly; what survives is only that **the 2% figure is a public market reference point** which will anchor commercial conversations.

---

# 2. The unified model — formalising your proposal

Your five voice notes describe a single mechanism. Stated compactly:

> **Reads are free. Writes are contracts. The AI prepares contracts; it never signs them. The user signs, at a strength proportional to what is at stake. A signed contract is executed by a processor that the AI cannot reach.**

That is four sentences, and it replaces the entire L1/L2/L3 apparatus, the capability-token model, the execution-token model, and most of the data-flow machinery I proposed in Round 3. **I am retiring my three-tier model in favour of yours.** It is simpler, it is more teachable, and it is strictly stronger, for the reason in §2.6.

## 2.1 The metaphor to build the book on

Your کارپرداز analogy is better than the operating-system metaphor and I would make it the central image of the entire book:

> **The agent is the procurement clerk. The user is the one who signs.**
>
> A clerk finds the supplier, gathers the quotes, checks the terms, fills in every field of the contract, and places it on the manager's desk complete. The clerk has no authority to commit the organisation to anything. The manager reads the finished document and signs. The clerk's competence determines how good the deal is; the manager's signature determines whether it happens at all.

Every non-technical reader understands this instantly, it conveys the security model exactly, and it makes the AI's lack of authority feel natural rather than like a limitation. The OS metaphor stays for the architecture chapter; **this one opens the book.**

## 2.2 The two intelligences

Your closing formulation is the book's thesis and should be stated as such:

> **Vista pumps two kinds of intelligence into services: artificial intelligence, and smart contracts. The first understands what the user wants. The second makes what the user wants executable, verifiable, and settleable — without the service having to build either.**

This is a much stronger claim than "we are an AI super-app," because the second half is the part competitors cannot copy quickly and the part that generates revenue by construction (§2.8).

## 2.3 The signature ladder

Your four rungs, formalised. This is the axis that replaces L1/L2/L3:

| Rung                          | Mechanism                                                                        | Evidence produced                                        | Analogy                  | Typical use                                    |
| ----------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| **0 — Read**                  | none                                                                             | server access log                                        | —                        | any read, no confirmation, ever                |
| **1 — Authenticated request** | in-app key created at login; request sent from client to the processor           | server-side authenticated record                         | ordinary signature       | order food, book a ride, low-value purchase    |
| **2 — OTP**                   | one-time code to the SIM                                                         | authenticated record + possession proof                  | signature + witness      | moderate value, unusual pattern, new recipient |
| **3 — Device key**            | private key in device secure storage, unlocked by biometric                      | non-repudiable signature bound to the canonical contract | signature + fingerprint  | transfers, higher-value commitments            |
| **4 — SIM / secure element**  | key never leaves the SIM; payload signed inside it **COMMENT**: unlocks with pin | strongest non-repudiation; operator-rooted               | signature + company seal | large transfers, security changes              |
| **5 — Out of band**           | branch, in person                                                                | outside the system                                       | notarised deed           | above the app's ceiling                        |

Four properties to state explicitly in the book:

1. **Rungs 0–2 produce records; rungs 3–4 produce non-repudiation.** This distinction drives the liability chapter — at rung 1 you can prove the request came from an authenticated session; at rung 3 you can prove the user's key signed *this exact contract*. Be precise about it rather than calling all five "signature." **COMMENT**: true
2. **The required rung is a property of the contract, combined with the value.** A contract template declares its minimum; the platform raises it by amount, by recipient novelty, by device change, by velocity.
3. **Rungs compose.** A contract may require rung 3 from one party and rung 1 from another, or two signatures at rung 4 for governance actions.
4. **Ceilings ladder with rungs.** Up to X with a device key, up to Y with the SIM, above Y not in the app at all. This is exactly how the banks already think, which makes it easy to get approved.

**This is where the SIM asset finally earns its place in the product** rather than in a vision chapter: rung 4 is a capability no competitor in Iran can offer, and it maps to real, higher transaction ceilings that users can feel.

## 2.4 The contract lifecycle

Your rental example is a two-call state machine and generalises cleanly:

```
DRAFTED        (by the agent, or by a service, or by the system)
   ↓ presented to a party
AWAITING_SIG   (party P, required rung R, deadline D)
   ↓ signature at rung ≥ R, bound to the canonical hash
PARTIALLY_SIGNED  → repeat for each required party / witness
   ↓ quorum satisfied
SIGNED
   ↓ conditions checked, funds locked if the template requires escrow
EXECUTING
   ↓ effects applied; fulfilment leg (§3.4) if there is one
SETTLED

exits: AMENDED (new version, prior signatures void) · REJECTED ·
       EXPIRED · CANCELLED · DISPUTED · REVERSED
```

Three invariants carried over from Round 3, which survive intact and matter more now:

- **A signature binds to the canonical hash of the contract terms.** Change a field, and every prior signature is void. Your rental case gets its safety from this automatically. 
- **A party signs only what it can see.** Field-level projections with a Merkle commitment let the tenant and the landlord sign the same contract without each seeing everything. This is now the *only* place field-level privacy is needed, which is a large simplification.
- **The agent drafts; it never signs.** The signing action originates at the client and travels to the processor on a path the model cannot reach.

## 2.5 The write path — where the AI is not

The single most important diagram in the book:

```
        ┌──── reads ─────────────────────────────►  MCPs  ──► services
        │
   AI Agent
        │
        └──── drafts unsigned contract ──►  Client
                                              │
                    user reviews and signs (rung 0–4)
                                              │
                                              ▼
                                    Contract Processor
                              (verifies signature, quorum,
                               conditions, replay, ceilings)
                                              │
                                              ▼
                                 Contract execution substrate
                                              │
                            ┌─────────────────┼──────────────────┐
                            ▼                 ▼                  ▼
                     token movement      events → services   audit record
```

**The AI touches nothing to the right of the client.** Not the signature, not the processor, not execution. That is the whole security model, and it is one picture.

## 2.6 Why your simplification is safe — the argument to put in the book

I want to state plainly why dropping my tiering and my data-flow machinery is not a loss of safety, because you will be asked.

**Prompt injection is largely solved by construction.** If a hostile MCP injects "grant financial access" or "transfer money to account X," the worst outcome is that the agent drafts a contract the user is then shown and refuses to sign. The model's compromise cannot produce a state change, because the model is not in the write path. Most agentic-security literature is about constraining what a compromised model can *do*; your design removes the model's ability to do anything at all.

**What genuinely remains** is data leakage on the read path — the agent passing something it learned from service A into a call to service B. Your rule handles it (§4), and the residual is marked as open work, as you asked.

So the security chapter shrinks from a taxonomy to a theorem: **the agent cannot write; therefore compromising the agent cannot cause a write.** That is a far better story for a bank CISO than any three-tier table.

## 2.7 Version pinning and admission — your Cafe Bazaar model

Your instinct is right and the mechanism divides in two, because the two halves have very different enforceability:

**Contracts — we can pin these completely.** Contract code runs on our substrate. Hash it, version it, review it, and pin it. A changed contract is a new hash requiring new review before it can be instantiated. Existing instances continue on the version they were signed against. This is exactly Ethereum practice and it is fully enforceable.

**MCPs — we can only pin the declaration, not the behaviour.** An MCP is a live remote service. Reviewing version X pins the manifest — tool names, parameter schemas, response schemas, declared data needs — and we can enforce schema conformance at runtime and detect drift. But the provider can change what happens behind the interface without changing the manifest. You already accepted this risk explicitly, and I agree it is the right risk to accept.

**But it produces one architectural rule, and it is important:**

> **Money and commitments never flow through an MCP. They flow through contract code on our substrate. The MCP reads, and it drafts. It never moves value.**

That way the part we can genuinely pin is the part that matters, and the part we can only vet is the part where the worst case is bad data rather than lost money. Your design already implies this; the book should state it as a rule.

Practical requirements for the admission process: provider signs their manifest; review is per-version; runtime enforces schema conformance and rejects non-conforming responses; behavioural drift is monitored; suspension is instant and per-version.

## 2.8 What this collapses — and why it fixes the book's biggest problem

The unification does not merely tidy the architecture. It removes most of the scope that made the Round 2 corpus read as four companies.

| Previously a separate thing | Now |
|---|---|
| Action Intent | a contract awaiting one signature |
| Pact / multi-party agreement | a contract awaiting several signatures |
| Smart contract | a contract whose conditions execute automatically |
| Capability tokens, execution tokens | gone — replaced by "the AI is not in the write path" |
| L1 / L2 / L3 | gone — replaced by read vs write, plus the signature rung |
| Shared intents, split payment, delegation | contract templates |
| Governance actions (your C1 comment) | contracts requiring k-of-n signatures at rung 4 |
| The wallet | a rial contract issued by Bank Sina |
| Gold token, stable asset | contract templates on the same substrate |
| Bill payment, rent, subscriptions | system-initiated contracts (§3.5) |
| Revenue collection | a declared fee field, split atomically at execution |
| **Bank Sina core rewrite** | **not on the critical path at all** |

That last row is the most valuable consequence in this round. **In your model, Vista does not need to change anything inside Bank Sina's core.** The bank becomes one service provider that issues a rial contract permitting debits from an account. This achieves cleanly the separation you asked for back in Round 2 — that the Vista programme and the Bank Sina programme must not be entangled — and it removes the single most dangerous sentence from the proposal.

**Recommendation:** restructure the banking part accordingly. Bank Sina appears twice, in two very different registers: **(a)** as the first and most important contract issuer — a small, fast, low-risk integration on Vista's critical path; and **(b)** as its own modernisation and resilience programme, jointly funded, valuable in its own right, and explicitly *not* a dependency of the super-app. Stating (b) as independent is what makes (a) believable.

## 2.9 Fees — an advantage worth naming

In your rental example, the rental service takes 0.5% and Vista takes 20% of that. Because the money moves through our contract, three things follow that are worth a paragraph in the revenue chapter:

1. **Fees are declared fields visible to every signer.** The user sees exactly who takes what before signing. Nobody in this market does that, and it is a genuine trust differentiator, not just compliance. **COMMENT**: write it as a "we CAN" not what "we MUST"
2. **Collection is atomic.** The split happens at execution. **We never have to audit a partner's revenue reporting or trust them to route payment through us** — which is precisely the weakness of the Cafe Bazaar model you took as the analogy.
3. **The rate card becomes a contract template property** rather than a bilateral negotiation per partner. That scales to thousands of services in a way that negotiated take-rates do not.

---

# 3. Four problems that must be solved

The model is right. These are the parts that are genuinely hard, and the book is stronger for naming them.

## 3.1 The rial bridge is the real difficulty, not the contracts

A "rial contract" issued by Bank Sina means a token representing a claim on real money. That is e-money issuance, and it is the regulated part. The mechanism is well understood — the bank holds an omnibus or escrow account; funding mints tokens 1:1; withdrawal burns them — but it requires:

- an explicit reconciliation process between chain state and the bank's ledger, run continuously, with a defined procedure for divergence;
- a defined mint authority — who may mint, under what authorisation, with what quorum;
- a redemption guarantee and the operational commitment behind it;
- audit access for the bank's own auditors and for the regulator.

**Nothing here changes the licensing conclusion from Round 3: the token is legally the bank's instrument and Vista is its interface.** The good news is that this is now the *only* place where deep bank integration is required, which is a far smaller surface than "rewrite the core." **COMMENT**: eventually we need to rewrite the core of Bank Sina.

## 3.2 Third-party contracts mean code review, not interface review

Once a gold seller can deploy a contract that debits user wallets, admission is a **code audit**, and Ethereum's accumulated knowledge that you rightly want to inherit includes its accumulated catalogue of catastrophic failures — reentrancy, access-control errors, arithmetic issues, oracle manipulation, upgrade footguns. Recommended structure:

- **A platform-audited template library covers the great majority of cases.** Most providers instantiate a vetted template — payment, subscription, escrow, rental, marketplace order — with their own parameters. Instantiating a template is cheap and safe.
- **Arbitrary contract deployment is a privileged tier**, requiring external audit, and reserved for partners with the scale to justify it.
- **Staged value limits.** A new contract carries a low aggregate ceiling that rises with time and volume, so a flaw is bounded.
- **Per-contract pause,** in addition to the platform kill switch. This is your Round-1 kill switch expressed at the right granularity.
- **Formal verification for the money-touching templates.** There are perhaps ten of them; verifying ten templates is achievable and it protects everything built on them.

This turns your Cafe Bazaar analogy into something operable: **most developers publish an app built on a reviewed framework, not raw machine code.** **COMMENT**: we should have an SDK which is some .md/.yaml files and we give it to our partners so that they can write their apps based on it with help from AI

## 3.3 The fulfilment leg — the gap in the model

A contract can move money. It cannot make Snapp send a car. So every contract involving a real-world service has an off-chain fulfilment leg, and the model as described does not say what happens when payment succeeds and fulfilment does not.

Recommended treatment, per template:
- **Optimistic release** for low-value, high-trust, high-frequency flows: pay immediately, reverse on dispute. Correct for food and rides.
- **Escrow with a fulfilment window** where the value or the risk warrants it: funds locked, released on service confirmation or on timeout, with a defined dispute path. Correct for rental, marketplace purchase, and anything with a delivery.
- **Fulfilment confirmation is an authenticated event from the service**, recorded against the contract — which is what makes the dispute resolvable and what feeds the liability position.

This is the classic oracle problem in its practical form, and it should be a named section rather than discovered during implementation.

## 3.4 System-initiated contracts need an anti-abuse rule

Your bill example is excellent product design — a new bill arrives, the user receives a notification with a pre-filled contract needing one confirmation — and it is also, at national scale, a phishing and spam surface. If any service can push a pre-filled payment contract into a user's Vista, that mechanism will be abused.

Proposed rules:
- Only a service with an **existing relationship** to the user — a prior signed contract, a subscription, a registered biller mandate — may originate a pre-filled contract addressed to them. **COMMENT**: correct. like bots that user should start them first.
- Origination is itself an **authenticated, rate-limited, audited action** attributable to the originating service.
- Anything from outside an existing relationship lands in a **low-trust area**, visually distinct, never in the main flow.
- The confirmation surface always renders **authoritative data resolved by the client**, never the originator's description — the same rule as everywhere else, and it defeats the whole class of attacks.
- Users can revoke a biller mandate in one action.

---

# 4. The security model, simplified as you instructed

Per your comments: MCPs as leaves is enough; the model may see what it needs and compute itself; the job is preventing an *unauthorised* MCP from receiving sensitive data; and where policy is not yet good, mark it as work to be done rather than over-restrict.

**Retained — these are cheap and load-bearing:**

1. **MCPs are leaves.** One orchestrator. No MCP calls back into the agent, receives session context, or addresses the user. A2A stays out of scope, marked as future work.
2. **Per-MCP data permissions, declared at admission.** Each MCP declares which data classes it needs; review approves; the runtime enforces that only approved classes may be passed to it. This is Android-shaped permissioning, not taint tracking — simple to build, simple to explain, and it is exactly your rule.
3. **The model computes in a sandbox.** Your transient-script idea is right and it is what production agent systems do. **One non-negotiable property: the sandbox has no network access.** Without that rule, the sandbox is an exfiltration channel that bypasses the MCP permission model entirely. Ephemeral, no persistence, resource-capped, results returned as data.
4. **MCP output is data, never instruction.** Unchanged from the original document.
5. **Money never flows through an MCP** (§2.7).

**Dropped:** taint propagation, sealed turns, banded disclosure, the broker expression language, the sensitivity axis, reference-passing as a boundary, and predicate-evaluation-inside-the-provider — the last because you are right that we must pump intelligence into services rather than expect them to have it. The loan example is now answered simply: the agent reads the balance, reads the loan catalogue, and computes the answer itself in the sandbox.

**Marked "work to be done", stated openly in the book:**
- read-path leakage between services under adversarial prompting;
- what the model provider retains, until inference is self-hosted;
- long-term memory accumulating a sensitive profile;
- cross-service data joins and whether they need explicit per-purpose consent.

Naming these as open work is better than pretending they are solved, and it costs nothing with a technical audience — it reads as rigour. Being over-restrictive at the start, as you say, costs product.

---

# 5. The substrate — now answerable definitively

Your question was: do we need a blockchain, or do we just need Ethereum-style smart contract programming? Round 3's answer (Raft plus a verifiable log) was correct for a ledger of our own transactions. **It is no longer sufficient, because you have added third-party contract deployment.** When outside parties deploy code that moves other users' money, you need a deterministic, sandboxed, resource-metered execution environment with well-defined semantics — which is precisely what the EVM is.

**The answer: a permissioned, EVM-compatible chain. You need the chain shape and the EVM. You do not need permissionless consensus, mining, a public network, or a native speculative asset.**

**And the evidence is unusually strong.** SWIFT built its blockchain ledger on **Hyperledger Besu**, which went live in 2026 with **17 major banks across six continents piloting 24/7 tokenised deposit payments**, running as a permissioned network on **QBFT** consensus for immediate finality without forks. Citi and DTCC use Besu for tokenised deposits and collateral. Besu was contributed to the Hyperledger Foundation by Consensys in 2019 and is the mature enterprise EVM client.

For a Persian book addressed to a bank board, **"this is the architecture SWIFT chose in 2026"** is worth more than any technical argument you or I could construct. Put it in the chapter.

**What this gives you, all of which you asked for:**
- Solidity and the entire Ethereum toolchain, audit literature, and accumulated failure knowledge — explicitly your requirement
- ERC-20 and related standards for the rial token, the gold token, and anything later
- OpenZeppelin's audited contract libraries, so the template library starts from reviewed code rather than from scratch
- deterministic sandboxed execution of third-party code with gas metering, which is the containment §3.2 needs
- **a hireable developer pool** — Solidity developers exist in Iran, which a bespoke contract engine would not have
- immediate finality under QBFT, and a governed validator set
- a clean upgrade path: the same programming model whether validators are one organisation or several

**Design constraints to state alongside it:**
- **On-chain: money, commitments, and hashes. Off-chain: personal data.** All validator-visible state is visible to every validator, so the Round-1 rule about not putting customer data on a distributed ledger applies unchanged and with more force.
- **Not everything is a transaction.** Reads, conversation, drafting, and discovery stay off-chain. Only value movement and binding commitments become chain transactions. Say this explicitly or a reader will assume every chat message hits a ledger.
- **Validator set is a governance question**, and it is where the Round-3 recommendation still applies: start with a small governed set, publish signed checkpoints externally to the bank and the regulator, and expand the validator set only if and when multiple organisations genuinely need to distrust each other.

**On bridges to public chains** — you mentioned bridging USDT. I would put this firmly out of scope and say so in one line. Bridges are the single most-exploited component in the history of the technology, and a bridge to a public chain carries sanctions and regulatory exposure that would jeopardise the licensed parts of the platform. Internal tokens on an internal substrate; no external bridge; revisit only if the legal environment changes. **COMMENT**: we prepare an infrastructure for ANY type of smart contracts

---

# 6. Models — updated

**Starting with Western models: no, not as a plan.** OpenAI, Anthropic and Google prohibit service to Iran, access is blocked, accounts are terminated when detected, and payment from Iran is impractical. A production consumer service in Iran cannot depend on any of them, and building the first version against one would create a dependency that must be torn out before launch. Use them, where you can reach them, **as a quality reference in the evaluation harness** — measure the Chinese open-weight candidates against a GPT-5-nano-class bar in Persian — but the production path is Chinese open-weight, self-hosted over time, exactly as you proposed. This is also, incidentally, the only path where a vendor will sign a contract with an Iranian entity.

**Proof of concept sizing: agreed.** Start with a medium-to-large model, prove the product works, and put tiered routing in the roadmap rather than in the first build. Optimising cost before the behaviour is right optimises the wrong thing. **Dual-source confirmed** — I would shortlist Qwen (breadth, multilingual, and the Flash-Next tier for later routing) and GLM, with the open-weight licence verified per model as noted in §1.

**One addition given §2:** the model now has less to do than in my earlier design. It reads, reasons, and drafts. It never executes. That means the quality bar is "does it draft the right contract and explain it well," not "can it be trusted with authority." That is a materially easier bar, and it strengthens your argument that mid-sized models will suffice.

---

# 7. The atomic network — agreed, with a refinement

Your formulation — an existing service plus its users, e.g. Konkooria — is close to right, and Konkooria is a better choice than anything I proposed. Chen's criteria are density and completeness rather than size, and Konkooria's users score well on both: they share schools, cities, and an exam cohort, they are densely connected to each other, they are highly engaged in a way most service user-bases are not, and they have a real payment need.

The refinement is small but changes the phase-1 plan. An atomic network is not simply "a service and its users" — it is **a set of users for whom Vista is already complete**, meaning enough of *their* everyday needs are present that they have no reason to leave. So the phase-1 target is not Konkooria alone; it is **Konkooria plus Irancell self-service plus the rial wallet**, for the Konkooria user base. A student who can study, top up their data bundle, and pay for things in one place has a complete product. A student who can only do the first has a feature.

And the piece worth stating in the book: **in Chen's terms, the hard side of Vista's network is the service providers, not the users. You own Konkooria outright, so for your first atomic network you own the hard side.** That is the strongest possible position from which to start, and it is a much better launch argument than subscriber count.

This also supports your position on Snapp. **Agreed: do not depend on Snapp at all.** With the contract substrate in place, what a service gains from Vista is not merely distribution — it is a payment rail, settlement, atomic fee handling, contract infrastructure, and pumped intelligence they would otherwise have to build. That is a proposition a service asks for. It is worth being explicit in the book that phase 1 requires no external partner whatsoever.

---

# 8. Mandate — updated

Your position is now: **Irancell must give the authority to Labs, and that is a condition of accepting.** That is cleaner than the two-option structure and I would rewrite the chapter around it:

> Option A stands, on one condition: that the authority described here is vested in Labs. If Labs is an innovation and research organisation without authority over the production estate, then the title conveys no ability to deliver what this book describes, and the mandate must name the production organisation instead. Option B remains available if Irancell prefers to keep the programme distributed, on the terms in §13 of the previous round.

Since you said the Labs scope can be assumed for now, I will write it that way — but the sentence "the authority must be vested in Labs" should appear as an explicit precondition rather than an assumption, because it converts a discovery you would otherwise make in month three into a term agreed in month zero. That is the whole purpose of the chapter.

---

# 9. Naming

Per your instruction, only user-facing things get Persian names; internal components do not need them, which removes the two you disliked — the data broker and the policy engine are internal and now largely dissolved into the model anyway.

**User-facing:**
- **ویستا** — the super-app.
- **«پیمان»** — one agreement the user signs. You noted the term is overused in the blockchain world; in a Persian consumer context that association is weak, and the word carries exactly the right meaning. I would keep it for the user-facing object and use **«قرارداد هوشمند»** in the technical text, since it is the established term and you use it naturally.
- **«پمپاژ هوش»** — the narrative term for what Vista does to services; keep it, it is vivid and it is yours.
- The wallet, the marketplace, and the signature rungs need Persian names; I will propose them with the chapter drafts rather than in the abstract, since names for user-facing things should be chosen against the surrounding copy.

**Not named:** the processor, the substrate, the permission layer, the catalogue. English or descriptive Persian in the architecture part is fine.

---

# 10. What this does to the book

The unification is a large simplification and the structure should reflect it.

**Foundations part** gains a chapter on the contract idea, introduced early, in plain language, using the کارپرداز metaphor. The two-intelligences thesis (§2.2) becomes the framing of the whole book.

**Security chapter shrinks and improves.** It becomes: reads are free, writes are contracts, the agent is not in the write path, and here is the signature ladder. One page of principle, one diagram, one table. It is now the most convincing chapter in the book rather than the most technical.

**Retired chapters:** the three-level action model, capability tokens, execution tokens, the data broker, most of the flow-control material. Their content survives as a few paragraphs.

**New chapters:** the contract substrate and why it is a permissioned EVM (with the SWIFT and Besu evidence); contract and MCP admission and review; the template library; system-initiated contracts.

**Banking part is halved and split in two** per §2.8 — Bank Sina as the rial contract issuer, which is small and on the critical path; and Bank Sina's own modernisation programme, which is independent. The gold token chapter you asked for survives and gets easier to write, because it is now a template on a substrate that already exists rather than a new system.

**Net effect on the credibility problem I raised in Round 2:** largely resolved. The corpus no longer describes four companies. It describes one platform with one primitive, plus a bank partnership that does not require rebuilding a bank.

---

# 11. Open questions for round 5

1. **Does the rial token launch in phase 1, or does phase 1 use the bank's conventional rails with contracts settling against them?** The second is much faster and defers the e-money licensing question; the first is the full vision. This is the biggest sequencing decision remaining. **COMMENT**: we do 1st but advertise the 2nd
2. **Template library scope for v1.** My proposal: payment, subscription, escrow, marketplace order, rental, and delegated spend — six templates. Which would you add or remove? **COMMENT**: I did not like the idea of a limited set of templates.
3. **Escrow by default or optimistic release by default (§3.3)?** I lean optimistic for consumer flows and escrow for anything with a delivery window, but this is a product decision with real support-cost consequences. **COMMENT**: it's about the contract itself
4. **Do you want the fulfilment-and-dispute mechanism in the book, or held for the technical annex?** I think a short main-body section, because it is the first question a bank reviewer will ask. **COMMENT**: it's about the contract too. we should bring some examples.
5. **Besu specifically, or EVM-compatible in general?** I recommend naming Besu, since the SWIFT precedent is the argument and naming it makes the argument concrete. **COMMENT**: OK, Besu
6. **Konkooria's user base — how large, and how much of it is reachable at launch?** It determines whether the atomic network argument is quantifiable in the book or only qualitative. **COMMENT**: it has 23K users now.
7. **Are you ready to start drafting chapters?** Given how much this round changed, I would start with the foundations chapter on contracts and the security chapter, since everything else now refers back to them.
