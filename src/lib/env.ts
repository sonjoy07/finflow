import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('FinFlow'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_USE_MOCK_DATA: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  MOCK_DATA_SEED: z.string().default('42'),
  MOCK_API_DELAY_MS: z
    .string()
    .default('250')
    .transform((val) => parseInt(val, 10) || 0),
  AUTH_SECRET: z.string().min(16).default('portfolio-demo-session-secret-at-least-32-chars'),
  NEXT_PUBLIC_DEFAULT_ROLE: z
    .enum(['admin', 'operations_lead', 'analyst', 'auditor'])
    .default('admin'),
  NEXT_PUBLIC_ENABLE_WEB_VITALS: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  MOCK_DATA_SEED: process.env.MOCK_DATA_SEED,
  MOCK_API_DELAY_MS: process.env.MOCK_API_DELAY_MS,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_DEFAULT_ROLE: process.env.NEXT_PUBLIC_DEFAULT_ROLE,
  NEXT_PUBLIC_ENABLE_WEB_VITALS: process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS,
});
