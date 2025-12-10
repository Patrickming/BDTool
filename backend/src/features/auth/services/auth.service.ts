/**
 * 认证服务 - 业务逻辑层
 */

import { prisma } from '@database/client';
import { logger } from '@config/logger.config';
import { BadRequestError, UnauthorizedError } from '@common/errors/app-error';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { passwordService } from './password.service';
import { jwtService, JwtPayload } from './jwt.service';
import fs from 'fs/promises';
import path from 'path';

/**
 * 认证响应接口
 */
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    company?: string | null;
    avatar?: string | null;
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
        company: user.company,
        avatar: user.avatar,
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
        company: user.company,
        avatar: user.avatar,
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
        company: true,
        avatar: true,
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

  /**
   * 更新用户资料
   * @param userId - 用户 ID
   * @param updateData - 更新数据
   * @returns 更新后的用户信息
   */
  async updateProfile(userId: number, updateData: UpdateProfileDto) {
    logger.info(`更新用户资料: ID=${userId}`);

    // 如果要更新邮箱，检查邮箱是否已被其他用户使用
    if (updateData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        logger.warn(`更新失败: 邮箱 ${updateData.email} 已被使用`);
        throw new BadRequestError('该邮箱已被其他用户使用');
      }
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.fullName && { fullName: updateData.fullName }),
        ...(updateData.email && { email: updateData.email }),
        ...(updateData.company !== undefined && { company: updateData.company }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        company: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`用户资料更新成功: ID=${userId}`);
    return user;
  }

  /**
   * 上传用户头像
   * @param userId - 用户 ID
   * @param filename - 文件名
   * @returns 更新后的用户信息
   */
  async uploadAvatar(userId: number, filename: string) {
    logger.info(`上传用户头像: ID=${userId}, File=${filename}`);

    // 获取用户当前头像
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // 删除旧头像文件（如果存在）
    if (user?.avatar) {
      const oldAvatarPath = path.join(process.cwd(), 'uploads', 'avatars', user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
        logger.debug(`删除旧头像: ${oldAvatarPath}`);
      } catch (error) {
        logger.warn(`删除旧头像失败（文件可能不存在）: ${oldAvatarPath}`);
      }
    }

    // 更新数据库中的头像字段
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: filename },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        company: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`用户头像更新成功: ID=${userId}`);
    return updatedUser;
  }

  /**
   * 修改密码
   * @param userId - 用户 ID
   * @param changePasswordData - 修改密码数据
   */
  async changePassword(userId: number, changePasswordData: ChangePasswordDto) {
    logger.info(`修改密码: ID=${userId}`);

    // 获取用户当前密码
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hashedPassword: true },
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    // 验证当前密码
    const isPasswordValid = await passwordService.verifyPassword(
      changePasswordData.currentPassword,
      user.hashedPassword
    );

    if (!isPasswordValid) {
      logger.warn(`修改密码失败: 当前密码错误 ID=${userId}`);
      throw new BadRequestError('当前密码错误');
    }

    // 加密新密码
    const newHashedPassword = await passwordService.hashPassword(changePasswordData.newPassword);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword: newHashedPassword },
    });

    logger.info(`密码修改成功: ID=${userId}`);
  }
}

// 导出单例
export const authService = new AuthService();
