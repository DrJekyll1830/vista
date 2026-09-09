بسم الله الرحمن الرحیم
# ویستا؛ از API Gateway تا «سیستم‌عامل توزیع‌شده‌ی خدمات و Agentها»

## وضعیت سند

این سند یک **سند فکری/معماری اولیه** برای چکش‌کاری ایده‌ی ویستا است، نه پروپوزال نهایی تجاری و نه سند طراحی فنی نهایی.

هدف آن این است که مجموعه ایده‌های مطرح‌شده را در یک مدل واحد قرار دهد، مفاهیم فنی را برای مخاطب غیرفنی توضیح دهد، و مشخص کند که چرا ویستا می‌تواند از یک API Gateway ساده فراتر برود.

---

# 1. پاسخ کوتاه به سؤال اصلی: آیا داریم «سیستم‌عامل توزیع‌شده» می‌سازیم؟

**به‌صورت استعاری و معماری: بله، به چیزی بسیار نزدیک به یک سیستم‌عامل توزیع‌شده برای خدمات دیجیتال و Agentها می‌رسیم.**

اما از نظر تعریف کلاسیک علم کامپیوتر، بهتر است در پروپوزال نگوییم «یک سیستم‌عامل توزیع‌شده»؛ چون سیستم‌عامل کلاسیک مسئول مدیریت CPU، حافظه، دیسک، پردازه‌ها و سخت‌افزار است.

آنچه ویستا مدیریت می‌کند چیز دیگری است:

- هویت کاربران و Agentها
- دسترسی به قابلیت‌ها و سرویس‌ها
- مجوزها و رضایت کاربر
- اجرای امن Actionها
- ارتباط بین سرویس‌های مستقل
- کشف و انتخاب قابلیت‌ها
- پرداخت و تراکنش
- رویدادها و اعلان‌ها
- مدل‌های هوش مصنوعی
- توسعه و انتشار MCPها
- حکمرانی و سیاست‌گذاری

بنابراین تعبیر دقیق‌تر این است:

> **ویستا یک لایه‌ی عملیاتی توزیع‌شده برای دسترسی و تعامل هوشمند با خدمات دیجیتال است.**

یا برای بیان ساده‌تر و محصولی‌تر:

> **ویستا می‌تواند به «سیستم‌عامل دنیای Agentها و خدمات دیجیتال» تبدیل شود.**

این تعبیر در بخش Vision مناسب است، ولی در متن‌های رسمی بهتر است همراه با توضیح معماری به کار برود تا با سیستم‌عامل کلاسیک اشتباه نشود.

---

# 2. چرا این شباهت به سیستم‌عامل به وجود آمده است؟

یک سیستم‌عامل سنتی یک لایه‌ی مشترک میان برنامه‌ها و منابع کامپیوتر ایجاد می‌کند.

مثلاً یک برنامه لازم نیست بداند دیسک سخت دقیقاً چگونه کار می‌کند. به جای آن با یک abstraction مثل فایل کار می‌کند.

به همین شکل، یک برنامه لازم نیست مستقیماً با هر نوع سخت‌افزار، درایور یا کنترلر کار کند.

ویستا می‌تواند همین ایده را برای **خدمات دیجیتال** انجام دهد.

مثلاً یک Agent لازم نیست بداند:

- اسنپ چه API داخلی‌ای دارد؛
- اسنپ‌فود چگونه سفارش را ثبت می‌کند؛
- بانک سینا چه Core Bankingای دارد؛
- کنکوریا چه دیتابیسی دارد؛
- اسنپ‌پی چگونه پرداخت را انجام می‌دهد.

Agent فقط با یک لایه‌ی استاندارد از Capabilityها کار می‌کند.

مثلاً:

```text
search_restaurants()
request_ride()
check_balance()
create_transfer_intent()
find_mentor()
make_payment()
```

این دقیقاً همان نوع abstractionی است که سیستم‌عامل‌ها در دنیای سخت‌افزار ایجاد کرده‌اند.

---

# 3. قیاس ویستا با یک سیستم‌عامل

می‌توان یک قیاس مفهومی زیر را در نظر گرفت:

| دنیای سیستم‌عامل | دنیای ویستا |
|---|---|
| Kernel | Policy / Security / Execution Layer |
| Process | Agent / Application Session |
| System Call | MCP Tool / Capability Call |
| Driver | Connector / MCP Adapter |
| File System | اطلاعات و منابع قابل دسترسی |
| Permission | Consent / Authorization |
| Process Scheduler | Agent Orchestration |
| IPC | ارتباط MCP / Service-to-Service |
| Package Manager | MCP Marketplace |
| User Account | Vista Identity |
| Secure Hardware | SIM / Secure Element / Device Key |
| Network Stack | API/MCP Gateway |
| Audit Log | Transaction / Security Ledger |
| System Monitor | Observability / Audit / Analytics |
| Kill Switch | Global Policy Enforcement |

این قیاس یکی از بهترین روش‌ها برای توضیح Vision ویستا به مدیران غیرفنی است؛ چون نشان می‌دهد ویستا صرفاً یک اپلیکیشن یا Gateway دیگر نیست.

---

# 4. تفاوت مهم با سیستم‌عامل واقعی

نباید تصور کرد که ویستا واقعاً یک سیستم‌عامل مانند Android، Linux یا iOS خواهد بود.

سیستم‌عامل کلاسیک منابع محاسباتی را مدیریت می‌کند؛ ویستا **منابع و قابلیت‌های کسب‌وکاری** را مدیریت می‌کند.

بنابراین تعبیر دقیق‌تر:

> **Service Operating Layer**

یا

> **Agent Operating Layer**

و در سطح محصول:

> **Operating System for Digital Services and AI Agents**

است.

این تفاوت مهم است، چون مانع از آن می‌شود که پروژه را با وعده‌ای بیش از حد بزرگ یا مبهم معرفی کنیم.

---

# 5. نقطه‌ی شروع پروژه: API Gateway

پیشنهاد اولیه، یک API Gateway برای اتصال سرویس‌های مختلف اکوسیستم ایرانسل بود.

این نیاز همچنان واقعی است و نباید حذف شود.

اما یک API Gateway به تنهایی مسئله‌ی جدید را حل نمی‌کند.

API Gateway برای ارتباط سرویس با سرویس عالی است:

```text
Service A
   ↓
API Gateway
   ↓
Service B
```

اما با ورود Agentها مسئله جدیدی به وجود می‌آید:

```text
User
  ↓
AI Agent
  ↓
???
  ↓
Multiple Services
```

در اینجا سؤال فقط «چگونه API را صدا بزنیم؟» نیست.

بلکه سؤال این است:

> Agent به چه چیزی دسترسی داشته باشد؟
>
> چه کاری را خودش انجام دهد؟
>
> برای چه کاری از کاربر اجازه بگیرد؟
>
> چه چیزی را کاربر واقعاً تأیید کرده است؟
>
> چگونه هویت کاربر حفظ شود؟
>
> چگونه چند سرویس با هم یک تراکنش تشکیل دهند؟
>
> چگونه رفتار Agent ثبت و قابل ممیزی باشد؟

ویستا از این نقطه به بعد، از API Gateway فراتر می‌رود.

---

# 6. معماری کلان پیشنهادی

```text
                         USER
                          │
                          ↓
               ┌─────────────────────┐
               │    Vista Client     │
               │  Chat / Agent UX    │
               └──────────┬──────────┘
                          │
                          ↓
               ┌─────────────────────┐
               │    Agent Runtime    │
               │  MCP Manager / AI   │
               └──────────┬──────────┘
                          │
                          ↓
               ┌─────────────────────┐
               │ Capability & Policy │
               │      Layer          │
               └──────────┬──────────┘
                          │
            ┌─────────────┼─────────────┐
            ↓             ↓             ↓
       MCP Gateway     Action/Intent   Identity
                         Engine
            │             │             │
            └─────────────┼─────────────┘
                          ↓
              ┌────────────────────────┐
              │ API / Service Gateway  │
              └───────────┬────────────┘
                          │
      ┌───────────────────┼────────────────────┐
      ↓                   ↓                    ↓
    Snapp             Bank Sina            Konkooria
      │                   │                    │
      ↓                   ↓                    ↓
   APIs/Core          Core Banking         Services
                          │
                          ↓
                 Optional DLT Layer
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
          Ledger       Tokens       Contracts
```

WSO2 می‌تواند بخش بزرگی از لایه‌ی Gateway، مدیریت API/MCP، policy و governance را پوشش دهد، در حالی که خود ویستا محصول، Agent، Marketplace، Consent و orchestration را می‌سازد.

---

# 7. ایده‌ی اصلی ویستا: یک‌بار ورود، چندین قابلیت

در وضعیت سنتی، برای هر سرویس معمولاً یک اپلیکیشن، حساب کاربری، session و تجربه‌ی کاربری جدا وجود دارد.

در ویستا، هدف این است که کاربر وارد یک محیط واحد شود و قابلیت‌های مختلف را در اختیار داشته باشد.

مثلاً:

```text
Vista
 ├── ایرانسل
 ├── اسنپ
 ├── اسنپ‌فود
 ├── اسنپ‌دکتر
 ├── اسنپ‌شاپ
 ├── اسنپ‌پی
 ├── بانک سینا
 ├── کنکوریا
 └── سایر توسعه‌دهندگان
```

کاربر الزاماً نمی‌داند کدام سرویس در پشت صحنه در حال اجراست.

او با «هدف» خود صحبت می‌کند، نه با API یا اپلیکیشن.

مثلاً:

> «برای فردا ساعت ۸ صبح برایم ماشین بگیر.»

و Agent تصمیم می‌گیرد از چه Capabilityهایی استفاده کند.

---

# 8. MCP Marketplace؛ بازار قابلیت‌ها

یکی از اجزای مهم Vision ویستا، یک Marketplace برای MCPها و Capabilityهاست.

این بخش را می‌توان با «کافه‌بازار برای خدمات قابل‌استفاده توسط Agentها» مقایسه کرد.

توسعه‌دهنده می‌تواند:

1. MCP خود را ثبت کند.
2. تست‌ها و الزامات امنیتی را بگذراند.
3. آن را منتشر کند.
4. نسخه‌های جدید ارائه کند.
5. آمار استفاده را ببیند.
6. در آینده برای جایگاه بهتر در Marketplace هزینه پرداخت کند.

نمونه دسته‌بندی:

```text
حمل‌ونقل
├── اسنپ
└── سایر سرویس‌ها

غذا
├── اسنپ‌فود
└── سایر سرویس‌ها

بانک و پرداخت
├── بانک سینا
├── اسنپ‌پی
└── ...

آموزش
└── کنکوریا

سلامت
└── ...
```

اما بهتر است در روایت محصول، به جای «بازار MCP» از تعبیر **بازار قابلیت‌های هوشمند** استفاده شود؛ MCP فناوری پشت این بازار است، نه خود محصول نهایی.

---

# 9. Agent؛ چیزی فراتر از یک Chatbot

Agent فقط یک چت‌بات نیست.

یک Chatbot ممکن است فقط پاسخ تولید کند.

Agent می‌تواند:

- وضعیت سرویس‌ها را بررسی کند؛
- ابزار مناسب را انتخاب کند؛
- اطلاعات لازم را جمع کند؛
- یک عملیات را آماده کند؛
- کاربر را برای تأیید مطلع کند؛
- بعد از تأیید، عملیات را اجرا کند؛
- نتیجه را به کاربر گزارش دهد.

مثلاً:

```text
User:
«برای خانه مامانم اسنپ بگیر.»

Agent:
  ↓
Find saved location
  ↓
Check available service
  ↓
Create ride intent
  ↓
Determine whether confirmation is required
  ↓
Execute or request approval
```

---

# 10. اصل اساسی امنیتی: LLM مرجع اختیار نیست

این یکی از مهم‌ترین اصول کل معماری است.

> **LLM نباید مرجع نهایی اختیار و مجوز باشد.**

مدل می‌تواند:

- پیشنهاد بدهد؛
- تصمیم پیشنهادی بگیرد؛
- ابزار را انتخاب کند؛
- پارامتر پیشنهاد دهد؛
- Intent ایجاد کند.

ولی نباید بتواند:

- مجوز خودش را افزایش دهد؛
- سطح امنیتی را پایین بیاورد؛
- عملیات حساس را خارج از مسیر مجاز اجرا کند؛
- تأیید کاربر را جعل کند؛
- محدودیت‌های policy را دور بزند.

این جداسازی برای جلوگیری از آسیب ناشی از hallucination، prompt injection، tool misuse و خطاهای Agent بسیار مهم است.

---

# 11. مدل سه‌سطحی Actionها

برای ساده‌سازی تجربه‌ی کاربر و ایجاد یک مرز امنیتی روشن، عملیات می‌توانند در سه سطح قرار گیرند.

## سطح ۱ — کم‌ریسک

نمونه‌ها:

- جستجوی رستوران
- مشاهده‌ی اطلاعات
- مشاهده‌ی موجودی
- مشاهده‌ی سفارش‌ها
- افزودن آدرس غیرحساس

Agent می‌تواند این کارها را مستقیماً انجام دهد.

```text
User
 ↓
Agent
 ↓
MCP
 ↓
Service
```

---

## سطح ۲ — حساس

نمونه‌ها:

- سفارش غذا
- رزرو
- خرید
- انجام یک تغییر دارای پیامد

Agent عملیات را تا مرحله‌ی نهایی آماده می‌کند ولی خودش اجرای نهایی را انجام نمی‌دهد.

```text
User
 ↓
Agent
 ↓
MCP
 ↓
Create Action Intent
 ↓
Client retrieves authoritative details
 ↓
User sees confirmation form
 ↓
User confirms
 ↓
Direct call to service
```

این تفاوت مهم است: تأیید کاربر فقط یک پیام «آیا مطمئن هستید؟» نیست؛ بلکه یک boundary معماری است.

---

# 12. چرا فرم تأیید باید از سرویس نهایی بیاید؟

اطلاعات نمایش‌داده‌شده به کاربر نباید صرفاً بر اساس ادعای LLM تولید شود.

مثلاً اگر Agent بگوید:

> مبلغ سفارش ۴۵۰ هزار تومان است.

باید Client این مبلغ را از سرویس authoritative دریافت کند، نه از خود Agent.

مدل صحیح:

```text
LLM → پیشنهاد
Service → حقیقت
Client → نمایش حقیقت
User → تأیید
```

مثلاً:

```text
ActionIntent #A123

Action: submit_food_order
Merchant: Restaurant X
Items: ...
Discount: 100,000
Total: 450,000
Payment: SnapPay
Status: PENDING
```

Client این اطلاعات را از سرویس دریافت می‌کند و کاربر همان داده‌های معتبر را می‌بیند و تأیید می‌کند.

---

# 13. سطح ۳ — فوق‌حساس

نمونه‌ها:

- انتقال پول با مبلغ بالا
- برداشت
- تغییر اطلاعات امنیتی
- تغییر حساب مقصد
- عملیات با پیامد مالی جدی

برای این موارد، کنترل بیشتری لازم است.

```text
Action Intent
     ↓
Risk Evaluation
     ↓
User Confirmation
     ↓
Step-up Authentication
     ↓
Cryptographic Signature
     ↓
Final Execution
```

احراز هویت می‌تواند با قابلیت‌های امن دستگاه و/یا Secure Element سیم‌کارت انجام شود.

بیومتریک باید تا حد امکان در خود دستگاه انجام شود و اطلاعات خام بیومتریک نباید به سرویس منتقل شود.

---

# 14. Dynamic Linking؛ کاربر دقیقاً چه چیزی را امضا می‌کند؟

در عملیات مالی، امضای یک «OK» کافی نیست.

باید امضا به همان transaction مشخص متصل باشد.

مثلاً:

```text
Transfer
From: Account A
To: Account B
Amount: 50,000,000 IRR
Reference: XYZ
```

امضای کاربر باید به همین داده‌ی canonical و مشخص وابسته باشد.

اگر مبلغ، مقصد یا سایر پارامترهای مهم تغییر کند، امضای قبلی نباید قابل استفاده باشد.

این الگو را می‌توان در سطح معماری به شکل زیر بیان کرد:

```text
Intent
  ↓
Canonical Transaction
  ↓
User sees exact transaction
  ↓
User authorizes
  ↓
Signature bound to transaction
```

---

# 15. SIM-based Digital Signature

یکی از ظرفیت‌های ویژه‌ی اکوسیستم اپراتوری، امکان استفاده از قابلیت‌های secure element و هویت اپراتوری است.

مدل مفهومی:

```text
User
 ↓
Vista
 ↓
Banking Intent
 ↓
Challenge
 ↓
Secure Element / SIM Key
 ↓
User unlock / authentication
 ↓
Cryptographic Signature
 ↓
Bank
```

مزیت بالقوه:

- کلید خصوصی می‌تواند از محیط امن خارج نشود.
- هویت اپراتوری می‌تواند بخشی از trust infrastructure شود.
- امکان ساخت زنجیره‌ی اعتماد و PKI در آینده وجود دارد.

اما جزئیات فنی، حقوقی و استانداردسازی این بخش باید در یک مطالعه‌ی تخصصی جداگانه بررسی شود.

---

# 16. قابلیت مهم: Action Intent

پیشنهاد می‌شود در معماری ویستا یک مفهوم استاندارد به نام **Action Intent** تعریف شود.

این شیء مشخص می‌کند Agent چه کاری را پیشنهاد کرده است، بدون اینکه خودش الزاماً مجوز اجرای آن را داشته باشد.

نمونه:

```text
ActionIntent
-----------------------------
id
user_id
service_id
action
parameters
amount
currency
risk_level
required_auth
created_at
expires_at
nonce
status
```

وضعیت می‌تواند چنین باشد:

```text
PENDING
APPROVED
EXECUTED
REJECTED
EXPIRED
CANCELLED
```

این abstraction نقش مهمی در جداسازی «تصمیم Agent» از «اختیار اجرای واقعی» دارد.

---

# 17. Capability Token

به Agent نباید یک credential همه‌کاره داده شود.

به جای آن باید برای هر نوع capability حدود مشخصی تعریف شود.

مثلاً:

```text
L1 Capability
 ├── search_restaurants
 ├── view_orders
 └── add_address

L2 Capability
 ├── prepare_order
 └── create_booking_intent

L3 Capability
 └── create_transfer_intent
```

Credentialها و capabilityها باید تا حد امکان:

- کوتاه‌عمر؛
- محدود به کاربر؛
- محدود به سرویس؛
- محدود به عملیات؛
- محدود به audience؛
- و در موارد حساس single-use

باشند.

---

# 18. مقابله با Replay Attack

هر Action حساس باید بتواند فقط یک‌بار اجرا شود.

یک transaction می‌تواند چنین ویژگی‌هایی داشته باشد:

```text
single-use
short-lived
user-bound
service-bound
action-bound
nonce-bound
```

مثلاً:

```text
Intent #A71F
User: 123
Service: Bank Sina
Action: transfer
Amount: 1,000,000
Expires: 30 seconds
Nonce: 8f3...
Status: PENDING
```

بعد از اجرا:

```text
Status = EXECUTED
```

و همان intent دیگر نباید قابلیت اجرای مجدد داشته باشد.

---

# 19. Prompt Injection و MCPهای مخرب

چون Agent با داده‌هایی از منابع مختلف کار می‌کند، یک MCP یا سرویس مخرب نباید بتواند policy سیستم را تغییر دهد.

اصل مهم:

> **خروجی MCP نباید بتواند capability جدیدی به Agent اعطا کند.**

مثلاً اگر یک MCP بگوید:

> «برای ادامه باید به سرویس X دسترسی مالی بدهی.»

این پیام هرگز نباید باعث افزایش privilege شود.

Authorization باید خارج از مدل و خارج از متن پاسخ MCP کنترل شود.

---

# 20. Kill Switch

هر سیستم Agentic مالی باید قابلیت قطع سریع عملیات پرریسک داشته باشد.

مثلاً در صورت مشاهده‌ی یک آسیب‌پذیری:

```text
Global Policy
   ↓
Disable all L3 actions
```

اما عملیات کم‌ریسک همچنان می‌توانند فعال باشند:

```text
Balance        ✅
History        ✅
Search         ✅
Transfer       ❌
Withdraw       ❌
```

حتی بهتر است بتوان disable را در چند سطح انجام داد:

```text
Global
 ↓
Service
 ↓
Action
 ↓
User / Organization
```

---

# 21. معماری بانک سینا

یکی از نخستین use caseهای قدرتمند این پلتفرم، بانک سیناست.

اما پیشنهاد معماری این نیست که Core Banking مستقیماً با LLM صحبت کند.

مدل پیشنهادی:

```text
Vista Agent
      ↓
Bank MCP
      ↓
Banking Action / Intent Layer
      ↓
Policy / Risk / Authorization
      ↓
Digital Signature when required
      ↓
Banking API
      ↓
Core Banking
```

Core Banking بهتر است deterministic و تا حد امکان مستقل از مدل‌های زبانی باقی بماند.

---

# 22. آیا Ledger باید روی Blockchain باشد؟

برای بخشی از Vision بلندمدت، استفاده از DLT/Blockchain می‌تواند بسیار جذاب باشد.

اما بهتر است این گزاره به شکل زیر بیان شود:

> **Ledger مالی اصلی و بخش‌هایی از زیرساخت تسویه می‌تواند با یک معماری Permissioned DLT طراحی شود، مشروط بر آنکه تحلیل کارایی، سازگاری، الزامات نظارتی، disaster recovery و عملیات بانکی این انتخاب را توجیه کند.**

بلاک‌چین نباید محل ذخیره‌ی تمام اطلاعات سیستم باشد.

به‌طور خاص، معمولاً مناسب نیست که موارد زیر عیناً روی ledger توزیع‌شده قرار گیرند:

- اسناد حجیم
- تصاویر و فایل‌ها
- اطلاعات کامل مشتری
- آدرس‌ها و اطلاعات پروفایلی
- داده‌های عملیاتی حساس که الزام immutability یا replication در آنها ارزش ندارد

در عوض می‌توان از معماری زیر استفاده کرد:

```text
Customer Data
   → Conventional Database

Documents
   → Object Storage / Document Store

Operational Data
   → Conventional Systems

Financial Ledger
   → Permissioned DLT / Authoritative Ledger Layer
```

در مواردی که لازم است ارتباط یک سند یا داده با transaction اثبات شود، می‌توان به جای ذخیره خود داده، hash یا reference مناسب را در ledger نگهداری کرد.

---

# 23. چرا DLT می‌تواند برای Ledger جذاب باشد؟

در محیطی که چند سازمان یا چند domain باید بر وضعیت مشترک اعتماد کنند، DLT ویژگی‌هایی دارد که می‌تواند ارزشمند باشد:

- ثبت تغییرناپذیر رویدادهای مالی
- قابلیت audit
- چندمرکزی بودن اعتبارسنجی
- کاهش وابستگی به یک نقطه‌ی شکست
- programmable assets
- smart contracts

اما «بلاک‌چین امن‌تر است» به‌تنهایی دلیل کافی نیست.

باید نشان داده شود که DLT در مقایسه با معماری پایگاه داده‌ی سنتی با replication و controls مناسب، چه مشکل واقعی را بهتر حل می‌کند.

---

# 24. آیا هر شعبه باید یک Node باشد؟

تعداد کم شعب بانک سینا باعث می‌شود این ایده عملی‌تر از یک بانک بسیار بزرگ باشد، اما پیشنهاد معماری بهتر این است که nodeهای consensus نماینده‌ی **دامنه‌های اعتماد و مراکز زیرساختی** باشند، نه الزاماً هر شعبه.

مثلاً:

```text
HQ Node 1
HQ Node 2
DR Node 1
DR Node 2
Regional / Independent Node
Security / Governance Node
```

شعبه می‌تواند مصرف‌کننده‌ی سرویس باشد و لزوماً node مستقل consensus نباشد.

در عین حال، به دلیل تعداد کم شعب، در صورت وجود توجیه عملیاتی و امنیتی می‌توان برخی شعب را نیز در طراحی nodeها بررسی کرد.

---

# 25. نزدیک‌ترین Node الزاماً بهترین Node نیست

انتخاب node نباید صرفاً بر اساس فاصله جغرافیایی باشد.

ممکن است معیارهایی مثل اینها مهم‌تر باشند:

- مالکیت حساب
- domain تراکنش
- shard
- availability
- consistency
- load
- disaster recovery policy

بنابراین routing باید یک تصمیم معماری باشد و proximity صرفاً یکی از پارامترهای optimization محسوب شود.

---

# 26. چرا Core Banking و DLT را ترکیب می‌کنیم؟

بهتر است به جای حذف Core Banking، یک معماری Hybrid در نظر گرفته شود:

```text
                 Banking Platform
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Core Banking    Payment Rails   DLT Layer
        │                             │
        │                             ├── Tokenized Assets
        │                             ├── Shared Ledger
        │                             └── Smart Contracts
        │
        └──────────────┬──────────────┘
                       ↓
                  Unified APIs
```

این معماری اجازه می‌دهد قسمت‌هایی که به DLT نیاز ندارند، ساده و performant باقی بمانند.

---

# 27. انتخاب فناوری DLT

Hyperledger Fabric همچنان یکی از گزینه‌های جدی برای یک شبکه‌ی Permissioned است و باید در POC بررسی شود.

اما انتخاب Fabric نباید از قبل قطعی فرض شود.

در POC باید دست‌کم از نظر موارد زیر مقایسه شود:

- throughput
- transaction finality
- failure handling
- Byzantine fault tolerance
- operational complexity
- backup / recovery
- observability
- governance
- integration with core banking
- smart contract model
- توسعه‌پذیری

Fabric 3.x با SmartBFT از گزینه‌های مهم shortlist است، ولی این موضوع نیازمند benchmark عملی در محیط مشابه بانک است.

---

# 28. Programmable Finance

چشم‌انداز بلندمدت این پروژه می‌تواند از «ثبت تراکنش» فراتر برود.

با داشتن یک زیرساخت programmable، دارایی‌ها می‌توانند به شکل دیجیتال و قابل‌برنامه‌ریزی در اختیار قراردادهای هوشمند قرار گیرند.

برای مثال:

```text
Tokenized Gold
      ↓
Valuation Oracle
      ↓
Collateral
      ↓
Smart Contract
      ↓
Loan
```

یا:

```text
Digital Asset
      ↓
Rules
      ↓
Settlement
      ↓
Automatic Execution
```

این بخش باید به عنوان Vision بلندمدت مطرح شود، نه به عنوان جزء ضروری MVP بانکی.

---

# 29. توکن طلا و وام با وثیقه

یک use case بلندمدت می‌تواند توکن‌سازی دارایی‌هایی مانند طلای واقعی باشد.

مثلاً:

```text
Physical Gold
      ↓
Custody / Verification
      ↓
Tokenized Gold
      ↓
Price Oracle
      ↓
Collateral Ratio
      ↓
Loan
```

اگر نسبت وام به ارزش وثیقه ۷۰٪ باشد:

```text
Gold Value = $100,000
LTV = 70%
Maximum Loan = $70,000
```

در اینجا قوانین liquidation، margin call، oracle failure، manipulation، custody و redemption باید کاملاً تعریف شوند.

بنابراین این use case به یک چارچوب حقوقی، مالی و فنی جداگانه نیاز دارد.

---

# 30. ایده‌ی دارایی/ارز مشابه DAI

در چشم‌انداز بلندمدت می‌توان بررسی کرد که آیا امکان ایجاد یک **دارایی دیجیتال باثبات و برنامه‌پذیر** وجود دارد یا خیر.

اما این موضوع باید بسیار محتاطانه تعریف شود.

هدف اولیه نباید صرفاً «ساخت یک ارز مشابه DAI» باشد، بلکه باید ابتدا این پرسش‌ها پاسخ داده شوند:

- پشتوانه چیست؟
- روش قیمت‌گذاری چیست؟
- چگونه redemption انجام می‌شود؟
- چه نهادی مسئول است؟
- چه چیزی جلوی under-collateralization را می‌گیرد؟
- liquidation چگونه انجام می‌شود؟
- چه زمانی collateral فروخته می‌شود؟
- oracle چگونه محافظت می‌شود؟
- اگر بازار شدیداً سقوط کند چه اتفاقی می‌افتد؟
- چگونه governance انجام می‌شود؟
- الزامات AML/KYC چیست؟
- وضعیت حقوقی و نظارتی چیست؟
- تعامل با ارزهای خارجی چگونه خواهد بود؟

بنابراین این موضوع باید به عنوان یکی از **افق‌های بلندمدت programmable finance** مطرح شود، نه یک promise برای فاز اول.

---

# 31. چرا Liquidation یک موضوع محوری است؟

در هر سیستم وثیقه‌ای، ارزش دارایی می‌تواند پایین بیاید.

اگر:

```text
Collateral Value ↓

Loan remains constant

LTV ↑
```

ممکن است سیستم به مرحله‌ای برسد که وثیقه برای پوشش بدهی کافی نباشد.

بنابراین قرارداد هوشمند باید از ابتدا برای مواردی مانند اینها طراحی شود:

```text
Normal
 ↓
Warning / Margin Call
 ↓
Liquidation Threshold
 ↓
Liquidation
 ↓
Settlement
```

همچنین باید برای oracle outage و price manipulation مسیر fallback وجود داشته باشد.

---

# 32. نوتیفیکیشن؛ مزیت طبیعی اپراتور

یکی از نقاط قابل توجه اکوسیستم اپراتوری، کانال‌های گسترده‌ی ارتباط با کاربر است.

پس از وقوع یک رویداد می‌توان از کانال مناسب استفاده کرد:

```text
Transaction Event
        ↓
Notification Service
   ┌────┼────┬────┐
   ↓    ↓    ↓    ↓
 SMS  Push  Webhook In-App
```

این می‌تواند برای موارد زیر استفاده شود:

- ثبت سفارش
- انتقال پول
- تغییر وضعیت
- تأیید تراکنش
- هشدار امنیتی
- درخواست تأیید
- رخداد قرارداد هوشمند

باید توجه داشت که هر کانال notification خودش نباید به عنوان مرجع authorization تلقی شود.

---

# 33. سه فاز پیشنهادی Roadmap

## فاز ۱ — AI-native Service Platform

تمرکز:

- Gateway
- MCP
- Identity
- Developer Platform
- Policy
- Security
- Agent
- چند سرویس کلیدی ایرانسل/اکوسیستم

هدف:

> تبدیل سرویس‌های موجود به قابلیت‌هایی که برای Agentها قابل استفاده و قابل کنترل باشند.

نمونه:

```text
Iranسل
Snap
Snap Food
Snap Pay
...
    ↓
Vista MCP Platform
```

---

## فاز ۲ — AI-native Banking

تمرکز:

- Bank Sina MCP
- Banking Intent
- Risk Engine
- Transaction Confirmation
- Step-up Authentication
- Digital Signature
- Core Banking integration

هدف:

> امکان انجام امن خدمات بانکی از طریق Agent، بدون دادن اختیار نامحدود به LLM.

جریان نمونه:

```text
User
 ↓
Agent
 ↓
Bank MCP
 ↓
Intent
 ↓
Risk
 ↓
Confirmation / Signature
 ↓
Core Banking
```

---

## فاز ۳ — Programmable Financial Infrastructure

تمرکز:

- Permissioned DLT
- Ledger modernization
- Tokenized assets
- Smart contracts
- Programmable settlement
- Third-party financial applications
- در صورت توجیه، digital asset / stable-value asset

هدف:

> تبدیل زیرساخت بانکی به بستری که علاوه بر عملیات بانکی سنتی، امکان ساخت خدمات مالی برنامه‌پذیر را فراهم کند.

---

# 34. چرا ترتیب این سه فاز مهم است؟

اگر از همان ابتدا سراغ Blockchain + Smart Contract + Global Asset برویم، دامنه پروژه بسیار بزرگ و ریسک آن بسیار زیاد می‌شود.

اما در این مسیر:

```text
API / MCP
   ↓
Agent
   ↓
Secure Transactions
   ↓
Digital Identity / Signature
   ↓
Programmable Finance
```

هر فاز زیرساخت فاز بعدی را ایجاد می‌کند.

در نتیجه، پروژه از همان ابتدا ارزش تولید می‌کند و در عین حال Vision بلندمدت خود را حفظ می‌کند.

---

# 35. نقشی که WSO2 می‌تواند داشته باشد

WSO2 نباید «خود محصول ویستا» تلقی شود.

بهتر است آن را به عنوان یکی از زیرساخت‌های بنیادی در نظر گرفت.

مدل پیشنهادی:

```text
                 VISTA PRODUCT
┌─────────────────────────────────────────┐
│ Agent                                    │
│ MCP Manager                              │
│ Marketplace                              │
│ Identity / Consent UX                    │
│ Action / Intent                           │
│ Risk Engine                              │
│ Developer Ecosystem                      │
│ Billing / Monetization                   │
└──────────────────┬──────────────────────┘
                   │
                   ↓
           WSO2 / Gateway Layer
┌─────────────────────────────────────────┐
│ API Gateway                              │
│ MCP Gateway                              │
│ Authentication / Authorization           │
│ Policies                                 │
│ Traffic Management                       │
│ Analytics / Governance                   │
└──────────────────┬──────────────────────┘
                   │
                   ↓
        Services / APIs / Core Systems
```

اگر WSO2 در آینده به هر دلیل مناسب‌ترین گزینه نباشد، باید بتوان Gateway Layer را با کمترین تغییر در محصول Vista جایگزین کرد.

بنابراین **وابستگی معماری به vendor باید کنترل شود**.

---

# 36. بزرگ‌ترین ارزش ویستا چیست؟

ارزش اصلی پروژه احتمالاً یک Gateway نیست.

ارزش اصلی، ایجاد این abstraction است:

> **کاربر فقط با یک هویت و یک Agent کار می‌کند و Agent می‌تواند به مجموعه‌ای از قابلیت‌های دیجیتال دسترسی کنترل‌شده داشته باشد.**

این abstraction چندین بازار و سرویس را روی یک تجربه کاربری واحد قرار می‌دهد.

---

# 37. ویستا به‌عنوان «سیستم‌عامل خدمات»

می‌توان Vision نهایی را چنین نمایش داد:

```text
                     USER
                       │
                       ↓
                ┌─────────────┐
                │    VISTA    │
                │             │
                │ Identity    │
                │ Agent       │
                │ Consent     │
                │ Policy      │
                │ Security    │
                │ Marketplace │
                │ Orchestration│
                └──────┬──────┘
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
    Transport        Banking        Education
       │               │                │
      Snap         Bank Sina        Konkooria
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                Digital Economy
```

در این مدل، ویستا مشابه یک سیستم‌عامل عمل می‌کند چون:

- منابع را abstraction می‌کند؛
- access را کنترل می‌کند؛
- identity را مدیریت می‌کند؛
- execution را policy-driven می‌کند؛
- communication بین components را استاندارد می‌کند؛
- applications/capabilities جدید را قابل نصب می‌کند؛
- و به مرور به بستر سایر توسعه‌دهندگان تبدیل می‌شود.

---

# 38. «MCP Browser» یا «Service Operating Layer»؟

عبارت MCP Browser برای شروع بسیار جذاب است، چون قابل فهم و قابل تصور است.

اما Vision نهایی فراتر از Browser است.

MCP Browser فقط Client است.

ویستا در حالت کامل‌تر شامل اینهاست:

```text
Client
+
Agent
+
Identity
+
Consent
+
Marketplace
+
MCP Gateway
+
API Gateway
+
Policy Engine
+
Transaction Layer
+
Financial Infrastructure
```

پس ممکن است در نهایت معماری محصول بهتر باشد با تعبیر:

> **Vista Agent Platform**

یا:

> **Vista Service Operating Layer**

معرفی شود و «MCP Browser» یکی از تجربه‌های کاربری آن باشد.

---

# 39. مهم‌ترین اصول معماری

## اصل ۱: Agent اختیار مطلق ندارد

LLM پیشنهاد می‌دهد؛ policy و authorization تصمیم نهایی را کنترل می‌کنند.

## اصل ۲: عملیات حساس Intent-driven هستند

Agent به جای اجرای نهایی، Intent می‌سازد.

## اصل ۳: کاربر همان چیزی را تأیید می‌کند که واقعاً اجرا خواهد شد

جزئیات transaction باید از مرجع معتبر سرویس استخراج شوند.

## اصل ۴: Identity یکی است، Permissionها جدا هستند

Single Sign-On به معنای Single Privilege نیست.

## اصل ۵: Privilege قابل افزایش خودکار نیست

خروجی MCP نمی‌تواند permission جدید تولید کند.

## اصل ۶: عملیات حساس کوتاه‌عمر و single-use هستند

Replay نباید امکان‌پذیر باشد.

## اصل ۷: Kill Switch باید built-in باشد

برای عملیات حساس، امکان توقف سریع وجود داشته باشد.

## اصل ۸: Data و Ledger از هم تفکیک شوند

هر داده‌ای برای immutable distributed storage مناسب نیست.

## اصل ۹: Core Banking deterministic باقی بماند

هوش مصنوعی نباید جایگزین منطق قطعی بانکی شود.

## اصل ۱۰: Vendor independence حفظ شود

WSO2 ابزار زیرساخت است، نه تعریف هویت ویستا.

---

# 40. ریسک‌هایی که باید از ابتدا برای آنها پاسخ داشته باشیم

## امنیت Agent

- Prompt injection
- Tool abuse
- Privilege escalation
- Credential theft
- Replay
- confused deputy
- data exfiltration

## امنیت مالی

- اشتباه مبلغ
- اشتباه گیرنده
- تراکنش تکراری
- race condition
- double spending
- oracle manipulation
- liquidation failure

## هویت

- سرقت session
- سوءاستفاده از دستگاه
- SIM swap
- compromise شدن credential
- بازیابی حساب

## Availability

- از کار افتادن Agent
- از کار افتادن MCP
- از کار افتادن Gateway
- از کار افتادن provider هوش مصنوعی
- قطع ارتباط با بانک
- Disaster Recovery

## Governance

- MCP مخرب
- MCP جعلی
- owner ناشناخته
- تغییر رفتار MCP پس از approval
- نسخه‌های متعدد و ناسازگار

---

# 41. یک نکته کلیدی درباره «هوش مصنوعی بومی»

در بلندمدت، ویستا می‌تواند از چند مدل استفاده کند.

مدل باید یک dependency قابل تعویض باشد، نه بخشی از business logic.

```text
                  Vista Agent
                       │
                 Model Gateway
                       │
            ┌──────────┼──────────┐
            ↓          ↓          ↓
         Qwen       Local Model  External Model
```

این معماری امکان می‌دهد:

- مدل‌های Open-weight روی زیرساخت داخلی اجرا شوند؛
- در شرایط خاص از مدل خارجی استفاده شود؛
- failover داشته باشیم؛
- هزینه مدیریت شود؛
- وابستگی به یک ارائه‌دهنده کاهش یابد.

اما خرید GPU و انتخاب مدل نباید تبدیل به شرط آغاز فاز اول شود.

---

# 42. یک use case نمونه برای نشان دادن کل معماری

سناریو:

> کاربر می‌گوید «برای فردا ساعت ۸ صبح برای خانه مامانم ماشین بگیر.»

### مرحله ۱ — درک درخواست

Agent درخواست را تحلیل می‌کند.

### مرحله ۲ — کشف capability

MCP Manager می‌بیند سرویس حمل‌ونقل مناسب در اختیار کاربر است.

### مرحله ۳ — بازیابی اطلاعات

Agent از capability کم‌ریسک برای یافتن آدرس ذخیره‌شده استفاده می‌کند.

### مرحله ۴ — ساخت Intent

Agent یک Ride Intent می‌سازد.

### مرحله ۵ — Risk Evaluation

Policy Engine مشخص می‌کند آیا این اقدام نیازمند confirmation است یا خیر.

### مرحله ۶ — تأیید در صورت نیاز

Client اطلاعات نهایی را از سرویس authoritative دریافت می‌کند.

### مرحله ۷ — اجرا

پس از تأیید، API واقعی سرویس فراخوانی می‌شود.

### مرحله ۸ — نتیجه

نتیجه از طریق Agent به کاربر برگردانده می‌شود.

این مثال نشان می‌دهد که ویستا صرفاً «LLM + MCP» نیست؛ بلکه مجموعه‌ای از identity، policy، orchestration و execution control است.

---

# 43. نمونه بانکی

کاربر:

> «۵۰ میلیون تومان برای علی انتقال بده.»

جریان پیشنهادی:

```text
User
 ↓
Agent
 ↓
Find recipient
 ↓
Create Transfer Intent
 ↓
Risk Engine
 ↓
L3
 ↓
Authoritative transaction details
 ↓
User sees exact details
 ↓
Step-up authentication
 ↓
Digital signature
 ↓
Banking API
 ↓
Core Banking
 ↓
Ledger / Settlement
 ↓
Notification
```

در هیچ نقطه‌ای LLM مستقیماً دستور «انتقال پول» را با اختیار کامل اجرا نمی‌کند.

---

# 44. Vision نهایی

در چشم‌انداز بلندمدت، ویستا می‌تواند سه دنیای جدا را روی یک لایه واحد قرار دهد:

```text
             HUMAN
               │
               ↓
             AGENT
               │
               ↓
        VISTA OPERATING LAYER
               │
       ┌───────┼────────┐
       ↓       ↓        ↓
     APIs     MCPs    Financial
                       Contracts
       │       │        │
       └───────┼────────┘
               ↓
        DIGITAL ECOSYSTEM
```

در این Vision:

- APIها به قابلیت تبدیل می‌شوند؛
- MCPها به زبان اتصال Agentها و سرویس‌ها تبدیل می‌شوند؛
- Identity و Consent مرز اعتماد را ایجاد می‌کنند؛
- Agent تجربه‌ی واحد کاربر را فراهم می‌کند؛
- Marketplace اکوسیستم توسعه‌دهندگان را شکل می‌دهد؛
- Banking و DLT امکان transaction و programmable finance را فراهم می‌کنند.

---

# 45. جمع‌بندی نهایی

پیشنهاد پروژه را می‌توان از این مسیر دید:

```text
API Gateway
   ↓
MCP Platform
   ↓
Agent Platform
   ↓
AI-native Banking
   ↓
Programmable Finance
```

و در سطح Vision:

> **ویستا می‌تواند به یک لایه‌ی عملیاتی مشترک برای استفاده‌ی هوشمند، امن و برنامه‌پذیر از خدمات دیجیتال تبدیل شود؛ لایه‌ای که به جای آنکه کاربر را مجبور کند برای هر خدمت وارد یک اپلیکیشن جداگانه شود، یک هویت، یک Agent و یک محیط واحد در اختیار او قرار می‌دهد و دسترسی Agent به خدمات را با مدل دقیق هویت، رضایت، سیاست و امنیت کنترل می‌کند.**

به همین دلیل تعبیر «سیستم‌عامل» به عنوان استعاره، جذاب و معنادار است؛ با این تفاوت که این سیستم‌عامل به جای CPU و حافظه، **Capabilityها و خدمات دیجیتال** را مدیریت می‌کند.

---

# 46. پیشنهاد برای بیان این مفهوم در پروپوزال مدیریتی

برای مخاطب غیرفنی بهتر است ابتدا از استعاره شروع شود، نه از MCP و Blockchain.

نمونه روایت:

> امروز برای هر خدمت دیجیتال، کاربر معمولاً باید وارد یک سامانه یا اپلیکیشن جداگانه شود. در نسل جدید تعامل انسان و هوش مصنوعی، می‌توان این مدل را معکوس کرد: کاربر به جای مراجعه به اپلیکیشن‌های متعدد، با یک Agent واحد صحبت می‌کند و Agent، با رعایت سطح دسترسی و تأییدات لازم، از قابلیت‌های سرویس‌های مختلف استفاده می‌کند.
>
> در چنین مدلی، یک لایه‌ی مشترک لازم است که هویت، مجوز، امنیت، اتصال سرویس‌ها، قابلیت کشف سرویس‌ها، تراکنش و تعامل با Agent را مدیریت کند. ویستا می‌تواند این لایه را برای اکوسیستم ایرانسل ایجاد کند.
>
> این لایه در گام‌های اولیه یک پلتفرم API/MCP و Agent خواهد بود، اما در چشم‌انداز بلندمدت می‌تواند به «سیستم‌عامل خدمات دیجیتال و Agentها» تبدیل شود.

این روایت برای شروع پروپوزال بسیار مناسب‌تر از توضیح مستقیم Blockchain یا تکنولوژی‌های زیرساختی است.

---

# 47. نکته نهایی درباره دامنه پروژه

تمام اجزای این سند ارزشمندند، اما نباید همگی به عنوان deliverable فاز اول معرفی شوند.

بهتر است در proposal نهایی بین این سه دسته تفکیک شود:

### Core
چیزهایی که پروژه بدون آنها معنا ندارد:

- Identity
- MCP/API Gateway
- Agent
- Consent
- Action Intent
- Policy
- Security
- چند سرویس واقعی

### Expansion
چیزهایی که ارزش محصول را چند برابر می‌کنند:

- Marketplace
- Developer ecosystem
- Banking
- Digital Signature
- Risk Engine
- Monetization

### Long-term Vision
چیزهایی که جهت آینده را مشخص می‌کنند:

- Permissioned DLT
- Tokenized Assets
- Smart Contracts
- Programmable Finance
- Stable-value / digital asset concepts

این تفکیک باعث می‌شود proposal هم **جسورانه** باشد و هم **قابل اجرا**.
