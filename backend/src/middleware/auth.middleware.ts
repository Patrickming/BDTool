/**
 * 认证和授权中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { verifyExtensionToken } from '@features/extension/controllers/extension.controller';

// 扩展 Express Request 类型，添加 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * 验证 JWT Token 或 Extension Token 的中间件
 * 优先检查 JWT，如果失败则尝试 Extension Token
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. 尝试 JWT 认证
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET 未配置');
        }

        const decoded = jwt.verify(token, secret) as {
          userId: number;
          email: string;
          role: UserRole;
        };

        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };

        return next();
      } catch (error) {
        // JWT 验证失败，继续尝试 Extension Token
      }
    }

    // 2. 尝试 Extension Token 认证
    const extensionToken = req.headers['x-extension-token'] as string;
    if (extensionToken) {
      const userId = await verifyExtensionToken(extensionToken);
      if (userId) {
        req.user = {
          id: userId,
          email: '',
          role: 'member' as UserRole,
        };
        return next();
      }
    }

    // 3. 两种认证方式都失败
    res.status(401).json({ error: '未提供认证令牌' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: '无效的认证令牌' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: '认证令牌已过期' });
    } else {
      res.status(500).json({ error: '服务器错误' });
    }
  }
};

/**
 * 验证用户是否为管理员的中间件
 * 必须在 requireAuth 之后使用
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: '未认证' });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ error: '需要管理员权限' });
    return;
  }

  next();
};

/**
 * 验证用户是否可以访问指定用户的资源
 * 管理员可以访问所有用户的资源，普通用户只能访问自己的资源
 */
export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: '未认证' });
    return;
  }

  const targetUserId = parseInt(req.params.id);

  if (isNaN(targetUserId)) {
    res.status(400).json({ error: '无效的用户 ID' });
    return;
  }

  // 管理员可以访问所有资源
  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  // 普通用户只能访问自己的资源
  if (req.user.id !== targetUserId) {
    res.status(403).json({ error: '没有权限访问此资源' });
    return;
  }

  next();
};
