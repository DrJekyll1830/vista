# Vista V0.3 — Round 4 Analysis

**Input:** your comments on [Round 3](04-round3-analysis-en.md). This round corrects the decision record and proposes the missing interaction flow. Earlier documents remain unchanged.

## 1. Corrections to carry forward

- **The wallet is in phase one.** Bank Sina may become its backend in phase two. The book is wrong on this point; wallet availability is not conditional on selecting Eitala.
- **Eitala’s name is ایتلا.** Its agreement in principle to integration does **not** include accepting Vista as its payment gateway. Wallet-only purchases and returns through Vista are your negotiation proposal, not an agreement with either ایتلا or Irancell. My previous “agreed route” wording was wrong.
- **Level three identifies a developer whose app will use Vista’s wallet.** It is an additional developer-verification level, not a category for the wallet’s own operator.
- **Irancell users can reuse Irancell’s identity verification.** Vista obtains a trusted identity result for the authenticated subscriber instead of asking them to enter national ID and birth date again. The number’s prefix alone is not that result. Developer verification remains additional.
- **Trading authority in phase two is وکالت**, using Vista’s existing delegation model.

## 2. Adding an app: two entrances, one activation mechanism

The missing distinction is between **choosing an app**, **authorizing the relationship**, and **executing a service request**. They can appear in one journey without becoming the same operation.

Proposed ownership: **ویترین owns the catalog and user installation records; the shared contract processor applies the authorized installation and permission effects; the added app owns its account and service operations.** The assistant requests drafts and explains results. It does not install an app by declaring it installed.

### A. The assistant suggests an app during a task

Example: “I want to buy this amount of gold,” with ایتلا not yet added.

| Step | Assistant | ویترین | ایتلا |
|---|---|---|---|
| Find | Searches connected apps, then asks ویترین for suitable candidates. | Returns eligible listings, publisher identity, capabilities, and whether the user has added each app. | No user relationship is created. |
| Prepare | Selects a candidate and requests the relevant draft through the capability gateway. Supplies only information allowed at this point. | Supplies the registered app identity and installation/permission declarations. | Returns public quote/draft information and the required terms. No purchase or private-account access occurs. |
| Present | Shows the first contract in the assistant conversation, through Vista’s standard contract component: “Buy from ایتلا and add ایتلا,” with amount, app identity, and relationship terms. | Has not yet marked the app installed. | Has a proposal, not authority to execute it. |
| Authorize | The **user** signs in Vista’s trusted component. The assistant receives the outcome. | The processor records the authorized relationship and creates the user’s app entry. | Receives the authorized start/account-linking request and, once prerequisites are satisfied, the separately authorized business request. |
| Continue | Resumes the original task and shows the actual result or next required step. | Marks the connection ready when setup succeeds; exposes its usable capabilities to subsequent assistant searches. | Links/provisions the account, executes the authorized order, and returns status and notifications. |

The first contract can therefore start the app **without a separate installation contract** when the transaction can be prepared before connection. This preserves the book’s implicit-start principle.

If a private account must be connected before an exact proposal is possible, the first contract is a **connection contract**. Complete that, retrieve authorized account data, then present the purchase contract. This second authorization is for newly available transaction terms, not a repeated installation ceremony. An external provider’s required login belongs in that connection step.

### B. The user adds the app through ویترین

1. The user opens ایتلا’s listing and presses **افزودن**. ویترین obtains the app’s start/connection draft using the same gateway and declared terms. There is no purchase to invent.
2. ویترین displays that contract in the same trusted contract component. The user signs there; opening the assistant is unnecessary.
3. The processor applies the same installation and permission effects. ایتلا receives the authorized start, links/provisions its account, and returns readiness and an optional welcome message.
4. ویترین shows **باز کردن** and opens ایتلا’s conversation or mini-app. The assistant does not generate a message or receive the user’s storefront activity as a new instruction. Its next capability lookup simply finds ایتلا among the connected apps.
5. When the user later asks the assistant to buy, it uses the existing connection and presents only the transaction contract, plus any genuinely new permission required.

### Rules shared by both entrances

**The signature authorizes the relationship; it does not guarantee the order succeeded.** Once the start is validly accepted, a later purchase failure leaves the app added. Rejecting or abandoning the unsigned first contract leaves it unadded. If account setup fails after authorization, show “needs connection” and let the user retry or remove it; do not advertise private capabilities as ready. Repeated callbacks must not create duplicate installations or orders.

Start grants the app’s notification relationship. Other access must appear as explicit permission terms; purchase authorization covers that purchase, not future trading. Keep permission grants separately identifiable in the contract record even when approved in the same signing interaction. This reconciles the book’s “permissions are contracts” with your preference for consent inside contracts.

The contract shown in the assistant or ویترین and its entry in ایتلا’s conversation and **قراردادهای من** are views of **one contract ID**, not copied contracts. Service notifications arrive in ایتلا’s conversation; the assistant can show the result of the task it is handling without importing every later notification into its chat.

For an ordinary external MCP with no Vista contract support, Vista supplies its own connection-contract template. The upstream service need not implement or sign a Vista start contract. Both entrances still use the same installation mechanism.

## 3. Bilateral credit and daily net settlement

**Your proposal is coherent: each side extends credit to the other, and only the net amount is settled at day-end.** It replaces my proposed default of waiting for prefunding before every user credit. It remains a proposed agreement with ایتلا.

Define a signed running position:

> **N = unpaid amounts Vista owes ایتلا − unpaid amounts ایتلا owes Vista.**

Purchases increase N; sales/returns credited to Vista users decrease it, using the agreed fee and reversal treatment. If purchases create 80 units owed to ایتلا and sales create 50 owed to Vista, Vista pays 30. If the sign reverses, ایتلا pays Vista.

Use two limits, which need not be equal: Vista’s maximum debt to ایتلا, and ایتلا’s maximum debt to Vista. Check them **before committing each transaction**, reserving capacity for operations already in flight. At a limit, pause exposure-increasing transactions or settle early; transactions that reduce exposure can continue. An uncertain purchase cannot be used as confirmed cover for a sale.

Size “one day” against expected **peak intraday net exposure**, not the average closing balance. Unpaid debt carries forward until settlement is confirmed; midnight must not reset available credit. A missed settlement needs an agreed deadline and response.

This allows immediate user credit within the agreed limits. One operational distinction remains: **credit permits waiting for the partner’s payment; it does not supply the cash needed for a bank withdrawal now.** The wallet operator must have liquidity for the withdrawal service it promises. That is the useful financing question to settle, rather than reopening whether bilateral credit is possible.

## 4. Bank Sina becomes the single balance authority

Your target agreement gives users access to the same funds through Vista and Bank Sina’s own channels. **After that transition, the bank owns the authoritative wallet ledger.** Vista retains contract evidence, transaction references, and display caches—not an independently spendable copy of the balance.

A withdrawal through internet banking must therefore affect the balance available to the next Vista purchase. Bank-side balance checks and reservations enforce this across all channels; a cached Vista display cannot authorize spending. This removes the competing-ledger problem you described.

The migration itself needs one reconciled closing/opening balance transfer and a controlled switch of authority. Afterward, the bank-channel route provides independent access to funds even when Vista is unavailable. It need not restore the Vista account to serve that purpose. This is the intended agreement, not a claim that the integration is already operating.

## 5. The confirmed endpoints simplify two features

**Sahmeto:** use its buy/sell analyst counts directly. For example: “Sahmeto reports 6 buy views and 4 sell views; 60% of those directional views favor buying.” Show the asset and available time/filter information. This is an analyst-opinion ratio, not an AI-generated probability. If both counts are zero, report no available directional views. No new forecasting system is needed to deliver this feature.

**ایتلا support:** when the assistant cannot answer, it proposes escalation and prepares a **rung-one contract** containing the support question, selected context, and relevant order reference. The user approves; the processor calls ایتلا’s support endpoint and records the returned case ID. Replies arrive through ایتلا’s notification path, linked to that case/contract. The draft does not send the ticket, and retries reuse its operation identity. This is a concrete contract-backed action, not merely a human-handoff suggestion.

The next specification should now formalize the common start flow and these endpoint mappings. The commercial discussion remains focused on **whether ایتلا accepts Vista’s proposed payment route and the bilateral settlement terms**. Wallet phase, the meaning of وکالت, and the existence of the two endpoints no longer need another decision round.
