import { z } from 'zod';

// Skip validation during Next.js build phase
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                     process.env.NEXT_PHASE === 'phase-export';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória').optional(),
  NEXTAUTH_SECRET: isBuildTime
    ? z.string().optional()
    : z.string().min(32, 'NEXTAUTH_SECRET deve ter pelo menos 32 caracteres'),
  NEXTAUTH_URL: isBuildTime
    ? z.string().optional()
    : z.string().url('NEXTAUTH_URL deve ser uma URL válida'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Erro de validação das variáveis de ambiente:');
    error.issues.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\n💡 Por favor, verifique seu arquivo .env');
    process.exit(1);
  }
  throw error;
}

export { env };
