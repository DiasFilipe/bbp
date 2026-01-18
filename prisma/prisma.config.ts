import 'dotenv/config';
import type { PrismaConfig } from 'prisma';

export default {
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} seed.ts"
  },
  datasource: {
    url: process.env.DATABASE_URL!
  }
} satisfies PrismaConfig;
