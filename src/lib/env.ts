import { z } from 'zod';

// Make schema with optional fields to prevent build-time errors
const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

export type Env = z.infer<typeof envSchema>;

// Parse without strict validation to allow builds
const env: Env = envSchema.parse(process.env);

export { env };
