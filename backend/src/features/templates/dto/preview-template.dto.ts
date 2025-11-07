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

  // 模板内容（如果不提供 templateId 则必须提供 content）
  content: z
    .string()
    .min(1, '模板内容不能为空'),

  // KOL ID（可选，用于替换 KOL 相关变量）
  kolId: z
    .number()
    .int('KOL ID 必须是整数')
    .positive('KOL ID 必须是正数')
    .optional(),
});

/**
 * TypeScript 类型导出
 */
export type PreviewTemplateDTO = z.infer<typeof previewTemplateSchema>;
