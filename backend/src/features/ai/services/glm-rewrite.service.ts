/**
 * GLM-4 AI 改写服务
 * 使用智谱AI官方HTTP API进行文本改写
 */

import axios from 'axios';
import { env } from '../../../config/env.config';
import { logger } from '../../../config/logger.config';

export interface RewriteOptions {
  text: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  language?: 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'pt' | 'fr' | 'de' | 'ru';
  preserveVariables?: boolean;
  maxLength?: number;
  model?: 'glm-4.6' | 'glm-4.5' | 'glm-4.5-x' | 'glm-4-plus' | 'glm-4-air' | 'glm-4-airx' | 'glm-4.5-airx' | 'glm-4-flash';
}

export interface RewriteResult {
  original: string;
  rewritten: string;
  tone: string;
  language: string;
  model: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export class GLMRewriteService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    if (!env.GLM_API_KEY) {
      throw new Error('GLM_API_KEY 未配置');
    }

    this.apiKey = env.GLM_API_KEY;
    this.baseUrl = env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
    this.defaultModel = env.GLM_MODEL || 'glm-4.5-airx';

    logger.info(`GLM 改写服务已初始化，使用模型: ${this.defaultModel}`);
  }

  /**
   * 调用GLM API
   */
  private async callGLM(messages: any[], model: string): Promise<any> {
    const url = `${this.baseUrl}/chat/completions`;

    try {
      const response = await axios.post(
        url,
        {
          model,
          messages,
          temperature: 0.95,
          top_p: 0.95,
          max_tokens: 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60秒超时
          proxy: false, // 绕过系统代理，直接连接 GLM API
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('GLM API 调用失败:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * 改写文本
   */
  async rewriteText(options: RewriteOptions): Promise<RewriteResult> {
    const {
      text,
      tone = 'professional',
      language = 'en',
      preserveVariables = true,
      maxLength,
      model = this.defaultModel,
    } = options;

    logger.info(`AI 改写请求: 模型=${model}, 风格=${tone}, 语言=${language}`);

    // 构建提示词
    const systemPrompt = this.buildSystemPrompt(tone, language, preserveVariables);
    const userPrompt = this.buildUserPrompt(text, maxLength);

    try {
      const startTime = Date.now();

      const result = await this.callGLM(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model
      );

      const latency = Date.now() - startTime;

      // 提取改写结果
      const rewrittenText = (result.choices?.[0]?.message?.content || '').trim();

      // 检查是否为空
      if (!rewrittenText) {
        console.error('=== GLM API 返回空内容 DEBUG ===');
        console.error('完整响应:', JSON.stringify(result, null, 2));
        console.error('choices:', result.choices);
        console.error('message:', result.choices?.[0]?.message);
        console.error('content:', result.choices?.[0]?.message?.content);
        console.error('================================');

        logger.error('GLM API 返回空内容:', {
          model,
          usage: result.usage,
          finishReason: result.choices?.[0]?.finish_reason,
        });
        throw new Error('AI 改写返回空内容，请重试');
      }

      // 验证变量完整性
      if (preserveVariables) {
        const isValid = this.validateVariables(text, rewrittenText);
        if (!isValid) {
          logger.warn('AI 改写后变量不完整');
          throw new Error('AI 改写导致模板变量丢失，请重试');
        }
      }

      logger.info(
        `AI 改写成功: 模型=${model}, 延迟=${latency}ms, tokens=${result.usage.total_tokens}`
      );

      return {
        original: text,
        rewritten: rewrittenText,
        tone,
        language,
        model,
        tokensUsed: {
          prompt: result.usage.prompt_tokens,
          completion: result.usage.completion_tokens,
          total: result.usage.total_tokens,
        },
      };
    } catch (error: any) {
      logger.error('文本改写失败:', error);
      throw new Error(`AI 改写失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 批量改写多个文本
   */
  async batchRewrite(
    texts: string[],
    options: Omit<RewriteOptions, 'text'>
  ): Promise<RewriteResult[]> {
    logger.info(`批量 AI 改写: 数量=${texts.length}`);

    const promises = texts.map((text) =>
      this.rewriteText({
        ...options,
        text,
      })
    );

    return Promise.all(promises);
  }

  /**
   * 改写模板（带 KOL 上下文）
   */
  async rewriteTemplateWithContext(params: {
    template: string;
    kolContext?: {
      username: string;
      displayName: string;
      bio?: string;
      category?: string;
      language?: string;
    };
    tone?: string;
    model?: string;
  }): Promise<RewriteResult> {
    const { template, kolContext, tone = 'professional', model = this.defaultModel } = params;

    logger.info(`AI 改写模板: KOL=${kolContext?.username || 'N/A'}`);

    const systemPrompt = `你是一位专业的加密货币交易所商务拓展（BD）专家，擅长撰写 KOL 推广合作邀请。

你的任务：
1. 改写以下模板，使其更加个性化和吸引人
2. 根据 KOL 的背景信息调整语言风格
3. 保持专业、友好、简洁的语气
4. **必须原样保留所有 {{变量名}} 格式的内容**
5. 只返回改写后的文本，不要添加任何解释或额外内容`;

    let userPrompt = `请改写以下模板:\n\n${template}`;

    if (kolContext) {
      userPrompt = `KOL 信息:
- 用户名: @${kolContext.username}
- 显示名: ${kolContext.displayName}
- 简介: ${kolContext.bio || '暂无'}
- 分类: ${kolContext.category || '通用'}
- 语言: ${kolContext.language || '英语'}

请根据 KOL 的背景信息改写以下模板:

${template}`;
    }

    try {
      const result = await this.callGLM(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model
      );

      const rewrittenText = (result.choices?.[0]?.message?.content || '').trim();

      // 验证变量
      const isValid = this.validateVariables(template, rewrittenText);
      if (!isValid) {
        logger.warn('模板变量验证失败');
        throw new Error('AI 改写导致模板变量丢失');
      }

      logger.info(`模板改写成功: tokens=${result.usage.total_tokens}`);

      return {
        original: template,
        rewritten: rewrittenText,
        tone,
        language: kolContext?.language || 'en',
        model,
        tokensUsed: {
          prompt: result.usage.prompt_tokens,
          completion: result.usage.completion_tokens,
          total: result.usage.total_tokens,
        },
      };
    } catch (error: any) {
      logger.error('模板改写失败:', error);
      throw new Error(`模板改写失败: ${error.message}`);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    model: string;
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      await this.callGLM([{ role: 'user', content: 'Hello' }], this.defaultModel);

      const latency = Date.now() - startTime;

      logger.info(`GLM 服务健康检查成功: latency=${latency}ms`);

      return {
        healthy: true,
        model: this.defaultModel,
        latency,
      };
    } catch (error: any) {
      logger.error('GLM 服务健康检查失败:', error);

      return {
        healthy: false,
        model: this.defaultModel,
        latency: -1,
        error: error.message,
      };
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(tone: string, language: string, preserveVariables: boolean): string {
    const languageMap: Record<string, string> = {
      en: 'English',
      zh: 'Chinese (简体中文)',
      ja: 'Japanese (日本語)',
      ko: 'Korean (한국어)',
      es: 'Spanish (Español)',
      pt: 'Portuguese (Português)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      ru: 'Russian (Русский)',
    };

    const toneMap: Record<string, string> = {
      professional: 'professional and business-like (专业商务)',
      casual: 'casual and friendly (轻松友好)',
      friendly: 'warm and approachable (温暖亲切)',
      formal: 'formal and respectful (正式礼貌)',
    };

    const targetLanguage = languageMap[language] || 'English';
    const targetTone = toneMap[tone] || 'professional';

    let prompt = `You are a text rewriting assistant for social media and direct messages in the crypto industry.

Your task is to rewrite text while:
1. Maintaining the original meaning and intent
2. Using a ${targetTone} tone
3. Writing in ${targetLanguage}
4. Making it natural and conversational
5. Varying sentence structure and word choices for uniqueness

IMPORTANT RULES:
- DO NOT add greetings like "Dear", "Hi", "Hello" unless they exist in the original
- DO NOT add closings like "Best regards", "Sincerely", "Thanks" unless they exist in the original
- DO NOT add any letter/email formatting
- Keep the same structure as the original (if it's a direct message, keep it as a direct message)
- Change wording and phrasing creatively while keeping the same meaning`;

    if (preserveVariables) {
      prompt += `
- **CRITICAL: Preserve all template variables in the format {{variable_name}} exactly as they appear**
- Do NOT translate, modify, or remove variables like {{username}}, {{display_name}}, {{exchange_name}}, etc.
- Variables must remain identical in the output`;
    }

    prompt += `\n\nReturn ONLY the rewritten text. Do not add any explanations, comments, greetings, or closings that weren't in the original.`;

    return prompt;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(text: string, maxLength?: number): string {
    let prompt = `Text to rewrite:\n\n${text}`;

    if (maxLength) {
      prompt += `\n\n(Keep it under ${maxLength} characters)`;
    }

    return prompt;
  }

  /**
   * 验证模板变量完整性
   */
  private validateVariables(original: string, rewritten: string): boolean {
    // 提取原文本中的所有变量
    const variablePattern = /\{\{[^}]+\}\}/g;
    const originalVariables = original.match(variablePattern) || [];
    const rewrittenVariables = rewritten.match(variablePattern) || [];

    // 检查数量是否相同
    if (originalVariables.length !== rewrittenVariables.length) {
      logger.warn(
        `变量数量不匹配: 原始=${originalVariables.length}, 改写后=${rewrittenVariables.length}`
      );
      return false;
    }

    // 检查每个变量是否都存在
    const originalSet = new Set(originalVariables);
    const rewrittenSet = new Set(rewrittenVariables);

    for (const variable of originalSet) {
      if (!rewrittenSet.has(variable)) {
        logger.warn(`变量丢失: ${variable}`);
        return false;
      }
    }

    return true;
  }
}

// 单例导出
export const glmRewriteService = new GLMRewriteService();
