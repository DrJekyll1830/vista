import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, del, fa } from '../api';
import { useAuth } from '../auth';
import { Avatar, Top, toast, Field, Spinner } from '../ui';

export default function Settings() {
  const nav = useNavigate(); const { me, refresh, logout } = useAuth(); const u = me?.user;
  const [byok, setByok] = useState({ base_url: u?.byok?.base_url ?? '', api_key: '', model: u?.byok?.model ?? '' }); const [busy, setBusy] = useState(false); const [platform, setPlatform] = useState<any>(null); const [ledger, setLedger] = useState<any[] | null>(null);
  useEffect(() => { get('/platform').then(setPlatform).catch(() => {}); }, []);
  async function saveByok() { setBusy(true); try { await post('/settings/byok', byok); await refresh(); toast('از این پس دستیار با مدل شما کار می‌کند'); } catch (e: any) { toast(e.message); } finally { setBusy(false); } }
  async function clearByok() { await del('/settings/byok'); await refresh(); toast('مدل پیش‌فرض سکو'); }
  async function setPref(k: string, v: string) { await post('/settings', { [k]: v }); await refresh(); }
  if (!u) return null;
  return (
    <>
      <Top onBack={() => nav('/apps')} avatar={<Avatar color="#6B7B96" logo="ت" />} title="تنظیمات" sub="احراز هویت، کلید مدل، ظاهر، صفحهٔ پیش‌فرض" />
      <div className="body pad">
        <div className="card"><h3>هویت</h3><div className="kv"><span>نام</span><b>{u.first_name} {u.last_name}</b><span>شماره</span><b dir="ltr">{fa(u.phone)}</b><span>کد ملی</span><b dir="ltr">{u.national_id_masked}</b><span>تاریخ تولد</span><b>{u.birth_date_jalali}</b><span>تطبیق شاهکار</span><b>{u.shahkar_matched ? 'انجام شد (شبیه‌سازی)' : 'انجام نشد'}</b><span>سطح احراز</span><b>{fa(u.kyc_level)}</b></div>
          <p className="hint" style={{ marginTop: 8 }}>امضای پله‌های ۱ و ۲ فعال است. پله‌های ۳ و ۴ (کلید گوشی و سیم‌کارت) در نسخهٔ بعد می‌آیند.</p></div>
        <div className="card"><h3>دستیار و مدل زبانی</h3>
          <p className="hint">وضعیت: {me?.assistant_available ? `در دسترس (${me.provider === 'byok' ? 'مدل شما' : 'مدل سکو'})` : 'در دسترس نیست — نه مدل سکو پیکربندی شده، نه کلید شما'}</p>
          <p className="hint" style={{ marginBottom: 8 }}>کلید خودتان را بیاورید: آدرس هر ارائه‌دهندهٔ سازگار با OpenAI و کلید و نام مدل. از آن به بعد همان دستیار ویستا با مدل شما کار می‌کند — و همچنان نمی‌تواند امضا کند.</p>
          <Field label="آدرس پایه (Base URL)"><input dir="ltr" placeholder="https://api.example.com/v1" value={byok.base_url} onChange={(e) => setByok({ ...byok, base_url: e.target.value })} /></Field>
          <Field label="کلید API"><input dir="ltr" type="password" placeholder={u.byok?.has_key ? '•••••• (ذخیره شده)' : ''} value={byok.api_key} onChange={(e) => setByok({ ...byok, api_key: e.target.value })} /></Field>
          <Field label="نام مدل"><input dir="ltr" value={byok.model} onChange={(e) => setByok({ ...byok, model: e.target.value })} /></Field>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn primary" disabled={busy || !byok.base_url || !byok.api_key || !byok.model} onClick={saveByok}>{busy ? <Spinner /> : 'ذخیره'}</button>{u.byok?.has_key && <button className="btn" onClick={clearByok}>حذف کلید</button>}</div>
        </div>
        <div className="card"><h3>ظاهر و صفحهٔ پیش‌فرض</h3>
          <Field label="تم"><select value={u.theme} onChange={(e) => setPref('theme', e.target.value)}><option value="system">سیستم</option><option value="light">روشن</option><option value="dark">تاریک</option></select></Field>
          <Field label="برنامه با کدام صفحه باز شود"><select value={u.default_page} onChange={(e) => setPref('default_page', e.target.value)}><option value="assistant">گفت‌وگو با دستیار</option><option value="apps">فهرست اپ‌ها</option></select></Field>
        </div>
        <div className="card"><h3>دفتر</h3><p className="hint">هر چیزی که اثری داشته، در دفترِ افزودنی و زنجیره‌شده ثبت است. {platform && <span>کلید عمومی سکو: <span className="mono">{platform.public_key.slice(0, 16)}…</span></span>}</p>
          <button className="btn sm" style={{ marginTop: 8 }} onClick={async () => { try { const [v, l] = await Promise.all([get('/ledger/verify'), get('/ledger/mine')]); toast(v.ok ? `زنجیره سالم است (${fa(v.count)} رکورد)` : `زنجیره در رکورد ${fa(v.brokenAt)} شکسته`); setLedger(l.entries); } catch (e: any) { toast(e.message); } }}>بررسی و نمایش رکوردهای من</button>
          {ledger && <div style={{ marginTop: 8 }}>{ledger.slice(0, 40).map((e) => <div key={e.seq} className="pc"><span className="mono">{e.kind}</span><small>{e.at_label}</small></div>)}</div>}
        </div>
        <div className="card"><h3>دربارهٔ این نسخه</h3><p className="hint">محصول زندهٔ اثبات مفهوم. پیامک: {platform?.sms_provider}{platform?.otp_accept_any ? ' (هر کدی پذیرفته می‌شود)' : ''} · درگاه: {platform?.gateway === 'fake' ? 'آزمایشی' : platform?.gateway} · سقف پلهٔ ۱: {platform ? fa(platform.ceilings.rung1.toLocaleString('en-US')) : '…'} تومان</p></div>
        <button className="btn block danger" style={{ marginTop: 10 }} onClick={() => { logout(); nav('/login'); }}>خروج</button>
      </div>
    </>
  );
}
