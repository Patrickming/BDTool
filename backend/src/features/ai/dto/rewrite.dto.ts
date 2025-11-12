/**
 * AI 改写功能的数据传输对象 (DTO)
 * 使用 Zod 进行验证
 */

import { z } from 'zod';

/**
 * 文本改写请求 DTO
 */
export const RewriteTextRequestSchema = z.object({
  text: z
    .string()
    .min(1, '文本不能为空')
    .max(5000, '文本长度不能超过 5000 字符'),

  tone: z
    .enum(['professional', 'casual', 'friendly', 'formal'])
    .default('professional')
    .describe('改写风格'),

  language: z
    .enum(['en', 'zh', 'ja', 'ko', 'es', 'pt', 'fr', 'de', 'ru'])
    .default('en')
    .describe('目标语言'),

  preserveVariables: z
    .boolean()
    .default(true)
    .describe('是否保留模板变量（如 {{username}}）'),

  maxLength: z
    .number()
    .positive()
    .max(10000)
    .optional()
    .describe('改写后的最大长度'),

  model: z
    .enum(['glm-4.6', 'glm-4.5', 'glm-4.5-x', 'glm-4-plus', 'glm-4-air', 'glm-4-airx', 'glm-4.5-airx', 'glm-4-flash'])
    .optional()
    .describe('使用的模型'),
});

export type RewriteTextRequest = z.infer<typeof RewriteTextRequestSchema>;

/**
 * 批量改写请求 DTO
 */
export const BatchRewriteRequestSchema = z.object({
  texts: z
    .array(z.string().min(1).max(5000))
    .min(1, '至少需要一个文本')
    .max(10, '一次最多改写 10 个文本'),

  tone: z
    .enum(['professional', 'casual', 'friendly', 'formal'])
    .default('professional'),

  language: z
    .enum(['en', 'zh', 'ja', 'ko', 'es', 'pt', 'fr', 'de', 'ru'])
    .default('en'),

  preserveVariables: z.boolean().default(true),

  model: z
    .enum(['glm-4.6', 'glm-4.5', 'glm-4.5-x', 'glm-4-plus', 'glm-4-air', 'glm-4-airx', 'glm-4.5-airx', 'glm-4-flash'])
    .optional(),
});

export type BatchRewriteRequest = z.infer<typeof BatchRewriteRequestSchema>;

/**
 * 模板改写请求 DTO（带 KOL 上下文）
 */
export const RewriteTemplateRequestSchema = z.object({
  template: z
    .string()
    .min(1, '模板内容不能为空')
    .max(5000, '模板长度不能超过 5000 字符'),

  kolContext: z
    .object({
      username: z.string(),
      displayName: z.string(),
      bio: z.string().optional(),
      category: z.string().optional(),
      language: z.string().optional(),
    })
    .optional()
    .describe('KOL 上下文信息'),

  tone: z
    .enum(['professional', 'casual', 'friendly', 'formal'])
    .default('professional'),

  model: z
    .enum(['glm-4.6', 'glm-4.5', 'glm-4.5-x', 'glm-4-plus', 'glm-4-air', 'glm-4-airx', 'glm-4.5-airx', 'glm-4-flash'])
    .optional(),
});

export type RewriteTemplateRequest = z.infer<typeof RewriteTemplateRequestSchema>;

/**
 * 改写响应 DTO
 */
export interface RewriteResponse {
  success: boolean;
  data: {
    original: string;
    rewritten: string;
    tone: string;
    language: string;
    model: string;
    tokensUsed: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}

/**
 * 批量改写响应 DTO
 */
export interface BatchRewriteResponse {
  success: boolean;
  data: {
    results: Array<{
      original: string;
      rewritten: string;
      tone: string;
      language: string;
      model: string;
      tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
      };
    }>;
    totalTokens: number;
  };
}

/**
 * 健康检查响应 DTO
 */
export interface HealthCheckResponse {
  success: boolean;
  data: {
    healthy: boolean;
    model: string;
    latency: number;
    error?: string;
  };
}
