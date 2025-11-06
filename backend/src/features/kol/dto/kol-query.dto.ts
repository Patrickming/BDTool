/**
 * KOL 查询参数验证
 */

import { z } from 'zod';
import { ContentCategory, KOLStatus } from './create-kol.dto';

/**
 * 排序字段枚举
 */
export const SortField = z.enum([
  'createdAt',      // 创建时间
  'updatedAt',      // 更新时间
  'followerCount',  // 粉丝数
  'qualityScore',   // 质量分
  'username',       // 用户名（字母序）
]);

export type SortFieldType = z.infer<typeof SortField>;

/**
 * 排序方向枚举
 */
export const SortOrder = z.enum(['asc', 'desc']);

export type SortOrderType = z.infer<typeof SortOrder>;

/**
 * KOL 列表查询参数验证 schema
 */
export const kolQuerySchema = z.object({
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
    .default('10')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, '每页数量必须在 1-100 之间'),

  // 搜索参数（模糊匹配 username 或 displayName）
  search: z.string().optional(),

  // 筛选参数
  status: KOLStatus.optional(),

  contentCategory: ContentCategory.optional(),

  // 质量分范围筛选
  minQualityScore: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => val === undefined || (val >= 0 && val <= 100), '质量分必须在 0-100 之间'),

  maxQualityScore: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => val === undefined || (val >= 0 && val <= 100), '质量分必须在 0-100 之间'),

  // 粉丝数范围筛选
  minFollowerCount: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => val === undefined || val >= 0, '粉丝数不能为负数'),

  maxFollowerCount: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => val === undefined || val >= 0, '粉丝数不能为负数'),

  // 是否认证筛选
  verified: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),

  // 排序参数
  sortBy: SortField.default('createdAt'),

  sortOrder: SortOrder.default('desc'),
});

/**
 * TypeScript 类型导出
 */
export type KOLQueryDTO = z.infer<typeof kolQuerySchema>;
