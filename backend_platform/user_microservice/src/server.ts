import { app } from './app.ts'
import { env } from './environment.ts';
import { migrateDatabase } from '#db/migrate';

try {
  await migrateDatabase();
  app.listen(env.SERVER_PORT, () => {
    console.log(`Server Listenning on Port: ${env.SERVER_PORT}`);
  });
} catch (error) {
  console.error('Failed to apply user database migrations', error);
  process.exitCode = 1;
}
