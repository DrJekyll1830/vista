import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

const file = path.resolve(config.databasePath);
fs.mkdirSync(path.dirname(file), { recursive: true });
export const db = new DatabaseSync(file);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
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
  purpose TEXT NOT NULL,          -- login | sign
  ref TEXT,                       -- contract hash for purpose=sign
  attempts INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,             -- system | vista | mcp
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  url TEXT,                       -- MCP endpoint
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
  auth_json TEXT,                 -- {type:'bearer', label:'...', header?:'authorization'}
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
  kind TEXT NOT NULL,             -- user | app | assistant | system | contract | event | forward
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
  status TEXT NOT NULL,           -- draft | awaiting | signed | executing | settled | rejected | expired | cancelled | disputed | refunded | failed
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
  party_kind TEXT NOT NULL,       -- app | user | platform
  rung INTEGER NOT NULL,
  hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  otp_id TEXT,
  session_hint TEXT,
  device TEXT,
  viewed_json TEXT,               -- exactly what the signer saw
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id),
  type TEXT NOT NULL,             -- held | deducted | delivered | cancelled | refunded | disputed | released | note | delegated_use | failed
  actor_kind TEXT NOT NULL,       -- app | user | platform
  actor_id TEXT NOT NULL,
  text TEXT DEFAULT '',
  payload_json TEXT,
  signature TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ledger (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
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
  kind TEXT NOT NULL,             -- topup | hold | capture | release | refund | fee
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
  status TEXT NOT NULL,           -- pending | success | failed
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
  status TEXT NOT NULL,           -- active | revoked | expired | exhausted
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

type Row = Record<string, any>;
export const q = {
  get<T = Row>(sql: string, ...params: any[]): T | undefined {
    return db.prepare(sql).get(...params) as T | undefined;
  },
  all<T = Row>(sql: string, ...params: any[]): T[] {
    return db.prepare(sql).all(...params) as T[];
  },
  run(sql: string, ...params: any[]) {
    return db.prepare(sql).run(...params);
  },
  tx<T>(fn: () => T): T {
    db.exec('BEGIN');
    try {
      const r = fn();
      db.exec('COMMIT');
      return r;
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },
};
export const json = {
  parse<T = any>(s: string | null | undefined, d: T): T {
    if (!s) return d;
    try { return JSON.parse(s) as T; } catch { return d; }
  },
};
