import { z } from 'zod';

const configSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  HOST: z.string().default('0.0.0.0'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  
  // Security
  JWT_SECRET: z.string().default('your-secret-key'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default(100),
  RATE_LIMIT_TIME_WINDOW: z.string().transform(Number).default(60000),
  
  // AI Configuration
  AI_DEFAULT_MODEL: z.string().default('gpt-4'),
  AI_MAX_TOKENS: z.string().transform(Number).default(1000),
  AI_TEMPERATURE: z.string().transform(Number).default(0.1),
  AI_TIMEOUT: z.string().transform(Number).default(10000),
  
  // Cache Configuration
  CACHE_TTL: z.string().transform(Number).default(3600), // 1 hour
  CACHE_PREFIX: z.string().default('explain-error'),
  
  // Logging
  LOG_LEVEL: z.string().default('info'),
});

function loadConfig() {
  try {
    // Debug: Log environment variables
    console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
    console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
    
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    console.error('Available environment variables:', Object.keys(process.env));
    process.exit(1);
  }
}

export const config = loadConfig();

// Type-safe config export
export type Config = z.infer<typeof configSchema>;
