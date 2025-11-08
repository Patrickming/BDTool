/**
 * Extension Token 控制器
 * 处理插件认证 Token 的生成、验证和管理
 */

import { Request, Response } from 'express';
import { prisma } from '../database/client';
import { logger } from '../config/logger.config';
import crypto from 'crypto';

/**
 * 生成随机 Token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 获取当前用户的 Extension Token
 * GET /api/v1/extension/token
 */
export async function getExtensionToken(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const extensionToken = await prisma.extensionToken.findUnique({
      where: { userId },
    });

    if (!extensionToken) {
      return res.status(404).json({ message: '未找到 Token，请先生成' });
    }

    // 检查是否过期
    if (extensionToken.expiresAt && extensionToken.expiresAt < new Date()) {
      // Token 已过期，返回但标记为过期
      return res.json({
        token: extensionToken.token,
        expiresAt: extensionToken.expiresAt,
        isExpired: true,
      });
    }

    return res.json({
      token: extensionToken.token,
      expiresAt: extensionToken.expiresAt,
      isActive: extensionToken.isActive,
      isExpired: false,
    });
  } catch (error) {
    logger.error('获取 Extension Token 失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

/**
 * 生成新的 Extension Token
 * POST /api/v1/extension/token/generate
 */
export async function generateExtensionToken(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    // 生成新 Token
    const newToken = generateToken();

    // 如果已存在，则更新；否则创建
    const extensionToken = await prisma.extensionToken.upsert({
      where: { userId },
      update: {
        token: newToken,
        expiresAt: null, // 重置过期时间
        isActive: false, // 重置激活状态
      },
      create: {
        userId,
        token: newToken,
        isActive: false,
      },
    });

    logger.info(`用户 ${userId} 生成了新的 Extension Token`);

    return res.json({
      token: extensionToken.token,
      expiresAt: extensionToken.expiresAt,
      isActive: extensionToken.isActive,
    });
  } catch (error) {
    logger.error('生成 Extension Token 失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

/**
 * 激活 Token（复制后开始 2 小时倒计时）
 * POST /api/v1/extension/token/activate
 */
export async function activateExtensionToken(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const extensionToken = await prisma.extensionToken.findUnique({
      where: { userId },
    });

    if (!extensionToken) {
      return res.status(404).json({ message: '未找到 Token，请先生成' });
    }

    // 设置 2 小时后过期
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const updated = await prisma.extensionToken.update({
      where: { userId },
      data: {
        expiresAt,
        isActive: true,
      },
    });

    logger.info(`用户 ${userId} 激活了 Extension Token，有效期至 ${expiresAt.toISOString()}`);

    return res.json({
      token: updated.token,
      expiresAt: updated.expiresAt,
      isActive: updated.isActive,
    });
  } catch (error) {
    logger.error('激活 Extension Token 失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

/**
 * 验证 Extension Token（用于插件请求）
 * 这是一个中间件函数，用于验证来自插件的请求
 */
export async function verifyExtensionToken(token: string): Promise<number | null> {
  try {
    const extensionToken = await prisma.extensionToken.findUnique({
      where: { token },
    });

    if (!extensionToken) {
      return null;
    }

    // 检查是否已激活
    if (!extensionToken.isActive) {
      return null;
    }

    // 检查是否过期
    if (extensionToken.expiresAt && extensionToken.expiresAt < new Date()) {
      // Token 过期，自动失效
      await prisma.extensionToken.update({
        where: { id: extensionToken.id },
        data: { isActive: false },
      });
      return null;
    }

    return extensionToken.userId;
  } catch (error) {
    logger.error('验证 Extension Token 失败:', error);
    return null;
  }
}
