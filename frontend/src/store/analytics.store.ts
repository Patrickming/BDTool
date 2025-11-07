/**
 * 分析统计状态管理
 */

import { create } from 'zustand';
import { message } from 'antd';
import type {
  OverviewStats,
  KOLDistributions,
  TemplateEffectiveness,
  ContactTimelinePoint,
} from '../types/analytics';
import * as analyticsService from '../services/analytics.service';

interface AnalyticsState {
  // 数据状态
  overviewStats: OverviewStats | null;
  kolDistributions: KOLDistributions | null;
  templateEffectiveness: TemplateEffectiveness[];
  contactTimeline: ContactTimelinePoint[];

  // 加载状态
  loadingOverview: boolean;
  loadingDistributions: boolean;
  loadingTemplates: boolean;
  loadingTimeline: boolean;

  // 查询参数
  timelineDays: number;

  // Actions
  fetchOverviewStats: () => Promise<void>;
  fetchKOLDistributions: () => Promise<void>;
  fetchTemplateEffectiveness: () => Promise<void>;
  fetchContactTimeline: (days?: number) => Promise<void>;
  fetchAllAnalytics: () => Promise<void>;
  setTimelineDays: (days: number) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  // 初始状态
  overviewStats: null,
  kolDistributions: null,
  templateEffectiveness: [],
  contactTimeline: [],

  loadingOverview: false,
  loadingDistributions: false,
  loadingTemplates: false,
  loadingTimeline: false,

  timelineDays: 30,

  // 获取概览统计数据
  fetchOverviewStats: async () => {
    try {
      set({ loadingOverview: true });
      const data = await analyticsService.getOverviewStats();
      set({ overviewStats: data });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取概览统计失败');
      console.error('Failed to fetch overview stats:', error);
    } finally {
      set({ loadingOverview: false });
    }
  },

  // 获取 KOL 分布数据
  fetchKOLDistributions: async () => {
    try {
      set({ loadingDistributions: true });
      const data = await analyticsService.getKOLDistributions();
      set({ kolDistributions: data });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取分布数据失败');
      console.error('Failed to fetch KOL distributions:', error);
    } finally {
      set({ loadingDistributions: false });
    }
  },

  // 获取模板效果统计
  fetchTemplateEffectiveness: async () => {
    try {
      set({ loadingTemplates: true });
      const data = await analyticsService.getTemplateEffectiveness();
      set({ templateEffectiveness: data });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取模板效果统计失败');
      console.error('Failed to fetch template effectiveness:', error);
    } finally {
      set({ loadingTemplates: false });
    }
  },

  // 获取联系时间线数据
  fetchContactTimeline: async (days?: number) => {
    try {
      set({ loadingTimeline: true });
      const targetDays = days ?? get().timelineDays;
      const data = await analyticsService.getContactTimeline(targetDays);
      set({ contactTimeline: data, timelineDays: targetDays });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取联系时间线失败');
      console.error('Failed to fetch contact timeline:', error);
    } finally {
      set({ loadingTimeline: false });
    }
  },

  // 获取所有分析数据（用于页面初始化）
  fetchAllAnalytics: async () => {
    const {
      fetchOverviewStats,
      fetchKOLDistributions,
      fetchTemplateEffectiveness,
      fetchContactTimeline
    } = get();

    // 并行请求所有数据
    await Promise.all([
      fetchOverviewStats(),
      fetchKOLDistributions(),
      fetchTemplateEffectiveness(),
      fetchContactTimeline(),
    ]);
  },

  // 设置时间线天数
  setTimelineDays: (days: number) => {
    set({ timelineDays: days });
  },
}));
