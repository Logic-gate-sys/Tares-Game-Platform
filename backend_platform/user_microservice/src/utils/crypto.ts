import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../environment.ts';

const passwordRounds = 12;

export interface TokenClaims extends JwtPayload {
  sub: string;
  email?: string;
  username?: string;
  pLevel?: string;
  purpose?: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, passwordRounds);
}

export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return bcrypt.compare(password, storedHash);
}

export function createToken(
  payload: Record<string, string>,
  expiresInSeconds: number,
): string {
  return jwt.sign(payload, env.AUTH_SECRET, {
    expiresIn: expiresInSeconds,
  });
}

export function verifyToken(token: string): TokenClaims {
  const payload = jwt.verify(token, env.AUTH_SECRET);
  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new Error('Invalid token claims');
  }
  return payload as TokenClaims;
}
