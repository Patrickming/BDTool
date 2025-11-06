/**
 * 环境变量配置
 * 使用 Zod 进行类型安全的环境变量验证
 */

import { z } from 'zod';
import 'dotenv/config';

// 定义环境变量 schema
const envSchema = z.object({
  // 应用配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3000'),

  // 数据库配置
  DATABASE_URL: z.string().min(1, '数据库 URL 不能为空'),

  // JWT 配置
  JWT_SECRET: z.string().min(32, 'JWT 密钥至少需要 32 个字符'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS 配置
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // AI API 配置（可选）
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // 日志配置
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // 限流配置
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('100'),
});

// 验证环境变量
export const env = envSchema.parse(process.env);

// 导出类型
export type Env = z.infer<typeof envSchema>;

// 辅助函数：检查是否为生产环境
export const isProd = () => env.NODE_ENV === 'production';

// 辅助函数：检查是否为开发环境
export const isDev = () => env.NODE_ENV === 'development';

// 辅助函数：检查是否为测试环境
export const isTest = () => env.NODE_ENV === 'test';
