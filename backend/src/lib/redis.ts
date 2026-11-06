import { createClient } from 'redis';
import { config } from './config.js';
import logger from './logger.js';

const redis = createClient({
  url: config.REDIS_URL,
});

redis.on('error', (err) => {
  logger.error({ error: err }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('end', () => {
  logger.info('Redis connection ended');
});

// Connect to Redis
await redis.connect();

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
});

export default redis;
