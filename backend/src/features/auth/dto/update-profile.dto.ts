/**
 * 更新用户资料 DTO
 */

import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, '姓名不能为空').max(100, '姓名长度不能超过100个字符').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  company: z.string().max(100, '公司名称长度不能超过100个字符').optional().nullable(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
