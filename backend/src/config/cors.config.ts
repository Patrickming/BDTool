/**
 * CORS 配置
 */

import { CorsOptions } from 'cors';
import { env } from './env.config';

// 解析允许的源列表
const getAllowedOrigins = (): string[] => {
  return env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // 允许没有 origin 的请求（例如移动应用或 Postman）
    if (!origin) {
      callback(null, true);
      return;
    }

    // 允许 Chrome 扩展（chrome-extension:// 开头的源）
    if (origin.startsWith('chrome-extension://')) {
      callback(null, true);
      return;
    }

    // 检查 origin 是否在允许列表中
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('CORS 策略不允许该源'));
    }
  },
  credentials: true, // 允许携带凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400, // 24 小时
};
