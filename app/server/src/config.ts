import fs from 'node:fs';
import path from 'node:path';

// Load .env (from app/ root or server/) without a dependency.
function loadEnv() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
    path.resolve(process.cwd(), 'app', '.env'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (process.env[key] === undefined) process.env[key] = val;
    }
    break;
  }
}
loadEnv();

const env = (k: string, d = '') => (process.env[k] ?? d).trim();
const bool = (k: string, d = false) => {
  const v = env(k, '');
  if (!v) return d;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
};

export const config = {
  port: Number(env('PORT', '8787')),
  publicUrl: env('PUBLIC_URL', 'http://localhost:8787').replace(/\/$/, ''),
  databasePath: env('DATABASE_PATH', './data/vista.db'),
  platformSecret: env('PLATFORM_SECRET', 'change-me-in-production'),
  sms: {
    provider: env('SMS_PROVIDER', 'console') as 'console' | 'kavenegar' | 'smsir' | 'http',
    otpAcceptAny: bool('OTP_ACCEPT_ANY', false),
    devShowOtp: bool('DEV_SHOW_OTP', true),
    kavenegar: { apiKey: env('KAVENEGAR_API_KEY'), template: env('KAVENEGAR_TEMPLATE'), sender: env('KAVENEGAR_SENDER') },
    smsir: { apiKey: env('SMSIR_API_KEY'), templateId: env('SMSIR_TEMPLATE_ID'), lineNumber: env('SMSIR_LINE_NUMBER') },
    http: {
      url: env('SMS_HTTP_URL'),
      method: env('SMS_HTTP_METHOD', 'POST'),
      headers: env('SMS_HTTP_HEADERS', '{"content-type":"application/json"}'),
      body: env('SMS_HTTP_BODY', '{"to":"{phone}","text":"{message}"}'),
    },
  },
  ai: {
    baseUrl: env('AI_BASE_URL').replace(/\/$/, ''),
    apiKey: env('AI_API_KEY'),
    model: env('AI_MODEL'),
    maxToolRounds: Number(env('AI_MAX_TOOL_ROUNDS', '8')),
  },
  kyc: {
    shahkar: env('SHAHKAR_PROVIDER', 'mock'),
    nameLookup: env('NAME_LOOKUP_PROVIDER', 'down'),
  },
  payment: { gateway: env('PAYMENT_GATEWAY', 'fake') },
  sampleApp: { enabled: bool('SAMPLE_APP_ENABLED', true) },
  // Signature ceilings (toman). Rung 1 up to this amount, above it rung 2 is required.
  ceilings: { rung1: 2_000_000, rung2: 20_000_000 },
  isDev: env('NODE_ENV', 'development') !== 'production',
};
