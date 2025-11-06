/**
 * 认证服务 - 业务逻辑层
 */

import { prisma } from '@database/client';
import { logger } from '@config/logger.config';
import { BadRequestError, UnauthorizedError } from '@common/errors/app-error';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { passwordService } from './password.service';
import { jwtService, JwtPayload } from './jwt.service';

/**
 * 认证响应接口
 */
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
  token: string;
}

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户注册
   * @param registerDto - 注册数据
   * @returns 用户信息和 JWT Token
   * @throws BadRequestError - 邮箱已存在
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, fullName } = registerDto;

    logger.info(`开始注册用户: ${email}`);

    // 1. 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn(`注册失败: 邮箱 ${email} 已存在`);
      throw new BadRequestError('该邮箱已被注册');
    }

    // 2. 加密密码
    const hashedPassword = await passwordService.hashPassword(password);

    // 3. 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        fullName,
        role: 'member', // 默认角色
        isActive: true,
      },
    });

    logger.info(`用户注册成功: ID=${user.id}, Email=${user.email}`);

    // 4. 生成 JWT Token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwtService.generateToken(payload);

    // 5. 返回用户信息（不包含密码）
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    };
  }

  /**
   * 用户登录
   * @param loginDto - 登录数据
   * @returns 用户信息和 JWT Token
   * @throws UnauthorizedError - 邮箱或密码错误
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    logger.info(`用户尝试登录: ${email}`);

    // 1. 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn(`登录失败: 用户 ${email} 不存在`);
      throw new UnauthorizedError('邮箱或密码错误');
    }

    // 2. 检查账户是否激活
    if (!user.isActive) {
      logger.warn(`登录失败: 用户 ${email} 账户已被禁用`);
      throw new UnauthorizedError('账户已被禁用，请联系管理员');
    }

    // 3. 验证密码
    const isPasswordValid = await passwordService.verifyPassword(password, user.hashedPassword);

    if (!isPasswordValid) {
      logger.warn(`登录失败: 用户 ${email} 密码错误`);
      throw new UnauthorizedError('邮箱或密码错误');
    }

    logger.info(`用户登录成功: ID=${user.id}, Email=${user.email}`);

    // 4. 生成 JWT Token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwtService.generateToken(payload);

    // 5. 返回用户信息（不包含密码）
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    };
  }

  /**
   * 获取当前用户信息
   * @param userId - 用户 ID
   * @returns 用户信息
   * @throws UnauthorizedError - 用户不存在
   */
  async getCurrentUser(userId: number) {
    logger.debug(`获取用户信息: ID=${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn(`用户不存在: ID=${userId}`);
      throw new UnauthorizedError('用户不存在');
    }

    if (!user.isActive) {
      logger.warn(`用户账户已被禁用: ID=${userId}`);
      throw new UnauthorizedError('账户已被禁用');
    }

    return user;
  }
}

// 导出单例
export const authService = new AuthService();
