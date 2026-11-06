import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  // prisma.$on('query' as any, (e: any) => {
  //   logger.debug({
  //     query: e.query,
  //     params: e.params,
  //     duration: `${e.duration}ms`,
  //   }, 'Database query');
  // });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
