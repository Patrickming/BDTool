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
  newKolsThisWeek: number;        // 本周新增 KOL 数
  contactedThisWeek: number;      // 本周联系数
  overallResponseRate: number;    // 总体响应率 (%)
  weeklyResponseRate: number;     // 本周响应率 (%)
  activePartnerships: number;     // 活跃合作数
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
 * 联系时间线数据点接口
 */
export interface ContactTimelinePoint {
  date: string;                  // 日期 (YYYY-MM-DD)
  contactsCount: number;         // 联系数
  responsesCount: number;        // 响应数
}

/**
 * 分析统计服务类
 */
export class AnalyticsService {
  /**
   * 获取概览统计数据
   * @param userId - 用户 ID
   * @returns 概览统计
   */
  async getOverviewStats(userId: number): Promise<OverviewStats> {
    logger.info(`用户 ${userId} 获取概览统计`);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // 1. 总 KOL 数
    const totalKols = await prisma.kOL.count({
      where: { userId },
    });

    // 2. 本周新增 KOL 数
    const newKolsThisWeek = await prisma.kOL.count({
      where: {
        userId,
        createdAt: { gte: weekStart },
      },
    });

    // 3. 本周联系数 - 基于 KOL 状态 'contacted' 且在本周内更新的
    const contactedThisWeek = await prisma.kOL.count({
      where: {
        userId,
        status: 'contacted',
        updatedAt: { gte: weekStart },
      },
    });

    // 4. 总体响应率 - (已回复 + 协商中 + 合作中) / 总联系数
    // 总联系数 = 所有非 'new' 状态的 KOL
    const totalContacts = await prisma.kOL.count({
      where: {
        userId,
        status: { not: 'new' },
      },
    });

    // 响应数 = replied + negotiating + cooperating 状态的 KOL
    const totalResponses = await prisma.kOL.count({
      where: {
        userId,
        status: { in: ['replied', 'negotiating', 'cooperating'] },
      },
    });

    const overallResponseRate = totalContacts > 0
      ? Math.round((totalResponses / totalContacts) * 100 * 10) / 10  // 保留一位小数
      : 0;

    // 5. 本周响应率 - 本周新增的响应 / 本周联系数
    const weeklyContacts = await prisma.kOL.count({
      where: {
        userId,
        status: 'contacted',
        updatedAt: { gte: weekStart },
      },
    });

    const weeklyResponses = await prisma.kOL.count({
      where: {
        userId,
        status: { in: ['replied', 'negotiating', 'cooperating'] },
        updatedAt: { gte: weekStart },
      },
    });

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

    const stats: OverviewStats = {
      totalKols,
      newKolsThisWeek,
      contactedThisWeek,
      overallResponseRate,
      weeklyResponseRate,
      activePartnerships,
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
      select: { followerCount: true, qualityScore: true, contentCategory: true, status: true },
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
    };

    logger.info(`用户 ${userId} KOL 分布数据获取成功`);
    return distributions;
  }

  /**
   * 获取模板效果统计
   * @param userId - 用户 ID
   * @returns 模板效果列表
   */
  async getTemplateEffectiveness(userId: number): Promise<TemplateEffectiveness[]> {
    logger.info(`用户 ${userId} 获取模板效果统计`);

    const templates = await prisma.template.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        category: true,
        useCount: true,
        successCount: true,
      },
    });

    const effectiveness: TemplateEffectiveness[] = [];

    for (const template of templates) {
      // 计算响应率
      const responseRate = template.useCount > 0
        ? Math.round((template.successCount / template.useCount) * 100 * 10) / 10
        : 0;

      // 计算平均响应时间（小时）
      const contacts = await prisma.contactLog.findMany({
        where: {
          userId,
          templateId: template.id,
          repliedAt: { not: null },
        },
        select: {
          sentAt: true,
          repliedAt: true,
        },
      });

      let avgResponseTime: number | null = null;
      if (contacts.length > 0) {
        const totalHours = contacts.reduce((sum, contact) => {
          const sentAt = new Date(contact.sentAt);
          const repliedAt = new Date(contact.repliedAt!);
          const diffMs = repliedAt.getTime() - sentAt.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          return sum + diffHours;
        }, 0);

        avgResponseTime = Math.round((totalHours / contacts.length) * 10) / 10;
      }

      effectiveness.push({
        id: template.id,
        name: template.name,
        category: template.category,
        useCount: template.useCount,
        responseCount: template.successCount,
        responseRate,
        avgResponseTime,
      });
    }

    // 按响应率降序排序
    effectiveness.sort((a, b) => b.responseRate - a.responseRate);

    logger.info(`用户 ${userId} 模板效果统计获取成功，共 ${effectiveness.length} 个模板`);
    return effectiveness;
  }

  /**
   * 获取联系时间线数据
   * @param userId - 用户 ID
   * @param days - 查询天数（默认 7 天）
   * @returns 时间线数据
   */
  async getContactTimeline(userId: number, days: number = 7): Promise<ContactTimelinePoint[]> {
    logger.info(`用户 ${userId} 获取联系时间线（${days} 天）`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 获取时间范围内的所有联系记录
    const contacts = await prisma.contactLog.findMany({
      where: {
        userId,
        sentAt: { gte: startDate },
      },
      select: {
        sentAt: true,
        repliedAt: true,
      },
      orderBy: { sentAt: 'asc' },
    });

    // 按日期分组统计
    const dateMap: Record<string, { contacts: number; responses: number }> = {};

    // 初始化所有日期
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = { contacts: 0, responses: 0 };
    }

    // 统计联系数
    contacts.forEach((contact) => {
      const dateStr = new Date(contact.sentAt).toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].contacts++;
      }
    });

    // 统计响应数
    contacts.forEach((contact) => {
      if (contact.repliedAt) {
        const dateStr = new Date(contact.repliedAt).toISOString().split('T')[0];
        if (dateMap[dateStr]) {
          dateMap[dateStr].responses++;
        }
      }
    });

    // 转换为数组
    const timeline: ContactTimelinePoint[] = Object.entries(dateMap).map(([date, data]) => ({
      date,
      contactsCount: data.contacts,
      responsesCount: data.responses,
    }));

    logger.info(`用户 ${userId} 联系时间线获取成功，共 ${timeline.length} 个数据点`);
    return timeline;
  }
}

// 导出服务实例
export const analyticsService = new AnalyticsService();
