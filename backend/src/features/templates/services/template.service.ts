/**
 * 模板服务 - 业务逻辑层
 */

import { prisma } from '@database/client';
import { logger } from '@config/logger.config';
import { BadRequestError, NotFoundError } from '@common/errors/app-error';
import { CreateTemplateDTO } from '../dto/create-template.dto';
import { UpdateTemplateDTO } from '../dto/update-template.dto';
import { TemplateQueryDTO } from '../dto/template-query.dto';
import { PreviewTemplateDTO } from '../dto/preview-template.dto';

/**
 * 模板列表响应接口
 */
export interface TemplateListResponse {
  templates: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 模板预览响应接口
 */
export interface TemplatePreviewResponse {
  originalContent: string;
  previewContent: string;
  variables: Record<string, string>;
}

/**
 * 模板服务类
 */
export class TemplateService {
  /**
   * 创建模板
   * @param userId - 用户 ID
   * @param createDto - 创建数据
   * @returns 创建的模板
   */
  async createTemplate(userId: number, createDto: CreateTemplateDTO) {
    logger.info(`用户 ${userId} 开始创建模板: ${createDto.name}`);

    try {
      const template = await prisma.template.create({
        data: {
          userId,
          name: createDto.name,
          category: createDto.category,
          content: createDto.content,
          language: createDto.language || 'en',
          aiGenerated: createDto.aiGenerated || false,
        },
        select: {
          id: true,
          name: true,
          category: true,
          content: true,
          language: true,
          aiGenerated: true,
          useCount: true,
          successCount: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`模板创建成功: ${template.id} - ${template.name}`);
      return template;
    } catch (error: any) {
      logger.error('创建模板失败:', error);
      throw error;
    }
  }

  /**
   * 获取模板列表（分页、搜索、筛选、排序）
   * @param userId - 用户 ID
   * @param query - 查询参数
   * @returns 模板列表和分页信息
   */
  async getTemplates(userId: number, query: TemplateQueryDTO): Promise<TemplateListResponse> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // 1. 构建查询条件
    const where: any = {
      userId, // 用户数据隔离
    };

    // 搜索条件（模板名称或内容）
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 分类筛选
    if (query.category) {
      where.category = query.category;
    }

    // 语言筛选
    if (query.language) {
      where.language = query.language;
    }

    // AI 生成筛选
    if (query.aiGenerated !== undefined) {
      where.aiGenerated = query.aiGenerated;
    }

    // 2. 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 3. 查询数据和总数
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          category: true,
          content: true,
          language: true,
          aiGenerated: true,
          useCount: true,
          successCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.template.count({ where }),
    ]);

    logger.info(`用户 ${userId} 查询模板列表: 第 ${page} 页, 共 ${total} 条`);

    return {
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 根据 ID 获取模板详情
   * @param userId - 用户 ID
   * @param templateId - 模板 ID
   * @returns 模板详情
   * @throws NotFoundError - 模板不存在
   */
  async getTemplateById(userId: number, templateId: number) {
    logger.info(`用户 ${userId} 查询模板详情: ${templateId}`);

    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        userId, // 确保用户只能访问自己的模板
      },
      select: {
        id: true,
        name: true,
        category: true,
        content: true,
        language: true,
        aiGenerated: true,
        useCount: true,
        successCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!template) {
      logger.warn(`模板 ${templateId} 不存在或无权访问`);
      throw new NotFoundError('模板不存在');
    }

    return template;
  }

  /**
   * 更新模板
   * @param userId - 用户 ID
   * @param templateId - 模板 ID
   * @param updateDto - 更新数据
   * @returns 更新后的模板
   * @throws NotFoundError - 模板不存在
   */
  async updateTemplate(userId: number, templateId: number, updateDto: UpdateTemplateDTO) {
    logger.info(`用户 ${userId} 更新模板: ${templateId}`);

    // 1. 检查模板是否存在且属于该用户
    const existing = await prisma.template.findFirst({
      where: {
        id: templateId,
        userId,
      },
    });

    if (!existing) {
      logger.warn(`模板 ${templateId} 不存在或无权访问`);
      throw new NotFoundError('模板不存在');
    }

    // 2. 更新模板
    const template = await prisma.template.update({
      where: { id: templateId },
      data: updateDto,
      select: {
        id: true,
        name: true,
        category: true,
        content: true,
        language: true,
        aiGenerated: true,
        useCount: true,
        successCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`模板更新成功: ${template.id} - ${template.name}`);
    return template;
  }

  /**
   * 删除模板
   * @param userId - 用户 ID
   * @param templateId - 模板 ID
   * @throws NotFoundError - 模板不存在
   */
  async deleteTemplate(userId: number, templateId: number): Promise<void> {
    logger.info(`用户 ${userId} 删除模板: ${templateId}`);

    // 1. 检查模板是否存在且属于该用户
    const existing = await prisma.template.findFirst({
      where: {
        id: templateId,
        userId,
      },
    });

    if (!existing) {
      logger.warn(`模板 ${templateId} 不存在或无权访问`);
      throw new NotFoundError('模板不存在');
    }

    // 2. 删除模板（Prisma 会自动级联删除相关数据）
    await prisma.template.delete({
      where: { id: templateId },
    });

    logger.info(`模板删除成功: ${templateId}`);
  }

  /**
   * 预览模板（变量替换）
   * @param userId - 用户 ID
   * @param previewDto - 预览数据
   * @returns 预览结果
   */
  async previewTemplate(userId: number, previewDto: PreviewTemplateDTO): Promise<TemplatePreviewResponse> {
    logger.info(`用户 ${userId} 预览模板`);

    try {
      let templateContent = previewDto.content;

      // 如果提供了 templateId，获取模板内容
      if (previewDto.templateId) {
        const template = await this.getTemplateById(userId, previewDto.templateId);
        templateContent = template.content;
      }

      // 构建变量映射
      const variables: Record<string, string> = {};

      // 添加用户变量
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          fullName: true,
          email: true,
        },
      });

      if (user) {
        variables['{{my_name}}'] = user.fullName;
        variables['{{my_email}}'] = user.email;
        variables['{{exchange_name}}'] = 'KCEX';
      }

      // 添加系统变量
      const today = new Date();
      variables['{{today}}'] = today.toISOString().split('T')[0];
      variables['{{today_cn}}'] = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

      // 如果提供了 kolId，添加 KOL 变量
      if (previewDto.kolId) {
        const kol = await prisma.kOL.findFirst({
          where: {
            id: previewDto.kolId,
            userId,
          },
          select: {
            username: true,
            displayName: true,
            followerCount: true,
            bio: true,
          },
        });

        if (kol) {
          variables['{{username}}'] = kol.username;
          variables['{{display_name}}'] = kol.displayName;
          variables['{{follower_count}}'] = kol.followerCount.toLocaleString();
          variables['{{bio}}'] = kol.bio || '';
          variables['{{profile_url}}'] = `https://twitter.com/${kol.username}`;
        }
      }

      // 替换变量
      const previewContent = this.replaceVariables(templateContent, variables);

      logger.info('模板预览生成成功');

      return {
        originalContent: templateContent,
        previewContent,
        variables,
      };
    } catch (error: any) {
      logger.error('预览模板失败:', error);
      throw error;
    }
  }

  /**
   * 替换模板中的变量
   * @param template - 模板内容
   * @param variables - 变量映射
   * @returns 替换后的内容
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      // 转义正则特殊字符
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, value || '');
    }

    return result;
  }

  /**
   * 提取模板中的变量
   * @param template - 模板内容
   * @returns 变量列表
   */
  extractVariables(template: string): string[] {
    const regex = /\{\{([a-z_][a-z0-9_]*)\}\}/g;
    const matches = template.matchAll(regex);
    const variables = Array.from(matches, (match) => `{{${match[1]}}}`);
    return Array.from(new Set(variables)); // 去重
  }
}

// 导出服务实例
export const templateService = new TemplateService();
