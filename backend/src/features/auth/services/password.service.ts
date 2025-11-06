/**
 * 密码加密服务
 */

import bcrypt from 'bcryptjs';
import { logger } from '@config/logger.config';

/**
 * 加密轮数（越高越安全，但速度越慢）
 */
const SALT_ROUNDS = 10;

/**
 * 密码服务类
 */
export class PasswordService {
  /**
   * 加密密码
   * @param plainPassword - 明文密码
   * @returns 加密后的密码哈希值
   */
  async hashPassword(plainPassword: string): Promise<string> {
    try {
      logger.debug('开始加密密码');
      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      logger.debug('密码加密成功');
      return hashedPassword;
    } catch (error) {
      logger.error('密码加密失败:', error);
      throw new Error('密码加密失败');
    }
  }

  /**
   * 验证密码
   * @param plainPassword - 明文密码
   * @param hashedPassword - 加密后的密码哈希值
   * @returns 密码是否匹配
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      logger.debug('开始验证密码');
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      logger.debug(`密码验证结果: ${isMatch ? '匹配' : '不匹配'}`);
      return isMatch;
    } catch (error) {
      logger.error('密码验证失败:', error);
      throw new Error('密码验证失败');
    }
  }
}

// 导出单例
export const passwordService = new PasswordService();
