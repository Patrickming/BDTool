/**
 * 分析统计路由
 */

import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

// 所有分析统计路由都需要认证
router.use(requireAuth);

/**
 * GET /api/v1/analytics/overview
 * 获取概览统计
 */
router.get('/overview', analyticsController.getOverviewStats);

/**
 * GET /api/v1/analytics/distributions
 * 获取 KOL 分布数据
 */
router.get('/distributions', analyticsController.getKOLDistributions);

/**
 * GET /api/v1/analytics/templates
 * 获取模板效果统计
 */
router.get('/templates', analyticsController.getTemplateEffectiveness);

/**
 * GET /api/v1/analytics/timeline?days=30
 * 获取联系时间线
 */
router.get('/timeline', analyticsController.getContactTimeline);

export default router;
