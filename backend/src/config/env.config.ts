import { z } from 'zod';

const envVarsSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.string().default('3000'),
  JWT_ACCESS_TOKEN_SECRET: z.string().default('secret'),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().default('30m'),
  JWT_REFRESH_TOKEN_SECRET: z.string().default('secret'),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string().default('1d'),
  DATABASE_URL: z.string(),
});

const result = envVarsSchema.safeParse(process.env);
if (!result.success) throw new Error(result['error']);

export default {
  env: result.data.NODE_ENV,
  port: result.data.PORT,
  jwt: {
    accessSecret: result.data.JWT_ACCESS_TOKEN_SECRET,
    accessExpirationMinutes: result.data.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    refreshSecret: result.data.JWT_REFRESH_TOKEN_SECRET,
    refreshExpirationDays: result.data.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  },
  databaseUrl: result.data.DATABASE_URL,
};
