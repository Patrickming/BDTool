/**
 * KOL 路由
 */

import { Router } from 'express';
import { kolController } from '../controllers/kol.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/v1/kols
 * 创建单个 KOL
 * 支持双认证（JWT + Extension Token）
 */
router.post('/', requireAuth, kolController.createKOL);

// 其他 KOL 路由需要 JWT 认证
router.use(requireAuth);

/**
 * POST /api/v1/kols/batch/import
 * 批量导入 KOL
 * 注意：这个路由必须在 /:id 之前定义，否则 'batch' 会被当作 ID
 */
router.post('/batch/import', kolController.batchImportKOLs);

/**
 * GET /api/v1/kols
 * 获取 KOL 列表（分页、搜索、筛选）
 */
router.get('/', kolController.getKOLList);

/**
 * GET /api/v1/kols/:id
 * 获取 KOL 详情
 */
router.get('/:id', kolController.getKOLById);

/**
 * GET /api/v1/kols/:id/history
 * 获取 KOL 修改历史
 */
router.get('/:id/history', kolController.getKOLHistory);

/**
 * PUT /api/v1/kols/:id
 * 更新 KOL 信息
 */
router.put('/:id', kolController.updateKOL);

/**
 * DELETE /api/v1/kols/:id
 * 删除 KOL
 */
router.delete('/:id', kolController.deleteKOL);

export default router;
