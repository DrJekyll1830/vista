# Vista V0.3 — Round 1 Analysis

**Input:** [01-transcription.md](01-transcription.md) — four voice messages, 2026-09-12, 06:11–06:18; the first two form one continuous argument.
**Against:** all 46 Markdown chapters in the current working copy of the Vista book, with supporting inspection of the current SDK, MCP gateway, registry, assistant, and presentation.
**Status:** analysis and recommendations, not an approved specification or an implementation report. The book, presentation, SDK, and application are not changed by this document.
**External research checked:** 2026-09-12. Documentation confirms the existence and advertised behavior of the services below; it does not establish that they are accessible to Vista, approved for its Iranian users, or operational in its deployment.

“The book” here means the Vista book under `vista_docs/book`. Andrew Chen’s *The Cold Start Problem* and Teresa Torres’s *Continuous Discovery Habits* are discussed using the transcript and their authors’ public material, not on the claim that their complete books were supplied or read.

---

## Executive judgment

**The direction is right: borrow existing capabilities first, prove Vista-native transactions with controlled services next, and cultivate new businesses through «داشت». But these are three different mechanisms, not three interchangeable solutions to the same cold-start problem.**

Existing MCP servers can make Vista useful before its native ecosystem is large. Konkooria and Irancell can prove the contract, payment, and distribution model. The bootcamp can create future supply. None of those, alone, proves that an enduring two-sided network exists.

The main recommendations are:

1. **Keep one standard MCP integration path, with an optional Vista Contracts profile.** An ordinary server must not need a Vista manifest, signing key, bot, or contract implementation merely to become usable.
2. **Separate connecting an account from authorizing an action.** OAuth access is neither a Vista login nor a signature on a purchase. A refresh token is not a financial mandate.
3. **Build reusable OAuth and credential custody before expanding the private-data catalog.** The current manually entered bearer-token path is a useful prototype, not the requested login experience.
4. **Use the MCP Registry’s metadata format and API rather than inventing a directory protocol.** Put user installations and Vista’s trust decisions beside those records, not inside public publisher metadata.
5. **Discover automatically; admit and connect with user consent.** Finding a server must not silently install it, authorize it, run its package, or give it private data.
6. **Start the Google pilot with Calendar reading, not Gmail and not automatic scheduling.** Official Google Workspace MCP servers now exist, but the documentation marks them **Developer Preview**. Access, scopes, policy, and deployment eligibility are launch gates.
7. **Make the contract-execution split real.** The transcript places execution outside MCP; the current implementation calls a hidden MCP fulfillment tool. This is a concrete migration, not merely a wording change.
8. **Treat «داشت» as a product venture program with customer access and operating support.** Six months of training and a collection of demos do not themselves create supply that users return to.

Two headline promises need qualification: **“one login everywhere”** and **“phase one depends on no external partner.”** They can remain useful ideas, but not literally unchanged once external identity providers and hosted services are on the first path to value.

---

## 1. What the transcript actually asks for

| # | Request | What it changes or requires |
|---|---|---|
| R1 | Solve the cold start from the hard/supply side: apps and service providers | An explicit supply acquisition strategy, building on book 02-09 rather than introducing a new thesis |
| R2 | Reuse Konkooria and Irancell services | Retain the existing controlled-supply route and its commercial proof |
| R3 | Integrate existing international MCPs first, before those controlled services | Change integration order; validate that total onboarding cost really is lower |
| R4 | Find a concrete initial list: Calendar, Gmail, Wikipedia/research, IMDb, files, and others | A sourced, prioritized catalog, distinguishing hosted servers from deployable code and APIs |
| R5 | Reduce logins and retain authorization for later use | Browser authorization, account linking, refresh, secure storage, revocation, and reconnect UX |
| R6 | Search the user’s own MCP list first, then external directories | A per-user capability index and a bounded discovery pipeline |
| R7 | Reuse existing discovery and publication standards | Standard registry records and APIs, with small, versioned Vista extensions |
| R8 | Separate MCP from the contract-processing standard; expose draft creation through MCP | Two interoperable profiles and an execution boundary outside assistant-facing MCP |
| R9 | Offer integrated login where services trust Vista, respecting mobile-number/OTP conventions | Standards-based federation for willing services, not simulated login to unwilling ones |
| R10 | Run a roughly six-month «داشت» bootcamp and invest in successful products | A separate supply-development program, investment criteria, ownership rules, and budget |
| R11 | Eventually update the book, presentation, and SDK; then integrate international services and Konkooria | A coordinated change map and staged delivery plan, not permission to implement all of it in this analysis round |

**What is already in the book:** the hard side, atomic networks, Konkooria as a starting population, low integration cost, machine-readable specifications, a conformance suite, and a partner test environment. The genuinely new material is the international-first route, OAuth/account lifecycle, registry interoperability, and the bootcamp. The separation of capability access from signed execution already exists conceptually, but the SDK does not implement the exact separation requested here.

## 2. The three supply routes should reinforce one another

### 2.1 Apps are the likely hard side, but count the right thing

Chen’s public chapter describes the hard side as the participants who contribute disproportionate value and are difficult to acquire **and retain**; marketplace suppliers and app-store developers are examples, not a universal rule about everything called a platform. [S1]

For Vista, the working hypothesis is sensible. However, three quantities must stay separate:

- **Reachable capability:** Vista can call an endpoint.
- **Active supplier:** someone maintains a useful service and accepts the obligations of serving Vista users.
- **Network effect:** adding participants increases value for other participants, producing repeat use and attracting further supply.

A Google Calendar connection gives one user utility even if nobody else uses Vista. That is valuable. It is not evidence that Google has joined Vista’s marketplace or that a new developer now has an economic reason to build for it.

Similarly, owning Konkooria solves the initial supplier negotiation; it does not guarantee that its existing users will adopt Vista. The book’s “the hard side is already solved” should be narrowed to **“the first supplier is under our control.”**

### 2.2 Three routes, three jobs

| Route | What it solves | What it does not solve | What to measure |
|---|---|---|---|
| Existing international MCPs | Empty-product problem; immediate utility; interoperability learning | Native merchant supply, local settlement, exclusive differentiation | Successful recurring tasks, connection completion, reconnect frequency, cost per completed task |
| Konkooria and Irancell | Controlled integration, access to a candidate cohort, native contracts and measurable business value | Automatic user adoption or proof of an open ecosystem | Repeat use, repeat signed transactions, task completion, support reduction, supplier operating cost |
| «داشت» | Creation and development of new Vista-native suppliers | Immediate launch inventory or self-sustaining demand for each app | Maintained products with retained users, revenue quality, support burden, post-program survival |

**Recommended narrative:** useful from existing services; commercially validated through controlled services; expanded through new suppliers.

### 2.3 Choose an initial recurring job, not a miscellaneous app collection

A small catalog spanning email, movies, coding, banking, and education can be technically impressive and still be incomplete for every user.

A plausible first hypothesis is **learning and research planning for a deliberately recruited subset of students or educators**:

1. Read upcoming events from a connected calendar.
2. Search public sources and selected learning documents.
3. Produce a study or research plan with citations.
4. Later connect the plan to Konkooria’s actual courses and enrollment contracts.

This keeps the international-first implementation order without abandoning the book’s education entry point. It remains a hypothesis: confirm account usage, needs, and willingness to connect data through interviews. Do not assume that Konkooria’s entire population uses Google Calendar or that the bootcamp’s technically comfortable participants represent ordinary consumers.

Maintain separate cohort evidence for productivity users, Konkooria users, and Irancell service users. A successful technical pilot is not yet the atomic network.

### 2.4 “Fastest” must include everything required for the second use

Compare:

> **Integration cost = protocol work + account/consent work + hosting + security and policy clearance + operations + support.**

A public hosted MCP may be almost entirely protocol work. Gmail can add restricted-scope verification and assessment. A community connector may need a secure multi-user deployment. An owned service may require more initial code but less external approval.

Follow the proposed international-first route, but time-box feasibility work by deliverable and use an explicit fallback if a provider cannot admit Vista. Do not make one preview service a blocking dependency for the whole product.

## 3. Standards: two integration profiles, not a new MCP dialect

### 3.1 What should be reused

| Concern | Existing basis | Recommendation and limit |
|---|---|---|
| Calling capabilities | MCP, including initialization, capability negotiation, tool schemas and results | Use standard SDKs and publish a tested protocol/transport matrix; do not assume a dependency version proves compatibility |
| Remote authorization | MCP HTTP authorization, OAuth, Protected Resource Metadata, authorization-server discovery, resource binding, PKCE | Adopt the standard flow; keep provider-specific differences in integration configuration [S3], [S4] |
| Login identity | OpenID Connect, where supported | Use for “who signed in”; access tokens authorize resources, ID tokens identify a login [S7] |
| Discovery and publication | MCP Registry `server.json` and Generic Registry API | Reuse as the directory contract; the official registry remains in preview [S5], [S6], [S6b] |
| Interactive UI | MCP Apps | Optional extension; a plain MCP server need not supply UI [S10] |
| Describing Vista’s execution API | OpenAPI and JSON Schema | Document requests, outcomes, and versioning with existing tooling |
| Signed envelopes and key discovery | JOSE/JWS, JWK/JWKS; evaluate JSON Canonicalization Scheme for canonical data | Reuse standard formats where suitable; do not silently reinterpret existing signatures |
| Agentic checkout/payment authorization | AP2 and UCP’s AP2 integration | Perform a fit/gap review before claiming nothing relevant exists [S11], [S12] |
| General Vista contracts | Vista-specific semantics where existing specifications do not cover the requirements | Retain multiparty terms, nonfinancial permissions, local signature rungs, lifecycle, and settlement rules that actually need Vista definitions |

The MCP authorization revision examined is **2026-07-28**. It recommends Client ID Metadata Documents and retains Dynamic Client Registration as a deprecated compatibility path. Existing pre-registered client information takes priority; otherwise use advertised support. Google’s documented setup uses pre-registered OAuth client credentials. Do not require every provider to support dynamic registration. [S3], [S4]

The registry format, MCP protocol revision, OAuth support, MCP Apps revision, and Vista contract version are separate compatibility axes. “V0.3” is this project’s document/version label, not a replacement version for all of them.

### 3.2 Profile A — ordinary MCP

A server provides standard MCP capabilities. It may require OAuth, an API key, or no authentication. Vista can list it, connect it, invoke supported tools, display results, and provide a basic app page.

It does **not** need to:

- understand `vista://manifest` or `_meta.vista`;
- sign a Vista contract;
- implement a notification bot or mini-app;
- accept Vista-issued user identity;
- become a verified financial counterparty.

The Vista-side connection record supplies local presentation and admission policy. This is the compatibility test that matters: **an unmodified standard server remains usable without implementing Vista-specific resources.**

That promise does not mean every optional MCP feature is enabled, every transport is supported, or every advertised tool is appropriate for Vista.

### 3.3 Profile B — MCP plus Vista Contracts

A native partner implements the same MCP base and adds a versioned contract profile:

- MCP tools for obtaining quotes, creating drafts, completing drafts, and obtaining app-signed final proposals;
- standard MCP results carrying a recognizable, schema-validated Vista envelope;
- contract metadata and trusted signing-key information;
- a separately authenticated execution interface and signed lifecycle events;
- optional Vista identity federation and UI integration.

An ordinary client can still call the MCP tools and read their outputs. It will not automatically know how to render, sign, or execute a Vista contract. Protocol compatibility must not be presented as full semantic compatibility.

**The same machinery serves Calendar and Konkooria; the supported profiles differ.** We should not force Calendar to implement contracts so that we can read events, nor pretend that an ordinary Calendar result is a signed commercial offer.

### 3.4 Who signs when the upstream service is unaware of Vista?

A subtle consequence of accepting unmodified servers is that Google or a community MCP publisher has not signed Vista’s installation contract.

For a plain connector, Vista can issue a **connection/permission agreement about Vista’s own access**, recording which server and account the user connects. It must identify the actual party making those promises. It is not a contract signed by Google.

Likewise, if a Vista-operated adapter later builds a contract around an upstream action, the adapter’s operator signs its own commitment. It must not impersonate the upstream service or display its brand as evidence that the upstream service accepted Vista’s terms.

This is a real qualification to “the app always signs first” and to the rule about when Vista is a named party: distinguish a native app’s commercial contract from Vista’s agreement to operate a connection.

### 3.5 Drafts stay on MCP; execution leaves it

The requested flow is:

```text
Assistant -> ordinary MCP tools -> data
Assistant -> contract-building MCP tools -> unsigned draft
                                            |
                                  complete required terms
                                            |
                                  app-signed final proposal
                                            v
                                  Vista trusted contract UI
                                            |
                                      user authorization
                                            v
                               deterministic contract processor
                                            |
                                 separate execution interface
                                            v
                                     native service
                                            |
                                      signed events
```

Creating or completing a draft must not execute the business action. An unsigned draft has no signature rung and no financial authority. Completing it produces an app-signed proposal; changing signed terms requires a new version and fresh signatures. Calls need explicit schemas and retry behavior, not guessed intent from tool names.

The current SDK documents a hidden `vista_fulfil` MCP tool, and `app/server/src/index.ts` calls it with `allowHidden: true`. Hiding a tool from the model is not the same as putting execution outside MCP. **Recommend the separate execution API requested in the transcript**, with its own processor credential/audience, contract-hash binding, expiry, replay protection, and idempotency rules. If migration is deferred, label the old MCP fulfillment route as legacy rather than saying the new boundary already exists.

Also, generic MCP writes do not disappear: the separate route applies to **Vista contract execution**, not to every operation performed by every external server.

### 3.6 Do not overlook AP2/UCP or casually replace Vista with them

The book currently says there is no suitable external standard for the settlement layer. That is too broad to retain without qualification. AP2 now documents signed checkout/payment mandates, a non-agentic trusted consent surface, direct and autonomous modes, and dispute evidence. UCP documents a negotiated AP2 integration. [S11], [S12]

Those overlap with Vista’s signed terms and deterministic authorization, but they do not automatically specify Vista’s general permission contracts, Iranian signature ladder, banking arrangements, or all multiparty workflows. Their delegation assumptions also need comparison with Vista’s prohibition on sub-delegation.

**Recommendation:** make a field-by-field compatibility assessment part of the contract-profile design. Reuse applicable semantics and cryptographic formats; document genuine gaps. Do not make implementing an international payment network a prerequisite for a read-only Calendar pilot, and do not declare AP2 compatibility on conceptual resemblance alone.

## 4. Authentication: three different permissions, three practical service modes

### 4.1 Distinguish the three permissions

| Question | Mechanism | Not equivalent to |
|---|---|---|
| Who is using Vista? | Vista login/session, initially mobile number and OTP | Ownership of a Google, Notion, or existing local-service account |
| May Vista access this external account? | Provider OAuth grant, scoped token, or a service-specific linking arrangement | A signed purchase or authority to spend Vista funds |
| May this particular Vista action execute? | Signed contract and the processor’s checks | Merely having a valid OAuth token |

A long-lived provider grant may authorize background access technically. It must not silently enable Vista’s future autonomous-assistant feature or bring delegated signing forward from phase two.

### 4.2 The three modes

**Public service.** No account or token is necessary for the requested operation. Public Wikipedia reading is the obvious example; do not add a login just because some Wikipedia operations have accounts. Platform-paid search may still require a server-held API key and a usage budget, even though the end user sees no login.

**External account.** Open the provider’s authorization page in a trusted browser flow. Vista receives a grant and uses it for subsequent requests. Vista’s mobile OTP cannot substitute for Google’s account authorization.

**Vista-federated service.** A willing partner trusts Vista as an identity/authorization issuer, using OIDC/OAuth and an explicit trust arrangement. The user can reuse an existing Vista session; the partner still enforces its own access rules. This is where “ورود با ویستا” belongs.

OTP is a method used at the identity provider, not an alternative to OAuth/OIDC. A cooperating Iranian service can preserve its familiar phone-number UX while adopting standard federation underneath.

### 4.3 Existing accounts need a linking policy

Knowing a phone number is not sufficient to take over a pre-existing account with the same number. Numbers can be reassigned, accounts can be shared, and providers may have different assurance requirements.

For a new partner account, use just-in-time provisioning from a trusted assertion if the agreement permits it. For an existing account, require either a documented federation-based mapping that the partner accepts or a one-time proof through the partner’s approved account-linking flow. Financial KYC remains a separate requirement.

Use stable internal subjects and, where appropriate, pairwise partner identifiers. The mobile number is a verified attribute, not the permanent database key. The current `user_ref` derived from the same user ID across apps should not be described as a pairwise identifier.

### 4.4 How to reduce login friction without weakening consent

- Reuse the provider’s browser session, rather than asking for its password inside Vista.
- Persist the provider grant securely and refresh access tokens when permitted.
- Use one correctly registered Google integration where appropriate, with incremental scopes for the features the user chooses. Do not ask for Gmail, Drive, Calendar, and Contacts together merely to avoid a possible later screen.
- Offer an explicit bundle when a user deliberately selects a workflow that needs several services. Reuse the grant only where the issuer, client, scopes, resource audience, and provider policy allow it.
- Support multiple accounts with visible selection: work Calendar and personal Calendar must not be silently merged.
- For cooperating local services, reuse the Vista session through federation. Additional consent or assurance may still be necessary.
- Make “needs reconnect” actionable at the moment the affected capability is needed, without turning every app opening into a login prompt.

**Shared browser login is not shared authorization.** Two MCP servers using Google upstream may have different operators, OAuth clients, and token audiences. They cannot be given each other’s tokens merely because both say “Google.”

A more accurate book sentence would be:

> **کاربر یک بار وارد ویستا می‌شود. سرویس‌هایی که هویت ویستا را می‌پذیرند از همان ورود استفاده می‌کنند؛ حساب‌های بیرونی یک بار با رضایت کاربر متصل می‌شوند و تا وقتی مجوزشان معتبر است، به ورود دوباره نیاز ندارند.**

## 5. Token custody and authorization lifecycle

### 5.1 Recommended architecture

Use a **server-side authorization broker and encrypted credential store**, owned logically by Vista’s identity/permissions layer. It may reuse infrastructure operated by YellowHub, but user consent decisions and credential-access policy need an explicit Vista owner.

```text
User -> Vista connection screen -> provider browser authorization
                                      |
                               callback + code + state
                                      v
                           Vista authorization broker
                                      |
                           encrypted credential store
                                      |
                   scoped credential for a specific connection
                                      v
                             MCP transport -> server
```

The assistant receives connection status and usable capabilities, never access tokens, refresh tokens, passwords, OTPs, client secrets, or callback codes. Browser code should normally receive only the Vista session and nonsecret connection state; provider credentials stay on the backend.

For an external MCP that itself proxies Google, there are two authorization hops. Vista stores the credential intended for that MCP. The MCP operator handles its own Google grant. **Do not implement arbitrary token pass-through.** MCP’s authorization rules require tokens intended for the receiving resource. [S3]

### 5.2 Store grants, connections, and audit evidence separately

A single `credential` string on an install row is not enough.

| Record | Minimum meaning |
|---|---|
| Provider grant | Vista user, provider/issuer, OAuth client registration, external account identifier, granted scopes, grant status, relevant expiry |
| Secret material | Encrypted access/refresh token, encryption key version, token type, expiry, refresh-generation/version; never public metadata |
| MCP connection | User, server identity, selected account/grant, canonical endpoint/resource audience, enabled features, installation/consent reference |
| Consent evidence | Who approved what, which operator and destination were displayed, requested versus granted scopes, policy version, timestamp, outcome |
| Runtime state | Last successful use, authorization error category, reconnect requirement, revocation state; not raw provider response bodies |

Use established secret-management infrastructure, least-privilege service access, encryption in backups, and audit of secret access. No raw tokens in logs, URLs, chats, registry records, skills, YAML examples, or the append-only contract ledger.

The ledger records evidence about authorization; it is not the credential store. Deleting a revoked secret and retaining legally required consent evidence are different operations.

### 5.3 Lifecycle rules

1. Begin authorization only for a user-approved connection and endpoint. Bind single-use `state` and PKCE to the session, issuer, connection, environment, and intended return flow; validate the callback and issuer before linking.
2. Request the minimum scopes for the selected feature and record the scopes actually granted. A partial grant enables only the features it covers.
3. Use the access token until its expiry requires refresh. A connection is not “permanent” because a token was once received.
4. Refresh under a per-grant lock; replace rotated refresh tokens atomically. If a successful refresh omits a new refresh token, preserve the existing one rather than overwriting it with an empty value.
5. On permanent revocation or `invalid_grant`, stop retrying and mark the connection as needing reconnection. On transient failure, use bounded retries without prompting for broader access.
6. On user removal/revocation, immediately deny new Vista calls and invalidate cached connections. Revoke upstream and delete the applicable credentials where supported; report a pending upstream revocation honestly if the provider is unavailable.
7. A grant shared by several explicitly connected Google services needs dependency-aware unlinking. Removing Calendar must stop Calendar access immediately without silently disconnecting Gmail; “disconnect Google account” should explain that it affects all linked services. Reduce upstream authority where supported, and do not promise per-service revocation if the provider only revokes the whole grant.
8. A revoked connection must not be restored by a late refresh response or an already queued job. Use connection/grant generations for those checks. Removal cannot undo an action already accepted by the provider.

Request renewable access using the provider’s documented mechanism. Google’s web-server flow uses `access_type=offline`; an OIDC/MCP authorization server may advertise `offline_access`. These are not interchangeable universal settings, and the authorization server may decline to issue a refresh token. Do not force a fresh consent screen on every connection attempt. [S3], [S8b]

**Google-specific caution:** an external OAuth app in “Testing” generally receives refresh tokens that expire after seven days, except for the documented identity-only scope exception. Revocation, inactivity, account changes, token limits, and administrator policies can also invalidate tokens. A recurring weekly login in a prototype may be provider test-mode behavior, not a broken cache. [S8]

“Keep the login longer” therefore means **correct refresh and reconnect handling within provider policy**, not changing expiry or keeping sessions alive indefinitely against the user’s expectations.

### 5.4 Login evidence is not an upstream contract signature

Record the connection agreement and the outcome of the provider consent flow. Do not claim that the provider’s token proves it signed the human-readable Vista agreement, or that Vista has a cryptographically signed copy of the provider’s consent screen.

For federated native apps, the standard access token/assertion can carry appropriate identity and scopes. Execution still requires a separate signed contract and processor authorization. A broad “logged-in user” token must not become an execution credential.

## 6. Discovery: standard catalog, private installation overlay

### 6.1 Reuse the existing directory interface

The official MCP Registry publishes standardized server metadata and a REST discovery interface. Its Generic Registry API includes paginated listing and version lookup under `/v0.1/servers`; it is not itself the same thing as an MCP server exposing `tools/list`. [S5], [S6], [S6b]

Vista should act as a **downstream catalog/aggregator**:

- ingest standard records from approved sources;
- preserve source identity, server name, version, package/remote location, and provenance;
- implement the relevant read-only Generic Registry API surface for Vista’s catalog;
- add a Vista search index for Persian descriptions, synonyms, and task categories;
- expose that search to the assistant as an ordinary Vista tool.

The registry documentation explicitly expects downstream aggregation and notes that the official implementation is not a supported self-hosted product. Reuse the specification; do not assume cloning the public registry gives Vista a supported private deployment.

There is no need to invent a “registry MCP protocol.” A small MCP-facing search tool can wrap a standard registry API. Nor should we assume there is one universal directory of all directories: maintain an operator-approved list of registry sources.

### 6.2 Keep three layers distinct

| Layer | Contains | Visibility |
|---|---|---|
| Publisher metadata | Standard `server.json`, locations, versions, publisher-supplied extensions | Public or appropriately private registry |
| Vista catalog assessment | Approved deployment, policy/region eligibility, health, review status, commercial verification, supported Vista profile | Vista-controlled metadata |
| User installation | Connected account, consent, permitted scopes, preferences, credentials reference | Private to that user and authorized platform services |

For the official registry, custom publisher metadata belongs inside `io.modelcontextprotocol.registry/publisher-provided` in `_meta`. Place a small, namespaced Vista contract-profile advertisement there when publishing through that registry. Do not add arbitrary top-level Vista fields or publish secrets. [S6]

A native server may continue serving `vista://manifest` as an optional runtime extension during migration. Avoid two conflicting sources of truth: derive duplicate fields from one definition and validate consistency.

Publisher assertions such as “supports Vista Contracts” are not Vista verification. Namespace ownership, protocol compatibility, deployment review, and financial verification are separate facts. A community “Gmail MCP” must not inherit Google’s identity or a Vista financial badge.

### 6.3 Search and connection sequence

1. **Search the user’s installed capabilities first**, filtered by the selected account, granted scopes, feature support, connection status, and task suitability.
2. If insufficient, search Vista’s curated catalog, including its synchronized external records.
3. If still insufficient, query approved external registry sources through the discovery service. Return a bounded candidate list, not an unbounded recursive crawl.
4. Resolve the chosen candidate’s provenance, endpoint/transport, authentication requirements, costs, data destination, and supported profile.
5. Present the proposed connection and its operator to the user. New-app admission and additional authority require explicit user action, even for a user who later has an assistant mandate.
6. Complete authorization where needed; discover the authorized tools and enable only the supported feature set.
7. Add the resulting connection to the user’s index and resume the task. Subsequent tasks start there, without rediscovering or reconnecting it unnecessarily.

Discovery must not require sending the whole user request externally. Search for “public academic research” rather than a private draft, medical condition, calendar entry, or account information.

There is also a distinction between fetching public metadata/performing a safe protocol handshake and invoking a business tool. The former may support admission; the latter must not run merely because a search result was found.

### 6.4 Registry trust does not equal execution permission

Initial external discovery should be **remote-endpoint discovery**, not automatic execution of `npx`, Python, or Docker instructions found in metadata. A package-only entry goes into an operator deployment/review queue. Prefer pinned reviewed versions for deployments Vista operates; hosted upstream servers require monitoring for capability changes because their implementation cannot necessarily be pinned by Vista.

Validate outbound destinations, including metadata and OAuth URLs: restrict schemes, block private/link-local/metadata-service destinations by default, recheck redirects and resolved addresses, and isolate any explicitly permitted internal integration. Treat descriptions and tool results as untrusted data, not setup commands.

New tools, changed scopes, a changed issuer, or a changed endpoint should trigger reassessment; they must not silently expand a previously approved connection.

## 7. A concrete initial catalog

“Default” should mean **available in the curated catalog**, not already connected to private data and not promoted into the six exempt system apps.

### 7.1 What is already seeded

The current `app/server/src/gateway/registry.ts` seeds four ordinary international MCP entries: **GitHub, DeepWiki, Hugging Face, and Cloudflare Docs**. They are not proof of successful live integrations; that requires deployment tests. Konkooria is not in this seed list, and the Irancell reference app is explicitly a simulation.

The seeded ratings/reviews are hard-coded examples. They must not be used as evidence of adoption, provider quality, or the success of the cold-start strategy.

### 7.2 Recommended shortlist and order

| Candidate | Provenance and deployment | Login/cost model | Recommendation and limit |
|---|---|---|---|
| **Google Calendar** | Official Google-hosted MCP, Developer Preview [S13], [S14] | Google OAuth; project/API enablement and access eligibility | First private-account pilot: calendar/event reading and availability. Test Persian date interpretation, timezone, all-day and recurring events. No write promise in the initial acceptance criterion. |
| **Google Drive / Docs** | Official Google-hosted MCPs, Developer Preview [S13] | Google OAuth; scopes depend on the selected feature | Next for user-selected study/research documents. Do not request whole-drive access where a narrower supported workflow suffices. Verify actual MCP tool support for those scopes. |
| **Gmail** | Official Google-hosted MCP, Developer Preview [S13] | OAuth; reading and draft scopes are restricted [S9] | High utility, but gated behind policy and security-assessment feasibility. Start with reading; add draft creation only deliberately. Do not treat sending as equivalent to drafting. |
| **Wikipedia / Wikidata** | Community `wiki-mcp` implementation with documented public search/read tools [S15] | No user login for public reads | Useful general-research candidate, subject to code/license review and operator deployment. This is deployable code, not a verified Wikimedia-hosted remote MCP. |
| **Web search** | Brave’s official MCP implementation, or Tavily’s hosted MCP [S16], [S17] | Platform-paid API key/budget, or supported user authorization | Select one for the pilot rather than both. Brave’s HTTP deployment needs access protection; for Tavily use supported header/OAuth auth rather than secrets in URLs. |
| **User-provided files** | Vista-managed uploads/storage, or connected Drive | Vista consent and file selection | Needed for research utility, but not an already validated universal file MCP. A server-side filesystem connector sees the server’s files, not arbitrary files on a user’s phone. |
| **Notion** | Official Notion-hosted remote MCP [S18] | OAuth; workspace permissions apply | Good optional productivity pilot. Enable an explicitly supported read/edit set; Notion content availability alone does not make every write safe. |
| **GitHub** | Official hosted MCP; already seeded [S19] | OAuth supported; current Vista seed asks for a PAT | Keep for developers/bootcamp. Prefer OAuth and provider-supported read-only configuration for the initial rollout. |
| **DeepWiki** | Official hosted public-repository service; already seeded [S20] | No user authentication for public repository documentation | Low-friction interoperability smoke test, useful for bootcamp participants, not a general encyclopedia replacement. |
| **Hugging Face Hub** | Official hosted MCP; already seeded [S21] | Public/authorized feature sets; documented OAuth/token options | Keep optional for technical research. Do not automatically enable community tools, inference, or resource-creation features with separate costs/risks. |
| **Cloudflare Docs** | Official documentation MCP; already seeded [S22] | Validate the documentation endpoint’s current access behavior | Technical catalog entry. Do not confuse it with Cloudflare’s general API/code-execution MCP. |
| **IMDb** | Official developer material documents licensed GraphQL/data products, not an official ready-to-use MCP found in this research [S23] | Commercial data access and deployment eligibility need checking | Defer from the launch dependency list. A community wrapper does not supply commercial data rights; “free IMDb MCP” is not a verified assumption. |

This is a shortlist, not a claim to enumerate all MCP servers. The actual initial user-facing bundle should be much smaller: **Calendar + selected documents + one public research/search source**, with technical connectors remaining optional.

### 7.3 Calendar fallback and the limits of the Google assumption

The Google documentation now confirms the official MCP route. It also introduces gates: Developer Preview enrollment, Cloud project configuration, OAuth setup, permitted use, and security requirements. The Calendar setup lists read scopes while its tool reference also advertises write operations; validate the exact scopes and tools on the admitted deployment instead of extrapolating a full scheduling feature from the overview.

If official access is unavailable, `nspady/google-calendar-mcp` is an existing community candidate with OAuth and HTTP-deployment documentation. [S24] Its multi-account support does **not** prove multi-tenant isolation. Its documentation also includes broad calendar scopes. Review deployment authentication, token custody, per-user isolation, and minimum scopes before considering it a hosted fallback.

If that review fails, a small Vista-operated Calendar API adapter is a possible engineering fallback—but then the honest statement is **“we reused Google’s API and built an adapter,”** not “we added an existing MCP without work.” None of these routes should be used to evade provider restrictions.

### 7.4 Google policy is part of integration cost

Gmail `readonly` and `compose` scopes are restricted; `compose` authorizes draft management **and sending**, even if a particular MCP currently exposes only a draft tool. A hosted Vista data path may require verification and an annual security assessment unless an exception applies. [S9], [S9b]

Google’s Workspace MCP security guidance requires screening prompts/responses for malicious content or prompt injection, using Model Armor or a documented alternative. It also warns that enabled payload logging can expose sensitive content. [S25]

The Workspace user-data policy restricts use of its data for generalized model training. That must constrain both Vista’s model-provider contracts and any later Persian fine-tuning/data program; OAuth consent is not blanket permission to train on users’ email. It also prohibits using that data for ad targeting or creditworthiness/lending purposes, which matters directly to Vista’s sponsored-placement and banking ambitions. Keep those uses outside the connected-data path. [S26]

These requirements are reasons to start with a narrow use case and validate eligibility early, not reasons to claim that every international connector is blocked or available.

## 8. What changes in the security argument

Keep this short in the book and precise in the SDK, consistent with the previous round’s preference not to overload the narrative with light-write policy.

### 8.1 Preserve the actual invariants

- The model never receives the user’s signing key, provider credentials, or processor credential.
- Vista money moves only through the signed-contract processor under the applicable bank/payment rules.
- A new connection, new consent, or greater authority is not created by model choice alone.
- External data can inform a response but cannot confer authority or rewrite execution policy.
- Removing an app blocks subsequent Vista use of that connection.

### 8.2 Narrow the promises that are no longer true

**“Reading is free” means no repeated transaction-signing ceremony after authorized connection.** It does not mean public access to private mail, zero API cost, or zero privacy risk.

**“The assistant cannot write” is already too broad under V0.2’s light-write decision.** Reusing ordinary MCPs makes the distinction more important. Keep the absence of signature/execution authority precise, not an absolute claim that no external state can change.

**“MCP cannot reach money” is a statement about Vista’s wallet boundary.** A third-party connector can have upstream billing authority, consume paid quotas, or call an externally funded account. Default admission must not include arbitrary payment, cloud-provisioning, or subscription-purchase tools just because they cannot call Vista’s wallet.

**A tool annotation is a hint, not proof.** The current fallback classifies tools using annotations and name prefixes. That can misread namespaced tools and cannot establish that an untrusted endpoint is read-only. Use reviewed feature sets and upstream least-privilege authorization for the initial catalog; retain the established app-developer responsibility for native light-write classification rather than silently replacing that product decision.

**An SDK extension can expose more authority than Vista wants.** MCP Apps has host-communication features; core MCP also has optional server-requested capabilities. Negotiate only what Vista supports. Do not turn server-originated context updates or requests into instructions with user authority, and do not enable cross-app actions merely because an extension can express them.

### 8.3 A basic UI is not automatic full MCP Apps support

A plain server can provide a schema-driven form and readable tool results. MCP Apps additionally needs UI-resource discovery, sandboxing, a host bridge, and permission handling. The existing `mini_app_url` plus query-string token is a custom mini-app mechanism, not proof of MCP Apps interoperability. [S10]

The “works without the assistant” promise therefore needs a tested direct path for each launch feature. A generic JSON form may be an acceptable initial fallback; a fully usable provider-specific interface is not generated automatically from every tool schema.

## 9. Current SDK/application gaps that affect V0.3

These observations describe the working tree, including its existing local changes. They are not a full security audit and do not assert that a production deployment has these exact behaviors.

| Area | What exists | V0.3 consequence |
|---|---|---|
| Generic MCP | `gateway/mcp.ts` already connects without requiring a Vista manifest, using Streamable HTTP and a legacy SSE fallback | Extend this base; do not build a parallel Google-only gateway. Test negotiated versions and do not confuse authorization failure with transport incompatibility. |
| Account authorization | `routes/api.ts` writes a supplied string to `installs.credential`; `headersFor` attaches it to requests | No OAuth callback/refresh lifecycle was found in the inspected source. Add the broker and encrypted grant model before real private-account onboarding. |
| Connection isolation | The MCP connection cache key uses app ID plus the last six characters of a credential | Replace with a nonsecret, collision-resistant connection identity scoped to user, account, resource, environment, and grant generation. Token rotation/revocation must invalidate sessions. |
| Tool and health state | Probe results and health are stored on the global app record | Separate deployment health from per-user authorization and account-specific tool availability. One user’s expired grant must not gray out the service for everyone. |
| Search | `vista_showcase_search` does substring matching against the local catalog; installed tools are loaded together | Add installed-first retrieval and registry ingestion/search. Do not inject an ever-growing global catalog into every model request. |
| Credentials for plain MCP | `contextFor` supplies Vista user identifiers/assertions on ordinary calls too | Keep Vista context optional and native-profile-only; standard external servers should receive only the identity/data they actually need. |
| Fulfillment | `index.ts` invokes the hidden fulfillment MCP tool using the same call helper | Migrate to the separate execution interface if the transcript’s requested boundary is adopted. |
| Drafts | SDK `reference/contract.md` recognizes drafts but says completing them is not implemented | Define and test creation, completion, finalization, expiry, and version behavior rather than advertising draft round trips prematurely. |
| Manifest identity | `reference/manifest.md` describes generated IDs for URL-added apps; current `routes/api.ts` also attempts adoption of `manifest.id` | Reconcile published SDK instructions with current behavior and define how registry identity, runtime app identity, and key ownership bind together. |
| UI | SDK documents a custom iframe URL/token pattern | Separate legacy mini-app support from negotiated MCP Apps support; keep OAuth outside an untrusted mini-app. |
| Contract/phase documentation | SDK includes delegation and funded-wallet examples; book puts these in phase two | Publish an environment/feature matrix. Examples and conformance results must not imply earlier production availability. |

### 9.1 What the SDK should contain after approval

Keep one documented entry point with clearly separated modules:

1. **Ordinary MCP quickstart:** transports, authorization modes, result handling, standard publication, connection testing; no contract requirements.
2. **Vista Contracts profile:** schemas, optional discovery metadata, draft/final distinction, exact signature coverage, trust/key rotation, execution and event interfaces.
3. **Identity guide:** external OAuth, Vista federation, phone/OTP assurance, account linking, consent and revocation.
4. **Discovery guide:** `server.json`, publisher extensions, registry submission, stable identities, private versus public metadata.
5. **UI guide:** generic fallback, MCP Apps, legacy mini-app migration, trusted signing surface.
6. **Existing light-write guidance**, with a few concrete Calendar/Gmail/document examples rather than a new approval ritual for every edit.
7. **Machine-readable schemas and examples:** JSON Schema/OpenAPI; YAML may be an authoring format, but publishing still uses the standard format required by the destination.
8. **Coding-agent skill and reference implementations**, derived from the same specification rather than a second informal standard.
9. **Profile-specific conformance tests:** a plain MCP must be able to pass the plain profile without implementing contracts; native apps run the additional contract tests.

The SDK is already a documentation/skill/example/test bundle in `vista_docs/SDK/vista-app`. This is a restructuring and completion task, not creation from nothing. Keep the specification usable by different coding assistants; a particular agent’s installation convention is not part of Vista’s wire protocol.

## 10. «داشت»: a supply-development program, not a launch prerequisite

### 10.1 What is strong about the idea

The program targets people who can own a product, not merely implement an endpoint. Vista supplies reusable infrastructure—identity, discovery, consent, contracts, payments where available, and an assistant-facing channel—so a team can focus on a customer problem.

This directly addresses the integration-cost chapter, but extends it: **reduce the cost of operating a useful business on Vista, not only the cost of connecting code.**

The referenced author is **Teresa Torres**, and the book is *Continuous Discovery Habits*. Her public material emphasizes a desired outcome, continuous customer contact, discovering opportunities, testing assumptions, and opportunity-solution trees. [S2]

### 10.2 Suggested structure for the proposed six-month program

This is a curriculum proposal based on the duration in the transcript, not a commitment or estimate for delivery of the platform.

| Stage | Work | Evidence required to continue |
|---|---|---|
| Entry and problem discovery | Recruit small teams with product, design, and engineering coverage; pick a reachable cohort and problem | Access to target users, concrete problem stories, a measurable outcome |
| Early experiments | Weekly customer contact; map opportunities; test risky assumptions with prototypes or manual service | Evidence of actual behavior, not just positive interview reactions |
| First usable app | Build the smallest useful workflow with the SDK; instrument use; run in the correct environment | End-to-end task completion and conformance, not only a presentation |
| Retention and operations | Continue discovery while improving delivery, support, reliability, onboarding, and economics | Repeated voluntary use and a team capable of maintaining the service |
| Investment review | Compare outcomes, unit economics, team ownership, risks, and future fit | A maintainable business case with genuine users/revenue, not a promise based on demo-day enthusiasm |

Discovery continues through every stage. Do not teach discovery for several months and postpone contact with delivery until the end.

Provide user recruitment, mentors, capped infrastructure credits, support escalation, a usable test environment, and clear feature availability. Beginners should not be expected to invent their own financial security or rely on unreleased platform features.

### 10.3 Investment and operating rules need to precede recruitment

Decide who owns the program and investment decisions: the super-app product line, YellowTech, or the investment organization. The book describes product lines under YellowTech; the transcript’s “under the super-app company” should not silently establish a new legal entity.

Publish rules for IP, team equity, stipends or fees, investment terms, data responsibility, maintenance, and what happens when a team does not receive investment. Do not imply every graduate will receive funding or employment.

Evaluate **retained users, net revenue after refunds/subsidies, contribution margin after model/provider costs, reliability, and unresolved support/dispute burden**. Registered users and gross transaction volume alone are insufficient. Separate participants’ own/test usage from external customer traction.

There is also a tension with the book’s “we do not compete with services.” If Vista funds apps in the same categories as independent partners, it has an ownership interest in their success. Preserve open distribution terms, disclose affiliated apps, and ensure ownership does not buy the assistant’s recommendation. The existing “do not sell the answer” principle should also apply to portfolio companies.

### 10.4 The P2P international-payment example is not the easiest first project

The proposed flow—request, offers in toman, selection, fulfillment, buyer confirmation, commission, release of funds—illustrates Vista’s contract model well. It is also **a second two-sided marketplace inside the first**, with its own hard side and liquidity problem.

Its design must answer:

- Who is the seller, who provides the foreign service, and who is actually the financial counterparty?
- Who may hold/release funds, under which banking and legal arrangement?
- What proves delivery if the buyer does not respond, or disputes it?
- What happens after seller failure, cancellation, price changes, fraud, or chargeback?
- Which providers’ terms, cross-border rules, sanctions/export restrictions, consumer-protection rules, and AML/KYC duties apply?
- How is delivery performed without exchanging the buyer’s passwords, OTPs, or payment credentials?

The current contract SDK’s `wallet.pay` pays the app identified by `app_id`, and its `on_delivery` path uses an app-delivery event. That is not already a general escrow system paying a selected individual only after buyer confirmation. Nor should paying through a verified intermediary erase the signature policy associated with money ultimately reaching another person.

Keep this example as a **gated venture hypothesis**, not a promised launch app. Begin any prototype with simulated money and independent legal/compliance review before real transactions. The transcript’s claim that no equivalent exists in Iran remains unverified and should not be repeated as a market fact.

For earlier bootcamp projects, prefer needs that can be met without a new marketplace or new financial rail: study planning, educational document organization, research assistance, or a service workflow for an already operating provider. Teams can still propose their own ideas, but selection should be based on customer evidence rather than novelty alone.

## 11. Sequence and acceptance gates

**V0.3 is not “phase three.”** Keep document versions separate from the book’s commercial phases. Reordering integrations does not automatically bring forward funded wallets, delegated signing, SIM signatures, or open marketplace operation.

| Step | Deliverable | Gate |
|---|---|---|
| A — Approve the shape | Plain MCP profile, optional contract profile, identity/consent distinction, initial cohort | No mandatory Vista extension for ordinary servers; clear financial/execution boundary |
| B — Confirm a narrow international route | Existing public connector smoke test and Calendar feasibility assessment | Valid deployment access, provider policy and scopes understood, fallbacks explicit |
| C — Prove connection reuse | OAuth broker, protected storage, connected-account UI, direct tool fallback | Two isolated users; expiry/refresh; denial; partial scopes; revocation; reconnect; no secrets in model context/logs |
| D — Make the selected workflow useful | Calendar + selected documents + public research/search | Repeated successful tasks for the chosen cohort, acceptable latency/cost, measured connection friction |
| E — Add bounded discovery | Standard registry ingestion and installed-first search | Correct provenance, safe admission, no automatic code installation or authority expansion |
| F — Prove native contracts | Contract-profile update and Konkooria/Irancell integration | A real native task from draft to signed terms, authorized execution, outcome, and support; payments only on approved rails |
| G — Grow supply through «داشت» | Small cohort using a stable SDK and real customer access | Maintenance and traction evidence before larger recruitment/investment |

Basic curated lookup is needed at the beginning. Open-ended external discovery is not required to make the first Calendar workflow useful and should not delay it. Bootcamp design can proceed in parallel, but its production exercises require the relevant stable platform features.

### Acceptance scenarios worth writing before implementation

- An unmodified, non-Vista MCP works without `vista://manifest`; a server with no UI still has a usable direct path.
- A user connects Calendar, returns later, and completes a read after access-token refresh without reentering credentials when the provider allows it.
- Two Vista users using the same MCP never share accounts, tokens, sessions, private tool results, or authorization-dependent tool lists.
- Partial consent limits features; requesting one new feature does not silently grant unrelated scopes.
- Removing a connection stops subsequent calls, including cached/queued ones; a late refresh cannot resurrect it.
- An installed suitable capability is found before an external candidate; a new candidate is not invoked on private data before consent.
- A package-only registry result is not executed automatically; a private-network destination is rejected unless explicitly admitted under separate policy.
- A native draft has no signature or business effect; finalization creates the signed version the user actually sees.
- Contract execution cannot be reached with only the assistant’s MCP credential, and a retry does not duplicate delivery or payment.
- A provider outage or one user’s expired token does not incorrectly mark every connection down.
- Stage never mutates a real external account merely because Vista’s money is fake. Use dedicated provider test accounts/data or mocks; generic MCPs may have no `stage` concept.
- New upstream tools or permissions are not automatically enabled by a health refresh.

For product measurement, add **weekly successful recurring tasks per activated user**, repeat use by cohort, connect-to-first-value conversion, reconnect rate, and fully loaded cost per completed task. Keep financial-contract completion metrics for native commerce; they cannot measure the entire new utility-first phase.

A sustainable commercial plan also needs a payer for nontransactional utility. Public research and calendar summaries do not automatically produce a settlement commission. Pilot funding, user subscription, partner subsidy, or another model remains a business decision; do not assume Google or a public MCP publisher will pay Vista for “pumped intelligence.”

## 12. What the book and presentation should change after approval

### Book change map

| Chapters | Recommended change |
|---|---|
| **00-01**, **05-01**, **05-03** | Introduce international capability reuse before controlled-service proof. Replace “no external dependency” with the narrower absence of a bespoke partner-negotiation prerequisite; retain a controlled-service fallback. |
| **01-02**, **01-03**, **01-04**, **01-05**, **02-01** | Reconcile inherited “every write is a contract”/“zero authority” wording with light writes and authorized external connections. Keep the main contract explanation, but scope its claims correctly. |
| **02-01**, **04-02** | Qualify “one identity”: Vista login, external account linking, and cooperating federation are distinct. |
| **02-03**, **02-05**, **02-08** | Explain plain-connector admission and consent without implying an upstream provider signed a Vista contract or supports bot notifications. Preserve explicit first connection and revocation. |
| **02-04** | Keep the six system apps fixed. Default catalog connectors are not new consent-exempt system modules. |
| **02-09** | Expand the existing hard-side discussion into the three supply routes; define the testable first cohort and avoid equating account totals with an atomic network. |
| **02-10** | Add installed-first discovery, registry-backed candidate lookup, publisher provenance, and the distinction between listing, connection, and financial verification. |
| **02-11** | Split ordinary MCP and optional contract-profile onboarding; describe the SDK’s actual bundle and conformance profiles; add «داشت» as supply development. |
| **02-12**, **02-13**, **02-14** | Distinguish reused utility from native partner value, first-pilot cost from revenue, and commodity connectivity from Vista’s lasting advantage. Address affiliated-app neutrality. |
| **02-15**, **04-03**, **04-07**, **04-10** | Scope the wallet guarantee, credential custody, identity assertions, and execution boundary precisely. Keep detailed light-write guidance in the SDK. |
| **02-16** | Distinguish deployment health from a user connection needing authorization; qualify the direct-UI fallback per feature. |
| **04-01**, **04-05**, **04-06** | Show catalog/connection/credential responsibilities, reuse YellowHub transport infrastructure, and explicitly name MCP Registry, OAuth/OIDC, MCP Apps, and the contract-profile standards assessment. |
| **04-04**, **04-09** | Keep draft/final and consent/audit/secret records separate; specify what is signed and who actually signed it. |
| **05-02**, **05-03**, **05-04** | Add external-provider policy, data access, preview/access risk, operating liability for adapters, and a gated treatment of cross-border/P2P proposals. |
| **05-05** | Assign OAuth, SDK, catalog, partner onboarding, bootcamp, investment, and provider-policy ownership without silently changing the corporate structure. |
| **90-01**, **90-02** | Add connector, connected account, OAuth grant, registry, federation, and contract profile; track unresolved eligibility, credential retention, and ecosystem economics. |

Do not use this round to rewrite unrelated banking or long-term architecture chapters. Also retain the prior decision that assistant delegation remains phase two; token persistence is not a reason to reintroduce it earlier.

### Presentation change map

The current presentation already contains identity, standards, discovery, roadmap, and risk sections. Update those rather than adding a second incompatible story:

1. **Cold-start slide:** the three supply routes and the distinct proof each delivers.
2. **One-identity slide:** “log in to Vista once; connect external accounts when needed.”
3. **Standards slide:** base MCP, standard registry/auth/UI extensions, optional Vista Contracts; no claim that ordinary MCP alone implements the complete Vista experience.
4. **Discovery demonstration:** reuse an installed capability; otherwise show provenance and ask to connect a new service.
5. **Connection demonstration:** a Calendar authorization/reuse flow with an explicit “demonstration” label unless it really runs; not a fabricated provider partnership.
6. **Roadmap slide:** utility pilot, controlled native transactions, and later supply development, preserving the existing financial phases.
7. **«داشت» slide:** continuous discovery, maintained products, investment based on outcomes; label the P2P example as exploratory if retained.
8. **Risks/metrics slide:** provider eligibility, private-data policy, recurring task success, and cost—not only number of apps or signed contracts.

## 13. Decisions to confirm in the next round

These questions should shape the next edit/implementation round. The recommendations above are a proposed baseline, not decisions attributed to the transcript.

| Decision | Recommended starting position |
|---|---|
| What is the first user cohort and recurring job? | A deliberately recruited learning/research-planning cohort, validated before making a broad consumer claim |
| What does “default MCP” mean? | Curated catalog availability; explicit connection for private accounts; no expansion of the exempt system-app list |
| Which Google route is viable for Vista? | Official Calendar MCP if preview/provider access is available; otherwise review an existing self-hosted connector before committing to an adapter |
| Who holds OAuth credentials and consent policy? | Vista-owned broker/policy with encrypted storage; shared transport infrastructure only under explicit responsibilities |
| How much ordinary MCP write access ships initially? | A narrow reviewed feature set with appropriate upstream scopes; no blanket enable-all and no invented per-edit approval system |
| Is execution literally outside MCP? | Yes for the new Vista Contracts profile; explicitly migrate/version the legacy hidden fulfillment tool |
| How is a plain connector’s permission agreement represented? | A Vista-operated connection agreement, not a forged upstream app signature or implicit financial verification |
| How much external discovery is in the first pilot? | Curated catalog first, standard ingestion next, bounded on-demand discovery after admission/authentication works |
| Who owns and funds «داشت» and its portfolio? | Explicit program and investment owners; maintenance, IP, economics, and recommendation neutrality settled before recruitment |
| Is the P2P international-purchase app a launch commitment? | No; a separately validated, legally reviewed venture hypothesis |

**Bottom line:** V0.3 should make Vista the place where existing capabilities become useful together, without forcing every provider to become a Vista-native business first. The contract layer remains the additional capability that makes native transactions distinctive. Standardize the connection, preserve the authorization boundary, and measure whether the resulting product gives a specific group a reason to return.

---

## Sources and evidence boundaries

### Local evidence

- [V0.3 transcript](01-transcription.md).
- [Vista book metadata](../../book/book.yaml) and all 46 current chapter files; chapter numbers in the analysis refer to that working copy.
- [V0.2 Round 1](../V0.2/02-round1-analysis-en.md) and [Round 3](../V0.2/04-round3-analysis-en.md), including inline decisions, used to avoid reopening settled light-write and phase-two delegation choices.
- [SDK entry point](../../SDK/vista-app/README.md), [manifest](../../SDK/vista-app/reference/manifest.md), [tools](../../SDK/vista-app/reference/tools.md), [contracts](../../SDK/vista-app/reference/contract.md), [mini-app](../../SDK/vista-app/reference/mini-app.md), and [light-write guidance](../../SDK/vista-app/reference/mcp-write-guidance.md).
- [MCP gateway](../../../app/server/src/gateway/mcp.ts), [registry/seed catalog](../../../app/server/src/gateway/registry.ts), [assistant](../../../app/server/src/assistant/agent.ts), [API routes](../../../app/server/src/routes/api.ts), and [fulfillment wiring](../../../app/server/src/index.ts).
- [Current presentation](../../presentation/index.html).

### External references

All checked on 2026-09-12. Live provider pages and registry specifications can change; pin the appropriate revisions and test actual deployments when implementing. No provider authorization, live user-account connection, contract execution, or commercial eligibility test was performed for this document.

- **S1 — Andrew Chen:** [Hard Side chapter excerpt][S1] and [single-user utility as a cold-start approach][S1b].
- **S2 — Teresa Torres:** [Continuous Discovery Habits overview][S2] and [weekly discovery/customer contact][S2b].
- **S3–S4 — MCP authorization:** [2026-07-28 authorization][S3] and [client registration][S4].
- **S5–S6 — MCP Registry:** [role, preview status, aggregation, and trust][S5]; [server.json format][S6]; [Generic Registry API][S6b].
- **S7–S8 — Identity and Google OAuth:** [OIDC Core][S7], [Google OAuth overview and refresh expiry][S8], [web-server authorization and incremental scopes][S8b], [OAuth policy][S8c].
- **S9 — Google restricted access:** [Gmail scopes][S9] and [restricted-scope verification/security assessment][S9b].
- **S10 — UI:** [MCP Apps overview][S10].
- **S11–S12 — Commerce:** [AP2 v0.2 specification][S11] and [UCP/AP2 integration overview][S12].
- **S13–S14 — Google connectors:** [Workspace MCP setup][S13] and [Calendar MCP setup][S14].
- **S15 — Public knowledge:** [community wiki-mcp implementation][S15].
- **S16–S17 — Search:** [Brave’s MCP implementation][S16] and [Tavily’s MCP implementation/authentication options][S17].
- **S18–S22 — Other connectors:** [Notion][S18], [GitHub setup][S19] and [read-only server configuration][S19b], [DeepWiki][S20], [Hugging Face][S21], [Cloudflare’s server catalog][S22].
- **S23–S24 — Conditional/deferred options:** [IMDb’s official API documentation][S23] and [community Google Calendar MCP][S24].
- **S25–S26 — Workspace requirements:** [MCP security configuration][S25] and [Workspace user-data/developer policy][S26].

[S1]: https://andrewchen.com/solve-a-hard-problem-cold-start-problem/amp/
[S1b]: https://andrewchen.com/how-to-solve-the-cold-start-problem-for-social-products/
[S2]: https://www.producttalk.org/continuous-discovery-habits/
[S2b]: https://www.producttalk.org/getting-started-with-discovery/
[S3]: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization
[S4]: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration
[S5]: https://modelcontextprotocol.io/registry/about
[S6]: https://raw.githubusercontent.com/modelcontextprotocol/registry/refs/heads/main/docs/reference/server-json/generic-server-json.md
[S6b]: https://raw.githubusercontent.com/modelcontextprotocol/registry/refs/heads/main/docs/reference/api/generic-registry-api.md
[S7]: https://openid.net/specs/openid-connect-core-1_0.html
[S8]: https://developers.google.com/identity/protocols/oauth2
[S8b]: https://developers.google.com/identity/protocols/oauth2/web-server
[S8c]: https://developers.google.com/identity/protocols/oauth2/policies
[S9]: https://developers.google.com/workspace/gmail/api/auth/scopes
[S9b]: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
[S10]: https://modelcontextprotocol.io/extensions/apps/overview
[S11]: https://ap2-protocol.org/ap2/specification/
[S12]: https://ucp.dev/documentation/ucp-and-ap2/
[S13]: https://developers.google.com/workspace/guides/configure-mcp-servers
[S14]: https://developers.google.com/workspace/calendar/api/guides/configure-mcp-server
[S15]: https://github.com/Mohan-Kumar-Swamynathan/wiki-mcp
[S16]: https://github.com/brave/brave-search-mcp-server/
[S17]: https://github.com/tavily-ai/tavily-mcp?tab=readme-ov-file
[S18]: https://developers.notion.com/docs/mcp
[S19]: https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/provide-context/use-mcp-in-your-ide/set-up-the-github-mcp-server
[S19b]: https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md
[S20]: https://docs.devin.ai/work-with-devin/deepwiki-mcp
[S21]: https://huggingface.co/docs/hub/main/agents-mcp
[S22]: https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/
[S23]: https://developer.imdb.com/documentation/api-documentation
[S24]: https://github.com/nspady/google-calendar-mcp/
[S25]: https://developers.google.com/workspace/guides/configure-mcp-security
[S26]: https://developers.google.com/workspace/workspace-api-user-data-developer-policy
