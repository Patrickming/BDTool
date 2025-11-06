/**
 * 认证控制器 - HTTP 请求处理层
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@common/utils/async-handler';
import { successResponse } from '@common/utils/api-response';
import { ValidationError } from '@common/errors/app-error';
import { registerSchema } from '../dto/register.dto';
import { loginSchema } from '../dto/login.dto';
import { authService } from '../services/auth.service';
import { logger } from '@config/logger.config';

/**
 * 认证控制器类
 */
export class AuthController {
  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    logger.info('收到注册请求');

    // 1. 验证请求数据
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('注册数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层注册用户
    const result = await authService.register(validationResult.data);

    // 3. 返回成功响应
    return successResponse(res, result, '注册成功', 201);
  });

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    logger.info('收到登录请求');

    // 1. 验证请求数据
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('登录数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层登录
    const result = await authService.login(validationResult.data);

    // 3. 返回成功响应
    return successResponse(res, result, '登录成功');
  });

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   * 需要认证
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    // 注意: userId 会在认证中间件中设置到 req.user
    // 这里暂时使用 any 类型，后续会创建类型定义
    const userId = (req as any).user?.userId;

    if (!userId) {
      logger.error('获取当前用户信息失败: userId 未找到');
      throw new Error('用户信息不存在');
    }

    logger.info(`获取用户信息: userId=${userId}`);

    // 调用服务层获取用户信息
    const user = await authService.getCurrentUser(userId);

    // 返回成功响应
    return successResponse(res, user, '获取用户信息成功');
  });
}

// 导出单例
export const authController = new AuthController();
