/**
 * 模板查询参数验证
 */

import { z } from 'zod';
import { TemplateCategory } from './create-template.dto';

/**
 * 排序字段枚举
 */
export const SortField = z.enum([
  'displayOrder', // 自定义排序（默认）
  'createdAt',    // 创建时间
  'updatedAt',    // 更新时间
  'useCount',     // 使用次数
  'name',         // 名称（字母序）
]);

export type SortFieldType = z.infer<typeof SortField>;

/**
 * 排序方向枚举
 */
export const SortOrder = z.enum(['asc', 'desc']);

export type SortOrderType = z.infer<typeof SortOrder>;

/**
 * 模板查询参数验证 schema
 */
export const templateQuerySchema = z.object({
  // 分页参数
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, '页码必须大于 0'),

  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 5000, '每页数量必须在 1-5000 之间'),

  // 搜索参数（模糊匹配模板名称或内容）
  search: z.string().optional(),

  // 筛选参数
  category: TemplateCategory.optional(),

  language: z
    .string()
    .length(2, '语言代码必须是 2 个字符')
    .optional(),

  aiGenerated: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),

  // 排序参数
  sortBy: SortField.default('displayOrder'),

  sortOrder: SortOrder.default('asc'),
});

/**
 * TypeScript 类型导出
 */
export type TemplateQueryDTO = z.infer<typeof templateQuerySchema>;
