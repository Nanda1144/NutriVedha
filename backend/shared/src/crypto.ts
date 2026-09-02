import crypto from 'node:crypto';

/**
 * AES-256-GCM encryption for sensitive medical/clinical data.
 */
const ALGO = 'aes-256-gcm';

function keyFrom(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(text: string, secret: string): string {
  const key = keyFrom(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
}

export function decrypt(payload: string, secret: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.');
  const key = keyFrom(secret);
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
}
