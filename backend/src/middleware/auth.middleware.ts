/**
 * 认证和授权中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

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
 * 验证 JWT Token 的中间件
 * 从请求头中提取 token，验证并将用户信息附加到 request 对象
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从 Authorization header 中获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未提供认证令牌' });
      return;
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证 token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET 未配置');
    }

    const decoded = jwt.verify(token, secret) as {
      userId: number;
      email: string;
      role: UserRole;
    };

    // 将用户信息附加到 request 对象
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
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
