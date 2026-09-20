import { beforeEach } from 'vitest';
import { pool } from '../../src/config/database.ts';

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
});
