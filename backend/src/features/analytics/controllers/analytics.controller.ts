/**
 * 分析统计控制器 - HTTP 请求处理层
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@common/utils/async-handler';
import { successResponse } from '@common/utils/api-response';
import { analyticsService } from '../services/analytics.service';
import { logger } from '@config/logger.config';

/**
 * 分析统计控制器类
 */
export class AnalyticsController {
  /**
   * 获取概览统计
   * GET /api/v1/analytics/overview?days=7
   */
  getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求概览统计`);

    // 获取查询参数（天数，0 表示所有时间）
    const days = parseInt(req.query.days as string) || 7;

    // 验证天数范围（0 表示所有时间，1-365 天）
    if (days < 0 || days > 365) {
      return successResponse(res, null, '天数参数必须在 0-365 之间', 400);
    }

    // 调用服务层获取统计数据
    const stats = await analyticsService.getOverviewStats(req.user!.id, days);

    // 返回成功响应
    return successResponse(res, stats, '概览统计获取成功');
  });

  /**
   * 获取 KOL 分布数据
   * GET /api/v1/analytics/distributions
   */
  getKOLDistributions = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求 KOL 分布数据`);

    // 调用服务层获取分布数据
    const distributions = await analyticsService.getKOLDistributions(req.user!.id);

    // 返回成功响应
    return successResponse(res, distributions, 'KOL 分布数据获取成功');
  });

  /**
   * 获取模板效果统计
   * GET /api/v1/analytics/templates
   */
  getTemplateEffectiveness = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求模板效果统计`);

    // 调用服务层获取模板效果
    const effectiveness = await analyticsService.getTemplateEffectiveness(req.user!.id);

    // 返回成功响应
    return successResponse(res, effectiveness, '模板效果统计获取成功');
  });

  /**
   * 获取联系时间线
   * GET /api/v1/analytics/timeline?days=30
   */
  getContactTimeline = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求联系时间线`);

    // 获取查询参数（天数）
    const days = parseInt(req.query.days as string) || 7;

    // 验证天数范围（1-90天）
    if (days < 1 || days > 90) {
      return successResponse(res, null, '天数参数必须在 1-90 之间', 400);
    }

    // 调用服务层获取时间线数据
    const timeline = await analyticsService.getContactTimeline(req.user!.id, days);

    // 返回成功响应
    return successResponse(res, timeline, '联系时间线获取成功');
  });
}

// 导出控制器实例
export const analyticsController = new AnalyticsController();
