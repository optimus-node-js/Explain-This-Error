import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './lib/config.js';
import logger from './lib/logger.js';
import explainRoutes from './routes/explain.js';

// Import database and redis to initialize connections
import './lib/database.js';
import './lib/redis.js';

const fastify = Fastify({
  logger: logger,
  trustProxy: true,
});

// Register plugins
await fastify.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true,
});

await fastify.register(rateLimit, {
  max: config.RATE_LIMIT_MAX,
  timeWindow: config.RATE_LIMIT_TIME_WINDOW,
  errorResponseBuilder: (request, context) => {
    return {
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${context.max} requests per ${context.after}ms`,
      retryAfter: Math.round(Number(context.after) / 1000),
    };
  },
});

// Register routes
await fastify.register(explainRoutes, { prefix: '/api/v1' });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.NODE_ENV,
  };
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: 'Explain This Error API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    health: '/health',
  };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  logger.error({ error, request: request.url }, 'Unhandled error');
  
  reply.status(500).send({
    success: false,
    error: 'Internal server error',
    message: config.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    success: false,
    error: 'Not found',
    message: `Route ${request.method}:${request.url} not found`,
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  try {
    await fastify.close();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: config.PORT,
      host: config.HOST,
    });
    
    logger.info({
      port: config.PORT,
      host: config.HOST,
      environment: config.NODE_ENV,
    }, 'Server started successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

start();
