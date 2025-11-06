/**
 * 日志配置
 * 使用 Pino 进行高性能日志记录
 */

import pino from 'pino';
import { env, isDev } from './env.config';

// 创建 logger 实例
export const logger = pino({
  level: env.LOG_LEVEL,
  // 开发环境使用 pretty 格式，生产环境使用 JSON 格式
  transport: isDev()
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // 生产环境添加时间戳
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

// 导出子 logger 创建函数
export const createChildLogger = (context: string) => {
  return logger.child({ context });
};

// 导出日志级别类型
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
