# Vista V0.5 — Round 2 Analysis: AppFather (اپ‌فادر)

**Input:** [01-transcription.md](01-transcription.md) and five corrections from امید on [02-round1-analysis-en.md](02-round1-analysis-en.md), received 2026-09-13.
**Against:** the same material as round 1 — the Vista book as left by V0.4, the SDK skill, the live product, and the workshop repository.
**Status:** analysis and recommendations, not an approved specification. Nothing outside this folder is changed. This round supersedes round 1 where the two disagree; section 1 lists exactly where that is. Round-1 sections not listed there still stand.

---

## 1. What the corrections change

| # | Correction | Effect on round 1 |
|---|---|---|
| C1 | The name is **AppFather**, after BotFather; «فادر» in the transcript is the speech-to-text fragment of it | Rename throughout. Round-1 open point 9 (the name) is closed. Persian rendering proposed: «اپ‌فادر». |
| C2 | AppFather is **separate from the developer console**. The console is where companies integrate apps that already run **on their own servers**; AppFather builds and hosts apps **on Vista's servers** | Round 1's framing of AppFather as "the developer console for non-developers" and its "Mode B — adapter for an existing service" recommendation are withdrawn. The transcript's "give me your existing code" means importing a codebase to continue it on Vista's hosting, not wrapping a remote service. Section 6 below redraws the boundary. |
| C3 | Vista has a colleague who runs **Kubernetes as a service**; Hamravesh is not used | Round 1's hosting section, which leaned on the workshop's Hamravesh history, is replaced by section 5. The cluster exists; what Vista still owns is the tenancy model on top of it. |
| C4 | Alongside the Chinese medium models, Vista **supports good, more expensive models**; users should switch to those for AppFather | Round 1's headline gate ("can the medium partner models drive the protocol?") is reframed. The gate is now cost and billing on the good tier, not capability. The book's model-layer chapter does not yet describe this tier; section 4. |
| C5 | **The assistant is the coding agent.** It uses AppFather's MCP so that code runs and is tested on Vista's servers while the user drives it from their phone | Round 1's central verdict ("one model setting, two runtimes; the assistant cannot be the builder") is withdrawn as a design decision. It stands only as a list of properties the assistant must now acquire; section 2. |

The transcript-reading table of round 1 (ویستا for «۲۰ تا», پرامپت for «پت», an unidentified cheap tier for «ال ام ۵.۳ فلش») still applies.

---

## Executive judgment (revised)

**AppFather is the workshop with the terminal replaced by the Vista assistant and the seat server replaced by AppFather's backend.** Once C5 is taken as the design, the mapping is exact:

| Workshop today | AppFather |
|---|---|
| Claude Code in a terminal, on a seat server | The Vista assistant, in the AppFather chat, on a good-tier model |
| The seat's folder, port and subdomain | A per-user project workspace and address on Vista's cluster, reached through AppFather's MCP tools |
| codo's eleven command files | AppFather's MCP prompts, first-party, user-invoked |
| `docs/versions/<v>/NN-questions.md`, answered in Obsidian | Questions in the chat, answers and drafts stored by AppFather, read in its mini-app |
| `/clear`, `/model`, `/effort` at each phase boundary | A fresh assistant session per phase, with the tier and effort setting on AppFather |
| `./run.sh` and "walk every scenario against the live address" | AppFather tools that build, migrate, start and probe the app on its address |
| "Print the password in full in the chat" | The same, in the AppFather chat |
| The mentor in the room | Nobody — which is the product bet |

This is a good product and a coherent one, and it is smaller than round 1 made it: there is no separate builder runtime to design. What the decision does instead is move requirements onto the assistant, the gateway, the model layer and the billing model, none of which were written for a session that lasts hours, calls tools hundreds of times, and spends real money on inference. The findings that matter now:

1. **The assistant needs a durable, resumable, background-capable loop.** The live product's assistant is a streaming tool loop meant to bring a contract inside a conversation. The workshop's `/build` runs unattended for hours, commits per item, survives usage-limit pauses with «ادامه بده», and never asks a technical question. The assistant already runs server-side, so the phone going to sleep is not the problem; the loop's lifetime, its state, and its context hygiene are. The workshop's hard-won rules — state in files, a handoff document, a clean session per phase, no sub-agents — are the specification.
2. **The session must be scoped.** A coding session reads untrusted text (an imported repository, package documentation, error output). Today the assistant holds every tool of every app the user has connected. An AppFather session must see only AppFather's tools, or the book's prompt-injection argument stops protecting the user's other apps.
3. **The boundary is unchanged and easy to draw.** Files, commands, tests and the stage address inside the user's own workspace are light writes by the SDK's four questions. Deploying to a public address, registering the app, submitting for review, deleting, and anything with a price are contracts. No new primitive.
4. **The good-tier model is new to the book, and so is charging users for inference.** The model-layer chapter describes two Chinese open-weight partners and bring-your-own-key, and nothing else. The revenue chapter has no line for users paying Vista for model usage. AppFather makes both necessary, and the second is a product decision with its own regulatory and UX weight.
5. **Hosting is now a tenancy design, not a platform build.** With the cluster provided, Vista owns per-app isolation, egress policy, secrets, quotas, the stage-to-production promotion, and abuse response. Those are still real work and still a liability.
6. **The console and AppFather are two doors to one registry.** The clean separation is by hosting: your servers through the console, our servers through AppFather. What they share — level-2 identity, the registry API, the unreviewed-and-unlisted status, the review queue — should be built once.

**Recommendation in one line:** accept AppFather as a first-party app whose MCP is a remote workspace for the assistant; specify the assistant's long-session mode and tool scoping as the first engineering work; add the good tier and user-paid inference to the book; keep the cluster's tenancy model and the registry API shared with the console; place an internal alpha in phase 2 with the «داشت» teams and general availability in phase 3.

---

## 2. What C5 requires from the assistant

The transcript's phrase is that the assistant uses AppFather's MCP "so that code runs and is tested on our servers while the user is on their phone". Read literally against the workshop's constitution and the live product, this is what must exist.

**A long-session mode.** The workshop's day is roughly twelve hours of assistant time per project; `/build` alone can run for hours. The assistant loop must run without a client attached, checkpoint after every tool call, and resume after a model-provider pause or a limit. The workshop's rule that the *status file* on the server — not the conversation — is what any later session resumes from is the right design and is cheap: AppFather's workspace holds `docs/status.md`, the checklist and the handoff, and a resumed session reads them first.

**One session per phase, on purpose.** The workshop discovered that a full conversation is dead weight at the next phase and that a clean session with the plan on disk beats a long one with the plan in context. AppFather should reproduce this: each protocol step is a fresh assistant session that begins by reading the workspace, and the phase boundary is where the tier and effort setting is applied. This is also where the transcript's upgrade nudge belongs: "the next step is the build; you are on the default tier; I suggest the stronger one, here is the price".

**No sub-agents.** Two workshop versions record the same lesson: a build that fans out into sub-agents burned a weekly limit in two days and left projects unfinished; the shipped `/build` is one agent, item by item, commit per item. AppFather inherits that constraint, and it is stronger here because the user is paying per token.

**Tool scoping at the gateway.** The book's security model assumes the assistant may be fooled and limits the damage to what a fooled assistant can do: light writes and contract proposals. In a coding session the assistant reads an imported repository, package documentation and error output, all of which can carry instructions. If the session also holds the user's calendar, gold-trading and telecom tools, the blast radius of one injected line is every light-write tool of every connected app. The gateway must let an app context restrict the tool set to that app, and AppFather sessions must run in that mode. This is a small change with a large effect, and it should be stated as a rule: *an assistant session inside an app sees that app's tools and nothing else unless the user adds one.*

**The compute sandbox rule does not apply, and that must be said.** The data-flow chapter says the assistant's own calculation environment has no network. AppFather's workspace needs network — package registries, the stage API, the app's own address — and it is AppFather's backend, not the assistant's sandbox. The chapter should distinguish the two so the rule is not weakened by accident.

**Output stays data.** Everything AppFather's tools return — file contents, test output, logs, a URL — is data the assistant reads, exactly as the leaf rule requires. The one exception, as in round 1, is the protocol itself: the workshop's command files are instructions to the assistant, and the book forbids apps from instructing it. The resolution stands: AppFather is **first-party**, its prompts ship and are versioned with the assistant, and they are exposed as MCP prompts the *user* invokes, so "the user gave the instruction" remains literally true.

## 3. The boundary, revised

| AppFather tool or step | Path | Why |
|---|---|---|
| Read, write, move files in the user's workspace | Light write | Private, git-versioned, reversible by the user; the guidance's own "editing an unpublished draft" |
| Run a command, run tests, start the app on its stage address | Light write | Same workspace; a stage address is visible only to the user and to whom they share it; idempotent restarts, as `run.sh` is today |
| Save answers, defaults, drafts, comments | Light write | As in round 1 |
| Change tier or effort | Light write | No money moves on the setting; the price shows on the next session or contract (section 4) |
| Approve a document | Contract, rung 1, no money | The paper trail for "you built what I did not approve"; hashes the approved text |
| Import a repository | Light write, preceded by a licensing question | Untrusted content; the session is scoped (section 2); the user must own or be licensed to the code |
| **Publish to a production address** | **Contract** | Visible to others, not undoable for them; the SDK's *never* list |
| **Register the app in Vista's registry under the user** | **Contract**, executed by AppFather with a platform-granted capability | Creates an identity and a public key; today registration is "catalog by Vista" or "add by URL"; this is the third path, shared with the console (section 6) |
| Submit for review | Contract, rung 1 | Public consequence |
| Hosting fee, if separate from inference | Contract, `wallet.pay`, settlement per period | Money |
| Delete the app | Contract | Irreversible |

Compared with round 1, the "start a build" contract disappears: the build is the assistant working, paid for as inference (section 4). The contracts that remain are at the edges — publish, register, review, host, delete — which is where the book wants them.

## 4. Model tiers, inference billing and price

**What C4 adds to the book.** The model-layer chapter today: two Chinese open-weight partners, medium capability, service first then internal hosting, bring-your-own-key. C4 says Vista also offers good, more expensive models and that AppFather is where users switch to them. Three consequences the chapter must absorb:

- The good tier's sourcing and availability need their own paragraph: which provider, under what contract, from where, with the same no-retention clause, and whether it can ever be hosted internally. The chapter's argument that "a weaker model lowers conversation quality, not security" still holds — a stronger model in the same architecture cannot sign either — so the tier is a quality-and-cost choice, not a security one.
- Multi-tier routing, scheduled "later", arrives now in its simplest form: the user picks the tier per app or per session. The workshop's split — strong model for planning, cheaper one for building — is a ready-made default.
- Persian quality on the good tier still needs the day-one benchmark, but the risk is lower and the benchmark should now measure *cost per completed protocol step* as much as correctness.

**Users paying for inference is new.** Nowhere in the book does a user pay Vista for model usage; the assistant is simply there, and the one user-facing subscription removes sponsored presence. AppFather makes per-user metered inference a product surface: a balance or a per-session estimate, a visible running cost, a cap the user sets, and a stop when it is reached. Design questions the transcript does not settle:

- **Metered or bundled.** Metered matches "the user pays for the tier" and is honest about a build that runs long; bundled ("one build on the good tier, up to N tokens, for a fixed price") is what a phone user can understand and what the 1M-toman sentence sounds like. A bundle with a visible remaining balance and a top-up contract is the likely answer, and it is exactly a wallet operation the book already has.
- **Where the cap lives.** Outside the model, in deterministic code, as the delegation chapter insists for anything the model could talk its way past.
- **Bring-your-own-key.** With the user's own key, AppFather charges only hosting. This should be the first thing that works, because it makes AppFather usable before Vista's own good-tier pricing is settled.

**The numbers.** The 20M-toman workshop fee is new information; the workshop repository holds no fee. The 1M-toman app figure is the price a user would accept for a build, not a measured cost. The workshop's only cost data are indirect: ten projects on one Max-20x subscription reached its limit; a sub-agent build burned the same limit in two days. Price after measuring: run three past workshop projects through the protocol on the good tier through an OpenAI-compatible endpoint, count tokens per step, and see whether a typical build lands under the price with margin. This replaces round 1's capability spike.

## 5. Hosting on the cluster

The cluster is provided (C3); the workshop's Hamravesh history is no longer relevant and its "no containers" rule was a workshop simplification, not a Vista position. What remains Vista's to design:

- **Tenancy.** One namespace or equivalent per AppFather app, with the app's Vista identity and key mounted only there. An AppFather app receives platform assertions about *its* users; a fault in one app must not read another's data.
- **Egress.** Package registries and the stage API during build; the production API and whatever the app legitimately needs afterwards; nothing else by default. The cluster's location decides whether domestic services are reachable, which the workshop found out the hard way from a server abroad.
- **Secrets.** The app's private key, database credentials and any third-party keys the user brings, in a store the assistant never sees — the same rule the data-flow chapter gives for tokens.
- **Quotas and idling.** CPU, memory, storage and a sleep policy for idle apps, or a thousand hobby apps cost what a hundred real ones do.
- **Promotion.** Stage and production never connect (SDK). An AppFather app is born on stage; the publish contract moves a tested build to production with a new manifest `environment`.
- **Imported code.** The transcript allows starting from an existing repository. AppFather then owns a codebase it did not generate: a language and framework outside its template, dependencies it has not vetted, and no test scenarios. The honest rule is that import means "continue on our servers under our template's constraints", with the assistant's first job being to map the code onto the protocol's documents and either adopt or replace what does not fit.
- **The generated stack.** codo's stack (FastAPI, React, SQLite, one process, one port) was chosen for a seat on a shared VPS. It runs fine in a container and is a reasonable default; the choice should be made deliberately for the cluster, with migrations and a health probe as non-negotiables because the assistant will restart the app many times a day.

One idea from round 1 is worth keeping in view without making it the plan: for the many ideas that are "a state machine plus a theme" — the transcript's own words — a declarative runtime shared across apps would cut both inference and hosting cost by an order of magnitude. It is an optimisation to consider once the code path works, not a substitute for it.

## 6. Two doors, one registry

C2 draws the line cleanly:

| | Developer console | AppFather |
|---|---|---|
| Who | Companies and developers with a running service | Anyone with an idea, or with code they want Vista to run |
| Where the app runs | Their servers | Vista's cluster |
| What Vista supplies | Spec, SDK skill, conformance test, stage environment, registry entry | All of that, plus the assistant as builder, the workspace, hosting and operations |
| Proof of control of the service (level 2) | Required and non-trivial | Trivially satisfied — Vista hosts it |
| Operational responsibility for the service | The publisher's | Shared: the publisher owns behaviour and content; Vista owns uptime and isolation |
| Financial permissions | Level 3 as the book says | Same rule, plus the hosted-publisher question below |

What the two should share, built once: the registry API for creating an app under a user's identity; the level-2 definition; the unreviewed-and-unlisted status and its display in the client; the review queue; the caps ladder for software-key apps. What they should not share: the console's proof-of-control step and its operational terms.

Round 1's identity, money and showcase findings otherwise stand. AppFather apps are unreviewed and unlisted by default, reachable by share link and add-by-URL, absent from search and catalog until reviewed. Money in an individual's AppFather app is still the hard question: strict (level 3 only, so hobby apps stay free) or hosted publisher (Vista as merchant of record, payout to the creator's own verified IBAN under the withdrawal rules). C2 makes the second more plausible, because Vista already carries the operational responsibility for what it hosts; the legal-path chapter has not examined the role and should.

## 7. Security consequences of the assistant as builder

The book's four sentences survive intact: reads are scoped, money moves only by contract, the assistant has no key, execution happens where the assistant cannot reach. What AppFather changes is the *exposure*, not the guarantees:

- **More untrusted text, more tools, longer sessions.** Hence the scoped-session rule of section 2. Without it, AppFather is the largest injection surface in the product.
- **The assistant writes code that will later run with a Vista app identity.** A fooled or careless session can generate an app that misuses its declared permissions. The mitigations are the ones the book already gives every app — declared data permissions enforced at the gateway, software-key caps, the leaf rule, unreviewed status, unilateral removal — plus one that only a generator can enforce: the SDK's write-guidance becomes generation rules. Never emit a delete, cancel, send or publish tool; anything with a counterparty or a cost becomes a contract template.
- **The user's own data in the workspace.** Idea text, imported code, test data. It goes to the good-tier provider under the same no-retention terms; if that provider is abroad, the data-flow chapter's caution applies with extra force to code that may contain secrets. AppFather should scan imports for credentials before the assistant reads them.
- **Cost as an attack.** An injected loop that keeps the assistant running is now a way to spend the user's money. The cap of section 4 is a security control, not just a billing one.

## 8. Placement in the roadmap

Unchanged from round 1 in substance, restated for the revised design:

| AppFather needs | Delivered in |
|---|---|
| Level-1 matched identity | Phase 2 |
| The good-tier model and user-paid inference | Not in the roadmap; needed before an alpha |
| Assistant long-session mode and tool scoping | Not in the roadmap; needed before an alpha |
| Cluster tenancy model | Phase 2 alongside internal hosting |
| Level-2 definition, registry API, unreviewed status, review queue | Phase 3, shared with the console |

- **Phase 1:** nothing built; the cost measurement of section 4 runs in the day-one benchmark strand; the SDK skill is kept accurate because AppFather will execute it.
- **Phase 2:** internal alpha with the «داشت» teams as users. They produce these documents anyway, they can tolerate rough edges, and their products enter stage and production in this phase. The alpha proves the long-session assistant and the tenancy model.
- **Phase 3:** general availability next to the developer console, on the shared registry.

No phase's success criterion changes. Phase 2 gains work the V0.4 phasing did not count: the assistant's long-session mode, tool scoping, and the good tier.

## 9. What remains open

1. **Metered or bundled inference**, and where the running cost and cap are shown to a phone user.
2. **Sourcing of the good tier** — provider, contract, location, internal-hosting prospects.
3. **Money in individuals' apps** — strict or hosted publisher.
4. **Level-2 qualification** for AppFather creators; V0.4 open item 2, now urgent for phase 2.
5. **Import rules** — what codebases are accepted, and what "continue on our servers" means for code outside the template.
6. **Cluster location** and the resulting egress policy.
7. **Relation to «داشت»** — alpha users, and whether AppFather-made products are eligible for investment.
8. **The generated stack** for the cluster, chosen deliberately rather than inherited from the workshop's seat constraints.

Closed since round 1: the name (AppFather), the relation to the console (separate, by hosting), the hosting provider (the colleague's Kubernetes service), the builder runtime (the assistant itself), and whether medium models are the gate (they are not; cost on the good tier is).

## 10. If accepted: changes to the book, presentation and SDK (not applied)

**Book.**
- New chapter in بخش ویستا after 02-11: «اپ‌فادر: اپی که اپ می‌سازد» — the workshop mapping of the executive judgment, the boundary table, hosting and status rules, placement, and its separation from the console.
- 01-02 / 04-08 (assistant, model layer): the long-session mode; the scoped-session rule; the good tier alongside the partners; user-selected tiers as the first form of routing; user-paid inference.
- 02-13 (مدل درآمد): a stream for user-paid inference and hosting; bring-your-own-key as the zero-inference case.
- 02-10 (ویترین): the first-party trust class; unreviewed-and-unlisted as a named status; "two doors, one registry".
- 04-03 / 04-07 (read-write, data flow): light writes inside a user's own workspace; the distinction between the assistant's no-network sandbox and an app's networked backend; credential scanning on import.
- 05-01 (نقشهٔ راه): the placement of section 8; "not a criterion of any phase"; the phase-2 additions.
- 05-02 / 05-04 (legal, responsibility): hosting user-generated apps; the hosted-publisher option.
- 90-02 (کارهای باقی‌مانده): section 9.
- 90-01 (واژه‌نامه): «اپ‌فادر», «اپ درجه‌یک», «نشست محدود به اپ».

**Presentation.** One slide after developer publishing: AppFather beside the console, one registry, two hosting models. Supply routes become five.

**SDK.** No protocol change. Add the generation rules derived from the write-guidance, and a short "AppFather tools" reference listing the workspace tools as `tools.write` with their idempotency and scope, so the SDK's own conformance test can cover AppFather itself.

**Workshop repository.** Nothing now. If AppFather proceeds, codo's command files become AppFather's prompt source, versioned once, and V1.1's proposed `/data-model` command is written there first.

---

## Sources

As in round 1, plus the five corrections recorded in section 1. Workshop facts cited: `codo/docs/constitution/00-rules.md` and `01-workflow.md` (state in files, clean session per phase, no sub-agents, the two gates); `workshop_docs/versions/V0.10/02-analysis.md` D-1 and `V0.13/02-mentor-review.md` (usage-limit history); `book/13-build.md` (unattended build, «ادامه بده», print the password); `book/18-server-appendix.md` (seat model the AppFather workspace replaces).
