/**
 * AI 功能服务
 * 封装所有 AI 相关的 API 调用
 */

import { api } from '@/lib/axios';
import type {
  RewriteTextRequest,
  RewriteTextResponse,
  BatchRewriteRequest,
  BatchRewriteResponse,
  RewriteTemplateRequest,
  RewriteTemplateResponse,
  AIHealthCheckResponse,
} from '@/types/ai';

const AI_BASE_URL = '/ai';

/**
 * AI 服务类
 */
export class AIService {
  /**
   * 改写单个文本
   */
  static async rewriteText(params: RewriteTextRequest): Promise<RewriteTextResponse['data']> {
    const response = await api.post<RewriteTextResponse>(`${AI_BASE_URL}/rewrite`, params);
    return response.data.data;
  }

  /**
   * 批量改写多个文本
   */
  static async batchRewrite(params: BatchRewriteRequest): Promise<BatchRewriteResponse['data']> {
    const response = await api.post<BatchRewriteResponse>(
      `${AI_BASE_URL}/rewrite/batch`,
      params
    );
    return response.data.data;
  }

  /**
   * 改写模板（带 KOL 上下文）
   */
  static async rewriteTemplate(
    params: RewriteTemplateRequest
  ): Promise<RewriteTemplateResponse['data']> {
    const response = await api.post<RewriteTemplateResponse>(
      `${AI_BASE_URL}/rewrite/template`,
      params
    );
    return response.data.data;
  }

  /**
   * 检查 AI 服务健康状态
   */
  static async healthCheck(): Promise<AIHealthCheckResponse['data']> {
    const response = await api.get<AIHealthCheckResponse>(`${AI_BASE_URL}/health`);
    return response.data.data;
  }
}

/**
 * 导出简化的函数接口
 */
export const aiService = {
  /**
   * 改写文本
   */
  rewriteText: AIService.rewriteText,

  /**
   * 批量改写
   */
  batchRewrite: AIService.batchRewrite,

  /**
   * 改写模板
   */
  rewriteTemplate: AIService.rewriteTemplate,

  /**
   * 健康检查
   */
  healthCheck: AIService.healthCheck,
};

export default aiService;
