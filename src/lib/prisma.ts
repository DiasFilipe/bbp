// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env, requireEnv } from './env'; // Validate environment variables

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const connectionString = env.DATABASE_URL ?? requireEnv('DATABASE_URL');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
    adapter: adapter,
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
