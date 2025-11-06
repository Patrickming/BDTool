/**
 * Prisma 数据库客户端
 */

import { PrismaClient } from '@prisma/client';
import { isDev } from '@config/env.config';
import { logger } from '@config/logger.config';

// 创建 Prisma 客户端实例
export const prisma = new PrismaClient({
  log: isDev()
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ]
    : [{ emit: 'event', level: 'error' }],
});

// 日志处理
if (isDev()) {
  prisma.$on('query', (e) => {
    logger.debug({
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

prisma.$on('error', (e) => {
  logger.error({ message: e.message, target: e.target }, 'Prisma error');
});

prisma.$on('warn', (e) => {
  logger.warn({ message: e.message, target: e.target }, 'Prisma warning');
});

// 优雅关闭
process.on('beforeExit', async () => {
  logger.info('正在关闭数据库连接...');
  await prisma.$disconnect();
});

// 错误处理
process.on('SIGINT', async () => {
  logger.info('收到 SIGINT 信号，正在关闭数据库连接...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('收到 SIGTERM 信号，正在关闭数据库连接...');
  await prisma.$disconnect();
  process.exit(0);
});
