// identity.js — توليد وتخزين هوية المستخدم (مفتاح Nostr)
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const KEY_FILE = '.pulse-identity.json';

export function loadOrCreateIdentity() {
  if (process.env.NOSTR_SK) {
    const sk = Uint8Array.from(Buffer.from(process.env.NOSTR_SK, 'hex'));
    return { sk, pk: getPublicKey(sk) };
  }
  if (existsSync(KEY_FILE)) {
    const data = JSON.parse(readFileSync(KEY_FILE, 'utf8'));
    return {
      sk: Uint8Array.from(Buffer.from(data.sk, 'hex')),
      pk: data.pk,
    };
  }
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  writeFileSync(KEY_FILE, JSON.stringify({ sk: Buffer.from(sk).toString('hex'), pk }, null, 2));
  return { sk, pk };
}

export function printIdentity({ sk, pk }) {
  const npub = nip19.npubEncode(pk);
  const nsec = nip19.nsecEncode(sk);
  console.log('npub (هويتك العامة):', npub);
  console.log('nsec (مفتاحك السري - لا تشاركه):', nsec);
  return { npub, nsec };
}
