/**
 * 认证路由
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { uploadAvatar } from '@common/utils/file-upload';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();

/**
 * POST /api/v1/auth/register
 * 用户注册
 */
router.post('/register', authController.register);

/**
 * POST /api/v1/auth/login
 * 用户登录
 */
router.post('/login', authController.login);

/**
 * GET /api/v1/auth/me
 * 获取当前用户信息（需要认证）
 */
router.get('/me', requireAuth, authController.getCurrentUser);

/**
 * PUT /api/v1/auth/profile
 * 更新用户资料（需要认证）
 */
router.put('/profile', requireAuth, authController.updateProfile);

/**
 * POST /api/v1/auth/avatar
 * 上传用户头像（需要认证）
 */
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), authController.uploadAvatar);

/**
 * PUT /api/v1/auth/password
 * 修改密码（需要认证）
 */
router.put('/password', requireAuth, authController.changePassword);

export default router;
