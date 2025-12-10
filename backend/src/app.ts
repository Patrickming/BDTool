/**
 * Express 应用配置
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { corsOptions } from '@config/cors.config';
import { requestLogger } from '@common/middleware/request-logger.middleware';
import { errorHandler, notFoundHandler } from '@common/middleware/error-handler.middleware';
import { logger } from '@config/logger.config';
import routes from './routes';

export const createApp = (): Application => {
  const app = express();

  // 安全中间件 - 自定义配置以允许跨域图片加载
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'http://localhost:3000', 'http://localhost:5173'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          scriptSrc: ["'self'"],
        },
      },
    })
  );

  // CORS
  app.use(cors(corsOptions));

  // 解析中间件
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 请求日志
  app.use(requestLogger);

  // 静态文件服务 - 上传文件
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API 路由
  app.use('/api/v1', routes);

  // 404 处理
  app.use(notFoundHandler);

  // 错误处理
  app.use(errorHandler);

  logger.info('Express 应用初始化完成');

  return app;
};
