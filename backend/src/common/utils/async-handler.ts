/**
 * 异步错误处理器
 * 自动捕获异步函数中的错误并传递给 Express 错误处理中间件
 */

import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * 包装异步路由处理器
 * 自动捕获 Promise rejection 并传递给 next()
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
