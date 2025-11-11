/**
 * Extension Token 路由
 */

import { Router } from 'express';
import {
  getExtensionToken,
  generateExtensionToken,
  activateExtensionToken,
  downloadExtension,
} from '../controllers/extension.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要 JWT 认证
router.use(requireAuth);

/**
 * GET /api/v1/extension/token
 * 获取当前用户的 Extension Token
 */
router.get('/token', getExtensionToken);

/**
 * POST /api/v1/extension/token/generate
 * 生成新的 Extension Token
 */
router.post('/token/generate', generateExtensionToken);

/**
 * POST /api/v1/extension/token/activate
 * 激活 Token（复制后开始倒计时）
 */
router.post('/token/activate', activateExtensionToken);

/**
 * GET /api/v1/extension/download
 * 下载插件包（压缩为 zip）
 */
router.get('/download', downloadExtension);

export default router;
