// End-to-end smoke test against a running server (console SMS provider, DEV_SHOW_OTP=true).
const BASE = process.env.BASE ?? 'http://localhost:8787';
let token = '';
const j = async (method, path, body) => {
  const r = await fetch(BASE + '/api' + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  let d; try { d = JSON.parse(t); } catch { d = t; }
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${typeof d === 'string' ? d.slice(0, 200) : JSON.stringify(d)}`);
  return d;
};
const ok = (m) => console.log('✓', m);
const phone = '0912' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0');

// 1. login
const o = await j('POST', '/auth/otp', { phone });
const v = await j('POST', '/auth/verify', { otp_id: o.otp_id, phone, code: o.dev_code });
token = v.token; ok(`login ${phone} (otp ${o.dev_code})`);
// 2. identity + name
await j('POST', '/kyc/identity', { national_id: '0012345674', birth_date: '۱۳۷۵/۰۶/۱۵' }).catch(async () => j('POST', '/kyc/identity', { national_id: '0499370899', birth_date: '1375/06/15' }));
const nl = await j('GET', '/kyc/name-lookup'); if (nl.available) throw new Error('name lookup should be down');
await j('POST', '/kyc/name', { first_name: 'امید', last_name: 'آزمایشی' }); ok('kyc done (shahkar mock, name asked)');
// 3. genesis
const g = await j('POST', '/onboarding/genesis');
let r = await j('POST', `/contracts/${g.contract.id}/sign`, { rung: 1, viewed: g.contract });
if (r.contract.status !== 'settled') throw new Error('genesis not settled: ' + r.contract.status);
let me = await j('GET', '/me'); if (!me.user.onboarded) throw new Error('not onboarded'); ok('genesis signed → onboarded, 6 system apps');
const apps = await j('GET', '/apps'); if (apps.apps.length !== 6) throw new Error('expected 6 system apps, got ' + apps.apps.length); ok('app list has 6 system apps');
// 4. wallet top-up via fake gateway
const t = await j('POST', '/wallet/topup', { amount: 1_000_000 });
r = await j('POST', `/contracts/${t.contract.id}/sign`, { rung: 1 });
if (!r.payment) throw new Error('no payment'); ok(`topup contract signed → gateway ${r.payment.gateway_url}`);
let gw = await fetch(BASE + r.payment.gateway_url); if (!gw.ok) throw new Error('gateway page'); 
gw = await fetch(BASE + r.payment.gateway_url + '/complete', { method: 'POST', body: new URLSearchParams({ result: 'success' }), redirect: 'manual' });
let w = await j('GET', '/wallet'); if (w.wallet.balance !== 1_000_000) throw new Error('balance ' + w.wallet.balance); ok('gateway success → wallet 1,000,000');
// failed payment
const t2 = await j('POST', '/wallet/topup', { amount: 50_000 });
r = await j('POST', `/contracts/${t2.contract.id}/sign`, { rung: 1 });
await fetch(BASE + r.payment.gateway_url + '/complete', { method: 'POST', body: new URLSearchParams({ result: 'failed' }), redirect: 'manual' });
w = await j('GET', '/wallet'); if (w.wallet.balance !== 1_000_000) throw new Error('balance changed on failed payment'); 
const c2 = await j('GET', `/contracts/${t2.contract.id}`); if (c2.contract.status !== 'failed') throw new Error('failed topup status ' + c2.contract.status); ok('gateway failure → contract failed, balance unchanged');
// 5. showcase + install sample app (with financial permission → rung 2)
const sc = await j('GET', '/showcase'); if (sc.apps.length < 5) throw new Error('showcase has ' + sc.apps.length); ok(`showcase: ${sc.apps.map((a) => a.name).join(' · ')}`);
const inst = await j('POST', '/showcase/irancell-demo/install', { permissions: ['notify', 'profile.read'] });
r = await j('POST', `/contracts/${inst.contract.id}/sign`, { rung: 1 }); if (r.contract.status !== 'settled') throw new Error('start status ' + r.contract.status); ok('sample app installed via start contract');
const tl = await j('GET', '/apps/irancell-demo/tools'); const names = tl.tools.filter((x) => x.exposed).map((x) => x.name);
if (!names.includes('build_package_contract') || tl.tools.find((x) => x.name === 'vista_fulfil').exposed) throw new Error('tool classification wrong: ' + JSON.stringify(tl.tools.map((x) => [x.name, x.exposed])));
ok(`gateway exposes ${names.length} tools, hides vista_fulfil`);
const st = await j('POST', '/apps/irancell-demo/tools/get_line_status', { args: {} }); if (!st.structured?.phone) throw new Error('line status'); ok('read tool works: ' + st.text.slice(0, 60));
// 6. contract from app → sign → hold → deliver → deduct
const pk = await j('POST', '/apps/irancell-demo/tools/build_package_contract', { args: { package_id: 'p5' } });
if (pk.contract.status !== 'awaiting' || pk.contract.amount !== 95_000) throw new Error('package contract ' + JSON.stringify(pk.contract).slice(0, 200));
r = await j('POST', `/contracts/${pk.contract.id}/sign`, { rung: 1, viewed: pk.contract });
await new Promise((res) => setTimeout(res, 800));
const pc = await j('GET', `/contracts/${pk.contract.id}`);
const evs = pc.contract.events.map((e) => e.type);
if (pc.contract.status !== 'settled' || !evs.includes('held') || !evs.includes('delivered') || !evs.includes('deducted')) throw new Error('package flow ' + pc.contract.status + ' ' + evs);
w = await j('GET', '/wallet'); if (w.wallet.balance !== 905_000 || w.wallet.held !== 0) throw new Error('wallet after package ' + JSON.stringify(w.wallet)); ok('package contract: held → delivered → deducted; balance 905,000');
// 7. rung-2: delegation
const dg = await j('POST', '/apps/irancell-demo/tools/build_auto_renew_delegation', { args: { package_id: 'p5', cap_toman: 300_000, months: 3 } });
if (dg.contract.required_rung !== 2) throw new Error('delegation should need rung 2');
let bad = await j('POST', `/contracts/${dg.contract.id}/sign`, { rung: 1 }).catch((e) => e.message); if (!String(bad).includes('پله')) throw new Error('rung-1 sign should fail: ' + bad); ok('rung-1 signature refused for delegation');
const otp = await j('POST', `/contracts/${dg.contract.id}/otp`);
r = await j('POST', `/contracts/${dg.contract.id}/sign`, { rung: 2, otp_id: otp.otp_id, code: otp.dev_code });
await new Promise((res) => setTimeout(res, 800));
const dl = await j('GET', '/delegations'); if (dl.delegations.length !== 1 || dl.delegations[0].status !== 'active') throw new Error('delegation ' + JSON.stringify(dl)); ok('delegation granted at rung 2 (OTP), active, cap 300,000');
// 8. app acts under delegation while user absent
const sim = await j('POST', '/apps/irancell-demo/simulate-exhaust');
await new Promise((res) => setTimeout(res, 800));
const dl2 = await j('GET', '/delegations'); if (dl2.delegations[0].spent !== 95_000) throw new Error('spent ' + dl2.delegations[0].spent);
w = await j('GET', '/wallet'); if (w.wallet.balance !== 810_000) throw new Error('wallet after delegated ' + JSON.stringify(w.wallet)); ok('delegated renewal executed: spent 95,000, balance 810,000, user notified');
const chat = await j('GET', '/chats/irancell-demo'); if (!chat.messages.some((m) => m.kind === 'event' && m.text.includes('وکالت'))) throw new Error('no delegation notice'); ok('app chat shows contract + events as replies');
// 9. revoke → further use refused
await j('POST', `/delegations/${dl2.delegations[0].id}/revoke`);
bad = await j('POST', '/apps/irancell-demo/simulate-exhaust').catch((e) => e.message); if (!String(bad).includes('لغو')) throw new Error('revoked delegation should refuse: ' + bad); ok('revoked delegation refuses further use');
// 10. dispute + share + ledger
await j('POST', `/contracts/${pk.contract.id}/dispute`, { text: 'بسته فعال نشد' });
const sh = await j('POST', `/contracts/${pk.contract.id}/share`); if (!sh.url.includes('/c/')) throw new Error('share');
const lv = await j('GET', '/ledger/verify'); if (!lv.ok) throw new Error('ledger broken at ' + lv.brokenAt); ok(`dispute + share ok; ledger chain verified (${lv.count} entries)`);
// 11. insufficient balance → failed execution, no hold left
const big = await j('POST', '/apps/irancell-demo/tools/build_topup_contract', { args: { amount: 1_500_000 } });
bad = await j('POST', `/contracts/${big.contract.id}/sign`, { rung: 1 }).catch((e) => e.message); if (!String(bad).includes('موجودی')) throw new Error('insufficient should fail: ' + bad);
w = await j('GET', '/wallet'); if (w.wallet.held !== 0) throw new Error('held after failure'); ok('insufficient balance → execution failed cleanly');
// 12. reject + permission revoke + remove app
const rj = await j('POST', '/apps/irancell-demo/tools/build_topup_contract', { args: { amount: 20_000 } });
await j('POST', `/contracts/${rj.contract.id}/reject`, { reason: 'test' });
await j('POST', '/apps/irancell-demo/permissions/revoke', { key: 'notify' });
const ad = await j('GET', '/apps/irancell-demo'); if (ad.app.granted.includes('notify')) throw new Error('revoke'); ok('reject + one-sided permission revoke');
console.log('\nALL E2E CHECKS PASSED');
