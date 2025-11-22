/**
 * 分析统计服务 - 业务逻辑层
 */

import { prisma } from '@database/client';
import { logger } from '@config/logger.config';

/**
 * 概览统计数据接口
 */
export interface OverviewStats {
  totalKols: number;              // 总 KOL 数
  totalTemplates: number;         // 总模板数
  totalContacts: number;          // 总联系数（除新添加之外的KOL数）
  activePartnerships: number;     // 活跃合作数
  newKolsThisWeek: number;        // 本周新增 KOL 数
  contactedThisWeek: number;      // 本周联系数
  overallResponseRate: number;    // 总体响应率 (%)
  weeklyResponseRate: number;     // 本周响应率 (%)
  pendingFollowups: number;       // 待跟进数
}

/**
 * KOL 分布数据接口
 */
export interface KOLDistributions {
  byFollowerCount: Array<{ range: string; count: number }>;        // 粉丝数分布
  byQualityScore: Array<{ level: string; count: number }>;         // 质量分分布
  byContentCategory: Array<{ category: string; count: number }>;   // 内容分类分布
  byStatus: Array<{ status: string; count: number }>;              // 状态分布
  byLanguage: Array<{ language: string; count: number }>;          // 语言分布
}

/**
 * 模板效果数据接口
 */
export interface TemplateEffectiveness {
  id: number;
  name: string;
  category: string;
  useCount: number;
  responseCount: number;
  responseRate: number;          // 响应率 (%)
  avgResponseTime: number | null; // 平均响应时间（小时）
}

/**
 * 状态变更时间线数据点接口
 */
export interface ContactTimelinePoint {
  date: string;                  // 日期 (YYYY-MM-DD)
  newKols: number;               // 新增 KOL 数
  statusChanges: number;         // 状态变更数
  responses: number;             // 响应数（变为已回复/洽谈中/合作中/已合作/已拒绝）
}

/**
 * 分析统计服务类
 */
export class AnalyticsService {
  /**
   * 获取概览统计数据
   * @param userId - 用户 ID
   * @param days - 查询天数（0 表示所有时间，默认 7）
   * @returns 概览统计
   */
  async getOverviewStats(userId: number, days: number = 7): Promise<OverviewStats> {
    logger.info(`用户 ${userId} 获取概览统计 (${days === 0 ? '所有时间' : `近${days}天`})`);

    const now = new Date();
    let timeStart: Date | undefined;

    // 如果 days > 0，计算时间范围起点；如果 days === 0，不限制时间（所有时间）
    if (days > 0) {
      timeStart = new Date(now);
      timeStart.setDate(now.getDate() - days);
    }

    // 1. 总 KOL 数
    const totalKols = await prisma.kOL.count({
      where: { userId },
    });

    // 2. 时间范围内新增 KOL 数
    // 优先从历史记录中查询（oldValue = null 表示新创建）
    const newKolsFromHistory = await prisma.kOLHistory.count({
      where: {
        userId,
        fieldName: 'status',
        oldValue: null, // null 表示新创建的 KOL
        createdAt: { gte: timeStart },
      },
    });

    // 如果历史记录没有数据，回退到原有逻辑
    const newKolsThisWeek = newKolsFromHistory > 0 ? newKolsFromHistory : await prisma.kOL.count({
      where: {
        userId,
        createdAt: { gte: timeStart },
      },
    });

    // 3. 时间范围内联系数 - 统计时间范围内状态变为联系状态的 KOL
    const nonNewStatuses = ['contacted', 'replied', 'negotiating', 'cooperating', 'cooperated', 'rejected'];
    const responseStatuses = ['replied', 'negotiating', 'cooperating', 'cooperated', 'rejected'];

    // 优先从历史记录中查询状态变更
    const contactedFromHistory = await prisma.kOLHistory.count({
      where: {
        userId,
        fieldName: 'status',
        newValue: { in: nonNewStatuses.map(s => JSON.stringify(s)) },
        createdAt: { gte: timeStart },
      },
    });

    // 如果历史记录没有数据，回退到原有逻辑
    const contactedThisWeek = contactedFromHistory > 0 ? contactedFromHistory : await prisma.kOL.count({
      where: {
        userId,
        status: { in: nonNewStatuses },
        updatedAt: { gte: timeStart },
      },
    });

    // 4. 总体响应率 - (已回复+洽谈中+合作中+已合作+已拒绝) / 除新增外的所有 6 个状态
    // 响应状态: replied, negotiating, cooperating, cooperated, rejected (不包括 contacted)

    const totalContacts = await prisma.kOL.count({
      where: {
        userId,
        status: { in: nonNewStatuses },
      },
    });

    // 响应数 = 已回复+洽谈中+合作中+已合作+已拒绝（5个状态）
    const totalResponses = await prisma.kOL.count({
      where: {
        userId,
        status: { in: responseStatuses },
      },
    });

    const overallResponseRate = totalContacts > 0
      ? Math.round((totalResponses / totalContacts) * 100 * 10) / 10  // 保留一位小数
      : 0;

    // 5. 时间范围内响应率 - 时间范围内的响应数 / 时间范围内的联系数
    // 优先从历史记录中查询
    const weeklyContactsFromHistory = await prisma.kOLHistory.count({
      where: {
        userId,
        fieldName: 'status',
        newValue: { in: nonNewStatuses.map(s => JSON.stringify(s)) },
        createdAt: { gte: timeStart },
      },
    });

    const weeklyResponsesFromHistory = await prisma.kOLHistory.count({
      where: {
        userId,
        fieldName: 'status',
        newValue: { in: responseStatuses.map(s => JSON.stringify(s)) },
        createdAt: { gte: timeStart },
      },
    });

    // 如果历史记录有数据，使用历史记录；否则回退到原有逻辑
    let weeklyContacts: number;
    let weeklyResponses: number;

    if (weeklyContactsFromHistory > 0) {
      weeklyContacts = weeklyContactsFromHistory;
      weeklyResponses = weeklyResponsesFromHistory;
    } else {
      weeklyContacts = await prisma.kOL.count({
        where: {
          userId,
          status: { in: nonNewStatuses },
          updatedAt: { gte: timeStart },
        },
      });

      weeklyResponses = await prisma.kOL.count({
        where: {
          userId,
          status: { in: responseStatuses },
          updatedAt: { gte: timeStart },
        },
      });
    }

    const weeklyResponseRate = weeklyContacts > 0
      ? Math.round((weeklyResponses / weeklyContacts) * 100 * 10) / 10
      : 0;

    // 6. 活跃合作数 - 合作中状态的 KOL 数量
    const activePartnerships = await prisma.kOL.count({
      where: {
        userId,
        status: 'cooperating',
      },
    });

    // 7. 待跟进数 - 已回复状态的 KOL 数量
    const pendingFollowups = await prisma.kOL.count({
      where: {
        userId,
        status: 'replied',
      },
    });

    // 8. 总模板数
    const totalTemplates = await prisma.template.count({
      where: { userId },
    });

    const stats: OverviewStats = {
      totalKols,
      totalTemplates,
      totalContacts,
      activePartnerships,
      newKolsThisWeek,
      contactedThisWeek,
      overallResponseRate,
      weeklyResponseRate,
      pendingFollowups,
    };

    logger.info(`用户 ${userId} 概览统计获取成功`);
    return stats;
  }

  /**
   * 获取 KOL 分布数据
   * @param userId - 用户 ID
   * @returns KOL 分布
   */
  async getKOLDistributions(userId: number): Promise<KOLDistributions> {
    logger.info(`用户 ${userId} 获取 KOL 分布数据`);

    // 1. 按粉丝数分布
    const kols = await prisma.kOL.findMany({
      where: { userId },
      select: { followerCount: true, qualityScore: true, contentCategory: true, status: true, language: true },
    });

    // 粉丝数分布统计
    const followerRanges: Record<string, number> = {
      '0-1k': 0,
      '1k-10k': 0,
      '10k-50k': 0,
      '50k-100k': 0,
      '100k-500k': 0,
      '500k以上': 0,
    };

    // 质量分分布统计
    const qualityLevels = {
      '高质量': 0,
      '良好': 0,
      '一般': 0,
      '较差': 0,
    };

    // 内容分类分布统计
    const categoryMap: Record<string, number> = {};

    // 状态分布统计
    const statusMap: Record<string, number> = {};

    // 语言分布统计
    const languageMap: Record<string, number> = {};

    kols.forEach((kol) => {
      // 粉丝数统计
      const followers = kol.followerCount || 0;
      if (followers < 1000) {
        followerRanges['0-1k']++;
      } else if (followers >= 1000 && followers < 10000) {
        followerRanges['1k-10k']++;
      } else if (followers >= 10000 && followers < 50000) {
        followerRanges['10k-50k']++;
      } else if (followers >= 50000 && followers < 100000) {
        followerRanges['50k-100k']++;
      } else if (followers >= 100000 && followers < 500000) {
        followerRanges['100k-500k']++;
      } else {
        followerRanges['500k以上']++;
      }

      // 质量分统计
      const score = kol.qualityScore || 0;
      if (score >= 85) {
        qualityLevels['高质量']++;
      } else if (score >= 75) {
        qualityLevels['良好']++;
      } else if (score >= 65) {
        qualityLevels['一般']++;
      } else {
        qualityLevels['较差']++;
      }

      // 内容分类统计
      const category = kol.contentCategory || 'unknown';
      categoryMap[category] = (categoryMap[category] || 0) + 1;

      // 状态统计
      const status = kol.status || 'new';
      statusMap[status] = (statusMap[status] || 0) + 1;

      // 语言统计
      const language = kol.language || 'en';
      languageMap[language] = (languageMap[language] || 0) + 1;
    });

    const distributions: KOLDistributions = {
      byFollowerCount: Object.entries(followerRanges).map(([range, count]) => ({
        range,
        count,
      })),
      byQualityScore: Object.entries(qualityLevels).map(([level, count]) => ({
        level,
        count,
      })),
      byContentCategory: Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
      })),
      byStatus: Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      })),
      byLanguage: Object.entries(languageMap).map(([language, count]) => ({
        language,
        count,
      })),
    };

    logger.info(`用户 ${userId} KOL 分布数据获取成功`);
    return distributions;
  }

  /**
   * 获取模板分类统计
   * @param userId - 用户 ID
   * @returns 模板分类统计列表
   */
  async getTemplateEffectiveness(userId: number): Promise<TemplateEffectiveness[]> {
    logger.info(`用户 ${userId} 获取模板分类统计`);

    const templates = await prisma.template.findMany({
      where: { userId },
      select: {
        category: true,
      },
    });

    // 初始化所有分类为 0
    const categoryMap: Record<string, number> = {
      'initial': 0,
      'followup': 0,
      'negotiation': 0,
      'collaboration': 0,
      'maintenance': 0,
    };

    // 统计各分类的数量
    templates.forEach((template) => {
      const category = template.category || 'unknown';
      if (category in categoryMap) {
        categoryMap[category]++;
      }
    });

    // 转换为数组格式，返回所有分类（包括数量为0的）
    const effectiveness: TemplateEffectiveness[] = Object.entries(categoryMap).map(([category, count]) => ({
      id: 0, // 不需要ID
      name: '', // 不需要名称
      category,
      useCount: count, // 使用 useCount 字段存储数量
      responseCount: 0, // 不需要
      responseRate: 0, // 不需要
      avgResponseTime: null, // 不需要
    }));

    logger.info(`用户 ${userId} 模板分类统计获取成功，共 ${effectiveness.length} 个分类`);
    return effectiveness;
  }

  /**
   * 获取 KOL 状态变更时间线数据
   * @param userId - 用户 ID
   * @param days - 查询天数（默认 7 天）
   * @returns 时间线数据
   */
  async getContactTimeline(userId: number, days: number = 7): Promise<ContactTimelinePoint[]> {
    logger.info(`用户 ${userId} 获取状态变更时间线（${days} 天）`);

    // 使用 UTC 日期计算，确保跨时区一致性
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 计算起始日期（days 天前，包含今天共 days 天）
    const startDate = new Date(todayStr);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    // 响应状态列表
    const responseStatuses = ['replied', 'negotiating', 'cooperating', 'cooperated', 'rejected'];

    // 从 KOLHistory 表获取状态变更记录
    const historyRecords = await prisma.kOLHistory.findMany({
      where: {
        userId,
        fieldName: 'status',
        createdAt: { gte: startDate },
      },
      select: {
        oldValue: true,
        newValue: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 按日期分组统计
    const dateMap: Record<string, { newKols: number; statusChanges: number; responses: number }> = {};

    // 初始化所有日期（从 startDate 到今天，共 days 天）
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = { newKols: 0, statusChanges: 0, responses: 0 };
    }

    // 统计各类数据
    historyRecords.forEach((record) => {
      const dateStr = new Date(record.createdAt).toISOString().split('T')[0];
      if (!dateMap[dateStr]) return;

      // 新增 KOL（oldValue 为 null 表示新创建）
      if (record.oldValue === null) {
        dateMap[dateStr].newKols++;
      }

      // 状态变更（所有状态变化都计入）
      dateMap[dateStr].statusChanges++;

      // 响应数：从"已联系"状态变为其他响应状态（已回复/洽谈中/合作中/已合作/已拒绝）
      // 解析 oldValue 和 newValue
      let oldStatus: string | null = null;
      let newStatus: string | null = null;

      if (record.oldValue) {
        try {
          oldStatus = JSON.parse(record.oldValue);
        } catch {
          oldStatus = record.oldValue;
        }
      }

      if (record.newValue) {
        try {
          newStatus = JSON.parse(record.newValue);
        } catch {
          newStatus = record.newValue;
        }
      }

      // 从"已联系"变为响应状态才计入响应数
      if (oldStatus === 'contacted' && newStatus && responseStatuses.includes(newStatus)) {
        dateMap[dateStr].responses++;
      }
    });

    // 转换为数组
    const timeline: ContactTimelinePoint[] = Object.entries(dateMap).map(([date, data]) => ({
      date,
      newKols: data.newKols,
      statusChanges: data.statusChanges,
      responses: data.responses,
    }));

    logger.info(`用户 ${userId} 状态变更时间线获取成功，共 ${timeline.length} 个数据点`);
    return timeline;
  }
}

// 导出服务实例
export const analyticsService = new AnalyticsService();
