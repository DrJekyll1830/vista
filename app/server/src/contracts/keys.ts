import { q } from '../db.js';
import { generateEd25519, ed25519Sign, ed25519Verify } from '../util/crypto.js';

/** Keys for the platform and for apps hosted in-process (system apps, the reference app). */
export function ensureKey(appId: string): { publicKey: string; privateKey: string } {
  let k = q.get<{ private_key: string; public_key: string }>('SELECT * FROM app_keys WHERE app_id=?', appId);
  if (!k) {
    const kp = generateEd25519();
    q.run('INSERT INTO app_keys (app_id, private_key, public_key) VALUES (?,?,?)', appId, kp.privateKey, kp.publicKey);
    k = { private_key: kp.privateKey, public_key: kp.publicKey };
  }
  return { publicKey: k.public_key, privateKey: k.private_key };
}
export function signWithKey(appId: string, message: string): string {
  return ed25519Sign(ensureKey(appId).privateKey, message);
}
export const platformPublicKey = () => ensureKey('platform').publicKey;
export const platformSign = (message: string) => signWithKey('platform', message);
export const verifySig = ed25519Verify;
