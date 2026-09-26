import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '#utils/crypto';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  pLevel: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export function authorize(request: Request, response: Response, next: NextFunction): void {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Bearer token is required' });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    if (!payload.sub || !payload.email || !payload.username || !payload.pLevel) {
      throw new Error('Invalid token claims');
    }
    request.authUser = {
      id: Number(payload.sub),
      email: payload.email,
      username: payload.username,
      pLevel: payload.pLevel,
    };
    next();
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireLevel(minimumLevel: number) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const currentLevel = Number(request.authUser?.pLevel);
    if (!Number.isFinite(currentLevel) || currentLevel < minimumLevel) {
      response.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
