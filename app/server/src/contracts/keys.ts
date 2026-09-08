import { q } from '../db.js';
import { generateEd25519, ed25519Sign, ed25519Verify } from '../util/crypto.js';

/** Keys for the platform and for apps hosted in-process (system apps, the reference app). */
export async function ensureKey(appId: string): Promise<{ publicKey: string; privateKey: string }> {
  let k = await q.get<{ private_key: string; public_key: string }>('SELECT * FROM app_keys WHERE app_id=?', appId);
  if (!k) {
    const kp = generateEd25519();
    await q.run('INSERT INTO app_keys (app_id, private_key, public_key) VALUES (?,?,?)', appId, kp.privateKey, kp.publicKey);
    k = { private_key: kp.privateKey, public_key: kp.publicKey };
  }
  return { publicKey: k.public_key, privateKey: k.private_key };
}
export async function signWithKey(appId: string, message: string): Promise<string> {
  return ed25519Sign((await ensureKey(appId)).privateKey, message);
}
export const platformPublicKey = async () => (await ensureKey('platform')).publicKey;
export const platformSign = (message: string) => signWithKey('platform', message);
export const verifySig = ed25519Verify;
