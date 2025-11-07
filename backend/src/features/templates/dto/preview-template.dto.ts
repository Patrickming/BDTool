/**
 * 模板预览数据验证
 */

import { z } from 'zod';

/**
 * 模板预览验证 schema
 */
export const previewTemplateSchema = z.object({
  // 模板 ID（可选，如果提供则从数据库获取模板内容）
  templateId: z
    .number()
    .int('模板 ID 必须是整数')
    .positive('模板 ID 必须是正数')
    .optional(),

  // 语言代码（如果提供 templateId，则从指定语言版本获取内容）
  language: z
    .string()
    .length(2, '语言代码必须是 2 个字符')
    .optional(),

  // 模板内容（如果不提供 templateId 则必须提供 content）
  content: z
    .string()
    .min(1, '模板内容不能为空')
    .optional(),

  // KOL ID（可选，用于替换 KOL 相关变量）
  kolId: z
    .number()
    .int('KOL ID 必须是整数')
    .positive('KOL ID 必须是正数')
    .optional(),
}).refine(
  (data) => data.templateId !== undefined || data.content !== undefined,
  {
    message: '必须提供 templateId 或 content 之一',
  }
);

/**
 * TypeScript 类型导出
 */
export type PreviewTemplateDTO = z.infer<typeof previewTemplateSchema>;
