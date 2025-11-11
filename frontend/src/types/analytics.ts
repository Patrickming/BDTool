/**
 * 分析统计数据类型定义
 */

/**
 * 概览统计数据
 */
export interface OverviewStats {
  totalKols: number;              // 总 KOL 数
  newKolsThisWeek: number;        // 本周新增 KOL 数
  contactedThisWeek: number;      // 本周联系数
  overallResponseRate: number;    // 总体响应率 (%)
  weeklyResponseRate: number;     // 本周响应率 (%)
  activePartnerships: number;     // 活跃合作数
  pendingFollowups: number;       // 待跟进数
}

/**
 * KOL 分布数据 - 粉丝数范围
 */
export interface FollowerCountDistribution {
  range: string;   // 粉丝数范围（如 "1k-5k"）
  count: number;   // 数量
}

/**
 * KOL 分布数据 - 质量分等级
 */
export interface QualityScoreDistribution {
  level: string;   // 质量等级（高质量 85+、良好 75-84、一般 65-74、较差 <65）
  count: number;   // 数量
}

/**
 * KOL 分布数据 - 内容分类
 */
export interface ContentCategoryDistribution {
  category: string;  // 内容分类
  count: number;     // 数量
}

/**
 * KOL 分布数据 - 状态分布
 */
export interface StatusDistribution {
  status: string;   // 状态
  count: number;    // 数量
}

/**
 * KOL 分布数据 - 语言分布
 */
export interface LanguageDistribution {
  language: string;  // 语言代码
  count: number;     // 数量
}

/**
 * KOL 分布数据汇总
 */
export interface KOLDistributions {
  byFollowerCount: FollowerCountDistribution[];     // 按粉丝数分布
  byQualityScore: QualityScoreDistribution[];       // 按质量分分布
  byContentCategory: ContentCategoryDistribution[]; // 按内容分类分布
  byStatus: StatusDistribution[];                   // 按状态分布
  byLanguage: LanguageDistribution[];               // 按语言分布
}

/**
 * 模板效果统计
 */
export interface TemplateEffectiveness {
  id: number;                      // 模板 ID
  name: string;                    // 模板名称
  category: string;                // 模板分类
  useCount: number;                // 使用次数
  responseCount: number;           // 响应次数
  responseRate: number;            // 响应率 (%)
  avgResponseTime: number | null;  // 平均响应时间（小时）
}

/**
 * 联系时间线数据点
 */
export interface ContactTimelinePoint {
  date: string;          // 日期 (YYYY-MM-DD)
  contactsCount: number; // 联系数
  responsesCount: number;// 响应数
}

/**
 * API 响应数据类型
 */
export interface AnalyticsApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
