import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import { env } from '../environment.ts';

const tokenEncoding = 'base64url';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString(tokenEncoding);
  const hash = scryptSync(password, salt, 64).toString(tokenEncoding);
  return `${salt}.${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, expected] = storedHash.split('.');
  if (!salt || !expected) return false;

  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, tokenEncoding);
  return actual.length === expectedBuffer.length &&
    timingSafeEqual(actual, expectedBuffer);
}

export function createToken(payload: Record<string, string>, expiresInSeconds: number): string {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const encodedBody = Buffer.from(JSON.stringify(body)).toString(tokenEncoding);
  const signature = createHmac('sha256', env.AUTH_SECRET)
    .update(encodedBody)
    .digest(tokenEncoding);
  return `${encodedBody}.${signature}`;
}

export function verifyToken(token: string): Record<string, string> {
  const [encodedBody, signature] = token.split('.');
  if (!encodedBody || !signature) throw new Error('Invalid token');

  const expectedSignature = createHmac('sha256', env.AUTH_SECRET)
    .update(encodedBody)
    .digest(tokenEncoding);
  const actual = Buffer.from(signature, tokenEncoding);
  const expected = Buffer.from(expectedSignature, tokenEncoding);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error('Invalid token');
  }

  const payload = JSON.parse(Buffer.from(encodedBody, tokenEncoding).toString()) as Record<string, string>;
  if (Number(payload.exp) < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  return payload;
}
