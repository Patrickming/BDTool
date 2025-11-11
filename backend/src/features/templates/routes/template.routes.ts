/**
 * 模板路由
 */

import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

// 所有模板路由都需要认证
router.use(requireAuth);

/**
 * POST /api/v1/templates
 * 创建模板
 */
router.post('/', templateController.createTemplate);

/**
 * POST /api/v1/templates/preview
 * 预览模板（变量替换）
 * 注意：这个路由必须在 /:id 之前定义，否则 'preview' 会被当作 ID
 */
router.post('/preview', templateController.previewTemplate);

/**
 * GET /api/v1/templates
 * 获取模板列表（分页、搜索、筛选）
 */
router.get('/', templateController.getTemplates);

/**
 * POST /api/v1/templates/:id/reorder
 * 调整模板顺序
 */
router.post('/:id/reorder', templateController.reorderTemplate);

/**
 * GET /api/v1/templates/:id
 * 获取模板详情
 */
router.get('/:id', templateController.getTemplateById);

/**
 * PUT /api/v1/templates/:id
 * 更新模板
 */
router.put('/:id', templateController.updateTemplate);

/**
 * DELETE /api/v1/templates/:id
 * 删除模板
 */
router.delete('/:id', templateController.deleteTemplate);

export default router;
