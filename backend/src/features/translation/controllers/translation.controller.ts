/**
 * 翻译控制器
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@common/utils/async-handler';
import { translationService } from '../translation.service';
import {
  TranslateRequestSchema,
  BatchTranslateRequestSchema,
  DetectLanguageRequestSchema,
} from '../dto/translate.dto';
import { logger } from '@config/logger.config';

/**
 * 翻译文本
 * POST /api/v1/translation/translate
 */
export const translate = asyncHandler(async (req: Request, res: Response) => {
  // 验证请求数据
  const validatedData = TranslateRequestSchema.parse(req.body);
  const { text, targetLanguage, sourceLanguage } = validatedData;

  logger.info(`用户 ${req.user?.id} 请求翻译: ${sourceLanguage || 'auto'} -> ${targetLanguage}`);

  // 检查服务是否可用
  if (!translationService.isAvailable()) {
    return res.status(503).json({
      success: false,
      message: '翻译服务当前不可用，请联系管理员配置',
    });
  }

  // 执行翻译
  const translatedText = await translationService.translate(
    text,
    targetLanguage,
    sourceLanguage
  );

  res.status(200).json({
    success: true,
    message: '翻译成功',
    data: {
      originalText: text,
      translatedText,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto',
    },
  });
});

/**
 * 批量翻译
 * POST /api/v1/translation/batch
 */
export const batchTranslate = asyncHandler(async (req: Request, res: Response) => {
  // 验证请求数据
  const validatedData = BatchTranslateRequestSchema.parse(req.body);
  const { texts, targetLanguage, sourceLanguage } = validatedData;

  logger.info(`用户 ${req.user?.id} 请求批量翻译: ${texts.length} 条文本`);

  // 检查服务是否可用
  if (!translationService.isAvailable()) {
    return res.status(503).json({
      success: false,
      message: '翻译服务当前不可用，请联系管理员配置',
    });
  }

  // 执行批量翻译
  const translatedTexts = await translationService.batchTranslate(
    texts,
    targetLanguage,
    sourceLanguage
  );

  res.status(200).json({
    success: true,
    message: '批量翻译成功',
    data: {
      count: texts.length,
      translations: texts.map((original, index) => ({
        original,
        translated: translatedTexts[index],
      })),
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto',
    },
  });
});

/**
 * 检测语言
 * POST /api/v1/translation/detect
 */
export const detectLanguage = asyncHandler(async (req: Request, res: Response) => {
  // 验证请求数据
  const validatedData = DetectLanguageRequestSchema.parse(req.body);
  const { text } = validatedData;

  logger.info(`用户 ${req.user?.id} 请求语言检测`);

  // 检查服务是否可用
  if (!translationService.isAvailable()) {
    return res.status(503).json({
      success: false,
      message: '翻译服务当前不可用，请联系管理员配置',
    });
  }

  // 执行语言检测
  const detection = await translationService.detectLanguage(text);

  res.status(200).json({
    success: true,
    message: '语言检测成功',
    data: {
      text,
      detectedLanguage: detection.language,
      confidence: detection.score,
    },
  });
});

/**
 * 检查翻译服务状态
 * GET /api/v1/translation/status
 */
export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const isAvailable = translationService.isAvailable();

  res.status(200).json({
    success: true,
    message: '翻译服务状态',
    data: {
      available: isAvailable,
      provider: 'DeepL API',
    },
  });
});
