/**
 * KOL API 服务
 */

import apiClient from './api';
import type {
  KOL,
  CreateKOLDto,
  UpdateKOLDto,
  BatchImportDto,
  BatchImportResult,
  KOLQueryParams,
  KOLListResponse,
} from '../types/kol';

/**
 * KOL 服务类
 */
class KOLService {
  /**
   * 创建单个 KOL
   */
  async createKOL(data: CreateKOLDto): Promise<KOL> {
    const response = await apiClient.post<{ success: boolean; message: string; data: KOL }>(
      '/kols',
      data
    );
    return response.data.data;
  }

  /**
   * 批量导入 KOL
   */
  async batchImportKOLs(data: BatchImportDto): Promise<BatchImportResult> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: BatchImportResult;
    }>('/kols/batch/import', data);
    return response.data.data;
  }

  /**
   * 获取 KOL 列表
   */
  async getKOLList(params?: KOLQueryParams): Promise<KOLListResponse> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: KOLListResponse;
    }>('/kols', { params });
    return response.data.data;
  }

  /**
   * 获取 KOL 详情
   */
  async getKOLById(id: number): Promise<KOL> {
    const response = await apiClient.get<{ success: boolean; message: string; data: KOL }>(
      `/kols/${id}`
    );
    return response.data.data;
  }

  /**
   * 更新 KOL 信息
   */
  async updateKOL(id: number, data: UpdateKOLDto): Promise<KOL> {
    const response = await apiClient.put<{ success: boolean; message: string; data: KOL }>(
      `/kols/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * 删除 KOL
   */
  async deleteKOL(id: number): Promise<void> {
    await apiClient.delete(`/kols/${id}`);
  }
}

// 导出单例
export const kolService = new KOLService();
export default kolService;
