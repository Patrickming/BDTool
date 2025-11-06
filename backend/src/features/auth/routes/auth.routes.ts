/**
 * 认证路由
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

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
 * 注意: 认证中间件将在后续任务中添加
 */
// router.get('/me', authMiddleware, authController.getCurrentUser);
router.get('/me', authController.getCurrentUser); // 暂时不需要认证中间件

export default router;
