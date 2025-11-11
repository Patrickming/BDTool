/**
 * 模板状态管理 (Zustand)
 */

import { create } from 'zustand';
import type { Template, TemplateQueryParams } from '@/types/template';
import * as templateService from '@/services/template.service';
import { message } from 'antd';

/**
 * 模板状态接口
 */
interface TemplateState {
  // 数据状态
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;

  // 分页状态
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // 查询参数
  queryParams: TemplateQueryParams;

  // Actions
  fetchTemplates: () => Promise<void>;
  fetchTemplateById: (id: number) => Promise<void>;
  createTemplate: (data: any) => Promise<void>;
  updateTemplate: (id: number, data: any) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  reorderTemplate: (id: number, direction: 'up' | 'down') => Promise<void>;
  setQueryParams: (params: Partial<TemplateQueryParams>) => void;
  resetQueryParams: () => void;
  setCurrentTemplate: (template: Template | null) => void;
}

/**
 * 默认查询参数
 */
const defaultQueryParams: TemplateQueryParams = {
  page: 1,
  limit: 20,
  sortBy: 'displayOrder',
  sortOrder: 'asc',
};

/**
 * 模板 Store
 */
export const useTemplateStore = create<TemplateState>((set, get) => ({
  // 初始状态
  templates: [],
  currentTemplate: null,
  loading: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  queryParams: defaultQueryParams,

  // 获取模板列表
  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const response = await templateService.getTemplates(get().queryParams);
      set({
        templates: response.templates,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取模板列表失败');
      set({ loading: false });
    }
  },

  // 获取模板详情
  fetchTemplateById: async (id: number) => {
    set({ loading: true });
    try {
      const template = await templateService.getTemplateById(id);
      set({ currentTemplate: template, loading: false });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取模板详情失败');
      set({ loading: false });
    }
  },

  // 创建模板
  createTemplate: async (data: any) => {
    set({ loading: true });
    try {
      await templateService.createTemplate(data);
      message.success('模板创建成功');
      await get().fetchTemplates();
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建模板失败');
      set({ loading: false });
      throw error;
    }
  },

  // 更新模板
  updateTemplate: async (id: number, data: any) => {
    set({ loading: true });
    try {
      await templateService.updateTemplate(id, data);
      message.success('模板更新成功');
      await get().fetchTemplates();
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新模板失败');
      set({ loading: false });
      throw error;
    }
  },

  // 删除模板
  deleteTemplate: async (id: number) => {
    set({ loading: true });
    try {
      await templateService.deleteTemplate(id);
      message.success('模板删除成功');
      await get().fetchTemplates();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除模板失败');
      set({ loading: false });
    }
  },

  // 调整模板顺序
  reorderTemplate: async (id: number, direction: 'up' | 'down') => {
    try {
      await templateService.reorderTemplate(id, direction);
      message.success('顺序调整成功');
      await get().fetchTemplates();
    } catch (error: any) {
      message.error(error.response?.data?.message || '顺序调整失败');
    }
  },

  // 设置查询参数
  setQueryParams: (params: Partial<TemplateQueryParams>) => {
    set((state) => ({
      queryParams: { ...state.queryParams, ...params, page: 1 },
    }));
  },

  // 重置查询参数
  resetQueryParams: () => {
    set({ queryParams: defaultQueryParams });
  },

  // 设置当前模板
  setCurrentTemplate: (template: Template | null) => {
    set({ currentTemplate: template });
  },
}));
