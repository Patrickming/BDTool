/**
 * 更新 KOL 数据验证
 */

import { z } from 'zod';
import { ContentCategory, KOLStatus } from './create-kol.dto';

/**
 * Twitter 用户名格式验证
 */
const twitterUsernameRegex = /^[a-zA-Z0-9_]{1,15}$/;

/**
 * 更新 KOL 的验证 schema
 * 所有字段都是可选的，只更新提供的字段
 */
export const updateKOLSchema = z.object({
  username: z
    .string()
    .min(1, '用户名不能为空')
    .max(15, '用户名不能超过 15 个字符')
    .regex(twitterUsernameRegex, '用户名只能包含字母、数字和下划线')
    .optional(),

  displayName: z
    .string()
    .min(1, '显示名不能为空')
    .max(50, '显示名不能超过 50 个字符')
    .optional(),

  twitterId: z.string().optional(),

  bio: z.string().max(500, '简介不能超过 500 个字符').optional(),

  followerCount: z
    .number()
    .int('粉丝数必须是整数')
    .nonnegative('粉丝数不能为负数')
    .optional(),

  followingCount: z
    .number()
    .int('关注数必须是整数')
    .nonnegative('关注数不能为负数')
    .optional(),

  verified: z.boolean().optional(),

  profileImgUrl: z.string().url('头像 URL 格式不正确').optional(),

  language: z.string().length(2, '语言代码必须是 2 个字符的 ISO 代码').optional(),

  lastTweetDate: z.string().datetime('最后推文日期格式不正确').optional(),

  accountCreated: z.string().datetime('账户创建日期格式不正确').optional(),

  qualityScore: z
    .number()
    .int('质量分必须是整数')
    .min(0, '质量分不能小于 0')
    .max(100, '质量分不能大于 100')
    .optional(),

  contentCategory: ContentCategory.optional(),

  status: KOLStatus.optional(),

  customNotes: z.string().max(1000, '备注不能超过 1000 个字符').optional(),
});

/**
 * TypeScript 类型导出
 */
export type UpdateKOLDTO = z.infer<typeof updateKOLSchema>;
