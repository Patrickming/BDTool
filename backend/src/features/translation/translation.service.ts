/**
 * 翻译服务
 * 使用 DeepL API
 */

import * as deepl from 'deepl-node';
import { logger } from '@config/logger.config';

/**
 * 翻译服务类
 */
class TranslationService {
  private translator: deepl.Translator | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPL_API_KEY || '';

    if (this.apiKey) {
      this.initializeClient();
    } else {
      logger.warn('DeepL API 密钥未配置，翻译功能将不可用');
    }
  }

  /**
   * 初始化 DeepL 客户端
   */
  private initializeClient() {
    try {
      this.translator = new deepl.Translator(this.apiKey);
      logger.info('DeepL 客户端初始化成功');
    } catch (error) {
      logger.error('DeepL 客户端初始化失败:', error);
      throw error;
    }
  }

  /**
   * 将系统语言代码转换为 DeepL 语言代码
   * DeepL 使用特定的语言代码格式
   */
  private convertToDeepLLanguageCode(code: string, isTarget: boolean = false): string {
    const mapping: Record<string, string> = {
      'en': isTarget ? 'en-US' : 'en', // 目标语言需要指定变体
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'ru': 'ru',
      'pt': isTarget ? 'pt-PT' : 'pt', // 葡萄牙语，默认欧洲葡萄牙语
    };
    return mapping[code] || code;
  }

  /**
   * 将 DeepL 语言代码转换回系统语言代码
   */
  private convertFromDeepLLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      'en': 'en',
      'en-US': 'en',
      'en-GB': 'en',
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'ru': 'ru',
      'pt': 'pt',
      'pt-PT': 'pt',
      'pt-BR': 'pt',
    };
    return mapping[code] || code;
  }

  /**
   * 翻译文本
   * @param text 要翻译的文本
   * @param targetLanguage 目标语言代码（如 'en', 'zh'）
   * @param sourceLanguage 源语言代码（可选，不提供则自动检测）
   * @returns 翻译后的文本
   */
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> {
    if (!this.translator) {
      throw new Error('翻译服务未配置，请联系管理员配置 DeepL API 密钥');
    }

    if (!text || text.trim() === '') {
      return text;
    }

    try {
      logger.info(`开始翻译: ${sourceLanguage || 'auto'} -> ${targetLanguage}, 文本长度: ${text.length}`);

      // 转换语言代码为 DeepL 格式
      const targetLang = this.convertToDeepLLanguageCode(targetLanguage, true);
      const sourceLang = sourceLanguage ? this.convertToDeepLLanguageCode(sourceLanguage) : null;

      // 调用 DeepL API
      const result = await this.translator.translateText(
        text,
        sourceLang,
        targetLang as deepl.TargetLanguageCode
      );

      const translatedText = result.text;

      logger.info(`翻译成功: 源文本长度 ${text.length} -> 译文长度 ${translatedText.length}`);
      logger.info(`检测到的源语言: ${result.detectedSourceLang}`);

      return translatedText;
    } catch (error: any) {
      logger.error('翻译失败:', error);

      // 处理 DeepL 特定错误
      if (error.message?.includes('Quota exceeded')) {
        throw new Error('DeepL 翻译额度已用完，请检查您的账户配额');
      } else if (error.message?.includes('Authorization failed')) {
        throw new Error('DeepL API 密钥无效，请检查配置');
      }

      throw new Error(`翻译失败: ${error.message}`);
    }
  }

  /**
   * 检测文本语言
   * @param text 要检测的文本
   * @returns 语言代码和置信度
   */
  async detectLanguage(text: string): Promise<{ language: string; score: number }> {
    if (!this.translator) {
      throw new Error('翻译服务未配置');
    }

    if (!text || text.trim() === '') {
      throw new Error('文本不能为空');
    }

    try {
      logger.info(`开始检测语言: 文本长度 ${text.length}`);

      // DeepL 没有专门的语言检测 API，我们通过翻译到英语来检测源语言
      const result = await this.translator.translateText(
        text,
        null, // 自动检测源语言
        'en-US'
      );

      const detectedLang = this.convertFromDeepLLanguageCode(result.detectedSourceLang);

      logger.info(`语言检测成功: ${detectedLang}`);

      return {
        language: detectedLang,
        score: 1.0, // DeepL 不提供置信度分数，使用 1.0
      };
    } catch (error: any) {
      logger.error('语言检测失败:', error);
      throw new Error(`语言检测失败: ${error.message}`);
    }
  }

  /**
   * 批量翻译
   * @param texts 要翻译的文本数组
   * @param targetLanguage 目标语言
   * @param sourceLanguage 源语言（可选）
   * @returns 翻译后的文本数组
   */
  async batchTranslate(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    if (!this.translator) {
      throw new Error('翻译服务未配置');
    }

    if (texts.length === 0) {
      return [];
    }

    try {
      logger.info(`开始批量翻译: ${texts.length} 条文本`);

      // 转换语言代码
      const targetLang = this.convertToDeepLLanguageCode(targetLanguage, true);
      const sourceLang = sourceLanguage ? this.convertToDeepLLanguageCode(sourceLanguage) : null;

      // DeepL 支持批量翻译
      const results = await this.translator.translateText(
        texts,
        sourceLang,
        targetLang as deepl.TargetLanguageCode
      );

      // 处理结果（可能是单个对象或数组）
      const translatedTexts = Array.isArray(results)
        ? results.map(r => r.text)
        : [results.text];

      logger.info(`批量翻译成功: ${translatedTexts.length} 条文本`);

      return translatedTexts;
    } catch (error: any) {
      logger.error('批量翻译失败:', error);
      throw new Error(`批量翻译失败: ${error.message}`);
    }
  }

  /**
   * 检查翻译服务是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean {
    return this.translator !== null;
  }

  /**
   * 获取账户使用情况（DeepL 特有功能）
   */
  async getUsage(): Promise<{ character_count: number; character_limit: number }> {
    if (!this.translator) {
      throw new Error('翻译服务未配置');
    }

    try {
      const usage = await this.translator.getUsage();

      logger.info(`DeepL 用量: ${usage.character?.count || 0} / ${usage.character?.limit || 0}`);

      return {
        character_count: usage.character?.count || 0,
        character_limit: usage.character?.limit || 0,
      };
    } catch (error: any) {
      logger.error('获取用量失败:', error);
      throw new Error(`获取用量失败: ${error.message}`);
    }
  }
}

// 导出单例
export const translationService = new TranslationService();
