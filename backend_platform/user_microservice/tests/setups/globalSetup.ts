import { Pool } from 'pg';
import { env } from '../../src/environment.ts';

let pool: Pool;

export async function setup() {
  const databaseUrl = process.env.TEST_DATABASE_URL ?? env.DATABASE_URL;
  pool = new Pool({ connectionString: databaseUrl });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      p_level VARCHAR(50) NOT NULL DEFAULT '1',
      rank VARCHAR(50) NOT NULL DEFAULT 'unranked',
      bio TEXT NOT NULL,
      bg_class VARCHAR(250) NOT NULL,
      avatar_url TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_login TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NOT NULL DEFAULT NOW()
  `);
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
}

export async function teardown() {
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  await pool.end();
}
