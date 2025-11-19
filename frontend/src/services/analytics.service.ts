/**
 * 分析统计 API 服务
 */

import { api } from '../lib/axios';
import type {
  OverviewStats,
  KOLDistributions,
  TemplateEffectiveness,
  ContactTimelinePoint,
  AnalyticsApiResponse,
} from '../types/analytics';

/**
 * 获取概览统计数据
 * @param days 天数 (0表示所有时间, 默认 7)
 */
export async function getOverviewStats(days: number = 7): Promise<OverviewStats> {
  const response = await api.get<AnalyticsApiResponse<OverviewStats>>(
    '/analytics/overview',
    {
      params: { days },
    }
  );
  return response.data.data;
}

/**
 * 获取 KOL 分布数据
 */
export async function getKOLDistributions(): Promise<KOLDistributions> {
  const response = await api.get<AnalyticsApiResponse<KOLDistributions>>(
    '/analytics/distributions'
  );
  return response.data.data;
}

/**
 * 获取模板效果统计
 */
export async function getTemplateEffectiveness(): Promise<TemplateEffectiveness[]> {
  const response = await api.get<AnalyticsApiResponse<TemplateEffectiveness[]>>(
    '/analytics/templates'
  );
  return response.data.data;
}

/**
 * 获取联系时间线数据
 * @param days 天数 (1-90)，默认 30
 */
export async function getContactTimeline(
  days: number = 30
): Promise<ContactTimelinePoint[]> {
  const response = await api.get<AnalyticsApiResponse<ContactTimelinePoint[]>>(
    '/analytics/timeline',
    {
      params: { days },
    }
  );
  return response.data.data;
}
