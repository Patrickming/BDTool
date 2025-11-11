/**
 * 模板控制器 - HTTP 请求处理层
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@common/utils/async-handler';
import { successResponse } from '@common/utils/api-response';
import { ValidationError } from '@common/errors/app-error';
import { createTemplateSchema } from '../dto/create-template.dto';
import { updateTemplateSchema } from '../dto/update-template.dto';
import { templateQuerySchema } from '../dto/template-query.dto';
import { previewTemplateSchema } from '../dto/preview-template.dto';
import { templateService } from '../services/template.service';
import { logger } from '@config/logger.config';

/**
 * 模板控制器类
 */
export class TemplateController {
  /**
   * 创建模板
   * POST /api/v1/templates
   */
  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求创建模板`);

    // 1. 验证请求数据
    const validationResult = createTemplateSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('模板数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层创建模板
    const template = await templateService.createTemplate(req.user!.id, validationResult.data);

    // 3. 返回成功响应
    return successResponse(res, template, '模板创建成功', 201);
  });

  /**
   * 获取模板列表
   * GET /api/v1/templates
   */
  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求模板列表`);

    // 1. 验证查询参数
    const validationResult = templateQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      logger.warn('查询参数验证失败', validationResult.error.errors);
      throw new ValidationError('查询参数验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层获取列表
    const result = await templateService.getTemplates(req.user!.id, validationResult.data);

    // 3. 返回列表数据
    return successResponse(res, result, '获取模板列表成功');
  });

  /**
   * 获取模板详情
   * GET /api/v1/templates/:id
   */
  getTemplateById = asyncHandler(async (req: Request, res: Response) => {
    const templateId = parseInt(req.params.id);

    logger.info(`用户 ${req.user?.id} 请求模板详情: ${templateId}`);

    // 1. 验证 ID
    if (isNaN(templateId)) {
      throw new ValidationError('无效的模板 ID');
    }

    // 2. 调用服务层获取详情
    const template = await templateService.getTemplateById(req.user!.id, templateId);

    // 3. 返回详情数据
    return successResponse(res, template, '获取模板详情成功');
  });

  /**
   * 更新模板
   * PUT /api/v1/templates/:id
   */
  updateTemplate = asyncHandler(async (req: Request, res: Response) => {
    const templateId = parseInt(req.params.id);

    logger.info(`用户 ${req.user?.id} 请求更新模板: ${templateId}`);

    // 1. 验证 ID
    if (isNaN(templateId)) {
      throw new ValidationError('无效的模板 ID');
    }

    // 2. 验证请求数据
    const validationResult = updateTemplateSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('模板更新数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 3. 调用服务层更新
    const template = await templateService.updateTemplate(req.user!.id, templateId, validationResult.data);

    // 4. 返回更新后的数据
    return successResponse(res, template, '模板更新成功');
  });

  /**
   * 删除模板
   * DELETE /api/v1/templates/:id
   */
  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    const templateId = parseInt(req.params.id);

    logger.info(`用户 ${req.user?.id} 请求删除模板: ${templateId}`);

    // 1. 验证 ID
    if (isNaN(templateId)) {
      throw new ValidationError('无效的模板 ID');
    }

    // 2. 调用服务层删除
    await templateService.deleteTemplate(req.user!.id, templateId);

    // 3. 返回成功响应
    return successResponse(res, null, '模板删除成功');
  });

  /**
   * 预览模板
   * POST /api/v1/templates/preview
   */
  previewTemplate = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求预览模板`);

    // 1. 验证请求数据
    const validationResult = previewTemplateSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('预览数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层生成预览
    const preview = await templateService.previewTemplate(req.user!.id, validationResult.data);

    // 3. 返回预览结果
    return successResponse(res, preview, '模板预览生成成功');
  });

  /**
   * 调整模板顺序
   * POST /api/v1/templates/:id/reorder
   */
  reorderTemplate = asyncHandler(async (req: Request, res: Response) => {
    const templateId = parseInt(req.params.id);
    const { direction } = req.body;

    logger.info(`用户 ${req.user?.id} 请求调整模板顺序: ${templateId}, 方向: ${direction}`);

    // 1. 验证 ID
    if (isNaN(templateId)) {
      throw new ValidationError('无效的模板 ID');
    }

    // 2. 验证方向
    if (direction !== 'up' && direction !== 'down') {
      throw new ValidationError('方向只能是 up 或 down');
    }

    // 3. 调用服务层调整顺序
    await templateService.reorderTemplate(req.user!.id, templateId, direction);

    // 4. 返回成功响应
    return successResponse(res, null, '模板顺序调整成功');
  });
}

// 导出控制器实例
export const templateController = new TemplateController();
