/**
 * JWT Token 服务
 */

import jwt from 'jsonwebtoken';
import { env } from '@config/env.config';
import { logger } from '@config/logger.config';
import { UnauthorizedError } from '@common/errors/app-error';

/**
 * JWT Payload 接口
 */
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * JWT 服务类
 */
export class JwtService {
  /**
   * 生成 JWT Token
   * @param payload - Token 载荷（用户信息）
   * @returns JWT Token 字符串
   */
  generateToken(payload: JwtPayload): string {
    try {
      logger.debug(`为用户 ${payload.userId} 生成 JWT Token`);

      const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
        issuer: 'kol-bd-tool',
        audience: 'kol-bd-tool-users',
      });

      logger.debug('JWT Token 生成成功');
      return token;
    } catch (error) {
      logger.error('JWT Token 生成失败:', error);
      throw new Error('Token 生成失败');
    }
  }

  /**
   * 验证 JWT Token
   * @param token - JWT Token 字符串
   * @returns 解析后的 Payload
   * @throws UnauthorizedError - Token 无效或过期
   */
  verifyToken(token: string): JwtPayload {
    try {
      logger.debug('开始验证 JWT Token');

      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'kol-bd-tool',
        audience: 'kol-bd-tool-users',
      }) as JwtPayload;

      logger.debug(`JWT Token 验证成功，用户 ID: ${decoded.userId}`);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('JWT Token 已过期');
        throw new UnauthorizedError('Token 已过期，请重新登录');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('JWT Token 无效');
        throw new UnauthorizedError('Token 无效，请重新登录');
      }

      logger.error('JWT Token 验证失败:', error);
      throw new UnauthorizedError('Token 验证失败');
    }
  }

  /**
   * 从 Authorization Header 中提取 Token
   * @param authorizationHeader - Authorization Header 值
   * @returns JWT Token 字符串
   * @throws UnauthorizedError - Header 格式不正确
   */
  extractTokenFromHeader(authorizationHeader: string | undefined): string {
    if (!authorizationHeader) {
      throw new UnauthorizedError('缺少 Authorization Header');
    }

    const parts = authorizationHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Authorization Header 格式不正确，应为: Bearer <token>');
    }

    return parts[1];
  }
}

// 导出单例
export const jwtService = new JwtService();
