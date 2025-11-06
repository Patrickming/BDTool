/**
 * 全局错误处理中间件
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '@common/errors/app-error';
import { logger } from '@config/logger.config';
import { isProd } from '@config/env.config';
import { errorResponse } from '@common/utils/api-response';

/**
 * 全局错误处理器
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // 记录错误
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // 应用错误
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, (err as any).errors);
  }

  // Zod 验证错误
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return errorResponse(res, '数据验证失败', 422, formattedErrors);
  }

  // Prisma 错误
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Token 无效', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token 已过期', 401);
  }

  // 未知错误 - 隐藏详细信息（生产环境）
  const message = isProd() ? '服务器内部错误' : err.message;
  return errorResponse(res, message, 500);
};

/**
 * 处理 Prisma 错误
 */
const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError, res: Response) => {
  switch (err.code) {
    case 'P2002':
      // 唯一约束冲突
      const field = (err.meta?.target as string[])?.join(', ') || '字段';
      return errorResponse(res, `${field} 已存在`, 409);

    case 'P2025':
      // 记录不存在
      return errorResponse(res, '请求的资源不存在', 404);

    case 'P2003':
      // 外键约束失败
      return errorResponse(res, '关联的资源不存在', 400);

    case 'P2014':
      // 关系违规
      return errorResponse(res, '操作违反了数据关系约束', 400);

    default:
      return errorResponse(res, '数据库操作失败', 500);
  }
};

/**
 * 404 错误处理器
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return errorResponse(res, `路由 ${req.originalUrl} 不存在`, 404);
};
