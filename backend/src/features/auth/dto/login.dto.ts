/**
 * 用户登录数据传输对象（DTO）
 */

import { z } from 'zod';

/**
 * 登录验证 Schema
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: '邮箱不能为空',
    })
    .email('请输入有效的邮箱地址')
    .trim()
    .toLowerCase(),

  password: z
    .string({
      required_error: '密码不能为空',
    })
    .min(1, '密码不能为空'),
});

/**
 * 登录 DTO 类型
 */
export type LoginDto = z.infer<typeof loginSchema>;
