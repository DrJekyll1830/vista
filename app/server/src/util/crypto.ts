import { createHmac, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify, timingSafeEqual, KeyObject, randomInt } from 'node:crypto';

// ── Ed25519 (apps and the platform sign contract hashes with this) ──
export interface KeyPair { publicKey: string; privateKey: string } // base64 raw 32-byte pub / PKCS8 PEM priv

export function generateEd25519(): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return { publicKey: rawPublicKeyBase64(publicKey), privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() };
}
const SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
export function rawPublicKeyBase64(key: KeyObject): string {
  const der = key.export({ type: 'spki', format: 'der' }) as Buffer;
  return der.subarray(der.length - 32).toString('base64');
}
export function publicKeyFromRawBase64(b64: string): KeyObject {
  const raw = Buffer.from(b64, 'base64');
  if (raw.length !== 32) throw new Error('invalid ed25519 public key');
  return createPublicKey({ key: Buffer.concat([SPKI_PREFIX, raw]), format: 'der', type: 'spki' });
}
/** Sign a UTF-8 message (normally the hex canonical hash) → base64 signature. */
export function ed25519Sign(privateKeyPem: string, message: string): string {
  return sign(null, Buffer.from(message, 'utf8'), createPrivateKey(privateKeyPem)).toString('base64');
}
export function ed25519Verify(publicKeyRawB64: string, message: string, signatureB64: string): boolean {
  try {
    return verify(null, Buffer.from(message, 'utf8'), publicKeyFromRawBase64(publicKeyRawB64), Buffer.from(signatureB64, 'base64'));
  } catch {
    return false;
  }
}

// ── HMAC (rung-1 "authenticated request" records, session-bound) ──
export function hmacHex(secret: string, message: string): string {
  return createHmac('sha256', secret).update(message).digest('hex');
}
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
export function otpCode(len = 5): string {
  let s = '';
  for (let i = 0; i < len; i++) s += String(randomInt(0, 10));
  return s;
}
