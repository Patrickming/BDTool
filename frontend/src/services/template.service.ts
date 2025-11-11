/**
 * 模板 API 服务
 */

import { api } from '../lib/axios';
import type {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateQueryParams,
  PreviewTemplateDto,
  TemplatePreview,
  PaginatedTemplateResponse,
} from '@/types/template';

/**
 * 创建模板
 */
export const createTemplate = async (data: CreateTemplateDto): Promise<Template> => {
  const response = await api.post<{ success: boolean; message: string; data: Template }>(
    '/templates',
    data
  );
  return response.data.data;
};

/**
 * 获取模板列表
 */
export const getTemplates = async (
  params?: TemplateQueryParams
): Promise<PaginatedTemplateResponse> => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: PaginatedTemplateResponse;
  }>('/templates', { params });
  return response.data.data;
};

/**
 * 获取模板详情
 */
export const getTemplateById = async (id: number): Promise<Template> => {
  const response = await api.get<{ success: boolean; message: string; data: Template }>(
    `/templates/${id}`
  );
  return response.data.data;
};

/**
 * 更新模板
 */
export const updateTemplate = async (id: number, data: UpdateTemplateDto): Promise<Template> => {
  const response = await api.put<{ success: boolean; message: string; data: Template }>(
    `/templates/${id}`,
    data
  );
  return response.data.data;
};

/**
 * 删除模板
 */
export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/templates/${id}`);
};

/**
 * 预览模板
 */
export const previewTemplate = async (data: PreviewTemplateDto): Promise<TemplatePreview> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: TemplatePreview;
  }>('/templates/preview', data);
  return response.data.data;
};

/**
 * 调整模板顺序
 */
export const reorderTemplate = async (id: number, direction: 'up' | 'down'): Promise<void> => {
  await api.post(`/templates/${id}/reorder`, { direction });
};
