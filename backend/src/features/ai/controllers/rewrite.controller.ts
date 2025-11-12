/**
 * AI 改写控制器
 * 处理所有 AI 文本改写相关的 API 请求
 */

import { Request, Response } from 'express';
import { glmRewriteService } from '../services/glm-rewrite.service';
import {
  RewriteTextRequestSchema,
  BatchRewriteRequestSchema,
  RewriteTemplateRequestSchema,
} from '../dto/rewrite.dto';
import { logger } from '../../../config/logger.config';

export class RewriteController {
  /**
   * POST /api/v1/ai/rewrite
   * 改写单个文本
   */
  async rewriteText(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求
      const validated = RewriteTextRequestSchema.parse(req.body);

      // 调用服务
      const result = await glmRewriteService.rewriteText({
        text: validated.text,
        tone: validated.tone,
        language: validated.language,
        preserveVariables: validated.preserveVariables,
        maxLength: validated.maxLength,
        model: validated.model,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('文本改写失败:', error);

      // Zod 验证错误
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: error.errors,
        });
        return;
      }

      // 业务逻辑错误
      res.status(500).json({
        success: false,
        error: error.message || 'AI 改写失败',
      });
    }
  }

  /**
   * POST /api/v1/ai/rewrite/batch
   * 批量改写多个文本
   */
  async batchRewrite(req: Request, res: Response): Promise<void> {
    try {
      const validated = BatchRewriteRequestSchema.parse(req.body);

      const results = await glmRewriteService.batchRewrite(validated.texts, {
        tone: validated.tone,
        language: validated.language,
        preserveVariables: validated.preserveVariables,
        model: validated.model,
      });

      // 计算总 tokens
      const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed.total, 0);

      res.status(200).json({
        success: true,
        data: {
          results,
          totalTokens,
        },
      });
    } catch (error: any) {
      logger.error('批量改写失败:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message || '批量改写失败',
      });
    }
  }

  /**
   * POST /api/v1/ai/rewrite/template
   * 改写模板（带 KOL 上下文）
   */
  async rewriteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const validated = RewriteTemplateRequestSchema.parse(req.body);

      const result = await glmRewriteService.rewriteTemplateWithContext({
        template: validated.template,
        kolContext: validated.kolContext,
        tone: validated.tone,
        model: validated.model,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('模板改写失败:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message || '模板改写失败',
      });
    }
  }

  /**
   * GET /api/v1/ai/health
   * GLM 服务健康检查
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await glmRewriteService.healthCheck();

      res.status(health.healthy ? 200 : 503).json({
        success: health.healthy,
        data: health,
      });
    } catch (error: any) {
      logger.error('健康检查失败:', error);

      res.status(503).json({
        success: false,
        data: {
          healthy: false,
          model: 'unknown',
          latency: -1,
          error: error.message,
        },
      });
    }
  }
}

// 导出控制器实例
export const rewriteController = new RewriteController();
