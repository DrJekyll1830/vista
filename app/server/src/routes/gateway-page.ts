/** درگاه پرداخت آزمایشی — بعداً با درگاه واقعی جایگزین می‌شود. دو دکمه: موفق / ناموفق. */
import { Hono } from 'hono';
import { q } from '../db.js';
import { toman } from '../util/persian.js';
import { completeTopup } from '../contracts/system.js';
import { id } from '../util/ids.js';

export const gatewayPage = new Hono();
const shell = (title: string, inner: string) => `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:Vazirmatn,system-ui,sans-serif;background:#eef1f5;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;color:#1f2937}.box{background:#fff;border-radius:16px;padding:28px;max-width:420px;width:92%;box-shadow:0 10px 40px rgba(0,0,0,.08)}h1{font-size:18px;margin:0 0 6px}.warn{background:#fff7ed;border:1px dashed #f59e0b;color:#92400e;border-radius:10px;padding:10px 12px;font-size:13px;margin:12px 0}.amt{font-size:28px;font-weight:700;margin:14px 0}.row{display:flex;gap:10px;margin-top:18px}button{flex:1;border:0;border-radius:10px;padding:12px;font:inherit;font-weight:600;cursor:pointer}.ok{background:#16a34a;color:#fff}.no{background:#e5e7eb;color:#111}small{color:#6b7280}.card{border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin:10px 0;font-size:13px}</style></head><body><div class="box">${inner}</div></body></html>`;

gatewayPage.get('/:id', async (c) => {
  const p = await q.get<any>('SELECT * FROM payments WHERE id=?', c.req.param('id'));
  if (!p) return c.html(shell('درگاه', '<h1>پرداخت یافت نشد</h1>'), 404);
  if (p.status !== 'pending') return c.html(shell('درگاه', `<h1>این پرداخت قبلاً نهایی شده است</h1><p>وضعیت: ${p.status === 'success' ? 'موفق' : 'ناموفق'}</p><p><a href="/wallet?payment=${p.id}">بازگشت به ویستا</a></p>`));
  return c.html(shell('درگاه پرداخت آزمایشی', `
    <h1>درگاه پرداخت آزمایشی</h1><small>پذیرنده: ویستا · شناسهٔ پرداخت ${p.id}</small>
    <div class="warn">این یک درگاه <b>آزمایشی</b> است و بعداً با درگاه واقعی (پرداخت با کارت هر بانکی) جایگزین می‌شود. نتیجهٔ پرداخت را خودتان انتخاب کنید.</div>
    <div class="amt">${toman(p.amount)}</div>
    <div class="card">شمارهٔ کارت: ۶۰۳۷-****-****-۱۲۳۴ (نمایشی)<br>رمز دوم: •••••• (نمایشی)</div>
    <form method="post" action="/gateway/${p.id}/complete"><div class="row"><button class="ok" name="result" value="success">پرداخت موفق</button><button class="no" name="result" value="failed">پرداخت ناموفق</button></div></form>`));
});
gatewayPage.post('/:id/complete', async (c) => {
  const pid = c.req.param('id');
  const form = await c.req.parseBody();
  const success = form.result === 'success';
  try { await completeTopup(pid, success, success ? id('ref', 10).toUpperCase() : undefined); } catch (e: any) { return c.html(shell('درگاه', `<h1>خطا</h1><p>${e?.message}</p>`), 400); }
  return c.redirect(`/wallet?payment=${pid}&result=${success ? 'success' : 'failed'}`);
});
