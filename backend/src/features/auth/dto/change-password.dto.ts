/**
 * 修改密码 DTO
 */

import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(6, '新密码至少6位'),
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
