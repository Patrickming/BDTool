/**
 * 用户注册数据传输对象（DTO）
 */

import { z } from 'zod';

/**
 * 注册验证 Schema
 */
export const registerSchema = z.object({
  email: z
    .string({
      required_error: '邮箱不能为空',
    })
    .email('请输入有效的邮箱地址')
    .min(5, '邮箱长度至少为 5 个字符')
    .max(255, '邮箱长度不能超过 255 个字符')
    .trim()
    .toLowerCase(),

  password: z
    .string({
      required_error: '密码不能为空',
    })
    .min(8, '密码长度至少为 8 个字符')
    .max(128, '密码长度不能超过 128 个字符')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '密码必须包含至少一个大写字母、一个小写字母和一个数字'
    ),

  fullName: z
    .string({
      required_error: '姓名不能为空',
    })
    .min(2, '姓名长度至少为 2 个字符')
    .max(100, '姓名长度不能超过 100 个字符')
    .trim(),
});

/**
 * 注册 DTO 类型
 */
export type RegisterDto = z.infer<typeof registerSchema>;
