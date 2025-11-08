/**
 * 插件认证中间件
 * 支持两种认证方式：
 * 1. JWT Token (Authorization: Bearer <jwt>)
 * 2. Extension Token (X-Extension-Token: <token>)
 */

import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../features/auth/services/auth.service';
import { verifyExtensionToken } from '../controllers/extension.controller';
import { logger } from '../config/logger.config';

/**
 * 双重认证中间件
 * 优先检查 JWT，如果不存在则检查 Extension Token
 */
export async function authenticateExtensionOrJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. 尝试 JWT 认证
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyJWT(token);
        req.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        };
        return next();
      } catch (error) {
        // JWT 无效，继续尝试 Extension Token
      }
    }

    // 2. 尝试 Extension Token 认证
    const extensionToken = req.headers['x-extension-token'] as string;
    if (extensionToken) {
      const userId = await verifyExtensionToken(extensionToken);
      if (userId) {
        // Extension Token 有效
        req.user = {
          id: userId,
          email: '', // Extension Token 不包含 email
          role: 'member', // 插件用户默认为 member
        };
        logger.info(`Extension Token 认证成功: userId=${userId}`);
        return next();
      } else {
        return res.status(401).json({
          message: 'Extension Token 无效或已过期，请重新生成',
        });
      }
    }

    // 3. 两种认证方式都失败
    return res.status(401).json({
      message: '未提供认证令牌',
    });
  } catch (error) {
    logger.error('认证失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}
