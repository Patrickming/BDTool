/**
 * 模板类型定义（多语言版本）
 */

/**
 * 模板分类枚举
 */
export type TemplateCategory = 'initial' | 'followup' | 'negotiation' | 'collaboration' | 'maintenance';

/**
 * 模板语言版本接口
 */
export interface TemplateVersion {
  id: number;
  templateId: number;
  language: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 模板接口（多语言版本）
 */
export interface Template {
  id: number;
  userId: number;
  name: string;
  category: TemplateCategory;
  versions: TemplateVersion[]; // 多语言版本数组
  createdAt: string;
  updatedAt: string;
}

/**
 * 语言版本数据（用于创建/更新）
 */
export interface TemplateVersionData {
  language: string;
  content: string;
}

/**
 * 创建模板 DTO（多语言版本）
 */
export interface CreateTemplateDto {
  name: string;
  category: TemplateCategory;
  versions: TemplateVersionData[]; // 至少一个语言版本
}

/**
 * 更新模板 DTO（多语言版本）
 */
export interface UpdateTemplateDto {
  name?: string;
  category?: TemplateCategory;
  versions?: TemplateVersionData[]; // 可选更新语言版本
}

/**
 * 模板查询参数
 */
export interface TemplateQueryParams {
  category?: TemplateCategory;
  search?: string;
  language?: string;
  aiGenerated?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'useCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 模板预览请求（支持语言选择）
 */
export interface PreviewTemplateDto {
  templateId?: number;
  language?: string; // 指定语言版本
  content?: string; // 或直接提供内容
  kolId?: number; // 选择 KOL 进行变量替换
}

/**
 * 模板预览响应
 */
export interface TemplatePreview {
  originalContent: string;
  previewContent: string;
  variables: Record<string, string>;
}

/**
 * 模板分类配置
 */
export const TEMPLATE_CATEGORY_CONFIG: Record<
  TemplateCategory,
  { label: string; color: string; icon: string }
> = {
  initial: { label: '初次联系', color: '#1890ff', icon: '✉️' },
  followup: { label: '跟进联系', color: '#52c41a', icon: '🔄' },
  negotiation: { label: '价格谈判', color: '#faad14', icon: '💰' },
  collaboration: { label: '合作细节', color: '#722ed1', icon: '🤝' },
  maintenance: { label: '关系维护', color: '#eb2f96', icon: '💝' },
};

/**
 * 支持的变量列表
 */
export const AVAILABLE_VARIABLES = [
  {
    category: 'KOL 信息',
    variables: [
      { name: '{{username}}', description: 'Twitter 用户名', example: 'cryptotrader_pro' },
      { name: '{{display_name}}', description: '显示名称', example: 'Crypto Trader Pro' },
      { name: '{{follower_count}}', description: '粉丝数（格式化）', example: '15,000' },
      { name: '{{bio}}', description: '个人简介', example: 'Contract trading expert...' },
      { name: '{{profile_url}}', description: 'Twitter 主页链接', example: 'https://twitter.com/...' },
    ],
  },
  {
    category: '个人信息',
    variables: [
      { name: '{{my_name}}', description: '我的姓名', example: 'Alex Chen' },
      { name: '{{my_email}}', description: '我的邮箱', example: 'alex@kcex.com' },
      { name: '{{exchange_name}}', description: '交易所名称', example: 'KCEX' },
    ],
  },
  {
    category: '系统变量',
    variables: [
      { name: '{{today}}', description: '今天日期', example: '2025-01-07' },
      { name: '{{today_cn}}', description: '今天日期（中文）', example: '2025年1月7日' },
    ],
  },
];

/**
 * 分页响应接口
 */
export interface PaginatedTemplateResponse {
  templates: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
