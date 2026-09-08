# سند قرارداد

قرارداد واحد پایهٔ ویستاست: هر کاری که وضعیتی را عوض می‌کند — پرداخت، ثبت‌نام، اعطای مجوز، وکالت — یک سند JSON است که **اپ می‌سازد و اول امضا می‌کند**، ویستا به کاربر نشان می‌دهد، و **کاربر آخر امضا می‌کند**. پس از امضای همه، پردازشگر سکو اثرها را اجرا می‌کند و اپ را برای تحویل صدا می‌زند. این سند مرجع کامل ساختار است؛ برای ساختن و امضا کردن از `lib/vista-sign.mjs` استفاده کنید.

## ساختار کلی

```ts
interface ContractDoc {
  vista: '1';                 // نسخهٔ پروتکل
  id: string;                 // یکتا، ≥ ۴ نویسه؛ مرسوم: 'ctr_' + ۱۶ نویسهٔ [0-9a-z]
  version: number;            // عدد صحیح مثبت؛ قرارداد تازه = 1
  prev_version_id: string | null; // شناسهٔ نسخهٔ قبلی؛ برای نسخهٔ ۱ null
  type: string;               // نوع منطقی، مثل 'konkooria.enrollment'
  template_ref: string;       // ارجاع به قالب، مثل 'konkooria/enrollment' (می‌تواند '' باشد)
  app_id: string;             // شناسهٔ اپ نزد ویستا — همان manifest.id
  title: string;              // عنوان کوتاه فارسی؛ در گفت‌وگو و فهرست قراردادها دیده می‌شود
  parties: Party[];           // دست‌کم ۲ طرف
  clauses: Clause[];          // بندها — آنچه کاربر می‌خواند و امضا می‌کند
  open_clauses: OpenClause[]; // بندهای باز؛ ناتهی = پیش‌نویس
  conditions: Condition[];    // شرط‌های اجرا
  effects: Effect[];          // اثرها — آنچه پردازشگر اجرا می‌کند
  fees: Fee[];                // سهم‌ها/کارمزدها، ثبت در دفتر
  policy: Policy;             // کف پله، حد نصاب، نحوهٔ تسویه
  appearance: Appearance;     // رنگ، نشان، نام نمایشی — خارج از هش
  nonce: string;              // یکتای یک‌بارمصرف، ≥ ۸ نویسه؛ مرسوم ۲۰ نویسه
  created_at: string;         // ISO 8601
  expires_at: string;         // ISO 8601؛ مهلت امضا. باید در آینده باشد
  delegation_id?: string;     // فقط در اجرای زیر وکالت
}
```

## طرف‌ها (`parties`)

```ts
interface Party {
  id: string;        // 'app:<app_id>' | 'user:<user_id>' | 'phone:09…' | 'platform'
  kind: 'app' | 'user' | 'platform';
  role: string;      // initiator | payer | payee | provider | approver | participant | witness
  label: string;     // نام نمایشی ('کنکوریا'، 'شما'، نام کاربر اگر دارید)
  must_sign: boolean;
  visible_clauses?: string[]; // کلید بندهایی که این طرف می‌بیند؛ غایب = همه
}
```

قاعده‌ها:

- شناسهٔ کاربر **دقیقاً** همان `_meta.vista.user_id` است که در فراخوانی ابزار گرفته‌اید (`user:<id>`). ویستا بررسی می‌کند کاربرِ درخواست‌کننده طرف قرارداد باشد؛ وگرنه خطای `party`.
- شناسهٔ اپ `app:<app_id>` است با `kind: 'app'` و معمولاً `role: 'provider'` و `must_sign: true`. امضای اپ روی هش همین سند، در خروجی ابزار ساختن می‌آید.
- `must_sign: true` برای کاربر در همهٔ قراردادهای حضوری؛ فقط در اجرای زیر وکالت `false` است (کاربر غایب است).
- حد نصاب `all` است: همهٔ طرف‌های `must_sign` باید امضا کنند تا اجرا شود.
- `phone:09…` برای طرفی است که هنوز کاربر ویستا نیست (اشتراک‌گذاری قرارداد)؛ در این نسخه فقط پذیرفته می‌شود، حل نمی‌شود.

## بندها (`clauses`)

```ts
interface Clause {
  key: string;      // یکتا در سند، لاتین: 'subject' | 'amount' | 'course' | …
  label: string;    // برچسب فارسی: 'موضوع' | 'مبلغ' | 'دوره'
  value: string | number | null;
  kind?: 'text' | 'amount' | 'date' | 'phone' | 'number' | 'list' | 'note';
  visible_to?: string[]; // شناسه یا نقش طرف‌هایی که می‌بینند؛ غایب = همه
}
```

بندها همان چیزی‌اند که کاربر می‌خواند؛ ویستا آن‌ها را به ترتیب سند، با چیدمان ثابت خودش نشان می‌دهد. توصیه‌ها:

- همیشه یک بند `subject` («موضوع») اول بیاورید.
- برای هر قرارداد پولی یک بند با `kind: 'amount'` و مقدار **عددی به تومان** بگذارید؛ ویستا آن را با جداکننده و واژهٔ «تومان» نمایش می‌دهد. مقدارش باید با اثر `wallet.pay` یکی باشد.
- `list` را با مقدار رشته‌ای چندخطی (`\n`) بدهید.
- `note` برای توضیح‌های قاعده‌ای (بازگشت وجه، لغو).
- بند «تحویل/فعال‌سازی» بنویسید که دقیقاً بگوید بعد از امضا چه می‌شود و کِی پول کسر می‌شود.

## بندهای باز و پیش‌نویس (`open_clauses`)

```ts
interface OpenClause { key: string; owner: string; label: string; kind?: Clause['kind'] }
```

سندی که `open_clauses` ناتهی دارد **پیش‌نویس** است: ویستا آن را با وضعیت `draft` و بدون هیچ امضایی ثبت می‌کند (امضای اپ لازم نیست و سنجیده نمی‌شود) و کسی را متعهد نمی‌کند. در این نسخه، مسیر پر کردن بند باز و تبدیل پیش‌نویس به قرارداد امضاپذیر در سکو نیست؛ پس **ابزارهای ساختن باید سند نهایی با `open_clauses: []` برگردانند** و اگر داده‌ای کم است، با `isError` بگویند چه چیزی لازم است تا دستیار از کاربر بپرسد.

## شرط‌ها (`conditions`)

```json
{ "type": "wallet.sufficient" }
{ "type": "delegation.active", "delegation_id": "dlg_…" }
{ "type": "app.installed", "app_id": "konkooria" }
```

- `wallet.sufficient`: اعلام اینکه اجرا به موجودی کافی وابسته است. خودِ مسدودی (`hold`) موجودی را می‌سنجد؛ در قراردادهای `wallet.pay` بگذارید.
- `delegation.active`: در اجرای زیر وکالت **الزامی** است و پردازشگر فعال بودن وکالت را با آن می‌سنجد.
- `app.installed`: پذیرفته می‌شود؛ در این نسخه اجرا آن را نمی‌سنجد (نصب بودن اپ پیش از هر فراخوانی ابزار بررسی شده است).

## اثرها (`effects`)

هفت نوع اثر وجود دارد. اپ فقط سه تای اول را می‌سازد؛ بقیه مالِ سکو و اپ‌های سیستمی‌اند.

| اثر | JSON دقیق | چه می‌کند | چه کسی می‌سازد |
|---|---|---|---|
| پرداخت | `{ "type": "wallet.pay", "amount": 1850000, "payee_app_id": "konkooria", "memo": "ریاضی جامع" }` | مبلغ (تومان، عدد صحیح مثبت) از کیف پول کاربر به اپ. `payee_app_id` **باید** همان `app_id` باشد. `memo` اختیاری. | اپ |
| اجرای خدمت | `{ "type": "app.action", "action": "enroll", "params": { "course_id": "math-101" } }` | هیچ اثری در سکو ندارد جز اینکه پس از اجرا، ابزار تحویل اپ صدا زده می‌شود و این شیء را در قرارداد می‌بیند. `params` هر شیء JSON. | اپ |
| اعطای وکالت | `{ "type": "delegation.grant", "app_id": "konkooria", "scope": "konkooria/subscription", "label": "تمدید ماهانهٔ اشتراک", "cap": 2400000, "per_use_cap": 200000, "expires_at": "2027-09-01T00:00:00.000Z" }` | یک وکالت فعال می‌سازد. `cap` و `expires_at` اجباری، `per_use_cap` اختیاری اما توصیه‌شده. فقط اپ **احرازشده**؛ انقضا در آینده و حداکثر یک سال؛ پلهٔ ۲. | اپ |
| نصب اپ | `{ "type": "app.install", "app_id": "…", "permissions": ["notify", "financial:auto_subscription"] }` | قرارداد استارت؛ مجوزها همین‌جا داده می‌شوند. | ویستا (ویترین) |
| اعطای مجوز | `{ "type": "permission.grant", "app_id": "…", "permissions": ["profile.read"] }` | مجوز تازه به اپ نصب‌شده. | ویستا |
| شارژ کیف پول | `{ "type": "wallet.topup", "amount": 500000 }` | پس از تأیید درگاه، کیف پول شارژ می‌شود. | ویستا (مالی) |
| آغاز | `{ "type": "genesis", "system_apps": [ … ] }` | نخستین قرارداد کاربر با سکو. | ویستا |

ترکیب مرسوم اپ: `wallet.pay` + `app.action` در یک قرارداد (پول و خدمت با هم)؛ یا `delegation.grant` + `app.action` برای فعال کردن اتوماسیون. چند `wallet.pay` مجاز است و مبلغ‌ها جمع می‌شوند، اما بهتر است یکی باشد.

## سهم‌ها (`fees`)

```ts
interface Fee { beneficiary: string; amount: number; label?: string; visible?: boolean }
```

سهم‌ها هنگام اجرا در دفتر ثبت می‌شوند (`fee.recorded`) و از مبلغ `wallet.pay` جدا **کسر نمی‌شوند**؛ تقسیم مبلغ میان ذی‌نفعان را توصیف می‌کنند. `visible: true` آن را در نمای قرارداد به کاربر نشان می‌دهد. اپ مرجع کارمزد ۱٪ سکو را با `beneficiary: 'vista'` و `visible: false` می‌گذارد؛ نرخ واقعی را با ویستا توافق کنید. `amount` عدد صحیح نامنفی.

## سیاست (`policy`)

```json
{ "min_rung": 1, "quorum": "all", "settlement": "on_delivery" }
```

- `min_rung`: کف پلهٔ امضا که قالب می‌خواهد (۱ تا ۵)؛ سکو می‌تواند بالا ببرد (جدول پایین). برای خرید معمولی ۱، برای وکالت ۲.
- `quorum`: در این نسخه فقط `'all'`.
- `settlement`:
  - `on_delivery` — هنگام اجرا مبلغ **مسدود** می‌شود (`held`)؛ وقتی اپ رویداد `delivered` بدهد **کسر** می‌شود (`deducted`) و قرارداد `settled` می‌شود. `cancelled` یا `failed` مسدودی را آزاد می‌کند. برای خدمتی که تحویلش لحظه‌ای نیست، این را انتخاب کنید.
  - `immediate` — هنگام اجرا مسدود و بلافاصله کسر می‌شود. ابزار تحویل باز هم صدا زده می‌شود؛ `delivered` فقط وضعیت را `settled` می‌کند.

## ظاهر (`appearance`)

```json
{ "color": "#1E88E5", "logo": "ک", "display_name": "کنکوریا" }
```

رنگ مالِ اپ است، چیدمان مالِ سکو. `appearance` **در هش نیست**؛ می‌توانید بدون باطل شدن امضا آن را عوض کنید، و به همین دلیل هیچ‌چیزِ تعهدآور را در آن نگذارید. مقادیر رشته و الزامی‌اند (می‌توانند با مانیفست یکی باشند).

## یکتاها و زمان‌ها

- `id`: یکتا در کل سکو؛ تکراری → خطای `dup`. از `newId('ctr')` استفاده کنید.
- `nonce`: یکتا در کل سکو و **یک‌بارمصرف**؛ تکراری → خطای `nonce`. برای هر سند (حتی نسخهٔ تازه) `nonce` تازه بسازید.
- `created_at`: زمان ساخت (ISO). `expires_at`: مهلت امضا؛ اگر هنگام ثبت گذشته باشد → `expired`. مرسوم: ۱۵ دقیقه برای خرید، ۶۰ دقیقه برای استارت/وکالت، حداکثر ۲۴ ساعت. سکو هر دقیقه قراردادهای منقضی را می‌بندد.
- `version` / `prev_version_id`: هر تغییر در بندها یعنی سند تازه با `version + 1`، `prev_version_id` = شناسهٔ قبلی، **`id` و `nonce` تازه**، و امضای تازهٔ اپ. امضاهای نسخهٔ قبل به درد نسخهٔ تازه نمی‌خورند چون هش عوض شده است.

## مبلغ قرارداد

مبلغ قرارداد (برای سقف‌ها و پله) این‌طور حساب می‌شود: جمع `amount` همهٔ `wallet.pay` و `wallet.topup`؛ و اگر `delegation.grant` هست، بیشینهٔ آن جمع و `cap` وکالت.

## چرخهٔ عمر

```
                 ابزار build_* اپ
                        │  {contract, canonical_hash, app_signature}
                        ▼
   open_clauses ≠ []  ┌──────────┐   open_clauses = []  ┌──────────┐
  ┌───────────────────│  سند     │──────────────────────│ awaiting │  امضای اپ ثبت شد؛ منتظر امضای کاربر
  ▼                   └──────────┘                      └────┬─────┘
draft (بی‌امضا)                                              │ کاربر امضا کرد (پلهٔ ۱: درخواست احرازشده · پلهٔ ۲: رمز یک‌بارمصرف)
  │ reject/expire                                            ▼
  ▼                                                     ┌──────────┐
rejected / expired                                      │  signed  │  همهٔ must_sign امضا کردند
                                                        └────┬─────┘
                                     پردازشگر: هش، امضاها، پله، شرط‌ها؛ سپس اثرها (اتمی)
                                                             ▼
                            ┌─── ناموفق (موجودی کم، وکالت غیرفعال…) ──► failed (مسدودی آزاد)
                            │
                        ┌──────────┐  wallet.pay → held (+ deducted اگر immediate)
                        │executing │  ابزار تحویل اپ صدا زده می‌شود: {contract, platform_signature}
                        └────┬─────┘
       delivered ───────────┼──────────► settled   (on_delivery: deducted همین‌جا)
       cancelled / failed ──┼──────────► cancelled / failed  (مسدودی آزاد)
       refunded ────────────┼──────────► refunded  (مبلغ به کیف پول برمی‌گردد)
       disputed (کاربر) ────┴──────────► disputed  (پشتیبانی)
```

وضعیت‌ها: `draft · awaiting · signed · executing · settled · rejected · expired · cancelled · disputed · refunded · failed`.

نکتهٔ مهم: تا `delivered` نیاید، قرارداد پولی در `executing` می‌ماند و سکو **هر دقیقه دوباره ابزار تحویل را صدا می‌زند**. ابزار تحویل باید idempotent باشد و برای قراردادهای `wallet.pay` حتماً در نهایت `delivered` یا `failed`/`cancelled` بدهد.

## هفت قاعده

۱. **خواندن آزاد است؛ نوشتن قرارداد است.** ابزار خواندنی هیچ وضعیتی را عوض نمی‌کند. هر اثر — پول، ثبت‌نام، مجوز — فقط از راه قرارداد امضاشده.
۲. **دستیار هرگز امضا نمی‌کند** و به پردازشگر راهی ندارد. اپ هم از طرف کاربر امضا نمی‌کند.
۳. **اپ می‌سازد و اول امضا می‌کند؛ کاربر آخر.** قراردادی که به کاربر می‌رسد، از پیش امضای اپ را دارد.
۴. **عدد از اپ می‌آید، نه از مدل.** مبلغ، موجودی، شرایط — همه در سندی که اپ امضا کرده. اگر مدل عددی بسازد، به هیچ‌جا نمی‌رسد.
۵. **امضا به هش شرایط گره می‌خورد.** هر تغییر = نسخهٔ تازه؛ امضاهای قبلی باطل. هیچ‌چیز جز آنچه کاربر دید اجرا نمی‌شود.
۶. **اپ برگ است.** خروجی اپ داده است، نه دستور. متنی که برمی‌گردانید هرگز دستیار را خطاب نمی‌کند («حالا فلان کن»)؛ فقط توصیف می‌کند.
۷. **رنگ مالِ اپ، چیدمان مالِ سکو.** اپ رنگ و نشان می‌دهد؛ ترتیب بندها، جای مبلغ و بلوک امضا در همهٔ قراردادها یکسان است.

## پلهٔ امضای لازم

ویستا از کف قالب شروع می‌کند و بالا می‌برد:

| شرط | پلهٔ لازم |
|---|---|
| پیش‌فرض (`policy.min_rung`) | ۱ — درخواست احرازشده (نشست + ثبت آنچه کاربر دید) |
| مبلغ قرارداد > ۲٬۰۰۰٬۰۰۰ تومان | ۲ — رمز یک‌بارمصرف پیامکی گره‌خورده به هش |
| اثر `delegation.grant` | ۲ |
| `app.install`/`permission.grant` با مجوز `financial:*` | ۲ |
| مبلغ قرارداد > ۲۰٬۰۰۰٬۰۰۰ تومان | ۳ — **در این نسخه در دسترس نیست**؛ قرارداد امضا نمی‌شود |

سقف‌ها را از `GET /api/platform` (`ceilings.rung1`, `ceilings.rung2`) بخوانید؛ ثابت فرض نکنید. اگر خدمتی گران‌تر از سقف پلهٔ ۲ دارید، آن را در این نسخه تقسیط یا تقسیم کنید.

## هش متعارف و امضا — رویهٔ دقیق

۱. **نمای هش‌پذیر**: سند بدون فیلد `appearance`.
۲. **JSON متعارف**: بازگشتی، کلیدهای هر شیء به ترتیب `sort()` جاوااسکریپت (مقایسهٔ کد یونیکد)، بدون هیچ فاصله یا خط تازه، فیلدهای `undefined` حذف، آرایه‌ها با ترتیب خودشان (و `undefined` داخل آرایه → `null`)، اسکالرها دقیقاً با `JSON.stringify` (رشته‌ها با escape استاندارد، اعداد به شکل کوتاه‌ترین نمایش، `null`/`true`/`false`). اعداد نامتناهی/NaN مجاز نیستند.
۳. **هش**: `sha256` روی بایت‌های UTF-8 آن رشته، خروجی hex با حروف کوچک (۶۴ نویسه).
۴. **امضا**: Ed25519 با کلید خصوصی اپ روی بایت‌های UTF-8 **همان رشتهٔ hex** (نه بایت‌های خام هش)، خروجی base64.
۵. **خروجی ابزار**: `{ "contract": <سند کامل با appearance>, "canonical_hash": <hex>, "app_signature": <base64> }`.

ویستا هش را خودش دوباره حساب می‌کند و امضا را با `public_key` مانیفست می‌سنجد؛ `canonical_hash` شما فقط برای هم‌خوانی است. پیاده‌سازی مرجع در `lib/vista-sign.mjs` است و با سکو بایت‌به‌بایت آزموده شده؛ اگر زبان دیگری دارید، همان الگوریتم را پیاده کنید و با نمونهٔ زیر بسنجید.

### نمونهٔ کامل

سند ورودی (`appearance` هست اما در هش نمی‌آید):

```json
{
  "vista": "1", "id": "ctr_k7f2m9q1x4z8b3n6", "version": 1, "prev_version_id": null,
  "type": "konkooria.enrollment", "template_ref": "konkooria/enrollment", "app_id": "konkooria",
  "title": "ثبت‌نام دوره · ریاضی جامع کنکور",
  "parties": [
    { "id": "app:konkooria", "kind": "app", "role": "provider", "label": "کنکوریا", "must_sign": true },
    { "id": "user:usr_v2kqzs0nybxn61np", "kind": "user", "role": "payer", "label": "شما", "must_sign": true }
  ],
  "clauses": [
    { "key": "subject", "label": "موضوع", "value": "ثبت‌نام در دورهٔ آموزشی" },
    { "key": "course", "label": "دوره", "value": "ریاضی جامع کنکور — ۴۸ جلسه" },
    { "key": "amount", "label": "مبلغ", "value": 1850000, "kind": "amount" },
    { "key": "access", "label": "دسترسی", "value": "بلافاصله پس از امضا؛ مبلغ اول مسدود و پس از فعال شدن دسترسی کسر می‌شود" },
    { "key": "refund", "label": "بازگشت وجه", "value": "تا ۷ روز، اگر کمتر از ۳ جلسه دیده شده باشد", "kind": "note" }
  ],
  "open_clauses": [], "conditions": [{ "type": "wallet.sufficient" }],
  "effects": [
    { "type": "wallet.pay", "amount": 1850000, "payee_app_id": "konkooria", "memo": "ریاضی جامع کنکور" },
    { "type": "app.action", "action": "enroll", "params": { "course_id": "math-101" } }
  ],
  "fees": [{ "beneficiary": "vista", "amount": 18500, "label": "کارمزد سکو", "visible": false }],
  "policy": { "min_rung": 1, "quorum": "all", "settlement": "on_delivery" },
  "appearance": { "color": "#1E88E5", "logo": "ک", "display_name": "کنکوریا" },
  "nonce": "n_8h2k5m9p1r4t7w0y3a6c", "created_at": "2026-09-08T10:00:00.000Z", "expires_at": "2026-09-08T10:15:00.000Z"
}
```

JSON متعارف (یک خط، ۱۳۴۰ نویسه؛ توجه به ترتیب کلیدها و نبودِ `appearance`):

```
{"app_id":"konkooria","clauses":[{"key":"subject","label":"موضوع","value":"ثبت‌نام در دورهٔ آموزشی"},{"key":"course","label":"دوره","value":"ریاضی جامع کنکور — ۴۸ جلسه"},{"key":"amount","kind":"amount","label":"مبلغ","value":1850000},{"key":"access","label":"دسترسی","value":"بلافاصله پس از امضا؛ مبلغ اول مسدود و پس از فعال شدن دسترسی کسر می‌شود"},{"key":"refund","kind":"note","label":"بازگشت وجه","value":"تا ۷ روز، اگر کمتر از ۳ جلسه دیده شده باشد"}],"conditions":[{"type":"wallet.sufficient"}],"created_at":"2026-09-08T10:00:00.000Z","effects":[{"amount":1850000,"memo":"ریاضی جامع کنکور","payee_app_id":"konkooria","type":"wallet.pay"},{"action":"enroll","params":{"course_id":"math-101"},"type":"app.action"}],"expires_at":"2026-09-08T10:15:00.000Z","fees":[{"amount":18500,"beneficiary":"vista","label":"کارمزد سکو","visible":false}],"id":"ctr_k7f2m9q1x4z8b3n6","nonce":"n_8h2k5m9p1r4t7w0y3a6c","open_clauses":[],"parties":[{"id":"app:konkooria","kind":"app","label":"کنکوریا","must_sign":true,"role":"provider"},{"id":"user:usr_v2kqzs0nybxn61np","kind":"user","label":"شما","must_sign":true,"role":"payer"}],"policy":{"min_rung":1,"quorum":"all","settlement":"on_delivery"},"prev_version_id":null,"template_ref":"konkooria/enrollment","title":"ثبت‌نام دوره · ریاضی جامع کنکور","type":"konkooria.enrollment","version":1,"vista":"1"}
```

هش (sha256 hex):

```
c4dbec5dbf150a24d1050d62c97c97ba04021e9484e45e25eaeb71b5dbededc3
```

با کلید عمومی آزمایشی `hPYFy+U95wAMlbzldsM9SUXZ8Q8IJuaqqXyKnNyjbQw=` امضای Ed25519 روی رشتهٔ hex بالا:

```
MN1k+RtTJaKCU8UFfzYV36gECzwv7SaoVSaPaa0iJlrViMfA+oyUnNfp+Qdn74W8jPQCBztCmnNsDYzjJUd+Ag==
```

راستی‌آزمایی با کتابخانه: `verify('hPYFy+U9…', 'c4dbec5d…', 'MN1k+RtT…') === true`. اگر پیاده‌سازی شما برای همین سند همین JSON متعارف و همین هش را نمی‌دهد، منطبق نیست؛ رایج‌ترین خطاها: فاصله در JSON، مرتب نکردن کلیدهای تودرتو، حذف نکردن `undefined`، امضا روی بایت‌های خام هش به جای رشتهٔ hex، و نگه داشتن `appearance` در هش.

```js
import { signContract, verify } from './lib/vista-sign.mjs';
const out = signContract(PRIVATE_KEY_PEM, doc);   // { contract, canonical_hash, app_signature }
verify(PUBLIC_KEY_B64, out.canonical_hash, out.app_signature); // true
```

## خطاهایی که ویستا هنگام ثبت برمی‌گرداند

ثبت قرارداد (`createContract`) به این ترتیب بررسی می‌کند و در اولین خطا می‌ایستد. پیام به دستیار/کاربر نشان داده می‌شود.

| کد | پیام | علت |
|---|---|---|
| `doc_invalid` | ساختار قرارداد نامعتبر است: `<مسیر> <پیام>` | نقض اسکیمای بالا (مثلاً `amount` غیرصحیح، `nonce` کوتاه، `kind` ناشناخته) |
| `app_unknown` | اپ سازندهٔ قرارداد شناخته نشده است. | `app_id` با شناسهٔ رجیستری ویستا یکی نیست |
| `dup` | شناسهٔ قرارداد تکراری است. | `id` قبلاً ثبت شده |
| `nonce` | یکتای قرارداد قبلاً استفاده شده است. | `nonce` تکراری |
| `party` | شما طرف این قرارداد نیستید. | طرفی با `user:<id>` کاربر درخواست‌کننده نیست |
| `payee` | اپ نمی‌تواند پرداخت را به اپ دیگری هدایت کند. | `wallet.pay.payee_app_id !== app_id` |
| `scope` | اثر قرارداد خارج از محدودهٔ اپ است. | `app.install`/`permission.grant`/`delegation.grant` با `app_id` دیگر |
| `unverified` | فقط اپ احرازشده می‌تواند اختیار مالی (وکالت) بخواهد. | `delegation.grant` از اپ بدون نشان آبی |
| `delegation_expiry` | انقضای وکالت باید در آینده باشد. / وکالت بیش از یک سال مجاز نیست. | `expires_at` وکالت |
| `expired` | قرارداد پیش از ثبت منقضی شده است. | `expires_at` سند گذشته |
| `app_signature` | امضای اپ روی قرارداد معتبر نیست. | هش یا امضا با کلید مانیفست نمی‌خواند (فقط برای سند نهایی؛ پیش‌نویس امضا نمی‌خواهد) |

خطاهای هنگام امضا/اجرا: `status` (در وضعیت امضا نیست)، `dup_sig`، `rung` (پلهٔ ناکافی)، `rung_unavailable` (پلهٔ ≥ ۳)، `app_down` (اپ در بازبینی سلامت پایین است — قراردادش امضا نمی‌شود)، `otp`، `hash` (سند با نسخهٔ ثبت‌شده نمی‌خواند)، `quorum`، `delegation` (وکالت فعال نیست)، `exec_failed` (مثلاً «موجودی کیف پول کافی نیست.» → وضعیت `failed`).
