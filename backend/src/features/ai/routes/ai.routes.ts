/**
 * AI 功能路由
 * 定义所有 AI 相关的 API 端点
 */

import { Router } from 'express';
import { rewriteController } from '../controllers/rewrite.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

// 所有 AI 路由都需要身份验证
router.use(requireAuth);

/**
 * POST /api/v1/ai/rewrite
 * 改写单个文本
 */
router.post('/rewrite', (req, res) => rewriteController.rewriteText(req, res));

/**
 * POST /api/v1/ai/rewrite/batch
 * 批量改写多个文本
 */
router.post('/rewrite/batch', (req, res) => rewriteController.batchRewrite(req, res));

/**
 * POST /api/v1/ai/rewrite/template
 * 改写模板（带 KOL 上下文）
 */
router.post('/rewrite/template', (req, res) => rewriteController.rewriteTemplate(req, res));

/**
 * GET /api/v1/ai/health
 * GLM 服务健康检查
 */
router.get('/health', (req, res) => rewriteController.healthCheck(req, res));

export default router;
