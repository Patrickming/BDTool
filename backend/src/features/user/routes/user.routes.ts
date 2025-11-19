/**
 * 用户管理路由
 */

import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { requireAuth, requireAdmin, requireOwnerOrAdmin } from '@middleware/auth.middleware';

const router = Router();

// 所有用户管理路由都需要认证
router.use(requireAuth);

/**
 * GET /api/users
 * 获取所有用户列表（仅管理员）
 */
router.get('/', requireAdmin, getAllUsers);

/**
 * GET /api/users/:id
 * 获取单个用户信息（管理员或用户本人）
 */
router.get('/:id', requireOwnerOrAdmin, getUserById);

/**
 * PUT /api/users/:id
 * 更新用户信息（管理员或用户本人）
 */
router.put('/:id', requireOwnerOrAdmin, updateUser);

/**
 * DELETE /api/users/:id
 * 删除用户（仅管理员）
 */
router.delete('/:id', requireAdmin, deleteUser);

export default router;
