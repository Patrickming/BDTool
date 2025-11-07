/**
 * 更新模板数据验证
 */

import { z } from 'zod';
import { createTemplateSchema } from './create-template.dto';

/**
 * 更新模板验证 schema（所有字段可选）
 */
export const updateTemplateSchema = createTemplateSchema.partial();

/**
 * TypeScript 类型导出
 */
export type UpdateTemplateDTO = z.infer<typeof updateTemplateSchema>;
