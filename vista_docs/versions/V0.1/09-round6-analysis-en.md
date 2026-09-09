# Vista — Round 6 Analysis

**Input:** your COMMENTs on Round 5. The substantive one is at line 201: *adopt Telegram bot/mini-app, Solidity/EVM, OpenAI (for bring-your-own-agent), and MCP — but it is unclear how they coexist.*

That is this round's main work, and the research produced a finding that resolves it more cleanly than I expected. Then account abstraction, which is the missing bridge between your signature ladder and the EVM, and the smaller answers.

---

# 1. The four standards — how they coexist

## 1.1 The finding that resolves it

**MCP Apps is now an open standard, and it covers the same ground as Telegram Mini Apps.** MCP was extended so a server can supply *interactive UI rendered inside the conversation*, not merely tools. The spec is supported by Claude, ChatGPT, Goose and VS Code; OpenAI's Apps SDK is a vendor stack sitting on top of it for the ChatGPT surface, and OpenAI's own documentation encourages developers to lead with MCP Apps for cross-host portability. Third-party apps — Spotify, Canva, Figma, Booking.com — already render interactive UI inside ChatGPT this way, published through a reviewed directory.

**Three of your four standards are therefore not three standards.** MCP Apps *is* the bot-plus-mini-app pattern, expressed as an open, AI-native standard; the OpenAI Apps SDK is a layer on it. What remains genuinely separate is the EVM, which does a completely different job.

## 1.2 The map: two protocols, one idiom, one compatibility target

```
┌─ USER ─────────────────────────────────────────────────────────┐
│  Interaction idiom: Telegram-shaped                            │
│  bot · /start · buttons · attachments · mini-app view          │
│  (this is what the user sees and already understands)          │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌─ AGENT ────────────────────┴───────────────────────────────────┐
│  Model interface: OpenAI-compatible API                        │
│  (outbound, to Qwen / GLM / self-hosted — swappable)           │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌─ CAPABILITY ───────────────┴───────────────────────────────────┐
│  MCP + MCP Apps  ← the single integration standard             │
│  tools (agent-facing) · UI resources (human-facing)            │
│  reads and contract drafting only — never writes               │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌─ SETTLEMENT ───────────────┴───────────────────────────────────┐
│  Solidity / EVM on Besu                                        │
│  contracts · signatures · tokens · fees · audit                │
└────────────────────────────────────────────────────────────────┘
```

Stated in one sentence for the book: **MCP is how services are reached, the EVM is how commitments are settled, the OpenAI API is how models are swapped, and Telegram is what it all looks like.**

## 1.3 The rule that makes it coherent

> **One capability declaration; two renderings.**

A service declares its capabilities once, in the SDK format. From that single declaration, two surfaces are generated: **tools** the agent can call, and **buttons and views** the human can touch. Same capabilities, same limits, same contracts — guaranteed consistent, because they come from one source.

This solves a real problem rather than a cosmetic one. In any product with both an agentic path and a manual path, the two surfaces drift: the bot gains a feature the agent cannot reach, or the agent can do something the buttons cannot. Generating both from one declaration makes drift structurally impossible, and it means your bot fallback is always exactly as capable as the assistant.

## 1.4 The overlaps, resolved

| Apparent conflict | Resolution |
|---|---|
| Bot API vs MCP — both "how a service exposes itself" | The bot is the human face, MCP the agent face. One declaration, two renderings (§1.3). |
| Telegram payments vs contracts | Telegram's invoice flow is already offer → acceptance. Keep its shape, replace its backend: `sendInvoice` becomes *the app sends a pre-signed offer contract*. Developers find this familiar; the semantics get stronger. |
| MCP tools vs the write path | Unchanged from Round 4: Vista exposes only read and draft tools. This is a *restriction* of MCP, not an extension — any MCP client still works, we simply publish no mutating tools. |
| OpenAI API vs MCP | They compose as the industry already composes them: OpenAI-style tool calling, MCP as the tool source. Outbound for our models, inbound for external agents (§3). |
| EVM vs the signature ladder | The real gap, and §2 is the answer. |

## 1.5 Where I disagree with you — and it is a narrow disagreement

You wrote that for bots and mini-apps we copy Telegram's contract and interface. **I agree entirely at the user-facing layer and disagree at the developer-facing layer.**

At the user-facing layer you are plainly right, and the evidence is your own: Eitaa and Bale succeeded by making themselves feel like Telegram. Copy the vocabulary and the interaction grammar — bot, `/start`, buttons, attachments, a mini-app opening inside the conversation. That familiarity is worth a great deal and costs nothing.

At the developer-facing layer, adopting Telegram's Bot API as the integration contract would mean **adopting a proprietary API, owned by someone else, designed for messaging rather than for agents, at exactly the moment an open standard covering the same ground has become the ecosystem default.** Telegram's Bot API has no concept of a tool, an agent, or a capability declaration — it is a messaging API with UI attached. Vista's primary consumer is an agent.

**Recommendation:**
- **Primary and canonical:** MCP + MCP Apps. This is what the SDK generates and what the platform is specified against.
- **Compatibility adapter:** a Telegram-Bot-API-shaped adapter, so existing bot developers in this market — and there are many, across Telegram, Bale, Eitaa and Rubika — can port in days rather than weeks. This is cheap to build and it is a real adoption lever in *this specific market*.
- **Never promise wire compatibility.** "Telegram-shaped, not Telegram-compatible." A promise of drop-in portability is one you would break.

You get the familiarity you want, the porting path, and a canonical standard you do not have to ask anyone's permission to extend.

## 1.6 The strategic prize hidden in this

Because MCP Apps is cross-host, a service that builds an app for ChatGPT or Claude has *already built most of a Vista integration*, and the reverse is equally true.

This compounds the point from Round 5 about integration cost being the real barrier to supply-side adoption. The pitch to a partner becomes: **"build once against the open standard; run in ChatGPT, in Claude, and in Vista."** No Iranian platform can say that, and it changes the conversation from "integrate with us" to "you are probably already most of the way there." **COMMENT**: I dont know a developer who write a MCP for claude or chatgpt. is it open for everyone to write a MCP and put it on chatgpt? how?

It also creates a reverse channel worth noting in the book: as Iranian services build MCP Apps for global assistants, they become Vista-ready by default. Vista benefits from work it did not commission.

---

# 2. Account abstraction — the missing bridge

Your signature ladder and the EVM do not natively fit together, and this is the gap I should have caught last round. Rungs 0–2 — an authenticated request, an OTP — are not cryptographic signatures and cannot be verified on-chain. Rungs 3–4 produce real signatures that can be. Something has to reconcile them.

**The answer is a smart account with programmable validation logic — account abstraction, in the ERC-4337 sense.** Instead of every user being a plain key-pair account, each user is a contract account whose *own code* decides what evidence is required before a transaction is valid.

**Why this is the right answer here — it maps onto everything you have specified:**

| Your requirement | The account-abstraction mechanism |
|---|---|
| Signature rungs 0–4 | validation logic in the account contract: what evidence is required, by value and action type |
| Rungs 0–2 (non-cryptographic) | the processor attests off-chain and co-signs; the account requires the processor's attestation *plus*, above a threshold, the user's own key |
| Rungs 3–4 | the user's device or SIM key is a validator on the account; verified on-chain where the curve permits, attested where it does not |
| Value ceilings per rung | enforced **in the account contract**, not in application code — so they hold even if the application is wrong |
| **Delegation (وکالت)** | **session keys** — a scoped, time-limited, ceiling-bounded key granted to an app. This is precisely your ERC-20 analogy, already standardised, with existing implementations |
| Your six delegation rules | expressible as validation logic: no unlimited allowance, mandatory expiry, no re-delegation, immediate revocation |
| Users never seeing gas | paymaster sponsorship — essential for a consumer product, and standard |
| Account recovery | social or institutional recovery, which has been on the risk register since Round 1 with no answer until now |
| Batched operations | one signature covering several effects — the multi-effect contracts you described |

**Adoption is substantial enough that this is not exotic:** over 40 million smart accounts deployed across Ethereum and its layer-2s, with more than 100 million user operations, and the pattern works on any EVM-compatible chain.

**Three caveats, stated honestly:**

1. **I could not confirm ERC-4337 running on Besu specifically.** The standard is chain-agnostic in principle, but this must be a POC item rather than an assumption.
2. **Take the pattern, not necessarily the full machinery.** ERC-4337's alternative mempool and bundler infrastructure exists to avoid protocol changes on a permissionless chain. On a permissioned chain with a known processor, much of that is unnecessary. Adopt the smart-account interfaces for tooling compatibility; do not take on complexity you do not need.
3. **The processor becomes security-critical.** At low rungs it is co-signing on the user's behalf, so its key management, its attestation logic, and its audit trail are now part of the trusted computing base. This should be named in the security chapter rather than discovered later.

**What this gives the book:** the signature ladder stops being a product feature described in prose and becomes a property enforced by the account contract itself. "The ceiling is enforced by the user's own account, not by the app asking nicely" is a much stronger sentence for a bank reviewer.

---

# 3. Bring your own agent — and why this is a differentiator

"Bring your own agent" resolves cleanly given §1: **Vista publishes an MCP server.** Any external agent — ChatGPT, Claude, a partner's own assistant, a power user's local agent — connects to it and gets the read tools and the drafting tools. It cannot sign, because nothing can sign except a principal at a client.

**The security model makes this safe by construction, and that is unusual enough to be a selling point.** Most platforms cannot let an arbitrary third-party agent connect to their user's account, because a connected agent can act. Here it cannot: the worst an unknown agent can do is draft a contract the user is then shown and declines. So Vista can offer something no bank and no super-app in this market can offer — *connect whatever agent you like; it still cannot move your money.* **COMMENT**: it also solves the problem of AI cost. the end user should pay the AI tokens or bring their own API key of whatever provider they like. just like hermes

Practical scope for the book: an external agent gets read tools and drafting tools, scoped by the same per-app data permissions as any other principal, rate-limited, and logged. Signing always happens in Vista. Delegation is never grantable to an external agent without an explicit high-rung grant from the user.

This is also, incidentally, the honest answer to the long-term threat that global assistants absorb the interaction layer. If ChatGPT becomes how Iranians talk to services, Vista is still where the contracts are signed and settled. **Being the settlement layer is a better position than being the chat window**, and it is worth saying so in the competition chapter.

---

# 4. Contracts — one refinement from your rent comment

Your note that a rent contract has three or more parties — the app which can pre-sign it, the landlord, the tenant, and possibly witnesses — generalises into a rule worth stating:

> **The app is a party to nearly every contract**, because it supplies the template, provides the venue, and takes a fee. So the minimum is not "two parties" but "the app plus at least one other principal," and peer contracts between users are really three-party contracts in which two of the parties are peers.

That tidies several things at once: the fee has a party to attach to, the template has an author who is accountable for it, the dispute path has an obvious first respondent, and "who do I complain to" has an answer visible in the document itself.

**On pre-signed offers, you are right and I over-weighted it.** If the app's signer is down, the app is down — the failure is not new, and the mitigation is not urgent. Pre-signing remains a latency optimisation for high-frequency catalogue cases; it is not an architectural requirement. Downgraded accordingly.

---

# 5. Smaller answers

**Registry transparency — opt-in, as you said.** Apps choose whether to publish their signing mechanism, limits, and review status. Worth noting the market dynamic this creates: once some apps publish, publishing becomes a signal and not publishing becomes one too. You get most of the benefit of mandatory transparency through voluntary pressure, without the partner resistance. The question stays open in the book, framed as a design option rather than a commitment.

**PKI — added to the roadmap as a named workstream.** Longest lead time of anything except hardware, and shared with the SIM-signature ambition.

**User-to-user chat — deferred, and it goes in the roadmap section** with the licensing dependency stated, as you asked.

**The three fulfilment examples — food order, rental, marketplace purchase — confirmed.**

---

# 6. The presentation

You asked for a presentation alongside the book, with use cases shown graphically. My proposal:

**Format.** A self-contained HTML deck, Persian, right-to-left, published so you get a link you can send. Roughly 20–25 screens. Not a summary of the book — a different artifact with a different job: the book argues, the deck *shows*. It is also the thing that actually gets presented in a room, so it should be able to stand alone.

**Structure:**

| Section                    | Screens | Content                                                                              |
| -------------------------- | ------- | ------------------------------------------------------------------------------------ |
| The shift                  | 2–3     | from apps to agents; the one-sentence thesis                                         |
| What Vista is              | 2       | the کارپرداز image; one identity, one assistant, many services                       |
| **Use cases, graphically** | 8–10    | the core of the deck (below) **COMMENT**: it's good for it to have some interactions |
| How it is safe             | 3       | reads free, writes are contracts, the agent never signs, the signature ladder        |
| The ecosystem              | 2       | bots, the SDK, build-once-run-anywhere                                               |
| The plan                   | 3       | prove / scale / open, and the ask                                                    |

**Use cases to draw** — each as a single visual sequence, no prose:
1. Ordering food — the contract, pre-signed by the app, signed by the user at rung 1
2. A ride to the user's mother's address — the assistant drafting from memory
3. **A shared ride with the origin missing** — the contract forwarded to a friend who completes and signs. This is your most original idea and it should get the most visual space
4. Splitting a bill — several payers, quorum
5. A transfer with SIM signature at rung 4 — the ceiling ladder shown
6. Automatic bill payment by delegation — granting, and the spend record
7. A rent contract — three parties, escrow, the fee split visible
8. App-to-app — the API gateway, no human present
9. The AI is unavailable — the bot list, everything still works
10. Buying tokenised gold — the same mechanism, a different template

**Sequencing recommendation.** Build the deck *before* the book chapters. It is cheap, it forces every use case to become concrete enough to draw — which is where hidden ambiguity surfaces — and it is the artifact that will actually be shown to Irancell's leadership. The book then expands what the deck asserts. If a use case cannot be drawn in one screen, it is not yet clear enough to write a chapter about.

---

# 7. Roadmap items accumulated so far

Consolidating what has been assigned to the roadmap across rounds, so nothing is lost when the chapter is written:

- **Phase 0:** Persian agentic evaluation harness · PKI design · model partner selection and contract · Besu plus account-abstraction POC · hardware sourcing workstream
- **Phase 1 (prove):** assistant, bots, contracts, rial wallet via Bank Sina, Irancell self-service, Konkooria; SDK v1; MCP + MCP Apps; contract sharing by link and SMS
- **Phase 2 (scale):** Irancell subscriber rollout · delegation · marketplace and third-party onboarding · pumped intelligence as a product · tiered model routing
- **Phase 3 (open):** in-app user-to-user chat, behind messenger licensing · voice · tokenised assets · third-party contract deployment at elevated tiers · SIM signature at scale
- **Continuous:** Bank Sina modernisation as an independent programme; core replacement on the long horizon

---

# 8. Next step

The architecture is settled. Nothing in this round changed a foundation; it resolved an integration question and closed one technical gap.

**My recommendation: I build the presentation next**, in Persian, as a publishable HTML artifact with the ten use cases drawn. It is the fastest way to make the whole design concrete, it is what you will actually show people, and drawing the use cases will expose any remaining ambiguity before it gets written into thirty-eight chapters.

Then the book, starting with the foundations chapters — the contract, the two intelligences, and the کارپرداز framing.

Say which you want first and I will start.
