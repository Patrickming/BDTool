/**
 * 服务器入口
 */

import { createApp } from './app';
import { env } from '@config/env.config';
import { logger } from '@config/logger.config';
import { prisma } from '@database/client';

// 创建应用
const app = createApp();

// 启动服务器
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 服务器运行在 http://localhost:${env.PORT}`);
  logger.info(`📚 环境: ${env.NODE_ENV}`);
  logger.info(`🏥 健康检查: http://localhost:${env.PORT}/health`);
});

// 优雅关闭
const gracefulShutdown = async (signal: string) => {
  logger.info(`收到 ${signal} 信号，正在优雅关闭...`);

  server.close(async () => {
    logger.info('HTTP 服务器已关闭');

    try {
      await prisma.$disconnect();
      logger.info('数据库连接已关闭');
      process.exit(0);
    } catch (error) {
      logger.error('关闭数据库连接时出错:', error);
      process.exit(1);
    }
  });

  // 强制关闭超时
  setTimeout(() => {
    logger.error('强制关闭超时，进程终止');
    process.exit(1);
  }, 10000);
};

// 监听关闭信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise rejection:', { reason, promise });
  gracefulShutdown('unhandledRejection');
});
