import { config } from 'dotenv';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const environment = process.env.NODE_ENV ?? 'development';
const environmentPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  `config/.env.${environment}`,
);
const loaded = config({ path: environmentPath, override: false });
if (environment === 'test' && loaded.error) {
  config({
    path: resolve(dirname(fileURLToPath(import.meta.url)), 'config/.env.development'),
    override: false,
  });
}
if (loaded.error) {
  if (!process.env.DATABASE_URL) {
    throw new Error(`Unable to load ${environmentPath}: ${loaded.error.message}`);
  }
}

// environment viriable schema
const envSchema = z.object({
  SERVER_PORT: z.coerce.number(),
  DATABASE_URL: z.string().refine((url) => url.startsWith('postgres://') || url.startsWith('postgresql://'),
        { message: 'DATABASE_URL must be a valid PostgreSQL connection string' }),
  AUTH_SECRET: z.string().min(32),
  CLOUDINARY_URL: environment === 'test'
    ? z.string().refine((url) => url.startsWith('cloudinary://'), { message: 'Invalid cloudinary URL' }).optional()
    : z.string().refine((url) => url.startsWith('cloudinary://'), { message: 'Invalid cloudinary URL' }),
});

// export envschema type
export type Env = z.infer<typeof envSchema>;

const results = envSchema.safeParse(process.env);
if (!results.success) {
  throw new Error(
    `Invalid environment configuration: ${results.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')}`,
  );
}

// export env
export const env = results.data;
export default results.data;
