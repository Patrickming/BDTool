/**
 * 创建 KOL 数据验证
 */

import { z } from 'zod';

/**
 * Twitter 用户名格式验证
 * - 1-15 个字符
 * - 只能包含字母、数字和下划线
 */
const twitterUsernameRegex = /^[a-zA-Z0-9_]{1,15}$/;

/**
 * 内容分类枚举
 */
export const ContentCategory = z.enum([
  'contract_trading',  // 合约交易
  'crypto_trading',    // 代币交易
  'web3',              // Web3 通用
  'unknown',           // 未分类
]);

export type ContentCategoryType = z.infer<typeof ContentCategory>;

/**
 * KOL 状态枚举
 */
export const KOLStatus = z.enum([
  'new',            // 新添加
  'contacted',      // 已联系
  'replied',        // 已回复
  'negotiating',    // 协商中
  'cooperating',    // 合作中
  'cooperated',     // 已合作
  'rejected',       // 已拒绝
]);

export type KOLStatusType = z.infer<typeof KOLStatus>;

/**
 * 创建单个 KOL 的验证 schema
 */
export const createKOLSchema = z.object({
  // 必填字段
  username: z
    .string()
    .min(1, '用户名不能为空')
    .max(15, '用户名不能超过 15 个字符')
    .regex(twitterUsernameRegex, '用户名只能包含字母、数字和下划线'),

  displayName: z
    .string()
    .min(1, '显示名不能为空')
    .max(50, '显示名不能超过 50 个字符'),

  // 可选字段
  twitterId: z.string().optional(),

  bio: z.string().max(500, '简介不能超过 500 个字符').optional(),

  followerCount: z
    .number()
    .int('粉丝数必须是整数')
    .nonnegative('粉丝数不能为负数')
    .default(0),

  followingCount: z
    .number()
    .int('关注数必须是整数')
    .nonnegative('关注数不能为负数')
    .default(0),

  verified: z.boolean().default(false),

  profileImgUrl: z.string().url('头像 URL 格式不正确').optional(),

  language: z.string().length(2, '语言代码必须是 2 个字符的 ISO 代码').optional(),

  lastTweetDate: z.string().datetime('最后推文日期格式不正确').optional(),

  accountCreated: z.string().datetime('账户创建日期格式不正确').optional(),

  contentCategory: ContentCategory.default('unknown'),

  status: KOLStatus.default('new'),

  qualityScore: z
    .number()
    .int('质量分必须是整数')
    .min(0, '质量分不能小于 0')
    .max(100, '质量分不能大于 100')
    .default(0),

  customNotes: z.string().max(1000, '备注不能超过 1000 个字符').optional(),
});

/**
 * 批量导入 KOL 的验证 schema
 * 支持格式：
 * - @username
 * - username
 * - https://twitter.com/username
 * - https://x.com/username
 */
export const batchImportSchema = z.object({
  inputs: z
    .array(z.string().min(1, '输入不能为空'))
    .min(1, '至少需要导入一个 KOL')
    .max(100, '单次最多导入 100 个 KOL'),
});

/**
 * 从批量导入输入中解析出用户名
 * @param input 原始输入（@username、username 或 URL）
 * @returns 解析后的 Twitter 用户名，失败返回 null
 */
export function parseTwitterUsername(input: string): string | null {
  const trimmed = input.trim();

  // 情况 1: @username
  if (trimmed.startsWith('@')) {
    const username = trimmed.slice(1);
    return twitterUsernameRegex.test(username) ? username : null;
  }

  // 情况 2: https://twitter.com/username 或 https://x.com/username
  const urlMatch = trimmed.match(/^https?:\/\/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  // 情况 3: 纯用户名
  return twitterUsernameRegex.test(trimmed) ? trimmed : null;
}

/**
 * TypeScript 类型导出
 */
export type CreateKOLDTO = z.infer<typeof createKOLSchema>;
export type BatchImportDTO = z.infer<typeof batchImportSchema>;
