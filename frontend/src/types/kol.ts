/**
 * KOL 类型定义
 */

/**
 * KOL 状态枚举
 */
export enum KOLStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  REPLIED = 'replied',
  NEGOTIATING = 'negotiating',
  COOPERATING = 'cooperating',
  COOPERATED = 'cooperated',
  REJECTED = 'rejected',
}

/**
 * KOL 状态标签配置
 */
export const KOLStatusConfig: Record<
  KOLStatus,
  { label: string; color: string }
> = {
  [KOLStatus.NEW]: { label: '新添加', color: 'blue' },
  [KOLStatus.CONTACTED]: { label: '已联系', color: 'orange' },
  [KOLStatus.REPLIED]: { label: '已回复', color: 'green' },
  [KOLStatus.NEGOTIATING]: { label: '协商中', color: 'purple' },
  [KOLStatus.COOPERATING]: { label: '合作中', color: 'cyan' },
  [KOLStatus.COOPERATED]: { label: '已合作', color: 'geekblue' },
  [KOLStatus.REJECTED]: { label: '已拒绝', color: 'red' },
};

/**
 * 内容分类枚举
 */
export enum ContentCategory {
  CONTRACT_TRADING = 'contract_trading',
  CRYPTO_TRADING = 'crypto_trading',
  WEB3 = 'web3',
  UNKNOWN = 'unknown',
}

/**
 * 内容分类标签配置
 */
export const ContentCategoryConfig: Record<
  ContentCategory,
  { label: string; priority: string }
> = {
  [ContentCategory.CONTRACT_TRADING]: { label: '合约交易分析', priority: '最高' },
  [ContentCategory.CRYPTO_TRADING]: { label: '代币交易分析', priority: '高' },
  [ContentCategory.WEB3]: { label: 'Web3 通用', priority: '中' },
  [ContentCategory.UNKNOWN]: { label: '未分类', priority: '低' },
};

/**
 * KOL 接口
 */
export interface KOL {
  id: number;
  username: string;
  displayName: string;
  twitterId: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  verified: boolean;
  profileImgUrl: string | null;
  language: string | null;
  lastTweetDate: string | null;
  accountCreated: string | null;
  qualityScore: number;
  contentCategory: ContentCategory;
  status: KOLStatus;
  customNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建 KOL DTO
 */
export interface CreateKOLDto {
  username: string;
  displayName: string;
  twitterId?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  verified?: boolean;
  profileImgUrl?: string;
  language?: string;
  lastTweetDate?: string;
  accountCreated?: string;
  qualityScore?: number;
  contentCategory?: ContentCategory;
  status?: KOLStatus;
  customNotes?: string;
}

/**
 * 更新 KOL DTO
 */
export interface UpdateKOLDto {
  username?: string;
  displayName?: string;
  twitterId?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  verified?: boolean;
  profileImgUrl?: string;
  language?: string;
  lastTweetDate?: string;
  accountCreated?: string;
  qualityScore?: number;
  contentCategory?: ContentCategory;
  status?: KOLStatus;
  customNotes?: string;
}

/**
 * 批量导入 DTO
 */
export interface BatchImportDto {
  inputs: string[];
}

/**
 * 批量导入结果
 */
export interface BatchImportResult {
  success: number;
  failed: number;
  duplicate: number;
  errors: string[];
  imported: Array<{
    id: number;
    username: string;
    displayName: string;
    status: KOLStatus;
    createdAt: string;
  }>;
}

/**
 * KOL 查询参数
 */
export interface KOLQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: KOLStatus;
  contentCategory?: ContentCategory;
  minQualityScore?: number;
  maxQualityScore?: number;
  minFollowerCount?: number;
  maxFollowerCount?: number;
  verified?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'followerCount' | 'qualityScore' | 'username';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页信息
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * KOL 列表响应
 */
export interface KOLListResponse {
  kols: KOL[];
  pagination: Pagination;
}

/**
 * 排序字段选项
 */
export const SortByOptions = [
  { label: '创建时间', value: 'createdAt' },
  { label: '更新时间', value: 'updatedAt' },
  { label: '粉丝数', value: 'followerCount' },
  { label: '质量分', value: 'qualityScore' },
  { label: '用户名', value: 'username' },
] as const;

/**
 * 排序方向选项
 */
export const SortOrderOptions = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' },
] as const;
