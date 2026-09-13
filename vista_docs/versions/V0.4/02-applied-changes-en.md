# Vista V0.4 — Applied Changes and Open Points

**Input:** [01-transcription.md](01-transcription.md) — four voice messages, 2026-09-12, 17:48–18:00, restating the three execution phases.
**Status:** the book and the presentation have been changed to match the transcript. This document records what was applied, the judgment calls made where the transcript left room, and the points the transcript itself leaves open. It is not an analysis round; the phasing was clear enough to apply directly.

## 1. What the transcript decides

| Topic | Decision applied |
|---|---|
| Phase durations | Phase 1: 2 months. Phase 2: 4 months. Phase 3: 6 months. Total one year. Phase 4+ not discussed. |
| Five strands | Super app (YellowApp), API hub (YellowHub), Bank Sina (YellowBank), digital signature (YellowSign), «داشت» bootcamp. Under one management if Option A is accepted. |
| Phase 1 shape | The five strands start independently with no connection between them; the only shared thing is the standard that will later connect them. |
| Phase 1 connections | The super app connects services directly, in a deliberately immature way. YellowHub is not in the path. |
| Phase 1 wallet | Vista's own wallet module: top-up via Shaparak gateway, withdrawal to the user's own IBAN, spending in apps, apps can credit the wallet. Not connected to Bank Sina. Retired in phase 2. |
| Phase 1 signature | Only rungs 1 (authenticated request with token) and 2 (OTP). No digital signature or PKI at all. |
| Phase 1 products | ایتلا, کنکوریا, سهمتو, Google Calendar, search, entertainment tools such as IMDb; any other ready service is welcome. Irancell services are **not** added in phase 1. |
| Phase 1 environments | Development (internal, may run ahead), staging and production (same version, always updated together; staging wallet is fake for both top-up and withdrawal; no other difference). |
| Phase 1 success | ایتلا and کنکوریا work in the super app, plus the payment flow and the other planned flows. |
| Phase 2 shape | The five strands are woven together. |
| Phase 2 hub | All connections — کنکوریا, ایتلا, «داشت» products, Irancell services, everything else — go through YellowHub. Irancell services are connected in this phase. |
| Phase 2 wallet | Bank Sina becomes the wallet backend; Vista's wallet module is removed. Staging connects to Bank Sina's staging (fake money and gateway). |
| Phase 2 «داشت» | First bootcamp products enter Vista's staging and production. |
| Phase 2 identity | Level-1 matching of mobile number, national ID and birth date through national services. |
| Phase 2 delegation | Both foreground auto-approval (auto-signing rung-1 contracts from the user's own request) and background delegation (an app acting without the user). Distinct concepts, one umbrella title. |
| Phase 2 signature | Rungs 3 and 4 and PKI may arrive but are **not** a success criterion; the service never depends on them. |
| Phase 3 shape | Developer console and market expansion. |
| Phase 3 developers | Companies register their own apps (MCP plus contract) in ویترین through a developer console. Before phase 3, all apps were ours or friends' via out-of-band negotiation. |
| Phase 3 identity levels | Level 1 (matched identity, prepared in phase 2). Level 2 allows registering an app; how one reaches it is undecided. Level 3 is legal/corporate and allows use of the financial modules (wallet). |
| Phase 3 marketing | A marketing team is added; advertising and market expansion belong here. |
| Phase 3 success | Scalability: number of apps (financial and non-financial), transaction volume, user count, revenue. Numeric KPIs to be set later. |

## 2. Judgment calls made while applying

These are places where the transcript did not dictate wording or placement. Each is reversible; none changes the decisions above.

- **Phase names.** The book kept «اثبات» for phase 1 and «گشایش» for phase 3. Phase 2 was renamed from «مقیاس» to «یکپارچه‌سازی», because the transcript summarises phase 2 as weaving the five strands and assigns scale metrics to phase 3.
- **Phase zero removed as a numbered phase.** The book's «فاز صفر» prerequisites (model quality, hardware, key infrastructure, end-to-end prototype) are now "work that starts on day one in its own strand". A fourth numbered phase would contradict "three phases make one year", and the transcript's independent strands already cover these items.
- **Delegation umbrella term.** The transcript suggests «وکالت» might cover both concepts. The book now uses «وکالت پیش‌زمینه» (foreground auto-approval) and «وکالت پس‌زمینه» (background delegation) under the single chapter «وکالت». The existing section "the delegate can be the assistant" was mapped to the foreground form.
- **Items the transcript did not mention were kept, not promoted.** Intelligence pumping, multi-tier model routing and internal hosting remain in phase 2 but are stated as non-criteria. Marketplace revenue, sponsored presence, voice and user-to-user chat remain in phase 3 behind their prerequisites. External-registry search stays out of all three phases.
- **ایتلا caveats kept.** The transcript treats ایتلا and کنکوریا as the phase-1 targets. The book keeps the V0.3 caveat that payment gateway and settlement terms with ایتلا are not yet agreed, and now says they must be finalised within phase 1.
- **Telecom revenue timing.** Because Irancell services move to phase 2, the revenue slide's "first months" chip became "from phase 2", and the revenue chapter says the same.
- **Level-3 naming.** The third identity level is now labelled «حقوقی و شرکتی» per the transcript; its content (company documents, settlement destination, per-app financial enablement) is unchanged.
- **Corporate map.** The four product lines are unchanged; «داشت» is described as the fifth strand and a programme, not a product line.

## 3. Points the transcript leaves open

These were recorded in the book's «کارهای باقی‌مانده» appendix rather than decided here.

1. **Developer console location.** Separate website or inside Vista — explicitly undecided in the transcript.
2. **Level-2 qualification.** Who can reach level 2 and with what evidence — explicitly undecided.
3. **Phase-3 KPI numbers.** App count, users, transaction volume, revenue targets — to be set "a bit further along".
4. **Umbrella name for the two delegation forms.** The transcript says "maybe وکالت". Applied as such; easy to rename.

## 4. Files changed

**Book (24 chapters).** Full rewrite: `05-01-نقشه-راه.md`. Targeted edits: `00-01-خلاصه-مدیریتی`, `01-02-دستیار-چیست`, `02-01-چشم‌انداز`, `02-04-لایه-سیستمی`, `02-06-وکالت`, `02-07-پرداخت-و-کیف-پول`, `02-09-اشتراک‌گذاری`, `02-10-ویترین`, `02-11-یکپارچه‌سازی-و-SDK`, `02-13-مدل-درآمد`, `03-01-چرا-بانک`, `03-02-بانک-به‌عنوان-ریل`, `03-03-امضا-و-سیم‌کارت`, `04-02-کنشگران-و-هویت`, `04-05-اپ-به-اپ`, `04-08-لایه-مدل`, `04-10-اصول-معماری`, `05-02-مسیر-حقوقی`, `05-03-ریسک‌ها`, `05-05-اختیارات`, `90-01-واژه‌نامه`, `90-02-کارهای-باقی‌مانده`. Output rebuilt: `out/vista.html`, `out/vista.pdf`.

**Presentation.** `presentation/index.html`, republished to the existing artifact. Roadmap slide rewritten; one new slide «پنج رشته: مستقل، بافته، گشوده» added after it (44 slides total). Edited slides: system layer, signature ladder, wallet, developer publishing, three levels, Irancell services, joining, four supply routes, revenue streams, ایتلا, prerequisites, scope, corporate map, and the final ask.

**Not changed.** The SDK folder; the transcript's decisions do not alter the integration contract, only which environment and phase a partner connects in.
