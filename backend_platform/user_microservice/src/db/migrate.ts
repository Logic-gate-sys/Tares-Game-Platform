import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { resolve } from 'node:path';
import { db } from '#config/database';

export async function migrateDatabase(): Promise<void> {
  await migrate(db, {
    migrationsFolder: resolve(process.cwd(), 'drizzle'),
  });
}


await migrateDatabase();
