import { createToken } from '../../src/utils/crypto.ts';
import { hashPassword } from '../../src/utils/crypto.ts';
import { pool } from '../../src/config/database.ts';

const defaultPassword = 'Password123!';

export interface TestUser {
  id: number;
  email: string;
  username: string;
  rawPassword: string;
  token: string;
}

export async function createTestUser(
  overrides: Partial<{ email: string; username: string; password: string; totalScore: number }> = {},
): Promise<TestUser> {
  const rawPassword = overrides.password ?? defaultPassword;
  const email = overrides.email ?? `user-${Date.now()}-${Math.random()}@test.com`;
  const username = overrides.username ?? `user-${Date.now()}-${Math.random()}`;
  const result = await pool.query<{
    id: number;
    email: string;
    username: string;
    p_level: string;
  }>(
    `INSERT INTO users
      (email, username, password, p_level, rank, bio, total_score, avatar_url, bg_class)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, email, username, p_level`,
    [
      email,
      username,
      hashPassword(rawPassword),
      '1',
      'unranked',
      'Test user',
      overrides.totalScore ?? 0,
      'https://res.cloudinary.com/test/avatar.jpg',
      'default',
    ],
  );
  const user = result.rows[0]!;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    rawPassword,
    token: createToken({
      sub: String(user.id),
      email: user.email,
      username: user.username,
      pLevel: user.p_level,
    }, 60 * 60),
  };
}
