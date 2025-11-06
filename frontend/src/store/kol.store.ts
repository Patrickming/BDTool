/**
 * KOL 状态管理 (Zustand)
 */

import { create } from 'zustand';
import type {
  KOL,
  KOLQueryParams,
  Pagination,
  KOLStatus,
  ContentCategory,
} from '../types/kol';
import { kolService } from '../services/kol.service';
import { message } from 'antd';

interface KOLStore {
  // 状态
  kols: KOL[];
  pagination: Pagination | null;
  loading: boolean;
  selectedKOL: KOL | null;

  // 查询参数
  queryParams: KOLQueryParams;

  // Actions
  fetchKOLs: (params?: KOLQueryParams) => Promise<void>;
  fetchKOLById: (id: number) => Promise<void>;
  createKOL: (data: any) => Promise<KOL | null>;
  updateKOL: (id: number, data: any) => Promise<KOL | null>;
  deleteKOL: (id: number) => Promise<boolean>;
  batchImport: (inputs: string[]) => Promise<any>;

  // 查询参数更新
  setQueryParams: (params: Partial<KOLQueryParams>) => void;
  resetQueryParams: () => void;

  // 清除选中的 KOL
  clearSelectedKOL: () => void;
}

const initialQueryParams: KOLQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useKOLStore = create<KOLStore>((set, get) => ({
  // 初始状态
  kols: [],
  pagination: null,
  loading: false,
  selectedKOL: null,
  queryParams: initialQueryParams,

  // 获取 KOL 列表
  fetchKOLs: async (params) => {
    set({ loading: true });
    try {
      const queryParams = params || get().queryParams;
      const response = await kolService.getKOLList(queryParams);
      set({
        kols: response.kols,
        pagination: response.pagination,
        queryParams,
        loading: false,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取 KOL 列表失败');
      set({ loading: false });
    }
  },

  // 获取 KOL 详情
  fetchKOLById: async (id) => {
    set({ loading: true });
    try {
      const kol = await kolService.getKOLById(id);
      set({ selectedKOL: kol, loading: false });
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取 KOL 详情失败');
      set({ loading: false });
    }
  },

  // 创建 KOL
  createKOL: async (data) => {
    set({ loading: true });
    try {
      const kol = await kolService.createKOL(data);
      message.success('KOL 创建成功');
      set({ loading: false });
      // 刷新列表
      await get().fetchKOLs();
      return kol;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'KOL 创建失败');
      set({ loading: false });
      return null;
    }
  },

  // 更新 KOL
  updateKOL: async (id, data) => {
    set({ loading: true });
    try {
      const kol = await kolService.updateKOL(id, data);
      message.success('KOL 更新成功');
      set({ loading: false });
      // 刷新列表
      await get().fetchKOLs();
      return kol;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'KOL 更新失败');
      set({ loading: false });
      return null;
    }
  },

  // 删除 KOL
  deleteKOL: async (id) => {
    set({ loading: true });
    try {
      await kolService.deleteKOL(id);
      message.success('KOL 删除成功');
      set({ loading: false });
      // 刷新列表
      await get().fetchKOLs();
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || 'KOL 删除失败');
      set({ loading: false });
      return false;
    }
  },

  // 批量导入
  batchImport: async (inputs) => {
    set({ loading: true });
    try {
      const result = await kolService.batchImportKOLs({ inputs });
      message.success(
        `批量导入完成：成功 ${result.success} 个，失败 ${result.failed} 个，重复 ${result.duplicate} 个`
      );
      set({ loading: false });
      // 刷新列表
      await get().fetchKOLs();
      return result;
    } catch (error: any) {
      message.error(error.response?.data?.message || '批量导入失败');
      set({ loading: false });
      return null;
    }
  },

  // 设置查询参数
  setQueryParams: (params) => {
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    }));
  },

  // 重置查询参数
  resetQueryParams: () => {
    set({ queryParams: initialQueryParams });
  },

  // 清除选中的 KOL
  clearSelectedKOL: () => {
    set({ selectedKOL: null });
  },
}));
