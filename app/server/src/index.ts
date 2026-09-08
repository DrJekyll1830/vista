import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { q, json, initDb, closeDb } from './db.js';
import { seedApps, getApp } from './gateway/registry.js';
import { callTool, healthSweep, closeAll } from './gateway/mcp.js';
import * as engine from './contracts/engine.js';
import { api } from './routes/api.js';
import { appsApi } from './routes/apps-api.js';
import { gatewayPage } from './routes/gateway-page.js';
import { sampleApp, registerSampleApp, APP_ID as SAMPLE_APP_ID } from './sample-app/index.js';

await initDb();
await seedApps();
if (config.sampleApp.enabled) await registerSampleApp();

// پردازشگر → اپ: تحویل از راه MCP (ابزار پنهان vista_fulfil)، با امضای سکو روی هش اجراشده
engine.setFulfiller(async (row, doc, platformSignature) => {
  const app = await getApp(row.app_id);
  if (!app || app.kind !== 'vista' || !app.fulfillment_tool) return null;
  const inst = await q.get<any>('SELECT credential FROM installs WHERE user_id=? AND app_id=?', row.user_id, row.app_id);
  const delegation = await q.get<any>('SELECT id FROM delegations WHERE contract_id=?', row.id);
  const res = await callTool(app, app.fulfillment_tool, { contract: doc, platform_signature: platformSignature, delegation_id: delegation?.id }, { credential: inst?.credential, allowHidden: true });
  const txt = res.structured ?? (() => { try { return JSON.parse(res.content.map((c: any) => c.text ?? '').join('')); } catch { return null; } })();
  const events = Array.isArray(txt?.events) ? txt.events : null;
  // The app decides what is terminal: an explicit `failed` event. An error without events is treated as transient and retried.
  if (res.isError && !events?.length) throw new Error(`اپ خطا داد: ${res.content.map((c: any) => c.text ?? '').join(' ').slice(0, 160)}`);
  return { events: events ?? [] };
});

const app = new Hono();
app.use('*', cors());
app.route('/api', appsApi);
app.route('/api', api);
app.route('/gateway', gatewayPage);
if (config.sampleApp.enabled) app.route(`/apps/${SAMPLE_APP_ID}`, sampleApp);
app.get('/health/live', (c) => c.json({ status: 'alive' }));
app.get('/health/ready', async (c) => {
  try { await q.get('SELECT 1'); return c.json({ status: 'ready' }); }
  catch { return c.json({ status: 'not_ready' }, 503); }
});

// وب‌کلاینت ساخته‌شده (اگر باشد) — همه‌جا SPA
const webDist = [path.resolve(process.cwd(), 'web/dist'), path.resolve(process.cwd(), '../web/dist')].find((p) => fs.existsSync(path.join(p, 'index.html')));
if (webDist) {
  const rel = path.relative(process.cwd(), webDist).split(path.sep).join('/');
  app.use('/*', serveStatic({ root: rel }));
  app.get('*', (c) => c.html(fs.readFileSync(path.join(webDist, 'index.html'), 'utf8')));
} else {
  app.get('/', (c) => c.text('Vista API is running. Build the web client (pnpm build) or run `pnpm dev` for the Vite dev server on :5173.'));
}

// housekeeping: health, retries, expiries
setInterval(() => void healthSweep().catch(() => {}), 5 * 60_000);
setInterval(() => { void engine.expireStale().catch(() => {}); void engine.retryPending().catch(() => {}); }, 60_000);
setTimeout(() => void healthSweep().catch(() => {}), 3_000);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`ویستا روی http://localhost:${info.port} بالا آمد · پیامک: ${config.sms.provider}${config.sms.otpAcceptAny ? ' (هر کدی پذیرفته می‌شود)' : ''} · مدل: ${config.ai.model || 'پیکربندی نشده — دستیار در دسترس نیست'} · اپ نمونه: ${config.sampleApp.enabled ? 'فعال' : 'غیرفعال'}`);
});
process.on('SIGINT', async () => { await closeAll(); await closeDb(); process.exit(0); });
export { json };
