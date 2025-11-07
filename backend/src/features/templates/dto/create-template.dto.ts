/**
 * 创建模板数据验证
 */

import { z } from 'zod';

/**
 * 模板分类枚举
 */
export const TemplateCategory = z.enum([
  'initial',       // 初次联系
  'followup',      // 跟进联系
  'negotiation',   // 价格谈判
  'collaboration', // 合作细节
  'maintenance',   // 关系维护
]);

export type TemplateCategoryType = z.infer<typeof TemplateCategory>;

/**
 * 变量格式验证正则
 * 格式：{{variable_name}}
 * 变量名只能包含小写字母、数字和下划线，且不能以数字开头
 */
const variableRegex = /\{\{([a-z_][a-z0-9_]*)\}\}/g;

/**
 * 创建模板验证 schema
 */
export const createTemplateSchema = z.object({
  // 必填字段
  name: z
    .string()
    .min(1, '模板名称不能为空')
    .max(100, '模板名称不能超过 100 个字符'),

  category: TemplateCategory,

  content: z
    .string()
    .min(1, '模板内容不能为空')
    .max(5000, '模板内容不能超过 5000 个字符')
    .refine(
      (content) => {
        // 验证变量格式
        const allBraces = content.match(/\{\{[^}]*\}\}/g) || [];
        const validBraces = content.match(variableRegex) || [];
        return allBraces.length === validBraces.length;
      },
      {
        message: '模板中包含格式错误的变量，变量格式应为 {{variable_name}}',
      }
    ),

  // 可选字段
  language: z
    .string()
    .length(2, '语言代码必须是 2 个字符')
    .default('en'),

  aiGenerated: z
    .boolean()
    .default(false),
});

/**
 * TypeScript 类型导出
 */
export type CreateTemplateDTO = z.infer<typeof createTemplateSchema>;
