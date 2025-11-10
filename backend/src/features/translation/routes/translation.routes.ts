/**
 * 翻译路由
 */

import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import * as translationController from '../controllers/translation.controller';

const router = Router();

// 所有路由需要认证
router.use(requireAuth);

/**
 * POST /api/v1/translation/translate
 * 翻译文本
 */
router.post('/translate', translationController.translate);

/**
 * POST /api/v1/translation/batch
 * 批量翻译
 */
router.post('/batch', translationController.batchTranslate);

/**
 * POST /api/v1/translation/detect
 * 检测语言
 */
router.post('/detect', translationController.detectLanguage);

/**
 * GET /api/v1/translation/status
 * 获取翻译服务状态
 */
router.get('/status', translationController.getStatus);

export { router as translationRoutes };
