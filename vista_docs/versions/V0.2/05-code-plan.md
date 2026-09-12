# Vista V0.2 — Code Change Plan

**Against:** `app/` as it stands — server (contracts engine, gateway, wallet, chats, assistant), web client, and `skills/vista-app/` partner spec.

Nine changes reach the code. One of them — delegated signing — is explicitly **not built now**, and the plan says where its seam is so nothing has to be undone later.

Ordered by dependency, not by size. Items 1–3 unblock the rest.

---

## Status — what is built (2026-09-10)

Items **5, 6 and the manifest half of 9** are implemented and verified. They are the spec-affecting ones, so a partner integrating now does not have to redo the work.

| | state |
|---|---|
| 5 · signed on-behalf-of assertion | **done** — `gateway/mcp.ts › assertionFor()`, `contextFor()` now async; `verifyAssertion()` in `lib/vista-sign.mjs`; documented in `reference/tools.md`; conformance mints a valid one and probes with a forged one |
| 6 · light MCP writes | **done** — `tools.write` in the manifest, exposed by `classifyTools`, rate-limited per (user, app, tool), every call in the دفتر; `reference/mcp-write-guidance.md` published |
| 9 · environment | **partly** — `VISTA_ENV` + `manifest.environment` mismatch refused at probe; **separate `DATABASE_URL` and the processor env check are not built** |
| 1, 2, 3, 4, 7, 8 | not started — none is visible to a partner |
| 10 · delegated signing | deliberately not built |

Verified against `lib/example-server.mjs`: **48 ✓ · 0 ✗**, including forged-assertion rejection, contract hash + app signature, and fulfilment with a valid platform signature.

**Two bugs this shook out**, both of which would have hit the first partner on day one:

1. The conformance harness sent no assertion, so a *correctly* verifying app failed the suite. Fixed: with `--platform-private-key` the harness mints a valid assertion for every call, and without it, warns loudly instead of silently passing.
2. The reference app's read tool ignored `extra`, so it never verified. Fixed — and it is the reason read tools now verify in the example.

**Still open before production:** the processor-side environment check and separate databases (item 9's other half). Stage and production currently share whatever `DATABASE_URL` is configured.

---

## 0. What already exists and does not change

Worth stating so nobody rebuilds it: the contract engine (draft → app signature → user signature → processor → events), canonical hashing, the chained ledger, rung 1 and 2 signing, the capability gateway with MCP transport and health sweep, app delegation with all six rules, the wallet with hold/capture/refund, and the reference sample app. The changes below sit on top of that.

---

## 1. Rung by destination, and a user-settable threshold

**Today.** `contracts/engine.ts › requiredRung()` looks only at amount, against `config.ts › ceilings = { rung1: 2_000_000, rung2: 20_000_000 }` — a module constant.

**Change.** The rung comes from *where the money lands* first, then amount.

`contracts/model.ts` — add two effect types alongside `wallet.pay` / `wallet.topup`:

```ts
{ type: 'wallet.withdraw', amount, iban }        // to the user's own account
{ type: 'wallet.transfer', amount, to_user }     // to another user's wallet
```

`contracts/engine.ts` — replace the amount-only ladder with a destination classifier:

```ts
type Dest = 'app_purchase' | 'own_account' | 'other_wallet' | 'third_party';

function destinationOf(doc: ContractDoc): Dest | null
function requiredRung(doc, limits): Rung
  // app_purchase   → 1 up to limits.dailyPurchase, else 2
  // own_account    → 1
  // other_wallet   → 2 (min), with its own much lower ceiling
  // third_party    → 2 today; 3/4 reserved
  // wallet.topup   → 1  (its real check is the PSP, not our ladder)
```

`config.ts` — `ceilings` becomes **defaults**, plus a hard cap the user can never exceed:

```ts
ceilings: { rung1Default: 2_000_000, rung1HardCap: 50_000_000, rung2: 20_000_000,
            otherWalletRung2Cap: 5_000_000 }
```

**New table** `user_limits (user_id, daily_purchase_rung1, updated_at, contract_id)` in `db.ts`.

**Raising it is itself a contract.** New `contracts/system.ts › buildLimitChange(u, newValue)` with `policy.min_rung = 2` and a `policy.limit` effect. Never a plain settings write — otherwise the ceiling is decorative. Also add to `requiredRung`: any contract carrying a `policy.limit` effect is min rung 2 and, later, is excluded from mandate coverage.

**Files:** `contracts/model.ts` · `contracts/engine.ts` · `contracts/system.ts` · `config.ts` · `db.ts` · `routes/api.ts` (settings endpoint) · `web/src/` settings page.

---

## 2. Unverified apps cannot take money

**Today.** `contracts/system.ts:80` blocks only *financial permissions* for unverified apps. A money contract from an unverified app still executes.

**Change.** Move the check into the engine so it covers every path — assistant, app-built, delegated, app-to-app.

`contracts/engine.ts › createContract()`, before insert:

```ts
if (contractAmount(doc) > 0 || doc.effects.some(isMoneyEffect)) {
  const a = await appRow(doc.app_id);
  if (!a?.verified && a?.kind !== 'system')
    throw new ContractError('unverified', 'فقط اپ احرازشده می‌تواند از کاربر پول بگیرد.', 403);
}
```

**And it has to reach the assistant's choices, not just enforcement.** `assistant/agent.ts` — when the turn is financial, unverified apps are dropped from the tool set, and the system prompt states the rule so the model doesn't promise something the engine will refuse. Same filter in the showcase search path in `gateway/registry.ts`.

**Files:** `contracts/engine.ts` · `assistant/agent.ts` · `gateway/registry.ts` · `sample-app` manifests unchanged.

---

## 3. Implicit start — any contract starts the app

**Today.** `contracts/system.ts › buildStart()` builds an explicit start contract, and `onEffect` for `app.install` writes the `installs` row. Nothing else creates an install.

**Change.** Signing *any* contract with an app the user has no install row for creates one, granting `notify` only.

`contracts/engine.ts › sign()` — after the user signature lands:

```ts
await installs.ensure(userId, row.app_id, {
  implicit: true, permissions: ['notify'], startContractId: row.id,
});
```

`db.ts` — `installs` gains `implicit BOOLEAN DEFAULT FALSE`.

`buildStart()` stays: it is still the path from ویترین, where the user picks permissions deliberately. Both paths converge on the same `installs` row.

**Client.** `web/src/contract.tsx` — when this is the first contract with an app, the signature panel shows a one-line band, not a second wall:

> این اولین قرارداد شما با {اپ} است · با امضا، اجازهٔ اطلاع‌رسانی هم داده می‌شود · هر وقت خواستید پس بگیرید

And the app name plus verification state is always rendered on the contract, in every case — this is what makes assistant-chosen apps safe to introduce.

**Revocation** already exists per-app; make sure revoking `notify` is reachable from the app settings page for implicitly-installed apps too.

**Files:** `contracts/engine.ts` · `contracts/system.ts` · `db.ts` · `routes/api.ts` · `web/src/contract.tsx` · app settings page.

---

## 4. Notification module

**Today.** `chats/service.ts › post()` is called directly from the engine, delegation, system contracts, and `routes/apps-api.ts`. There is a `notify` permission in the registry but no single place that enforces it.

**Change.** New `server/src/notify/service.ts` as the only door for app-originated messages:

```ts
export async function deliver(userId, appId, msg): Promise<'sent'|'blocked'> {
  // 1. install exists and not removed
  // 2. 'notify' in granted permissions
  // 3. app health / rate limit
  // 4. ledgerAppend('notify.blocked' | 'notify.sent')
  // then chats.post(...)
}
```

`routes/apps-api.ts` calls `notify.deliver`, never `chats.post`. Platform-origin messages (processor events, delegation notices, system) call `chats.post` directly — they are not app-originated and must not be blockable by a permission the user gave an app.

**Files:** new `notify/service.ts` · `routes/apps-api.ts` · `index.ts` wiring.

---

## 5. Signed on-behalf-of assertion on every gateway call

**Today.** `gateway/mcp.ts › contextFor()` builds a plain object with `user_id` and passes it as `_meta.vista`. An app has to take our word for it.

**Change.** Make it verifiable.

```ts
// gateway/mcp.ts
export async function assertionFor(app, user, granted): Promise<string> {
  const claims = { iss: 'vista', aud: app.id, sub: `user:${user.id}`,
                   user_ref, scopes: granted, iat, exp: iat + 300, jti: nonce };
  return `${b64(claims)}.${await platformSign(canonical(claims))}`;   // Ed25519, contracts/keys.ts
}
```

Passed as `_meta.vista.assertion` alongside the existing filtered context. Short TTL, audience-bound so an app cannot replay another app's assertion.

**Partner side.** `skills/vista-app/lib/vista-sign.mjs` gains `verifyAssertion(token, vistaPublicKey)`; new reference page; `sample-app/index.ts` verifies it and scopes its answers by `sub`. `scripts/conformance.mjs` gains a case that fails an app which ignores the assertion.

**Files:** `gateway/mcp.ts` · `contracts/keys.ts` · `assistant/agent.ts` · `routes/api.ts:167` · `sample-app/index.ts` · `skills/vista-app/`.

---

## 6. Light MCP writes, declared by the app

**Today.** `gateway/mcp.ts › classifyTools()` exposes only `read` and `build` from the manifest; everything else is `{kind:'write', exposed:false}`.

**Change.** The manifest gains a fourth list and the app decides what goes in it.

```ts
tools?: { read?: string[]; build?: string[]; write?: string[]; fulfil?: string }
```

```ts
if (manifest.tools.write?.includes(t.name))
  return { ...base, kind: 'write', exposed: true, light: true };
```

**Non-Vista MCP servers are unchanged.** They have no manifest, so they cannot declare anything, and the existing conservative default keeps their effectful tools hidden. This matters: the decision to trust an app's classification only applies to apps that went through احراز.

**What we do regardless of the app's judgement** — and this is the whole of our side, since there is no platform override and the user is not shown the tool list:

- **Ledger.** every light-write call appends `mcp.write` with app, tool, argument keys, and the assertion `jti`.
- **Rate limit.** per (user, app, tool), tighter than reads. `gateway/mcp.ts › callTool`.
- **Revocation granularity is the app.** Removing the app removes the tools; there is no per-tool switch, because the user cannot meaningfully tell reads from writes.

**Guidance document** — `skills/vista-app/reference/mcp-write-guidance.md`, published, versioned, and acknowledged at احراز. Contents: the money rule we enforce structurally; the four questions (is it reversible by the user · is it visible to a third party · is volume itself the damage · would the user expect to be asked); the trade-off stated plainly — **an MCP write buys conversion, a contract buys provability**; safe / think-twice / never lists; and the sentence that carries the most weight:

> **اگر ابزاری وقتی کسی جز کاربر صدایش بزند خطرناک است، جایش قرارداد است، نه MCP.**

**Files:** `gateway/mcp.ts` · `assistant/agent.ts` · `skills/vista-app/reference/` (new page + `manifest.md` + `tools.md`) · `scripts/conformance.mjs`.

---

## 7. Deposit and withdrawal, with Bank Sina as the named party

**Today.** `contracts/system.ts › buildTopup()` exists with a fake gateway; there is no withdrawal; and `base()` builds the wallet app as `kind: 'platform'` labelled ویستا.

**Change (a) — the counterparty is the bank.** `base()` must label the `wallet` app party as **بانک سینا** with `kind: 'app'` when the contract type is financial. This is user-visible and it is the point of the change: the user is contracting with whoever holds the money.

**Change (b) — withdrawal.** New `contracts/system.ts › buildWithdraw(u, amount, iban)`:

```
type: 'wallet.withdraw' · min_rung 1 · settlement 'on_delivery'
clauses: مبلغ · شبای مقصد (masked) · صاحب حساب · کارمزد
effects: [{ type: 'wallet.withdraw', amount, iban }]
```

Signature alone does nothing — matching the book. Execution debits and moves the contract to `در حال اجرا`; the terminal event arrives later.

**Three steps, as staged:**

| گام | چه می‌کند | کد |
|---|---|---|
| ۱ | نه بررسی، نه اجرا | `IBAN_VERIFY=off`, `WITHDRAW_EXECUTE=off` |
| ۲ | بررسی شبا با کد ملی · صف برای بانک · رویداد پس از تیک | `IBAN_VERIFY=mock\|real`, queue table |
| ۳ | فراخوانی واقعی API و شمارهٔ پیگیری | `WITHDRAW_EXECUTE=api` |

**The operator is not in our client.** The bank employee works in the bank's own back office, so step ۲ needs `routes/bank-api.ts` — an authenticated endpoint (mTLS or signed request, bank credential only) exposing the pending queue and accepting a completion with a tracking number. The completion arrives as an ordinary contract event **from Bank Sina, a named party** — no special-cased internal admin action, no new audit machinery.

New: `util/iban.ts` (IR check digits + ownership stub), `wallet/service.ts › withdraw/settleWithdraw/failWithdraw`, `withdrawals` queue table.

**Files:** `contracts/system.ts` · `contracts/engine.ts` (effect handling) · `wallet/service.ts` · new `routes/bank-api.ts` · new `util/iban.ts` · `db.ts` · `web/src/` مالی page.

---

## 8. Processor attestation to the end service

**Today.** `index.ts:21-27` already calls the hidden `vista_fulfil` tool with `platform_signature = platformSign('executed|' + hash)`. The seam exists; the payload is thin.

**Change.** Sign a full attestation instead of a bare hash — contract id and version, canonical hash, the verified identity of every party (with the rung each signed at), execution timestamp, and environment. The end service verifies one signature instead of doing its own identity work.

This is also the answer to hand a regulator: a single licensed point attesting *this user, this contract, identity verified* before anything executes. Worth building properly now rather than upgrading later, because partners will have written verification code against whatever ships first.

**Files:** `contracts/engine.ts › fulfil()` · `index.ts` · `sample-app/index.ts` · `skills/vista-app/lib/vista-sign.mjs` · `skills/vista-app/reference/contract.md`.

---

## 9. Stage environment

**Rule.** Stage has **exactly** production's capabilities — only the money and the app mode differ. Anything running ahead of the roadmap lives in dev/test, never in stage.

- `config.ts` — `VISTA_ENV = 'dev' | 'stage' | 'production'`.
- **Separate `DATABASE_URL` per environment.** Same build, different database. Logical isolation inside one database is where test money becomes real money.
- `contracts/engine.ts › execute()` — refuse any contract whose `env` column differs from the running environment. One check, one place; this is the invariant that has to hold even if everything else leaks.
- Manifest gains `stage_url`; the registry stores both and the gateway picks by environment. Partner apps must expose a stage endpoint — add it to the spec and to `conformance.mjs`.
- `PAYMENT_GATEWAY=fake` only permitted when `VISTA_ENV !== 'production'`; startup fails otherwise.
- **Client shows a persistent stage band**, not just on the payment page. A screenshot of an unmarked stage build is indistinguishable from a real one, and screenshots travel.

**Files:** `config.ts` · `db.ts` · `contracts/engine.ts` · `gateway/registry.ts` · `routes/gateway-page.ts` · `web/src/ui.tsx` · `.env.example` · `app/README.md`.

---

## 10. Delegated signing — the seam, not the build

**Not built now.** Phase 2, and not in dev/test either.

Recording the seam so nothing has to be undone:

- `delegations` gains `holder TEXT` — `'app'` (today) or `'assistant'`.
- The auto-sign decision is **server-side**, at the sign endpoint in `routes/api.ts`, not in `web/`. The client is not a trust boundary; "the client signs" in the book means the model is not in the path, not that the browser decides.
- The check is deterministic: valid mandate, matching scope, amount within remaining cap, not expired — reusing `executeUnderDelegation`'s existing checks.
- The two carve-outs are two predicates: `doc.type !== 'start'`, and the contract's origin is the user's own request rather than an inbound share (`origin !== 'shared'`, `share_token === null`).
- Policy contracts (item 1's `policy.limit`) are never mandate-covered.

`delegation.ts:56` already refuses effects other than `wallet.pay` / `app.action` under a mandate — that line is exactly the right shape and extends unchanged.

---

## Order

**First** — items 1, 2, 3. They touch `contracts/engine.ts` together and every later item assumes them. Doing them in one pass avoids three rewrites of `requiredRung` and `createContract`.

**Then** — 4, 5, 6 in parallel. Independent of each other; 5 and 6 both change the partner spec, so ship the spec once, after both.

**Then** — 7, which is the largest single item and the only one with an external dependency (the bank's back office). Steps ۱ and ۲ can land before the bank side exists.

**Then** — 8 and 9. Item 8 should land before the first partner writes verification code.

**Not now** — 10.

## Tests

`scripts/e2e.mjs` gains: an implicit-start flow (contract → install → notification permitted → revoked → notification blocked); rung selection across all four destinations; a withdrawal through step ۲ including the bank-side completion; and a light-write call that appears in the ledger. `conformance.mjs` gains the assertion-verification case, the `tools.write` declaration, and the stage endpoint.
