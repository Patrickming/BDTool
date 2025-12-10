/**
 * KOL 服务 - 业务逻辑层
 */

import { prisma } from '@database/client';
import { logger } from '@config/logger.config';
import { BadRequestError, NotFoundError } from '@common/errors/app-error';
import { CreateKOLDTO, parseTwitterUsername } from '../dto/create-kol.dto';
import { UpdateKOLDTO } from '../dto/update-kol.dto';
import { KOLQueryDTO } from '../dto/kol-query.dto';
import { recordKOLChanges, compareKOLData, KOL_TRACKED_FIELDS } from './kol-history.service';

/**
 * KOL 列表响应接口
 */
export interface KOLListResponse {
  kols: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 批量导入结果接口
 */
export interface BatchImportResult {
  success: number;      // 成功导入数量
  failed: number;       // 失败数量
  duplicate: number;    // 重复数量
  errors: string[];     // 错误信息列表
  imported: any[];      // 成功导入的 KOL 列表
}

/**
 * KOL 服务类
 */
export class KOLService {
  /**
   * 创建单个 KOL
   * @param userId - 用户 ID
   * @param createDto - 创建数据
   * @returns 创建的 KOL
   * @throws BadRequestError - 用户名已存在
   */
  async createKOL(userId: number, createDto: CreateKOLDTO) {
    logger.info(`用户 ${userId} 开始创建 KOL: ${createDto.username}`);

    // 1. 检查用户名是否已存在（同一用户下）
    const existing = await prisma.kOL.findFirst({
      where: {
        userId,
        username: createDto.username,
      },
    });

    if (existing) {
      logger.warn(`创建失败: KOL @${createDto.username} 已存在`);
      throw new BadRequestError(`KOL @${createDto.username} 已存在`);
    }

    // 2. 处理日期字段（将 ISO 字符串转换为 Date 对象）
    const data: any = {
      userId,
      username: createDto.username,
      displayName: createDto.displayName,
      twitterId: createDto.twitterId,
      bio: createDto.bio,
      followerCount: createDto.followerCount ?? 0,
      followingCount: createDto.followingCount ?? 0,
      verified: createDto.verified ?? false,
      profileImgUrl: createDto.profileImgUrl,
      language: createDto.language,
      qualityScore: createDto.qualityScore ?? 0,  // 明确处理质量分
      contentCategory: createDto.contentCategory ?? 'unknown',
      status: createDto.status ?? 'new',
      customNotes: createDto.customNotes,
    };

    if (createDto.lastTweetDate) {
      data.lastTweetDate = new Date(createDto.lastTweetDate);
    }

    if (createDto.accountCreated) {
      data.accountCreated = new Date(createDto.accountCreated);
    }

    logger.info(`准备插入的 qualityScore: ${data.qualityScore} (类型: ${typeof data.qualityScore})`);

    // 3. 创建 KOL
    const kol = await prisma.kOL.create({
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        verified: true,
        profileImgUrl: true,
        language: true,
        lastTweetDate: true,
        accountCreated: true,
        qualityScore: true,
        contentCategory: true,
        status: true,
        customNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 4. 记录初始状态到历史（用于追踪 KOL 创建）
    await recordKOLChanges(kol.id, userId, [
      { fieldName: 'status', oldValue: null, newValue: kol.status },
    ]);

    logger.info(`KOL 创建成功: ${kol.id} - @${kol.username}`);
    return kol;
  }

  /**
   * 批量导入 KOL
   * @param userId - 用户 ID
   * @param inputs - 输入列表（支持 @username、username、URL）
   * @returns 导入结果
   */
  async batchImportKOLs(userId: number, inputs: string[]): Promise<BatchImportResult> {
    logger.info(`用户 ${userId} 开始批量导入 ${inputs.length} 个 KOL`);

    const result: BatchImportResult = {
      success: 0,
      failed: 0,
      duplicate: 0,
      errors: [],
      imported: [],
    };

    // 1. 解析所有输入，提取用户名
    const usernames: string[] = [];
    for (const input of inputs) {
      const username = parseTwitterUsername(input);
      if (username) {
        usernames.push(username);
      } else {
        result.failed++;
        result.errors.push(`无法解析: ${input}`);
      }
    }

    // 2. 去重
    const uniqueUsernames = Array.from(new Set(usernames));

    // 3. 检查已存在的 KOL
    const existing = await prisma.kOL.findMany({
      where: {
        userId,
        username: {
          in: uniqueUsernames,
        },
      },
      select: {
        username: true,
      },
    });

    const existingUsernames = new Set(existing.map((k) => k.username));

    // 4. 过滤出需要导入的用户名
    const toImport = uniqueUsernames.filter((u) => !existingUsernames.has(u));
    result.duplicate = existingUsernames.size;

    // 5. 批量创建 KOL
    const createPromises = toImport.map(async (username) => {
      try {
        const kol = await prisma.kOL.create({
          data: {
            userId,
            username,
            displayName: username, // 默认使用用户名作为显示名
            status: 'new',
            contentCategory: 'unknown',
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            status: true,
            createdAt: true,
          },
        });

        result.success++;
        result.imported.push(kol);
        return kol;
      } catch (error: any) {
        result.failed++;
        result.errors.push(`创建 @${username} 失败: ${error.message}`);
        logger.error(`创建 KOL @${username} 失败:`, error);
        return null;
      }
    });

    await Promise.all(createPromises);

    logger.info(
      `批量导入完成: 成功 ${result.success}, 失败 ${result.failed}, 重复 ${result.duplicate}`,
    );

    return result;
  }

  /**
   * 获取 KOL 列表（分页、搜索、筛选、排序）
   * @param userId - 用户 ID
   * @param query - 查询参数
   * @returns KOL 列表和分页信息
   */
  async getKOLList(userId: number, query: KOLQueryDTO): Promise<KOLListResponse> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // 1. 构建查询条件
    const where: any = {
      userId, // 用户数据隔离
    };

    // 搜索条件（用户名或显示名）
    if (search) {
      // 去掉开头的 @ 符号（如果有的话）
      const searchTerm = search.startsWith('@') ? search.slice(1) : search;

      where.OR = [
        { username: { contains: searchTerm } },
        { displayName: { contains: searchTerm } },
      ];
    }

    // 状态筛选
    if (query.status) {
      where.status = query.status;
    }

    // 内容分类筛选
    if (query.contentCategory) {
      where.contentCategory = query.contentCategory;
    }

    // 质量等级筛选（多选）
    if (query.qualityLevels && query.qualityLevels.length > 0) {
      // 根据质量等级转换为质量分范围
      const qualityRanges: { gte?: number; lte?: number }[] = [];

      query.qualityLevels.forEach((level: string) => {
        switch (level) {
          case '高质量':
            qualityRanges.push({ gte: 85 });
            break;
          case '优秀':
            qualityRanges.push({ gte: 80, lte: 84 });
            break;
          case '良好':
            qualityRanges.push({ gte: 75, lte: 79 });
            break;
          case '一般':
            qualityRanges.push({ gte: 65, lte: 74 });
            break;
          case '较差':
            qualityRanges.push({ lte: 64 });
            break;
        }
      });

      // 使用 OR 条件组合多个质量等级
      if (qualityRanges.length > 0) {
        where.OR = where.OR || [];
        qualityRanges.forEach(range => {
          const condition: any = { qualityScore: {} };
          if (range.gte !== undefined) condition.qualityScore.gte = range.gte;
          if (range.lte !== undefined) condition.qualityScore.lte = range.lte;
          where.OR.push(condition);
        });
      }
    }
    // 质量分范围筛选（如果没有质量等级筛选，才使用范围筛选）
    else if (query.minQualityScore !== undefined || query.maxQualityScore !== undefined) {
      where.qualityScore = {};
      if (query.minQualityScore !== undefined) {
        where.qualityScore.gte = query.minQualityScore;
      }
      if (query.maxQualityScore !== undefined) {
        where.qualityScore.lte = query.maxQualityScore;
      }
    }

    // 粉丝数范围筛选
    if (query.minFollowerCount !== undefined || query.maxFollowerCount !== undefined) {
      where.followerCount = {};
      if (query.minFollowerCount !== undefined) {
        where.followerCount.gte = query.minFollowerCount;
      }
      if (query.maxFollowerCount !== undefined) {
        where.followerCount.lte = query.maxFollowerCount;
      }
    }

    // 认证状态筛选
    if (query.verified !== undefined) {
      where.verified = query.verified;
    }

    // 2. 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 3. 查询数据和总数
    const [kols, total] = await Promise.all([
      prisma.kOL.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          followerCount: true,
          followingCount: true,
          verified: true,
          profileImgUrl: true,
          language: true,
          lastTweetDate: true,
          accountCreated: true,
          qualityScore: true,
          contentCategory: true,
          status: true,
          customNotes: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.kOL.count({ where }),
    ]);

    logger.info(`用户 ${userId} 查询 KOL 列表: 第 ${page} 页, 共 ${total} 条`);

    return {
      kols,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 根据 ID 获取 KOL 详情
   * @param userId - 用户 ID
   * @param kolId - KOL ID
   * @returns KOL 详情
   * @throws NotFoundError - KOL 不存在
   */
  async getKOLById(userId: number, kolId: number) {
    logger.info(`用户 ${userId} 查询 KOL 详情: ${kolId}`);

    const kol = await prisma.kOL.findFirst({
      where: {
        id: kolId,
        userId, // 确保用户只能访问自己的 KOL
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        twitterId: true,
        followerCount: true,
        followingCount: true,
        verified: true,
        profileImgUrl: true,
        language: true,
        lastTweetDate: true,
        accountCreated: true,
        qualityScore: true,
        contentCategory: true,
        status: true,
        customNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!kol) {
      logger.warn(`KOL ${kolId} 不存在或无权访问`);
      throw new NotFoundError('KOL 不存在');
    }

    return kol;
  }

  /**
   * 更新 KOL 信息
   * @param userId - 用户 ID
   * @param kolId - KOL ID
   * @param updateDto - 更新数据
   * @returns 更新后的 KOL
   * @throws NotFoundError - KOL 不存在
   */
  async updateKOL(userId: number, kolId: number, updateDto: UpdateKOLDTO) {
    logger.info(`用户 ${userId} 更新 KOL: ${kolId}`);

    // 1. 检查 KOL 是否存在且属于该用户
    const existing = await prisma.kOL.findFirst({
      where: {
        id: kolId,
        userId,
      },
    });

    if (!existing) {
      logger.warn(`KOL ${kolId} 不存在或无权访问`);
      throw new NotFoundError('KOL 不存在');
    }

    // 2. 处理日期字段
    const data: any = { ...updateDto };

    if (updateDto.lastTweetDate) {
      data.lastTweetDate = new Date(updateDto.lastTweetDate);
    }

    if (updateDto.accountCreated) {
      data.accountCreated = new Date(updateDto.accountCreated);
    }

    // 3. 比较变更并记录历史
    const changes = compareKOLData(existing as Record<string, unknown>, data, KOL_TRACKED_FIELDS);
    if (changes.length > 0) {
      await recordKOLChanges(kolId, userId, changes);
    }

    // 4. 更新 KOL
    const kol = await prisma.kOL.update({
      where: { id: kolId },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        verified: true,
        profileImgUrl: true,
        language: true,
        lastTweetDate: true,
        accountCreated: true,
        qualityScore: true,
        contentCategory: true,
        status: true,
        customNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`KOL 更新成功: ${kol.id} - @${kol.username}, 记录了 ${changes.length} 个字段变更`);
    return kol;
  }

  /**
   * 删除 KOL
   * @param userId - 用户 ID
   * @param kolId - KOL ID
   * @throws NotFoundError - KOL 不存在
   */
  async deleteKOL(userId: number, kolId: number): Promise<void> {
    logger.info(`用户 ${userId} 删除 KOL: ${kolId}`);

    // 1. 检查 KOL 是否存在且属于该用户
    const existing = await prisma.kOL.findFirst({
      where: {
        id: kolId,
        userId,
      },
    });

    if (!existing) {
      logger.warn(`KOL ${kolId} 不存在或无权访问`);
      throw new NotFoundError('KOL 不存在');
    }

    // 2. 删除 KOL（Prisma 会自动级联删除相关数据）
    await prisma.kOL.delete({
      where: { id: kolId },
    });

    logger.info(`KOL 删除成功: ${kolId}`);
  }
}

// 导出服务实例
export const kolService = new KOLService();
