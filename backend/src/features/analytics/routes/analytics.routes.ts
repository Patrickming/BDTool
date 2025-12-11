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

/**
 * GET /api/v1/analytics/responded-kols?days=7
 * 获取响应的 KOL 列表
 */
router.get('/responded-kols', analyticsController.getRespondedKols);

/**
 * GET /api/v1/analytics/new-kols?days=7
 * 获取新增的 KOL 列表
 */
router.get('/new-kols', analyticsController.getNewKols);

/**
 * GET /api/v1/analytics/contacted-kols?days=7
 * 获取联系的 KOL 列表
 */
router.get('/contacted-kols', analyticsController.getContactedKols);

/**
 * GET /api/v1/analytics/active-partnerships
 * 获取活跃合作的 KOL 列表
 */
router.get('/active-partnerships', analyticsController.getActivePartnershipKols);

/**
 * GET /api/v1/analytics/pending-followups
 * 获取待跟进的 KOL 列表
 */
router.get('/pending-followups', analyticsController.getPendingFollowupKols);

/**
 * GET /api/v1/analytics/all-responded-kols
 * 获取总体响应的 KOL 列表
 */
router.get('/all-responded-kols', analyticsController.getAllRespondedKols);

export default router;
