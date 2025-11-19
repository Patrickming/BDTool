/**
 * KOL 控制器 - HTTP 请求处理层
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@common/utils/async-handler';
import { successResponse } from '@common/utils/api-response';
import { ValidationError } from '@common/errors/app-error';
import { createKOLSchema, batchImportSchema } from '../dto/create-kol.dto';
import { updateKOLSchema } from '../dto/update-kol.dto';
import { kolQuerySchema } from '../dto/kol-query.dto';
import { kolService } from '../services/kol.service';
import { getKOLHistory } from '../services/kol-history.service';
import { logger } from '@config/logger.config';

/**
 * KOL 控制器类
 */
export class KOLController {
  /**
   * 创建单个 KOL
   * POST /api/v1/kols
   */
  createKOL = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求创建 KOL`);

    // 1. 验证请求数据
    const validationResult = createKOLSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('KOL 数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层创建 KOL
    const kol = await kolService.createKOL(req.user!.id, validationResult.data);

    // 3. 返回成功响应
    return successResponse(res, kol, 'KOL 创建成功', 201);
  });

  /**
   * 批量导入 KOL
   * POST /api/v1/kols/batch/import
   */
  batchImportKOLs = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求批量导入 KOL`);

    // 1. 验证请求数据
    const validationResult = batchImportSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('批量导入数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层批量导入
    const result = await kolService.batchImportKOLs(req.user!.id, validationResult.data.inputs);

    // 3. 返回导入结果
    return successResponse(res, result, '批量导入完成', 200);
  });

  /**
   * 获取 KOL 列表（分页、搜索、筛选）
   * GET /api/v1/kols
   */
  getKOLList = asyncHandler(async (req: Request, res: Response) => {
    logger.info(`用户 ${req.user?.id} 请求 KOL 列表`);

    // 1. 验证查询参数
    const validationResult = kolQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      logger.warn('查询参数验证失败', validationResult.error.errors);
      throw new ValidationError('查询参数验证失败', validationResult.error.errors);
    }

    // 2. 调用服务层获取列表
    const result = await kolService.getKOLList(req.user!.id, validationResult.data);

    // 3. 返回列表数据
    return successResponse(res, result, '获取 KOL 列表成功');
  });

  /**
   * 获取 KOL 详情
   * GET /api/v1/kols/:id
   */
  getKOLById = asyncHandler(async (req: Request, res: Response) => {
    const kolId = parseInt(req.params.id);

    logger.info(`用户 ${req.user?.id} 请求 KOL 详情: ${kolId}`);

    // 1. 验证 ID
    if (isNaN(kolId)) {
      throw new ValidationError('无效的 KOL ID');
    }

    // 2. 调用服务层获取详情
    const kol = await kolService.getKOLById(req.user!.id, kolId);

    // 3. 返回详情数据
    return successResponse(res, kol, '获取 KOL 详情成功');
  });

  /**
   * 更新 KOL 信息
   * PUT /api/v1/kols/:id
   */
  updateKOL = asyncHandler(async (req: Request, res: Response) => {
    const kolId = parseInt(req.params.id);

    logger.info(`用户 ${req.user?.id} 请求更新 KOL: ${kolId}`);

    // 1. 验证 ID
    if (isNaN(kolId)) {
      throw new ValidationError('无效的 KOL ID');
    }

    // 2. 验证请求数据
    const validationResult = updateKOLSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('KOL 更新数据验证失败', validationResult.error.errors);
      throw new ValidationError('数据验证失败', validationResult.error.errors);
    }

    // 3. 调用服务层更新
    const kol = await kolService.updateKOL(req.user!.id, kolId, validationResult.data);

    // 4. 返回更新后的数据
    return successResponse(res, kol, 'KOL 更新成功');
  });

  /**
   * 删除 KOL
   * DELETE /api/v1/kols/:id
   */
  deleteKOL = asyncHandler(async (req: Request, res: Response) => {
    const kolId = parseInt(req.params.id);

    logger.info(`用户 ${req.user?.id} 请求删除 KOL: ${kolId}`);

    // 1. 验证 ID
    if (isNaN(kolId)) {
      throw new ValidationError('无效的 KOL ID');
    }

    // 2. 调用服务层删除
    await kolService.deleteKOL(req.user!.id, kolId);

    // 3. 返回成功响应
    return successResponse(res, null, 'KOL 删除成功');
  });

  /**
   * 获取 KOL 修改历史
   * GET /api/v1/kols/:id/history
   */
  getKOLHistory = asyncHandler(async (req: Request, res: Response) => {
    const kolId = parseInt(req.params.id);

    logger.info(`用户 ${req.user?.id} 请求 KOL 历史: ${kolId}`);

    // 1. 验证 ID
    if (isNaN(kolId)) {
      throw new ValidationError('无效的 KOL ID');
    }

    // 2. 验证 KOL 存在且属于该用户
    await kolService.getKOLById(req.user!.id, kolId);

    // 3. 获取历史记录
    const history = await getKOLHistory(kolId);

    // 4. 返回历史数据
    return successResponse(res, history, '获取 KOL 历史记录成功');
  });
}

// 导出控制器实例
export const kolController = new KOLController();
