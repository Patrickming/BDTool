/**
 * Extension Token 控制器
 * 处理插件认证 Token 的生成、验证和管理
 */

import { Request, Response } from 'express';
import { prisma } from '@database/client';
import { logger } from '@config/logger.config';
import crypto from 'crypto';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

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
 * 激活 Token（复制后开始倒计时）
 * POST /api/v1/extension/token/activate
 * Body: { hours: number } - 可选，默认 2 小时，可选值：2, 8, 24 或自定义小时数
 */
export async function activateExtensionToken(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { hours = 2 } = req.body; // 默认 2 小时

    // 验证 hours 参数
    if (typeof hours !== 'number' || hours <= 0 || hours > 8760) {
      // 最大 365 天（8760 小时）
      return res.status(400).json({ message: '无效的小时数，必须在 1-8760 之间' });
    }

    const extensionToken = await prisma.extensionToken.findUnique({
      where: { userId },
    });

    if (!extensionToken) {
      return res.status(404).json({ message: '未找到 Token，请先生成' });
    }

    // 设置指定小时数后过期
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    const updated = await prisma.extensionToken.update({
      where: { userId },
      data: {
        expiresAt,
        isActive: true,
      },
    });

    logger.info(`用户 ${userId} 激活了 Extension Token，有效期 ${hours} 小时，至 ${expiresAt.toISOString()}`);

    return res.json({
      token: updated.token,
      expiresAt: updated.expiresAt,
      isActive: updated.isActive,
      hours, // 返回设置的小时数
    });
  } catch (error) {
    logger.error('激活 Extension Token 失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

/**
 * 下载插件包
 * GET /api/v1/extension/download
 */
export async function downloadExtension(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    logger.info(`用户 ${userId} 请求下载插件包`);

    // extension 文件夹的路径（从 backend 目录向上一级，然后进入 extension）
    const extensionPath = path.resolve(__dirname, '../../../..', 'extension');

    // 检查路径是否存在
    if (!fs.existsSync(extensionPath)) {
      logger.error(`插件目录不存在: ${extensionPath}`);
      return res.status(404).json({ message: '插件目录不存在' });
    }

    // 设置响应头
    const zipFileName = `kol-bd-tool-extension-${new Date().toISOString().split('T')[0]}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    // 创建 archiver 实例
    const archive = archiver('zip', {
      zlib: { level: 9 }, // 最高压缩级别
    });

    // 处理错误
    archive.on('error', (err) => {
      logger.error('压缩插件包失败:', err);
      res.status(500).json({ message: '压缩失败' });
    });

    // 监听压缩进度
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        logger.warn('压缩警告:', err);
      } else {
        logger.error('压缩错误:', err);
        throw err;
      }
    });

    // 将压缩流输出到响应
    archive.pipe(res);

    // 添加 extension 目录下的所有文件
    archive.directory(extensionPath, false);

    // 完成压缩
    await archive.finalize();

    logger.info(`用户 ${userId} 成功下载插件包`);
  } catch (error) {
    logger.error('下载插件包失败:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: '服务器错误' });
    }
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
