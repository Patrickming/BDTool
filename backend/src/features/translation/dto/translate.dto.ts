/**
 * 翻译请求 DTO
 */

import { z } from 'zod';

/**
 * 翻译请求验证规则
 */
export const TranslateRequestSchema = z.object({
  text: z.string().min(1, '文本不能为空').max(10000, '文本长度不能超过 10000 字符'),
  targetLanguage: z.string().min(2, '目标语言代码至少 2 个字符').max(10, '目标语言代码不能超过 10 个字符'),
  sourceLanguage: z.string().min(2).max(10).optional(),
});

/**
 * 批量翻译请求验证规则
 */
export const BatchTranslateRequestSchema = z.object({
  texts: z.array(z.string().min(1).max(10000)).min(1, '至少提供一条文本').max(100, '批量翻译最多支持 100 条'),
  targetLanguage: z.string().min(2).max(10),
  sourceLanguage: z.string().min(2).max(10).optional(),
});

/**
 * 语言检测请求验证规则
 */
export const DetectLanguageRequestSchema = z.object({
  text: z.string().min(1, '文本不能为空').max(10000, '文本长度不能超过 10000 字符'),
});

// 类型导出
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
export type BatchTranslateRequest = z.infer<typeof BatchTranslateRequestSchema>;
export type DetectLanguageRequest = z.infer<typeof DetectLanguageRequestSchema>;
