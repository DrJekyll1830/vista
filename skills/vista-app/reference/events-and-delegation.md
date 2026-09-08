# رویدادهای پس از قرارداد و وکالت

رویداد اتفاقی است که پس از امضای قرارداد می‌افتد و به همان قرارداد می‌چسبد: مسدودی، کسر، تحویل، لغو، بازگشت، اختلاف. رویداد امضاشده است اما امضا روی قرارداد نیست؛ در گفت‌وگوی اپ به‌صورت پاسخ به همان قرارداد دیده می‌شود و همان رسید و سابقهٔ کاربر است. وکالت هم قراردادی است که به اپ اجازه می‌دهد در غیاب کاربر، در محدوده‌ای مشخص، خودش قرارداد بسازد و اجرا کند. این سند هر دو را با جزئیات پروتکل می‌گوید.

## رویدادها

### انواع و معنا

| نوع | برچسب در گفت‌وگو | چه کسی | اثر در کیف پول / وضعیت |
|---|---|---|---|
| `held` | مبلغ مسدود شد | سکو (هنگام اجرا) | `held += amount` |
| `deducted` | مبلغ از کیف پول شما کسر شد | سکو | `balance -= amount`, `held -= amount` |
| `credited` | کیف پول شما شارژ شد | سکو (درگاه) | `balance += amount` |
| `delivered` | تحویل داده شد | **اپ** | اگر مسدودی باز است: `deducted`؛ وضعیت `settled` |
| `cancelled` | لغو شد و مسدودی آزاد شد | **اپ** | مسدودی آزاد؛ وضعیت `cancelled` |
| `failed` | اجرا ناموفق بود | سکو یا **اپ** | مسدودی آزاد؛ وضعیت `failed` |
| `released` | مسدودی آزاد شد | سکو | `held -= amount` |
| `refunded` | مبلغ برگشت داده شد | **اپ** | `balance += payload.amount ?? amount`؛ وضعیت `refunded` |
| `disputed` | اعتراض ثبت شد | کاربر | وضعیت `disputed`؛ به پشتیبانی می‌رود |
| `delegated_use` | با وکالت شما اجرا شد | سکو | — |
| `note` | یادداشت | **اپ** یا سکو | — |

اپ فقط پنج نوع را می‌فرستد: `delivered`، `cancelled`، `failed`، `refunded`، `note`. بقیه را سکو یا کاربر می‌سازند.

### دو راه فرستادن رویداد

۱. **پاسخ ابزار تحویل** — همان لحظهٔ اجرا: `{ "events": [ { "type": "delivered", "text": "…" } ] }` (جزئیات در `tools.md`). این رویدادها امضای جداگانه نمی‌خواهند چون در کانال MCP و در پاسخ به فراخوانی امضاشدهٔ سکو آمده‌اند.
۲. **`POST <VISTA_URL>/api/app-events`** — هر زمان بعد از اجرا: تحویل دیرهنگام، لغو، بازگشت وجه، یادداشت. این‌جا رویداد باید **امضاشده** باشد.

### پاکت امضاشده برای `POST /api/app-events`

```json
{
  "app_id": "konkooria",
  "contract_id": "ctr_k7f2m9q1x4z8b3n6",
  "type": "delivered",
  "text": "دسترسی به دوره فعال شد",
  "payload": { "course_id": "math-101" },
  "ts": "2026-09-08T10:05:00.000Z",
  "signature": "o6W4KDkw9BVzAb41VZDks5rtmf3pUPItRgLeGduean0yr82OlUpV/RYIlC4d2gKUYEYkXbcv7Nq4LN3v5MGZDA=="
}
```

امضا: Ed25519 با کلید اپ روی JSON متعارفِ این شیء (کلیدها مرتب، بدون فاصله؛ `text` غایب → `""`، `payload` غایب → `{}`):

```
{"contract_id":"ctr_k7f2m9q1x4z8b3n6","payload":{"course_id":"math-101"},"text":"دسترسی به دوره فعال شد","ts":"2026-09-08T10:05:00.000Z","type":"delivered"}
```

(امضای بالا با کلید آزمایشی `hPYFy+U95wAMlbzldsM9SUXZ8Q8IJuaqqXyKnNyjbQw=` ساخته شده و با `verify(pub, envelope, signature)` تأیید می‌شود.)

با کتابخانه:

```js
import { buildEventBody } from './lib/vista-sign.mjs';
const body = buildEventBody(PRIVATE_KEY_PEM, 'konkooria', { contract_id, type: 'delivered', text: 'دسترسی به دوره فعال شد', payload: { course_id } });
const r = await fetch(`${VISTA_URL}/api/app-events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
// 200 → { ok: true, status: 'settled' }
```

قاعده‌های سکو:

- زمان `ts` باید در بازهٔ **±۵ دقیقه** از ساعت سکو باشد (`400 stale`). ساعت سرور را با NTP هم‌زمان نگه دارید.
- قرارداد باید مالِ همین `app_id` باشد (`404 not_found`) و در وضعیت `executing` یا `settled` (`409 status`). روی قرارداد `failed`/`cancelled`/`refunded` دیگر رویدادی پذیرفته نمی‌شود.
- امضا با کلید عمومی پین‌شدهٔ مانیفست سنجیده می‌شود (`403 signature`). هر تغییر در `text` یا `payload` پس از امضا آن را باطل می‌کند.
- `type` فقط یکی از پنج نوع اپ (`400 bad_request`).
- `refunded` با `payload.amount` بازگشت جزئی می‌دهد؛ بدون آن، کل مبلغ `wallet.pay`.
- هیچ رویدادی تکراری‌زدایی نمی‌شود: `delivered` دوم روی قرارداد `settled` فقط یک پیام دیگر در گفت‌وگو می‌گذارد (کسر دوباره انجام نمی‌شود چون مسدودی باز نیست). با این حال، سمت خودتان ثبت کنید چه فرستاده‌اید.

## وکالت

وکالت (delegation) اجازه‌ای است که کاربر **یک بار** می‌دهد تا اپ در غیاب او، در محدوده‌ای مشخص، عمل کند: تمدید خودکار اشتراک، پرداخت قبض، شارژ وقتی تمام شد. چون کاربر در لحظهٔ عمل حاضر نیست، امنیت از خودِ قرارداد وکالت می‌آید، و به همین دلیل این تنها جای ویستاست که پیش‌فرض‌ها سخت‌گیرانه‌اند.

### شش قاعده و جای اجرایشان

| قاعده | چگونه اجرا می‌شود |
|---|---|
| ۱. وکالت نامحدود وجود ندارد | `cap` و `expires_at` در `delegation.grant` اجباری؛ انقضا حداکثر یک سال؛ `per_use_cap` سقف هر بار |
| ۲. اعطای وکالت یک پله بالاتر از استفاده از آن | قرارداد وکالت همیشه پلهٔ ۲ (رمز یک‌بارمصرف)؛ استفاده از آن بی‌حضور کاربر است |
| ۳. وکیل نمی‌تواند وکالت را واگذار کند | `delegation_id` به `app_id` قفل است؛ اپ دیگر با آن `403` می‌گیرد؛ زیر وکالت نمی‌شود وکالت یا مجوز تازه داد |
| ۴. لغو یک‌طرفه و فوری | کاربر از «قراردادهای من» یا صفحهٔ اپ لغو می‌کند؛ بدون قرارداد، بدون موافقت اپ؛ حذف اپ همهٔ وکالت‌ها را لغو می‌کند |
| ۵. همهٔ وکالت‌ها در یک صفحه | فهرست وکالت‌ها با خرج‌شده و باقی‌مانده در «قراردادهای من» |
| ۶. هر مصرف اطلاع‌رسانی می‌شود | هر اجرای زیر وکالت، قرارداد و رویداد «با وکالت … اجرا شد · مبلغ · باقی‌مانده · انقضا» را در گفت‌وگو می‌گذارد |

فقط اپ **احرازشده** (نشان آبی) می‌تواند وکالت بخواهد. اپ احرازنشده هنگام ثبت قرارداد وکالت `unverified` می‌گیرد.

### گام ۱ — اعلام در مانیفست

```json
"financial_permissions": [
  { "key": "auto_subscription", "label": "تمدید خودکار اشتراک ماهانه", "cap_default": 600000, "period": "monthly",
    "description": "وکالت سقف‌دار و زمان‌دار؛ هر مصرف اطلاع داده می‌شود" }
]
```

در قرارداد استارت، این با کلید `financial:auto_subscription` در بخش جداگانهٔ «اختیار مالی» به کاربر نشان داده می‌شود و اگر تیک بخورد، پلهٔ ۲ می‌خواهد. این اعلام است، نه خودِ اختیار: خودِ اختیار با قرارداد وکالت (گام ۲) داده می‌شود.

### گام ۲ — قرارداد وکالت (`build_*_delegation`)

یک ابزار ساختن مثل بقیه، با این تفاوت‌ها:

```json
{
  "type": "konkooria.subscription-delegation", "template_ref": "konkooria/auto-subscription",
  "title": "وکالت تمدید خودکار اشتراک · طرح ماهانه",
  "clauses": [
    { "key": "subject", "label": "موضوع", "value": "وکالت به اپ برای تمدید اشتراک در غیاب شما" },
    { "key": "scope", "label": "محدوده", "value": "فقط تمدید طرح ماهانه (۲۰۰٬۰۰۰ تومان) در سررسید هر ماه" },
    { "key": "cap", "label": "سقف کل", "value": 1200000, "kind": "amount" },
    { "key": "per_use", "label": "سقف هر بار", "value": 200000, "kind": "amount" },
    { "key": "expiry", "label": "انقضا", "value": "۶ ماه", "kind": "date" },
    { "key": "rules", "label": "قواعد", "value": "واگذاری به اپ دیگر ممنوع · لغو یک‌طرفه و فوری · هر مصرف به شما اطلاع داده می‌شود", "kind": "note" }
  ],
  "conditions": [],
  "effects": [
    { "type": "delegation.grant", "app_id": "konkooria", "scope": "konkooria/subscription", "label": "تمدید خودکار طرح ماهانه",
      "cap": 1200000, "per_use_cap": 200000, "expires_at": "2027-03-08T00:00:00.000Z" },
    { "type": "app.action", "action": "activate_auto_subscription", "params": { "plan_id": "monthly" } }
  ],
  "policy": { "min_rung": 2, "quorum": "all", "settlement": "immediate" }
}
```

- محدوده: `scope`: رشته‌ای که قراردادهای بعدی زیر این وکالت باید با آن بخوانند: `template_ref` یا `type` قرارداد اجرایی باید **دقیقاً** برابر `scope` باشد. آن را برابر `template_ref` قالبی بگذارید که تمدید با آن ساخته می‌شود.
- سقف: `cap`: سقف کل خرج زیر این وکالت (تومان). `per_use_cap`: سقف هر اجرا. `expires_at`: ISO، در آینده، ≤ ۳۶۶ روز.
- برچسب: `label`: نام وکالت در فهرست کاربر و در پیام هر مصرف.
- تسویه: `settlement: 'immediate'` و `app.action` برای اینکه ابزار تحویل صدا زده شود و `delegation_id` را بگیرید. پول جابه‌جا نمی‌شود (اثر پولی ندارد)؛ مبلغ قرارداد برای پله = `cap`.
- مقدار `cap` را از آرگومان کاربر بگیرید (با `min/max`) یا از `cap_default`؛ همیشه در بندها بنویسید.

### گام ۳ — دریافت `delegation_id`

پس از امضای پلهٔ ۲ و اجرا، سکو یک وکالت با شناسهٔ `dlg_…` می‌سازد (`spent: 0`, `status: 'active'`) و ابزار تحویل را با `delegation_id` صدا می‌زند:

```json
{ "contract": { …قرارداد وکالت… }, "platform_signature": "…", "delegation_id": "dlg_9x2…" }
```

آن را کنار `user_ref` (از `contract.parties`) و `scope`/`cap`/`expires_at` ذخیره کنید و `{ "events": [{ "type": "note", "text": "تمدید خودکار فعال شد؛ در سررسید، اپ به نیابت از شما تمدید می‌کند و خبر می‌دهد." }] }` برگردانید. راه دیگری برای فهمیدن `delegation_id` نیست.

### گام ۴ — اجرا زیر وکالت: `POST /api/app-actions/delegated`

وقتی زمانش رسید (سررسید اشتراک)، اپ یک قرارداد عادی می‌سازد، اما **پیش از امضا** آن را به شکل نهاییِ زیر وکالت درمی‌آورد. سکو همهٔ این‌ها را بررسی می‌کند و در اولین نقض رد می‌کند:

| الزام | خطا در صورت نقض |
|---|---|
| `contract.delegation_id === delegation_id` | «قرارداد باید به همین وکالت اشاره کند (delegation_id).» |
| شرط `{ "type": "delegation.active", "delegation_id": "<همان>" }` در `conditions` | «شرط delegation.active در قرارداد نیست.» |
| طرف کاربر (`user:<id>` همان کاربرِ وکالت) با **`must_sign: false`** | «در اجرای زیر وکالت، کاربر غایب است و نباید امضاکننده باشد» / «کاربر طرف قرارداد نیست.» |
| فقط اثرهای `wallet.pay` و `app.action` | «زیر وکالت فقط پرداخت و اجرای خدمت مجاز است؛ مجوز یا وکالت تازه نمی‌شود داد.» |
| `template_ref === scope` یا `type === scope` | «این قرارداد خارج از محدودهٔ وکالت (…) است.» |
| مبلغ ≤ `per_use_cap` (اگر هست) | «مبلغ از سقف هر بار مصرف (…) بیشتر است.» |
| `spent + مبلغ ≤ cap` | «سقف وکالت کافی نیست (باقی‌مانده …).» |
| وکالت `active` و منقضی‌نشده، مالِ همین `app_id` | «وکالت لغو شده / منقضی شده / تمام شده است.» (403) / «وکیل نمی‌تواند وکالت را واگذار کند» (403) |
| `app_id` قرارداد = اپ | «قرارداد باید از سوی همان اپ باشد.» |
| امضای اپ روی هش سند **نهایی** | «امضای اپ معتبر نیست.» |
| بقیهٔ قاعده‌های `createContract` (یکتایی، انقضا، payee…) | همان کدهای `contract.md` |

بدنهٔ درخواست:

```json
{ "app_id": "konkooria", "delegation_id": "dlg_9x2…", "contract": { …سند نهایی… }, "app_signature": "<base64>" }
```

سند نهایی زیر وکالت (تفاوت‌ها با قرارداد حضوری پررنگ شده):

```json
{
  "vista": "1", "id": "ctr_…تازه…", "version": 1, "prev_version_id": null,
  "type": "konkooria.subscription", "template_ref": "konkooria/subscription", "app_id": "konkooria",
  "title": "تمدید خودکار اشتراک · طرح ماهانه",
  "parties": [
    { "id": "app:konkooria", "kind": "app", "role": "provider", "label": "کنکوریا", "must_sign": true },
    { "id": "user:usr_v2kqzs0nybxn61np", "kind": "user", "role": "payer", "label": "شما", "must_sign": false }
  ],
  "clauses": [
    { "key": "subject", "label": "موضوع", "value": "تمدید اشتراک زیر وکالت" },
    { "key": "plan", "label": "طرح", "value": "ماهانه — تا ۱۴۰۵/۰۷/۱۷" },
    { "key": "amount", "label": "مبلغ", "value": 200000, "kind": "amount" },
    { "key": "trigger", "label": "دلیل", "value": "سررسید اشتراک" }
  ],
  "open_clauses": [],
  "conditions": [{ "type": "wallet.sufficient" }, { "type": "delegation.active", "delegation_id": "dlg_9x2…" }],
  "effects": [
    { "type": "wallet.pay", "amount": 200000, "payee_app_id": "konkooria", "memo": "تمدید طرح ماهانه" },
    { "type": "app.action", "action": "renew_subscription", "params": { "plan_id": "monthly" } }
  ],
  "fees": [], "policy": { "min_rung": 1, "quorum": "all", "settlement": "on_delivery" },
  "appearance": { "color": "#1E88E5", "logo": "ک", "display_name": "کنکوریا" },
  "nonce": "n_…تازه…", "created_at": "…", "expires_at": "…+15m",
  "delegation_id": "dlg_9x2…"
}
```

پاسخ موفق (`200`):

```json
{ "ok": true, "contract_id": "ctr_…", "status": "executing", "delegation": { "spent": 400000, "cap": 1200000, "status": "active" } }
```

پس از آن سکو: قرارداد را با امضای اپ ثبت و بلافاصله اجرا می‌کند (مسدودی)، `spent` را جلو می‌برد، اگر `spent ≥ cap` شد وضعیت را `exhausted` می‌کند، قرارداد و رویداد «با وکالت … اجرا شد · مبلغ · باقی‌مانده · انقضا» را در گفت‌وگوی کاربر می‌گذارد، و **ابزار تحویل را با `delegation_id` صدا می‌زند**؛ `delivered` شما مثل همیشه کسر و `settled` می‌کند. اگر موجودی کافی نباشد، اجرا `failed` می‌شود و پاسخ `400 exec_failed` است؛ `spent` جلو نمی‌رود.

با کتابخانه:

```js
import { signContract } from './lib/vista-sign.mjs';
doc.delegation_id = delegationId;
doc.conditions = [{ type: 'wallet.sufficient' }, { type: 'delegation.active', delegation_id: delegationId }];
doc.parties = doc.parties.map((p) => (p.kind === 'user' ? { ...p, must_sign: false } : p));
const { contract, app_signature } = signContract(PRIVATE_KEY_PEM, doc);   // امضا بعد از نهایی شدن
await fetch(`${VISTA_URL}/api/app-actions/delegated`, { method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ app_id: APP_ID, delegation_id: delegationId, contract, app_signature }) });
```

### لغو، انقضا، اتمام

- **لغو** یک‌طرفه و فوری است: کاربر از فهرست وکالت‌ها لغو می‌کند یا اپ را حذف می‌کند. سکو در گفت‌وگو می‌نویسد «وکالت … لغو شد. از این لحظه اپ نمی‌تواند به نیابت از شما عمل کند.» و از همان لحظه هر `POST /api/app-actions/delegated` با `403 delegation` («وکالت لغو شده است.») رد می‌شود.
- **انقضا**: با گذشتن `expires_at`، وضعیت `expired` و همان `403`.
- **اتمام**: وقتی `spent ≥ cap`، وضعیت `exhausted` و همان `403` («وکالت تمام شده است.»).
- در این نسخه وب‌هوکی برای خبر دادن به اپ نیست؛ اپ از **پاسخ ۴۰۳** می‌فهمد. رفتار درست: وکالت را در سمت خودتان غیرفعال کنید، تلاش دوباره نکنید، و در تعامل بعدی کاربر (ابزار خواندنی یا مینی‌اپ) نشان دهید که تمدید خودکار خاموش است و اگر بخواهد می‌تواند وکالت تازه بدهد (قرارداد تازه، پلهٔ ۲).
- برای تمدید وکالت رو به اتمام، **وکالت تازه** بسازید؛ سقف وکالت موجود قابل افزایش نیست (هر تغییر = قرارداد تازه).

### چک‌لیست وکالت

- [ ] `financial_permissions` در مانیفست؛ نشان آبی از ویستا گرفته شده
- [ ] ابزار `build_*_delegation` با `delegation.grant` (cap، per_use_cap، expires_at ≤ ۱ سال، scope = template_ref قرارداد اجرایی)، `min_rung: 2`، `settlement: 'immediate'`، `app.action`
- [ ] ابزار تحویل `delegation_id` را کنار `user_ref` ذخیره می‌کند
- [ ] اجرای زیر وکالت: `delegation_id` + شرط `delegation.active` + `must_sign:false` برای کاربر + فقط `wallet.pay`/`app.action` + امضا **بعد** از نهایی شدن
- [ ] `403` → وکالت را خاموش کنید، تلاش دوباره نه
- [ ] هر اجرا سقف هر بار و سقف کل را پیش از ارسال خودتان هم بررسی می‌کند
