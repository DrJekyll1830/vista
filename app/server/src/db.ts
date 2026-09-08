import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;
type PoolClient = pg.PoolClient;
type QueryResultRow = Record<string, any>;

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: Number(process.env.PGPOOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
const transactionStore = new AsyncLocalStorage<PoolClient>();

// Vista's original SQL used SQLite's '?' placeholders. Keep the query sites
// readable while translating placeholders for node-postgres. Question marks
// inside quoted SQL strings are left untouched.
function postgresSql(sql: string): string {
  let n = 0;
  let quote: "'" | '"' | null = null;
  let out = '';
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (quote) {
      out += ch;
      if (ch === quote && sql[i + 1] === quote) out += sql[++i];
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      out += ch;
    } else if (ch === '?') {
      out += `$${++n}`;
    } else {
      out += ch;
    }
  }
  return out;
}

async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const current = transactionStore.getStore();
  if (current) return fn(current);
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export const q = {
  async get<T = QueryResultRow>(sql: string, ...params: any[]): Promise<T | undefined> {
    return withClient(async (client) => {
      const result = await client.query(postgresSql(sql), params);
      return result.rows[0] as T | undefined;
    });
  },
  async all<T = QueryResultRow>(sql: string, ...params: any[]): Promise<T[]> {
    return withClient(async (client) => {
      const result = await client.query(postgresSql(sql), params);
      return result.rows as T[];
    });
  },
  async run(sql: string, ...params: any[]): Promise<pg.QueryResult> {
    return withClient((client) => client.query(postgresSql(sql), params));
  },
  async tx<T>(fn: () => Promise<T>): Promise<T> {
    const current = transactionStore.getStore();
    if (current) return fn();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await transactionStore.run(client, fn);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

export async function initDb() {
  await pool.query(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  national_id TEXT,
  birth_date_jalali TEXT,
  birth_date_iso TEXT,
  first_name TEXT,
  last_name TEXT,
  shahkar_matched INTEGER DEFAULT 0,
  kyc_level INTEGER DEFAULT 0,
  onboarded_at TEXT,
  default_page TEXT DEFAULT 'assistant',
  theme TEXT DEFAULT 'system',
  ai_base_url TEXT, ai_api_key TEXT, ai_model TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  device TEXT,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS otps (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL,
  ref TEXT,
  attempts INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  url TEXT,
  mini_app_url TEXT,
  color TEXT DEFAULT '#2C5FA8',
  logo TEXT DEFAULT '?',
  company TEXT,
  verified INTEGER DEFAULT 0,
  public_key TEXT,
  permissions_json TEXT DEFAULT '[]',
  financial_permissions_json TEXT DEFAULT '[]',
  data_permissions_json TEXT DEFAULT '[]',
  fulfillment_tool TEXT,
  auth_json TEXT,
  in_catalog INTEGER DEFAULT 0,
  category TEXT,
  rating REAL,
  reviews_json TEXT DEFAULT '[]',
  tags_json TEXT DEFAULT '[]',
  health TEXT DEFAULT 'unknown',
  health_checked_at TEXT,
  last_error TEXT,
  manifest_json TEXT,
  tools_json TEXT DEFAULT '[]',
  added_by TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS installs (
  user_id TEXT NOT NULL REFERENCES users(id),
  app_id TEXT NOT NULL REFERENCES apps(id),
  installed_at TEXT NOT NULL,
  start_contract_id TEXT,
  permissions_json TEXT DEFAULT '[]',
  muted INTEGER DEFAULT 0,
  credential TEXT,
  removed_at TEXT,
  PRIMARY KEY (user_id, app_id)
);
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  app_id TEXT NOT NULL,
  last_message_at TEXT,
  last_preview TEXT DEFAULT '',
  unread INTEGER DEFAULT 0,
  UNIQUE (user_id, app_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  kind TEXT NOT NULL,
  text TEXT DEFAULT '',
  contract_id TEXT,
  reply_to_contract_id TEXT,
  meta_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  prev_version_id TEXT,
  type TEXT NOT NULL,
  template_ref TEXT,
  title TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  doc_json TEXT NOT NULL,
  canonical_hash TEXT NOT NULL,
  nonce TEXT UNIQUE NOT NULL,
  required_rung INTEGER DEFAULT 1,
  expires_at TEXT,
  share_token TEXT UNIQUE,
  origin TEXT DEFAULT 'app',
  delegation_id TEXT,
  created_at TEXT NOT NULL,
  executed_at TEXT,
  settled_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_contracts_user ON contracts(user_id, created_at);
CREATE TABLE IF NOT EXISTS signatures (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id),
  version INTEGER NOT NULL,
  party_id TEXT NOT NULL,
  party_kind TEXT NOT NULL,
  rung INTEGER NOT NULL,
  hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  otp_id TEXT,
  session_hint TEXT,
  device TEXT,
  viewed_json TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id),
  type TEXT NOT NULL,
  actor_kind TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  text TEXT DEFAULT '',
  payload_json TEXT,
  signature TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ledger (
  seq INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  kind TEXT NOT NULL,
  ref_type TEXT, ref_id TEXT,
  user_id TEXT, app_id TEXT,
  payload_json TEXT NOT NULL,
  prev_hash TEXT NOT NULL,
  hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS wallets (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  balance INTEGER NOT NULL DEFAULT 0,
  held INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS wallet_txns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  held_after INTEGER NOT NULL,
  contract_id TEXT,
  app_id TEXT,
  memo TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  contract_id TEXT,
  gateway TEXT NOT NULL,
  ref_no TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE TABLE IF NOT EXISTS delegations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  contract_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  label TEXT NOT NULL,
  cap INTEGER NOT NULL,
  per_use_cap INTEGER,
  spent INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE TABLE IF NOT EXISTS delegation_uses (
  id TEXT PRIMARY KEY,
  delegation_id TEXT NOT NULL,
  contract_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS app_keys (
  app_id TEXT PRIMARY KEY,
  private_key TEXT NOT NULL,
  public_key TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);
}

export async function closeDb() {
  await pool.end();
}

export const json = {
  parse<T = any>(s: string | null | undefined, d: T): T {
    if (!s) return d;
    try { return JSON.parse(s) as T; } catch { return d; }
  },
};
