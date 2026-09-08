# نمونهٔ کامل — کنکوریا در ویستا

کنکوریا سرویس آمادگی کنکور است: برنامهٔ مطالعه، آزمون‌های آزمایشی، کارنامه، دوره‌های آموزشی و اشتراک ماهانه. این سند نشان می‌دهد همین سرویس چگونه یک اپ ویستا می‌شود: کدام کارها «خواندن» است و رایگان، کدام‌ها «قرارداد» می‌خواهد، و اشتراک ماهانه چگونه با وکالت خودکار می‌شود. مبالغ به تومان و واقع‌بینانه‌اند.

## نگاشت

| در کنکوریا | در ویستا | ابزار |
|---|---|---|
| دیدن برنامهٔ مطالعهٔ امروز/هفته | خواندن | `get_study_plan` |
| فهرست آزمون‌های پیشِ رو | خواندن | `list_exams` |
| کارنامه و درصدها | خواندن | `get_results` |
| فهرست دوره‌ها و قیمت | خواندن | `list_courses` |
| ثبت‌نام در دوره | قرارداد (پرداخت + فعال‌سازی) | `build_course_enrollment_contract` |
| ثبت‌نام در آزمون آزمایشی | قرارداد (پرداخت + رزرو صندلی) | `build_exam_registration_contract` |
| اشتراک ماهانه با تمدید خودکار | قرارداد وکالت + اجرا زیر وکالت هر ماه | `build_monthly_subscription_delegation` |
| تحویل همهٔ این‌ها | ابزار تحویل | `vista_fulfil` |
| داشبورد دانش‌آموز | مینی‌اپ | `https://konkooria.ir/vista/mini` |

هر چیزی که وضعیتی را عوض نمی‌کند (برنامه، کارنامه، فهرست) ابزار خواندنی است و بی‌قرارداد. هر چیزی که پول یا تعهد دارد (ثبت‌نام، اشتراک) قرارداد است. تغییر تنظیمات بی‌پول (مثلاً «برنامه‌ام را برای رشتهٔ تجربی بچین») هم می‌تواند قرارداد بدون `wallet.pay` باشد (فقط `app.action`)، اما اگر کم‌اهمیت است، بهتر است در مینی‌اپ انجام شود.

## مانیفست

```json
{
  "vista": "1",
  "id": "konkooria",
  "name": "کنکوریا",
  "description": "برنامهٔ مطالعه، آزمون آزمایشی، کارنامه و دوره‌های کنکور.",
  "long_description": "کنکوریا با بیش از ۲۰ هزار دانش‌آموز: برنامهٔ مطالعهٔ شخصی، آزمون‌های آزمایشی هماهنگ، کارنامهٔ تحلیلی، و دوره‌های آموزشی. در ویستا برنامه و کارنامه‌تان را از دستیار بپرسید و ثبت‌نام و اشتراک را با قرارداد و امضا انجام دهید.",
  "company": { "name": "شرکت دانش‌بنیان کنکوریا", "registration": "1234567890" },
  "public_key": "<base64 از ۳۲ بایت خام Ed25519 — از publicKeyOf(privateKeyPem)>",
  "appearance": { "color": "#1E88E5", "logo": "ک" },
  "category": "آموزش",
  "permissions": [
    { "key": "notify", "label": "ارسال اعلان به من", "description": "یادآوری برنامهٔ روزانه، اعلام کارنامه، سررسید اشتراک" },
    { "key": "profile.read", "label": "خواندن پروفایل من", "description": "نام و شمارهٔ موبایل، برای اتصال به حساب کنکوریا و اینکه هر بار نپرسد" }
  ],
  "financial_permissions": [
    { "key": "auto_subscription", "label": "تمدید خودکار اشتراک ماهانه", "cap_default": 1200000, "period": "monthly",
      "description": "وکالت سقف‌دار و زمان‌دار برای تمدید اشتراک در سررسید؛ هر مصرف اطلاع داده می‌شود" }
  ],
  "data_permissions": ["profile.phone", "profile.name"],
  "tools": {
    "read": ["get_study_plan", "list_exams", "get_results", "list_courses"],
    "build": ["build_course_enrollment_contract", "build_exam_registration_contract", "build_monthly_subscription_delegation"],
    "fulfil": "vista_fulfil"
  },
  "mini_app_url": "https://konkooria.ir/vista/mini",
  "templates": [
    { "ref": "konkooria/enrollment", "title": "ثبت‌نام دوره", "min_rung": 1, "settlement": "on_delivery", "description": "پرداخت پس از فعال شدن دسترسی کسر می‌شود" },
    { "ref": "konkooria/exam", "title": "ثبت‌نام آزمون آزمایشی", "min_rung": 1, "settlement": "on_delivery" },
    { "ref": "konkooria/auto-subscription", "title": "وکالت تمدید خودکار اشتراک", "min_rung": 2, "settlement": "immediate" },
    { "ref": "konkooria/subscription", "title": "تمدید اشتراک (زیر وکالت)", "min_rung": 1, "settlement": "on_delivery" }
  ]
}
```

شناسهٔ `konkooria` باید همانی باشد که ویستا اپ را زیر آن در کاتالوگ ثبت می‌کند؛ با تیم ویستا توافق کنید.

## اتصال کاربر ویستا به حساب کنکوریا

کاربر ویستا با `user_ref` (شبه‌نام پایدار) می‌آید و اگر مجوز `profile.read` داده باشد، `phone` و `name` هم. راهبرد:

۱. جدول `vista_links (user_ref, konkooria_user_id, phone, linked_at)`.
۲. در هر فراخوانی: اگر `user_ref` در جدول هست → همان کاربر. اگر نه و `phone` آمده و در کنکوریا حساب دارد → پیوند بزنید (شماره در ویستا با شاهکار احراز شده است). اگر نه → حساب تازه با همان شماره بسازید (کنکوریا با شماره کار می‌کند) یا در پاسخ ابزار خواندنی بگویید `"linked": false` و مینی‌اپ را برای ورود پیشنهاد دهید.
۳. هرگز شمارهٔ ویستا را با شماره‌ای که کاربر در گفت‌وگو تایپ کرده جایگزین نکنید؛ فقط `_meta.vista.phone` معتبر است.

## ابزارهای خواندنی

```js
// get_study_plan — برنامهٔ مطالعه
inputSchema: { range: z.enum(['today', 'week']).default('today') }
→ { "linked": true, "range": "today", "date": "۱۴۰۵/۰۶/۱۷", "items": [
     { "subject": "ریاضی", "topic": "مشتق", "minutes": 90, "done": false },
     { "subject": "زیست", "topic": "ژنتیک", "minutes": 60, "done": true } ],
   "total_minutes": 150, "streak_days": 12 }

// list_exams — آزمون‌های پیشِ رو
inputSchema: {}
→ { "exams": [
     { "id": "ex-1405-07-03", "title": "آزمون جامع ۳ مهر", "date": "1405-07-03", "price_toman": 120000, "registered": false, "seats_left": 240 },
     { "id": "ex-1405-07-17", "title": "آزمون جامع ۱۷ مهر", "date": "1405-07-17", "price_toman": 120000, "registered": true } ] }

// get_results — کارنامه
inputSchema: { exam_id: z.string().optional().describe('اگر خالی باشد آخرین آزمون') }
→ { "exam": "آزمون جامع ۲۰ شهریور", "rank": 1420, "of": 18300, "percentages": { "ریاضی": 46.7, "فیزیک": 33.3, "شیمی": 60.0 }, "advice": "تمرکز هفتهٔ آینده روی فیزیک — الکتریسیته" }

// list_courses — دوره‌ها
inputSchema: { subject: z.string().optional() }
→ { "courses": [
     { "id": "math-101", "title": "ریاضی جامع کنکور", "sessions": 48, "teacher": "…", "price_toman": 1850000, "enrolled": false },
     { "id": "phys-201", "title": "فیزیک — الکتریسیته", "sessions": 12, "price_toman": 850000, "enrolled": false },
     { "id": "bundle-3", "title": "بستهٔ سه‌درس تجربی", "sessions": 120, "price_toman": 3900000, "enrolled": false } ] }
```

همه با `annotations: { readOnlyHint: true }`؛ همه JSON فشرده؛ `advice` داده است نه دستور (به کاربر گفته می‌شود، نه به دستیار).

## ابزارهای ساختن قرارداد

### `build_course_enrollment_contract`

```js
inputSchema: { course_id: z.string().describe('شناسهٔ دوره از list_courses') }
```

قیمت را از پایگاه دادهٔ کنکوریا بخوانید (نه از آرگومان). اگر دوره پر است یا کاربر قبلاً ثبت‌نام کرده، `isError` با پیام فارسی. سند خروجی (همان نمونهٔ `contract.md`، همین سند با هش `c4dbec5d…` است):

```json
{
  "contract": {
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
    "open_clauses": [],
    "conditions": [{ "type": "wallet.sufficient" }],
    "effects": [
      { "type": "wallet.pay", "amount": 1850000, "payee_app_id": "konkooria", "memo": "ریاضی جامع کنکور" },
      { "type": "app.action", "action": "enroll", "params": { "course_id": "math-101" } }
    ],
    "fees": [{ "beneficiary": "vista", "amount": 18500, "label": "کارمزد سکو", "visible": false }],
    "policy": { "min_rung": 1, "quorum": "all", "settlement": "on_delivery" },
    "appearance": { "color": "#1E88E5", "logo": "ک", "display_name": "کنکوریا" },
    "nonce": "n_8h2k5m9p1r4t7w0y3a6c",
    "created_at": "2026-09-08T10:00:00.000Z", "expires_at": "2026-09-08T10:15:00.000Z"
  },
  "canonical_hash": "c4dbec5dbf150a24d1050d62c97c97ba04021e9484e45e25eaeb71b5dbededc3",
  "app_signature": "<Ed25519 با کلید کنکوریا روی رشتهٔ hex بالا>"
}
```

پلهٔ لازم: ۱ (۱٬۸۵۰٬۰۰۰ ≤ ۲٬۰۰۰٬۰۰۰). برای «بستهٔ سه‌درس» ۳٬۹۰۰٬۰۰۰ تومانی، پله خودبه‌خود ۲ می‌شود (رمز پیامکی) — `min_rung` را همان ۱ بگذارید، سکو بالا می‌برد. دوره‌ای گران‌تر از ۲۰٬۰۰۰٬۰۰۰ تومان در این نسخه امضاپذیر نیست؛ قسط‌بندی کنید.

کد ساختن (با `lib/vista-sign.mjs`):

```js
server.registerTool('build_course_enrollment_contract',
  { title: 'قرارداد ثبت‌نام دوره', description: 'قرارداد ثبت‌نام در یک دوره را می‌سازد و امضا می‌کند. مبلغ به تومان از قیمت روز دوره.',
    inputSchema: { course_id: z.string().describe('شناسهٔ دوره از list_courses') } },
  async (args, extra) => {
    const v = extra?._meta?.vista; if (!v?.user_id) return fail('vista context missing');
    const course = await db.course(args.course_id); if (!course) return fail('دوره یافت نشد');
    if (course.full) return fail('ظرفیت این دوره تکمیل است');
    if (await db.isEnrolled(v.user_ref, course.id)) return fail('شما قبلاً در این دوره ثبت‌نام کرده‌اید');
    const doc = baseDoc(v, 'konkooria.enrollment', 'konkooria/enrollment', `ثبت‌نام دوره · ${course.title}`, 'on_delivery');
    doc.clauses = [ /* subject, course, amount(kind:'amount'), access, refund */ ];
    doc.effects = [
      { type: 'wallet.pay', amount: course.price, payee_app_id: APP_ID, memo: course.title },
      { type: 'app.action', action: 'enroll', params: { course_id: course.id } },
    ];
    doc.fees = [{ beneficiary: 'vista', amount: Math.round(course.price * 0.01), label: 'کارمزد سکو', visible: false }];
    return text(signContract(PRIVATE_KEY, doc));
  });
```

### `build_exam_registration_contract`

```js
inputSchema: { exam_id: z.string().describe('شناسهٔ آزمون از list_exams'), venue: z.enum(['online', 'in_person']).default('online') }
```

- نوع: `type: 'konkooria.exam'`, `template_ref: 'konkooria/exam'`, `settlement: 'on_delivery'`.
- بندها: موضوع، آزمون و تاریخ، محل (آنلاین/حضوری)، مبلغ ۱۲۰٬۰۰۰، تحویل («صندلی پس از امضا رزرو و کد ورود در مینی‌اپ نمایش داده می‌شود؛ مبلغ پس از رزرو کسر می‌شود»)، لغو («تا ۴۸ ساعت پیش از آزمون؛ بازگشت کامل»).
- اثرها: `wallet.pay 120000` + `app.action register_exam { exam_id, venue }`.
- `expires_at`: ۱۵ دقیقه. ظرفیت را در ساخت رزرو نکنید؛ در تحویل رزرو کنید و اگر پر شد `cancelled` بدهید (مسدودی آزاد می‌شود).

### `build_monthly_subscription_delegation`

```js
inputSchema: { plan_id: z.enum(['monthly']).default('monthly'), months: z.number().int().min(1).max(12).default(6).describe('مدت وکالت به ماه'),
               cap_toman: z.number().int().min(200000).max(2400000).optional().describe('سقف کل؛ پیش‌فرض قیمت × ماه‌ها') }
```

- نوع: `type: 'konkooria.subscription-delegation'`, `template_ref: 'konkooria/auto-subscription'`, `min_rung: 2`, `settlement: 'immediate'`, `conditions: []`.
- اثرها: `delegation.grant { app_id:'konkooria', scope:'konkooria/subscription', label:'تمدید خودکار طرح ماهانه', cap: cap_toman ?? 200000*months, per_use_cap: 200000, expires_at: plusDays(30*months) }` + `app.action activate_auto_subscription { plan_id }`.
- بندها: موضوع، محدوده («فقط تمدید طرح ماهانه (۲۰۰٬۰۰۰ تومان) در سررسید هر ماه»)، سقف کل، سقف هر بار، انقضا، قواعد (واگذاری ممنوع · لغو یک‌طرفه · اطلاع هر مصرف).
- فقط وقتی کار می‌کند که کنکوریا نشان آبی داشته باشد.

## ابزار تحویل

```js
server.registerTool('vista_fulfil', { title: 'تحویل', description: 'فقط پردازشگر ویستا.',
  inputSchema: { contract: z.record(z.any()), platform_signature: z.string(), delegation_id: z.string().optional() } },
  async ({ contract: doc, platform_signature, delegation_id }) => {
    const hash = contractHash(doc);
    if (!verifyPlatformExecuted(PLATFORM_KEY, hash, platform_signature)) return { ...text({ events: [{ type: 'failed', text: 'امضای سکو معتبر نیست' }] }), isError: true };
    if (doc.app_id !== APP_ID) return { ...text({ events: [{ type: 'failed', text: 'قرارداد مال این اپ نیست' }] }), isError: true };
    const ref = userRefOf(doc.parties.find((p) => p.kind === 'user').id);
    const done = await db.fulfilment(doc.id); if (done) return text({ events: done.events });   // idempotent
    const a = doc.effects.find((e) => e.type === 'app.action');
    let events;
    switch (a?.action) {
      case 'enroll': await db.enroll(ref, a.params.course_id); events = [{ type: 'delivered', text: 'دسترسی به دوره فعال شد؛ جلسهٔ اول در مینی‌اپ' }]; break;
      case 'register_exam': { const seat = await db.reserveSeat(ref, a.params.exam_id, a.params.venue);
        events = seat ? [{ type: 'delivered', text: `صندلی رزرو شد · کد ورود ${seat.code}`, payload: { seat: seat.code } }] : [{ type: 'cancelled', text: 'ظرفیت آزمون تکمیل شد' }]; break; }
      case 'activate_auto_subscription': await db.saveDelegation(ref, delegation_id, a.params.plan_id, doc.effects.find((e) => e.type === 'delegation.grant'));
        events = [{ type: 'note', text: 'تمدید خودکار فعال شد؛ در سررسید، اپ به نیابت از شما تمدید می‌کند و خبر می‌دهد.' }]; break;
      case 'renew_subscription': await db.extend(ref, a.params.plan_id, 30); events = [{ type: 'delivered', text: 'اشتراک یک ماه تمدید شد' }]; break;
      default: events = [{ type: 'delivered' }];
    }
    await db.saveFulfilment(doc.id, events);
    return text({ events });
  });
```

## تمدید ماهانه زیر وکالت (کار زمان‌بندی‌شده)

```js
// هر روز: اشتراک‌هایی که فردا سررسید می‌شوند و وکالت فعال دارند
for (const s of await db.dueTomorrowWithDelegation()) {
  const doc = baseDoc({ user_id: `user:${s.vista_user_id}`, user_ref: s.user_ref }, 'konkooria.subscription', 'konkooria/subscription', 'تمدید خودکار اشتراک · طرح ماهانه', 'on_delivery');
  doc.clauses = [ { key: 'subject', label: 'موضوع', value: 'تمدید اشتراک زیر وکالت' }, { key: 'amount', label: 'مبلغ', value: 200000, kind: 'amount' }, { key: 'trigger', label: 'دلیل', value: 'سررسید اشتراک' } ];
  doc.effects = [ { type: 'wallet.pay', amount: 200000, payee_app_id: APP_ID, memo: 'تمدید طرح ماهانه' }, { type: 'app.action', action: 'renew_subscription', params: { plan_id: 'monthly' } } ];
  // شکل نهایی زیر وکالت، سپس امضا
  doc.delegation_id = s.delegation_id;
  doc.conditions = [{ type: 'wallet.sufficient' }, { type: 'delegation.active', delegation_id: s.delegation_id }];
  doc.parties = doc.parties.map((p) => (p.kind === 'user' ? { ...p, must_sign: false } : p));
  const { contract, app_signature } = signContract(PRIVATE_KEY, doc);
  const r = await fetch(`${VISTA_URL}/api/app-actions/delegated`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ app_id: APP_ID, delegation_id: s.delegation_id, contract, app_signature }) });
  if (r.status === 403) await db.disableDelegation(s.delegation_id);        // لغو/انقضا/اتمام — تلاش دوباره نه
  else if (!r.ok) await db.logRenewalFailure(s, await r.json());           // مثلاً موجودی ناکافی؛ فردا دوباره
}
```

شناسهٔ خام کاربر ویستا (`vista_user_id`) را از طرف کاربر قرارداد وکالت (`user:<id>`) هنگام تحویل ذخیره کنید؛ زیر وکالت `_meta` ندارید.

## مینی‌اپ

داشبورد فعلی کنکوریا (برنامه، آزمون‌ها، کارنامه، دوره‌های من) با یک مسیر تازه `/vista/mini` که توکن را با کلید سکو راستی‌آزمایی می‌کند و با `user_ref` (از `vista_links`) کاربر را می‌شناسد. دکمه‌های «خرید/ثبت‌نام» در این صفحه به جای درگاه، متن «برای ثبت‌نام از دستیار ویستا بخواهید» را نشان می‌دهند یا انتخاب را ذخیره می‌کنند تا ابزار ساختن بعدی از آن استفاده کند.

## چک‌لیست کنکوریا

- [ ] کلید Ed25519 در خزانهٔ کنکوریا؛ `public_key` مانیفست از همان
- [ ] `/vista/mcp` با چهار ابزار خواندنی، سه ابزار ساختن، `vista_fulfil`، منبع `vista://manifest`
- [ ] پیوند `user_ref` ↔ حساب کنکوریا؛ `phone` فقط از `_meta.vista`
- [ ] قیمت‌ها از پایگاه داده؛ هیچ آرگومان مبلغ در ابزارهای ساختن
- [ ] تحویل idempotent با ثبت `contract.id`؛ رزرو صندلی در تحویل نه در ساخت
- [ ] کار زمان‌بندی‌شدهٔ تمدید با `403` → خاموش کردن وکالت
- [ ] `node scripts/conformance.mjs https://konkooria.ir/vista/mcp --tool build_course_enrollment_contract --args '{"course_id":"math-101"}'` سبز
