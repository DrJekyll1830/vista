# Vista V0.5 — Round 1 Analysis: «فادر» (Fader), the app that builds apps

**Input:** [01-transcription.md](01-transcription.md) — two voice messages, 2026-09-13, 21:36 and 21:40. The second message revises the first on one point (whether Fader has its own AI).
**Against:** the Vista book as left by V0.4 (46 chapters under `vista_docs/book`), the SDK skill under `vista_docs/SDK/vista-app`, the live product's `app/README.md`, and the workshop repository (`workshop/book`, `workshop/codo`, `workshop/workshop_docs/versions` V0.1–V1.1).
**Status:** analysis and recommendations, not an approved specification. The book, presentation, SDK and application are **not changed** by this document. Section 12 lists what would change if the idea is accepted.

**Reading the transcript.** Four speech-to-text artefacts matter for what follows:

| Transcript says | Read as | Basis |
|---|---|---|
| «باد فادر» / «فادر» | BotFather → **Fader**, the app that creates apps | Same mangling in workshop V0.1, V0.2, V0.3 transcripts; corrected to BotFather in `workshop/book/11-dependencies.md` |
| «یه اپ توی ۲۰ تا» / «دستیار ۲۰ تا» | «یه اپ توی ویستا» / «دستیار ویستا» | «بیست تا» ≈ «ویستا» phonetically; nothing else in the sentence refers to a count |
| «یه سری پت و یه سری درست کردیم» | «یه سری پرامپت …» — the workshop's slash-command files | Same mangling («ترامپ» for «پرامپت») in workshop V0.3 |
| «ال ام ۵.۳ فلش» | an unidentified cheap, fast model tier, used as an example | Not resolvable; treated as "the default, weaker tier" |

"The book" below means the Vista book. "The workshop" means the one-day founder workshop documented in the workshop repository, whose protocol (`/start → /idea-core → /prd → /data-model → /ux → /design → /deps → /scenarios → /plan → /build → /test → /iterate`) is what the transcript says Fader should run.

---

## Executive judgment

**Fader is the right product at the wrong altitude.** The idea — take the workshop's document-first protocol, put it behind a Vista app, and let a non-developer turn an idea into a Vista-conformant app for a fee — is coherent with the book's thesis (Vista gives services intelligence and trust they cannot build themselves) and fills a hole the book itself left open: the developer console for people who are not developers. The book's SDK skill was already written to be executed by a coding agent; Fader is that agent, productised.

But the transcript describes Fader as one thing, and the book's architecture says it must be two:

1. **A discovery half** — the questions loop that produces idea core, PRD, data model, UX, design brief. This can and should be exactly what the second message says: the Vista assistant itself, working through Fader's MCP tools and prompts, with no separate intelligence. It fits the read / light-write path almost perfectly.
2. **A build half** — architecture, code, tests, deployment on Vista's cluster. This cannot be the chat assistant: it is a multi-hour autonomous coding job with a shell, a filesystem and network egress, it spends money, and its result is irreversible for the user. By the book's own rules it runs in Fader's closed environment, is started by a **signed contract**, and reports back through **post-contract events**. Whether the model behind it is "the same" as the assistant's is a purchasing question; it is not the same runtime and cannot be.

The second message's instinct — one model setting, chosen by the user, priced by the user — is right and should be kept. The claim that follows it — "the same assistant AI does the work through Fader's MCP" — is right for the discovery half and wrong for the build half.

Six further findings shape the recommendation:

- **The model is the gate, and it is untested.** The workshop runs on Claude Opus and Sonnet from a server outside Iran. The book's model layer is two Chinese open-weight partners at "medium" capability, chosen because the assistant only has to "bring the right contract". Driving the codo protocol end-to-end is a different job. No evidence exists yet that the partner models can do it in Persian, at what cost, or how often the result passes `conformance.mjs`. This is the feasibility spike to run first, and it belongs in the day-one "Persian quality benchmark" strand.
- **Unit economics are unknown, and the 1M-toman figure is a price, not a cost.** The workshop repository contains no fee (the 20M figure is new information from this transcript) and no per-project token cost; what it does record is that cohort 2 ran ten projects on one Max-20x subscription and hit the weekly limit, and that sub-agents once burned the limit in two days. Price tiers should follow measurement, and the "bring your own key" clause of the model-layer chapter is the escape valve that makes Fader launchable even if Vista's own inference is too expensive.
- **Hosting generated apps makes Vista a PaaS.** That is a new line of work (isolation, egress control, secrets, quotas, abuse) and a new liability. The workshop's own history is instructive: the Iranian Kubernetes PaaS route was adopted, dry-run, and abandoned hours before a cohort; the shipped model is one VPS per cohort with no containers. Fader needs containers or something more constrained. The transcript's own observation — that a Vista app "has no particular look: a state machine plus a few themes" — points to the answer: a **declarative app tier** running on a shared Vista runtime, with free-form code as the expensive second tier.
- **Fader forces phase-3 questions early.** A Fader-built app needs a publisher identity (level 2), a registry entry, an unreviewed-and-unlisted status, and — for anything that takes money — level 3. None of these exist before phase 3. Fader cannot be a phase-1 deliverable without either violating the roadmap or shipping an app that can only build demos.
- **Fader is a fifth supply route, not a replacement for «داشت».** It manufactures long-tail supply cheaply. «داشت» manufactures teams that maintain products. The transcript says the workshop "turns into an app"; the honest framing is that the workshop's *protocol* becomes an app, while the workshop's *mentoring* and the bootcamp's *team building* do not.
- **A working-code deliverable needs a stronger paper trail than a chat.** The book's own write-guidance says: choose between conversion rate and provability, and where disputes are likely, the contract is cheaper than it looks. "You built what I did not approve" is the dispute Fader will have. The build contract should carry the canonical hash of the approved documents.

**Recommendation in one line:** accept Fader as a first-party Vista app with two halves; run the model-feasibility spike now; build the discovery half as an assistant-driven MCP app during phase 2 with the «داشت» teams as its first users; build the declarative-tier build half and the hosting runtime for phase 3, where it becomes the developer console for non-developers; leave free-form code generation and Fader-hosted payments behind explicit gates.

---

## 1. What the transcript asks for

| # | Request | What it changes or requires |
|---|---|---|
| R1 | A Vista app named Fader, modelled on Telegram's BotFather, with which a user builds their own Vista app | A new app category: an app whose service is producing other apps |
| R2 | Fader runs the workshop protocol: idea or existing git project → questions in-app → defaults accepted one by one → idea core → user comments → loop until neither side has anything open → PRD → data model → UX → design | Porting the codo command set and the file-based questions loop into Vista's chat and mini-app |
| R3 | The design step is light, done with "a tool we will develop", prototype shown in-app; a Vista app has little visual identity — "a state machine for the user's flows plus a few themes, brand, colour" | A constrained app archetype; a prototype renderer inside Fader's mini-app |
| R4 | After documents are ready, the AI behind Fader does architecture, development, and deploys on Vista's own servers; "a cluster Hamidreza will set up"; the user needs no server | Vista as hosting provider for user-generated apps; a coding-agent runtime; a deploy pipeline into a Vista cluster |
| R5 | When done, the user starts the app, uses it, can distribute it, and can request Vista's review so it can enter ویترین | App registration on the user's behalf; an unreviewed/unlisted status; a review queue |
| R6 | The whole process of building an app and connecting it to Vista happens inside one app | Fader must reach the registry, the stage environment, and the hosting cluster from inside Vista |
| R7 | The workshop "becomes" Fader: anyone with an idea — a puzzle game, anything — integrates it | Long-tail supply; catalog quality and abuse controls |
| R8 | *(message 1)* Fader may use a stronger model than the assistant; an app might cost about 1M toman versus the 20M-toman workshop | A priced, metered or flat-fee service; the first pricing figure on record for either product |
| R9 | *(message 2, revising R8)* No separate AI. The user changes model and effort in Fader's settings, pays accordingly; default may be weak; the assistant can propose an upgrade and the user approves; settings are changeable through the assistant like any app's | A per-app model-tier preference; a settings write tool; price shown before commitment |
| R10 | *(message 2)* The assistant itself, through Fader's MCP, writes the documents, asks the questions, and gives UI if needed; intelligence is "pumped" into Fader like into other apps | Decides which of two architectures Fader has — see section 4 |

**What is already in the book.** The SDK as a machine-readable spec meant for a coding agent (02-11); the conformance suite as a self-served definition of done; the stage environment that makes joining nearly free; the three identity levels and the developer console in phase 3 (02-10, 05-01); the "unreviewed app with clear status, no wallet authority" rule (02-10); "colour belongs to the app, layout to the platform" (SDK skill); bring-your-own-key (04-08); the write-guidance's four questions (SDK). Fader is new; almost every part it needs has a named place.

**What is already in the workshop.** The complete protocol, as eleven command files that are "plain markdown, so an AI without slash-commands can open the file and follow it" (`codo/AGENTS.md`); the questions loop with its five-column file and "blank answer means default accepted"; the rule that the assistant, not the user, decides when a phase is done; the `/plan` → `/build` split across two models and two sessions; the per-item commit discipline; the "print the password itself" rule for non-technical users; and V1.1's proposed `/data-model` command between `/prd` and `/ux` — which is the exact sequence the transcript recites.

## 2. What Fader is, in Vista's own terms

**BotFather is the right analogy and its limits are instructive.** BotFather issues an identity and a token; the developer writes and hosts the bot. Fader goes further on every axis: it writes the specification with the user, writes the code, hosts it, and registers it. The workshop's own V0.3 transcript already drew the distinction between BotFather (a bot that creates bots) and Eitaayar (a site where one registers and builds a mini-app). Fader is both, plus a coding agent, plus a host.

**Two entry modes, very different in cost.** The transcript names both: "give me your idea" and "if you have an existing project, give me the code, a git repo".

- *Mode A — new app from an idea.* The full protocol, then generation, then hosting. This is the workshop.
- *Mode B — wrap an existing service.* The service already runs somewhere; Fader generates the Vista adapter (manifest, read tools, build tools, fulfil tool, Ed25519 key handling, mini-app token check) against the existing API and hosts only that adapter. This is the book's integration-cost chapter automated, and it is the "friends' apps" supply route (ایتلا, کنکوریا, سهمتو) done by machine instead of by امید. Mode B needs no product discovery, no data model, no design; it needs the SDK skill, the existing code or API, and the conformance suite. It is the cheaper, earlier, and more valuable first capability.

**A first-party app, not a system app and not a third-party app.** The book fixes the system-app list at six and makes additions a governance decision. Fader does not need that exemption — it should ask for permissions and give contracts like any app. But it cannot be an ordinary third-party app either, for one reason: the workshop protocol is a set of *instructions to the assistant*, and the book forbids apps from instructing the assistant ("apps are leaves; output is data, not command"; SDK: "write no text addressed to the assistant"). The resolution is a trust class the book does not yet name: **first-party apps** authored by Vista, whose prompts ship as part of the assistant's own configuration and are versioned and reviewed like the assistant itself. MCP's *prompts* primitive fits this precisely — prompts are user-invoked templates, so `/idea-core` in the workshop becomes the user selecting Fader's `idea-core` prompt in Vista, which keeps "the user gave the instruction" literally true. Both conditions should hold: first-party authorship, and user invocation.

**The generated app is a Vista app, nothing more general.** The transcript's remark that a Vista app "has no particular look" is the most useful sentence in the two messages. A Vista app, per the SDK, is: a manifest, read tools, contract-building tools, a hidden fulfil tool, optional light-write tools, optional events, an optional mini-app with the platform's token check, and a colour. The workshop generates a full React + FastAPI + SQLite product because the workshop's output is a website. Fader's output is a bot. That is a much smaller thing to generate, test and host, and section 6 builds on it.

## 3. The pipeline against the read / light-write / contract boundary

The book's architecture chapter and the SDK's write-guidance give a test for every Fader step: is it a read, a reversible non-financial write the app itself vouches for, or a contract? The four questions are: can the user undo it, does anyone else see it, does volume itself do harm, would the user expect to be asked.

| Fader step | Path | Reasoning |
|---|---|---|
| Submit idea text, upload or link a repo | Light write (`save_input`) | Private, reversible, user-initiated. The *content* is a data event: the user's idea and code go to the model provider under the same contractual terms as everything else (04-07). If the repo is not the user's, that is a licensing question Fader must ask, not decide. |
| Assistant asks questions, records answers and defaults | Light write (`save_answers`) | The workshop's five-column questions file, held by Fader as state. Persian text; `docs/versions/<v>/NN-questions.md` becomes a Fader document with the same append-only rule. |
| Assistant drafts idea core, PRD, data model, UX | Light write (`save_document`) | Unpublished drafts; the guidance's "editing a draft not yet published" is the safe list's own example. |
| User comments on a document | Light write, or direct in the mini-app | The workshop uses Obsidian because participants have laptops; in Vista the mini-app is the document viewer and comment surface, and the chat is the loop. |
| Approve a document | Contract, rung 1, no money | Cheap, and it is the paper trail. The workshop's explicit "you decide readiness" rule stays with the assistant; approval stays with the user. Each approval hashes the approved text. |
| Change model tier or effort | Light write (`set_build_tier`) | The guidance lists "settings that consume quota or credit" under *with caution*. It is safe here only because no money moves on the setting itself: the price appears on the build contract. If the tier changed a running job's spend, it would need a contract. |
| **Start a build** | **Contract**: `wallet.pay` + `app.action`, rung by amount, referencing the hashes of the approved documents | Spends money, commits Vista compute, is not undoable, and is the thing the user expects to be asked about. Settlement `on_delivery`; refund event if the build fails conformance. This is R8's "1M toman", as a contract the user sees before signing. |
| Build runs (architecture, code, tests, deploy to stage) | Fader's own backend, invoked through `tools.fulfil` with the platform signature, reporting via `POST /api/app-events` | The processor calls Fader's fulfil tool; Fader starts the job; progress arrives in Fader's chat as events replying to the build contract — exactly the "post-contract events" pattern the bot chapter draws for food delivery. The assistant is not in this loop and does not need to be. |
| Register the new app in Vista's registry under the user | Part of the build contract's effect, executed by Fader with a platform-granted capability | Today registration is "catalog by Vista" or "add by URL by the user" (manifest.md). Fader needs a third path: registration on behalf of a level-2 user. This is the developer console's backend, arriving early. |
| Deploy a new version of an existing Fader app | Contract | Same reasoning as the first build; smaller amount; the workshop's "one feature or one bug fix per version" rule is the scope limit. |
| Submit for review to enter ویترین | Contract, rung 1, no money | Public consequence; the book's "unreviewed → reviewed" transition is a platform decision recorded against a request the user signed. |
| Delete the app | Contract | Irreversible; the guidance's *never* list. |

Two things follow. First, the chat assistant's involvement ends at "start a build": everything after it is an ordinary Vista app doing ordinary Vista things. Second, no step needs a new primitive; the SDK already has every one of them.

## 4. One intelligence or two

The first message proposes a stronger model for Fader than for the assistant. The second withdraws it: no reason for a separate AI; the user picks model and effort in settings; the assistant itself works through Fader's MCP; intelligence is pumped into Fader like any app.

Three of the book's own rules decide this.

**The pumping chapter's first condition.** "The model that works for a service runs in its own closed environment: it has no access to the user's conversation with the assistant, has no tools, and what it returns is data, not command." That describes a coding agent's model perfectly — and describes the chat assistant not at all. A coding agent needs a shell, a filesystem, a package registry and the stage API; those are *its* tools inside *its* sandbox, not Vista tools, and the sandbox is Fader's backend, not the assistant's calculation environment (which the data-flow chapter says has no network at all).

**The assistant's loop.** The live product's assistant is an OpenAI-compatible streaming tool loop over the gateway, designed to bring a contract within a conversation. The workshop's `/build` runs unattended for hours, commits per item, survives usage-limit pauses with «ادامه بده», and is explicitly forbidden from asking technical questions. These are different programs.

**The leaf rule.** If the assistant executed the build, Fader would be an app steering the user's assistant through a multi-hour job — the exact thing the app-to-app chapter forbids ("apps cannot use the user's assistant as an intermediary").

So the verdict is: **one model setting, two runtimes.**

- The **discovery half** is the assistant plus Fader's MCP. Here message 2 is entirely right: no separate AI, Fader is "almost dumb" — state machine, document store, question files, prompts. The assistant already holds the user's conversation, memory and connected data, which is why it is the better interviewer.
- The **build half** is a builder instance in Fader's closed environment. Its model is chosen by the same setting the user sees, priced on the build contract. Whether that instance comes from Vista's inference (which is pumping, in the book's sense, sold to a first-party app) or from a key the user brought is a purchasing detail, and both should work from day one.

The upgrade nudge in message 2 ("you are on the flash tier; I suggest a stronger one; user approves") is a good pattern and sits naturally on the *build contract*: the assistant proposes, the contract shows tier and price, the user signs.

One more consequence: the workshop's split of `/plan` on a strong model and `/build` on a cheaper one is exactly the two-tier routing the model-layer chapter schedules for later. Fader can inherit it as two line items on the same contract (planning tier, building tier) rather than one.

## 5. The model is the gate, and pricing follows measurement

**What the workshop proves and what it does not.** Three cohorts have run; the one-day claim held at cohort 3 ("started at eight, finished at eight-thirty"). Every one of them ran on Claude Opus and Sonnet, from a VPS outside Iran, on a subscription one person paid for. The book's premise is that Western providers are unavailable to a product with millions of Iranian users, and that the assistant's job is easy enough for a medium open-weight model. The workshop's evidence is therefore evidence about the *protocol*, not about the *model Vista will have*.

**What is not known.** Whether either Chinese partner's open-weight model can run the codo protocol to a green conformance test; how many tokens a Mode-A build and a Mode-B adapter cost; how often the result needs a human; and how the Persian quality gap ("extracting the right amount, name and date; not inventing what does not exist", per the open-items appendix) shows up in generated contract-building tools where the numbers must come from the backend, never from the model.

**The spike.** Take three completed workshop projects (idea input and approved documents exist in their repositories), the SDK skill, and one candidate partner model behind an OpenAI-compatible endpoint. Run Mode B on one existing service and Mode A on two ideas. Measure: conformance pass rate, tokens and wall time per build, human interventions, and the cost at the partner's price. This is a two-week task, needs no Vista code, and its result decides whether Fader is a phase-2 alpha or a phase-4 idea. It belongs in the "Persian quality benchmark" strand the roadmap already starts on day one.

**On the numbers in the transcript.** The 20M-toman workshop fee appears nowhere in the workshop repository; the only money figures there are tool costs. The 1M-toman app figure is a *price point* the user would accept, not a cost Vista has measured. Three data points argue for caution: cohort 2 ran ten projects on one Max-20x subscription and hit its limit; V0.6 records a simple build running past ten hours when one context did everything inline; and V0.10 records the sub-agent ceremony that replaced it burning the same weekly limit in two days. Recommendations:

- **Flat-fee tiers, not metering.** The transcript's own model (default tier cheap, stronger tier dearer) becomes three or four contract templates with fixed prices per tier; Fader absorbs variance. Metered billing would need background delegation with a cap, which the book places in phase 2 and the far-horizons appendix places behind "delegation has settled" — and it would put an unbounded number on a contract the user has to sign.
- **Bring your own key as a launch condition, not a feature.** A user who brings a key pays Vista only for the build slot and hosting. This is the book's own answer to "the largest operating-cost risk becomes a user choice", and it makes Fader viable even if the spike says Vista's inference is too expensive at 1M.
- **Price after the spike.** Not before.

## 6. Hosting generated apps: Vista as a PaaS

The transcript is explicit: the user needs no server; the app is deployed on Vista's own cluster. This is a strategic choice with costs the book has not priced.

**What the workshop learned about hosting.** The Iranian PaaS route (Darkube on Hamravesh: git-push deploy, managed Postgres, S3, free HTTPS subdomain) was studied in V0.2, adopted through V0.8, and dropped in V0.9 after a real dry-run failed three hours before a cohort. The shipped model is a single VPS outside Iran, twelve seats, port and subdomain derived from a seat number, Caddy in front, SQLite inside, and a constitution rule that says "no containers — do not write a Dockerfile, do not mention it to the user". V1.1 proposes Docker Compose per team on the participant's own VPS. None of this is multi-tenant hosting of untrusted code.

**What Fader needs from a cluster.** Per-app isolation (a Fader app runs with a Vista-issued app identity and receives platform assertions about *its* users; a bug in one app must not read another's data); controlled egress (the workshop's own experience that domestic gateways are unreachable from abroad, and the reverse if the cluster is inside Iran and the model partner is outside); secrets custody per app; CPU, memory and storage quotas; log retention; abuse response; and a promotion path from stage to production that respects the SDK's rule that the two environments never connect.

**Two tiers, and the cheap one first.** The transcript's own description of a Vista app — a state machine over the user's flows, plus themes, brand and colour — fits a **declarative tier**: Fader emits a specification (manifest, read tools bound to a small hosted datastore, contract templates with amounts from that datastore, fulfil handlers as bounded functions, an optional mini-app rendered from a theme) that a shared Vista runtime executes. No user code runs; isolation is data isolation; hosting cost per idle app is near zero; the conformance suite runs against the runtime once, not against every app. This is how bot builders on messengers already scale, and it is what most workshop ideas (a shop, a booking list, a quiz game, a tutoring schedule) actually need. The **code tier** — a container per app, generated free-form from the codo stack or its successor — is the expensive, dangerous, later option, reserved for ideas the declarative runtime cannot express, and priced accordingly.

**Where the cluster lives matters twice.** Inside Iran: domestic services reachable, model partner reachable by contract, latency to Vista's users low, and the data-flow chapter's privacy argument ("some uses do not open until the model is inside the country") extends to generated apps' data. Outside: the workshop's problems return. The book's model-layer chapter already commits to importing hardware and hosting inside; Fader's runtime should ride that decision rather than make its own.

**The book's write-guidance applies to generated tools.** Fader will generate `tools.write` lists. The guidance says the app decides and Vista does not review the list. For Fader-built apps the generator *is* Vista, so the four questions become generation rules: never emit a delete, cancel, send or publish tool; anything with a counterparty or a cost becomes a contract template. This is a place where automation can be stricter than the human rule.

## 7. Identity, ownership, money, and the showcase

**Publisher identity.** The book's level 2 ("developer: stronger verification, a responsive contact, proof of control of the service") is what lets someone register an app, and "who reaches it and with what evidence" is explicitly undecided until phase 3. A Fader app has a publisher — the user — and Fader registers it on their behalf. So Fader cannot ship before level 2 has a definition. A minimal answer that Fader makes attractive: level 1 identity (matched mobile, national ID, birth date, from phase 2) plus acceptance of the developer terms is enough for an *unlisted* app with low caps; anything listed in ویترین needs the fuller level 2. "Proof of control of the service" is trivially satisfied when Vista hosts the service.

**Status of a Fader app.** The book already has the right states: unreviewed, shown with clear status after minimal checks, no wallet authority. Fader apps should be **unreviewed and unlisted by default**: reachable by share link and add-by-URL (which the book routes through the same publishing policy), visible in the creator's own app list, absent from search and catalog until reviewed. Volume then does not damage ویترین, and "request review" (R5) is the transition contract.

**Money is the hard part.** Only a level-3 (legal/corporate) app may use the wallet; only a verified app may take money from a user. A puzzle game with a 20,000-toman unlock, made by an individual in Fader, cannot take that money under the book as written. Two positions are possible and the transcript does not choose:

- *Strict:* Fader apps are free-to-use until their creator reaches level 3. Consistent, and it makes Fader mostly a hobby tool.
- *Hosted publisher:* Vista is the merchant of record for Fader-hosted apps; the user pays Vista's wallet under a contract whose counterparty is Vista (which has an independent obligation — hosting and delivery — so the eighth principle, "the party is the one with an obligation", is respected); Vista settles to the creator's own IBAN under the withdrawal rules. The signature-rung rule "the destination determines the rung; anywhere money can reach someone other than the user or a verified app, the rung rises" is satisfied because the payout destination is the creator's own verified IBAN, the same case as a wallet withdrawal. Caps stay low; the creator's identity is level 1 matched.

The second is what every app store does and is the one that makes Fader a business; it is also a new financial role for Vista that the legal-path chapter has not examined. It should be listed as a decision, not assumed.

**Liability.** Vista hosting user-generated apps is intermediary liability of a kind the responsibility chapter does not cover: content, scams, a generated app that misuses a permission. The mitigations already in the book apply — low caps for software-key apps, declared data permissions enforced at the gateway, unreviewed status, unilateral removal — and one more is specific to Fader: the generator can refuse categories at the idea-core step, before anything exists.

**Intellectual property.** The documents and the generated app belong to the user; the runtime and the templates belong to Vista; imported code carries its own licence. This must be in Fader's start contract, not discovered later.

## 8. The experience inside Vista

**The loop moves from files to chat plus mini-app.** The workshop put questions in files because participants have laptops, Obsidian and git, and because chat was where the assistant kept drifting into ("CODO caught chatting instead of using files", V0.4/V0.5). In Vista the constraint is opposite: the user is on a phone, in a conversation, and the app's *documents* need a surface. The mapping that preserves what the workshop learned:

- Questions arrive in Fader's chat one at a time with the recommended default and a one-tap accept — the transcript's "accept the defaults one by one".
- Drafts live in Fader's mini-app, where the user reads and comments inline; the mini-app is the book's designated place for "the user who prefers to see and click".
- The append-only, numbered, never-reopened rule stays: it is what made conflicts "not mitigated but impossible" in V1.0 round 2, and a state machine can enforce it more reliably than a folder convention.
- The assistant decides readiness; the user approves with a rung-1 contract.

**Existing project import (Mode B).** Give a repo URL or an API description. Fader reads it in the builder's sandbox (the user's code is untrusted content for the builder model, which is fine inside a closed instance whose output is a proposed adapter, not a command), produces the manifest and tool map for approval, and generates the adapter. The user must own or be licensed to the code; Fader asks.

**Design.** The workshop sends the user to Claude's Design feature in a browser and expects a ZIP back; V1.1 wants a published design artifact at the end of day one. Fader has neither a browser handoff nor a need for one: the declarative tier renders a prototype from theme, colour, logo and the state machine inside the mini-app, which is the "tool we will develop" of R3. A hand sketch photographed from the phone remains a good input.

**Progress and delivery.** The build is a contract; its events reply to it in Fader's chat ("architecture written", "12 of 18 items", "conformance green", "live on stage", "delivered"). Usage-limit pauses become a `note` event and a resume, not a chat instruction. What the workshop prints at the end — the address, an admin username and the password in full — becomes the delivered event's text. The workshop's rule that a non-technical user cannot fetch a git-ignored file applies with more force to a phone user.

**Settings.** Per-app settings in the book are contracts, permissions, mute and remove. Fader adds tier and effort. R9's "changeable through the assistant like any app" is the light-write tool of section 3; the price consequence is visible on the next build contract, which is why it is safe.

## 9. Where Fader sits in the roadmap

The roadmap is three phases in one year, with phase-1 success defined as ایتلا and کنکوریا working and payment flowing. Fader touches none of that and depends on several things later phases deliver:

| Fader needs | Delivered in |
|---|---|
| Level-1 matched identity | Phase 2 |
| Hosting cluster and internal inference (or at least the hardware decision) | Phase 2, "may expand; not a criterion" |
| Level-2 definition, registry API for third-party publishers, review policy, unreviewed status in the client | Phase 3 (developer console) |
| Developer console location decision | Open item #1 in the V0.4 list |
| A model that can run the protocol | Unknown; spike needed |

The placement that follows:

- **Phase 1:** nothing built. The model spike runs in the day-one benchmark strand. The SDK skill is the artefact Fader will execute, so keeping it accurate is already Fader work.
- **Phase 2:** the discovery half as an internal alpha, with the «داشت» teams as its first users — they are producing exactly these documents anyway, they are technical enough to survive rough edges, and their products enter stage and production in this phase. Mode B (adapter generation) for the friends' apps that are being connected by hand.
- **Phase 3:** the build half on the declarative tier, hosting on the cluster, registration under level 2, unreviewed-unlisted status, review queue. Fader becomes **the developer console for non-developers**, which half-answers the open question "console as a separate website or inside Vista": companies get a website, individuals get Fader, and both write to the same registry.
- **Later:** the code tier; Fader-hosted payments if the hosted-publisher decision goes that way; metered builds once delegation has settled.

This keeps the three-phase, one-year frame intact and adds no success criterion to any phase. Fader does add work to phase 2 (the model spike's follow-through, the alpha) that the V0.4 phasing did not count.

## 10. Risks

1. **Model capability.** The partner models cannot drive the protocol to green conformance at acceptable cost. Mitigation: the spike; bring-your-own-key; Mode B before Mode A; the declarative tier, which asks far less of the model than free-form code.
2. **Unit cost above price.** Mitigation: flat tiers priced after measurement; declarative tier; caps on retries per build.
3. **Hosting becomes the product.** A PaaS is a full-time platform team. Mitigation: shared runtime for the declarative tier; defer the code tier; ride the internal-hosting decision rather than make a separate one.
4. **Catalog flooding and low-quality supply.** Mitigation: unreviewed-unlisted default; review before listing; the sponsored-presence rules and "answer is not for sale" apply unchanged.
5. **Generated apps misbehave.** Mitigation: generation rules stricter than the human write-guidance; software-key caps; declared data permissions; the leaf rule; unilateral removal.
6. **Prompt injection through imported code or idea text.** The builder reads untrusted content. Mitigation: closed instance; its output is a proposal the user approves, then a contract the user signs; no path from the builder to the user's assistant.
7. **Disputes over deliverables.** Mitigation: approval contracts with document hashes; the build contract references them; conformance as the acceptance criterion; refund event on failure.
8. **Legal exposure as host and possibly merchant of record.** Mitigation: list the hosted-publisher choice as a decision for the legal path; start strict.
9. **Two products, one protocol.** The workshop and Fader will drift. Mitigation: codo's command files become Fader's prompt source, versioned once.
10. **Scope creep into phase 1.** Fader is exciting and phase 1 is two months. Mitigation: the placement in section 9, stated in the roadmap chapter if accepted.

## 11. What the transcript leaves open

1. **Which entry mode first** — new app from idea, or adapter for an existing service. This analysis recommends the adapter.
2. **Declarative or code generation** — the transcript's "state machine plus themes" suggests declarative; "it does the programming itself" suggests code. Both are stated; only one can be first.
3. **Money in Fader apps** — strict (level 3 only) or hosted publisher (Vista as merchant of record with payout to the creator's IBAN).
4. **Level-2 qualification for Fader creators** — inherits V0.4 open item #2 and makes it urgent earlier.
5. **Pricing** — 1M toman is a price point; tiers, what a tier buys, and bring-your-own-key pricing are unset.
6. **Cluster location and owner** — "Hamidreza" is named; inside or outside the country, and its relation to the internal-hosting decision, are not.
7. **Where documents live for the user** — mini-app only, or also exportable (the workshop's Obsidian habit) for users who want them.
8. **Relation to «داشت»** — whether bootcamp teams use Fader, and whether Fader-made products are eligible for «داشت» investment.
9. **The name.** «فادر» is a fragment of BotFather; whether that reads as intended to a Persian user, and what the glossary entry says, is a naming decision.

## 12. If accepted: changes to the book, presentation and SDK (not applied)

**Book.**
- New chapter in بخش ویستا, after 02-11 (integration and SDK): «فادر: اپی که اپ می‌سازد» — the two halves, two entry modes, two tiers, the contract map of section 3, status and money rules, placement.
- 02-10 (ویترین): add the first-party trust class; add "unreviewed and unlisted" as a named status; note Fader as the individual's path to registration alongside the companies' console.
- 02-11: reference Fader as the automated form of the integration promise ("your bot, with a small change") and as the machine reader of the SDK.
- 02-12 (پمپاژ هوش): add the builder instance as an example of a closed environment with its own sandboxed tools, and state that its tools are never Vista tools.
- 02-13 (مدل درآمد): a fifth stream or a sub-stream of pumping — build fees and hosting; note bring-your-own-key.
- 04-08 (لایهٔ مدل): the model spike as part of the day-one benchmark; the plan/build split as an early instance of multi-tier routing.
- 05-01 (نقشهٔ راه): the placement of section 9; explicitly "not a criterion of any phase".
- 05-02 / 05-04 (legal, responsibility): hosting user-generated apps; the hosted-publisher option.
- 90-02 (کارهای باقی‌مانده): the open points of section 11.
- 90-01 (واژه‌نامه): «فادر», «اپ درجه‌یک» (first-party app), «لایهٔ اعلانی» (declarative tier).

**Presentation.** One slide after "developer publishing": Fader as the console for non-developers; the two halves; phase placement. The "four supply routes" slide becomes five.

**SDK.** No change to the protocol. Two additions: a generation-rules note that turns the write-guidance's four questions into rules for a generator, and a declarative-tier specification if that route is chosen. The conformance suite is already Fader's acceptance test.

**Workshop repository.** Nothing now. If Fader proceeds, codo's eleven command files become the single source of Fader's prompts, and V1.1's proposed `/data-model` command should be written there first so both products share it.

---

## Sources

Vista book: `01-06-هوشمندی-و-اعتماد`, `02-03-بات-و-مینی-اپ`, `02-04-لایه-سیستمی`, `02-05-مجوزها`, `02-06-وکالت`, `02-10-ویترین`, `02-11-یکپارچه‌سازی-و-SDK`, `02-12-پمپاژ-هوش`, `02-13-مدل-درآمد`, `02-15-امنیت-و-اعتماد`, `04-02-کنشگران-و-هویت`, `04-03-خواندن-و-نوشتن`, `04-05-اپ-به-اپ`, `04-07-جریان-داده`, `04-08-لایه-مدل`, `05-01-نقشه-راه`, `05-05-اختیارات`, `90-02-کارهای-باقی‌مانده`, `90-03-افق‌های-دور`; V0.4 applied-changes note.
Vista SDK: `SKILL.md`, `reference/manifest.md`, `reference/mcp-write-guidance.md`; `app/README.md`.
Workshop: `book/00-index.md`, `01-introduction.md`, `10-design.md`, `13-build.md`, `18-server-appendix.md`; `codo/CLAUDE.md`, `AGENTS.md`, `docs/constitution/00-rules.md`, `01-workflow.md`, `02-tech-stack.md`, `.claude/commands/{start,idea-core,prd,design,build,iterate}.md`; `workshop_docs/versions/V0.2/03-analysis.md`, `V0.2/09-hamravesh-capabilities.md`, `V0.3/01-transcription.md`, `V0.6/01-feedback.md`, `V0.9/01-need.md`, `V0.10/02-analysis.md`, `V0.13/02-mentor-review.md`, `V1.0/01-after-workshop3.md`, `V1.0/03-proposals-round2.md`, `V1.1/01-transcription.md`, `V1.1/02-analysis.md`.
